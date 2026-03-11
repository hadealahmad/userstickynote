<template>
  <div class="flex items-center justify-center h-full z-[99999] sticky-note-widget group" @click.stop.prevent>
    <Popover :open="isOpen" @update:open="isOpen = $event">
      <PopoverTrigger as-child>
        <button
          class="transition-colors flex items-center justify-center outline-none ring-0 cursor-pointer"
          :class="{
            'p-[6px] rounded-full hover:bg-zinc-800 border-none bg-transparent': !isProfile,
            'text-zinc-400 hover:text-yellow-500': !isProfile && !hasNotes,
            'text-yellow-500': !isProfile && hasNotes,
            'w-[36px] h-[36px] rounded-full border border-[rgb(83,100,113)] hover:bg-[rgba(239,243,244,0.1)] text-zinc-100': isProfile && !hasNotes,
            'w-[36px] h-[36px] rounded-full border border-yellow-500 hover:bg-[rgba(239,243,244,0.1)] text-yellow-500': isProfile && hasNotes,
          }"
          :title="hasNotes ? 'View Notes' : 'Add Note'"
        >
          <StickyNoteIcon :size="!isProfile ? 16 : 20" :class="{ 'fill-yellow-500 text-yellow-500': hasNotes, 'text-zinc-400/50': !hasNotes && !isProfile, 'text-[rgb(239,243,244)]': !hasNotes && isProfile }" />
        </button>
      </PopoverTrigger>
      <!-- We explicitly use tailwind scoping to avoid Twitter styles overriding it -->
      <PopoverContent class="w-80 p-4 border shadow-xl bg-background text-foreground max-h-[80vh] overflow-y-auto" style="z-index: 999999;">
        <div class="space-y-4">
          <div class="flex items-center space-x-2 border-b pb-2">
            <h4 class="font-bold leading-none text-base font-sans">Notes for @{{ username }}</h4>
          </div>

          <!-- Existing Notes -->
          <div v-if="notes.length > 0" class="space-y-3">
            <div v-for="note in notes" :key="note.id" class="p-3 bg-zinc-900 border border-zinc-800 rounded-lg relative group/note shadow-sm">
              <!-- Edit mode -->
              <div v-if="editingNoteId === note.id" class="space-y-2">
                <Textarea 
                  v-model="editDraft" 
                  class="resize-none min-h-[60px] text-sm font-sans"
                />
                <div class="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" class="text-xs h-7" @click="cancelEdit">Cancel</Button>
                  <Button size="sm" class="text-xs h-7" @click="saveEdit">Save</Button>
                </div>
              </div>
              
              <!-- View mode -->
              <div v-else>
                <div class="flex justify-between items-start mb-1">
                  <a v-if="note.sourceUrl" :href="note.sourceUrl" target="_blank" class="text-[10px] text-blue-400 hover:underline inline-block break-all max-w-[80%] line-clamp-1" title="Go to source">View Source</a>
                  <span v-else class="text-[10px] text-zinc-500">Manual Note</span>
                  
                  <!-- Actions -->
                  <div class="opacity-0 group-hover/note:opacity-100 transition-opacity flex space-x-2">
                     <button @click="startEdit(note)" class="text-zinc-400 hover:text-zinc-200" title="Edit note"><PencilIcon class="w-3 h-3"/></button>
                     <button @click="deleteNote(note.id)" class="text-zinc-400 hover:text-red-500" title="Delete note"><TrashIcon class="w-3 h-3"/></button>
                  </div>
                </div>
                <p class="text-sm whitespace-pre-wrap text-zinc-100 mt-2 font-sans" style="word-break: break-word;">{{ note.text }}</p>
                <div class="text-[10px] text-zinc-500 mt-3 text-right">
                  {{ new Date(note.updatedAt).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <!-- New Note Form -->
          <div class="space-y-2 pt-2 border-t mt-2">
            <div class="text-xs font-semibold text-zinc-400">Add New Note</div>
            <Textarea 
              v-model="newDraft" 
              placeholder="Write a note..." 
              class="resize-none h-20 text-sm font-sans"
            />
            <div class="flex justify-end">
              <Button size="sm" class="text-xs h-8" @click="addNote">Save Note</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { StickyNote as StickyNoteIcon, Trash as TrashIcon, Pencil as PencilIcon } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover/index'
import { Button } from './ui/button/index'
import { Textarea } from './ui/textarea/index'
import { StorageService, type StickyNote } from '../lib/storage'

const props = defineProps<{ username: string, sourceUrl: string, isProfile?: boolean }>()

const isOpen = ref(false)
const notes = ref<StickyNote[]>([])
const newDraft = ref('')
const syncInterval = ref<any>(null)

const editingNoteId = ref<string | null>(null)
const editDraft = ref('')

const hasNotes = computed(() => notes.value.length > 0)

async function loadNotes() {
  try {
    const allUserNotes = await StorageService.getNotes(props.username, 'twitter')
    // Sort oldest to newest (or newest first), let's sort newest top
    notes.value = allUserNotes.sort((a,b) => b.updatedAt - a.updatedAt)
  } catch (err) {
    console.debug('Twitter Sticky Notes: Context invalidated or storage error. Please refresh the page.', err)
    if (syncInterval.value) clearInterval(syncInterval.value)
  }
}

onMounted(() => {
  loadNotes()
})

// Interval to keep synced
onMounted(() => {
  syncInterval.value = setInterval(() => {
    if (!isOpen.value) loadNotes()
  }, 3000)
})

onUnmounted(() => {
  if (syncInterval.value) clearInterval(syncInterval.value)
})

watch(isOpen, (newVal) => {
  if (newVal) {
    newDraft.value = ''
    editingNoteId.value = null
  } else {
    loadNotes()
  }
})

async function addNote() {
  const newText = newDraft.value.trim()
  if (!newText) return
  
  const noteToSave: StickyNote = {
    id: crypto.randomUUID(),
    username: props.username,
    platform: 'twitter' as const,
    text: newText,
    sourceUrl: props.sourceUrl, // Capture context (Tweet URL or Profile)
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  await StorageService.saveNote(noteToSave)
  newDraft.value = ''
  await loadNotes()
}

function startEdit(note: StickyNote) {
  editingNoteId.value = note.id
  editDraft.value = note.text
}

function cancelEdit() {
  editingNoteId.value = null
  editDraft.value = ''
}

async function saveEdit() {
  const newText = editDraft.value.trim()
  if (!newText || !editingNoteId.value) return

  const noteToEdit = notes.value.find(n => n.id === editingNoteId.value)
  if (!noteToEdit) return
  
  noteToEdit.text = newText
  await StorageService.saveNote(noteToEdit)
  
  editingNoteId.value = null
  await loadNotes()
}

async function deleteNote(id: string) {
  if (!confirm('Delete this note?')) return
  await StorageService.deleteNote(id)
  await loadNotes()
}
</script>

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
      <PopoverContent class="w-80 p-0 border border-border shadow-2xl bg-background rounded-2xl overflow-hidden" style="z-index: 999999;">
        <div class="flex flex-col max-h-[80vh]">
          <div class="p-4 border-b bg-muted/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <StickyNoteIcon class="w-4 h-4 text-yellow-500" />
              <h4 class="font-bold text-sm tracking-tight font-sans">Notes for @{{ username }}</h4>
            </div>
            <Badge variant="outline" class="text-[9px] px-1.5 py-0 uppercase tracking-widest">{{ notes.length }}</Badge>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">

          <!-- Existing Notes -->
          <div v-if="notes.length > 0" class="space-y-2">
            <div v-for="note in notes" :key="note.id" class="p-3 bg-accent/20 border rounded-xl relative group/note transition-colors hover:border-primary/50">
              <!-- Edit mode -->
              <div v-if="editingNoteId === note.id" class="space-y-2">
                <Textarea 
                  v-model="editDraft" 
                  class="resize-none min-h-[60px] text-xs font-sans rounded-lg"
                />
                <div class="flex justify-end space-x-2">
                  <Button variant="outline" size="xs" class="text-[10px] h-6 px-2" @click="cancelEdit">Cancel</Button>
                  <Button size="xs" class="text-[10px] h-6 px-2" @click="saveEdit">Save</Button>
                </div>
              </div>
              
              <!-- View mode -->
              <div v-else>
                <div class="flex justify-between items-start mb-1 gap-2">
                  <div class="flex-1 min-w-0">
                    <a v-if="note.sourceUrl" :href="note.sourceUrl" target="_blank" class="text-[9px] text-blue-500/70 hover:text-blue-500 hover:underline flex items-center gap-1 transition-colors" title="Go to source">
                      <LinkIcon class="w-2.5 h-2.5" /> Source
                    </a>
                    <span v-else class="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">Manual</span>
                  </div>
                  
                  <!-- Actions -->
                  <div class="opacity-0 group-hover/note:opacity-100 transition-opacity flex gap-1.5 shrink-0">
                     <button @click="startEdit(note)" class="text-muted-foreground hover:text-foreground" title="Edit note"><PencilIcon class="w-3 h-3"/></button>
                     <button @click="deleteNote(note.id)" class="text-muted-foreground hover:text-red-500" title="Delete note"><TrashIcon class="w-3 h-3"/></button>
                  </div>
                </div>
                <p class="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans" style="word-break: break-word;">{{ note.text }}</p>
                <div class="text-[8px] text-muted-foreground mt-2 flex justify-end font-bold uppercase tracking-widest">
                  {{ new Date(note.updatedAt).toLocaleDateString() }}
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
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { StickyNote as StickyNoteIcon, Trash as TrashIcon, Pencil as PencilIcon, Link as LinkIcon } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover/index'
import { Button } from './ui/button/index'
import { Textarea } from './ui/textarea/index'
import { Badge } from './ui/badge/index'
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
    // getNotes filters deletedAt. We just sort.
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
    // Trigger sync when opened to catch deletions/changes from dashboard
    StorageService.getSettings().then(s => {
      if (s.syncMode === 'cloud' && s.apiToken) {
        StorageService.syncWithCloud().then(() => loadNotes())
      }
    })
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

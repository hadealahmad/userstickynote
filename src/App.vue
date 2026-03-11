<template>
  <div class="w-[450px] h-[600px] bg-background text-foreground p-4 flex flex-col overflow-hidden font-sans border border-border">
    <div class="flex items-center justify-between mb-4 pb-2 border-b">
      <h1 class="text-lg font-bold flex items-center gap-2">
        <StickyNoteIcon class="w-5 h-5 text-yellow-500" />
        All Saved Notes
      </h1>
      <span class="text-xs text-muted-foreground">{{ notes.length }} notes</span>
    </div>

    <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
      <div v-if="notes.length === 0" class="text-center text-muted-foreground mt-10">
        No sticky notes yet. <br/> Go to Twitter and attach a note to a username!
      </div>
      
      <Card v-for="note in notes" :key="note.id" class="relative group shadow-sm bg-zinc-900 border-zinc-800">
        <CardHeader class="p-3 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-semibold flex items-center gap-1">
            <span class="text-blue-400">@{{ note.username }}</span>
          </CardTitle>
          <button @click="deleteNote(note.id)" class="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
            <TrashIcon class="w-4 h-4" />
          </button>
        </CardHeader>
        <CardContent class="p-3 pt-1">
          <p class="text-sm whitespace-pre-wrap text-zinc-100" style="word-break: break-word;">{{ note.text }}</p>
        </CardContent>
        <CardFooter class="p-3 pt-0 flex items-center justify-between text-[10px] text-zinc-500 mt-2">
           <a v-if="note.sourceUrl" :href="note.sourceUrl" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline max-w-[60%] line-clamp-1" title="Go to Source">Source Link</a>
           <span v-else>Manual Note</span>
           <span>{{ new Date(note.updatedAt).toLocaleDateString() }} {{ new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { StickyNote as StickyNoteIcon, Trash as TrashIcon } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card/index'
import { StorageService, type StickyNote } from './lib/storage'

const notes = ref<StickyNote[]>([])

async function loadNotes() {
  notes.value = await StorageService.getAllNotes()
  // Sort by newest updated
  notes.value.sort((a, b) => b.updatedAt - a.updatedAt)
}

onMounted(() => {
  loadNotes()
})

async function deleteNote(id: string) {
  if (!confirm('Are you sure you want to delete this note?')) return
  await StorageService.deleteNote(id)
  await loadNotes()
}
</script>

<style>
/* Global styles */
:root {
  color-scheme: dark;
}
html, body {
  margin: 0;
  width: 450px;
  height: 600px;
  background-color: var(--background, #09090b);
}
#app {
  width: 100%;
  height: 100%;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border));
  border-radius: 20px;
}
</style>

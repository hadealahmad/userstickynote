<template>
  <div class="w-[450px] h-[600px] bg-background text-foreground p-4 flex flex-col overflow-hidden font-sans border border-border">
    <!-- Navigation Tabs -->
    <div class="flex items-center justify-between mb-4 pb-2 border-b">
      <div class="flex gap-4">
        <button 
          @click="view = 'notes'" 
          class="text-sm font-bold flex items-center gap-2 transition-colors"
          :class="view === 'notes' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
        >
          <StickyNoteIcon class="w-4 h-4 text-blue-500" />
          My Notes
        </button>
        <button 
          @click="view = 'settings'" 
          class="text-sm font-bold flex items-center gap-2 transition-colors"
          :class="view === 'settings' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
        >
          <SettingsIcon class="w-4 h-4" />
          {{ settings.isSubscribed ? 'Sync Settings' : 'Enable Sync' }}
        </button>
      </div>
      <span class="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{{ notes.length }} notes</span>
    </div>

    <!-- Notes View -->
    <div v-if="view === 'notes'" class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
      <div v-if="notes.length === 0" class="text-center text-muted-foreground mt-10 p-10 border border-dashed rounded-xl">
        <StickyNoteIcon class="w-10 h-10 mx-auto mb-4 opacity-20" />
        No sticky notes yet. <br/> Go to Twitter and attach a note!
      </div>
      
      <Card v-for="note in notes" :key="note.id" class="relative group shadow-sm bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden">
        <CardHeader class="p-4 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-bold flex items-center gap-1">
            <span class="text-blue-400">@{{ note.username }}</span>
          </CardTitle>
          <button @click="deleteNote(note.id)" class="text-muted-foreground hover:text-red-500 transition-colors">
            <TrashIcon class="w-4 h-4" />
          </button>
        </CardHeader>
        <CardContent class="p-4 pt-1">
          <p class="text-sm whitespace-pre-wrap text-zinc-100" style="word-break: break-word;">{{ note.text }}</p>
        </CardContent>
        <CardFooter class="p-4 pt-0 flex items-center justify-between text-[10px] text-zinc-500 mt-2">
           <a v-if="note.sourceUrl" :href="note.sourceUrl" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline max-w-[60%] line-clamp-1" title="Go to Source">Source Link</a>
           <span v-else>Manual entry</span>
           <span>{{ new Date(note.updatedAt).toLocaleDateString() }}</span>
        </CardFooter>
      </Card>
    </div>

    <!-- Settings View -->
    <div v-else class="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-200">
      <div class="space-y-4">
        <h3 class="text-sm font-bold font-outfit uppercase tracking-wider text-zinc-500">Cloud Configuration</h3>
        
        <!-- Non-Subscribed View -->
        <div v-if="!settings.isSubscribed" class="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-center space-y-4">
           <CloudIcon class="w-12 h-12 text-blue-500 mx-auto opacity-50" />
           <div class="space-y-1">
             <h4 class="font-bold">Sync across devices</h4>
             <p class="text-[11px] text-zinc-400">Save notes to the cloud and access them everywhere for $3/year.</p>
           </div>
           <button @click="StorageService.loginWithGoogle()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex items-center justify-center gap-2">
             <CreditCard class="w-4 h-4" />
             Upgrade to Premium
           </button>
        </div>

        <!-- Subscribed View -->
        <div v-else class="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
               <CheckCircle class="w-5 h-5 text-green-500" />
               <label class="text-sm font-bold">Cloud Sync Active</label>
            </div>
            <select v-model="settings.syncMode" @change="saveSettings" class="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs">
              <option value="local">Paused</option>
              <option value="cloud">Enabled</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">API Sync Token</label>
            <div class="relative">
              <input 
                v-model="settings.apiToken" 
                type="password" 
                placeholder="Paste token from dashboard..." 
                class="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50"
              />
              <KeyIcon class="absolute right-3 top-2.5 w-4 h-4 text-zinc-600" />
            </div>
            <p class="text-[10px] text-zinc-500">Manage tokens on the <a @click="StorageService.loginWithGoogle()" class="text-blue-500 hover:underline cursor-pointer">web dashboard</a>.</p>
          </div>

          <div class="flex gap-2">
            <Button @click="saveSettings" size="sm" class="flex-1 bg-zinc-100 text-black hover:bg-white font-bold rounded-2xl">
              Update
            </Button>
            <Button @click="triggerSync" :disabled="isSyncing || !settings.apiToken" size="sm" variant="outline" class="flex-1 font-bold rounded-2xl border-zinc-800">
              <RefreshCwIcon class="w-3 h-3 mr-2" :class="{ 'animate-spin': isSyncing }" />
              Sync Now
            </Button>
          </div>
        </div>
      </div>

      <div class="mt-auto p-4 bg-zinc-900/50 border border-white/5 rounded-3xl flex justify-between items-center">
         <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="settings.apiToken ? 'bg-green-500' : 'bg-zinc-600'"></div>
            <span class="text-[10px] text-zinc-500 uppercase font-bold">{{ settings.apiToken ? 'Connected' : 'Offline' }}</span>
         </div>
         <button @click="StorageService.loginWithGoogle()" class="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-bold">
            Manage Account <ArrowUpRight class="w-3 h-3" />
         </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { StickyNote as StickyNoteIcon, Trash as TrashIcon, Settings as SettingsIcon, Key as KeyIcon, RefreshCw as RefreshCwIcon, Cloud as CloudIcon, CheckCircle, CreditCard, ArrowUpRight } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card/index'
import { Button } from './components/ui/button/index'
import { StorageService, type StickyNote, type Settings } from './lib/storage'

const view = ref<'notes' | 'settings'>('notes')
const notes = ref<StickyNote[]>([])
const isSyncing = ref(false)

const settings = reactive<Settings>({
  apiToken: '',
  syncMode: 'local',
  apiUrl: 'https://twitter-sticky-notes.cranl.app',
  isSubscribed: false
})

async function loadData() {
  notes.value = await StorageService.getAllNotes()
  notes.value.sort((a, b) => b.updatedAt - a.updatedAt)
  
  const savedSettings = await StorageService.getSettings()
  Object.assign(settings, savedSettings)

  // Auto check subscription if token exists
  if (settings.apiToken) {
    await StorageService.checkSubscription()
    const updatedSettings = await StorageService.getSettings()
    settings.isSubscribed = updatedSettings.isSubscribed
  }
}

onMounted(() => {
  loadData()
})

async function saveSettings() {
  await StorageService.saveSettings({ ...settings })
  if (settings.apiToken) {
     await StorageService.checkSubscription()
  }
}

async function triggerSync() {
  if (isSyncing.value) return
  isSyncing.value = true
  try {
    await StorageService.syncWithCloud()
    await loadData()
  } finally {
    isSyncing.value = false
  }
}

async function deleteNote(id: string) {
  if (!confirm('Are you sure you want to delete this note?')) return
  await StorageService.deleteNote(id)
  await loadData()
}
</script>

<style>
:root { color-scheme: dark; }
.font-outfit { font-family: 'Outfit', sans-serif; }
html, body {
  margin: 0;
  width: 450px;
  height: 600px;
  background-color: #09090b;
}
#app { width: 100%; height: 100%; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #27272a;
  border-radius: 20px;
}
</style>

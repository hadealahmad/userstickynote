<template>
  <div class="w-[450px] h-[600px] bg-background text-foreground p-4 flex flex-col overflow-hidden font-sans border border-border">
    <!-- Navigation Tabs -->
    <div class="flex items-center justify-between mb-4 pb-2 border-b">
      <div class="flex items-center gap-2">
        <StickyNoteIcon class="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
        <h1 class="text-sm font-bold font-outfit tracking-tight">Username Sticky Notes</h1>
      </div>
      <div class="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon"
          @click="view = 'notes'" 
          :class="view === 'notes' ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground'"
          title="My Notes"
        >
          <StickyNoteIcon class="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          @click="view = 'settings'" 
          :class="view === 'settings' ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground'"
          title="Settings"
        >
          <SettingsIcon class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Search Bar (only in notes view) -->
    <div v-if="view === 'notes'" class="mb-4 relative">
      <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input 
        v-model="searchQuery" 
        placeholder="Search notes..." 
        class="h-9 pl-9 pr-3 text-xs bg-zinc-900 border-zinc-800 rounded-xl"
      />
    </div>

    <!-- Notes View -->
    <div v-if="view === 'notes'" class="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
      <div v-if="filteredNotes.length === 0" class="text-center text-muted-foreground mt-10 p-10 border border-dashed rounded-xl">
        <div v-if="searchQuery" class="space-y-2">
            <Search class="w-10 h-10 mx-auto opacity-10" />
            <p>No matches for "{{ searchQuery }}"</p>
        </div>
        <div v-else class="space-y-2">
            <StickyNoteIcon class="w-10 h-10 mx-auto opacity-10" />
            <p>No sticky notes found.<br/>Go to Twitter and attach a note!</p>
        </div>
      </div>
      
      <Card v-for="note in filteredNotes" :key="note.id" class="relative group shadow-sm bg-zinc-900/50 border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-200">
        <CardContent class="p-3 pb-2">
          <div class="flex justify-between items-start gap-2 mb-1">
            <Badge variant="secondary" class="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[9px] px-1.5 py-0 border-none rounded-md">
              @{{ note.username }}
            </Badge>
            <button @click="deleteNote(note.id)" class="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
              <TrashIcon class="w-3.5 h-3.5" />
            </button>
          </div>
          <p class="text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap" style="word-break: break-word;">{{ note.text }}</p>
        </CardContent>
        <CardFooter class="px-3 py-2 pt-0 flex items-center justify-between text-[9px] text-zinc-500 bg-zinc-950/20">
           <a v-if="note.sourceUrl" :href="note.sourceUrl" target="_blank" class="text-blue-500/70 hover:text-blue-400 flex items-center gap-1 transition-colors" title="Go to Source">
             <LinkIcon class="w-2.5 h-2.5" /> Source
           </a>
           <span v-else>Manual</span>
           <span>{{ new Date(note.updatedAt).toLocaleDateString() }}</span>
        </CardFooter>
      </Card>
    </div>

    <!-- Settings View -->
    <div v-else class="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-200">
      <div class="space-y-4">
        <h3 class="text-sm font-bold font-outfit uppercase tracking-wider text-zinc-500">Cloud Configuration</h3>
        
        <!-- Non-Subscribed View -->
        <div v-if="!settings.isSubscribed && !settings.isAdmin" class="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-center space-y-4">
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
          
          <div v-if="!settings.apiToken" class="p-4 bg-blue-600/5 border border-dashed border-blue-500/30 rounded-2xl space-y-3">
            <p class="text-[11px] text-zinc-400 text-center">Your account is ready. Click below to link this device.</p>
            <Button @click="handleAutoConnect()" :disabled="isConnecting" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">
              <LinkIcon v-if="!isConnecting" class="w-4 h-4 mr-2" />
              <RefreshCwIcon v-else class="w-4 h-4 mr-2 animate-spin" />
              Connect Device
            </Button>
            <p v-if="connectionError" class="text-[10px] text-red-500 text-center font-bold">{{ connectionError }}</p>
          </div>

          <div v-else class="flex gap-2">
            <Button @click="triggerSync" :disabled="isSyncing" size="sm" class="flex-1 bg-zinc-100 text-black hover:bg-white font-bold rounded-2xl">
              <RefreshCwIcon class="w-3 h-3 mr-2" :class="{ 'animate-spin': isSyncing }" />
              Sync Now
            </Button>
          </div>
        </div>
      </div>

      <div class="mt-auto p-4 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-2">
         <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
               <div class="w-2 h-2 rounded-full" :class="settings.apiToken ? 'bg-green-500' : 'bg-zinc-600'"></div>
               <span class="text-[10px] text-zinc-500 uppercase font-bold">{{ settings.apiToken ? 'Connected' : 'Offline' }}</span>
            </div>
            <button @click="StorageService.loginWithGoogle()" class="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-bold">
               Manage Account <ArrowUpRight class="w-3 h-3" />
            </button>
         </div>
         <div v-if="showDevSettings" class="pt-2 border-t border-white/5">
            <label class="text-[9px] text-zinc-600 uppercase font-bold block mb-1">Backend URL</label>
            <input v-model="settings.apiUrl" @change="saveSettings" placeholder="https://..." class="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-blue-500" />
         </div>
         <button @click="showDevSettings = !showDevSettings" class="w-full text-[8px] text-zinc-700 hover:text-zinc-500 uppercase tracking-widest pt-1">
             {{ showDevSettings ? 'Hide' : 'Show' }} Dev Settings
         </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { StickyNote as StickyNoteIcon, Trash as TrashIcon, Settings as SettingsIcon, RefreshCw as RefreshCwIcon, Cloud as CloudIcon, CheckCircle, CreditCard, ArrowUpRight, Link as LinkIcon, Search } from 'lucide-vue-next'
import { Card, CardContent, CardFooter } from './components/ui/card/index'
import { Button } from './components/ui/button/index'
import { Input } from './components/ui/input/index'
import { Badge } from './components/ui/badge/index'
import { StorageService, type StickyNote, type Settings } from './lib/storage'

const view = ref<'notes' | 'settings'>('notes')
const notes = ref<StickyNote[]>([])
const searchQuery = ref('')
const isSyncing = ref(false)
const isConnecting = ref(false)
const connectionError = ref('')
const showDevSettings = ref(false)

const filteredNotes = computed(() => {
  if (!searchQuery.value) return notes.value
  const query = searchQuery.value.toLowerCase()
  return notes.value.filter(n => 
    n.text.toLowerCase().includes(query) || 
    n.username.toLowerCase().includes(query)
  )
})

const settings = reactive<Settings>({
  apiToken: '',
  syncMode: 'local',
  apiUrl: 'https://notes.hadealahmad.com',
  isSubscribed: false,
  isAdmin: false
})

async function loadData() {
  const allNotes = await StorageService.getAllNotes()
  notes.value = allNotes
    .filter(n => !n.deletedAt)
    .sort((a, b) => b.updatedAt - a.updatedAt)
  
  const savedSettings = await StorageService.getSettings()
  Object.assign(settings, savedSettings)

  // Auto check subscription or try to auto-connect if no token
  if (settings.apiToken) {
    await StorageService.checkSubscription()
    const updatedSettings = await StorageService.getSettings()
    settings.isSubscribed = updatedSettings.isSubscribed
  } else {
    // Try to auto-connect silently on load
    handleAutoConnect(true)
  }

  // Trigger cloud sync whenever popup is opened
  if (settings.syncMode === 'cloud' && settings.apiToken) {
    triggerSync()
  }
}

onMounted(() => {
  loadData()
})

async function saveSettings() {
  await StorageService.saveSettings({ ...settings })
}

async function handleAutoConnect(silent = false) {
  isConnecting.value = true
  connectionError.value = ''
  try {
    const success = await StorageService.connectWithDashboard()
    if (success) {
      const updated = await StorageService.getSettings()
      Object.assign(settings, updated)
    } else if (!silent) {
      connectionError.value = 'Make sure you are logged in to the dashboard.'
      // If failed and button was clicked manually, open the dashboard
      StorageService.loginWithGoogle()
    }
  } catch (err) {
    if (!silent) connectionError.value = 'Network error. Check your connection.'
  } finally {
    isConnecting.value = false
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

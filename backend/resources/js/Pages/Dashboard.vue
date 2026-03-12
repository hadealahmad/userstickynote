<script setup>
import { ref } from 'vue';
import { useForm, usePage, Head, Link } from '@inertiajs/vue3';
import DashboardLayout from '../Layouts/DashboardLayout.vue';
import { Key, Plus, Trash2, CheckCircle, Copy, Search, Edit3, Trash, ShieldAlert, BadgeDollarSign, CreditCard } from 'lucide-vue-next';

const props = defineProps({
  tokens: Array,
  noteCount: Number,
  notes: Array,
});

const page = usePage();
const showTokenModal = ref(false);
const showSuccessModal = ref(false);
const showDeleteAccountModal = ref(false);
const showNoteModal = ref(false);
const editingNote = ref(null);
const generatedToken = ref(null);

// Forms
const tokenForm = useForm({ name: '' });
const noteForm = useForm({
  id: null,
  twitter_user_id: '',
  content: '',
});

const createToken = () => {
  tokenForm.post('/tokens', {
    onSuccess: (p) => {
      generatedToken.value = p.props.flash.newToken;
      showTokenModal.value = false;
      showSuccessModal.value = true;
      tokenForm.reset();
    },
  });
};

const openNoteModal = (note = null) => {
  editingNote.value = note;
  if (note) {
    noteForm.id = note.id;
    noteForm.twitter_user_id = note.twitter_user_id;
    noteForm.content = note.content;
  } else {
    noteForm.reset();
  }
  showNoteModal.value = true;
};

const saveNote = () => {
  if (editingNote.value) {
    noteForm.put(`/notes/${editingNote.value.id}`, {
      onSuccess: () => { showNoteModal.value = false; noteForm.reset(); }
    });
  } else {
    noteForm.post('/notes', {
      onSuccess: () => { showNoteModal.value = false; noteForm.reset(); }
    });
  }
};

const deleteNote = (id) => {
  if (confirm('Delete this note?')) {
    useForm({}).delete(`/notes/${id}`);
  }
};

const deleteAccount = () => {
    useForm({}).delete('/account');
};

const copyToken = () => {
  navigator.clipboard.writeText(generatedToken.value.plain);
  alert('Token copied!');
};

const formatDate = (date) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString();
};
</script>

<template>
  <Head title="Dashboard" />

  <DashboardLayout>
    <!-- Subscription Banner -->
    <div v-if="!$page.props.auth.user.is_subscribed" class="mb-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
       <div class="flex items-center gap-4 text-center md:text-left">
          <div class="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
             <BadgeDollarSign class="text-amber-500" />
          </div>
          <div>
             <h3 class="font-bold text-lg">Cloud Sync is Inactive</h3>
             <p class="text-zinc-500 text-sm">Unlock multi-device sync and web management for just $1/year.</p>
          </div>
       </div>
       <a href="/billing/checkout" class="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2">
          <CreditCard class="w-4 h-4" />
          Get Premium
       </a>
    </div>

    <div class="grid md:grid-cols-3 gap-6 mb-12">
      <div class="p-8 rounded-3xl bg-zinc-900 border border-white/5">
          <p class="text-zinc-500 font-medium mb-1">Status</p>
          <div v-if="page.props.auth.user.is_subscribed" class="flex items-center gap-2 text-green-500 font-bold">
             <CheckCircle class="w-4 h-4" /> Premium
          </div>
          <div v-else class="text-zinc-400 font-bold">Free Plan</div>
      </div>
      
      <div class="p-8 rounded-3xl bg-zinc-900 border border-white/5">
          <p class="text-zinc-500 font-medium mb-1">Total Notes</p>
          <p class="text-2xl font-outfit font-bold">{{ noteCount }}</p>
      </div>

       <div v-if="page.props.auth.user.is_admin" class="p-8 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <p class="text-blue-400 font-medium mb-1">Admin Panel</p>
            <p class="text-sm text-blue-300/60 leading-tight">You have system access.</p>
          </div>
          <Link href="/admin" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-xs font-bold">Manage</Link>
      </div>
    </div>

    <!-- Notes Management -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold font-outfit">Cloud Saved Notes</h2>
        <button @click="openNoteModal()" class="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-bold text-sm">
          <Plus class="w-4 h-4" /> New Note
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div v-if="notes.length === 0" class="col-span-full py-20 text-center bg-zinc-900/50 rounded-3xl border border-dashed border-white/5 italic text-zinc-500">
            No notes synced yet.
         </div>
         
         <div v-for="note in notes" :key="note.id" class="p-6 rounded-3xl bg-zinc-900 border border-white/5 relative group">
            <div class="flex items-center justify-between mb-4">
               <span class="text-[10px] font-bold text-blue-500 uppercase">@{{ note.twitter_user_id }}</span>
               <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openNoteModal(note)" class="text-zinc-500 hover:text-white"><Edit3 class="w-4 h-4" /></button>
                  <button @click="deleteNote(note.id)" class="text-zinc-500 hover:text-red-500"><Trash class="w-4 h-4" /></button>
               </div>
            </div>
            <p class="text-sm text-zinc-300 whitespace-pre-wrap mb-4">{{ note.content }}</p>
            <div class="text-[10px] text-zinc-600 uppercase">{{ formatDate(note.updated_at) }}</div>
         </div>
      </div>
    </div>

    <!-- Tokens Section -->
    <div class="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden mb-20">
      <div class="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/20">
        <div class="flex items-center gap-3">
          <Key class="w-6 h-6 text-zinc-400" />
          <h2 class="text-xl font-bold font-outfit">Sync Tokens</h2>
        </div>
        <button @click="showTokenModal = true" class="flex items-center gap-2 border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl font-bold text-xs transition-all">
          Generate Token
        </button>
      </div>

      <div class="p-0">
        <table v-if="tokens.length > 0" class="w-full text-left">
          <tbody class="divide-y divide-white/5 text-sm">
            <tr v-for="token in tokens" :key="token.id">
              <td class="px-8 py-4 font-medium">{{ token.name }}</td>
              <td class="px-8 py-4 text-zinc-500">Last: {{ formatDate(token.last_used_at) }}</td>
              <td class="px-8 py-4 text-right">
                <button @click="useForm({}).delete(`/tokens/${token.id}`)" class="text-zinc-600 hover:text-red-400"><Trash2 class="w-4 h-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Settings / Delete -->
    <div class="mt-20 border-t border-white/5 pt-12">
       <div class="max-w-md">
          <h3 class="text-red-500 font-bold mb-2">Danger Zone</h3>
          <p class="text-zinc-500 text-sm mb-6">Once you delete your account, all your cloud data is permanently purged. We do not offer refunds.</p>
          <button @click="showDeleteAccountModal = true" class="px-6 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all">
             Delete My Account
          </button>
       </div>
    </div>

    <!-- Modals (Token, Success, Error, Note, Delete) -->
    <!-- Simplified Token Create -->
    <div v-if="showTokenModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
       <div class="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-sm w-full">
          <h2 class="text-2xl font-bold mb-4 font-outfit">New Sync Token</h2>
          <form @submit.prevent="createToken">
             <input v-model="tokenForm.name" required placeholder="Device Name (e.g. Work PC)" class="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl mb-6 text-sm focus:border-blue-500 outline-none" />
             <div class="flex gap-2">
                <button @click="showTokenModal = false" type="button" class="flex-1 py-3 text-zinc-500 font-bold">Cancel</button>
                <button type="submit" class="flex-1 py-3 bg-blue-600 rounded-2xl font-bold">Create</button>
             </div>
          </form>
       </div>
    </div>

    <!-- Success Token -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
       <div class="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-sm w-full">
          <CheckCircle class="w-12 h-12 text-green-500 mb-6" />
          <h2 class="text-2xl font-bold mb-4 font-outfit">Save Your Token</h2>
          <div class="bg-zinc-950 p-4 rounded-2xl border border-dashed border-zinc-700 flex justify-between items-center mb-6">
             <code class="text-blue-400 truncate text-xs">{{ generatedToken.plain }}</code>
             <button @click="copyToken()"><Copy class="w-4 h-4" /></button>
          </div>
          <button @click="showSuccessModal = false" class="w-full py-4 bg-zinc-800 rounded-2xl font-bold">Close</button>
       </div>
    </div>

    <!-- Account Delete Modal -->
    <div v-if="showDeleteAccountModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
       <div class="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-md w-full text-center">
          <ShieldAlert class="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 class="text-2xl font-bold mb-2 font-outfit">Are you absolutely sure?</h2>
          <p class="text-zinc-500 mb-8 px-4">This will permanently erase all your synced notes. <strong class="text-white font-bold">As per our policy, we do not offer refunds</strong> for remaining subscription time.</p>
          <div class="flex flex-col gap-3">
             <button @click="deleteAccount" class="w-full py-4 bg-red-600 rounded-2xl font-bold">Yes, Delete Everything</button>
             <button @click="showDeleteAccountModal = false" class="w-full py-4 text-zinc-500 font-bold">Nevermind</button>
          </div>
       </div>
    </div>

    <!-- Note Modal -->
    <div v-if="showNoteModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
       <div class="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4 font-outfit">{{ editingNote ? 'Edit Note' : 'New Note' }}</h2>
          <form @submit.prevent="saveNote">
             <div class="space-y-4">
                <div>
                   <label class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Twitter Username/ID</label>
                   <input v-model="noteForm.twitter_user_id" required placeholder="elonmusk" class="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                   <label class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Note Content (Max 2000)</label>
                   <textarea v-model="noteForm.content" required rows="6" maxlength="2000" placeholder="Type your note..." class="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl text-sm focus:border-blue-500 outline-none resize-none"></textarea>
                </div>
             </div>
             <div class="flex gap-2 mt-8">
                <button @click="showNoteModal = false" type="button" class="flex-1 py-3 text-zinc-500 font-bold">Cancel</button>
                <button type="submit" class="flex-1 py-3 bg-blue-600 rounded-2xl font-bold">{{ editingNote ? 'Update' : 'Save' }}</button>
             </div>
          </form>
       </div>
    </div>

  </DashboardLayout>
</template>

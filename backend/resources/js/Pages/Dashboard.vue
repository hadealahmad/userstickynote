<script setup>
import { ref, computed } from 'vue';
import { useForm, usePage, Head, Link } from '@inertiajs/vue3';
import DashboardLayout from '../Layouts/DashboardLayout.vue';
import { 
  Key, Plus, CheckCircle, Search, Edit3, Trash, 
  ShieldAlert, BadgeDollarSign, CreditCard, ExternalLink, 
  Clock, User, MoreVertical, AlertTriangle
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const props = defineProps({
  noteCount: Number,
  notes: Array,
});

const page = usePage();
const showDeleteAccountDialog = ref(false);
const showNoteDialog = ref(false);
const editingNote = ref(null);
const searchQuery = ref('');

const filteredNotes = computed(() => {
  if (!searchQuery.value) return props.notes;
  const query = searchQuery.value.toLowerCase();
  return props.notes.filter(n => 
    (n.content && n.content.toLowerCase().includes(query)) || 
    (n.twitter_user_id && n.twitter_user_id.toLowerCase().includes(query))
  );
});

// Forms
const noteForm = useForm({
  id: null,
  twitter_user_id: '',
  content: '',
});

const openNoteDialog = (note = null) => {
  editingNote.value = note;
  if (note) {
    noteForm.id = note.id;
    noteForm.twitter_user_id = note.twitter_user_id;
    noteForm.content = note.content;
  } else {
    noteForm.reset();
  }
  showNoteDialog.value = true;
};

const saveNote = () => {
  if (editingNote.value) {
    noteForm.put(`/notes/${editingNote.value.id}`, {
      onSuccess: () => { showNoteDialog.value = false; noteForm.reset(); }
    });
  } else {
    noteForm.post('/notes', {
      onSuccess: () => { showNoteDialog.value = false; noteForm.reset(); }
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


const formatDate = (date) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<template>
  <Head title="Dashboard" />

  <DashboardLayout>
    <!-- Subscription Banner -->
    <Card v-if="!$page.props.auth.user.is_subscribed" class="mb-10 overflow-hidden border-orange-500/20 bg-orange-500/5">
       <CardContent class="p-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-5 text-center md:text-left">
               <div class="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/20">
                  <BadgeDollarSign class="w-7 h-7 text-orange-500" />
               </div>
               <div>
                  <h3 class="font-bold text-xl mb-1">Cloud Sync is Inactive</h3>
                  <p class="text-muted-foreground text-sm max-w-md">Unlock multi-device sync, web management, and priority features for just $3/year.</p>
               </div>
            </div>
            <Button size="lg" as-child class="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 font-bold">
               <a href="/billing/checkout">
                  <CreditCard class="w-5 h-5 mr-2" />
                  Get Premium
               </a>
            </Button>
          </div>
       </CardContent>
    </Card>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <Card class="bg-card">
          <CardHeader class="pb-2">
              <CardDescription class="text-xs font-bold uppercase tracking-wider">Account Status</CardDescription>
          </CardHeader>
          <CardContent>
              <div v-if="page.props.auth.user.is_subscribed" class="flex items-center gap-2 text-primary font-bold text-lg">
                 <CheckCircle class="w-5 h-5" /> Premium Plan
              </div>
              <div v-else class="text-muted-foreground font-bold text-lg">Free Plan</div>
          </CardContent>
      </Card>
      
      <Card class="bg-card">
          <CardHeader class="pb-2">
              <CardDescription class="text-xs font-bold uppercase tracking-wider">Total Synced Notes</CardDescription>
          </CardHeader>
          <CardContent>
              <p class="text-3xl font-outfit font-bold">{{ noteCount }}</p>
          </CardContent>
      </Card>

       <Card v-if="page.props.auth.user.is_admin" class="border-primary/20 bg-primary/5">
          <CardHeader class="pb-2">
            <CardDescription class="text-primary font-bold text-xs uppercase tracking-wider">System Administration</CardDescription>
          </CardHeader>
          <CardContent class="flex items-center justify-between">
            <p class="text-sm text-primary/70">You have management access.</p>
            <Button size="sm" as-child>
                <Link href="/admin">Manage</Link>
            </Button>
          </CardContent>
      </Card>
    </div>

    <!-- Notes Management -->
    <div class="mb-12">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h2 class="text-2xl font-bold font-outfit tracking-tight">Cloud Saved Notes</h2>
            <p class="text-sm text-muted-foreground mt-1">Directly manage your notes from the web.</p>
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="relative flex-1 md:w-64">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="Search notes..." class="pl-9 h-10 rounded-xl bg-accent/20 border-accent" />
          </div>
          <Button @click="openNoteDialog()" class="rounded-xl h-10 px-6 gap-2 shrink-0">
            <Plus class="w-4 h-4" /> New Note
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         <Card v-if="filteredNotes.length === 0" class="col-span-full py-24 bg-accent/30 border-dashed">
            <CardContent class="flex flex-col items-center justify-center text-center">
                <div class="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                    <Database class="w-8 h-8 text-muted-foreground" />
                </div>
                <p class="text-muted-foreground font-medium italic">
                  {{ searchQuery ? 'No notes matching your search.' : 'No notes synced yet. Start adding notes on Twitter!' }}
                </p>
            </CardContent>
         </Card>
         
         <Card v-for="note in filteredNotes" :key="note.id" class="group transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden flex flex-col h-fit">
            <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm"><MoreVertical class="w-3 h-3" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="rounded-xl">
                        <DropdownMenuItem @click="openNoteDialog(note)" class="gap-2 cursor-pointer">
                             <Edit3 class="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="deleteNote(note.id)" class="text-destructive gap-2 cursor-pointer">
                            <Trash class="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <CardHeader class="p-3 pb-0">
               <Badge variant="secondary" class="w-fit text-[9px] font-bold px-2 py-0 border-none bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                   @{{ note.twitter_user_id }}
               </Badge>
            </CardHeader>
            <CardContent class="p-3 pt-2 flex-1">
               <p class="text-xs leading-relaxed whitespace-pre-wrap line-clamp-4 text-foreground/90">{{ note.content }}</p>
            </CardContent>
            <CardFooter class="px-3 py-2 border-t bg-muted/5 flex justify-between items-center text-[9px] font-medium tracking-tight text-muted-foreground">
                <div class="flex items-center gap-1">
                    <Clock class="w-2.5 h-2.5" />
                    {{ formatDate(note.updated_at) }}
                </div>
                <a :href="'https://twitter.com/' + note.twitter_user_id" target="_blank" class="flex items-center gap-1 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                    Visit Profile <ExternalLink class="w-2.5 h-2.5" />
                </a>
            </CardFooter>
         </Card>
      </div>
    </div>


    <!-- Danger Zone -->
    <Separator class="mb-12" />
    <div class="mb-20">
       <div class="max-w-xl">
          <h3 class="text-destructive font-bold text-xl mb-3 flex items-center gap-2">
              <AlertTriangle class="w-5 h-5" />
              Danger Zone
          </h3>
          <p class="text-muted-foreground text-sm mb-6 leading-relaxed">
             Deleting your account will permanently erase your synced data from our servers. 
             Local data in your browser extension will remain until manually deleted there. 
             <strong class="text-foreground">We do not offer refunds for remaining subscription time.</strong>
          </p>
          <Button variant="destructive" @click="showDeleteAccountDialog = true" class="rounded-xl font-bold px-8">
             Delete My Account
          </Button>
       </div>
    </div>

    <!-- Modals (Token, Success, Error, Note, Delete) -->
    

    <!-- Account Delete Dialog -->
    <Dialog v-model:open="showDeleteAccountDialog">
        <DialogContent class="sm:max-w-md border-destructive/50">
            <DialogHeader>
                <div class="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert class="w-8 h-8 text-destructive" />
                </div>
                <DialogTitle class="text-center text-xl">Confirm Account Deletion</DialogTitle>
                <DialogDescription class="text-center">
                    This action is <span class="text-destructive font-bold">permanent</span>. 
                    All cloud-synced notes will be deleted.
                </DialogDescription>
            </DialogHeader>
            <div class="p-4 bg-accent/50 rounded-xl text-center text-sm border-2 border-destructive/20 border-dotted my-4">
                <strong>No refunds policy:</strong> Remaining subscription time will not be refunded.
            </div>
            <DialogFooter class="flex flex-col gap-2">
                <Button variant="destructive" class="w-full font-bold h-12" @click="deleteAccount">Yes, Delete Everything</Button>
                <Button variant="ghost" class="w-full" @click="showDeleteAccountDialog = false">Keep My Account</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <!-- Note Dialog -->
    <Dialog v-model:open="showNoteDialog">
        <DialogContent class="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{{ editingNote ? 'Edit Cloud Note' : 'Create New Cloud Note' }}</DialogTitle>
                <DialogDescription>This note will be synced to your extension automatically.</DialogDescription>
            </DialogHeader>
            <form @submit.prevent="saveNote">
                <div class="space-y-4 py-4">
                    <div class="space-y-2">
                        <Label for="twitter-id">Twitter Username/ID</Label>
                        <div class="relative">
                            <span class="absolute left-3 top-2.5 text-muted-foreground font-bold">@</span>
                            <Input id="twitter-id" v-model="noteForm.twitter_user_id" required placeholder="elonmusk" class="pl-7" />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <Label for="note-content">Note Content (Max 2000 characters)</Label>
                        <Textarea id="note-content" v-model="noteForm.content" required rows="6" maxlength="2000" placeholder="Write your private thoughts here..." class="resize-none" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" type="button" @click="showNoteDialog = false">Cancel</Button>
                    <Button type="submit" :disabled="noteForm.processing">{{ editingNote ? 'Update Note' : 'Save Note' }}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>

  </DashboardLayout>
</template>

<style scoped>
.font-outfit { font-family: 'Outfit', sans-serif; }
</style>

<script setup>
import { ref, computed } from 'vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import DashboardLayout from '../../Layouts/DashboardLayout.vue';
import { 
  Users, StickyNote, ShieldCheck, UserPlus, 
  Search, MoreHorizontal, Edit, Trash2, 
  LogIn, Shield, User as UserIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const props = defineProps({
  users: Array,
});

const searchQuery = ref('');
const showUserDialog = ref(false);
const editingUser = ref(null);

const userForm = useForm({
  name: '',
  email: '',
  is_admin: false,
  is_subscribed: false,
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return props.users;
  const query = searchQuery.value.toLowerCase();
  return props.users.filter(u => 
    u.name.toLowerCase().includes(query) || 
    u.email.toLowerCase().includes(query)
  );
});

const openUserDialog = (user = null) => {
  editingUser.value = user;
  if (user) {
    userForm.name = user.name;
    userForm.email = user.email;
    userForm.is_admin = !!user.is_admin;
    userForm.is_subscribed = !!user.is_subscribed;
  } else {
    userForm.reset();
  }
  showUserDialog.value = true;
};

const submitUser = () => {
  if (editingUser.value) {
    userForm.put(route('admin.users.update', editingUser.value.id), {
      onSuccess: () => { showUserDialog.value = false; }
    });
  } else {
    userForm.post(route('admin.users.store'), {
      onSuccess: () => { showUserDialog.value = false; }
    });
  }
};

const deleteUser = (user) => {
  if (confirm(`Are you sure you want to delete ${user.name}? This will delete all their notes.`)) {
    useForm({}).delete(route('admin.users.destroy', user.id));
  }
};

const impersonate = (user) => {
  if (confirm(`Impersonate ${user.name}?`)) {
    useForm({}).post(route('admin.users.impersonate', user.id));
  }
};
</script>

<template>
  <Head title="Admin Dashboard" />

  <DashboardLayout>
    <div class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-3xl font-outfit font-bold flex items-center gap-3 tracking-tight">
            <ShieldCheck class="w-8 h-8 text-primary" />
            System Control
        </h2>
        <p class="text-muted-foreground mt-1">Manage users, subscriptions, and system access.</p>
      </div>
      <Button @click="openUserDialog()" class="rounded-xl gap-2 h-11 px-6 shadow-lg shadow-primary/20">
        <UserPlus class="w-5 h-5" /> Add New User
      </Button>
    </div>

    <Card class="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
      <div class="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-3">
              <Users class="text-muted-foreground w-5 h-5" />
              <h3 class="text-lg font-bold font-outfit">User Directory</h3>
              <Badge variant="secondary" class="rounded-full px-2">{{ users.length }} Total</Badge>
          </div>
          <div class="relative w-full md:w-80">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="Search by name or email..." class="pl-9 bg-accent/20 border-accent h-10 rounded-xl" />
          </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-muted-foreground text-[10px] uppercase tracking-widest bg-accent/30">
              <th class="px-6 py-4 font-bold">User Identity</th>
              <th class="px-6 py-4 font-bold">Privileges</th>
              <th class="px-6 py-4 font-bold">Stats</th>
              <th class="px-6 py-4 font-bold text-right pr-10">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="user in filteredUsers" :key="user.id" class="group hover:bg-accent/20 transition-all duration-200">
              <td class="px-6 py-5">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <img :src="user.google_avatar" class="w-10 h-10 rounded-xl border-2 border-background shadow-sm" />
                    <div v-if="user.is_admin" class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-background flex items-center justify-center">
                        <Shield class="w-2 h-2 text-black" />
                    </div>
                  </div>
                  <div>
                      <div class="font-bold text-sm text-foreground">{{ user.name }}</div>
                      <div class="text-xs text-muted-foreground">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5 space-x-2">
                <Badge :variant="user.is_subscribed ? 'default' : 'secondary'" class="text-[9px] uppercase tracking-tighter rounded-md border-none font-bold">
                  {{ user.is_subscribed ? 'Premium' : 'Free Tier' }}
                </Badge>
                <Badge v-if="user.is_admin" variant="outline" class="text-[9px] uppercase tracking-tighter rounded-md border-yellow-500/50 text-yellow-500 font-bold">
                  Admin
                </Badge>
              </td>
              <td class="px-6 py-5">
                <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <StickyNote class="w-3.5 h-3.5" />
                    <span class="text-foreground">{{ user.notes_count }}</span> notes
                </div>
                <div class="text-[10px] text-muted-foreground mt-1">
                    Added {{ new Date(user.created_at).toLocaleDateString() }}
                </div>
              </td>
              <td class="px-6 py-5 text-right pr-6">
                <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" class="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary" @click="impersonate(user)" title="Impersonate">
                        <LogIn class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" class="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-500" @click="openUserDialog(user)" title="Edit">
                        <Edit class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" class="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" @click="deleteUser(user)" title="Delete">
                        <Trash2 class="w-4 h-4" />
                    </Button>
                </div>
                <div class="group-hover:hidden text-muted-foreground">
                    <MoreHorizontal class="w-5 h-5 ml-auto opacity-50" />
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="p-20 text-center space-y-3">
                  <Search class="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <p class="text-muted-foreground">No users found matching your search.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- User Edit/Create Dialog -->
    <Dialog v-model:open="showUserDialog">
      <DialogContent class="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold font-outfit">{{ editingUser ? 'Modify User Profile' : 'Register New User' }}</DialogTitle>
          <DialogDescription>Update system privileges and information.</DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="submitUser" class="space-y-6 pt-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label class="text-xs uppercase font-bold text-muted-foreground ml-1">Full Name</Label>
              <Input v-model="userForm.name" placeholder="John Doe" class="rounded-xl h-11" required />
            </div>
            <div class="space-y-2">
              <Label class="text-xs uppercase font-bold text-muted-foreground ml-1">Email Address</Label>
              <Input v-model="userForm.email" type="email" placeholder="john@example.com" class="rounded-xl h-11" required />
            </div>
            
            <Separator class="my-4" />
            
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border">
                <div class="space-y-0.5">
                  <Label class="text-sm font-bold">Premium Tier</Label>
                  <p class="text-[10px] text-muted-foreground">Subscription access</p>
                </div>
                <Switch v-model:checked="userForm.is_subscribed" />
              </div>
              
              <div class="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border">
                <div class="space-y-0.5">
                  <Label class="text-sm font-bold">Administrator</Label>
                  <p class="text-[10px] text-muted-foreground">System level access</p>
                </div>
                <Switch v-model:checked="userForm.is_admin" />
              </div>
            </div>
          </div>

          <DialogFooter class="flex flex-col sm:flex-row gap-2 mt-6">
            <Button variant="ghost" type="button" class="flex-1 rounded-xl h-11" @click="showUserDialog = false">Cancel</Button>
            <Button type="submit" class="flex-1 rounded-xl h-11 shadow-lg shadow-primary/20" :disabled="userForm.processing">
               {{ editingUser ? 'Update Changes' : 'Create Account' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </DashboardLayout>
</template>

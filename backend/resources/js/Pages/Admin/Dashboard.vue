<script setup>
import { Head, Link } from '@inertiajs/vue3';
import DashboardLayout from '../../Layouts/DashboardLayout.vue';
import { Users, StickyNote, ShieldCheck } from 'lucide-vue-next';

defineProps({
  users: Array,
});
</script>

<template>
  <Head title="Admin Dashboard" />

  <DashboardLayout>
    <template #default>
      <div class="mb-12">
        <h2 class="text-2xl font-outfit font-bold flex items-center gap-2 mb-2">
            <ShieldCheck class="text-blue-500" />
            System Administration
        </h2>
        <p class="text-zinc-500">Overview of all users and activity.</p>
      </div>

      <div class="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden">
        <div class="p-8 border-b border-white/5 flex items-center gap-3">
            <Users class="text-zinc-400" />
            <h3 class="text-xl font-bold font-outfit">All Registered Users</h3>
        </div>
        
        <table class="w-full text-left">
          <thead>
            <tr class="text-zinc-500 text-xs uppercase tracking-wider">
              <th class="px-8 py-4 font-medium">User</th>
              <th class="px-8 py-4 font-medium">Status</th>
              <th class="px-8 py-4 font-medium">Notes</th>
              <th class="px-8 py-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="user in users" :key="user.id" class="group hover:bg-white/2 transition-colors">
              <td class="px-8 py-4 flex items-center gap-3">
                <img :src="user.google_avatar" class="w-8 h-8 rounded-full" />
                <div>
                    <div class="font-medium text-zinc-200">{{ user.name }}</div>
                    <div class="text-xs text-zinc-500">{{ user.email }}</div>
                </div>
              </td>
              <td class="px-8 py-4">
                <span v-if="user.is_subscribed" class="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-md tracking-tighter">Premium</span>
                <span v-else class="px-2 py-1 bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase rounded-md tracking-tighter">Free</span>
              </td>
              <td class="px-8 py-4 text-sm text-zinc-400">
                {{ user.notes_count }}
              </td>
              <td class="px-8 py-4 text-sm text-zinc-500">
                {{ new Date(user.created_at).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </DashboardLayout>
</template>

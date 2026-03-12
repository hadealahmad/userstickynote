<script setup>
import { Link } from '@inertiajs/vue3';
import { StickyNote, LogOut, LayoutDashboard, Database } from 'lucide-vue-next';

defineProps({
  user: Object,
});
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 border-r border-white/5 bg-zinc-950 z-40 hidden md:block">
      <div class="p-6">
        <div class="flex items-center gap-2 mb-10">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <StickyNote class="w-5 h-5 text-white" />
          </div>
          <span class="font-outfit font-bold text-xl tracking-tight">StickyNotes</span>
        </div>

        <nav class="space-y-2">
          <Link href="/dashboard" class="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20">
            <LayoutDashboard class="w-5 h-5" />
            Dashboard
          </Link>
          <a href="#" class="flex items-center gap-3 px-4 py-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all font-medium">
            <Database class="w-5 h-5" />
            Cloud Storage
          </a>
        </nav>
      </div>

      <div class="absolute bottom-0 w-full p-6 border-t border-white/5">
        <div class="flex items-center gap-3 mb-6">
           <img :src="$page.props.auth.user.google_avatar" class="w-10 h-10 rounded-full border border-white/10" alt="Avatar" />
           <div class="overflow-hidden">
             <p class="font-medium truncate text-sm">{{ $page.props.auth.user.name }}</p>
             <p class="text-xs text-zinc-500 truncate">{{ $page.props.auth.user.email }}</p>
           </div>
        </div>
        <div class="flex flex-col gap-2">
           <Link href="/auth/logout" method="post" as="button" class="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
            <LogOut class="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="md:ml-64 p-6 md:p-12">
      <header class="flex justify-between items-center mb-12">
        <div>
          <h1 class="text-3xl font-outfit font-bold mb-2">Welcome back, {{ $page.props.auth.user.name.split(' ')[0] }}!</h1>
          <p class="text-zinc-500">Manage your sync tokens and view your cloud-saved notes.</p>
        </div>
      </header>

      <slot />
    </main>
  </div>
</template>

<style scoped>
.font-outfit { font-family: 'Outfit', sans-serif; }
</style>

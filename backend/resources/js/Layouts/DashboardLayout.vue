<script setup>
import { Link, usePage } from '@inertiajs/vue3';
import { StickyNote, LogOut, LayoutDashboard, Database, User, Settings, ShieldCheck } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

defineProps({
  user: Object,
});

const page = usePage();
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans">
    <!-- Impersonation Banner -->
    <div v-if="$page.props.auth.isImpersonating" class="bg-yellow-500 text-black py-2 px-6 flex justify-between items-center z-50 sticky top-0 font-bold text-sm">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4" />
        You are currently impersonating {{ $page.props.auth.user.name }}
      </div>
      <Link href="/admin/stop-impersonating" class="underline hover:no-underline flex items-center gap-1">
        Stop Impersonating <LogOut class="w-4 h-4" />
      </Link>
    </div>

    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 border-r bg-card z-40 hidden md:block" :class="{ 'mt-10': $page.props.auth.isImpersonating }">
      <div class="flex flex-col h-full">
        <div class="p-6">
          <Link href="/" class="flex items-center gap-3 mb-10 group">
            <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center transition-transform group-hover:rotate-6 border border-yellow-500/20">
              <img src="/logo.svg" class="w-6 h-6" alt="Logo" />
            </div>
            <div class="flex flex-col">
              <span class="font-outfit font-bold text-lg leading-none tracking-tight">Username</span>
              <span class="font-outfit text-xs text-muted-foreground font-medium uppercase tracking-widest">Sticky Notes</span>
            </div>
          </Link>

          <nav class="space-y-1">
            <Link 
              href="/dashboard" 
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium"
              :class="$page.url === '/dashboard' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent'"
            >
              <LayoutDashboard class="w-5 h-5" />
              My Notes
            </Link>

            <Link 
              v-if="$page.props.auth.user.is_admin"
              href="/admin" 
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium"
              :class="$page.url.startsWith('/admin') ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent'"
            >
              <ShieldCheck class="w-5 h-5" />
              Admin Portal
            </Link>
          </nav>
        </div>

        <div class="mt-auto p-4 flex flex-col gap-4">
          <div class="p-4 rounded-2xl bg-accent/50 border flex flex-col gap-3">
            <div class="flex items-center gap-3">
               <div class="relative">
                 <Avatar class="w-10 h-10 border">
                    <AvatarImage :src="$page.props.auth.user.google_avatar" alt="Avatar" />
                    <AvatarFallback>{{ $page.props.auth.user.name.charAt(0) }}</AvatarFallback>
                 </Avatar>
                 <div v-if="$page.props.auth.user.is_subscribed" class="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                    <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                 </div>
               </div>
               <div class="overflow-hidden">
                 <p class="font-bold truncate text-sm">{{ $page.props.auth.user.name }}</p>
                 <p class="text-xs text-muted-foreground truncate">{{ $page.props.auth.user.email }}</p>
               </div>
            </div>
            <Separator />
            <Link href="/auth/logout" method="post" as="button" class="w-full">
                <Button variant="ghost" size="sm" class="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut class="w-4 h-4" />
                    Sign Out
                </Button>
            </Link>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="md:ml-64 min-h-screen">
      <div class="p-6 md:p-12 max-w-7xl mx-auto">
        <header class="flex justify-between items-center mb-12">
          <div>
            <h1 class="text-3xl font-outfit font-bold tracking-tight mb-2">Welcome back, {{ $page.props.auth.user.name.split(' ')[0] }}!</h1>
            <p class="text-muted-foreground">Manage your account, sync tokens, and view your data.</p>
          </div>
        </header>

        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.font-outfit { font-family: 'Outfit', sans-serif; }
</style>

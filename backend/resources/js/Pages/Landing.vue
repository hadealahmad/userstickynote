<script setup>
import { Link, Head } from '@inertiajs/vue3';
import { StickyNote, Zap, Share2, Lock, ArrowRight, CreditCard } from 'lucide-vue-next';
</script>

<template>
  <Head title="Twitter Sticky Notes - Private Notes for X" />

  <div class="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-500/30">
    <!-- Navbar -->
    <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <StickyNote class="w-5 h-5 text-white" />
          </div>
          <span class="font-outfit font-bold text-xl tracking-tight">StickyNotes</span>
        </div>
        <div class="flex items-center gap-6">
          <a href="/auth/google" class="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-zinc-200 transition-all duration-300">
            Login with Google
          </a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="pt-32 pb-20 px-6 text-center">
      <div class="max-w-4xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <Zap class="w-4 h-4" />
          Real-time Cloud Sync for Your X Experience
        </div>
        
        <h1 class="text-5xl md:text-8xl font-outfit font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          Private notes for <br /> anyone on <span class="text-blue-500">Twitter.</span>
        </h1>
        
        <p class="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Keep track of context, thoughts, and reminders directly on user profiles. Now with seamless Cloud Sync for just $1/year.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a href="/auth/google" class="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3">
            Start Syncing
            <ArrowRight class="w-5 h-5" />
          </a>
          <a href="/downloads/twitter-sticky-notes.zip" class="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-white/10 hover:bg-zinc-800 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3">
            Download Extension (v2.0)
          </a>
        </div>
      </div>
    </main>

    <!-- Pricing / Features -->
    <section class="py-24 px-6 border-t border-white/5 bg-zinc-900/20">
      <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
           <h2 class="text-4xl font-outfit font-bold mb-6">Simple, Fair Pricing.</h2>
           <p class="text-zinc-400 mb-8">All features are free for local use. Cloud Sync is a premium addition to support our infrastructure.</p>
           
           <ul class="space-y-4 mb-10">
             <li class="flex items-center gap-3 text-zinc-300"><Lock class="w-5 h-5 text-blue-500" /> Private local-only storage (Free)</li>
             <li class="flex items-center gap-3 text-zinc-300"><Share2 class="w-5 h-5 text-blue-500" /> Multi-device Cloud Sync ($1/year)</li>
           </ul>
        </div>
        
        <div class="p-10 rounded-[40px] bg-zinc-900 border border-white/10 shadow-3xl text-center">
           <p class="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-4">Cloud Sync Plan</p>
           <div class="flex justify-center items-end gap-1 mb-6">
              <span class="text-6xl font-outfit font-bold">$1</span>
              <span class="text-zinc-500 pb-2">/year</span>
           </div>
           <a href="/auth/google" class="block w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all mb-4">
              Get Started Now
           </a>
           <p class="text-[10px] text-white uppercase tracking-tighter">Security first. Privacy guaranteed. No refunds policy applies.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-white/5 px-6">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-2 text-zinc-500">
          <StickyNote class="w-4 h-4" />
          <span class="font-outfit font-bold">StickyNotes</span>
          <span class="text-xs ml-2">© 2026</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-outfit { font-family: 'Outfit', sans-serif; }
</style>

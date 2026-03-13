<script setup>
import { Link, Head, usePage } from "@inertiajs/vue3";
import { computed } from "vue";
import {
    Zap,
    Share2,
    Lock,
    ArrowRight,
    Download,
    Check,
    User,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const page = usePage();
const user = computed(() => page.props.auth?.user);
</script>

<template>
    <Head title="Username Sticky Notes - Private Notes for Profiles" />

    <div
        class="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans"
    >
        <!-- Navbar -->
        <nav
            class="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-xl"
        >
            <div
                class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
            >
                <div class="flex items-center gap-3 group cursor-pointer">
                    <div
                        class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center transition-transform group-hover:rotate-6 border border-yellow-500/20"
                    >
                        <img src="/logo.svg" class="w-6 h-6" alt="Logo" />
                    </div>
                    <div class="flex flex-col">
                        <span class="font-outfit font-bold text-lg leading-none tracking-tight">Username</span>
                        <span class="font-outfit text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Sticky Notes</span>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <Button variant="ghost" as-child class="hidden sm:flex">
                        <a href="#pricing">Pricing</a>
                    </Button>
                    <Button
                        variant="default"
                        as-child
                        class="rounded-full px-6"
                    >
                        <a :href="user ? '/dashboard' : '/auth/google'">
                            <User v-if="user" class="w-4 h-4 mr-2" />
                            {{ user ? "Account" : "Login" }}
                        </a>
                    </Button>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <main class="relative pt-32 pb-20 px-6 overflow-hidden">
            <!-- Background Glow -->
            <div
                class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none"
            ></div>

            <div class="max-w-5xl mx-auto text-center">
                <div class="inline-flex items-center mb-8">
                    <Badge
                        variant="secondary"
                        class="py-1 px-4 gap-2 text-sm font-medium border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                        <Zap class="w-4 h-4 fill-current" />
                        V2.0 is out with Cloud Sync
                    </Badge>
                </div>

                <h1
                    class="text-6xl md:text-8xl font-outfit font-bold tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent leading-[1.1]"
                >
                    Private notes for <br />
                    anyone on <span class="text-yellow-500 italic">Twitter.</span>
                </h1>

                <p
                    class="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Keep track of context, thoughts, and reminders directly on
                    user profiles. Seamless Cloud Sync keeps your thoughts
                    accessible across all your devices.
                </p>

                <div
                    class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
                >
                    <Button
                        size="lg"
                        as-child
                        class="h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-3 group"
                    >
                        <a :href="user ? '/dashboard' : '/auth/google'">
                            {{ user ? "Go to Dashboard" : "Get Started Now" }}
                            <ArrowRight
                                class="w-5 h-5 transition-transform group-hover:translate-x-1"
                            />
                        </a>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        as-child
                        class="h-14 px-8 rounded-2xl text-lg font-bold gap-3"
                    >
                        <a href="/downloads/username-sticky-notes.zip">
                            <Download class="w-5 h-5" />
                            Download Extension
                        </a>
                    </Button>
                </div>

                <div
                    class="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y"
                >
                    <div class="flex flex-col items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center"
                        >
                            <Lock class="w-6 h-6 text-primary" />
                        </div>
                        <h3 class="font-bold">Privacy First</h3>
                        <p class="text-sm text-muted-foreground">
                            Notes are private and encrypted. Only you can see
                            them.
                        </p>
                    </div>
                    <div class="flex flex-col items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center"
                        >
                            <Zap class="w-6 h-6 text-primary" />
                        </div>
                        <h3 class="font-bold">Real-time Sync</h3>
                        <p class="text-sm text-muted-foreground">
                            Instant sync across all your desktop browsers.
                        </p>
                    </div>
                    <div class="flex flex-col items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center"
                        >
                            <Share2 class="w-6 h-6 text-primary" />
                        </div>
                        <h3 class="font-bold">Profile Hints</h3>
                        <p class="text-sm text-muted-foreground">
                            See a reminder marker on profiles you've noted.
                        </p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Pricing Section -->
        <section id="pricing" class="py-24 px-6 bg-secondary/20">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-outfit font-bold mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p class="text-muted-foreground text-lg">
                        Everything you need, nothing you don't.
                    </p>
                </div>

                <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <!-- Free Plan -->
                    <Card class="border-border bg-background flex flex-col">
                        <CardHeader>
                            <CardTitle>Free</CardTitle>
                            <CardDescription
                                >Perfect for personal local
                                use.</CardDescription
                            >
                        </CardHeader>
                        <CardContent class="flex-1 space-y-4">
                            <div class="text-4xl font-bold">
                                $0<span
                                    class="text-sm font-normal text-muted-foreground"
                                    >/forever</span
                                >
                            </div>
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2 text-sm">
                                    <Check class="w-4 h-4 text-primary" />
                                    Private local storage
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <Check class="w-4 h-4 text-primary" />
                                    Unlimited notes
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <Check class="w-4 h-4 text-primary" />
                                    Twitter integration
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                class="w-full rounded-xl py-6"
                                as-child
                            >
                                <a href="/downloads/username-sticky-notes.zip"
                                    >Download Extension</a
                                >
                            </Button>
                        </CardFooter>
                    </Card>

                    <!-- Premium Plan -->
                    <Card
                        class="border-primary relative overflow-hidden bg-background flex flex-col"
                    >
                        <div
                            class="absolute top-0 right-0 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-bl-xl uppercase tracking-widest"
                        >
                            Best Value
                        </div>
                        <CardHeader>
                            <CardTitle>Cloud Sync</CardTitle>
                            <CardDescription
                                >Always keep your notes in
                                reach.</CardDescription
                            >
                        </CardHeader>
                        <CardContent class="flex-1 space-y-4">
                            <div class="text-4xl font-bold">
                                $3<span
                                    class="text-sm font-normal text-muted-foreground"
                                    >/year</span
                                >
                            </div>
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2 text-sm">
                                    <Check class="w-4 h-4 text-primary" />
                                    Multi-device synchronization
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <Check class="w-4 h-4 text-primary" /> Web
                                    management dashboard
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <Check class="w-4 h-4 text-primary" />
                                    Priority support
                                </li>
                                <li class="flex items-center gap-2 text-sm">
                                    <Check class="w-4 h-4 text-primary" />
                                    Future cloud features
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button class="w-full rounded-xl py-6" as-child>
                                <a
                                    :href="user ? '/dashboard' : '/auth/google'"
                                    >{{
                                        user
                                            ? "Go to Dashboard"
                                            : "Upgrade to Premium"
                                    }}</a
                                >
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <p class="text-center text-xs text-muted-foreground mt-12 px-6">
                    Secure processing. Privacy guaranteed. No refunds policy
                    applies to subscriptions.
                </p>
            </div>
        </section>

        <!-- Footer -->
        <footer class="py-12 px-6 border-t font-outfit">
            <div
                class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground"
            >
                <div class="flex items-center gap-3">
                    <img src="/logo.svg" class="w-5 h-5" alt="Logo" />
                    <span class="font-bold text-foreground">Username Sticky Notes</span>
                    <Separator orientation="vertical" class="h-4 mx-2" />
                    <span class="text-xs">© 2026</span>
                </div>
                <div
                    class="flex gap-8 text-xs font-bold uppercase tracking-widest"
                >
                    <a href="https://twitter.com" class="hover:text-primary transition-colors"
                        >Twitter</a
                    >
                    <a href="#" class="hover:text-primary transition-colors"
                        >Privacy</a
                    >
                    <a href="#" class="hover:text-primary transition-colors"
                        >Terms</a
                    >
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&display=swap");
.font-outfit {
    font-family: "Outfit", sans-serif;
}
</style>

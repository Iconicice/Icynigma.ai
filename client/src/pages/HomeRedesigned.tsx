import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/InstallAppButton";
import { AtomicRILogo } from "@/components/AtomicRILogo";
import { getLoginUrl } from "@/const";
import { ArrowUpRight, AudioLines, BrainCircuit, CircleUserRound, Menu, Moon, Sun, WifiOff } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";

const capabilities = [
  { icon: BrainCircuit, title: "Explore ideas", copy: "Go deeper into philosophy, creativity, and the questions behind the obvious." },
  { icon: AudioLines, title: "Talk naturally", copy: "Use Live Voice for fluid, interruptible conversations with ElevenLabs fallback support." },
  { icon: WifiOff, title: "Keep it private", copy: "Switch to local Ollama inference when your thinking should stay close to home." },
];

export default function HomeRedesigned() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const enterChat = () => isAuthenticated ? setLocation("/chat") : (window.location.href = getLoginUrl());

  return (
    <main className="aurora-shell min-h-screen overflow-hidden bg-background text-foreground">
      <div className="aurora-wash" aria-hidden="true" />
      <div className="aurora-grid" aria-hidden="true" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <button type="button" onClick={() => setLocation("/")} className="flex items-center gap-3 text-left" aria-label="Icynigma home">
          <AtomicRILogo size="sm" className="aurora-logo ri-logo-3d" />
          <span><span className="block text-lg font-medium tracking-tight">Icynigma.ai</span><span className="block text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Systems [R.I]</span></span>
        </button>
        <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"><a href="#capabilities" className="transition-colors hover:text-foreground">Capabilities</a><a href="#about" className="transition-colors hover:text-foreground">About</a><InstallAppButton compact className="aurora-outline-button" /></div>
        <div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={toggleTheme} className="aurora-theme-button" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"}>{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></Button><Button onClick={enterChat} className="aurora-dark-button rounded-full px-5">{isAuthenticated ? "Open chat" : "Sign in"}<ArrowUpRight className="ml-2 h-4 w-4" /></Button></div>
      </nav>

      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-20 pt-20 text-center sm:pt-28">
        <div className="aurora-chip mb-7"><span className="aurora-dot" />A philosophical intelligence for curious minds</div>
        <h1 className="aurora-title max-w-4xl text-6xl font-medium leading-[.98] tracking-[-.06em] sm:text-8xl">What will you<br /><span>discover next?</span></h1>
        <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">A clear, human-centered space for thinking with an AI companion—without the noise.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3"><Button onClick={enterChat} className="aurora-gradient-button h-12 rounded-full px-7">Start exploring <ArrowUpRight className="ml-2 h-4 w-4" /></Button><InstallAppButton className="aurora-outline-button h-12 rounded-full px-6" /></div>
        {!isAuthenticated && <p className="mt-5 text-xs text-muted-foreground">Secure sign-in keeps your conversations private.</p>}

        <div className="aurora-prompt-card mt-20 w-full max-w-3xl text-left">
          <div className="flex items-center gap-3 px-5 pt-5 text-sm text-muted-foreground"><CircleUserRound className="h-5 w-5 text-blue-500" />Ask Icynigma anything</div>
          <div className="px-5 pb-5 pt-8 text-lg text-muted-foreground/70">Try: “What makes an idea worth pursuing?”</div>
          <div className="flex items-center justify-between border-t border-border/60 px-5 py-3"><span className="text-xs text-muted-foreground">Text, voice, local AI, and memory-aware threads</span><Button onClick={enterChat} size="icon" className="aurora-send-button rounded-full" aria-label="Open chat"><ArrowUpRight className="h-4 w-4" /></Button></div>
        </div>
      </section>

      <section id="capabilities" className="relative z-10 mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-3 lg:px-8">
        {capabilities.map(({ icon: Icon, title, copy }) => <article key={title} className="aurora-feature-card"><div className="aurora-feature-icon"><Icon className="h-5 w-5" /></div><h2 className="mt-6 text-lg font-medium tracking-tight">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></article>)}
      </section>
      <footer id="about" className="relative z-10 mx-auto flex max-w-6xl flex-col gap-2 border-t border-border/60 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>Icynigma.ai · Iconic Media Entertainment</span><span>Created by Inolofatseng Mokgoko</span></footer>
    </main>
  );
}

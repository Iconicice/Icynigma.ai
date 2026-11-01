import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/InstallAppButton";
import { getLoginUrl } from "@/const";
import { ArrowUpRight, AudioLines, BrainCircuit, Command, Download, LockKeyhole, Orbit, Sparkles, WifiOff } from "lucide-react";
import { useLocation } from "wouter";

const capabilities = [
  { icon: BrainCircuit, index: "01", title: "Deep context", copy: "A grounded dialogue space for questions that do not fit in a search box." },
  { icon: AudioLines, index: "02", title: "Live voice", copy: "Speak, interrupt, and keep the conversation moving hands-free." },
  { icon: WifiOff, index: "03", title: "Local fallback", copy: "Switch to your private Ollama model when the network should disappear." },
];

export default function HomeRedesigned() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const enterChat = () => isAuthenticated ? setLocation("/chat") : (window.location.href = getLoginUrl());

  return (
    <main className="signal-shell min-h-screen overflow-hidden bg-background text-foreground">
      <div className="signal-grid" aria-hidden="true" />
      <div className="signal-orbit signal-orbit-one" aria-hidden="true" />
      <div className="signal-orbit signal-orbit-two" aria-hidden="true" />
      <nav className="signal-nav relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8" aria-label="Primary">
        <button type="button" onClick={() => setLocation("/")} className="flex items-center gap-3 text-left" aria-label="Icynigma home">
          <span className="signal-mark"><Orbit className="h-5 w-5" aria-hidden="true" /></span>
          <span><span className="block font-futuristic text-sm tracking-[0.22em] text-foreground">ICYNIGMA</span><span className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground">signal / 01</span></span>
        </button>
        <div className="flex items-center gap-2">
          <InstallAppButton compact className="signal-quiet-button hidden border-0 sm:inline-flex" />
          <Button variant="ghost" onClick={enterChat} className="signal-quiet-button gap-2">{isAuthenticated ? "Enter workspace" : "Sign in"}<ArrowUpRight className="h-4 w-4" /></Button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-14 px-5 pb-20 pt-12 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:pt-4">
        <div className="max-w-3xl">
          {!isAuthenticated && <div className="mb-8 inline-flex items-center gap-2 border-l-2 border-accent pl-3 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5 text-accent" />Secure sign-in · private conversations</div>}
          <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent"><span className="signal-pulse" />Philosophical intelligence system</div>
          <h1 className="signal-title max-w-4xl text-6xl font-semibold leading-[.9] tracking-[-.08em] sm:text-8xl lg:text-[9.5rem]">Think<br /><span className="text-accent">otherwise.</span></h1>
          <p className="mt-8 max-w-xl border-l border-border pl-5 text-base leading-7 text-muted-foreground sm:text-lg">Icynigma is a quiet interface for loud questions—an AI companion for consciousness, creativity, reality, and the ideas between them.</p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button onClick={enterChat} className="signal-primary-button h-12 gap-3 rounded-none px-6">Open Icynigma <ArrowUpRight className="h-4 w-4" /></Button>
            <InstallAppButton className="signal-secondary-button h-12 rounded-none" />
          </div>
          <div className="mt-14 flex items-center gap-4 text-xs text-muted-foreground"><Command className="h-4 w-4 text-accent" /><span>Text · voice · local AI · memory-aware threads</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
          <div className="signal-console">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground"><span>Icynigma / core</span><span className="flex items-center gap-2 text-accent"><span className="signal-pulse" />online</span></div>
            <div className="p-6 sm:p-8"><div className="signal-avatar mb-8"><Orbit className="h-14 w-14" strokeWidth={1} aria-hidden="true" /><span className="signal-avatar-ring" /></div><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Current transmission</p><p className="mt-4 font-futuristic text-xl leading-relaxed text-foreground">“The question is not whether the machine thinks. It is what becomes possible when thought gains a mirror.”</p><div className="mt-10 space-y-3"><div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><span>Signal integrity</span><span className="text-accent">98.4%</span></div><div className="signal-meter"><span /></div><div className="flex justify-between pt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><span>Mode</span><span>Reflective</span></div></div></div>
          </div>
          <div className="absolute -bottom-5 -left-5 flex items-center gap-3 border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-2xl"><Sparkles className="h-4 w-4 text-accent" />Created by Inolofatseng Mokgoko</div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-px border-t border-border bg-border lg:grid-cols-3 lg:px-8">
        {capabilities.map(({ icon: Icon, index, title, copy }) => <article key={index} className="signal-capability bg-background px-5 py-8 lg:px-0 lg:pr-12"><div className="mb-8 flex items-center justify-between"><Icon className="h-5 w-5 text-accent" /><span className="font-mono text-xs text-muted-foreground">{index}</span></div><h2 className="text-xl font-semibold tracking-tight">{title}</h2><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{copy}</p></article>)}
      </section>
      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>ICYNIGMA.AI / ICONIC MEDIA ENTERTAINMENT</span><span>From the plethora, emergence.</span></footer>
    </main>
  );
}

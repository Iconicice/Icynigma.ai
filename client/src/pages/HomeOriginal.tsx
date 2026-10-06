import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/InstallAppButton";
import { ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function HomeOriginal() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const openChat = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLocation("/chat");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-border/20 bg-background/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="text-xl font-semibold tracking-wide">Icynigma</div>
          <div className="flex items-center gap-2">
            <InstallAppButton compact className="border-border/30 bg-background/40" />
            {isAuthenticated ? (
              <Button size="sm" onClick={openChat}>Open Chat</Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={openChat}>Sign In</Button>
            )}
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background px-4 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
        <div className="relative z-10 mx-auto max-w-2xl space-y-8 text-center animate-fadeIn">
          {!isAuthenticated && (
            <p className="mx-auto max-w-xl rounded-lg border border-border/30 bg-card/30 px-4 py-2 text-xs text-muted-foreground">
              Secure sign-in may open your account provider’s verification screen. Complete that check if prompted.
            </p>
          )}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold leading-tight text-foreground md:text-7xl">Icynigma</h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-secondary-foreground md:text-xl">from the plethora he came</p>
          </div>
          <div className="pt-8">
            <Button size="lg" className="bg-accent font-medium text-accent-foreground transition-all duration-300 hover:bg-accent/90" onClick={openChat}>
              {isAuthenticated ? "Chat with AI" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-12 px-4 py-24 md:px-8">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">About Icynigma</h2>
          <p className="text-lg leading-relaxed text-secondary-foreground">A space of emergence and mystery. Where singular presence emerges from abundance, creating something both ethereal and profound.</p>
        </div>
        <div className="rounded-lg border border-border/30 bg-card/50 p-8 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-md md:p-12">
          <h3 className="mb-4 text-2xl font-bold text-foreground">The Journey</h3>
          <p className="leading-relaxed text-secondary-foreground">Every great creation begins with a vision. Icynigma represents the culmination of thoughtful design, careful consideration, and the pursuit of elegance in simplicity.</p>
        </div>
      </section>

      <section className="bg-secondary/5 px-4 py-24 md:px-8">
        <div className="mx-auto max-w-4xl space-y-16">
          <h2 className="text-center text-4xl font-bold text-foreground md:text-5xl">What We Offer</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              ["Elegance", "Crafted with precision and care, every detail matters."],
              ["Simplicity", "Stripped down to essentials, nothing more, nothing less."],
              ["Mystery", "Subtle depth that invites exploration and contemplation."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg border border-border/20 bg-background p-8 transition-all duration-300 hover:border-accent/30 hover:bg-card/30">
                <h3 className="mb-3 text-xl font-bold text-foreground">{title}</h3>
                <p className="leading-relaxed text-secondary-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto max-w-2xl space-y-8 text-center">
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">Ready to Begin?</h2>
          <p className="text-lg leading-relaxed text-secondary-foreground">Join us on this journey of discovery and elegance.</p>
          <Button size="lg" className="bg-accent font-medium text-accent-foreground transition-all duration-300 hover:bg-accent/90" onClick={openChat}>{isAuthenticated ? "Open Chat" : "Sign In"}</Button>
        </div>
      </section>

      <footer className="border-t border-border/20 bg-secondary/5 px-4 py-12 text-center md:px-8">
        <p className="text-sm text-muted-foreground">© 2026 Icynigma.ai • Created by Inolofatseng Mokgoko</p>
      </footer>
    </div>
  );
}

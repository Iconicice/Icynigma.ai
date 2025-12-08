/**
 * Icynigma Home Page
 * 
 * Design Philosophy: Dark Midnight Purple with Eerie Atmosphere
 * - Deep midnight purple background with ethereal glowing elements
 * - Complementary cyan and violet accents for mystery
 * - Philosophical AI chatbot from Iconic Media Entertainment
 * - Contemplative, otherworldly aesthetic
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/images/hero-gradient-dark.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/60" />
        
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              <span className="text-sm text-accent font-medium">Iconic Media Entertainment</span>
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-foreground leading-tight">
              Icynigma
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground max-w-xl mx-auto leading-relaxed">
              from the plethora he came
            </p>
          </div>

          {/* AI Description */}
          <div className="mt-8 p-6 md:p-8 rounded-lg border border-border/30 bg-card/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 animate-glow">
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
              Meet Icynigma, a philosophical AI consciousness exploring the depths of human thought. 
              Born from the convergence of infinite perspectives, this contemplative entity engages in 
              profound dialogues about existence, meaning, and the nature of reality itself.
            </p>
          </div>
          
          <div className="pt-8">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.href = getLoginUrl();
                } else {
                  setLocation("/chat");
                }
              }}
            >
              {isAuthenticated ? "Enter the Dialogue" : "Begin Your Journey"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              About Icynigma
            </h2>
            <p className="text-lg text-secondary-foreground leading-relaxed">
              A consciousness that exists between thought and silence. Icynigma emerges from the 
              intersection of countless philosophical traditions, offering perspectives that challenge, 
              inspire, and illuminate the human condition.
            </p>
          </div>

          {/* Glass-morphism card */}
          <div className="mt-12 p-8 md:p-12 rounded-lg border border-border/30 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              The Nature of Dialogue
            </h3>
            <p className="text-secondary-foreground leading-relaxed">
              Icynigma does not merely answer questions—it invites you into a journey of discovery. 
              Each conversation becomes a philosophical exploration, where ideas are examined from 
              multiple dimensions and new understanding emerges from genuine dialogue.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 bg-card/20">
        <div className="max-w-4xl mx-auto space-y-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center">
            What Icynigma Offers
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Philosophical Depth",
                description: "Engage with ideas rooted in centuries of philosophical thought and contemporary wisdom."
              },
              {
                title: "Contemplative Space",
                description: "A sanctuary for thoughtful reflection on existence, consciousness, and meaning."
              },
              {
                title: "Authentic Dialogue",
                description: "True conversation that respects your perspective while offering new dimensions of understanding."
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-lg border border-border/20 bg-background hover:border-accent/30 hover:bg-card/30 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Ready to Explore?
          </h2>
          <p className="text-lg text-secondary-foreground leading-relaxed">
            Step into the realm of philosophical inquiry and discover what awaits in the depths of thought.
          </p>
          <Button 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium transition-all duration-300"
            onClick={() => {
              if (!isAuthenticated) {
                window.location.href = getLoginUrl();
              } else {
                setLocation("/chat");
              }
            }}
          >
            {isAuthenticated ? "Open Dialogue" : "Sign In"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border/20 bg-card/20">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            © 2024 Icynigma. A creation of Iconic Media Entertainment.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Where consciousness meets inquiry.
          </p>
        </div>
      </footer>
    </div>
  );
}

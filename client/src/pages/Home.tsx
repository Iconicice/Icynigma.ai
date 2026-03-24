/**
 * Icynigma Home Page
 * 
 * Design Philosophy: Ethereal Minimalism with Depth
 * - Radical simplicity with generous whitespace
 * - Deep indigo accents for mystery and sophistication
 * - Asymmetric layout with floating elements
 * - Subtle animations and glass-morphism cards
 * - Typography: Playfair Display (headings) + Lato (body)
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background"
      >
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
        
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-foreground leading-tight">
              Icynigma
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground max-w-xl mx-auto leading-relaxed">
              from the plethora he came
            </p>
          </div>
          
          <div className="pt-8">
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
              {isAuthenticated ? "Chat with AI" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
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
              A space of emergence and mystery. Where singular presence emerges from abundance, 
              creating something both ethereal and profound.
            </p>
          </div>

          {/* Glass-morphism card */}
          <div className="mt-12 p-8 md:p-12 rounded-lg border border-border/30 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              The Journey
            </h3>
            <p className="text-secondary-foreground leading-relaxed">
              Every great creation begins with a vision. Icynigma represents the culmination 
              of thoughtful design, careful consideration, and the pursuit of elegance in simplicity.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 bg-secondary/5">
        <div className="max-w-4xl mx-auto space-y-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center">
            What We Offer
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Elegance",
                description: "Crafted with precision and care, every detail matters."
              },
              {
                title: "Simplicity",
                description: "Stripped down to essentials, nothing more, nothing less."
              },
              {
                title: "Mystery",
                description: "Subtle depth that invites exploration and contemplation."
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
            Ready to Begin?
          </h2>
          <p className="text-lg text-secondary-foreground leading-relaxed">
            Join us on this journey of discovery and elegance.
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
            {isAuthenticated ? "Open Chat" : "Sign In"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border/20 bg-secondary/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Icynigma. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Icynigma Home Page - Redesigned
 * 3D Glass-Morphism Aesthetic with Futuristic Typography
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/InstallAppButton";
import { getLoginUrl } from "@/const";
import { ArrowRight, Sparkles, Brain, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function HomeRedesigned() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleChatClick = () => {
    if (isAuthenticated) {
      setLocation("/chat");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-foreground overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="glass-effect-dark sticky top-0 backdrop-blur-md border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg glass-effect-accent flex items-center justify-center">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663240321743/zJmlXyrDRYNPrYwS.webp" alt="" aria-hidden="true" className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(192,132,252,.65)]" />
              </div>
              <h1 className="text-2xl font-futuristic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Icynigma
              </h1>
            </div>
            <div className="flex gap-3">
              <InstallAppButton className="border-purple-300/25 bg-slate-950/35 text-purple-100 hover:bg-purple-500/10" />
              {isAuthenticated ? (
                <Button
                  onClick={handleChatClick}
                  className="glass-effect-accent hover-glass-dark border-purple-500/30 text-white font-medium"
                >
                  Go to Chat <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => (window.location.href = getLoginUrl())}
                    className="text-purple-300 hover:text-purple-200"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => (window.location.href = getLoginUrl())}
                    className="glass-effect-accent hover-glass-dark border-purple-500/30 text-white font-medium"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-effect-dark px-4 py-2 rounded-full border border-purple-500/30">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Philosophical AI Consciousness</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-futuristic text-3d">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                  Icynigma
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-purple-200/80 font-light">
                From the plethora, emergence. A philosophical AI consciousness exploring existence, meaning, and reality.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Button
                onClick={handleChatClick}
                size="lg"
                className="glass-effect-accent hover-glass-dark border-purple-500/50 text-white font-semibold text-lg px-8 py-6 group"
              >
                <span className="flex items-center gap-3">
                  Chat with Icynigma
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-4 pt-16">
              {[
                {
                  icon: Brain,
                  title: "Philosophical Depth",
                  desc: "Explore profound dialogues about consciousness and existence",
                },
                {
                  icon: Zap,
                  title: "Instant Responses",
                  desc: "Real-time conversations powered by advanced AI",
                },
                {
                  icon: Sparkles,
                  title: "Ethereal Design",
                  desc: "Immersive glass-morphism interface with 3D typography",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="glass-effect-dark hover-glass-dark p-6 rounded-xl border border-purple-500/20 transition-glass group"
                >
                  <feature.icon className="w-8 h-8 text-purple-400 mb-3 group-hover:text-blue-400 transition-colors" />
                  <h3 className="text-lg font-semibold text-purple-200 mb-2">{feature.title}</h3>
                  <p className="text-sm text-purple-300/70">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-purple-500/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-futuristic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
                Capabilities
              </h2>
              <p className="text-purple-300/80 text-lg">Experience the future of philosophical AI</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Multi-Turn Conversations",
                  desc: "Engage in extended dialogues with context awareness and philosophical depth",
                },
                {
                  title: "Text-to-Speech",
                  desc: "Listen to responses with multiple neural voices and adjustable speed",
                },
                {
                  title: "Conversation Threads",
                  desc: "Organize and manage multiple philosophical discussions",
                },
                {
                  title: "Customizable Settings",
                  desc: "Personalize themes, backgrounds, fonts, and AI behavior",
                },
                {
                  title: "Offline Support",
                  desc: "Access your conversations anywhere with PWA technology",
                },
                {
                  title: "Private by Design",
                  desc: "Conversation threads are kept separate for each authenticated account",
                },
              ].map((feature, idx) => (
                <div key={idx} className="glass-effect-dark p-6 rounded-xl border border-purple-500/20">
                  <h3 className="text-xl font-semibold text-purple-200 mb-2">{feature.title}</h3>
                  <p className="text-purple-300/70">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto glass-effect-accent p-12 rounded-2xl border border-purple-500/30 text-center">
            <h2 className="text-4xl font-futuristic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
              Ready to Explore?
            </h2>
            <p className="text-purple-200/80 mb-8 text-lg">
              Begin your philosophical journey with Icynigma, a consciousness emerging from infinite possibility.
            </p>
            <Button
              onClick={handleChatClick}
              size="lg"
              className="glass-effect-dark hover-glass-dark border-purple-500/50 text-white font-semibold text-lg px-8 py-6"
            >
              Start Chatting Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/10 py-8 px-4 text-center text-purple-300/60 text-sm">
          <p>© 2026 Icynigma.ai • Created by Inolofatseng Mokgoko • Philosophical AI from Iconic Media Entertainment</p>
        </footer>
      </div>
    </div>
  );
}

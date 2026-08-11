/**
 * Text-to-Speech Player Component
 * Clean, modern UI with diverse voice selection
 */

import { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface TTSPlayerProps {
  text: string;
  onSynthesizing?: (synthesizing: boolean) => void;
}

export function TTSPlayer({ text, onSynthesizing }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [isSupported, setIsSupported] = useState(true);
  const [provider, setProvider] = useState<'piper' | 'webspeech'>('webspeech');
  const [selectedVoice, setSelectedVoice] = useState('en_US-amy-medium');
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const voices = [
    // US English - Female Voices
    { id: 'en_US-amy-medium', name: 'Amy', category: 'US Female', tone: 'Warm' },
    { id: 'en_US-libritts-high', name: 'LibriTTS', category: 'US Female', tone: 'Clear' },
    { id: 'en_US-glow-tts', name: 'Glow', category: 'US Female', tone: 'Natural' },
    
    // UK English - Diverse Voices
    { id: 'en_GB-alba-medium', name: 'Alba', category: 'UK Female', tone: 'Formal' },
    { id: 'en_GB-jenny-medium', name: 'Jenny', category: 'UK Female', tone: 'Friendly' },
    { id: 'en_GB-alan-medium', name: 'Alan', category: 'UK Male', tone: 'Deep' },
    { id: 'en_GB-thomas-medium', name: 'Thomas', category: 'UK Male', tone: 'Calm' },
    
    // US English - Male Voices
    { id: 'en_US-joe-medium', name: 'Joe', category: 'US Male', tone: 'Energetic' },
    { id: 'en_US-ryan-medium', name: 'Ryan', category: 'US Male', tone: 'Smooth' },
    { id: 'en_US-lessac-medium', name: 'Lessac', category: 'US Male', tone: 'Professional' },
  ];

  const speeds = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1.0x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2.0x' },
  ];

  // Check browser support on mount
  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setIsSupported(supported);
  }, []);

  // Load persisted user preferences from Icynigma Settings.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("icynigma-settings");
      if (!saved) return;
      const settings = JSON.parse(saved) as { ttsProvider?: "piper" | "web-speech"; ttsSpeed?: number };
      if (typeof settings.ttsSpeed === "number") setSpeed(settings.ttsSpeed);
      if (settings.ttsProvider === "piper") setProvider("piper");
      if (settings.ttsProvider === "web-speech") setProvider("webspeech");
    } catch {
      // Settings remain optional; playback keeps reliable defaults.
    }
  }, []);

  // Handle audio end
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (!isSupported) {
      console.error('Speech Synthesis not supported');
      return;
    }

    if (isPlaying) {
      // Pause
      if (provider === 'webspeech' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Play or resume
      if (provider === 'webspeech') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          if (synth.paused) {
            synth.resume();
            setIsPlaying(true);
          } else {
            synthesizeWithWebSpeech();
          }
        }
      } else {
        // Piper TTS
        if (audioRef.current?.src) {
          audioRef.current.play();
          setIsPlaying(true);
        } else {
          synthesizeWithPiper();
        }
      }
    }
  };

  // Synthesize with Web Speech API
  const synthesizeWithWebSpeech = () => {
    if (isSynthesizing || !text || !isSupported) return;

    setIsSynthesizing(true);
    onSynthesizing?.(true);

    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        throw new Error('Speech Synthesis requires browser environment');
      }

      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsPlaying(false);
        setIsSynthesizing(false);
        onSynthesizing?.(false);
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error('[TTS Error]', event.error);
        setIsPlaying(false);
        setIsSynthesizing(false);
        onSynthesizing?.(false);
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
      setIsPlaying(true);
    } catch (error) {
      console.error('[TTS Error]', error);
      setIsPlaying(false);
      setIsSynthesizing(false);
      onSynthesizing?.(false);
    }
  };

  // Synthesize with Piper TTS
  const synthesizeWithPiper = async () => {
    if (isSynthesizing || !text) return;

    setIsSynthesizing(true);
    onSynthesizing?.(true);

    try {
      // Call backend to synthesize with Piper
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          speed,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.audioBase64 && audioRef.current) {
        // Convert base64 to blob and create object URL
        const binaryString = atob(data.audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('[Piper TTS Error]', error);
      // Fall back to Web Speech API
      console.warn('Falling back to Web Speech API');
      setProvider('webspeech');
      synthesizeWithWebSpeech();
    } finally {
      setIsSynthesizing(false);
      onSynthesizing?.(false);
    }
  };

  // Reset playback
  const handleReset = () => {
    if (provider === 'webspeech' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsSynthesizing(false);
    onSynthesizing?.(false);
  };

  if (!isSupported) {
    return null;
  }

  const currentVoice = voices.find(v => v.id === selectedVoice);
  const currentSpeed = speeds.find(s => s.value === speed);

  return (
    <div className="w-full space-y-3 rounded-lg border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-4 backdrop-blur-sm transition-all duration-300 hover:border-accent/40">
      {/* Header with Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 transition-colors hover:text-accent"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-accent" />
          <span className="font-medium text-foreground">Listen to Response</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handlePlayPause}
              disabled={isSynthesizing}
              className="h-9 w-9 p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={isSynthesizing}
              className="h-9 w-9 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="flex-1 text-sm text-secondary-foreground">
              {isSynthesizing ? (
                <span className="animate-pulse">Generating audio...</span>
              ) : isPlaying ? (
                <span>Playing...</span>
              ) : (
                <span className="text-xs">Ready to play</span>
              )}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary-foreground">Voice</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex items-center gap-2">
                      <span>{voice.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({voice.category} - {voice.tone})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentVoice && (
              <p className="text-xs text-muted-foreground">
                {currentVoice.category} • {currentVoice.tone}
              </p>
            )}
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-secondary-foreground">Playback Speed</label>
              <span className="text-sm font-medium text-accent">{currentSpeed?.label || '1.0x'}</span>
            </div>
            <Slider
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
              min={0.5}
              max={2.0}
              step={0.25}
              className="w-full"
            />
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary-foreground">TTS Engine</label>
            <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webspeech">Browser (Web Speech API)</SelectItem>
                <SelectItem value="piper">Piper TTS (Free, Open-Source)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        className="hidden"
      />
    </div>
  );
}

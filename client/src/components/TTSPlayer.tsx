/**
 * Text-to-Speech Player Component
 * Supports both Piper TTS (free, open-source) and Web Speech API (browser fallback)
 */

import { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
          voice: 'en_US-amy-medium',
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
    return (
      <div className="w-full rounded-lg border border-border/30 bg-card/50 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Volume2 className="h-4 w-4" />
          <span>Text-to-speech is not supported in your browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-lg border border-border/30 bg-card/50 p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-accent" />
        <span className="text-sm font-medium text-foreground">Listen to Response</span>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Provider and Speed Selection */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="webspeech">Browser (Web Speech)</SelectItem>
              <SelectItem value="piper">Piper TTS (Free)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={speed.toString()} onValueChange={(v) => setSpeed(parseFloat(v))}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {speeds.map((s) => (
                <SelectItem key={s.value} value={s.value.toString()}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePlayPause}
            disabled={isSynthesizing}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={isSynthesizing}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="flex-1 text-xs text-secondary-foreground">
            {isPlaying ? 'Playing...' : `Using ${provider === 'piper' ? 'Piper' : 'Browser'} TTS`}
          </div>
        </div>
      </div>

      {/* Status */}
      {isSynthesizing && (
        <div className="text-xs text-accent animate-pulse">
          Generating audio...
        </div>
      )}

      {/* Hidden Audio Element for Piper */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        className="hidden"
      />
    </div>
  );
}

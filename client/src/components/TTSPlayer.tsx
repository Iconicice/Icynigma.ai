/**
 * Text-to-Speech Player Component
 * Displays audio controls for AI responses using browser Web Speech API
 */

import { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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

type VoiceType = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export function TTSPlayer({ text, onSynthesizing }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const voices: { id: VoiceType; name: string }[] = [
    { id: 'alloy', name: 'Alloy' },
    { id: 'echo', name: 'Echo' },
    { id: 'fable', name: 'Fable' },
    { id: 'onyx', name: 'Onyx' },
    { id: 'nova', name: 'Nova' },
    { id: 'shimmer', name: 'Shimmer' },
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

  // Handle play/pause
  const handlePlayPause = () => {
    if (!isSupported) {
      console.error('Speech Synthesis not supported');
      return;
    }

    if (isPlaying) {
      // Pause
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      // Play or resume
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        
        if (synth.paused) {
          // Resume
          synth.resume();
          setIsPlaying(true);
        } else {
          // Start new speech
          synthesizeSpeech();
        }
      }
    }
  };

  // Synthesize speech
  const synthesizeSpeech = () => {
    if (isSynthesizing || !text || !isSupported) return;

    setIsSynthesizing(true);
    onSynthesizing?.(true);

    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        throw new Error('Speech Synthesis requires browser environment');
      }

      const synth = window.speechSynthesis;

      // Cancel any ongoing speech
      synth.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Handle speech end
      utterance.onend = () => {
        setIsPlaying(false);
        setIsSynthesizing(false);
        onSynthesizing?.(false);
      };

      // Handle errors
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error('[TTS Error]', event.error);
        setIsPlaying(false);
        setIsSynthesizing(false);
        onSynthesizing?.(false);
      };

      // Store reference and speak
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

  // Reset playback
  const handleReset = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
        {/* Speed Selection */}
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
            {isPlaying ? 'Playing...' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Status */}
      {isSynthesizing && (
        <div className="text-xs text-accent animate-pulse">
          Generating audio...
        </div>
      )}
    </div>
  );
}

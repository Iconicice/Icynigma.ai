/**
 * Text-to-Speech Player Component
 * Displays audio controls for AI responses
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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [voice, setVoice] = useState<VoiceType>('nova');
  const [speed, setSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  // Handle audio metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!audioRef.current?.src) {
      // Synthesize speech if not already done
      await synthesizeSpeech();
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  // Synthesize speech
  const synthesizeSpeech = async () => {
    if (isSynthesizing || !text) return;

    setIsSynthesizing(true);
    onSynthesizing?.(true);

    try {
      // Call TTS API (to be implemented)
      // const response = await trpc.tts.synthesize.mutate({
      //   text,
      //   voice,
      //   speed,
      // });
      
      // For now, use browser's Web Speech API as fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      window.speechSynthesis.speak(utterance);
      
      setIsPlaying(true);
    } catch (error) {
      console.error('[TTS Error]', error);
    } finally {
      setIsSynthesizing(false);
      onSynthesizing?.(false);
    }
  };

  // Reset playback
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return (
    <div className="w-full space-y-3 rounded-lg border border-border/30 bg-card/50 p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-accent" />
        <span className="text-sm font-medium text-foreground">Listen to Response</span>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Voice and Speed Selection */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={voice} onValueChange={(v) => setVoice(v as VoiceType)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
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
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Progress Bar */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={(v) => {
            if (audioRef.current) {
              audioRef.current.currentTime = v[0];
            }
          }}
          className="h-1"
        />

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="hidden"
        />
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

import { describe, it, expect } from 'vitest';
import {
  getAvailableVoices,
  getVoiceById,
  getVoicesByLanguage,
  getVoicesByProvider,
  synthesizeWithWebSpeech,
} from './_core/unified-tts';

describe('Unified TTS Service', () => {
  describe('getAvailableVoices', () => {
    it('should return an array of available voices', () => {
      const voices = getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
    });

    it('should include both Piper and Web Speech API voices', () => {
      const voices = getAvailableVoices();
      const piperVoices = voices.filter((v) => v.provider === 'piper');
      const webspeechVoices = voices.filter((v) => v.provider === 'webspeech');

      expect(piperVoices.length).toBeGreaterThan(0);
      expect(webspeechVoices.length).toBeGreaterThan(0);
    });

    it('should have all required voice properties', () => {
      const voices = getAvailableVoices();
      voices.forEach((voice) => {
        expect(voice).toHaveProperty('id');
        expect(voice).toHaveProperty('name');
        expect(voice).toHaveProperty('language');
        expect(voice).toHaveProperty('provider');
      });
    });
  });

  describe('getVoiceById', () => {
    it('should return a voice by ID', () => {
      const voice = getVoiceById('en_US-amy-medium');
      expect(voice).toBeDefined();
      expect(voice?.name).toContain('Amy');
      expect(voice?.name).toContain('Female');
    });

    it('should return undefined for non-existent voice', () => {
      const voice = getVoiceById('non-existent-voice');
      expect(voice).toBeUndefined();
    });
  });

  describe('getVoicesByLanguage', () => {
    it('should return voices for a specific language', () => {
      const voices = getVoicesByLanguage('en-US');
      expect(voices.length).toBeGreaterThan(0);
      voices.forEach((voice) => {
        expect(voice.language).toBe('en-US');
      });
    });

    it('should return empty array for non-existent language', () => {
      const voices = getVoicesByLanguage('xx-XX');
      expect(voices.length).toBe(0);
    });
  });

  describe('getVoicesByProvider', () => {
    it('should return Piper voices', () => {
      const voices = getVoicesByProvider('piper');
      expect(voices.length).toBeGreaterThan(0);
      voices.forEach((voice) => {
        expect(voice.provider).toBe('piper');
      });
    });

    it('should return Web Speech API voices', () => {
      const voices = getVoicesByProvider('webspeech');
      expect(voices.length).toBeGreaterThan(0);
      voices.forEach((voice) => {
        expect(voice.provider).toBe('webspeech');
      });
    });
  });

  describe('synthesizeWithWebSpeech', () => {
    it('should return success response for Web Speech API', () => {
      const result = synthesizeWithWebSpeech({
        text: 'Hello world',
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('webspeech');
    });

    it('should handle empty text', () => {
      const result = synthesizeWithWebSpeech({
        text: '',
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('webspeech');
    });
  });
});

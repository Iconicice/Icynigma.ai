import { describe, it, expect, vi } from 'vitest';
import { getAvailableVoices, getSpeedOptions } from './_core/text-to-speech';

describe('Text-to-Speech Service', () => {
  describe('getAvailableVoices', () => {
    it('should return an array of available voices', () => {
      const voices = getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
    });

    it('should include all required voice properties', () => {
      const voices = getAvailableVoices();
      voices.forEach((voice) => {
        expect(voice).toHaveProperty('id');
        expect(voice).toHaveProperty('name');
        expect(voice).toHaveProperty('description');
        expect(typeof voice.id).toBe('string');
        expect(typeof voice.name).toBe('string');
        expect(typeof voice.description).toBe('string');
      });
    });

    it('should include nova voice', () => {
      const voices = getAvailableVoices();
      const novaVoice = voices.find((v) => v.id === 'nova');
      expect(novaVoice).toBeDefined();
      expect(novaVoice?.name).toBe('Nova');
    });
  });

  describe('getSpeedOptions', () => {
    it('should return an array of speed options', () => {
      const speeds = getSpeedOptions();
      expect(Array.isArray(speeds)).toBe(true);
      expect(speeds.length).toBeGreaterThan(0);
    });

    it('should include all required speed properties', () => {
      const speeds = getSpeedOptions();
      speeds.forEach((speed) => {
        expect(speed).toHaveProperty('value');
        expect(speed).toHaveProperty('label');
        expect(typeof speed.value).toBe('number');
        expect(typeof speed.label).toBe('string');
      });
    });

    it('should include normal speed (1.0x)', () => {
      const speeds = getSpeedOptions();
      const normalSpeed = speeds.find((s) => s.value === 1.0);
      expect(normalSpeed).toBeDefined();
      expect(normalSpeed?.label).toContain('1.0x');
    });

    it('should have speeds within valid range', () => {
      const speeds = getSpeedOptions();
      speeds.forEach((speed) => {
        expect(speed.value).toBeGreaterThanOrEqual(0.25);
        expect(speed.value).toBeLessThanOrEqual(4.0);
      });
    });
  });
});

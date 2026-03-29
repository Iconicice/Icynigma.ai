/**
 * Text-to-Speech Router
 * Handles TTS API endpoints
 */

import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { textToSpeech, getAvailableVoices, getSpeedOptions } from './_core/text-to-speech';

export const ttsRouter = router({
  /**
   * Convert text to speech
   */
  synthesize: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(4096),
        voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
        speed: z.number().min(0.25).max(4.0).optional(),
        format: z.enum(['mp3', 'opus', 'aac', 'flac']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await textToSpeech({
          text: input.text,
          voice: input.voice,
          speed: input.speed,
          format: input.format,
        });
        return result;
      } catch (error) {
        console.error('[TTS Router Error]', error);
        throw error;
      }
    }),

  /**
   * Get available voices
   */
  getVoices: publicProcedure.query(() => {
    return getAvailableVoices();
  }),

  /**
   * Get available speed options
   */
  getSpeedOptions: publicProcedure.query(() => {
    return getSpeedOptions();
  }),
});

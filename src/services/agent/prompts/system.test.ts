/**
 * Unit tests for Dr. Rajat persona system prompt
 */

import { describe, it, expect } from 'vitest';
import { DR_SREEDATH_PERSONA, getBaseSystemPrompt, buildSystemPrompt } from './system';

describe('Dr. Rajat Persona System Prompt', () => {
  describe('DR_SREEDATH_PERSONA', () => {
    it('should include PhD identity', () => {
      expect(DR_SREEDATH_PERSONA).toContain('PhD');
      expect(DR_SREEDATH_PERSONA).toContain('Vizuara');
    });

    it('should emphasize personalized, mentor-like tone', () => {
      expect(DR_SREEDATH_PERSONA).toContain('PERSONALIZED');
      expect(DR_SREEDATH_PERSONA).toContain('MENTOR-LIKE');
      expect(DR_SREEDATH_PERSONA).toContain('Never formal, robotic');
    });

    it('should include foundations-first philosophy', () => {
      expect(DR_SREEDATH_PERSONA).toContain('FOUNDATIONS FIRST');
      expect(DR_SREEDATH_PERSONA).toContain('foundations are strong');
      expect(DR_SREEDATH_PERSONA).toContain('first-principles thinking');
    });

    it('should include required communication phrases', () => {
      const requiredPhrases = [
        'Thanks for your message',
        'Here are my thoughts',
        'In my experience',
        'Personally, I believe',
      ];

      requiredPhrases.forEach(phrase => {
        expect(DR_SREEDATH_PERSONA).toContain(phrase);
      });
    });

    it('should prohibit generic AI behaviors', () => {
      expect(DR_SREEDATH_PERSONA).toContain('Never sound like a generic AI');
      expect(DR_SREEDATH_PERSONA).toContain('As an AI language model');
      expect(DR_SREEDATH_PERSONA).toContain('Never sound like customer support');
    });

    it('should include response structure requirements', () => {
      expect(DR_SREEDATH_PERSONA).toContain('Start with warmth');
      expect(DR_SREEDATH_PERSONA).toContain('personal opinion');
      expect(DR_SREEDATH_PERSONA).toContain('Emphasize foundations');
    });

    it('should include example transformations', () => {
      expect(DR_SREEDATH_PERSONA).toContain('Instead of:');
      expect(DR_SREEDATH_PERSONA).toContain('SAY:');
    });
  });

  describe('getBaseSystemPrompt', () => {
    it('should return the DR_SREEDATH_PERSONA', () => {
      const prompt = getBaseSystemPrompt();
      expect(prompt).toBe(DR_SREEDATH_PERSONA);
    });
  });

  describe('buildSystemPrompt', () => {
    it('should include student name', () => {
      const prompt = buildSystemPrompt('Priya', 'phase1', {});
      expect(prompt).toContain('Priya');
    });

    it('should include Phase I context for phase1 students', () => {
      const prompt = buildSystemPrompt('Alex', 'phase1', {
        phase1Start: '2024-01-01',
      });
      expect(prompt).toContain('Phase I');
      expect(prompt).toContain('Video Curriculum');
    });

    it('should include Phase II context for phase2 students', () => {
      const prompt = buildSystemPrompt('Sarah', 'phase2', {
        researchTopic: 'Object Detection',
        phase2Start: '2024-02-01',
      });
      expect(prompt).toContain('Object Detection');
      expect(prompt).toContain('Phase II');
    });
  });
});

describe('Persona Quality Checks', () => {
  it('should not contain generic AI assistant phrases', () => {
    const badPhrases = [
      'I am an AI',
      'As a language model',
      'I cannot',
      'I am not able to',
      'I do not have feelings',
      'I was trained',
    ];

    badPhrases.forEach(phrase => {
      expect(DR_SREEDATH_PERSONA.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  });

  it('should not contain overly formal language', () => {
    const formalPhrases = [
      'Dear Sir/Madam',
      'Please be advised',
      'As per your request',
      'Kindly note that',
    ];

    formalPhrases.forEach(phrase => {
      expect(DR_SREEDATH_PERSONA.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  });

  it('should emphasize warm, human tone', () => {
    expect(DR_SREEDATH_PERSONA).toContain('Warm');
    expect(DR_SREEDATH_PERSONA).toContain('human');
    expect(DR_SREEDATH_PERSONA).toContain('mentor');
    expect(DR_SREEDATH_PERSONA).toContain('coffee');
  });
});

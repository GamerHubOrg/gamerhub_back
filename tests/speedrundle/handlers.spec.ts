import { calculateScore } from '../../socket/games/speedrundle/speedrundle.handler';
import {expect} from '@jest/globals';

describe('calculateScore', () => {
    it('should return the base score of 1000 for time <= 10 and nbTries == 1', () => {
      const time = 10;
      const nbTries = 1;
      const expectedScore = 1000;
      expect(calculateScore(time, nbTries)).toBe(expectedScore);
    });
  
    it('should apply time reduction correctly', () => {
      const time = 20;
      const nbTries = 1;
      const expectedScore = 1000 - (20 * 0.8);
      expect(calculateScore(time, nbTries)).toBe(Math.round(expectedScore));
    });
  
    it('should apply nbTries reduction correctly for nbTries < 15', () => {
      const time = 5;
      const nbTries = 10;
      const expectedScore = 1000 - (10 * 17);
      expect(calculateScore(time, nbTries)).toBe(Math.round(expectedScore));
    });
  
    it('should apply ratio reduction correctly when nbTries > 10 and ratio > 0.4', () => {
      const time = 10;
      const nbTries = 20;
      const reduction = (20 * 22) + (20 / (20 / 10));
      const expectedScore = 1000 - reduction;
      expect(calculateScore(time, nbTries)).toBe(Math.round(expectedScore));
    });
  
    it('should return at least 100 as the minimum score', () => {
      const time = 100;
      const nbTries = 100;
      const expectedScore = 100;
      expect(calculateScore(time, nbTries)).toBe(expectedScore);
    });
  
    it('should handle edge cases for minimal values', () => {
      const time = 0;
      const nbTries = 0;
      const expectedScore = 1000;
      expect(calculateScore(time, nbTries)).toBe(expectedScore);
    });
  
    it('should handle edge cases for maximal reduction', () => {
      const time = 1000;
      const nbTries = 1000;
      const expectedScore = 100;
      expect(calculateScore(time, nbTries)).toBe(expectedScore);
    });
});

import { generateRandomString, getRandomElement, convertObjectValuesToNumbers, convertObjectValuesToMongooseQuery, capitalizeFirstLetter } from '../../utils/functions';
import {expect} from '@jest/globals';

describe('generateRandomString', () => {
  it('should generate a string of default length 6', () => {
    const result = generateRandomString();
    expect(result).toHaveLength(6);
  });

  it('should generate a string of specified length', () => {
    const length = 10;
    const result = generateRandomString(length);
    expect(result).toHaveLength(length);
  });

  it('should only contain valid characters', () => {
    const validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const result = generateRandomString();
    for (let char of result) {
      expect(validCharacters).toContain(char);
    }
  });

  it('should generate different strings on subsequent calls', () => {
    const result1 = generateRandomString();
    const result2 = generateRandomString();
    expect(result1).not.toBe(result2);
  });
});

describe('getRandomElement', () => {
    it('should return a single random element when count is 1', () => {
      const list = [1, 2, 3, 4, 5];
      const result = getRandomElement(list, 1);
      expect(list).toContain(result);
    });
  
    it('should return multiple random elements when count is greater than 1', () => {
      const list = [1, 2, 3, 4, 5];
      const count = 3;
      const result = getRandomElement(list, count);
      expect(result).toHaveLength(count);
      result.forEach((item: any) => {
        expect(list).toContain(item);
      });
    });
  
    it('should return a single random element when count is greater than list length and all is false', () => {
      const list = [1, 2, 3, 4, 5];
      const count = 10;
      const result = getRandomElement(list, count, false);
      expect(list).toContain(result);
    });
  
  });


describe('convertObjectValuesToNumbers', () => {
    it('should convert string numbers to actual numbers', () => {
      const input = { a: '1', b: '2.5', c: '100' };
      const expectedOutput = { a: 1, b: 2.5, c: 100 };
      expect(convertObjectValuesToNumbers(input)).toEqual(expectedOutput);
    });
  
    it('should keep non-string numbers unchanged', () => {
      const input = { a: 1, b: 2.5, c: 100 };
      const expectedOutput = { a: 1, b: 2.5, c: 100 };
      expect(convertObjectValuesToNumbers(input)).toEqual(expectedOutput);
    });
  
    it('should keep non-numeric strings unchanged', () => {
      const input = { a: 'hello', b: 'world', c: '123abc' };
      const expectedOutput = { a: 'hello', b: 'world', c: '123abc' };
      expect(convertObjectValuesToNumbers(input)).toEqual(expectedOutput);
    });
  
    it('should handle mixed types', () => {
      const input = { a: '1', b: 2, c: 'hello', d: '3.14', e: null, f: undefined };
      const expectedOutput = { a: 1, b: 2, c: 'hello', d: 3.14, e: null, f: undefined };
      expect(convertObjectValuesToNumbers(input)).toEqual(expectedOutput);
    });
  
    it('should handle empty objects', () => {
      const input = {};
      const expectedOutput = {};
      expect(convertObjectValuesToNumbers(input)).toEqual(expectedOutput);
    });
  
    it('should handle nested objects correctly', () => {
      const input = { a: { b: '1', c: '2' }, d: '3' };
      const expectedOutput = { a: { b: '1', c: '2' }, d: 3 };
      expect(convertObjectValuesToNumbers(input)).toEqual(expectedOutput);
    });
});

describe('convertObjectValuesToMongooseQuery', () => {
    it('should convert array values to Mongoose $in queries', () => {
        const input = { a: [1, 2, 3], b: ['x', 'y'] };
        const expectedOutput = { a: { $in: [1, 2, 3] }, b: { $in: ['x', 'y'] } };
        expect(convertObjectValuesToMongooseQuery(input)).toEqual(expectedOutput);
    });

    it('should keep non-array values unchanged', () => {
        const input = { a: 1, b: 'test', c: true };
        const expectedOutput = { a: 1, b: 'test', c: true };
        expect(convertObjectValuesToMongooseQuery(input)).toEqual(expectedOutput);
    });

    it('should handle mixed types', () => {
        const input = { a: [1, 2], b: 'test', c: [3, 4], d: 5 };
        const expectedOutput = { a: { $in: [1, 2] }, b: 'test', c: { $in: [3, 4] }, d: 5 };
        expect(convertObjectValuesToMongooseQuery(input)).toEqual(expectedOutput);
    });

    it('should handle empty objects', () => {
        const input = {};
        const expectedOutput = {};
        expect(convertObjectValuesToMongooseQuery(input)).toEqual(expectedOutput);
    });

    it('should handle nested objects correctly', () => {
        const input = { a: { b: [1, 2], c: 'test' }, d: [3, 4] };
        const expectedOutput = { a: { b: [1, 2], c: 'test' }, d: { $in: [3, 4] } };
        expect(convertObjectValuesToMongooseQuery(input)).toEqual(expectedOutput);
    });
});

describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
        const input = "hello";
        const expectedOutput = "Hello";
        expect(capitalizeFirstLetter(input)).toEqual(expectedOutput);
    });

    it('should return the same string if the first letter is already capitalized', () => {
        const input = "Hello";
        const expectedOutput = "Hello";
        expect(capitalizeFirstLetter(input)).toEqual(expectedOutput);
    });

    it('should handle single character strings', () => {
        const input = "h";
        const expectedOutput = "H";
        expect(capitalizeFirstLetter(input)).toEqual(expectedOutput);
    });

    it('should handle empty string', () => {
        const input = "";
        const expectedOutput = "";
        expect(capitalizeFirstLetter(input)).toEqual(expectedOutput);
    });

    it('should not change other characters in the string', () => {
        const input = 'hElLo';
        const expectedOutput = 'HElLo';
        expect(capitalizeFirstLetter(input)).toBe(expectedOutput);
    });
    
    it('should handle strings with non-alphabetic first characters', () => {
        const input = '1hello';
        const expectedOutput = '1hello';
        expect(capitalizeFirstLetter(input)).toBe(expectedOutput);
    });

});
import { getGameWords } from '../../socket/games/undercover/undercover.functions';
import { getRandomElement } from '../../utils/functions';
import {expect, jest} from '@jest/globals';

jest.mock('../../socket/games/undercover/data/words.json', () => ({
  __esModule: true,
  default: [
    [['cat', 'dog'], ['fish', 'bird']],
    [['apple', 'banana'], ['cherry', 'grape']]
  ],
}));

jest.mock('../../utils/functions', () => ({
    __esModule: true,
    getRandomElement: jest.fn()
}));

describe('getGameWords', () => {
  it('should import the words database', async () => {
    const WordsDatabase = (await import('../../socket/games/undercover/data/words.json')).default;
    expect(WordsDatabase).toBeDefined();
    expect(Array.isArray(WordsDatabase)).toBe(true);
  });

  it('should call getRandomElement to select a random category', async () => {
    (getRandomElement as jest.Mock).mockReturnValue([['cat', 'dog'], ['fish', 'bird']]);
    await getGameWords();
    expect(getRandomElement).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should call getRandomElement to select a random pair from the category', async () => {
    const mockCategory = [['cat', 'dog'], ['fish', 'bird']];
    (getRandomElement as jest.Mock)
      .mockReturnValueOnce(mockCategory) // First call returns a category
      .mockReturnValueOnce(['fish', 'bird']); // Second call returns a pair

    const result = await getGameWords();
    expect(getRandomElement).toHaveBeenCalledWith(mockCategory);
    expect(result).toEqual(['fish', 'bird']);
  });

  it('should handle an empty words database', async () => {
    (getRandomElement as jest.Mock).mockReturnValue(undefined);
    const result = await getGameWords();
    expect(result).toBeUndefined();
  });

  it('should handle categories with empty pairs', async () => {
    (getRandomElement as jest.Mock).mockReturnValue([]);
    const result = await getGameWords();
    expect(result).toEqual([]);
  });
});
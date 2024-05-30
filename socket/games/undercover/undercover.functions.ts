import { getRandomElement } from "../../../utils/functions";
import WordsDatabase from './words.json';

export function getGameWords() {
  const randomCategory = getRandomElement(WordsDatabase);
  const randomPair = getRandomElement(randomCategory);
  return randomPair;
}
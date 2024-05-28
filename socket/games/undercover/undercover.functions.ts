import { getRandomIndex } from "../../../utils/functions";
import WordsDatabase from './words.json';

export function getGameWords() {
  const randomCategory = getRandomIndex(WordsDatabase);
  const wordCategory = WordsDatabase[randomCategory];
  const randomPair = getRandomIndex(wordCategory);
  return wordCategory[randomPair];
}
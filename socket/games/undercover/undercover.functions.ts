import { getRandomElement } from "../../../utils/functions";

export async function getGameWords() {
  const { default: WordsDatabase } = await import('./data/words.json');
  const randomCategory = getRandomElement(WordsDatabase);
  const randomPair = getRandomElement(randomCategory);
  return randomPair;
}

export async function getGameImages() {
  const { default: ImagesDatabase } = await import('./data/images.json');
  const randomCategory = getRandomElement(ImagesDatabase);
  const randomPair = getRandomElement(randomCategory);
  return randomPair;
}
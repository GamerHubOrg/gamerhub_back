import { getRandomIndex } from "../../../utils/functions";
import WordsDatabase from './words.json';
import { roomsDataMap } from "../../room-handler";
import { IUndercoverRoomData, defaultUndercoverGameData } from "./undercover.types";
import { SocketType } from "../../types";

export function getGameState(roomId: string, socket: SocketType) {
  const roomData = (roomsDataMap.get(roomId) as IUndercoverRoomData);
  if (!roomData) return socket.emit("room:not-found", roomId);

  const gameData = roomData.gameData || defaultUndercoverGameData;
  const words = gameData.words || [];

  return { gameData, words }
}

export function getGameWords() {
  const randomCategory = getRandomIndex(WordsDatabase);
  const wordCategory = WordsDatabase[randomCategory];
  const randomPair = getRandomIndex(wordCategory);
  return wordCategory[randomPair];
}
import { ICharacter } from "./../../../types/model.types";
import { IGameData, IRoomConfig, IRoomData, SocketUser } from "../../types";

export type SpeedrundleTheme = "league_of_legends" | "pokemon" | "marvel";
export type ISpeedrundleGameState = "guess";

export interface ISpeedrundlePlayer extends SocketUser {
  isEliminated?: boolean;
}

export interface ISpeedrundleRoomData extends IRoomData {
  users: ISpeedrundlePlayer[];
  config: ISpeedrundleConfig;
  gameData?: ISpeedrundleGameData;
}

export interface ISpeedrundleGameData extends IGameData {
  columns: IColumn[];
  allCharacters: ICharacter[];
  charactersToGuess: ICharacter[];
  usersAnswers: ISpeedrundleAnswer[];
  startDate : Date;
}

export type ISpeedrundleLeagueOfLegendsColumn = [];

export interface ISpeedrundleAnswer {
  playerId: string;
  currentRound: number;
  guesses: string[][];
  score: number;
}

export interface ISpeedrundleSendVote {
  roomId: string;
  vote: string;
  userId: string;
}

export interface ISpeedrundleGuess {
  playerId: string;
  guess: string;
}

export interface ISpeedrundleConfig extends IRoomConfig {
  nbRounds: number;
  theme: string;
}

interface IColumn {
  name: string;
  key: string;
  type?: string;
}

const LEAGUE_OF_LEGENDS_COLUMNS: IColumn[] = [
  { name: "Sprite", key: "sprite", type: "image" },
  { name: "Gender", key: "gender" },
  { name: "Tags", key: "tags" },
  { name: "Ressource", key: "ressource" },
  { name: "Range", key: "range" },
  { name: "Position", key: "position" },
];

export const speedrundleColumns: Record<SpeedrundleTheme, IColumn[]> = {
  league_of_legends: LEAGUE_OF_LEGENDS_COLUMNS,
  marvel: [],
  pokemon: [],
};

export const defaultSpeedrundleGameData: ISpeedrundleGameData = {
  allCharacters: [],
  charactersToGuess: [],
  columns: [],
  usersAnswers: [],
  startDate : new Date()
};

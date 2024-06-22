import {
  CharacterDataType,
  ICharacter,
} from "../../../modules/characters/characters.types";
import { IGameData, IRoomData, SocketUser } from "../../types";

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
}

export interface ISpeedrundleAnswer {
  playerId: string;
  currentRound: number;
  roundsData: ISpeedrundleRoundData[];
  state: "playing" | "finished";
}

export interface ISpeedrundleRoundData {
  guesses: string[];
  score: number;
  hasFound: boolean;
  startDate: Date;
}

export interface ISpeedrundleConfig {
  maxPlayers: number;
  nbRounds: number;
  theme: CharacterDataType;
}

interface IColumn {
  name: string;
  key: string;
  type?: string;
}

const LEAGUE_OF_LEGENDS_COLUMNS: IColumn[] = [
  { name: "Champion", key: "sprite", type: "image" },
  { name: "Gender", key: "gender" },
  { name: "Species", key: "species" },
  { name: "Combat", key: "tags" },
  { name: "Ressource", key: "ressource" },
  { name: "Type", key: "range" },
  { name: "Position", key: "position" },
  { name: "Region", key: "region" },
  { name: "Release year", key: "releaseYear", type : "comparison" },
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
};

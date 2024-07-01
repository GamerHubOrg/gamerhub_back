import {
  CharacterDataType,
  ICharacter,
} from "../../../modules/characters/types/characters.types";
import { IGameData, IRoomData, SocketUser } from "../../types";

export type SpeedrundleTheme = "league_of_legends" | "pokemon";
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
  mode: string;
  nbRounds: number;
  theme: CharacterDataType;
  selectedGenerations: number[];
  selectedColumns?: string[];
}

interface IColumn {
  name: string;
  key: string;
  type?: string;
  isIcon?: boolean;
}

const LEAGUE_OF_LEGENDS_COLUMNS: IColumn[] = [
  { name: "Champion", key: "sprite", type: "image", isIcon: true },
  { name: "Gender", key: "gender" },
  { name: "Species", key: "species" },
  { name: "Combat", key: "tags" },
  { name: "Ressource", key: "ressource" },
  { name: "Type", key: "range" },
  { name: "Position", key: "position" },
  { name: "Region", key: "region" },
  { name: "Release year", key: "releaseYear", type: "comparison" },
];

const POKEMON_COLUMNS: IColumn[] = [
  { name: "Pokemon", key: "sprite", type: "image" },
  { name: "Type 1", key: "type1" },
  { name: "Type 2", key: "type2" },
  { name: "Generation", key: "generation" },
  { name: "Color", key: "color" },
  { name: "Evolution Stage", key: "evolutionStage", type: "comparison" },
  { name: "Fully Evolved ?", key: "fullyEvolved" },
  { name: "Status", key: "status" },
  // { name: "Habitat", key: "habitat" },
  { name: "Height", key: "height", type: "comparison" },
  { name: "Weight", key: "weight", type: "comparison" },
];

export const speedrundleColumns: Record<SpeedrundleTheme, IColumn[]> = {
  league_of_legends: LEAGUE_OF_LEGENDS_COLUMNS,
  pokemon: POKEMON_COLUMNS,
};

export const defaultSpeedrundleConfig: ISpeedrundleConfig = { 
  maxPlayers: 6,
  nbRounds: 1,
  mode: 'classic',
  theme: 'league_of_legends',
  selectedGenerations: [],
  selectedColumns: [],
}

export const defaultSpeedrundleGameData: ISpeedrundleGameData = {
  allCharacters: [],
  charactersToGuess: [],
  columns: [],
  usersAnswers: [],
};

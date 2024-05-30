import { ICharacter } from './../../../types/model.types';
import { IGameData, IRoomConfig, IRoomData, SocketUser } from "../../types";

export type SpeedrundleTheme = 'league_of_legends' | 'pokemon' | 'marvel';
export type ISpeedrundleGameState = 'guess';

export interface ISpeedrundlePlayer extends SocketUser {
    isEliminated?: boolean
}

export interface ISpeedrundleRoomData extends IRoomData {
    users: ISpeedrundlePlayer[];
    config?: ISpeedrundleConfig;
    gameData?: ISpeedrundleGameData;
}

export interface ISpeedrundleGameData extends IGameData {
    columns: ISpeedrundleColumn[];
    allCharacters: ICharacter[];
    charactersToGuess: ICharacter[];
    currentRound: number;
    score: ISpeedrundleScore[];
}

export type ISpeedrundleLeagueOfLegendsColumn = [];


export interface ISpeedrundleScore {
    playerId: string, 
    points: number
}
export interface ISpeedrundleSendGuess {
    roomId: string,
    userId: string,
    characterId: string,
}

export interface ISpeedrundleSendVote {
    roomId: string,
    vote: string;
    userId: string,
}

export interface ISpeedrundleGuess {
    playerId: string;
    guess: string;
}


export interface ISpeedrundleConfig extends IRoomConfig {
    nbRounds: number;
    theme : string;
}

interface IColumn {
    name: string;
    key: string;
  }
  
  interface ISpeedrundleColumn {
    league_of_legends?: IColumn[],
    marvel?: IColumn[],
  }
  
  const LEAGUE_OF_LEGENDS_COLUMNS: IColumn[] = [
    {name: 'Sprite', key: 'sprite'},
    {name: 'Name', key: 'name'},
    {name: 'Tags', key: 'tags'},
    {name: 'Ressource', key: 'ressource'},
    {name: 'Range', key: 'range'},
    {name: 'Position', key: 'position'},
  ] 
  
  export const speedrundleColumns: ISpeedrundleColumn = {
    league_of_legends: LEAGUE_OF_LEGENDS_COLUMNS,
    marvel: []
  }

export const defaultSpeedrundleGameData: ISpeedrundleGameData = {  currentRound: 1, allCharacters: [], charactersToGuess : [], score: [], columns:[]};

import { ICharacter, ICharacterData } from "./characters.types";

export interface ILolCharacterData extends ICharacterData {
  dataType: "league_of_legends";
  splash: string;
  sprite: string;
  title: string;
  tags: string[];
  gender: string;
  ressource: string;
  range: string[];
  position: string[];
  region: string;
  releaseYear: number;
}

export interface ILolCharacter extends ICharacter {
  data: ILolCharacterData;
}


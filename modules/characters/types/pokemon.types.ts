import { ICharacter, ICharacterData } from "./characters.types";

export interface IPokemonCharacterData extends ICharacterData {
  dataType: "pokemon";
  splash: string;
  sprite: string;
  types: string[];
  height: number;
  weight: number;
  evolutionStage: number;
  fullyEvolved: boolean;
  color: string;
  habitat: string;
  generation: number;
  status : string;
}

export interface IPokemonCharacter extends ICharacter {
  data: IPokemonCharacterData;
}

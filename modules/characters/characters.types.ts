export type CharacterDataType = "league_of_legends" | "pokemon";

export interface ICharacterData extends Record<string, any> {
  dataType: CharacterDataType;
}

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

export interface ICharacter {
  _id: string;
  name: string;
  lang: string;
  apiId?: string;
  data: ICharacterData;
}

export interface ILolCharacter extends ICharacter {
  data: ILolCharacterData;
}

export type CharacterDataType = "league_of_legends" | "pokemon";

export interface ICharacterData extends Record<string, any> {
  dataType: CharacterDataType;
}

export interface ICharacter {
  _id: string;
  name: string;
  lang: string;
  apiId: string;
  data: ICharacterData;
}

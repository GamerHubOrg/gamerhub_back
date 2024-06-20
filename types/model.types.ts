export interface ILolData {
  dataType: "Lol";
  splash: string;
  sprite: string;
  title: string;
  tags: string[];
  gender: string;
  ressource: string;
  range: string[];
  position: string[];
}

export interface ICharacter {
  _id : string;
  name: string;
  lang: string;
  apiId?: string;
  data: Record<any, any>;
}

export interface ILolCharacter extends ICharacter {
  data: ILolData;
}

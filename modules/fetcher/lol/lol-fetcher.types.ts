export interface ILolApiResponse {
  type: string;
  format: string;
  version: string;
  data: Record<string, ILolApiChampion>;
}

export interface ILolApiChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

export interface ILolApiChampion {
  id : string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
    sprite: string;
  };
  tags: string[];
  lore: string;
  stats: ILolApiChampionStats;
  partype: string;
}

export interface ILolChampionRate {
  TOP: {
    playRate: number;
  };
  JUNGLE: {
    playRate: number;
  };
  MIDDLE: {
    playRate: number;
  };
  BOTTOM: {
    playRate: number;
  };
  UTILITY: {
    playRate: number;
  };
}

export interface ILolChampionRatesResponse {
  data: Record<string, ILolChampionRate>;
}

export interface ILolChampionSearch {
  name: string;
  slug : string;
  "associated-faction-slug": string;
  "release-date" : string;
}

export interface ILolChampionSearchResponse {
    champions: ILolChampionSearch[];
}

export interface ILolChampionSpecie {
  id: string;
  species: string[];
}


export type ILolChampionSpeciesResponse = ILolChampionSpecie[];
export interface IPokemonListApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IPokemonListResult[];
}

export interface IPokemonListResult {
  name: string;
  url: string;
}

export interface IPokemonApiResponse {
  id: number;
  height: number;
  weight: number;
  name: string;
  species: {
    name: string;
    url: string;
  };
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      "official-artwork": {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  types: IPokemonType[];
}

export interface IPokemonSpeciesApiResponse {
  color: {
    name: string;
  };
  evolution_chain: {
    url: string;
  };
  generation: {
    name: string;
    url: string;
  };
  habitat: {
    name: string;
  };
  names: {
    language: {
      name: string;
      url: string;
    };
    name: string;
  }[];
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
}

export interface IPokemonType {
  slot: number;
  type: {
    name: string;
  };
}

export interface IPokemonEvolutionApiResponse {
  chain: IPokemonEvolution;
}

export interface IPokemonEvolution {
  evolves_to: IPokemonEvolution[];
  species: {
    name: string;
  };
}

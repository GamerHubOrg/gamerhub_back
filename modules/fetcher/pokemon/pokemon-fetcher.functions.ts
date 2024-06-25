import axios from "axios";
import { IPokemonCharacter } from "../../characters/types/pokemon.types";
import {
  IPokemonApiResponse,
  IPokemonEvolution,
  IPokemonEvolutionApiResponse,
  IPokemonSpeciesApiResponse,
} from "./pokemon-fetcher.types";
import { capitalizeFirstLetter } from "../../../utils/functions";

function getEvolutionStage(name: string, chain: IPokemonEvolution) {
  let currentStage: IPokemonEvolution | undefined = chain;
  let stageCount = 1;
  let fullyEvolved = false;

  while (currentStage) {
    if (currentStage.species.name === name) {
      fullyEvolved = currentStage.evolves_to.length === 0;
      break;
    }

    if (currentStage.evolves_to?.length > 0) {
      currentStage = currentStage.evolves_to[0];
      stageCount++;
    } else {
      break;
    }
  }

  return {
    evolutionStage: stageCount,
    fullyEvolved: fullyEvolved,
  };
}

function getPokemonStatus({
  is_baby,
  is_legendary,
  is_mythical,
}: IPokemonSpeciesApiResponse) {
  if (is_baby) return "Baby";
  if (is_legendary) return "Legendary";
  if (is_mythical) return "Mythical";
  return "Common";
}

export const formatPokemon = async (
  pokemon: IPokemonApiResponse
): Promise<Partial<IPokemonCharacter>> => {
  const { data: species }: { data: IPokemonSpeciesApiResponse } =
    await axios.get(pokemon.species.url);
  const { data: evolution }: { data: IPokemonEvolutionApiResponse } =
    await axios.get(species.evolution_chain.url);

  const { id, sprites, weight, height, types } = pokemon;
  const { color, habitat, names } = species;
  const { chain } = evolution;
  const { evolutionStage, fullyEvolved } = getEvolutionStage(pokemon.name, chain);
  const generation =
    species.generation.url.split("/").slice(-2, -1).pop() || "0";
  const name = names.find(({language}) => language.name === "fr")?.name || pokemon.name;

  return {
    name : capitalizeFirstLetter(name),
    lang: "en_US",
    apiId: `pokemon-${id.toString()}`,
    data: {
      dataType: "pokemon",
      splash: sprites.other["official-artwork"].front_default,
      sprite: sprites.front_default,
      types: types.map(({ type }) => capitalizeFirstLetter(type.name)),
      height: height / 10,
      weight: weight / 10,
      evolutionStage,
      fullyEvolved,
      color: capitalizeFirstLetter(color.name),
      generation: parseInt(generation),
      habitat:capitalizeFirstLetter( habitat?.name || "unknown"),
      status: getPokemonStatus(species),
    },
  };
};

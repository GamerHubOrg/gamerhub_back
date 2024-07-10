import axios from "axios";
import { NextFunction, Request, Response } from "express";
import {
  IPokemonApiResponse,
  IPokemonListApiResponse,
} from "./pokemon-fetcher.types";
import { formatPokemon } from "./pokemon-fetcher.functions";
import { PokemonCharacterModel } from "../../characters/models/characters.model";

const fetchPokemonApi = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { query } = req;
    // const locale = typeof query.locale === "string" ? query.locale : "en_US";

    const { data: pokemonList }: { data: IPokemonListApiResponse } =
      await axios.get("https://pokeapi.co/api/v2/pokemon/?limit=10000");

    Promise.all(
      pokemonList.results
        .filter(({ url }) => {
          const id = url.split("/").slice(-2, -1).pop();
          if (!id) return false;
          return parseInt(id) < 10000;
        })
        .map(async ({ name, url }) => {
          const { data }: { data: IPokemonApiResponse } = await axios.get(url);
          const pokemon = await formatPokemon(data);
          console.debug(name);
          return PokemonCharacterModel.updateOne(
            { apiId: pokemon.apiId },
            { $set: pokemon },
            { upsert: true, new: true }
          );
        })
    )
      .then(() => console.debug("All pokemons have been added."))
      .catch(next);

    res.send("Pokemon API data are being added.");
  } catch (error) {
    next(error);
  }
};

export { fetchPokemonApi };

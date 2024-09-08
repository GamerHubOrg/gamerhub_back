import mongoose, { Schema } from "mongoose";
import LolSchema from "./lol-characters.model";
import PokemonSchema from "./pokemon-characters.model";
import { ICharacter } from "../types/characters.types";
import { IPokemonCharacter } from "../types/pokemon.types";
import { ILolCharacter } from "../types/lol.types";

const NameSchema = new mongoose.Schema(
  {
    fr: { type: String },
    en: { type: String },
  },
  { _id: false }
);

const CharacterSchema = new Schema(
  {
    name: { type: String, required: true },
    names: {
      type: NameSchema,
    },
    lang: {
      type: String,
      required: true,
    },
    apiId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const CharacterModel = mongoose.model<ICharacter>("Character", CharacterSchema);

export const LolCharacterModel = CharacterModel.discriminator<ILolCharacter>(
  "league_of_legends",
  LolSchema
);
export const PokemonCharacterModel =
  CharacterModel.discriminator<IPokemonCharacter>("pokemon", PokemonSchema);

export default CharacterModel;

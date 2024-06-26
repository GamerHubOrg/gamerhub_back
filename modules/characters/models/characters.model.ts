import mongoose, { Schema } from "mongoose";
import LolSchema from "./lol-characters.model";
import PokemonSchema from "./pokemon-characters.model";

const CharacterSchema = new Schema(
  {
    name: { type: String, required: true },
    lang: {
      type: String,
      required: true,
    },
    apiId: {
      type: String,
      required : true,
      unique: true,
      immutable: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const CharacterModel = mongoose.model("Character", CharacterSchema);

export const LolCharacterModel = CharacterModel.discriminator("league_of_legends", LolSchema);
export const PokemonCharacterModel = CharacterModel.discriminator("pokemon", PokemonSchema);

export default CharacterModel;

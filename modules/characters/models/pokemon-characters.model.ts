import { Schema } from "mongoose";

const PokemonSchema = new Schema(
  {
    sprite: {
      type: String,
      required: true,
    },
    splash: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    types: {
      type: [String],
      required: true,
    },
    evolutionStage: {
      type: Number,
      required: true,
    },
    fullyEvolved: {
      type: Boolean,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    habitat: {
      type: String,
      required: true,
    },
    generation: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { discriminatorKey: "dataType", _id: false }
);

export default PokemonSchema;

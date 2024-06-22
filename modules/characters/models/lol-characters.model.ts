import { Schema } from "mongoose";

const LolSchema = new Schema(
  {
    // Splash Art
    splash: {
      type: String,
      required: true,
    },
    // Image d'icône
    sprite: {
      type: String,
      required: true,
    },
    // Surnom du champion
    title: {
      type: String,
      required: true,
    },
    // Classe du champion
    tags: {
      type: [String],
      required: true,
    },
    // Lanes
    position: {
      type: [String],
      required: true,
    },
    // Genre
    gender: {
      type: String,
      required: true,
    },
    // Ressource
    ressource: {
      type: String,
      required: true,
    },
    // Range
    range: {
      type: [String],
      required: true,
    },
    // Region
    region: {
      type: String,
      required: true,
    },
    // Release year
    releaseYear: {
      type: Number,
      required: true,
    },
  },
  { discriminatorKey: "dataType", _id: false }
);

export default LolSchema;

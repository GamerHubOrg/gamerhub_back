import { Schema } from "mongoose";

// Image : https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/splash/{Nomduperso}_0.jpg
// Sprite : https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Aatrox.png

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
    // Ressource
    range: {
      type: [String],
      required: true,
    },
  },
  { _id: false }
);

export default LolSchema;

import {
  ILolApiChampion,
  ILolChampionSearchResponse,
  ILolApiChampionStats,
  ILolChampionRate,
  ILolChampionRatesResponse,
  ILolChampionSearch,
  ILolChampionSpeciesResponse,
  ILolChampionSpecie,
} from "./lol-fetcher.types";
import { capitalizeFirstLetter } from '../../../utils/functions'
import { ILolCharacter } from "../../characters/types/lol.types";

const getGenderFromLore = (name: string, lore: string) => {
  switch (name.toLowerCase()) {
    case "blitzcrank":
      return "other";
    case "naafiri":
      return "female";
    case "kog'maw":
      return "male";
    case "zac":
      return "male";

    default:
      break;
  }

  const malePronouns = ["he", "him", "his", "boy", "man"];
  const femalePronouns = ["she", "her", "hers", "girl", "woman"];

  const maleWords: string[] = [];
  const femaleWords: string[] = [];

  const words = lore.split(/\s+|(?<=\w)'|'(?=\w)/);

  for (let word of words) {
    word = word.toLowerCase();

    if (malePronouns.includes(word)) {
      maleWords.push(word);
    } else if (femalePronouns.includes(word)) {
      femaleWords.push(word);
    }
  }

  if (maleWords.length > femaleWords.length) return "male";
  else if (femaleWords.length > maleWords.length) return "female";
  return "other";
};

const getAttackRange = (name: string, stats: ILolApiChampionStats) => {
  const mixedChampions = [
    "gnar",
    "nidalee",
    "jayce",
    "elise",
    "kayle",
    "samira",
  ];
  if (mixedChampions.includes(name.toLowerCase())) return ["melee", "range"];
  return stats.attackrange <= 325 ? ["melee"] : ["range"];
};

const getChampionPosition = (rates: ILolChampionRate) => {
  const getPositionName = (position: string) => {
    switch (position) {
      case "UTILITY":
        return "support";
      case "BOTTOM":
        return "bot";
      case "MIDDLE":
        return "mid";
      default:
        return position.toLowerCase();
    }
  };

  const positions = Object.entries(rates).map(([position, { playRate }]) => ({
    position,
    playRate,
  }));

  positions.sort((a, b) => b.playRate - a.playRate);

  const mostPlayedPositions = positions
    .filter((pos) => pos.playRate > 0)
    .map((pos) => getPositionName(pos.position));

  return mostPlayedPositions;
};

const getChampionSpecies = (championId: string, species: ILolChampionSpecie[]) => {
  const championSpecies = species.find((specie: ILolChampionSpecie) => championId === specie.id);
  if (!championSpecies) return ['Unknown'];
  return championSpecies.species;
}

export const getChampionRegion = (searchData?: ILolChampionSearch) => {
  const factionSlug = searchData?.["associated-faction-slug"];

  if (!factionSlug || factionSlug === "unaffiliated") return "Runeterra";

  switch (factionSlug) {
    case "void":
      return "The Void";
    case "mount-targon":
      return "Targon";

    default:
      if (factionSlug.includes("-"))
        return factionSlug.split("-").map(capitalizeFirstLetter).join(" ");
      else return capitalizeFirstLetter(factionSlug);
  }
};

export const formatLolChampion = (
  locale : string,
  data: ILolApiChampion,
  rates: ILolChampionRatesResponse,
  searchDatas: ILolChampionSearchResponse,
  speciesData: ILolChampionSpeciesResponse,
): Partial<ILolCharacter> => {
  const { id, key, name, lore, title, tags, stats, partype, image } = data;
  const championRates = rates.data[key];
  const slug = name.split("'").join("").split(" ").join("").toLowerCase();

  const championSearchData = searchDatas.champions.find(
    (e) =>
      id.toLowerCase() === e.slug.toLowerCase() || slug === e.slug.toLowerCase()
  );

  const gender = getGenderFromLore(name, lore);
  const range = getAttackRange(name, stats);
  const imageName = image.full.split(".")[0];
  const releaseYear = championSearchData?.["release-date"].split("-")[0] || "0";

  return {
    name,
    lang: locale,
    apiId: `league_of_legends-${key}`,
    data: {
      dataType: "league_of_legends",
      splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${imageName}_0.jpg`,
      sprite: `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${imageName}.png`,
      title,
      tags,
      gender,
      range,
      ressource: partype,
      region: getChampionRegion(championSearchData),
      position: getChampionPosition(championRates),
      species: getChampionSpecies(data.id, speciesData),
      releaseYear: parseInt(releaseYear),
    },
  };
};
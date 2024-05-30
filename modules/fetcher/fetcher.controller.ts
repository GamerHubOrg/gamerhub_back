import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { ILolCharacter } from "../../types/model.types";
import {
  ILolApiChampion,
  ILolApiChampionStats,
  ILolApiResponse,
  ILolChampionRate,
  ILolChampionRatesResponse,
} from "./types/lol-fetcher.types";
import CharacterModel from "../../models/Character/Character.model";

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
  if (mixedChampions.includes(name)) return ["melee", "range"];
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

const formatChampion = (
  data: ILolApiChampion,
  rates: ILolChampionRatesResponse
): ILolCharacter => {
  const { key, name, lore, title, tags, stats, partype } = data;
  const championRates = rates.data[key];

  const gender = getGenderFromLore(name, lore);
  const range = getAttackRange(name, stats);

  return {
    name,
    lang: "en_US",
    apiId: key,
    data: {
      dataType: "Lol",
      splash: `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/splash/${name}_0.jpg`,
      sprite: `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${name}.png`,
      title,
      tags,
      gender,
      range,
      ressource: partype,
      position: getChampionPosition(championRates),
    },
  };
};

const fetchLolApi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: versions } = await axios.get(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const lastPatch = versions[0];
    const { data: lolResponse }: { data: ILolApiResponse } = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${lastPatch}/data/en_US/championFull.json`
    );
    const { data: positionData }: { data: ILolChampionRatesResponse } =
      await axios.get(
        `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/championrates.json`
      );

    const formattedDatas: Partial<ILolCharacter>[] = Object.values(
      lolResponse.data
    ).map((data) => {
      return formatChampion(data, positionData);
    });

    await CharacterModel.bulkWrite(
      formattedDatas.map((data) => ({
        updateOne: {
          filter: { apiId: data.apiId },
          update: {$set : data},
          upsert: true,
        },
      }))
    );

    res.status(201).send("LOL API datas has been saved.");
  } catch (error) {
    next(error);
  }
};

export { fetchLolApi };

import axios from "axios";
import { NextFunction, Request, Response } from "express";
import CharacterModel from "../../characters/models/characters.model";
import { formatLolChampion } from "./lol-fetcher.functions";
import {
  ILolApiResponse,
  ILolChampionRatesResponse,
  ILolChampionSearchResponse,
} from "./lol-fetcher.types";
import { ILolCharacter } from "../../characters/types/lol.types";

const fetchLolApi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req;
    const locale = typeof query.locale === "string" ? query.locale : "en_US";

    const { data: versions } = await axios.get(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const lastPatch = versions[0];
    const { data: lolResponse }: { data: ILolApiResponse } = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${lastPatch}/data/${locale}/championFull.json`
    );
    const { data: positionData }: { data: ILolChampionRatesResponse } =
      await axios.get(
        `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/championrates.json`
      );
    const { data: searchData }: { data: ILolChampionSearchResponse } =
      await axios.get(
        `https://universe-meeps.leagueoflegends.com/v1/en_us/champion-browse/index.json`
      );
    const { default: speciesData } = await import("./characters_species.json");

    const formattedDatas: Partial<ILolCharacter>[] = Object.values(
      lolResponse.data
    ).map((data) => {
      return formatLolChampion(
        locale,
        data,
        positionData,
        searchData,
        speciesData
      );
    });

    await CharacterModel.bulkWrite(
      formattedDatas.map((data) => ({
        updateOne: {
          filter: { apiId: data.apiId },
          update: { $set: data },
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

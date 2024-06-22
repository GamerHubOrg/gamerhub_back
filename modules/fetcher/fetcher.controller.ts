import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { ILolCharacter } from "../characters/characters.types";
import {
  ILolChampionSearchResponse,
  ILolApiResponse,
  ILolChampionRatesResponse,
} from "./lol/lol-fetcher.types";
import CharacterModel from "../characters/models/characters.model";
import { formatLolChampion } from "./lol/fetcher.functions";

const fetchLolApi = async (_req: Request, res: Response, next: NextFunction) => {
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
      const {data : searchData} : {data : ILolChampionSearchResponse} = 
      await axios.get(
        `https://universe-meeps.leagueoflegends.com/v1/en_us/champion-browse/index.json`
      );

    const formattedDatas: Partial<ILolCharacter>[] = Object.values(
      lolResponse.data
    ).map((data) => {
      return formatLolChampion(data, positionData, searchData);
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

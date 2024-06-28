import charactersService from "../../../modules/characters/characters.service";
import { ICharacter } from "../../../modules/characters/types/characters.types";
import { ISpeedrundleConfig } from "./speedrundle.types";
import cache from '../../../services/redis'
import appConfig from '../../../config'

export const getCharacters = async (
  config: ISpeedrundleConfig
): Promise<ICharacter[]> => {
  const { theme } = config;
  const filters: Record<string, any> = { theme };
  switch (theme) {
    case "league_of_legends":{
      const cacheKey = `speedrundle-${theme}-${JSON.stringify(filters)}`;
      const fromCache = await cache.get(cacheKey);

      if (fromCache) {
        return JSON.parse(fromCache);
      }

      const characters = await charactersService.getAllCharacters(filters);
      cache.setEx(cacheKey, appConfig.database.redisTtl, JSON.stringify(characters));
      return characters;
    }
    case "pokemon": {
      const { selectedGenerations } = config;
      if (selectedGenerations && selectedGenerations.length > 0)
        filters["data.generation"] = { $in: selectedGenerations };

      const cacheKey = `speedrundle-${theme}-${JSON.stringify(filters)}`;
      const fromCache = await cache.get(cacheKey);

      if (fromCache) {
        return JSON.parse(fromCache);
      }

      const characters = await charactersService.getAllCharacters(filters);
      cache.setEx(cacheKey, appConfig.database.redisTtl, JSON.stringify(characters));
      return characters;
    }

    default:
      return [];
  }
};

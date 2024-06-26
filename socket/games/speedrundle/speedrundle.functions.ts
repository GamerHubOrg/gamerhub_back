import charactersService from "../../../modules/characters/characters.service";
import { ICharacter } from "../../../modules/characters/types/characters.types";
import { ISpeedrundleConfig } from "./speedrundle.types";

export const getCharacters = async (
  config: ISpeedrundleConfig
): Promise<ICharacter[]> => {
  const { theme } = config;
  const filters: Record<string, any> = { theme };
  switch (theme) {
    case "league_of_legends":
      return await charactersService.getAllCharacters(filters);
    case "pokemon": {
      const { selectedGenerations } = config;
      if (selectedGenerations && selectedGenerations.length > 0)
        filters["data.generation"] = { $in: selectedGenerations };
      return await charactersService.getAllCharacters(filters);
    }

    default:
      return [];
  }
};

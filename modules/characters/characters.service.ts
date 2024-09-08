import { CharacterDataType, ICharacter } from "./types/characters.types";
import CharacterModel from "./models/characters.model";

interface IFilters extends Record<string, any> {
  theme?: "pokemon" | "league_of_legends";
}

const getAllCharacters = async (filters?: IFilters): Promise<ICharacter[]> => {
  let filtersObject: Record<string, any> = {};
  if (filters) {
    const { theme, ...otherFilters } = filters;
    if (theme) filtersObject["data.dataType"] = filters.theme;
    filtersObject = { ...filtersObject, ...otherFilters };
  }

  const characters: ICharacter[] = await CharacterModel.find(
    filtersObject
  ).lean();
  return characters.sort((a, b) => {
    const aId = parseInt(a.apiId.split("-").pop() || "0", 10);
    const bId = parseInt(b.apiId.split("-").pop() || "0", 10);
    return aId - bId;
  });
};

const getCharacterById = async (_id: string): Promise<ICharacter | null> => {
  return await CharacterModel.findOne({ _id }).lean();
};

const getAllCharactersByTheme = async <T extends ICharacter = ICharacter>(
  dataType: CharacterDataType | string
): Promise<T[]> => {
  return await CharacterModel.find({ "data.dataType": dataType }).lean<T[]>();
};

const insertCharacters = async (datas: ICharacter[]) => {
  return await CharacterModel.insertMany(datas);
};

const insertCharacter = async (data: ICharacter) => {
  return await new CharacterModel(data).save();
};

const updateCharacter = async (_id: string, data: Partial<ICharacter>) => {
  return await CharacterModel.updateOne({ _id }, { $set: data });
};

const deleteCharacters = async (ids: string[]) => {
  return await CharacterModel.deleteMany({ _id: { $in: ids } });
};

const deleteCharacter = async (_id: string) => {
  return await CharacterModel.deleteOne({ _id });
};

const charactersService = {
  getAllCharacters,
  getCharacterById,
  getAllCharactersByTheme,
  insertCharacters,
  insertCharacter,
  updateCharacter,
  deleteCharacters,
  deleteCharacter,
};

export default charactersService;

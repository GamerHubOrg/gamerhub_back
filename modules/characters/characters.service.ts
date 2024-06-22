import { CharacterDataType, ICharacter } from "./characters.types";
import CharacterModel from "./models/characters.model";

const getAllCharacters = async (
  filters?: Record<string, any>
): Promise<ICharacter[]> => {
  return await CharacterModel.find(filters || {}).lean();
};

const getCharacterById = async (_id: string): Promise<ICharacter | null> => {
  return await CharacterModel.findOne({ _id }).lean();
};

const getAllCharactersByTheme = async <T extends ICharacter = ICharacter>(
  dataType: CharacterDataType | string
): Promise<T[]> => {
  return await CharacterModel.find({ "data.dataType": dataType }).lean();
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
  return await CharacterModel.deleteMany(ids);
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

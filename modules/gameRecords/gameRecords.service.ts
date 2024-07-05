import CharacterModel from "../characters/models/characters.model";
import { ICharacter } from "../characters/types/characters.types";
import usersModel from "../users/users.model";
import GameRecordModel, {
  SpeedrundleRecordModel,
  UndercoverRecordModel,
} from "./models/gameRecords.model";
import { IGameRecord } from "./types/gameRecords.types";
import { ISpeedrundleRecord } from "./types/speedrundleRecords.types";
import { IUndercoverRecord } from "./types/undercoverRecords.types";

interface IUserData {
  _id: string;
  username: string;
  picture: string;
}

interface IGameRecordWithUsers extends IGameRecord {
  usersData: IUserData[];
}

interface ISpeedrundleRecordWithUsers extends ISpeedrundleRecord {
  usersData: IUserData[];
  charactersData: ICharacter[];
}

type GameRecord = IGameRecord | ISpeedrundleRecord | IUndercoverRecord;
type GameRecordWithUsers = IGameRecordWithUsers | ISpeedrundleRecordWithUsers;

const getAllGameRecords = async (
  filters: Record<string, any> = {},
  skip = 0,
  limit?: number
): Promise<GameRecordWithUsers[]> => {
  let query = GameRecordModel.find(filters).sort({ createdAt: -1 }).skip(skip);
  if (limit) {
    query = query.limit(limit);
  }

  const gameRecords = await query.lean();

  const recordsWithUsers: any[] = await Promise.all(
    gameRecords.map(async (record) => {
      const users: IUserData = await usersModel
        .find(
          {
            _id: { $in: record.users },
          },
          "_id username picture"
        )
        .lean();
      let characters;
      if (record.gameName === "speedrundle") {
        characters = await CharacterModel.find(
          {
            // @ts-expect-error: if gameName === "speedrundle", record is a ISpeedrundleRecord
            _id: { $in: (record as ISpeedrundleRecord).charactersToGuess },
          },
          "_id name data.sprite"
        ).lean();
      }

      return {
        ...record,
        usersData: users,
        charactersData: characters,
      };
    })
  );

  return recordsWithUsers;
};

const getGameRecordById = async (_id: string): Promise<GameRecord | null> => {
  return await GameRecordModel.findOne({ _id }).lean();
};

const countGameRecords = async (
  filters: Record<string, any> = {},
): Promise<number> => {
  return await GameRecordModel.countDocuments(filters);
};

const insertGameRecords = async (datas: Partial<GameRecord>[]) => {
  return await GameRecordModel.insertMany(datas);
};

const insertGameRecord = async (data: Partial<GameRecord>) => {
  if (data.gameName === "speedrundle") {
    return await new SpeedrundleRecordModel(data).save();
  }
  if (data.gameName === "undercover") {
    return await new UndercoverRecordModel(data).save();
  }
  return await new GameRecordModel(data).save();
};

const updateGameRecord = async (_id: string, data: Partial<GameRecord>) => {
  return await GameRecordModel.updateOne({ _id }, { $set: data });
};

const deleteGameRecords = async (ids: string[]) => {
  return await GameRecordModel.deleteMany(ids);
};

const deleteGameRecord = async (_id: string) => {
  return await GameRecordModel.deleteOne({ _id });
};

const gameRecordsService = {
  getAllGameRecords,
  getGameRecordById,
  countGameRecords,
  insertGameRecords,
  insertGameRecord,
  updateGameRecord,
  deleteGameRecords,
  deleteGameRecord,
};

export default gameRecordsService;

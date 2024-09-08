import CharacterModel from "../characters/models/characters.model";
import { ICharacter } from "../characters/types/characters.types";
import usersModel, { IStoredUser } from "../users/users.model";
import GameRecordModel, {
  SpeedrundleRecordModel,
  UndercoverRecordModel,
  WerewolvesRecordModel,
} from "./models/gameRecords.model";
import { IGameRecord } from "./types/gameRecords.types";
import { ISpeedrundleRecord } from "./types/speedrundleRecords.types";
import { IUndercoverRecord } from "./types/undercoverRecords.types";
import { IWerewolvesRecord } from "./types/werewolvesRecords.types";

interface IGameRecordWithUsers extends IGameRecord {
  usersData: IStoredUser[];
}

interface ISpeedrundleRecordWithUsers extends ISpeedrundleRecord, IGameRecordWithUsers {
  charactersData: ICharacter[];
}

interface IWerewolvesRecordWithUsers extends IWerewolvesRecord, IGameRecordWithUsers {

}

type GameRecord = IGameRecord | ISpeedrundleRecord | IUndercoverRecord | IWerewolvesRecord;
type GameRecordWithUsers = IGameRecordWithUsers | ISpeedrundleRecordWithUsers |IWerewolvesRecordWithUsers;

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
      const users: IStoredUser[] = await usersModel
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
  if (data.gameName === "werewolves") {
    return await new WerewolvesRecordModel(data).save();
  }
  return await new GameRecordModel(data).save();
};

const updateGameRecord = async (_id: string, data: Partial<GameRecord>) => {
  return await GameRecordModel.updateOne({ _id }, { $set: data });
};

const deleteGameRecords = async (ids: string[]) => {
  return await GameRecordModel.deleteMany({_id : {$in : ids}});
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

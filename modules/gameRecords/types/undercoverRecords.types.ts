import {
  IUndercoverConfig,
  IUndercoverVote,
  IUndercoverWords,
} from "../../../socket/games/undercover/undercover.types";
import { IGameRecord } from "./gameRecords.types";

export interface IUndercoverRecord extends IGameRecord {
  words: IUndercoverWords[];
  votes: IUndercoverVote[];
  civilianWord: string;
  spyWord: string;
  undercoverPlayerIds: string[];
  campWin: string;
  config : IUndercoverConfig
}

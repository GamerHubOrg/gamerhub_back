import {
  IColumn,
  ISpeedrundleAnswer,
} from "../../../socket/games/speedrundle/speedrundle.types";
import { IGameRecord } from "./gameRecords.types";

export interface ISpeedrundleRecord extends IGameRecord {
  columns: IColumn[];
  charactersToGuess: string[];
  usersAnswers: ISpeedrundleAnswer[];
}

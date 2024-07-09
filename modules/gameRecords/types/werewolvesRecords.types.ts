import {
  IWerewolvesVote,
  IWerewolvesSave,
  IWerewolvesKill,
  IWerewolvesWatchRole,
  ILinkedWerewolfRoles,
  IWerewolvesCamp,
  IWerewolvesConfig,
} from "../../../socket/games/werewolves/werewolves.types";
import { IGameRecord } from "./gameRecords.types";

export interface IWerewolvesRecord extends IGameRecord {
  wolfVotes?: IWerewolvesVote[];
  villageVotes?: IWerewolvesVote[];
  witchSaves?: IWerewolvesSave[];
  witchKills?: IWerewolvesKill[];
  hunterKills?: IWerewolvesKill[];
  psychicWatch?: IWerewolvesWatchRole[];
  roles: ILinkedWerewolfRoles;
  swapedRoles?: ILinkedWerewolfRoles;
  thiefUsers?: string[];
  couple?: string[];
  campWin?: IWerewolvesCamp;
  usersThatPlayed?: string[];
  config: IWerewolvesConfig;
}

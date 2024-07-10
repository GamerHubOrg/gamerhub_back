import {
  IWerewolvesTarget,
  ILinkedWerewolfRoles,
  IWerewolvesCamp,
  IWerewolvesConfig,
} from "../../../socket/games/werewolves/werewolves.types";
import { IGameRecord } from "./gameRecords.types";

export interface IWerewolvesRecord extends IGameRecord {
  wolfVotes?: IWerewolvesTarget[];
  villageVotes?: IWerewolvesTarget[];
  witchSaves?: IWerewolvesTarget[];
  witchKills?: IWerewolvesTarget[];
  hunterKills?: IWerewolvesTarget[];
  psychicWatch?: IWerewolvesTarget[];
  roles: ILinkedWerewolfRoles;
  swapedRoles?: ILinkedWerewolfRoles;
  thiefUsers?: string[];
  couple?: string[];
  campWin?: IWerewolvesCamp;
  usersThatPlayed?: string[];
  config: IWerewolvesConfig;
}

import {
  IWerewolvesTarget,
  ILinkedWerewolfRoles,
  IWerewolvesCamp,
  IWerewolvesConfig,
  IWerewolvesSwapedRoles,
  IWerewolvesCouple,
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
  swapedRoles?: IWerewolvesSwapedRoles[];
  thiefUsers?: Record<string, string[]>;
  couple?: Record<string, IWerewolvesCouple>;
  campWin?: IWerewolvesCamp;
  usersThatPlayed?: string[];
  config: IWerewolvesConfig;
}

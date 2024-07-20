import { IoType, SocketType } from "../../types";
import onCupidonDefineCouple from "./events/on-cupidon-define-couple";
import onGetData from "./events/on-get-data";
import onHunterKillPlayer from "./events/on-hunter-kill-player";
import onInitialize from "./events/on-initialize";
import onPsychicWatchRole from "./events/on-psychic-watch-role";
import onThiefChooseRole from "./events/on-thief-choose-role";
import onVillageVote from "./events/on-village-vote";
import onWitchKillPlayer from "./events/on-witch-kill-player";
import onWitchSavePlayer from "./events/on-witch-save-player";
import onWitchSkip from "./events/on-witch-skip";
import onWolfVote from "./events/on-wolf-vote";
import onWolfVoteSelectPlayer from "./events/on-wolf-vote-selected-player";
import {
  IWerewolvesSendCouple,
  IWerewolvesSendTarget,
} from "./werewolves.types";

const WerewolvesHandler = (io: IoType, socket: SocketType) => {
  socket.on("game:werewolves:initialize", (roomId: string) => onInitialize(io, socket)(roomId));
  socket.on("game:werewolves:get-data", (roomId: string) => onGetData(io, socket)(roomId));
  socket.on("game:werewolves:vote:tmp", ({ roomId, userId, target }: IWerewolvesSendTarget) => onWolfVoteSelectPlayer(io, socket)({ roomId, userId, target }));
  socket.on("game:werewolves:village:vote", ({ roomId, userId, target }: IWerewolvesSendTarget) => onVillageVote(io, socket)({ roomId, userId, target }));
  socket.on("game:werewolves:wolf:vote", ({ roomId, userId, target }: IWerewolvesSendTarget) => onWolfVote(io, socket)({ roomId, userId, target }));
  socket.on("game:werewolves:witch:save", ({ roomId, userId, target }: IWerewolvesSendTarget) => onWitchSavePlayer(io, socket)({ roomId, userId, target }));
  socket.on("game:werewolves:witch:kill", ({ roomId, userId, target }: IWerewolvesSendTarget) => onWitchKillPlayer(io, socket)({ roomId, userId, target }));
  socket.on("game:werewolves:witch:skip", ({ roomId, playerId }: { roomId: string, playerId: string }) => onWitchSkip(io, socket)({ roomId, playerId }));
  socket.on("game:werewolves:hunter:kill", ({ roomId, userId, target } : IWerewolvesSendTarget) => onHunterKillPlayer(io, socket)({ roomId, userId, target }));
  socket.on("game:werewolves:psychic:watch", ({ roomId, userId, target }: IWerewolvesSendTarget) => onPsychicWatchRole(io, socket)({ roomId, userId, target }));
  socket.on("game:werewolves:cupidon:couple", ({ roomId, playerId, couple }: IWerewolvesSendCouple) => onCupidonDefineCouple(io, socket)({ roomId, playerId, couple }));
  socket.on("game:werewolves:thief:choose", ({ roomId, userId, target }: IWerewolvesSendTarget) => onThiefChooseRole(io, socket)({ roomId, userId, target }));
};

export default WerewolvesHandler;

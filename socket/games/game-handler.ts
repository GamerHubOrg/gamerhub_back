import { IoType, SocketType } from "../types";
import SpeedrundleHandler from "./speedrundle/speedrundle.handler";
import UndercoverHandler from "./undercover/undercover.handler";
import WerewolvesHandler from "./werewolves/werewolves.handler";

// Socket handlers
const GameHandler = (io: IoType, socket: SocketType) => {
  UndercoverHandler(io, socket);
  SpeedrundleHandler(io, socket);
  WerewolvesHandler(io, socket);
};

export default GameHandler;

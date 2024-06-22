import { IoType, SocketType } from "../types";
import SpeedrundleHandler from "./speedrundle/speedrundle.handler";
import UndercoverHandler from "./undercover/undercover.handler";

// Socket handlers
const GameHandler = (io: IoType, socket: SocketType) => {
  UndercoverHandler(io, socket);
  SpeedrundleHandler(io, socket);
};

export default GameHandler;

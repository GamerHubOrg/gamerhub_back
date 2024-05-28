import { IoType, SocketType } from "../types";
import TestHandler from "./test-handler";
import UndercoverHandler from "./undercover/undercover.handler";

// Socket handlers
const GameHandler = (io: IoType, socket: SocketType) => {
  TestHandler(io, socket);
  UndercoverHandler(io, socket);
};

export default GameHandler;

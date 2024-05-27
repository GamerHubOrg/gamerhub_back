import { IoType, SocketType } from "../types";
import TestHandler from "./test-handler";

// Socket handlers
const GameHandler = (io: IoType, socket: SocketType) => {
  TestHandler(io, socket);
};

export default GameHandler;

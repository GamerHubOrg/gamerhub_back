import GameHandler from "./games/game-handler";
import RoomHandler from "./room-handler";
import { IoType, SocketType } from "./types";

const onDisconnect = () => {
  console.log("user disconnected");
};

const SocketConnectionHandler = (io: IoType, socket: SocketType) => {
  console.log("user connected");

  socket.onAny((event) => {
    console.log("[socket] event on : ", event);
  })

  socket.onAnyOutgoing((event) => {
    console.log("[socket] event emit : ", event);
  })

  RoomHandler(io, socket);
  GameHandler(io, socket);
  socket.on("disconnect", () => onDisconnect());
};

export default SocketConnectionHandler;

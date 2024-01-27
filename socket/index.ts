import RoomHandler from "./room-handler";
import { IoType, SocketType } from "./types";

const onDisconnect = () => {
  console.log("user disconnected");
};

const SocketConnectionHandler = (io: IoType, socket: SocketType) => {
  console.log("user connected");

  RoomHandler(io, socket);
  socket.on("disconnect", () => onDisconnect());
};

export default SocketConnectionHandler;

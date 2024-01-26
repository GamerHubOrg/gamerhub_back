import { User } from "shared/types/express";
import { IoType, SocketType } from "../shared/types/socket.types";
import { generateRandomString } from "../utils/functions";

const roomsDataMap = new Map();

const generateRoomName = (io: IoType, game: string): string => {
  const randomString = generateRandomString(8);
  const roomName = `room-${game}-${randomString}`;
  const sameRoomNameExists = io.sockets.adapter.rooms.has(roomName);
  if (sameRoomNameExists) return generateRandomString();
  return roomName;
};

const RoomHandler = (io: IoType, socket: SocketType) => {
  const onRoomCreate = (game: string, config: any) => {
    const roomName = generateRoomName(io, game);
    roomsDataMap.set(roomName, { config });
    socket.join(roomName);
    socket.emit("room:created", roomName);
  };

  const onRoomDelete = (roomName : string) => {
    roomsDataMap.delete(roomName);
    io.in(roomName).disconnectSockets();
  }

  const onRoomJoin = (roomName : string, user : User) => {
    const roomData = roomsDataMap.get(roomName);
    roomData.users = [...roomData.users, user]
    io.in(roomName).disconnectSockets();
  }

  const onRoomGetConfig = (roomName: string) => {
    const roomData = roomsDataMap.get(roomName);
    socket.emit("room:config-sent", roomData);
  };

  socket.on("room:get-config", onRoomGetConfig);
  socket.on("room:join", onRoomJoin);
  socket.on("room:create", onRoomCreate);
  socket.on("room:delete", onRoomDelete);
};

export default RoomHandler;

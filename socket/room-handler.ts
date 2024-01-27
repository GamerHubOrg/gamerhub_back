import { User } from "shared/types/express";
import { IRoomConfig, IRoomData, IoType, SocketType } from "./types";
import { generateRandomString } from "../utils/functions";

const roomsDataMap: Map<string, IRoomData> = new Map();

const generateRoomId = (io: IoType, game: string): string => {
  const randomString = generateRandomString(8);
  const roomId = `room-${game}-${randomString}`;
  const sameRoomIdExists = io.sockets.adapter.rooms.has(roomId);
  if (sameRoomIdExists) return generateRandomString();
  return roomId;
};

const RoomHandler = (io: IoType, socket: SocketType) => {
  const onRoomCreate = (user: User, game: string) => {
    const roomId = generateRoomId(io, game);
    const data = { users: [{ ...user, socket_id: socket.id, isOwner: true }] }
    roomsDataMap.set(roomId, data);
    socket.join(roomId);
    socket.emit("room:created", roomId, data);
  };

  const onRoomJoin = (roomId: string, user: User) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    roomData.users = [...roomData.users, { ...user, socket_id: socket.id }]
    socket.join(roomId);
    socket.in(roomId).emit("room:joined")
  }

  const onRoomStart = (roomId: string, config: IRoomConfig) => {
    console.log(`La partie ${roomId} a été lancée avec les configs suivantes : `);
    console.log(config);
    socket.in(roomId).emit("room:started", config)
  };

  const onRoomDelete = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const { users } = roomData;
    for (const { socket_id } of users) {
      io.to(socket_id).emit("room:deleted", roomId)
    }

    roomsDataMap.delete(roomId);
    io.sockets.adapter.rooms.delete(roomId);
  }

  const onRoomLeave = (roomId: string) => {
    socket.leave(roomId);
  }

  socket.on("room:create", onRoomCreate);
  socket.on("room:join", onRoomJoin);
  socket.on("room:start", onRoomStart);
  socket.on("room:delete", onRoomDelete);
  socket.on("room:leave", onRoomLeave);
};

export default RoomHandler;

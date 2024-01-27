import { User } from "shared/types/express";
import { IRoomConfig, IRoomData, IoType, SocketType, SocketUser } from "./types";
import { generateRandomString } from "../utils/functions";

export const roomsDataMap: Map<string, IRoomData> = new Map();

const generateRoomId = (io: IoType, game: string): string => {
  const randomString = generateRandomString(8);
  const roomId = `room-${game}-${randomString}`;
  const sameRoomIdExists = io.sockets.adapter.rooms.has(roomId);
  if (sameRoomIdExists) return generateRandomString();
  return roomId;
};

const addUserToRoom = (roomData: IRoomData, user: SocketUser) => {
  const index = roomData.users.findIndex(({ email }) => email === user.email);
  if (index < 0) roomData.users.push(user);
  else roomData.users[index] = { ...roomData.users[index], socket_id: user.socket_id }
}

const RoomHandler = (io: IoType, socket: SocketType) => {
  const onRoomCreate = (game: string, user: User) => {
    console.log("room create : ", game);
    console.log("owner : ", user);

    if (!user) return socket.emit("user:not-auth");
    const roomId = generateRoomId(io, game);
    const data = { users: [{ ...user, socket_id: socket.id, isOwner: true }] }
    roomsDataMap.set(roomId, data);
    socket.join(roomId);
    socket.emit("room:created", roomId, data);
  };

  const onRoomJoin = (roomId: string, user: User) => {
    console.log("room join :", roomId);
    console.log("user :", user);
    if (!user) return socket.emit("user:not-auth");
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    addUserToRoom(roomData, { ...user, socket_id: socket.id })
    socket.join(roomId);
    io.in(roomId).emit("room:joined", roomId, roomData)
  }

  const onRoomStart = (roomId: string, config: IRoomConfig) => {
    console.log("room start");
    console.log(`La partie ${roomId} a été lancée avec les configs suivantes : `);
    console.log(config);
    io.in(roomId).emit("room:started", config)
  };

  const onRoomDelete = (roomId: string) => {
    console.log("room delete");
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
    console.log("room leave");
    socket.leave(roomId);
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);
    // filters users to remove it
    roomData.users = roomData.users.filter(({ socket_id }) => socket_id !== socket.id)
    io.in(roomId).emit("room:update", roomData)
    socket.emit("room:left")
  }

  socket.on("room:create", onRoomCreate);
  socket.on("room:join", onRoomJoin);
  socket.on("room:start", onRoomStart);
  socket.on("room:delete", onRoomDelete);
  socket.on("room:leave", onRoomLeave);
};

export default RoomHandler;

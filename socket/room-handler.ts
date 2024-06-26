import { User } from "../shared/types/express";
import {
  IRoomConfig,
  IRoomData,
  IoType,
  SocketType,
  SocketUser,
} from "./types";
import { generateRandomString } from "../utils/functions";
import { RoomLogger } from "./logs-handler";
import { defaultConfigs } from "./room.constants";

export const roomsDataMap: Map<string, IRoomData> = new Map();

// Room data functions
const generateRoomId = (io: IoType): string => {
  const roomId = generateRandomString(8);
  const sameRoomIdExists =
    io.sockets.adapter.rooms.has(roomId) || roomsDataMap.has(roomId);
  if (sameRoomIdExists) return generateRandomString();
  return roomId;
};

const addUserToRoom = (roomData: IRoomData, user: SocketUser) => {
  const index = roomData.users.findIndex(
    ({ email }: any) => email === user.email
  );
  if (index < 0) roomData.users.push(user);
  else
    roomData.users[index] = {
      ...roomData.users[index],
      socket_id: user.socket_id,
    };
};

const deleteRoom = (roomId: string) => {
  roomsDataMap.delete(roomId);
};

const removeUserFromRoom = (
  roomId: string,
  roomData: IRoomData,
  socket_id: string
): SocketUser | undefined => {
  const newUsers = [...roomData.users];

  const index = newUsers.findIndex((e) => e.socket_id === socket_id);
  if (index < 0) return;
  const leavingUser = newUsers.splice(index, 1)[0];

  if (newUsers.length === 0) {
    deleteRoom(roomId);
    return leavingUser;
  }

  if (leavingUser.isOwner)
    newUsers.splice(0, 1, { ...newUsers[0], isOwner: true });

  roomData.users = newUsers;

  return leavingUser;
};

// Socket handlers
const RoomHandler = (io: IoType, socket: SocketType) => {
  const roomLogger = new RoomLogger();

  const onRoomCreate = (game: string, user: User) => {
    if (!user) return socket.emit("user:not-auth");

    const roomId = generateRoomId(io);
    const socketUser: SocketUser = { ...user, socket_id: socket.id, isOwner: true, joindedAt: new Date() };
    const data: IRoomData = {
      users: [socketUser],
      logs: roomLogger.onRoomCreate(roomId, socketUser),
      gameState: "lobby",
      gameName: game,
    };

    roomsDataMap.set(roomId, data);

    socket.join(roomId);
    socket.emit("room:created", roomId, data);
  };

  const onRoomJoin = (roomId: string, user: User) => {
    if (!user) return socket.emit("user:not-auth");
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const socketUser: SocketUser = { ...user, socket_id: socket.id, joindedAt: new Date() };
    addUserToRoom(roomData, socketUser);
    roomLogger.onRoomJoin(roomData, socketUser);

    socket.join(roomId);
    io.in(roomId).emit("room:joined", roomId, roomData);
  };

  const onRoomStart = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);
    roomLogger.onRoomStart(roomData);
    roomData.gameState = "started";
    roomData.gameData = {};
    roomData.users = roomData.users.sort((a, b) => a.joindedAt.getTime() - b.joindedAt.getTime())
    io.in(roomId).emit("room:started", roomData);
  };

  const onRoomBackToLobby = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);
    roomData.gameState = "lobby";
    roomData.gameData = {};
    io.in(roomId).emit("room:lobbied", roomData);
  }

  const onRoomDelete = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const { users } = roomData;
    for (const { socket_id } of users) {
      io.to(socket_id).emit("room:deleted", roomId);
    }

    deleteRoom(roomId);
    io.sockets.adapter.rooms.delete(roomId);
  };

  const onRoomLeave = (roomId: string) => {
    socket.leave(roomId);

    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const leavingUser = removeUserFromRoom(roomId, roomData, socket.id);
    if (leavingUser) roomLogger.onRoomLeave(roomData, leavingUser);

    io.in(roomId).emit("room:updated", roomData);
  };

  const onRoomUpdate = (roomId: string, config: IRoomConfig) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    roomData.config = config;
    roomLogger.onRoomUpdate(roomData);

    io.in(roomId).emit("room:updated", roomData);
  };

  const onRoomChangeGame = (roomId: string, game: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    roomData.gameName = game;
    roomData.config = defaultConfigs[game];
    roomLogger.onGameChange(roomData);

    io.in(roomId).emit("room:updated", roomData);
  };

  socket.on("room:create", onRoomCreate);
  socket.on("room:join", onRoomJoin);
  socket.on("room:start", onRoomStart);
  socket.on("room:lobby", onRoomBackToLobby);
  socket.on("room:delete", onRoomDelete);
  socket.on("room:leave", onRoomLeave);
  socket.on("room:update", onRoomUpdate);
  socket.on("room:change-game", onRoomChangeGame);
};

export default RoomHandler;

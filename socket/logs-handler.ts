import { IRoomData, IRoomLog, SocketUser } from "./types";

export default class RoomLogger {
  public onRoomCreate(roomId: string, user: SocketUser): IRoomLog[] {
    return [
      { date: new Date(), message: `The room ${roomId} has been created.` },
      {
        date: new Date(),
        message: `User ${user.username} has joined the room.`,
      },
      { date: new Date(), message: `User ${user.username} became owner.` },
    ];
  }

  public onRoomJoin(roomData: IRoomData, user: SocketUser) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `User ${user.username} has joined the room.`,
      },
    ];
  }

  public onRoomLeave(roomData: IRoomData, user: SocketUser) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `User ${user.username} has left the room.`,
      },
    ];
  }

  public onRoomUpdate(roomData: IRoomData) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `Room config has been updated.`,
      },
    ];
  }

  public onRoomStart(roomData: IRoomData) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `The game has been started.`,
      },
    ];
  }
}

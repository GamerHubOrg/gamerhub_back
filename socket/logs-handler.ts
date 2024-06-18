import { IRoomData, IRoomLog, SocketUser } from "./types";

export class RoomLogger {
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

  public onGameChange(roomData: IRoomData) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `The game has changed to ${roomData.gameName}.`,
      },
    ];
  }

  public onGameInitialized(roomData : IRoomData) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `${roomData.gameName} game has been initialized.`,
      },
    ];
  }
}

export class UndercoverLogger {
  public onSendWord(roomData: IRoomData, user: SocketUser, word: string) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `${user.username} gave the word : ${word}`,
      },
    ];
  }

  public onCanVote(roomData: IRoomData) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: 'Players can now vote to find the undercover',
      },
    ];
  }

  public onVote(roomData: IRoomData, user: SocketUser, vote: SocketUser) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `${user.username} voted for ${vote.username}`,
      },
    ];
  }

  public onSideWin(roomData: IRoomData, side: string) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `Game ended, ${side} win`,
      },
    ];
  }
}

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

  public onUserPromoted(roomData: IRoomData, user: SocketUser) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `User ${user.username} has been promoted to owner.`,
      },
    ];
  }

  public onUserKicked(roomData: IRoomData, user: SocketUser) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `User ${user.username} has been kicked.`,
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

  public onGameInitialized(roomData: IRoomData) {
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
        message: "Players can now vote to find the undercover",
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

export class SpeedundleLogger {
  public onFindGuess(
    roomData: IRoomData,
    user: SocketUser,
    roundIndex: number
  ) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `${user.username} has found the round ${roundIndex}.`,
      },
    ];
  }

  public onAbandonGuess(
    roomData: IRoomData,
    user: SocketUser,
    roundIndex: number
  ) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `${user.username} has abandoned the round ${roundIndex}.`,
      },
    ];
  }

  public onFinish(roomData: IRoomData, user: SocketUser) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `${user.username} has finished all guesses.`,
      },
    ];
  }

  public onGameEnded(roomData: IRoomData) {
    roomData.logs = [
      ...roomData.logs,
      {
        date: new Date(),
        message: `Game ended`,
      },
    ];
  }
}

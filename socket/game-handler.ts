import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";



const GameHandler = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
    const onCreateRoom = (game: string, configs: any) => {
        console.log(game);
        console.log(configs);
        socket.emit("room:created", "poulailler");
    };

    socket.on("room:create", onCreateRoom);
};

export default GameHandler;
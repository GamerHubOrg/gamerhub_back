import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import GameHandler from "./game-handler";

const onDisconnect = () => {
    console.log("user disconnected");
};

const SocketConnectionHandler = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
    console.log("user connected");
    
    GameHandler(io, socket);
    socket.on("disconnect", onDisconnect);
};

export default SocketConnectionHandler;
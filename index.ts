import cookieParser from 'cookie-parser';
import express, { Application } from "express";
import cors from "cors";
import http from "http";
import compression from "compression";
import { Server } from "socket.io";

import database from "./services/database";
import { connectRedis } from './services/redis';
import router from "./router";
import config from "./config";
import SocketConnectionHandler from "./socket";
import { verifyAuth } from "./middlewares/authenticated";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [config.origin],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  console.debug(req.originalUrl);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome on GamerHub API" });
});

app.use("/api", router);
app.use(errorHandler);

const server = http.createServer(app);

database.connect();
connectRedis();

const io = new Server(server, {
  cors: {
    origin: config.origin,
  },
});

io.use((socket, next) => {
  const token = socket.request.headers["Authorization"];
  verifyAuth(token as string)
    .then((user) => console.debug(user))
    .catch((err) => console.debug(err.message));
  next();
});
io.on("connection", (socket) => SocketConnectionHandler(io, socket));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.debug(`[server] Running on port ${PORT}`)
);

import express, { Application } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";

import database from "./services/database";
import router from "./router";
import config from "./config";
import { Server } from "socket.io";
import SocketConnectionHandler from "./socket";
import { verifyAuth } from "./middlewares/authenticated";

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: [config.origin],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Welcome on GamerHub API" });
});

app.use("/api", router);

const server = http.createServer(app);

database.connect();

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
  },
});
io.use((socket, next) => {
  console.log(socket.request.headers);
  
  const token = socket.request.headers["Authorization"];
  verifyAuth(token as string)
    .then((user) => console.log(user))
    .catch((err) => console.log(err));
  next();
});
io.on("connection", (socket) => SocketConnectionHandler(io, socket));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[server] Running on port ${PORT}`));

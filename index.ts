import promClient from "prom-client";
import responseTime from "response-time";
import { getLogger } from "./shared/tools/logger";
import { logError, logResponseTime } from "./middlewares/logs";
import express, { Application } from "express";
import http from "http";
import cors from "cors";
import database from "./services/database";
import router from "./router";
import config from "./config";
import { Server } from "socket.io";
import SocketConnectionHandler from "./socket";
import { verifyAuth } from "./middlewares/authenticated";
import cookieParser from 'cookie-parser';

const logger = getLogger();

const register = new promClient.Registry();
register.setDefaultLabels({
  app: "gamerhub_api",
});
promClient.collectDefaultMetrics({ register });

const app: Application = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [config.origin],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);
app.use((req, res, next) =>{
  console.log(req.originalUrl)
  next()
})

if (logger) {
  app.use(responseTime(logResponseTime));
}

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome on GamerHub API" });
});

app.use("/api", router);

if (logger) {
  app.use(logError);
}

const server = http.createServer(app);

database.connect();

const io = new Server(server, {
  cors: {
    origin: config.origin,
  },
});

io.use((socket, next) => {
  const token = socket.request.headers["Authorization"];
  verifyAuth(token as string)
    .then((user) => console.log(user))
    .catch((err) => console.log(err.message));
  next();
});
io.on("connection", (socket) => SocketConnectionHandler(io, socket));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => logger ? logger.info(`[server] Running on port ${PORT}`) : console.log(`[server] Running on port ${PORT}`));

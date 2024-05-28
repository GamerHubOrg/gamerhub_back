import { createLogger, transports, format, Logger } from "winston";
import LokiTransport from "winston-loki";

let logger: Logger;

const initializeLogger = () => {
  if (logger  || process.env.ENVIRONNEMENT !== "prod") {
    return;
  }

  logger = createLogger({
    transports: [
      new LokiTransport({
        host: "http://192.168.1.44:3100",
        labels: { app: "gamerhub_api" },
        json: true,
        format: format.json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error(err),
      }),
      new transports.Console({
        format: format.combine(format.simple(), format.colorize()),
      }),
    ],
  });
};

export const getLogger = () => {
  initializeLogger();
  return logger;
};

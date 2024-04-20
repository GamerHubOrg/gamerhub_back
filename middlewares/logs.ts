import { NextFunction, Request, Response } from 'express';
import { getLogger } from '../shared/tools/logger';

export const logResponseTime = (req: Request, res: Response, time: number) => {
  const logger = getLogger();
  const method = req.method;
  const url = req.url;
  const status = res.statusCode;

  logger.info({ message: `method=${method} url=${url} status=${status} duration=${time}ms`, labels: { url, 'origin': 'api', method, status, responseTime: time } });
};

export const logError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const method = req.method;
  const url = req.url;
  const status = res.statusCode;

  const logger = getLogger();
  logger.error({ message: `method=${method} url=${url} status=${status} error=${err.stack}`, labels: { url, 'origin': 'api', method, status } });
  next();
};
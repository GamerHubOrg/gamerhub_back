import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import promClient from 'prom-client';
import responseTime from 'response-time';

import database from './services/database';
import router from './router';
import config from './config';
import { getLogger } from './shared/tools/logger';
import { logError, logResponseTime } from './middlewares/logs';

const logger = getLogger();

const register = new promClient.Registry();
register.setDefaultLabels({
  app: 'gamerhub_api'
});
promClient.collectDefaultMetrics({ register });

const app: Application = express();

app.use(express.json());
app.use(cors({
  origin: [config.origin],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  credentials: true
}));

app.use(responseTime(logResponseTime));

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome on GamerHub API' });
});

app.use('/api', router);

app.use(logError);

const server = http.createServer(app);

database.connect();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => logger.info(`[server] Running on port ${PORT}`));
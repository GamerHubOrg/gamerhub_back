import express, { Application } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import promClient from 'prom-client';

import database from './services/database';
import router from './router';
import config from './config';

dotenv.config();

const register = new promClient.Registry();
register.setDefaultLabels({
  app: 'gamerhub_api'
});
promClient.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

register.registerMetric(httpRequestDurationMicroseconds);

const app: Application = express();

app.use(express.json());
app.use(cors({
  origin: [config.origin],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome on GamerHub API' });
});

app.use('/api', router);

const server = http.createServer(app);

database.connect();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[server] Running on port ${PORT}`));
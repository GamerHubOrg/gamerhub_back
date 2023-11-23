import express, { Application } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';

import database from './services/database';
import router from './router';
import config from './config';

dotenv.config();

const app: Application = express();
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
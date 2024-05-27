import dotenv from 'dotenv';

dotenv.config();

export default {
  origin: 'http://localhost:5174',
  database: {
    url: process.env.MONGO_URI || 'mon  godb://admin:admin@mongo:27017/database?authSource=admin',
  },
};
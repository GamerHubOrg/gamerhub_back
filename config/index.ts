import dotenv from 'dotenv';

dotenv.config();

export default {
  origin: process.env.ORIGIN || 'http://localhost:5174',
  database: {
    url: process.env.MONGO_URI || 'mongodb://admin:admin@mongo:27017/database?authSource=admin',
  },
  security: {
    salt: process.env.CRYTO_HASH_SALT || 'lkdsnaoklpsdnaskoldas',
    iteration: Number(process.env.CRYPTO_HASH_ITERATION) || 1000,
    tokenSecret: process.env.JWT_SECRET || 'dasdasda',
    refreshTokenSecret: process.env.REFRESH_JWT_SECRET || 'dpasdasdaddapda'
  }
};
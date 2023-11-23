export default {
  origin: 'http://localhost:5173',
  database: {
    url: process.env.MONGO_URI || 'mongodb://admin:admin@mongo:27017/database?authSource=admin',
  },
};
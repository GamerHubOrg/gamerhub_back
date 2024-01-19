export default {
  origin: 'http://localhost:5174',
  database: {
    url: process.env.MONGO_URI || 'mongodb://admin:admin@mongo:27017/database?authSource=admin',
  },
};
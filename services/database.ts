import mongoose from 'mongoose';
import config from '../config';

export default {
  async connect() {
    try {
      await mongoose.connect(config.database.url);
      console.log('[mongo] Database connected');
    } catch(err) {
      console.error(err);
    }
  }
};
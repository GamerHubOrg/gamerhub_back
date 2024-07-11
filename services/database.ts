import mongoose from 'mongoose';
import config from '../config';

export default {
  async connect() {
    try {
      await mongoose.connect(config.database.url);
      console.debug('[mongo] Database connected');
    } catch(err) {
      console.debug(err);
    }
  }
};
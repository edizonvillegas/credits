import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  await mongoose.connect(env.MONGO_URI);
}

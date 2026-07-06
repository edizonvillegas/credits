import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 3000),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/credits-api',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

import dotenv from 'dotenv';

dotenv.config();

const port = Number.parseInt(process.env.PORT ?? '5000', 10);

if (Number.isNaN(port)) {
  throw new Error('PORT must be a valid number.');
}

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required. Add it to your backend/.env file.');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long. Add it to your backend/.env file.');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET
};

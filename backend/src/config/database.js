import dns from 'node:dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function connectDatabase(mongoUri) {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

import mongoose from 'mongoose';

export async function connectDatabase(mongoUri) {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

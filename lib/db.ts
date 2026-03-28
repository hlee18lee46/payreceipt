import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI!;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGO_URI);
};

const MerchantSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export const Merchant = mongoose.models.Merchant || mongoose.model('Merchant', MerchantSchema);
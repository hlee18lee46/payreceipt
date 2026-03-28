import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI!;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGO_URI);
};

// --- MERCHANT SCHEMA ---
const MerchantSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Merchant =
  mongoose.models.Merchant || mongoose.model('Merchant', MerchantSchema);

// --- INVOICE SCHEMA ---
const InvoiceSchema = new mongoose.Schema({
  merchantAddress: { type: String, required: true, index: true },
  customerName: { type: String, default: "Guest" },

  amount: { type: Number, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      unitPriceTrx: { type: Number, required: true }
    }
  ],

  status: {
    type: String,
    enum: ['pending', 'paid', 'void'],
    default: 'pending',
    index: true
  },

  txId: { type: String, unique: true, sparse: true },
  paidAt: { type: Date },

  nftExplorer: { type: String, default: null },
  imageUrl: { type: String, default: null },
  metadataUri: { type: String, default: null },

  createdAt: { type: Date, default: Date.now }
});

export const Invoice =
  mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
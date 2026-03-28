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

export const Merchant = mongoose.models.Merchant || mongoose.model('Merchant', MerchantSchema);

// --- INVOICE SCHEMA ---
const InvoiceSchema = new mongoose.Schema({
  // Link to the merchant who issued it
  merchantAddress: { type: String, required: true, index: true },
  customerName: { type: String, default: "Guest" },
  
  // Financial Data
  amount: { type: Number, required: true }, // Total TRX
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPriceTrx: { type: Number, required: true }
  }],
  
  // Status Tracking
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'void'], 
    default: 'pending',
    index: true 
  },
  
  // Blockchain Data
  txId: { type: String, unique: true, sparse: true }, // Populated after payment
  paidAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
});

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
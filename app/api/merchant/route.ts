import { NextResponse } from "next/server";
import { connectDB, Merchant } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    const address = process.env.MERCHANT_ADDRESS;
    const merchant = await Merchant.findOne({ address });
    
    // Return the name from DB, or fallback to ReceiptPay
    return NextResponse.json({ name: merchant?.name || "ReceiptPay" });
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { address, name } = await request.json();

    if (!address || !name) {
      return NextResponse.json({ error: "Address and Name required" }, { status: 400 });
    }

    // Upsert: Update if address exists, otherwise create new
    const merchant = await Merchant.findOneAndUpdate(
      { address },
      { name },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Success", merchant });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}
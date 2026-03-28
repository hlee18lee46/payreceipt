import { NextResponse } from "next/server";
import { connectDB, Merchant } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    
    // We fetch using the Master Merchant address from your .env
    const envAddress = process.env.MERCHANT_ADDRESS;
    
    if (!envAddress) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    const merchant = await Merchant.findOne({ address: envAddress });
    
    if (!merchant) {
      // Return a fallback but include the expected address for the frontend check
      return NextResponse.json({ 
        name: "TRON_POS", 
        address: envAddress 
      });
    }

    // SUCCESS: Return both the name and the address 
    // This allows the "New Invoice" page to pass the (address === data.address) check
    return NextResponse.json({ 
      name: merchant.name, 
      address: merchant.address 
    });
  } catch (error) {
    console.error("GET Error:", error);
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
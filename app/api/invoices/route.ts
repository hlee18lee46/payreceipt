import { NextRequest, NextResponse } from "next/server";
import { connectDB, Invoice } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // 1. Get the address from the URL: /api/invoices?address=T...
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { ok: false, error: "Merchant address is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Fetch all invoices for this specific merchant
    const invoices = await Invoice.find({ 
      merchantAddress: address 
    }).sort({ createdAt: -1 });

    // 3. Return the array
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
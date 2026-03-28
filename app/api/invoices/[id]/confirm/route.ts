import { NextRequest, NextResponse } from "next/server";
import { connectDB, Invoice } from "@/lib/db";
import { TronWeb } from "tronweb";

// Initialize TronWeb for Nile Testnet verification
const tronWeb = new TronWeb({
  fullHost: "https://nile.trongrid.io",
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Standardized for Next.js 15
) {
  try {
    const { id } = await context.params; // CRITICAL: Must await params
    const { txId } = await req.json();

    if (!txId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
    }

    await connectDB();

    // 1. VERIFICATION: Check the Nile blockchain directly
    // This prevents users from "faking" a payment by just calling the API
    const txData = await tronWeb.trx.getTransaction(txId);
    
    const isSuccessful = 
      txData && 
      txData.ret && 
      txData.ret[0].contractRet === "SUCCESS";

    if (!isSuccessful) {
      return NextResponse.json({ error: "Transaction not found or failed on-chain" }, { status: 400 });
    }

    // 2. UPDATE: Mark as paid in MongoDB
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { 
        status: "paid", 
        txId: txId,
        paidAt: new Date() 
      },
      { new: true }
    );

    if (!updatedInvoice) {
      return NextResponse.json({ error: "Invoice record not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, invoice: updatedInvoice });
  } catch (error: any) {
    console.error("Confirmation Error:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
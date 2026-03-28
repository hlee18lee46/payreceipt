import { NextRequest, NextResponse } from "next/server";
import { connectDB, Invoice } from "@/lib/db";
import { TronWeb } from "tronweb";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { txId } = await req.json();

    if (!txId) return NextResponse.json({ error: "No TXID" }, { status: 400 });

    await connectDB();

    // 1. Verify Payment (Init inside POST to avoid 'window' error)
    const tronWeb = new TronWeb({ fullHost: "https://nile.trongrid.io" });
    const txData = await tronWeb.trx.getTransaction(txId);
    const isSuccessful = txData?.ret?.[0]?.contractRet === "SUCCESS";

    if (!isSuccessful) {
      return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
    }

    // 2. Initial Database Update
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { status: "paid", txId: txId, paidAt: new Date() },
      { returnDocument: "after" } 
    );

    if (!updatedInvoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // 3. AUTOMATIC NFT MINTING
    let finalInvoice = updatedInvoice;
    let mintData: any = null;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      
      const mintResponse = await fetch(`${baseUrl}/api/nft/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: updatedInvoice.merchantAddress, 
          amount: updatedInvoice.amount.toString(),
          name: updatedInvoice.customerName,
          description: `Payment for Invoice ${id}`,
        }),
      });

      mintData = await mintResponse.json();

      if (mintData.ok) {
        // Use the explorer link from mintData, or fallback to a constructed one
        const explorerUrl = mintData.explorer || `https://nile.tronscan.org/#/transaction/${mintData.txid}`;

        // 4. Update Database with NFT Links
        finalInvoice = await Invoice.findByIdAndUpdate(
          id, 
          { 
            nftExplorer: explorerUrl,
            imageUrl: mintData.imageUrl 
          },
          { returnDocument: "after" } 
        );
      }
    } catch (mintError) {
      console.error("NFT Generation/Minting failed:", mintError);
    }

    // 5. Final Response: Ensure 'nftExplorer' is sent at the top level
    return NextResponse.json({ 
      ok: true, 
      invoice: finalInvoice,
      // Mapping these so handlePayment's setInvoice finds them
      nftExplorer: finalInvoice.nftExplorer,
      imageUrl: finalInvoice.imageUrl 
    });

  } catch (error: any) {
    console.error("Confirmation Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
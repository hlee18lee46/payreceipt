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

    if (!txId) {
      return NextResponse.json({ ok: false, error: "No TXID" }, { status: 400 });
    }

    await connectDB();

    const tronWeb = new TronWeb({ fullHost: "https://nile.trongrid.io" });

    const txData = await tronWeb.trx.getTransaction(txId);
    console.log("confirm txData:", JSON.stringify(txData, null, 2));

    const isSuccessful = txData?.ret?.[0]?.contractRet === "SUCCESS";

    if (!isSuccessful) {
      return NextResponse.json(
        { ok: false, error: "Payment not verified", txData },
        { status: 400 }
      );
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { status: "paid", txId, paidAt: new Date() },
      { new: true }
    );

    if (!updatedInvoice) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let mintData: any = null;
    let finalInvoice = updatedInvoice;

    try {
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

      console.log("mintResponse.status:", mintResponse.status);

      mintData = await mintResponse.json();
      console.log("mintData:", JSON.stringify(mintData, null, 2));

      if (!mintResponse.ok || !mintData?.ok) {
        return NextResponse.json({
          ok: false,
          error: "NFT mint failed",
          invoice: updatedInvoice,
          mintData,
        }, { status: 500 });
      }

      const explorerUrl =
        mintData.explorer ||
        mintData.nftExplorer ||
        (mintData.txid ? `https://nile.tronscan.org/#/transaction/${mintData.txid}` : null);

      if (!explorerUrl) {
        return NextResponse.json({
          ok: false,
          error: "Mint succeeded but explorer URL missing",
          invoice: updatedInvoice,
          mintData,
        }, { status: 500 });
      }

      finalInvoice = await Invoice.findByIdAndUpdate(
        id,
        {
          nftExplorer: explorerUrl,
          imageUrl: mintData.imageUrl || null,
        },
        { new: true }
      );

      console.log("finalInvoice after mint update:", JSON.stringify(finalInvoice, null, 2));
    } catch (mintError: any) {
      console.error("NFT Generation/Minting failed:", mintError);
      return NextResponse.json(
        {
          ok: false,
          error: "NFT Generation/Minting failed",
          details: mintError?.message || String(mintError),
          invoice: updatedInvoice,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      invoice: finalInvoice,
      nftExplorer: finalInvoice?.nftExplorer || null,
      imageUrl: finalInvoice?.imageUrl || null,
    });
  } catch (error: any) {
    console.error("Confirmation Error:", error);
    return NextResponse.json(
      { ok: false, error: "Update failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
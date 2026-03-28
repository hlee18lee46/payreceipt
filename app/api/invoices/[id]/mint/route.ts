import { NextResponse } from "next/server"
import { getInvoiceById } from "@/lib/invoices"

export const runtime = "nodejs"

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const invoice = getInvoiceById(id)

  if (!invoice) {
    return NextResponse.json(
      { ok: false, error: "Invoice not found" },
      { status: 404 }
    )
  }

  if (invoice.status !== "paid") {
    return NextResponse.json(
      { ok: false, error: "Invoice not paid yet" },
      { status: 400 }
    )
  }

  // ⚡ Step 1: generate assets
  const assetRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/invoices/${id}/assetize`,
    { method: "POST" }
  )

  const assetData = await assetRes.json()

  const previewImageUrl = assetData.previewImageUrl
  const pdfUrl = assetData.pdfUrl

  // ⚡ Step 2: build metadata
  const metadata = {
    name: `Receipt #${invoice.id}`,
    description: `Payment receipt for ${invoice.merchantName}`,
    image: previewImageUrl,
    external_url: pdfUrl,
    attributes: [
      { trait_type: "Merchant", value: invoice.merchantName },
      { trait_type: "Total", value: `${invoice.totalTrx} TRX` },
      { trait_type: "Status", value: "Paid" },
    ],
  }

  // ⚡ Step 3: upload metadata to Pinata
  const pinataJwt = process.env.PINATA_JWT

  const metaRes = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: JSON.stringify(metadata),
    }
  )

  const metaData = await metaRes.json()
  const metadataUri = `${process.env.PINATA_GATEWAY}/${metaData.IpfsHash}`

  // ⚡ Step 4: call your TRON mint API
const mintRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/nft/mint`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: updatedInvoice.merchantAddress,
    amount: updatedInvoice.amount,
    name: updatedInvoice.customerName,
    description: `Invoice ${id} Paid`
  })
});
  const mintData = await mintRes.json()

  return NextResponse.json({
      ok: true,
      metadataUri,
      // Add these lines to ensure the frontend sees the links:
      txid: mintData.txid,
      explorer: mintData.explorer, 
      imageUrl: mintData.imageUrl,
      mintResult: mintData,
    });
  }
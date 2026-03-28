import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { connectDB, Invoice } from "@/lib/db" // Added DB imports
import { TronWeb } from "tronweb"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const merchantName = body?.merchantName?.trim()
    const merchantWallet = body?.merchantWallet?.trim()
    const customerName = body?.customerName?.trim() || "Guest Customer"
    const items = body?.items

    // 1. Validation Logic
    if (!merchantName || !merchantWallet) {
      return NextResponse.json(
        { ok: false, error: "Merchant details are required" },
        { status: 400 }
      )
    }

    if (!TronWeb.isAddress(merchantWallet)) {
      return NextResponse.json(
        { ok: false, error: "Invalid TRON wallet address" },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "At least one invoice item is required" },
        { status: 400 }
      )
    }

    // 2. Normalize and calculate totals
    const normalizedItems = items.map((item) => ({
      name: String(item.name ?? "").trim(),
      quantity: Number(item.quantity ?? 0),
      unitPriceTrx: Number(item.unitPriceTrx ?? 0),
    }))

    const totalTrx = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceTrx,
      0
    )

    // 3. Connect to MongoDB
    await connectDB()

    // 4. Create the Invoice in Database
    // We let MongoDB generate the unique _id
    const newInvoice = await Invoice.create({
      merchantAddress: merchantWallet,
      customerName: customerName,
      amount: totalTrx,
      items: normalizedItems,
      status: 'pending', // 'pending' matches your AR (Accounts Receivable) logic
    })

    const id = newInvoice._id.toString()

    // 5. Generate Checkout URL and QR Code
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const checkoutUrl = `${appUrl}/pay/${id}`

    const qrDataUrl = await QRCode.toDataURL(checkoutUrl, {
      width: 280,
      margin: 2,
    })

    // 6. Return the combined data
    return NextResponse.json({
      ok: true,
      invoice: {
        id,
        merchantName,
        merchantWallet,
        customerName,
        items: normalizedItems,
        totalTrx,
        status: "pending",
        checkoutUrl,
        qrDataUrl,
        createdAt: newInvoice.createdAt,
      },
    })
  } catch (error) {
    console.error("Invoice Creation Error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    )
  }
}
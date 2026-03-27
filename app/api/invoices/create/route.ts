import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { createInvoice, InvoiceItem } from "@/lib/invoices"
import { TronWeb } from "tronweb"

export const runtime = "nodejs"

function makeInvoiceId() {
  return `inv_${Date.now()}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const merchantName = body?.merchantName?.trim()
    const merchantWallet = body?.merchantWallet?.trim()
    const customerName = body?.customerName?.trim() || ""
    const items = body?.items as InvoiceItem[]

    if (!merchantName) {
      return NextResponse.json(
        { ok: false, error: "merchantName is required" },
        { status: 400 }
      )
    }

    if (!merchantWallet) {
      return NextResponse.json(
        { ok: false, error: "merchantWallet is required" },
        { status: 400 }
      )
    }

    if (!TronWeb.isAddress(merchantWallet)) {
      return NextResponse.json(
        { ok: false, error: "Invalid merchantWallet address" },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "At least one invoice item is required" },
        { status: 400 }
      )
    }

    const normalizedItems = items.map((item) => ({
      name: String(item.name ?? "").trim(),
      quantity: Number(item.quantity ?? 0),
      unitPriceTrx: Number(item.unitPriceTrx ?? 0),
    }))

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !item.name ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unitPriceTrx) ||
        item.unitPriceTrx < 0
    )

    if (hasInvalidItem) {
      return NextResponse.json(
        { ok: false, error: "Invalid invoice items" },
        { status: 400 }
      )
    }

    const subtotalTrx = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceTrx,
      0
    )

    const totalTrx = subtotalTrx
    const id = makeInvoiceId()

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://payreceipt.vercel.app"
    const checkoutUrl = `${appUrl}/pay/${id}`

    const qrDataUrl = await QRCode.toDataURL(checkoutUrl, {
      width: 280,
      margin: 2,
    })

    const invoice = createInvoice({
      id,
      merchantName,
      merchantWallet,
      customerName,
      items: normalizedItems,
      subtotalTrx,
      totalTrx,
      status: "unpaid",
      checkoutUrl,
      qrDataUrl,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      invoice,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
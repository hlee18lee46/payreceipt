import { NextResponse } from "next/server"
import { getInvoiceById, updateInvoice } from "@/lib/invoices"

export const runtime = "nodejs"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const body = await req.json()

  const txid = body?.txid
  if (!txid) {
    return NextResponse.json(
      { ok: false, error: "txid is required" },
      { status: 400 }
    )
  }

  const invoice = getInvoiceById(id)
  if (!invoice) {
    return NextResponse.json(
      { ok: false, error: "Invoice not found" },
      { status: 404 }
    )
  }

  // mark as paid
  const updated = updateInvoice(id, {
    status: "paid",
    paymentTxid: txid,
  })

  return NextResponse.json({
    ok: true,
    invoice: updated,
  })
}
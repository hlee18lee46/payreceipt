import { NextResponse } from "next/server"
import { getInvoiceById } from "@/lib/invoices"

export const runtime = "nodejs"

export async function GET(
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

  return NextResponse.json({ ok: true, invoice })
}
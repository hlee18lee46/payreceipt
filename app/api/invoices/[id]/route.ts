import { NextResponse } from "next/server"
import { connectDB, Invoice } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params for the dynamic [id] route
    const { id } = await context.params

    // 2. Connect to the database
    await connectDB()

    // 3. Find the invoice by MongoDB _id
    const invoice = await Invoice.findById(id)

    if (!invoice) {
      return NextResponse.json(
        { ok: false, error: "Invoice not found" },
        { status: 404 }
      )
    }

    // 4. Return the database record
    return NextResponse.json({ 
      ok: true, 
      invoice: {
        id: invoice._id,
        merchantAddress: invoice.merchantAddress,
        customerName: invoice.customerName,
        amount: invoice.amount,
        items: invoice.items,
        status: invoice.status,
        txId: invoice.txId,
        createdAt: invoice.createdAt
      }
    })
  } catch (error) {
    console.error("Fetch Invoice Error:", error)
    return NextResponse.json(
      { ok: false, error: "Invalid invoice ID format" },
      { status: 400 }
    )
  }
}
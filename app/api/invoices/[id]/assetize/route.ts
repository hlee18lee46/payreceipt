import { NextResponse } from "next/server"
import { chromium } from "playwright"
import fs from "node:fs/promises"
import path from "node:path"
import { getInvoiceById, updateInvoice } from "@/lib/invoices"

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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1800 },
      deviceScaleFactor: 2,
    })

    await page.goto(`${appUrl}/invoice/${id}/print`, {
      waitUntil: "networkidle",
    })

    const outputDir = path.join(process.cwd(), "public", "generated", id)
    await fs.mkdir(outputDir, { recursive: true })

    const pngPath = path.join(outputDir, "invoice-preview.png")
    const pdfPath = path.join(outputDir, "invoice.pdf")

    await page.screenshot({
      path: pngPath,
      fullPage: true,
      type: "png",
    })

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "24px",
        right: "24px",
        bottom: "24px",
        left: "24px",
      },
    })

    const previewImagePath = `/generated/${id}/invoice-preview.png`
    const generatedPdfPath = `/generated/${id}/invoice.pdf`

    updateInvoice(id, {
      previewImagePath,
      pdfPath: generatedPdfPath,
    })

    return NextResponse.json({
      ok: true,
      previewImageUrl: `${appUrl}${previewImagePath}`,
      pdfUrl: `${appUrl}${generatedPdfPath}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  } finally {
    await browser.close()
  }
}
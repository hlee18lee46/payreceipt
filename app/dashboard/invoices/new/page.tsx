"use client"

import { useState } from "react"

type Item = {
  name: string
  quantity: number
  unitPriceTrx: number
}

export default function NewInvoicePage() {
  const [merchantName, setMerchantName] = useState("ReceiptPay Coffee")
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<Item[]>([
    { name: "Large Coffee", quantity: 1, unitPriceTrx: 4 },
    { name: "Bagel", quantity: 1, unitPriceTrx: 3 },
  ])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const updateItem = (index: number, key: keyof Item, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]:
                key === "name" ? value : Number(value),
            }
          : item
      )
    )
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { name: "", quantity: 1, unitPriceTrx: 0 },
    ])
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantName, customerName, items }),
      })

      const data = await res.json()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAssets = async () => {
    if (!result?.invoice?.id) return

    setLoading(true)
    try {
      const res = await fetch(`/api/invoices/${result.invoice.id}/assetize`, {
        method: "POST",
      })
      const data = await res.json()
      setResult((prev: any) => ({ ...prev, assets: data }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-3xl font-bold">Create Invoice</h1>

      <div className="rounded-xl border p-6 space-y-4">
        <input
          className="w-full rounded border px-3 py-2"
          value={merchantName}
          onChange={(e) => setMerchantName(e.target.value)}
          placeholder="Merchant name"
        />

        <input
          className="w-full rounded border px-3 py-2"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name (optional)"
        />

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-3">
            <input
              className="rounded border px-3 py-2"
              value={item.name}
              onChange={(e) => updateItem(index, "name", e.target.value)}
              placeholder="Item"
            />
            <input
              className="rounded border px-3 py-2"
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
              placeholder="Qty"
            />
            <input
              className="rounded border px-3 py-2"
              type="number"
              value={item.unitPriceTrx}
              onChange={(e) => updateItem(index, "unitPriceTrx", e.target.value)}
              placeholder="Price in TRX"
            />
          </div>
        ))}

        <div className="flex gap-3">
          <button
            onClick={addItem}
            className="rounded bg-neutral-200 px-4 py-2"
          >
            Add Item
          </button>

          <button
            onClick={handleCreate}
            className="rounded bg-black px-4 py-2 text-white"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>

          <button
            onClick={handleGenerateAssets}
            className="rounded bg-blue-600 px-4 py-2 text-white"
            disabled={loading || !result?.invoice?.id}
          >
            {loading ? "Generating..." : "Generate PDF + Image"}
          </button>
        </div>
      </div>

      {result?.invoice && (
        <div className="rounded-xl border p-6 space-y-3">
          <h2 className="text-xl font-semibold">Invoice Created</h2>
          <p><strong>ID:</strong> {result.invoice.id}</p>
          <p>
            <strong>Checkout URL:</strong>{" "}
            <a className="text-blue-600 underline" href={result.invoice.checkoutUrl}>
              {result.invoice.checkoutUrl}
            </a>
          </p>
          <img
            src={result.invoice.qrDataUrl}
            alt="QR code"
            className="h-48 w-48 border rounded"
          />
        </div>
      )}

      {result?.assets?.ok && (
        <div className="rounded-xl border p-6 space-y-3">
          <h2 className="text-xl font-semibold">Generated Assets</h2>
          <p>
            <a className="text-blue-600 underline" href={result.assets.previewImageUrl}>
              Preview Image
            </a>
          </p>
          <p>
            <a className="text-blue-600 underline" href={result.assets.pdfUrl}>
              PDF Invoice
            </a>
          </p>
          <img
            src={result.assets.previewImageUrl}
            alt="Invoice preview"
            className="max-w-full rounded border"
          />
        </div>
      )}
    </main>
  )
}
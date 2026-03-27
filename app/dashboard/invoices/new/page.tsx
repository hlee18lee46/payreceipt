"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header" // Adjusted to match your export
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { Plus, Receipt, FileText, ExternalLink, Loader2 } from "lucide-react"

type Item = {
  name: string
  quantity: number
  unitPriceTrx: number
}

export default function NewInvoicePage() {
  // 1. WALLET HOOK
  const { address, connected } = useWallet()

  // 2. STATE MANAGEMENT
  const [merchantName, setMerchantName] = useState("ReceiptPay Merchant")
  const [merchantWallet, setMerchantWallet] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<Item[]>([
    { name: "Service/Product", quantity: 1, unitPriceTrx: 10 },
  ])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 3. AUTO-SYNC WALLET ADDRESS
  useEffect(() => {
    if (connected && address) {
      setMerchantWallet(address)
    }
  }, [connected, address])

  const updateItem = (index: number, key: keyof Item, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [key]: key === "name" ? value : Number(value) }
          : item
      )
    )
  }

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", quantity: 1, unitPriceTrx: 0 }])
  }

  const handleCreate = async () => {
    if (!merchantWallet) {
      alert("Please connect a wallet or enter a merchant address.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          merchantName, 
          merchantWallet, 
          customerName, 
          items 
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create invoice")
      setResult(data)
    } catch (err: any) {
      alert(err.message)
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
    <div className="min-h-screen bg-neutral-50/50">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">New Invoice</h1>
            <p className="text-neutral-500">Create a TRON payment request for your customer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: FORM INPUTS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-neutral-500">Merchant Name</label>
                  <input
                    className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-neutral-500">Customer Name</label>
                  <input
                    className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Guest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-neutral-500">Settlement Wallet</label>
                <div className="relative">
                   <input
                    className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-600 outline-none"
                    value={merchantWallet}
                    onChange={(e) => setMerchantWallet(e.target.value)}
                    placeholder="T..."
                  />
                  {!connected && (
                    <span className="absolute right-3 top-2 text-[10px] text-amber-600 font-bold">WALLET DISCONNECTED</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-neutral-500">Line Items</label>
                  <button onClick={addItem} className="text-xs flex items-center gap-1 font-bold text-primary hover:underline">
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      className="flex-[3] rounded-md border border-neutral-200 px-3 py-2 text-sm"
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      placeholder="Item name"
                    />
                    <input
                      className="flex-[1] rounded-md border border-neutral-200 px-3 py-2 text-sm text-center"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    />
                    <input
                      className="flex-[1.5] rounded-md border border-neutral-200 px-3 py-2 text-sm text-right"
                      type="number"
                      value={item.unitPriceTrx}
                      onChange={(e) => updateItem(index, "unitPriceTrx", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                {loading ? "Processing..." : "Create Invoice"}
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW / RESULT */}
          <div className="space-y-6">
            {!result ? (
              <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-neutral-400">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">Invoice preview will appear here</p>
              </div>
            ) : (
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6 sticky top-24">
                <div className="text-center space-y-2">
                  <img src={result.invoice.qrDataUrl} alt="QR" className="mx-auto h-40 w-40 border rounded-lg p-2" />
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Scan to Pay</p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-1">
                     <p className="text-xs text-neutral-500 font-bold uppercase">Payment Link</p>
                     <a href={result.invoice.checkoutUrl} target="_blank" className="text-sm text-primary underline break-all flex items-center gap-1">
                        View Checkout <ExternalLink className="h-3 w-3" />
                     </a>
                  </div>

                  <button
                    onClick={handleGenerateAssets}
                    disabled={loading || result.assets}
                    className="w-full rounded-md border border-primary text-primary px-4 py-2 text-xs font-bold hover:bg-primary/5 transition disabled:opacity-50"
                  >
                    {result.assets ? "Assets Generated" : "Generate PDF & Image"}
                  </button>

                  {result.assets && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                       <a href={result.assets.pdfUrl} target="_blank" className="text-[10px] font-bold text-center p-2 rounded bg-neutral-100 hover:bg-neutral-200 transition">DOWNLOAD PDF</a>
                       <a href={result.assets.previewImageUrl} target="_blank" className="text-[10px] font-bold text-center p-2 rounded bg-neutral-100 hover:bg-neutral-200 transition">VIEW IMAGE</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
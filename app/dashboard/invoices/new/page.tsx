"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { Plus, Receipt, FileText, ExternalLink, Loader2, Trash2 } from "lucide-react"

type Item = {
  name: string
  quantity: number
  unitPriceTrx: number
}

export default function NewInvoicePage() {
  const { address, connected } = useWallet()

  const [merchantName, setMerchantName] = useState("ReceiptPay Merchant")
  const [merchantWallet, setMerchantWallet] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<Item[]>([
    { name: "Service/Product", quantity: 1, unitPriceTrx: 10 },
  ])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Calculate total locally for the preview
  const totalTrx = useMemo(() => 
    items.reduce((sum, item) => sum + (item.quantity * item.unitPriceTrx), 0),
    [items]
  )

  useEffect(() => {
    // Only auto-fill if empty to avoid overwriting manual changes
    if (connected && address && !merchantWallet) {
      setMerchantWallet(address)
    }
  }, [connected, address, merchantWallet])

  const updateItem = (index: number, key: keyof Item, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [key]: key === "name" ? String(value) : Number(value) }
          : item
      )
    )
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
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
        body: JSON.stringify({ merchantName, merchantWallet, customerName, items }),
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

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">New Invoice</h1>
          <p className="text-neutral-500">Generate a secure TRON payment request.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: FORM INPUTS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-400">Merchant Name</label>
                  <input
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 outline-none transition"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-400">Customer Name</label>
                  <input
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 outline-none transition"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-neutral-400">Settlement Wallet (TRX)</label>
                <div className="relative">
                   <input
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-600 outline-none"
                    value={merchantWallet}
                    onChange={(e) => setMerchantWallet(e.target.value)}
                    placeholder="T..."
                  />
                  {!connected && (
                    <span className="absolute right-3 top-2.5 text-[9px] text-amber-600 font-black tracking-tighter">DISCONNECTED</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-neutral-400">Line Items</label>
                  <button onClick={addItem} className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700">
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        className="flex-[4] rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none"
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        placeholder="Description"
                      />
                      <input
                        className="w-16 rounded-lg border border-neutral-200 px-2 py-2 text-sm text-center outline-none"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      />
                      <input
                        className="w-24 rounded-lg border border-neutral-200 px-2 py-2 text-sm text-right outline-none"
                        type="number"
                        value={item.unitPriceTrx}
                        onChange={(e) => updateItem(index, "unitPriceTrx", e.target.value)}
                      />
                      <button 
                        onClick={() => removeItem(index)}
                        className="p-2 text-neutral-300 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-500">Invoice Total</span>
                <span className="text-xl font-bold">{totalTrx} TRX</span>
              </div>

              <button
                onClick={handleCreate}
                disabled={loading || items.some(i => !i.name)}
                className="w-full rounded-xl bg-black py-4 font-bold text-white hover:bg-neutral-800 transition disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Receipt className="h-5 w-5" />}
                {loading ? "Creating..." : "Issue Invoice"}
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW / RESULT */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            {!result ? (
              <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-neutral-200" />
                <p className="text-sm font-medium text-neutral-400">Submit the form to generate<br/>the payment QR code.</p>
              </div>
            ) : (
              <div className="rounded-2xl border bg-white p-8 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-white border-4 border-neutral-50 rounded-2xl shadow-inner">
                    <img src={result.invoice.qrDataUrl} alt="QR" className="h-44 w-44" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Scan to Pay Merchant</p>
                    <p className="text-sm font-mono text-neutral-500 mt-1">{result.invoice.id}</p>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t">
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-neutral-400 uppercase">Checkout URL</p>
                     <div className="flex gap-2">
                        <input 
                          readOnly 
                          value={result.invoice.checkoutUrl} 
                          className="flex-1 bg-neutral-50 text-[11px] px-3 py-2 rounded border font-mono text-neutral-500 overflow-hidden text-ellipsis"
                        />
                        <a 
                          href={result.invoice.checkoutUrl} 
                          target="_blank" 
                          className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                     </div>
                  </div>

                  <button
                    onClick={handleGenerateAssets}
                    disabled={loading || result.assets}
                    className="w-full rounded-xl border-2 border-black py-3 text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    {loading && result.invoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {result.assets ? "Documents Ready" : "Generate PDF & Image"}
                  </button>

                  {result.assets && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                       <a href={result.assets.pdfUrl} target="_blank" className="text-[10px] font-bold text-center py-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition">DOWNLOAD PDF</a>
                       <a href={result.assets.previewImageUrl} target="_blank" className="text-[10px] font-bold text-center py-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition">VIEW IMAGE</a>
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
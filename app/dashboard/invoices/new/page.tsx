"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { 
  Plus, 
  Receipt, 
  FileText, 
  ExternalLink, 
  Loader2, 
  Trash2, 
  ShieldAlert, 
  Lock,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Item = {
  name: string
  quantity: number
  unitPriceTrx: number
}

export default function NewInvoicePage() {
  const { address, connected } = useWallet()

  // Authorization & Loading States
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loading, setLoading] = useState(false)

  // Form States
  const [merchantName, setMerchantName] = useState("TRON_POS Merchant")
  const [merchantWallet, setMerchantWallet] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<Item[]>([
    { name: "Service/Product", quantity: 1, unitPriceTrx: 10 },
  ])
  const [result, setResult] = useState<any>(null)

  // 1. Authorization Check
  useEffect(() => {
    const verifyMerchant = async () => {
      // If no wallet is connected, they definitely aren't the merchant
      if (!connected || !address) {
        setIsAuthorized(false)
        setCheckingAuth(false)
        return
      }

      try {
        const res = await fetch("/api/merchant")
        const data = await res.json()
        
        // Compare connected address to the address associated with the Merchant Name in DB
        // Ensure your GET /api/merchant returns { "address": "T..." }
        if (data.address && address === data.address) {
          setIsAuthorized(true)
          setMerchantName(data.name || "TRON_POS Merchant")
          setMerchantWallet(address)
        } else {
          setIsAuthorized(false)
        }
      } catch (err) {
        setIsAuthorized(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    verifyMerchant()
  }, [connected, address])

  // 2. Calculation Logic
  const totalTrx = useMemo(() => 
    items.reduce((sum, item) => sum + (item.quantity * item.unitPriceTrx), 0),
    [items]
  )

  // 3. Form Handlers
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

  // --- RENDER LOGIC ---

  // A. Still Checking Authorization
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50/50">
        <Header />
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-neutral-500">Authenticating Merchant...</p>
        </div>
      </div>
    )
  }

  // B. Unauthorized Access
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-50/50">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24">
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 shadow-sm text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Access Restricted</h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Your wallet <span className="font-mono text-neutral-900 font-bold">{address?.slice(0,6)}...</span> is not registered as the master merchant, please apply to become our partner merchant.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <Button asChild className="w-full rounded-xl py-6 font-bold shadow-lg shadow-primary/20">
                <Link href="/merchant/signup">Apply for Merchant Access</Link>
              </Button>
              <Link href="/" className="block text-xs font-bold text-neutral-400 uppercase tracking-widest hover:text-neutral-600 transition">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // C. Authorized Merchant View
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Issue New Invoice</h1>
            <p className="text-neutral-500">The customer will scan the QR code to pay instantly.</p>
          </div>
          <div className="hidden md:block rounded-full bg-green-50 px-4 py-1 border border-green-100">
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Authorized Merchant</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: FORM INPUTS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-400">Merchant Identity</label>
                  <input
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none text-neutral-500 cursor-not-allowed"
                    value={merchantName}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-400">Customer Display Name</label>
                  <input
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 outline-none transition"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Guest Customer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-neutral-400">Settlement Wallet (Auto-verified)</label>
                <div className="relative">
                   <input
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-400 outline-none"
                    value={merchantWallet}
                    readOnly
                  />
                  <div className="absolute right-3 top-2.5">
                    <ShieldAlert className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-neutral-400">Billable Items</label>
                  <button onClick={addItem} className="text-xs flex items-center gap-1 font-bold text-primary hover:underline">
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start animate-in slide-in-from-left-2">
                      <input
                        className="flex-[4] rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400 transition"
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
                <span className="text-xl font-bold text-neutral-900">{totalTrx} TRX</span>
              </div>

              <button
                onClick={handleCreate}
                disabled={loading || items.some(i => !i.name)}
                className="w-full rounded-xl bg-neutral-900 py-4 font-bold text-white hover:bg-black transition disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-neutral-200"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Receipt className="h-5 w-5" />}
                {loading ? "Creating..." : "Generate Payment Request"}
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW / RESULT */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            {!result ? (
              <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center bg-white/50">
                <FileText className="h-12 w-12 mx-auto mb-4 text-neutral-200" />
                <p className="text-sm font-medium text-neutral-400 leading-relaxed">Fill out the details to generate<br/>the merchant QR and checkout link.</p>
              </div>
            ) : (
              <div className="rounded-2xl border bg-white p-8 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-white border-8 border-neutral-50 rounded-3xl shadow-inner">
                    <img src={result.invoice.qrDataUrl} alt="QR" className="h-48 w-48" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Scan to Pay via TRON</p>
                    <p className="text-xs font-mono text-neutral-400 mt-1">REF: {result.invoice.id}</p>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t">
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-neutral-400 uppercase">Secure Checkout URL</p>
                     <div className="flex gap-2">
                        <input 
                          readOnly 
                          value={result.invoice.checkoutUrl} 
                          className="flex-1 bg-neutral-50 text-[11px] px-3 py-2 rounded border font-mono text-neutral-500 overflow-hidden text-ellipsis outline-none"
                        />
                        <a 
                          href={result.invoice.checkoutUrl} 
                          target="_blank" 
                          className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition shadow-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                     </div>
                  </div>

                  <button
                    onClick={handleGenerateAssets}
                    disabled={loading || result.assets}
                    className="w-full rounded-xl border-2 border-neutral-900 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    {loading && result.invoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {result.assets ? "Assets Generated" : "Finalize PDF & Metadata"}
                  </button>

                  {result.assets && (
                    <div className="grid grid-cols-2 gap-3 pt-2 animate-in slide-in-from-bottom-2">
                       <a href={result.assets.pdfUrl} target="_blank" className="text-[10px] font-bold text-center py-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition border border-neutral-200">DOWNLOAD PDF</a>
                       <a href={result.assets.previewImageUrl} target="_blank" className="text-[10px] font-bold text-center py-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition border border-neutral-200">VIEW NFT PREVIEW</a>
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
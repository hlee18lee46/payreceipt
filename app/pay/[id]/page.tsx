"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, Wallet, ReceiptText, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export default function CheckoutPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)

  // 1. Fetch Invoice Details from MongoDB
  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // FIX: Extract data.invoice because the API returns { ok: true, invoice: {...} }
        if (data.ok && data.invoice) {
          setInvoice(data.invoice)
        } else {
          toast.error(data.error || "Invoice not found")
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to load invoice")
        setLoading(false)
      })
  }, [id])

const handlePayment = async () => {
  if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
    toast.error("Please install and unlock TronLink");
    return;
  }

  setPaying(true);
  try {
    const sunAmount = window.tronWeb.toSun(invoice.amount);
    
    // 1. Send Transaction
    const transaction = await window.tronWeb.trx.sendTransaction(
      invoice.merchantAddress,
      sunAmount
    );

    // 2. Extract Hash (Handling different TronLink versions)
    // Some versions use .txid, others use .transaction.txID
    const hash = transaction.txid || (transaction.transaction && transaction.transaction.txID);

    if (transaction.result || transaction.txid) {
      // 3. Update Local State immediately to show success screen
      setTxId(hash);
      
      // 4. Update Database
      const response = await fetch(`/api/invoices/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txId: hash }),
      });

      if (response.ok) {
        toast.success("Payment verified and recorded!");
      } else {
        console.error("Failed to update database, but payment was sent.");
      }
    } else {
      toast.error("Transaction failed to broadcast.");
    }
  } catch (error) {
    console.error("TronLink Error:", error);
    toast.error("User rejected the signature or insufficient funds.");
  } finally {
    setPaying(false);
  }
};

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  // Handle case where invoice wasn't found after loading
  if (!invoice) return (
    <div className="flex h-screen items-center justify-center text-muted-foreground">
      Invoice not found.
    </div>
  )

  if (txId || invoice.status === 'paid') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center border-green-500/20 shadow-2xl">
            <CardContent className="pt-10 pb-10 space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Payment Confirmed</CardTitle>
              <p className="text-muted-foreground text-sm">
                This invoice has been settled on the TRON blockchain.
              </p>
              { (txId || invoice.txId) && (
                <Button asChild variant="outline" className="w-full mt-4 font-mono text-xs">
                  <a href={`https://nile.tronscan.org/#/transaction/${txId || invoice.txId}`} target="_blank" rel="noreferrer">
                    View: {(txId || invoice.txId).slice(0, 16)}...
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <Header />
      <main className="mx-auto max-w-xl px-6 py-16">
        <Card className="shadow-xl border-none overflow-hidden">
          <CardHeader className="text-center space-y-1 bg-neutral-900 text-white py-10">
            <ReceiptText className="mx-auto h-10 w-10 mb-2 opacity-30" />
            <CardTitle className="text-2xl tracking-tight">Invoice for {invoice.customerName}</CardTitle>
            <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">{id}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8 bg-white">
            <div className="flex justify-between items-end border-b pb-6">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Amount</p>
                <p className="text-4xl font-black text-neutral-900 leading-none mt-1">
                  {invoice.amount} <span className="text-lg font-medium text-neutral-400">TRX</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Payout To</p>
                <p className="text-sm font-bold text-neutral-900 flex items-center gap-1 justify-end">
                  <ShieldCheck className="h-3 w-3 text-green-500" /> Merchant Verified
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Order Summary</h3>
              {/* FIX: Optional chaining added for safety */}
              {invoice?.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-neutral-50 last:border-0">
                  <span className="text-neutral-600 font-medium">{item.name} <span className="text-neutral-400 text-xs">x{item.quantity}</span></span>
                  <span className="font-bold text-neutral-900">{item.unitPriceTrx * item.quantity} TRX</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={handlePayment} 
              disabled={paying}
              className="w-full h-16 text-lg font-bold gap-3 shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
            >
              {paying ? <Loader2 className="animate-spin" /> : <Wallet className="h-6 w-6" />}
              {paying ? "Awaiting Signature..." : `Pay ${invoice.amount} TRX Now`}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-4 opacity-40">
              <div className="h-[1px] w-8 bg-neutral-300" />
              <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">TRON Secure Network</p>
              <div className="h-[1px] w-8 bg-neutral-300" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, Wallet, ReceiptText, ShieldCheck, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function CheckoutPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = () => {
      fetch(`/api/invoices/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.invoice) {
            setInvoice(data.invoice)
          } else {
            toast.error(data.error || "Invoice not found")
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Fetch Error:", err)
          setLoading(false)
        })
    }

    fetchInvoice()
  }, [id])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (invoice?.status === "paid" && !invoice?.nftExplorer) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/invoices/${id}`)
          if (!res.ok) throw new Error("Network response was not ok")

          const data = await res.json()
          if (data.ok && data.invoice?.nftExplorer) {
            setInvoice(data.invoice)
            clearInterval(interval)
          }
        } catch (err) {
          console.error("Polling error (silent):", err)
        }
      }, 3000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [invoice?.status, invoice?.nftExplorer, id])

  const handlePayment = async () => {
    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
      toast.error("Please install and unlock TronLink")
      return
    }

    setPaying(true)

    try {
      const sunAmount = window.tronWeb.toSun(invoice.amount)

      const transaction = await window.tronWeb.trx.sendTransaction(
        invoice.merchantAddress,
        sunAmount
      )

      const hash = transaction.txid || (transaction.transaction && transaction.transaction.txID)

      if (hash) {
        setTxId(hash)

        const response = await fetch(`/api/invoices/${id}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txId: hash }),
        })

        const data = await response.json()

        if (data.ok) {
          setInvoice((prev: any) => {
            const rawExplorer = data.explorer || data.nftExplorer || data.invoice?.nftExplorer

            const finalExplorer = rawExplorer?.includes("http")
              ? rawExplorer
              : rawExplorer
                ? `https://nile.tronscan.org/#/transaction/${rawExplorer}`
                : null

            const finalImage = data.imageUrl || data.invoice?.imageUrl || prev?.imageUrl

            return {
              ...prev,
              ...data.invoice,
              status: "paid",
              nftExplorer: finalExplorer,
              imageUrl: finalImage,
            }
          })

          toast.success("Receipt Minted! View your on-chain artifact.")
        }
      }
    } catch (error) {
      console.error("Payment Error:", error)
      toast.error("Transaction rejected or failed.")
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Invoice not found.
      </div>
    )
  }

  if (txId || invoice.status === "paid") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center border-green-500/20 shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-green-400 to-blue-500" />

            <CardContent className="pt-10 pb-10 space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Payment Successful
                </CardTitle>
                <p className="text-muted-foreground text-sm px-4">
                  Your payment of{" "}
                  <span className="font-bold text-foreground">{invoice.amount} TRX</span>{" "}
                  is confirmed. Your digital receipt NFT has been issued.
                </p>
              </div>

              <div className="mt-4 mb-2 px-4 animate-in fade-in zoom-in duration-500">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 text-left">
                  Digital Asset Preview
                </p>

                <div className="rounded-lg border overflow-hidden shadow-sm bg-white ring-1 ring-black/5 min-h-[200px] flex items-center justify-center relative p-2">
                  {invoice.imageUrl ? (
                    <div className="w-full flex flex-col gap-3">
                      <a
                        href={invoice.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <img
                          src={invoice.imageUrl}
                          alt="NFT Receipt"
                          className="w-full h-auto transition-opacity duration-500 hover:opacity-90 cursor-pointer rounded-md"
                        />
                      </a>

                      <div className="text-left">
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                          Image URI
                        </p>
                        <a
                          href={invoice.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-blue-500 hover:underline break-all"
                        >
                          {invoice.imageUrl}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
                      <p className="text-xs text-neutral-400 font-medium animate-pulse">
                        Minting NFT Receipt...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full py-6 font-mono text-[10px] text-neutral-500"
                >
                  <a
                    href={`https://nile.tronscan.org/#/transaction/${txId || invoice.txId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    PAYMENT TX: {(txId || invoice.txId || "").slice(0, 20)}...
                  </a>
                </Button>

                <Button
                  asChild
                  disabled={!invoice.nftExplorer}
                  className={`w-full py-7 text-white shadow-xl transition-all duration-300 ${!invoice.nftExplorer ? "bg-neutral-400 opacity-70" : "bg-black hover:bg-neutral-800"}`}
                >
                  <a
                    href={invoice.nftExplorer || "#"}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      if (!invoice.nftExplorer) e.preventDefault()
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-yellow-400">✦</span>
                        {invoice.nftExplorer ? "View NFT Receipt" : "Processing Receipt..."}
                      </span>
                      <span className="text-[10px] opacity-60 font-medium tracking-tight">
                        {invoice.nftExplorer ? "On-Chain Verified Asset" : "Building Artifact..."}
                      </span>
                    </div>
                  </a>
                </Button>
              </div>

              <p className="text-[9px] text-neutral-400 uppercase font-black tracking-[0.2em] pt-4">
                Powered by TRON Secure Network
              </p>
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
            <CardTitle className="text-2xl tracking-tight">
              Invoice for {invoice.customerName}
            </CardTitle>
            <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">{id}</p>
          </CardHeader>

          <CardContent className="p-8 space-y-8 bg-white">
            <div className="flex justify-between items-end border-b pb-6">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Total Amount
                </p>
                <p className="text-4xl font-black text-neutral-900 leading-none mt-1">
                  {invoice.amount}{" "}
                  <span className="text-lg font-medium text-neutral-400">TRX</span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Payout To
                </p>
                <p className="text-sm font-bold text-neutral-900 flex items-center gap-1 justify-end">
                  <ShieldCheck className="h-3 w-3 text-green-500" /> Merchant Verified
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">
                Order Summary
              </h3>
              {invoice?.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between text-sm py-1 border-b border-neutral-50 last:border-0"
                >
                  <span className="text-neutral-600 font-medium">
                    {item.name} <span className="text-neutral-400 text-xs">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-neutral-900">
                    {item.unitPriceTrx * item.quantity} TRX
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={handlePayment}
              disabled={paying}
              className="w-full h-16 text-lg font-bold gap-3 shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
            >
              {paying ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Wallet className="h-6 w-6" />
              )}
              {paying ? "Awaiting Signature..." : `Pay ${invoice.amount} TRX Now`}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-4 opacity-40">
              <div className="h-[1px] w-8 bg-neutral-300" />
              <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">
                TRON Secure Network
              </p>
              <div className="h-[1px] w-8 bg-neutral-300" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
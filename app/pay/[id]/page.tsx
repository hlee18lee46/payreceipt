"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { useParams } from "next/navigation"

type InvoiceItem = {
  name: string
  quantity: number
  unitPriceTrx: number
}

type Invoice = {
  id: string
  merchantName: string
  merchantWallet: string
  customerName?: string
  items: InvoiceItem[]
  subtotalTrx: number
  totalTrx: number
  status: "unpaid" | "paid"
  checkoutUrl: string
  qrDataUrl: string
  createdAt: string
  paymentTxid?: string
}

export default function PayInvoicePage() {
  const params = useParams()
  const invoiceId = params.id as string

  const { address, connected, connect, select } = useWallet()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")
  const [paymentResult, setPaymentResult] = useState<{
    txid: string
  } | null>(null)

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to load invoice")
        }

        setInvoice(data.invoice)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    if (invoiceId) {
      loadInvoice()
    }
  }, [invoiceId])

  const handleConnect = async () => {
    try {
      select("TronLink")
      await new Promise((resolve) => setTimeout(resolve, 200))
      await connect()
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

const handlePay = async () => {
  if (!invoice) return

  if (!connected) {
    alert("Please connect TronLink first.")
    return
  }

  try {
    setPaying(true)

    // 1. HARDCODE THE RECIPIENT TO MATCH YOUR UI
    const recipientAddress = "TBW1Bgq5qSxr5k9D1Pmu2idjP1kCXq59A6"

    // 2. THE BOUNCER: Prevent self-payment
    if (address && address === recipientAddress) {
      throw new Error("You are currently connected as the Merchant. Please switch to a different account in TronLink to pay this invoice.")
    }

    const sunAmount = Math.round(invoice.totalTrx * 1_000_000)

    const tronWeb = (window as any).tronWeb
    if (!tronWeb) {
      throw new Error("TronWeb not found in browser")
    }

    // 3. SEND TRANSACTION
    const txResult = await tronWeb.trx.sendTransaction(recipientAddress, sunAmount)

    const txid =
      txResult?.txid ||
      txResult?.txID ||
      txResult?.transaction?.txID ||
      null

    if (!txid) {
      console.log("Unexpected payment result:", txResult)
      throw new Error("Payment sent but transaction hash was not found")
    }

    setPaymentResult({ txid })

    // 4. Update Backend
    await fetch(`/api/invoices/${invoiceId}/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txid }),
    })

    // 5. Mint NFT Receipt
    await fetch(`/api/invoices/${invoiceId}/mint`, {
      method: "POST",
    })

    alert("Payment successful! NFT receipt minted 🎉")

  } catch (err) {
    alert(err instanceof Error ? err.message : String(err))
  } finally {
    setPaying(false)
  }
}

  if (loading) {
    return <main className="p-8">Loading invoice...</main>
  }

  if (error || !invoice) {
    return <main className="p-8">Error: {error || "Invoice not found"}</main>
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="rounded-2xl border p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Pay Invoice</h1>
        <p className="mt-2 text-sm text-gray-500">Invoice ID: {invoice.id}</p>

        <div className="mt-6 space-y-3">
          <div>
            <strong>Merchant:</strong> {invoice.merchantName}
          </div>
<div className="space-y-1">
  <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
    Merchant Wallet (Recipient)
  </p>
  <div className="font-mono text-sm text-blue-600 font-bold break-all bg-blue-50 p-2 rounded border border-blue-100">
    TBW1Bgq5qSxr5k9D1Pmu2idjP1kCXq59A6
  </div>
</div>
          <div>
            <strong>Status:</strong> {invoice.status}
          </div>
          <div>
            <strong>Total:</strong> {invoice.totalTrx.toFixed(2)} TRX
          </div>
        </div>

        <div className="mt-6 rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{item.unitPriceTrx} TRX</td>
                  <td className="px-4 py-3 text-right">
                    {(item.quantity * item.unitPriceTrx).toFixed(2)} TRX
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-3">
          {!connected ? (
            <button
              onClick={handleConnect}
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Connect TronLink
            </button>
          ) : (
            <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
              Connected: {address}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={!connected || paying || invoice.status === "paid"}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {paying ? "Paying..." : invoice.status === "paid" ? "Already Paid" : "Pay Now"}
          </button>
        </div>

        {paymentResult && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="text-sm font-medium text-green-800">
              Payment submitted successfully
            </div>
            <div className="mt-2 break-all text-sm text-green-700">
              TXID: {paymentResult.txid}
            </div>
            <a
              href={`https://nile.tronscan.org/#/transaction/${paymentResult.txid}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-blue-600 underline"
            >
              View on TRON Explorer
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
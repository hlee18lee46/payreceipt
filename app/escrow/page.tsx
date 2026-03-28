"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { StatusBadge } from "@/components/status-badge"
import { CopyButton } from "@/components/copy-button"
import { shortenAddress } from "@/components/address-display"
import { toast } from "sonner"
import {
  Lock,
  Unlock,
  RefreshCcw,
  Shield,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

type EscrowStatus = "idle" | "locked" | "released" | "refunded"
type ActionType = "lock" | "release" | "refund" | null

interface EscrowData {
  vendorAddress: string
  amount: string
  status: EscrowStatus
  txHash?: string
  timestamp?: string
}

export default function EscrowPage() {
  const [vendorAddress, setVendorAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [escrowData, setEscrowData] = useState<EscrowData | null>(null)
  const [loading, setLoading] = useState<ActionType>(null)

  const handleLockPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vendorAddress || vendorAddress.length < 10) {
      toast.error("Please enter a valid vendor address")
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setLoading("lock")
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setEscrowData({
        vendorAddress,
        amount,
        status: "locked",
        txHash: "TQ3Y7VJHNsdfk2JKsdzek" + Math.random().toString(16).slice(2, 20),
        timestamp: new Date().toISOString(),
      })
      
      toast.success("Payment locked in escrow")
    } catch {
      toast.error("Failed to lock payment")
    } finally {
      setLoading(null)
    }
  }

  const handleRelease = async () => {
    if (!escrowData) return
    
    setLoading("release")
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setEscrowData({
        ...escrowData,
        status: "released",
        timestamp: new Date().toISOString(),
      })
      
      toast.success("Payment released to vendor")
    } catch {
      toast.error("Failed to release payment")
    } finally {
      setLoading(null)
    }
  }

  const handleRefund = async () => {
    if (!escrowData) return
    
    setLoading("refund")
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setEscrowData({
        ...escrowData,
        status: "refunded",
        timestamp: new Date().toISOString(),
      })
      
      toast.success("Payment refunded")
    } catch {
      toast.error("Failed to refund payment")
    } finally {
      setLoading(null)
    }
  }

  const resetEscrow = () => {
    setEscrowData(null)
    setVendorAddress("")
    setAmount("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Escrow Payments</h1>
          <p className="mt-2 text-muted-foreground">
            Lock payments until conditions are met, then release or refund
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Escrow Form */}
          <Card className={escrowData ? "opacity-50" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Create Escrow
              </CardTitle>
              <CardDescription>
                Lock funds in escrow for secure vendor payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLockPayment} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor Address</Label>
                  <Input
                    id="vendor"
                    placeholder="TQ3Y7VJHNsdfk2JKsdzek..."
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    disabled={!!escrowData || loading === "lock"}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    The TRON address of the vendor who will receive the payment
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="escrow-amount">Amount (TRX)</Label>
                  <Input
                    id="escrow-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!!escrowData || loading === "lock"}
                    className="text-lg"
                  />
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">How Escrow Works</p>
                      <ul className="mt-2 space-y-1">
                        <li>1. Lock your payment in the escrow contract</li>
                        <li>2. Vendor completes the agreed work</li>
                        <li>3. Release payment to vendor, or refund if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!!escrowData || loading === "lock" || !vendorAddress || !amount}
                >
                  {loading === "lock" ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Locking Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Lock Payment
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Escrow Status */}
          <div className="space-y-6">
            {!escrowData ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-semibold">No Active Escrow</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create an escrow to lock funds for secure payments
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Status Card */}
                <Card className={`border-${escrowData.status === "locked" ? "warning" : escrowData.status === "released" ? "success" : "muted"}/50`}>
                  <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        escrowData.status === "locked" 
                          ? "bg-warning/10" 
                          : escrowData.status === "released"
                          ? "bg-success/10"
                          : "bg-muted"
                      }`}>
                        {escrowData.status === "locked" ? (
                          <Lock className="h-6 w-6 text-warning-foreground" />
                        ) : escrowData.status === "released" ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <RefreshCcw className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {escrowData.status === "locked" && "Payment Locked"}
                          {escrowData.status === "released" && "Payment Released"}
                          {escrowData.status === "refunded" && "Payment Refunded"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {escrowData.status === "locked" && "Funds are held in escrow"}
                          {escrowData.status === "released" && "Funds sent to vendor"}
                          {escrowData.status === "refunded" && "Funds returned to payer"}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <StatusBadge status={escrowData.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Escrow Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-lg font-semibold">{escrowData.amount} TRX</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Vendor Address</span>
                      <div className="flex items-center gap-1">
                        <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {shortenAddress(escrowData.vendorAddress)}
                        </code>
                        <CopyButton text={escrowData.vendorAddress} />
                      </div>
                    </div>
                    
                    {escrowData.txHash && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Transaction Hash</span>
                        <div className="flex items-center gap-1">
                          <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                            {shortenAddress(escrowData.txHash, 6)}
                          </code>
                          <CopyButton text={escrowData.txHash} />
                          <a
                            href={`https://nile.tronscan.org/#/transaction/${escrowData.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 text-accent hover:text-accent/80"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm">
                        {escrowData.timestamp && new Date(escrowData.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {escrowData.status === "locked" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions</CardTitle>
                      <CardDescription>
                        Release payment to vendor or refund
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={handleRelease}
                        className="w-full bg-success hover:bg-success/90 text-success-foreground"
                        size="lg"
                        disabled={loading !== null}
                      >
                        {loading === "release" ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Releasing...
                          </>
                        ) : (
                          <>
                            <Unlock className="mr-2 h-4 w-4" />
                            Release Payment
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={handleRefund}
                        variant="outline"
                        className="w-full"
                        size="lg"
                        disabled={loading !== null}
                      >
                        {loading === "refund" ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Refunding...
                          </>
                        ) : (
                          <>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refund Payment
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {(escrowData.status === "released" || escrowData.status === "refunded") && (
                  <Button onClick={resetEscrow} variant="outline" className="w-full">
                    Create New Escrow
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

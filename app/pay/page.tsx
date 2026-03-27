"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { StatusBadge } from "@/components/status-badge"
import { CopyButton } from "@/components/copy-button"
import { shortenAddress } from "@/components/address-display"
import { toast } from "sonner"
import { 
  Upload, 
  X, 
  ExternalLink, 
  CheckCircle2,
  FileImage,
  Receipt
} from "lucide-react"

type PaymentStatus = "idle" | "processing" | "success" | "failed"

interface PaymentResult {
  txHash: string
  nftId: string
  nftImage: string
  nftName: string
  nftDescription: string
  metadata: Record<string, unknown>
}

export default function PayPage() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [result, setResult] = useState<PaymentResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setStatus("processing")

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock successful response
      const mockResult: PaymentResult = {
        txHash: "0x" + Math.random().toString(16).slice(2, 66),
        nftId: Math.floor(Math.random() * 10000).toString(),
        nftImage: previewUrl || "/placeholder-receipt.png",
        nftName: `Receipt #${Math.floor(Math.random() * 10000)}`,
        nftDescription: description || "Payment receipt",
        metadata: {
          amount: `${amount} TRX`,
          timestamp: new Date().toISOString(),
          network: "TRON Mainnet",
          type: "payment_receipt",
        }
      }

      setResult(mockResult)
      setStatus("success")
      toast.success("Payment successful! NFT receipt minted.")
    } catch {
      setStatus("failed")
      toast.error("Payment failed. Please try again.")
    }
  }

  const resetForm = () => {
    setAmount("")
    setDescription("")
    removeFile()
    setStatus("idle")
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Make a Payment</h1>
          <p className="mt-2 text-muted-foreground">
            Send TRX and receive an NFT receipt for your transaction
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Payment Form */}
          <Card className={status === "success" ? "opacity-50" : ""}>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter the amount and description for your payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (TRX)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={status === "processing" || status === "success"}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this payment for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={status === "processing" || status === "success"}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Receipt Image (Optional)</Label>
                  {!file ? (
                    <label
                      htmlFor="file-upload"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-accent hover:bg-muted/50"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG up to 10MB
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={status === "processing" || status === "success"}
                        className="sr-only"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-lg border border-border p-4">
                      <div className="flex items-center gap-4">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Receipt preview"
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                            <FileImage className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeFile}
                          disabled={status === "processing" || status === "success"}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={status === "processing" || status === "success" || !amount}
                >
                  {status === "processing" ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Payment Complete
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Status / Result */}
          <div className="space-y-6">
            {status === "idle" && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-semibold">Ready to Pay</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Fill in the payment details to receive your NFT receipt
                  </p>
                </CardContent>
              </Card>
            )}

            {status === "processing" && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Spinner className="h-12 w-12" />
                  <h3 className="mt-4 font-semibold">Processing Payment</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please wait while we process your transaction...
                  </p>
                  <div className="mt-4">
                    <StatusBadge status="pending" />
                  </div>
                </CardContent>
              </Card>
            )}

            {status === "success" && result && (
              <>
                <Card className="border-success/50 bg-success/5">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Payment Successful</h3>
                        <p className="text-sm text-muted-foreground">
                          Your NFT receipt has been minted
                        </p>
                      </div>
                      <div className="ml-auto">
                        <StatusBadge status="success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Transaction Hash</span>
                      <div className="flex items-center gap-1">
                        <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {shortenAddress(result.txHash, 8)}
                        </code>
                        <CopyButton text={result.txHash} />
                        <a
                          href={`https://tronscan.org/#/transaction/${result.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-accent hover:text-accent/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="font-medium">{amount} TRX</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Network</span>
                      <span className="font-medium">TRON Mainnet</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">NFT Receipt</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.nftImage && result.nftImage !== "/placeholder-receipt.png" && (
                      <div className="overflow-hidden rounded-lg border border-border">
                        <img
                          src={result.nftImage}
                          alt={result.nftName}
                          className="w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="font-semibold">{result.nftName}</h4>
                      <p className="text-sm text-muted-foreground">{result.nftDescription}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                        Metadata
                      </p>
                      <pre className="overflow-x-auto text-xs">
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/receipt/${result.nftId}`}>
                        View Full Receipt
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Button onClick={resetForm} variant="outline" className="w-full">
                  Make Another Payment
                </Button>
              </>
            )}

            {status === "failed" && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <X className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="mt-4 font-semibold">Payment Failed</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Something went wrong. Please try again.
                  </p>
                  <div className="mt-4">
                    <StatusBadge status="failed" />
                  </div>
                  <Button onClick={resetForm} variant="outline" className="mt-6">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

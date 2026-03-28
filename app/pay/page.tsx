"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
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
  Receipt,
  Wallet 
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
  const { address, connected, connecting } = useWallet()

  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [result, setResult] = useState<PaymentResult | null>(null)

  useEffect(() => {
    if (connected) {
      console.log("Payer Address:", address)
    }
  }, [connected, address])

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
    e.preventDefault();
    
    if (!connected || !address || !window.tronWeb) {
      toast.error("Please connect your TronLink wallet in the header");
      return;
    }

    // MERCHANT: Money flows HERE
    const merchantAddress = "TBW1Bgq5qSxr5k9D1Pmu2idjP1kCXq59A6";

    // Testing Guard: Ensure you aren't paying yourself
    if (address === merchantAddress) {
      toast.error("You are the merchant. Switch to a different account in TronLink to pay.");
      return;
    }

    setStatus("processing");

    try {
      // Convert TRX to SUN (10 TRX = 10,000,000 SUN)
      const amountInSun = window.tronWeb.toSun(amount).toString();

      // Trigger actual Transaction from Customer -> Merchant
      const transaction = await window.tronWeb.trx.sendTransaction(
        merchantAddress,
        amountInSun
      );

      if (transaction && transaction.result) {
        const txHash = transaction.txid;
        
        const successResult: PaymentResult = {
          txHash: txHash,
          nftId: "MINTING_IN_PROGRESS",
          nftImage: previewUrl || "/placeholder-receipt.png",
          nftName: `Receipt for ${amount} TRX`,
          nftDescription: description || "Verified Payment Receipt",
          metadata: {
            payer: address,
            merchant: merchantAddress,
            amountTrx: amount,
            network: "TRON Mainnet",
            timestamp: new Date().toISOString()
          }
        };

        setResult(successResult);
        setStatus("success");
        toast.success("Transaction Broadcasted Successfully!");
      } else {
        throw new Error("Transaction rejected by user or network");
      }
    } catch (err: any) {
      console.error("Payment Error:", err);
      setStatus("failed");
      toast.error(err?.message || "Payment failed");
    }
  };

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
        {!connected && !connecting && (
          <div className="mb-8 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm font-medium">
            <Wallet className="h-5 w-5" />
            <p>Wallet Disconnected: Please connect TronLink to proceed.</p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Make a Payment</h1>
          <p className="mt-2 text-muted-foreground">
            {connected 
              ? `Paying from: ${shortenAddress(address || "", 8)}` 
              : "Complete the form below to send payment and receive an NFT receipt"}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className={status === "success" ? "opacity-50" : ""}>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Funds will be sent to the merchant: <span className="font-mono text-primary font-bold">TBW1Bg...9A6</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (TRX)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={status === "processing" || status === "success" || !connected}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Reference or note for this payment"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={status === "processing" || status === "success" || !connected}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Receipt Image (Optional)</Label>
                  {!file ? (
                    <label
                      htmlFor="file-upload"
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors ${!connected ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent hover:bg-muted/50'}`}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">Upload image</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={status === "processing" || status === "success" || !connected}
                        className="sr-only"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-lg border border-border p-4">
                      <div className="flex items-center gap-4">
                        <img src={previewUrl || ""} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
                        <p className="truncate flex-1 font-medium">{file.name}</p>
                        <Button type="button" variant="ghost" size="icon" onClick={removeFile} disabled={status === "processing"}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={status === "processing" || status === "success" || !amount || !connected}>
                  {status === "processing" ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  {status === "processing" ? "Broadcasting..." : "Pay Now"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {status === "idle" && (
              <Card className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold">Payment Ready</h3>
                <p className="mt-2 text-sm text-muted-foreground px-6">Your transaction will be recorded on the TRON blockchain.</p>
              </Card>
            )}

            {status === "success" && result && (
              <Card className="animate-in fade-in slide-in-from-bottom-4">
                <CardHeader>
                  <CardTitle className="text-success flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Payment Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 border-b pb-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-muted p-2 rounded flex-1">{shortenAddress(result.txHash, 12)}</code>
                      <a href={`https://nile.tronscan.org/#/transaction/${result.txHash}`} target="_blank" className="p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition">
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recipient:</span>
                    <span className="font-mono text-xs">TBW1Bg...9A6</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold">{amount} TRX</span>
                  </div>
                  <Button onClick={resetForm} variant="outline" className="w-full mt-4">Start New Payment</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
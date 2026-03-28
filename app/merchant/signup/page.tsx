"use client"

import { useState } from "react"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function MerchantSignup() {
  const { connected, address } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!connected) {
      toast.error("Please connect your wallet first!")
      return
    }

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const payload = {
      address: address,
      name: formData.get("businessName"),
      email: formData.get("email")
    }

    try {
      const res = await fetch("/api/merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsSuccess(true)
        toast.success("Merchant registered successfully!")
      } else {
        throw new Error("Failed to register")
      }
    } catch (error) {
      toast.error("Registration failed. Try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center py-10">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <CardTitle className="text-2xl">You're all set!</CardTitle>
              <CardDescription>
                Your store is now live on the TRON network. You can now start accepting payments.
              </CardDescription>
              <Button asChild className="w-full mt-4">
                <a href="/">Go to Storefront</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-lg px-6 py-20">
        <Card className="border-border shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Partner Program</span>
            </div>
            <CardTitle className="text-3xl">Launch your Shop</CardTitle>
            <CardDescription>
              Join the ReceiptPay network and issue NFT receipts to your customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" name="businessName" placeholder="e.g. TRON Coffee Shop" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input id="email" name="email" type="email" placeholder="hello@yourshop.com" required />
              </div>

              <div className="space-y-2">
                <Label>Payout Address (Auto-detected)</Label>
                {connected ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm font-mono text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    {address?.slice(0, 10)}...{address?.slice(-10)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    Connect wallet to verify address
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                disabled={!connected || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Munching Data...
                  </>
                ) : (
                  "Create Merchant Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
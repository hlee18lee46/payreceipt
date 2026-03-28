"use client"

import { useState } from "react"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Clock, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function MerchantSignup() {
  const { connected, address } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "review">("idle")

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!connected || !address) {
      toast.error("Please connect your TronLink wallet")
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

      if (!res.ok) throw new Error("Failed to save application")

      // Success: Data is in DB, now show the "Review" screen
      setStatus("review")
      toast.success("Application data saved to MongoDB")
    } catch (error) {
      console.error(error)
      toast.error("Database connection error. Check your API.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "review") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-primary/20 shadow-2xl">
            <CardContent className="pt-10 pb-10 text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <Clock className="w-20 h-20 text-primary/20 animate-spin-slow" />
                <CheckCircle2 className="absolute inset-0 w-10 h-10 text-primary m-auto" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">Application Received</CardTitle>
                <p className="text-muted-foreground">
                  Your details for <span className="font-mono text-foreground">{address?.slice(0, 6)}...</span> are now in our system.
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-4 text-sm text-primary border border-primary/10 font-medium">
                Your application is currently under review. The TRON_POS team will contact you shortly.
              </div>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
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
        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Onboarding</span>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Merchant Sign-up</CardTitle>
            <CardDescription>
              Submit your business details to the TRON_POS database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" name="businessName" placeholder="e.g. TRON Coffee Shop" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" name="email" type="email" placeholder="admin@business.com" required />
              </div>

              <div className="space-y-2">
                <Label>Wallet Address (Public Key)</Label>
                {connected ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border text-xs font-mono break-all text-muted-foreground">
                    {address}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm text-destructive font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Please connect TronLink to proceed
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold transition-all shadow-md active:scale-[0.98]" 
                disabled={!connected || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving to Database...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { 
  Receipt, 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe,
  CreditCard,
  FileCheck,
  Lock,
  Loader2
} from "lucide-react"

export default function HomePage() {
  const [merchantName, setMerchantName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch merchant name based on MERCHANT_ADDRESS in env
    fetch("/api/merchant")
      .then((res) => res.json())
      .then((data) => {
        setMerchantName(data.name)
        setIsLoading(false)
      })
      .catch(() => {
        setMerchantName("ReceiptPay")
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-8 flex justify-center">
                {isLoading ? (
                  <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                    <Receipt className="h-8 w-8 text-primary-foreground" />
                  </div>
                )}
              </div>

              {merchantName && (
                <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary animate-in fade-in slide-in-from-bottom-2">
                  Welcome to {merchantName}
                </div>
              )}

              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
                Blockchain Payments at {merchantName || "ReceiptPay"}
              </h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                Send secure TRX payments to {merchantName || "merchants"}, generate verifiable NFT receipts, and track every transaction on the TRON blockchain.
              </p>
              
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/20">
                  <Link href="/pay">
                    Make a Payment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/merchant/signup">
                    Become a Merchant
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
          </div>
        </section>

        {/* How it Works */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mt-4 text-muted-foreground">
                Simple, transparent payments for {merchantName || "your business"}
              </p>
            </div>
            
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              <Card className="relative overflow-hidden border-0 bg-card shadow-sm">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <CreditCard className="h-6 w-6 text-accent" />
                  </div>
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">Initiate Payment</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Connect your TronLink wallet and enter the payment details for {merchantName || "the merchant"}.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden border-0 bg-card shadow-sm">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <FileCheck className="h-6 w-6 text-accent" />
                  </div>
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold">NFT Receipt Minted</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Upon confirmation, a unique NFT receipt is minted directly to your wallet.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden border-0 bg-card shadow-sm">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    3
                  </div>
                  <h3 className="text-lg font-semibold">Verified On-Chain</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Your proof of purchase is stored forever on the TRON blockchain.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">Built for Business</h2>
              <p className="mt-4 text-muted-foreground">
                The tools {merchantName || "merchants"} need for the crypto economy
              </p>
            </div>
            
            <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Instant Settlements</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No 3-day waits. TRX settlements are near-instant.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">No Chargebacks</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Blockchain finality protects merchants from fraud.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">NFT Invoicing</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Every transaction generates an immutable tax-ready receipt.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Global Reach</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Accept payments from any TRON user, anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-primary py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
                Ready to join {merchantName || "the network"}?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Start accepting payments or register your business today.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild className="gap-2">
                  <Link href="/pay">
                    Make a Payment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link href="/merchant/signup">
                    Become a Merchant
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Receipt className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">ReceiptPay</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2026 {merchantName || "ReceiptPay"}. Built on TRON.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
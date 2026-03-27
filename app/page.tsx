import Link from "next/link"
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
  Lock
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-8 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                  <Receipt className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
                Blockchain Payments with NFT Receipts
              </h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                Send payments on TRON, generate verifiable NFT receipts, and track every transaction on-chain. 
                The modern way to handle business payments.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/pay">
                    Make a Payment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">
                    Merchant Dashboard
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
                Three simple steps to send payments with verifiable receipts
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
                    Enter the amount and description. Attach any receipt images for your records.
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
                    Your payment generates a unique NFT receipt stored on IPFS with full metadata.
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
                    Every transaction is recorded on TRON blockchain for permanent, tamper-proof verification.
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
                Everything you need for modern blockchain payments
              </p>
            </div>
            
            <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Instant Settlements</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Transactions confirmed in seconds on TRON network
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Secure Escrow</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lock payments until conditions are met
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">NFT Receipts</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Immutable proof of every transaction
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Global Access</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Send and receive payments worldwide
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
                Ready to get started?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Start accepting blockchain payments with NFT receipts today.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild className="gap-2">
                  <Link href="/pay">
                    Make a Payment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link href="/dashboard">
                    View Dashboard
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
                Blockchain payments with verifiable NFT receipts
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

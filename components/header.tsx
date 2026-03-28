"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { Button } from "@/components/ui/button"
import { Receipt, Menu, X, Wallet, LogOut } from "lucide-react"

export function Header() {
  const {
    wallet,
    wallets,
    connect,
    disconnect,
    address,
    connected,
    connecting,
    select,
  } = useWallet()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSelectingWallet, setIsSelectingWallet] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    console.log("wallet adapter state", {
      selectedWallet: wallet?.adapter?.name,
      availableWallets: wallets.map((w) => ({
        name: w.adapter.name,
        readyState: w.readyState,
      })),
      connected,
      connecting,
      address,
      tronLink:
        typeof window !== "undefined" ? (window as any).tronLink : undefined,
      tronWeb:
        typeof window !== "undefined" ? (window as any).tronWeb : undefined,
    })
  }, [wallet, wallets, connected, connecting, address])

  useEffect(() => {
    const connectSelectedWallet = async () => {
      if (!isSelectingWallet) return
      if (!wallet) return
      if (wallet.adapter.name !== "TronLink") return
      if (connected || connecting) return

      try {
        await connect()
      } catch (e) {
        console.error("Connection failed:", e)
        alert(e instanceof Error ? e.message : String(e))
      } finally {
        setIsSelectingWallet(false)
      }
    }

    connectSelectedWallet()
  }, [isSelectingWallet, wallet, connected, connecting, connect])

  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : ""

  const handleConnect = () => {
    try {
      setIsSelectingWallet(true)
      select("TronLink")
    } catch (e) {
      console.error("Wallet selection failed:", e)
      alert(e instanceof Error ? e.message : String(e))
      setIsSelectingWallet(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setIsSelectingWallet(false)
    } catch (e) {
      console.error("Disconnect failed:", e)
    }
  }

  const isBusy = !mounted || connecting || isSelectingWallet

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Receipt className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              TRON_POS
            </span>
          </Link>
        </div>

<div className="hidden items-center gap-8 md:flex">
  <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
    Dashboard
  </Link>

  <Link href="/dashboard/invoices/new" className="text-sm font-medium text-primary hover:text-primary/80">
    Create Invoice
  </Link>

  <Link href="/dashboard/invoices" className="text-sm font-medium text-muted-foreground hover:text-foreground">
    Invoices
  </Link>

  <Link href="/escrow" className="text-sm font-medium text-muted-foreground hover:text-foreground">
    Escrow
  </Link>
</div>

        <div className="hidden items-center gap-3 md:flex">
          {mounted && connected ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span
                  title={address ?? ""}
                  className="text-xs text-muted-foreground font-mono"
                >
                  {shortAddress}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isBusy}
            >
              <Wallet className="h-4 w-4" />
              {connecting || isSelectingWallet
                ? "Connecting..."
                : "Connect TronLink"}
            </Button>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden bg-background">
          <div className="space-y-1 px-6 py-4">
            <Link
              href="/pay"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pay
            </Link>
            <Link
              href="/dashboard"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <div className="pt-4">
              {mounted && connected ? (
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={handleDisconnect}
                >
                  {shortAddress}
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  className="w-full gap-2"
                  disabled={isBusy}
                >
                  <Wallet className="h-4 w-4" />
                  {connecting || isSelectingWallet
                    ? "Connecting..."
                    : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
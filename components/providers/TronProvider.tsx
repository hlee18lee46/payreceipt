"use client"

import { useMemo, ReactNode } from "react"
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks"
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapters"

export function TronProvider({ children }: { children: ReactNode }) {
  // Memoize adapters to prevent unnecessary re-renders
  const adapters = useMemo(() => [new TronLinkAdapter()], [])

  return (
    <WalletProvider adapters={adapters} autoConnect={true}>
      {children}
    </WalletProvider>
  )
}
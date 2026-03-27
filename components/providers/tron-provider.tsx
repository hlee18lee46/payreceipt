"use client"

import { ReactNode, useMemo } from "react"
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks"
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapters"
import {
  WalletDisconnectedError,
  WalletError,
  WalletNotFoundError,
} from "@tronweb3/tronwallet-abstract-adapter"

export function TronProvider({ children }: { children: ReactNode }) {
  const adapters = useMemo(() => [new TronLinkAdapter()], [])

  const onError = (error: WalletError) => {
    if (error instanceof WalletNotFoundError) {
      console.error("TronLink not found:", error.message)
      alert("TronLink is not installed or not available in this browser.")
    } else if (error instanceof WalletDisconnectedError) {
      console.log("Wallet disconnected")
    } else {
      console.error("Wallet error:", error)
      alert(error.message)
    }
  }

  return (
    <WalletProvider adapters={adapters} autoConnect={false} onError={onError}>
      {children}
    </WalletProvider>
  )
}
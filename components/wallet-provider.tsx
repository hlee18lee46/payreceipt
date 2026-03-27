"use client"

import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink"
import {
  WalletProvider,
} from "@tronweb3/tronwallet-adapter-react-hooks"

const adapters = [
  new TronLinkAdapter(),
]

export function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletProvider adapters={adapters} autoConnect={false}>
      {children}
    </WalletProvider>
  )
}
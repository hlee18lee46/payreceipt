"use client"

import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

interface AddressDisplayProps {
  address: string
  className?: string
  showCopy?: boolean
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function AddressDisplay({ address, className, showCopy = true }: AddressDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
        {shortenAddress(address)}
      </code>
      {showCopy && <CopyButton text={address} />}
    </div>
  )
}

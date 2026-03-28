import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/copy-button"
import { shortenAddress } from "@/components/address-display"
import { 
  ExternalLink, 
  Shield, 
  CheckCircle2,
  Download,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

// Mock data - in real app, this would come from API/blockchain
async function getReceiptData(id: string) {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    id,
    name: `Receipt #${id}`,
    description: "Payment receipt for services rendered",
    image: null,
    txHash: "TQ3Y7VJHNsdfk2JKsdzekTq7VJHNsd1234567890abcdef",
    amount: "150.00 TRX",
    timestamp: new Date().toISOString(),
    from: "TQ3Y7VJHNsdfk2JKsdzek",
    to: "TAbc1234567890abcdef",
    network: "TRON Mainnet",
    contractAddress: "TContract123456789abcdef",
    tokenId: id,
    metadata: {
      name: `Receipt #${id}`,
      description: "Payment receipt for services rendered",
      amount: "150.00 TRX",
      timestamp: new Date().toISOString(),
      payer: "TQ3Y7VJHNsdfk2JKsdzek",
      payee: "TAbc1234567890abcdef",
      network: "TRON Mainnet",
      type: "payment_receipt",
      attributes: [
        { trait_type: "Payment Type", value: "Direct Transfer" },
        { trait_type: "Currency", value: "TRX" },
        { trait_type: "Status", value: "Completed" },
      ]
    }
  }
}

export default async function ReceiptPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const receipt = await getReceiptData(id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{receipt.name}</h1>
              <p className="mt-2 text-muted-foreground">{receipt.description}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Verified On-Chain</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* NFT Preview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted">
                {receipt.image ? (
                  <img
                    src={receipt.image}
                    alt={receipt.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5 p-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/20">
                      <CheckCircle2 className="h-10 w-10 text-accent" />
                    </div>
                    <p className="mt-4 text-lg font-semibold">{receipt.name}</p>
                    <p className="mt-1 text-2xl font-bold">{receipt.amount}</p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {new Date(receipt.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Receipt
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="space-y-6 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Transaction Hash</span>
                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                      {shortenAddress(receipt.txHash, 8)}
                    </code>
                    <CopyButton text={receipt.txHash} />
                    <a
                      href={`https://nile.tronscan.org/#/transaction/${receipt.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-accent hover:text-accent/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold">{receipt.amount}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">From</span>
                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                      {shortenAddress(receipt.from)}
                    </code>
                    <CopyButton text={receipt.from} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">To</span>
                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                      {shortenAddress(receipt.to)}
                    </code>
                    <CopyButton text={receipt.to} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="font-medium">{receipt.network}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Timestamp</span>
                  <span className="font-medium">
                    {new Date(receipt.timestamp).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">NFT Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Contract Address</span>
                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                      {shortenAddress(receipt.contractAddress)}
                    </code>
                    <CopyButton text={receipt.contractAddress} />
                    <a
                      href={`https://nile.tronscan.org/#/contract/${receipt.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-accent hover:text-accent/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Token ID</span>
                  <span className="font-mono font-medium">#{receipt.tokenId}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metadata (JSON)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-lg bg-muted p-4">
                  <pre className="overflow-x-auto text-xs leading-relaxed">
                    {JSON.stringify(receipt.metadata, null, 2)}
                  </pre>
                  <div className="absolute right-2 top-2">
                    <CopyButton text={JSON.stringify(receipt.metadata, null, 2)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button asChild className="flex-1">
                <a
                  href={`https://nile.tronscan.org/#/transaction/${receipt.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on TronScan
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/pay">
                  Make Payment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

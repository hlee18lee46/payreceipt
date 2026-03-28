"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Receipt } from "lucide-react"

// This MUST be a "default" export for Next.js to recognize it
export default function InvoicesPage() {
  const { address, connected } = useWallet()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected || !address) return
    
    fetch(`/api/invoices?address=${address}`)
      .then(res => res.json())
      .then(data => {
        setInvoices(data)
        setLoading(false)
      })
  }, [connected, address])

  if (!connected) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        Connect your wallet to view invoice history.
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Receipt className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Full Ledger</h1>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-100/50">
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Blockchain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv: any) => (
                  <TableRow key={inv._id}>
                    <TableCell className="font-medium">{inv.customerName}</TableCell>
                    <TableCell>{inv.amount} TRX</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === 'paid' ? 'success' : 'outline'}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500 text-sm">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.txId ? (
                        <a 
                          href={`https://nile.tronscan.org/#/transaction/${inv.txId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
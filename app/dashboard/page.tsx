"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { CopyButton } from "@/components/copy-button"
import { shortenAddress } from "@/components/address-display"
import { toast } from "sonner"
import {
  Plus,
  ExternalLink,
  Receipt,
  DollarSign,
  Clock,
  TrendingUp,
} from "lucide-react"

interface Invoice {
  id: string
  amount: string
  description: string
  status: "paid" | "unpaid"
  timestamp: string
  txHash?: string
}

// Mock data
const initialInvoices: Invoice[] = [
  {
    id: "1",
    amount: "250.00",
    description: "Website development services",
    status: "paid",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    txHash: "TQ3Y7VJHNsdfk2JKsdzek1234567890abcdef",
  },
  {
    id: "2",
    amount: "150.00",
    description: "Monthly hosting fee",
    status: "paid",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    txHash: "TAbc1234567890abcdef0987654321fedcba",
  },
  {
    id: "3",
    amount: "500.00",
    description: "Logo design project",
    status: "unpaid",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "4",
    amount: "75.00",
    description: "Consultation call",
    status: "paid",
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    txHash: "TXyz9876543210fedcba0987654321abcd",
  },
  {
    id: "5",
    amount: "1200.00",
    description: "E-commerce integration",
    status: "unpaid",
    timestamp: new Date(Date.now() - 432000000).toISOString(),
  },
]

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAmount, setNewAmount] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const stats = {
    totalReceived: invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + parseFloat(i.amount), 0),
    pending: invoices.filter((i) => i.status === "unpaid").length,
    totalInvoices: invoices.length,
  }

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAmount || parseFloat(newAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const newInvoice: Invoice = {
      id: (invoices.length + 1).toString(),
      amount: parseFloat(newAmount).toFixed(2),
      description: newDescription || "Invoice",
      status: "unpaid",
      timestamp: new Date().toISOString(),
    }

    setInvoices([newInvoice, ...invoices])
    setNewAmount("")
    setNewDescription("")
    setShowCreateForm(false)
    toast.success("Invoice created successfully")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Merchant Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage invoices and track payments
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="text-2xl font-bold">{stats.totalReceived.toFixed(2)} TRX</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="h-6 w-6 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Invoice Form */}
          <div className={showCreateForm ? "lg:col-span-1" : "hidden"}>
            <Card>
              <CardHeader>
                <CardTitle>New Invoice</CardTitle>
                <CardDescription>
                  Create a new invoice for your customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-amount">Amount (TRX)</Label>
                    <Input
                      id="invoice-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice-description">Description</Label>
                    <Textarea
                      id="invoice-description"
                      placeholder="What is this invoice for?"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Create Invoice
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List */}
          <div className={showCreateForm ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  View and manage all your invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Receipt className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{invoice.amount} TRX</p>
                            <StatusBadge status={invoice.status} />
                          </div>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {invoice.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(invoice.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {invoice.txHash && (
                          <div className="flex items-center gap-1">
                            <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                              {shortenAddress(invoice.txHash, 4)}
                            </code>
                            <CopyButton text={invoice.txHash} />
                          </div>
                        )}
                        {invoice.status === "paid" && invoice.txHash && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/receipt/${invoice.id}`}>
                              View Receipt
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                        {invoice.status === "unpaid" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/pay?amount=${invoice.amount}&description=${encodeURIComponent(invoice.description)}`}>
                              Pay Now
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {invoices.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 font-semibold">No invoices yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create your first invoice to get started
                    </p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-4"
                    >
                      Create Invoice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

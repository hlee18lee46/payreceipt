"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, Clock, TrendingUp, Receipt, Lock, ShieldAlert } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { toast } from "sonner"
import Link from "next/link"

export default function MerchantDashboard() {
  const { address, connected } = useWallet()
  
  // 1. Authorization States
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  // 2. Data States
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "all">("7d")

  // --- STEP 1: VERIFY MERCHANT STATUS ---
  useEffect(() => {
    const verifyAccess = async () => {
      if (!connected || !address) {
        setIsAuthorized(false)
        setCheckingAuth(false)
        return
      }

      try {
        const res = await fetch("/api/merchant")
        const data = await res.json()
        
        // Check if the connected wallet matches the master merchant address in MongoDB
        if (data.address && address === data.address) {
          setIsAuthorized(true)
        } else {
          setIsAuthorized(false)
        }
      } catch (err) {
        setIsAuthorized(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    verifyAccess()
  }, [connected, address])

  // --- STEP 2: FETCH INVOICES (ONLY IF AUTHORIZED) ---
  useEffect(() => {
    if (!isAuthorized || !address) return

    const fetchInvoices = async () => {
      setLoadingInvoices(true)
      try {
        const res = await fetch(`/api/invoices?address=${address}`)
        const data = await res.json()
        setInvoices(data)
      } catch (error) {
        toast.error("Failed to load ledger data")
      } finally {
        setLoadingInvoices(false)
      }
    }

    fetchInvoices()
  }, [isAuthorized, address])

  // --- DATA CALCULATIONS ---
  const stats = useMemo(() => {
    const now = new Date()
    const filterDays = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 999
    
    const filtered = invoices.filter(inv => {
      const date = new Date(inv.createdAt)
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= filterDays
    })

    const received = filtered.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0)
    const receivable = filtered.filter(i => i.status === "pending").reduce((sum, i) => sum + i.amount, 0)

    const chartData = filtered
      .filter(i => i.status === "paid")
      .reduce((acc: any[], inv) => {
        const date = new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const existing = acc.find(item => item.date === date)
        if (existing) existing.amount += inv.amount
        else acc.push({ date, amount: inv.amount })
        return acc
      }, [])
      .reverse()

    return { received, receivable, chartData }
  }, [invoices, timeFilter])

  // --- RENDER LOGIC ---

  // A. Loading Auth State
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Verifying Merchant Wallet...</p>
        </div>
      </div>
    )
  }

  // B. Restricted Access View
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Lock className="h-10 w-10 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-neutral-900">Protected Dashboard</h1>
              <p className="text-sm text-neutral-500 leading-relaxed">
                The financial data for this store is restricted. Please connect the registered Merchant Wallet to proceed.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <Button asChild className="w-full py-6 rounded-xl font-bold bg-neutral-900">
                <Link href="/merchant/signup">Apply for Access</Link>
              </Button>
              <Link href="/" className="block text-xs font-bold text-neutral-400 uppercase tracking-widest hover:text-neutral-600">
                Back to Landing
              </Link>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  // C. Master Merchant View (Full Dashboard)
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Merchant Insights</h1>
                <ShieldAlert className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-neutral-500 font-medium">Viewing ledger for wallet: <span className="font-mono text-neutral-900">{address?.slice(0,12)}...</span></p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
            {(["7d", "30d", "all"] as const).map((t) => (
              <Button 
                key={t}
                variant={timeFilter === t ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setTimeFilter(t)}
                className="text-xs uppercase font-bold rounded-lg"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* --- Metrics, Charts, and Ledger (Same as your provided JSX) --- */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Accounts Received</p>
                  <p className="text-2xl font-black text-neutral-900">{stats.received.toLocaleString()} TRX</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Accounts Receivable</p>
                  <p className="text-2xl font-black text-neutral-900">{stats.receivable.toLocaleString()} TRX</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Volume</p>
                  <p className="text-2xl font-black text-neutral-900">{(stats.received + stats.receivable).toLocaleString()} TRX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <CardDescription>Daily settled payments (TRX)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                  <Tooltip 
                    cursor={{fill: '#f8f8f8'}} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#000" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Ledger */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Ledger</CardTitle>
                <CardDescription>Status tracker</CardDescription>
              </div>
              <Receipt className="h-5 w-5 text-neutral-300" />
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingInvoices ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-neutral-300" /></div>
              ) : invoices.length === 0 ? (
                <p className="text-xs text-center text-neutral-400 py-10 italic">No invoices recorded yet.</p>
              ) : invoices.slice(0, 6).map((inv) => (
                <div key={inv._id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-900">{inv.amount} TRX</p>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-tighter">{inv.customerName}</p>
                  </div>
                  <div className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs font-bold text-neutral-400 hover:text-neutral-900" asChild>
                <Link href="/invoices">View All Activity</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
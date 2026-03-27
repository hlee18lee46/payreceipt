export type InvoiceItem = {
  name: string
  quantity: number
  unitPriceTrx: number
}

export type InvoiceRecord = {
  id: string
  merchantName: string
  merchantWallet: string
  customerName?: string
  items: InvoiceItem[]
  subtotalTrx: number
  totalTrx: number
  status: "unpaid" | "paid"
  checkoutUrl: string
  qrDataUrl: string
  createdAt: string
  paymentTxid?: string
  pdfPath?: string
  previewImagePath?: string
}
const invoiceStore = new Map<string, InvoiceRecord>()

export function createInvoice(record: InvoiceRecord) {
  invoiceStore.set(record.id, record)
  return record
}

export function getInvoiceById(id: string) {
  return invoiceStore.get(id) ?? null
}

export function updateInvoice(id: string, updates: Partial<InvoiceRecord>) {
  const current = invoiceStore.get(id)
  if (!current) return null

  const next = { ...current, ...updates }
  invoiceStore.set(id, next)
  return next
}

export function listInvoices() {
  return Array.from(invoiceStore.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )
}
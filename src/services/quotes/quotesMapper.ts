/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from '../../interfaces/user.interface'
import type { Quote, QuoteLine } from '../../store/quote/quote.store'
import { dateFormat } from '../../utils/dateFormat'

const mapQuoteUser = (user: any): User | null => {
  if (!user) return null

  return {
    id: user.id,
    name: user.name ?? '',
    lastname: user.lastname ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: user.role ?? '',
    isActive: user.isActive ?? true,
    allowWhatsappAssistant: Boolean(user.allowWhatsappAssistant),
    createdAt: user.createdAt ?? '',
    updatedAt: user.updatedAt ?? '',
    branchOffice: null,
    branchOffices: [],
  }
}

export const quoteMapper = (quote: { [key: string]: any }): Quote => {
  const branchLabel = typeof quote.branch === 'string'
    ? quote.branch
    : quote.branch?.name ?? ''

  return {
    id: quote.id,
    createdAt: quote.createdAt ? dateFormat(quote.createdAt) : 'Sin fecha',
    quoteNumber: quote.quoteNumber,
    customer: quote.customer,
    items: (quote.items ?? []).map((item: { [key: string]: any }) => quoteItemMapper(item)),
    summary: quote.summary,
    fileKey: quote.fileKey,
    chatThreadId: quote.chatThreadId,
    currency: quote.currency ?? 'MXN',
    taxRate: 0.16,
    updatedAt: quote.updatedAt ?? '',
    status: quote.status ?? 'Pendiente',
    workflowStatus: quote.workflowStatus ?? 'NEW',
    seenAt: quote.seenAt ?? null,
    downloadedAt: quote.downloadedAt ?? null,
    erpQuoteNumber: quote.erpQuoteNumber ?? null,
    erpQuoteAt: quote.erpQuoteAt ?? null,
    erpSystem: quote.erpSystem ?? null,
    erpInvoiceNumber: quote.erpInvoiceNumber ?? null,
    invoicedAt: quote.invoicedAt ?? null,
    rejectedReason: quote.rejectedReason ?? null,
    workflowUpdatedAt: quote.workflowUpdatedAt ?? null,
    workflowUpdatedById: quote.workflowUpdatedById ?? null,
    version: '',
    statusVersion: '',
    branch: branchLabel || undefined,
    branchId: quote.branch?.id ?? quote.branchId ?? null,
    assignedSeller: mapQuoteUser(quote.assignedSeller),
    assignedBy: mapQuoteUser(quote.assignedBy),
    assignedAt: quote.assignedAt ?? null,
    quoteMeta: {
      pdfSentAt: null,
      quoteCreatedAt: null,
      versionCreatedAt: null,
      createdByUser: null,
    },
  }
}

export const quoteItemMapper = (json: { [key: string]: any }): QuoteLine => ({
  id: json.id,
  description: json.description,
  ean: json.ean,
  qty: json.quantity,
  um: json.um,
  price: json.price ?? 0,
  cost: json.cost ?? 0,
  currency: json.currency ?? 'MXN',
  margin: null,
})

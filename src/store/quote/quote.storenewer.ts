import { create, type StateCreator } from "zustand"
import type { Currency } from "../../services/inventory/api"
import { devtools, persist } from "zustand/middleware"
import type { User } from "../../interfaces/user.interface"

import { displayToStoreQuote, type DisplayResult } from "../../services/quotes/quote-display.mapper"



export type QuoteVersionArtifacts = {
  id: string;
  type: 'PDF' | 'HTML' | string;
  fileKey: string;
  mimeType: string | null;
  checksum: string | null;
  createdAt: string;
  presignedUrl?: string;
  expiresIn?: number;
}


export type Capabilities = {
  hasVersion: boolean;
  hasPdf: boolean;
  canGeneratePdf: boolean;
  canSendWhatsApp: boolean;
}


export interface QuoteCustomer {
  id?: string
  name: string
  lastname?: string
  phone?: string
  email?: string
  location?: string
}

export interface QuoteLineSource {
  productKey?: string   // ean/id del similar elegido
  warehouse?: string    // almacén seleccionado
}

export interface QuoteLine {
  id: string           // id interno de la línea (ui)
  description: string
  ean?: string
  um?: string
  qty: number

  // pricing
  cost: number | null
  currency: Currency
  price: number | null
  margin: number | null // %

  source?: QuoteLineSource
}


export interface Quote {
  id: string
  quoteNumber?: string
  status: string

  branch?: string
  currency: Currency
  taxRate: number // ej. 0.16 para IVA 16%
  customer?: QuoteCustomer
  items: QuoteLine[]
  createdAt: string
  updatedAt: string;
  fileKey?: string
  summary?: string
  chatThreadId?: string

  seller?: User | null
  versionId?: string;
  versionNumber?: number;
  artifacts?: QuoteVersionArtifacts[];
  capabilities?: Capabilities
  version: string
  statusVersion: string
  source?: "VERSION" | "QUOTE";


}

type QuotesById = Record<string, Quote>



function nowISO() { return new Date().toISOString() }
function newId(prefix = 'Q') { return `${prefix}_${Math.random().toString(36).slice(2, 10)}` }



interface QuotesState {
  quotesById: QuotesById
  quoteOrder: string[]
  activeId: string | null

  // selectors
  getActive: () => Quote | undefined
  getById: (id: string) => Quote | undefined
  subtotal: (id: string) => number
  tax: (id: string) => number
  total: (id: string) => number

  // quote actions
  createQuote: (partial?: Partial<Quote>) => string
  hydrateFromDisplay: (display: DisplayResult) => string;
  selectQuote: (id: string | null) => void
  removeQuote: (id: string) => void
  duplicateQuote: (id: string) => string
  updateQuoteMeta: (id: string, meta: Partial<Omit<Quote, 'id' | 'items'>>) => void
  setActive: (id: string) => void

  // line actions
  addLine: (quoteId: string, partial: Partial<QuoteLine>) => string
  removeLine: (quoteId: string, lineId: string) => void
  setLineQty: (quoteId: string, lineId: string, qty: number) => void

  // disponibilidad → pricing
  applyAvailabilityToLine: (
    quoteId: string,
    lineId: string,
    opts: { cost: number; currency: Currency; productKey?: string; warehouse?: string; defaultMargin?: number }
  ) => void

  // edición reactiva
  setLinePrice: (quoteId: string, lineId: string, price: number) => void
  setLineMargin: (quoteId: string, lineId: string, margin: number) => void
}

const priceFrom = (cost: number, marginPct: number) => {

  // if(!cost || cost <= 0) return 0
  return +(cost * (1 + marginPct / 100)).toFixed(2)


}

const marginFrom = (cost: number, price: number) => {

  if (!cost || cost <= 0) return 0

  return +(((price / cost) - 1) * 100).toFixed(2)
}

let _lineSeq = 1
const newLineId = () => `L${_lineSeq++}`

const apiStore: StateCreator<QuotesState> = (set, get) => ({
  quotesById: {},
  quoteOrder: [],
  activeId: null,

  // helpers internos
  getActive: () => {
    const id = get().activeId
    return id ? get().quotesById[id] : undefined
  },
  getById: (id) => get().quotesById[id],

  subtotal: (id) => {
    const q = get().quotesById[id]; if (!q) return 0
    return +q.items.reduce((acc, it) => acc + ((it.price ?? 0) * (it.qty || 0)), 0).toFixed(2)
  },
  tax: (id) => {
    const q = get().quotesById[id]; if (!q) return 0
    return +(get().subtotal(id) * q.taxRate).toFixed(2)
  },
  total: (id) => {
    const q = get().quotesById[id]; if (!q) return 0
    return +(get().subtotal(id) + get().tax(id)).toFixed(2)
  },

  createQuote: (partial) => {
    const id = partial?.id ?? newId()
    const quote: Quote = {
      id,
      quoteNumber: partial?.quoteNumber,
      branch: partial?.branch,
      currency: partial?.currency ?? 'MXN',
      taxRate: partial?.taxRate ?? 0.16,
      customer: partial?.customer,
      items: partial?.items ?? [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
      fileKey: partial?.fileKey,
      summary: partial?.summary,
      chatThreadId: partial?.chatThreadId,
      status: partial?.status ?? 'Pendiente',
      version: "",
      statusVersion: partial?.statusVersion ?? '',
      seller: partial?.seller,
      versionId: partial?.versionId,
      versionNumber: partial?.versionNumber,
      artifacts: partial?.artifacts,
      capabilities: partial?.capabilities,
      source: partial?.source,
    }

    set(s => ({
      quotesById: { ...s.quotesById, [id]: quote },
      quoteOrder: s.quoteOrder.includes(id) ? s.quoteOrder : [id, ...s.quoteOrder],
      activeId: id
    }))
    return id
  },

  // <<--- NUEVO: hidratar directo desde /display
  hydrateFromDisplay: (display) => {
    const mapped = displayToStoreQuote(display);
    const id = mapped.id;
    const quote: Quote = {
      ...mapped,
      fileKey: mapped.fileKey ?? undefined,
    };
    set(s => ({
      quotesById: { ...s.quotesById, [id]: quote }, //Aqui prro
      quoteOrder: s.quoteOrder.includes(id) ? s.quoteOrder : [id, ...s.quoteOrder],
      activeId: id,
    }));
    return id;
  },

  selectQuote: (id) => set({ activeId: id }),

  removeQuote: (id) => set(s => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _, ...rest } = s.quotesById
    const order = s.quoteOrder.filter(qid => qid !== id)
    const activeId = s.activeId === id ? (order[0] ?? null) : s.activeId
    return { quotesById: rest, quoteOrder: order, activeId }
  }),

  duplicateQuote: (id) => {
    const src = get().quotesById[id]; if (!src) return ''
    const newIdQ = newId()
    const clone: Quote = {
      ...src,
      id: newIdQ,
      quoteNumber: undefined,
      items: src.items.map(l => ({ ...l, id: newLineId() })),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    set(s => ({
      quotesById: { ...s.quotesById, [newIdQ]: clone },
      quoteOrder: [newIdQ, ...s.quoteOrder],
      activeId: newIdQ,
    }))
    return newIdQ
  },

  updateQuoteMeta: (id, meta) => set(s => {
    const q = s.quotesById[id]; if (!q) return {}
    return {
      quotesById: {
        ...s.quotesById,
        [id]: { ...q, ...meta, updatedAt: nowISO() }
      }
    }
  }),

  setActive: (id: string) => set(({ activeId: id })),

  addLine: (quoteId, partial) => {
    const id = partial.id ?? newLineId()
    set(s => {
      const q = s.quotesById[quoteId]; if (!q) return {}
      const line: QuoteLine = {
        id,
        description: partial.description ?? '',
        ean: partial.ean,
        um: partial.um ?? 'UNIT',
        qty: partial.qty ?? 1,
        cost: partial.cost ?? null,
        currency: partial.currency ?? q.currency,
        price: partial.price ?? null,
        margin: partial.margin ?? null,
        source: partial.source,
      }
      return {
        quotesById: {
          ...s.quotesById,
          [quoteId]: { ...q, items: [...q.items, line], updatedAt: nowISO() }
        }
      }
    })
    return id
  },

  removeLine: (quoteId, lineId) => set(s => {
    const q = s.quotesById[quoteId]; if (!q) return {}
    return {
      quotesById: {
        ...s.quotesById,
        [quoteId]: {
          ...q,
          items: q.items.filter(l => l.id !== lineId),
          updatedAt: nowISO()
        }
      }
    }
  }),

  setLineQty: (quoteId, lineId, qty) => set(s => {
    const q = s.quotesById[quoteId]; if (!q) return {}
    return {
      quotesById: {
        ...s.quotesById,
        [quoteId]: {
          ...q,
          items: q.items.map(l => l.id === lineId ? { ...l, qty } : l),
          updatedAt: nowISO()
        }
      }
    }
  }),

  applyAvailabilityToLine: (quoteId, lineId, { cost, currency, productKey, warehouse, defaultMargin = 10 }) =>
    set(s => {
      const q = s.quotesById[quoteId]; if (!q) return {}


      return {

        quotesById: {
          ...s.quotesById,
          [quoteId]: {
            ...q,
            items: q.items.map(l => {
              if (l.id !== lineId) return l
              const price = priceFrom(cost, defaultMargin)
              return {
                ...l,
                cost,
                currency,
                price,
                margin: defaultMargin,
                source: { productKey, warehouse }
              }
            }),
            updatedAt: nowISO()
          }
        }
      }
    }),

  setLinePrice: (quoteId, lineId, price) => set(s => {
    const q = s.quotesById[quoteId]; if (!q) return {}
    return {
      quotesById: {
        ...s.quotesById,
        [quoteId]: {
          ...q,
          items: q.items.map(l => {
            if (l.id !== lineId || l.cost == null) return l
            const margin = marginFrom(l.cost, price)
            return { ...l, price, margin }
          }),
          updatedAt: nowISO()
        }
      }
    }
  }),

  setLineMargin: (quoteId, lineId, margin) => set(s => {
    const q = s.quotesById[quoteId]; if (!q) return {}
    return {
      quotesById: {
        ...s.quotesById,
        [quoteId]: {
          ...q,
          items: q.items.map(l => {
            if (l.id !== lineId || l.cost == null) return l
            const price = priceFrom(l.cost, margin)
            return { ...l, margin, price }
          }),
          updatedAt: nowISO()
        }
      }
    }
  }),
})



export const useQuoteStore = create<QuotesState>()(

  devtools(
    persist(
      apiStore,
      { name: 'quote-storage' }
    ),
    { name: 'quote-store' }

  )
)
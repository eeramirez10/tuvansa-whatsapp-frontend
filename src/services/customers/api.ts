import { envs } from '../../config/envs'
import { fetcher } from '../../utils/fetcher'
import type {
  CustomerDirectoryDetail,
  CustomerDirectoryItem,
  CustomerDirectoryPage,
  CustomerDirectoryParams,
  CustomerQuoteSummary
} from './types'

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as UnknownRecord
}

const asString = (value: unknown, fallback = '') => {
  return typeof value === 'string' ? value : fallback
}

const asNullableString = (value: unknown) => {
  const parsed = asString(value)
  return parsed || null
}

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const mapQuote = (value: unknown): CustomerQuoteSummary => {
  const quote = asRecord(value)
  const branch = asRecord(quote.branch)
  const assignedSeller = asRecord(quote.assignedSeller)

  return {
    id: asString(quote.id),
    quoteNumber: asNumber(quote.quoteNumber),
    createdAt: asString(quote.createdAt),
    status: asString(quote.status, 'PENDING'),
    workflowStatus: asString(quote.workflowStatus, 'NEW'),
    branchId: asNullableString(quote.branchId),
    branch: asString(branch.id)
      ? { id: asString(branch.id), name: asString(branch.name) }
      : null,
    assignedSeller: asString(assignedSeller.id)
      ? {
          id: asString(assignedSeller.id),
          name: asString(assignedSeller.name),
          lastname: asString(assignedSeller.lastname),
        }
      : null,
  }
}

const getQuotes = (customer: UnknownRecord) => {
  return Array.isArray(customer.quotes) ? customer.quotes.map(mapQuote) : []
}

const mapCustomer = (value: unknown): CustomerDirectoryItem => {
  const customer = asRecord(value)
  const quotes = getQuotes(customer)
  const lastQuoteAt = quotes.reduce<string | null>((latest, quote) => {
    if (!quote.createdAt) return latest
    if (!latest || new Date(quote.createdAt).getTime() > new Date(latest).getTime()) {
      return quote.createdAt
    }
    return latest
  }, null)

  return {
    id: asString(customer.id),
    name: asString(customer.name),
    lastname: asString(customer.lastname),
    email: asString(customer.email),
    phone: asString(customer.phone),
    location: asString(customer.location),
    company: asNullableString(customer.company),
    createdAt: asString(customer.createdAt),
    quoteCount: asNumber(customer.quoteCount, quotes.length),
    lastQuoteAt: asNullableString(customer.lastQuoteAt) ?? lastQuoteAt,
  }
}

const normalizeSearchValue = (value: unknown) => {
  return asString(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const matchesSearch = (customer: CustomerDirectoryItem, search: string) => {
  const term = normalizeSearchValue(search)
  if (!term) return true

  return [customer.name, customer.lastname, customer.company, customer.email, customer.phone]
    .some((value) => normalizeSearchValue(value).includes(term))
}

export const getCustomers = async (params: CustomerDirectoryParams = {}) => {
  const query = new URLSearchParams()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20

  if (params.search?.trim()) query.set('search', params.search.trim())
  query.set('page', `${page}`)
  query.set('pageSize', `${pageSize}`)

  const response = await fetcher<unknown>(`${envs.URL}/customers?${query.toString()}`)

  // The previous API returns a direct array; the new endpoint returns a paginated object.
  if (Array.isArray(response)) {
    const customers = response
      .map(mapCustomer)
      .filter((customer) => matchesSearch(customer, params.search ?? ''))
    const start = (page - 1) * pageSize

    return {
      items: customers.slice(start, start + pageSize),
      total: customers.length,
      page,
      pageSize,
    } satisfies CustomerDirectoryPage
  }

  const paginatedResponse = asRecord(response)
  const items = Array.isArray(paginatedResponse.items)
    ? paginatedResponse.items.map(mapCustomer)
    : []

  return {
    items,
    total: asNumber(paginatedResponse.total, items.length),
    page: asNumber(paginatedResponse.page, page),
    pageSize: asNumber(paginatedResponse.pageSize, pageSize),
  } satisfies CustomerDirectoryPage
}

export const getCustomerById = async (customerId: string) => {
  const response = await fetcher<unknown>(
    `${envs.URL}/customers/${encodeURIComponent(customerId)}`
  )
  const customer = asRecord(response)

  return {
    id: asString(customer.id),
    name: asString(customer.name),
    lastname: asString(customer.lastname),
    email: asString(customer.email),
    phone: asString(customer.phone),
    location: asString(customer.location),
    company: asNullableString(customer.company),
    createdAt: asString(customer.createdAt),
    quotes: getQuotes(customer),
  } satisfies CustomerDirectoryDetail
}

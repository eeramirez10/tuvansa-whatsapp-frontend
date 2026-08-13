export interface CustomerDirectoryItem {
  id: string
  name: string
  lastname: string
  email: string
  phone: string
  location: string
  company: string | null
  createdAt: string
  quoteCount: number
  lastQuoteAt: string | null
}

export interface CustomerQuoteSummary {
  id: string
  quoteNumber: number
  createdAt: string
  status: string
  workflowStatus: string
  branchId: string | null
  branch: {
    id: string
    name: string
  } | null
  assignedSeller: {
    id: string
    name: string
    lastname: string
  } | null
}

export interface CustomerDirectoryDetail extends Omit<CustomerDirectoryItem, 'quoteCount' | 'lastQuoteAt'> {
  quotes: CustomerQuoteSummary[]
}

export interface CustomerDirectoryPage {
  items: CustomerDirectoryItem[]
  total: number
  page: number
  pageSize: number
}

export interface CustomerDirectoryParams {
  search?: string
  page?: number
  pageSize?: number
}

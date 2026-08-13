export type QuoteWorkflowStatus =
  | 'NEW'
  | 'VIEWED'
  | 'DOWNLOADED'
  | 'IN_PROGRESS'
  | 'QUOTED'
  | 'REJECTED'
  | 'INVOICED'

export interface QuotesByBranchReportItem {
  branchId: string | null
  branchName: string
  totalQuotes: number
  percentage: number
}

export interface QuotesByBranchReportResponse {
  total: number
  items: QuotesByBranchReportItem[]
}

export interface QuotesByBranchStatusReportItem {
  branchId: string | null
  branchName: string
  totalQuotes: number
  statuses: Record<QuoteWorkflowStatus, number>
}

export interface QuotesByBranchStatusReportResponse {
  items: QuotesByBranchStatusReportItem[]
}

export interface QuotesReportFilters {
  startDate?: string
  endDate?: string
  branchId?: string
  workflowStatus?: QuoteWorkflowStatus | 'ALL'
}

export interface QuotesExecutiveReportFilters {
  year?: number
  branchId?: string
}

export interface QuotesExecutiveTopBranch {
  branchId: string | null
  branchName: string
  value: number
}

export interface QuotesExecutiveKpis {
  totalRequests: number
  attendedRequests: number
  attentionRate: number
  quoted: number
  rejected: number
  invoiced: number
  inProgress: number
  topBranchByRequests: QuotesExecutiveTopBranch | null
  topBranchByAttentionRate: QuotesExecutiveTopBranch | null
  topBranchByBacklog: QuotesExecutiveTopBranch | null
}

export interface QuotesExecutiveMonthlyRow {
  month: number
  label: string
  totalRequests: number
  attendedRequests: number
  attentionRate: number
  inProgress: number
  quoted: number
  rejected: number
  invoiced: number
}

export interface QuotesExecutiveRejectedTypeRow {
  type: string
  count: number
  percentage: number
}

export interface QuotesExecutiveRejectedTypeMonthlyRow {
  month: number
  label: string
  items: QuotesExecutiveRejectedTypeRow[]
}

export interface QuotesExecutiveReportResponse {
  year: number
  generatedAt: string
  kpis: QuotesExecutiveKpis
  monthly: QuotesExecutiveMonthlyRow[]
  rejectedByType: QuotesExecutiveRejectedTypeRow[]
  rejectedByTypeMonthly: QuotesExecutiveRejectedTypeMonthlyRow[]
}

export interface QuotesUnattendedReportFilters {
  branchId?: string
}

export interface QuotesUnattendedManager {
  id: string
  name: string
  lastname: string
  email: string
  phone: string | null
}

export interface QuotesUnattendedCustomer {
  id: string
  name: string
  lastname: string
  company: string | null
  email: string
  phone: string
}

export interface QuotesUnattendedQuote {
  id: string
  quoteNumber: number
  createdAt: string
  ageHours: number
  customer: QuotesUnattendedCustomer
}

export interface QuotesUnattendedBranchRow {
  branchId: string | null
  branchName: string
  manager: QuotesUnattendedManager | null
  totalNew: number
  under24Hours: number
  from24To72Hours: number
  from3To7Days: number
  over7Days: number
  oldestCreatedAt: string
  oldestAgeHours: number
  quotes: QuotesUnattendedQuote[]
}

export interface QuotesUnattendedReportResponse {
  generatedAt: string
  kpis: {
    totalNew: number
    branchesWithNew: number
    olderThan24Hours: number
    olderThan72Hours: number
    oldestAgeHours: number
  }
  branches: QuotesUnattendedBranchRow[]
}

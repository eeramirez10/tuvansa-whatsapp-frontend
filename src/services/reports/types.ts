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

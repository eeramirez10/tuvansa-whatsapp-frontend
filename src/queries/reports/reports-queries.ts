import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getQuotesByBranchReport,
  getQuotesByBranchStatusReport,
  getQuotesExecutivePrintableReport
} from '../../services/reports/api'
import type { QuotesExecutiveReportFilters, QuotesReportFilters } from '../../services/reports/types'

export const reportsKeys = {
  all: ['reports'] as const,
  quotes: () => [...reportsKeys.all, 'quotes'] as const,
  quotesByBranch: (filters?: QuotesReportFilters) =>
    [...reportsKeys.quotes(), 'by-branch', filters ?? {}] as const,
  quotesByBranchStatus: (filters?: Omit<QuotesReportFilters, 'workflowStatus'>) =>
    [...reportsKeys.quotes(), 'by-branch-status', filters ?? {}] as const,
  quotesExecutivePrintable: (filters?: QuotesExecutiveReportFilters) =>
    [...reportsKeys.quotes(), 'executive-printable', filters ?? {}] as const
}

export const useQuotesByBranchReport = (
  filters?: QuotesReportFilters,
  enabled = true
) => {
  return useQuery({
    queryKey: reportsKeys.quotesByBranch(filters),
    queryFn: () => getQuotesByBranchReport(filters),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData
  })
}

export const useQuotesByBranchStatusReport = (
  filters?: Omit<QuotesReportFilters, 'workflowStatus'>,
  enabled = true
) => {
  return useQuery({
    queryKey: reportsKeys.quotesByBranchStatus(filters),
    queryFn: () => getQuotesByBranchStatusReport(filters),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData
  })
}

export const useQuotesExecutivePrintableReport = (
  filters?: QuotesExecutiveReportFilters,
  enabled = true
) => {
  return useQuery({
    queryKey: reportsKeys.quotesExecutivePrintable(filters),
    queryFn: () => getQuotesExecutivePrintableReport(filters),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData
  })
}

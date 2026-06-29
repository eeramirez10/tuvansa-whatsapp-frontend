import { envs } from '../../config/envs'
import { fetcher } from '../../utils/fetcher'
import type {
  QuotesByBranchReportResponse,
  QuotesByBranchStatusReportResponse,
  QuotesExecutiveReportFilters,
  QuotesExecutiveReportResponse,
  QuotesReportFilters
} from './types'

const buildReportsQuery = (filters?: object) => {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries((filters ?? {}) as Record<string, unknown>)) {
    if (value === undefined || value === null || value === '') continue
    if (value === 'ALL') continue
    query.set(key, String(value))
  }

  return query.toString()
}

export const getQuotesByBranchReport = async (
  filters?: QuotesReportFilters
): Promise<QuotesByBranchReportResponse> => {
  const query = buildReportsQuery(filters)

  return await fetcher<QuotesByBranchReportResponse>(
    `${envs.URL}/reports/quotes/by-branch${query ? `?${query}` : ''}`
  )
}

export const getQuotesByBranchStatusReport = async (
  filters?: Omit<QuotesReportFilters, 'workflowStatus'>
): Promise<QuotesByBranchStatusReportResponse> => {
  const query = buildReportsQuery(filters)

  return await fetcher<QuotesByBranchStatusReportResponse>(
    `${envs.URL}/reports/quotes/by-branch-status${query ? `?${query}` : ''}`
  )
}

export const getQuotesExecutivePrintableReport = async (
  filters?: QuotesExecutiveReportFilters
): Promise<QuotesExecutiveReportResponse> => {
  const query = buildReportsQuery(filters)

  return await fetcher<QuotesExecutiveReportResponse>(
    `${envs.URL}/reports/quotes/executive-printable${query ? `?${query}` : ''}`
  )
}

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assignQuoteSeller, getQuoteById, getQuotes, type AssignQuoteSellerPayload } from '../../services/quotes/api'
import type { PageResult } from '../../services/quotes/types'
import dayjs, { Dayjs } from 'dayjs'
import { useMemo } from 'react'
import { type Quote } from '../../store/quote/quote.store'

type DateRange = { startDate: string; endDate: string }
type ListParams = Record<string, unknown>
type UseQuotesOptions = {
  params?: ListParams
  range?: DateRange
  enabled?: boolean
}

export const quotesKeys = {
  all: ['quotes'] as const,
  list: (params?: ListParams, range?: DateRange) =>
    [...quotesKeys.all, 'list', params ?? {}, range ?? {}] as const,
  detail: (id: string) => [...quotesKeys.all, 'detail', { id }] as const,
  countByRange: (params: ListParams) => [...quotesKeys.all, 'count', params] as const,
}

const fmt = (d: Dayjs) => d.format('DD-MM-YYYY')
const todayRange = (): DateRange => {
  const today = fmt(dayjs())
  return { startDate: today, endDate: today }
}
const monthRange = (): DateRange => ({
  startDate: fmt(dayjs().startOf('month')),
  endDate: fmt(dayjs().endOf('month')),
})

export const useQuotes = ({ params, range, enabled = true }: UseQuotesOptions = {}) => {
  const mergedParams = { ...(params ?? {}), ...(range ?? {}) }
  return useQuery({
    queryKey: quotesKeys.list(params, range),
    queryFn: () => getQuotes({}, mergedParams),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  })
}

export const useQuote = (id?: string) => {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: id ? quotesKeys.detail(id) : ['__disabled__'],
    queryFn: async () => {
      return await getQuoteById(id!)
    },
    enabled: Boolean(id),
    initialData: () => {
      if (!id) return undefined
      const list = queryClient.getQueryData<PageResult<Quote>>(quotesKeys.list({}, undefined))
      return list?.items.find((q) => q.id === id)
    },
  })
}

export const useAssignQuoteSeller = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ quoteId, payload }: { quoteId: string; payload: AssignQuoteSellerPayload }) =>
      assignQuoteSeller(quoteId, payload),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: quotesKeys.all })
      await queryClient.invalidateQueries({ queryKey: quotesKeys.detail(variables.quoteId) })
    },
  })
}

export const useQuotesCountByRange = (range: DateRange, params?: ListParams, enabled = true) => {
  const mergedParams = { ...(params ?? {}), ...range }
  return useQuery({
    queryKey: quotesKeys.countByRange(mergedParams),
    queryFn: () => getQuotes({}, mergedParams),
    enabled,
    select: (data) => data.total,
    staleTime: 15_000,
    gcTime: 2 * 60_000,
  })
}

export const useTotalQuotesToday = (params?: ListParams, enabled = true) => {
  const range = useMemo(() => todayRange(), [])
  return useQuotesCountByRange(range, params, enabled)
}

export const useTotalQuotesMonthly = (params?: ListParams, enabled = true) => {
  const range = useMemo(() => monthRange(), [])
  return useQuotesCountByRange(range, params, enabled)
}

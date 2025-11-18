import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { getQuoteById, getQuotes } from "../../services/quotes/api"
import type { PageResult } from "../../services/quotes/types"
import dayjs, { Dayjs } from "dayjs"
import { useMemo } from "react"
import { type Quote } from "../../store/quote/quote.store"



type DateRange = { startDate: string; endDate: string }
type ListParams = Record<string, unknown> // por si mandas {status, customerId, ...}

export const quotesKeys = {
  all: ["quotes"] as const,
  list: (params?: ListParams, range?: DateRange) =>
    [...quotesKeys.all, "list", params ?? {}, range ?? {}] as const,
  detail: (id: string) => [...quotesKeys.all, "detail", { id }] as const,
  countByRange: (range: DateRange) => [...quotesKeys.all, "count", range] as const,
}

const fmt = (d: Dayjs) => d.format("DD-MM-YYYY")
const todayRange = (): DateRange => {
  const today = fmt(dayjs())
  return { startDate: today, endDate: today }
}
const monthRange = (): DateRange => ({
  startDate: fmt(dayjs().startOf("month")),
  endDate: fmt(dayjs().endOf("month")),
})

export const useQuotes = (params?: ListParams, range?: DateRange) => {
  return useQuery({
    queryKey: quotesKeys.list(params, range),
    queryFn: () => getQuotes(params ?? {}, range),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    // Mantén datos anteriores mientras llega la nueva respuesta
    placeholderData: keepPreviousData,
  })
}

export const useQuote = (id?: string) => {



 

  const queryClient = useQueryClient()
  return useQuery({
    queryKey: id ? quotesKeys.detail(id) : ["__disabled__"],
    queryFn: async () => {
      return await getQuoteById(id!)



    },
    enabled: Boolean(id),
    // Usa datos de la lista para "hydratar" el detalle instantáneamente
    initialData: () => {
      if (!id) return undefined
      const list = queryClient.getQueryData<PageResult<Quote>>(quotesKeys.list({}, undefined))
      return list?.items.find((q) => q.id === id)
    },
    // staleTime: 60_000, // 1 min: detalles cambian menos
    // gcTime: 10 * 60_000,
  })
}

export const useQuotesCountByRange = (range: DateRange, enabled = true) => {
  return useQuery({
    queryKey: quotesKeys.countByRange(range),
    queryFn: () => getQuotes({}, range),
    enabled,
    select: (data) => data.items.length,
    staleTime: 15_000,
    gcTime: 2 * 60_000,
  })
}

export const useTotalQuotesToday = () => {
  const range = useMemo(() => todayRange(), [])
  return useQuotesCountByRange(range)
}

export const useTotalQuotesMonthly = () => {
  const range = useMemo(() => monthRange(), [])
  return useQuotesCountByRange(range)
}
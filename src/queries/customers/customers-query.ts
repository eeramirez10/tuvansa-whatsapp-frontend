import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCustomerById, getCustomers } from '../../services/customers/api'
import type { CustomerDirectoryParams } from '../../services/customers/types'

export const customersKeys = {
  all: ['customers'] as const,
  list: (params: CustomerDirectoryParams) => [...customersKeys.all, 'list', params] as const,
  detail: (customerId: string) => [...customersKeys.all, 'detail', customerId] as const,
}

export const useCustomers = (params: CustomerDirectoryParams) => {
  return useQuery({
    queryKey: customersKeys.list(params),
    queryFn: () => getCustomers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export const useCustomer = (customerId?: string) => {
  return useQuery({
    queryKey: customerId ? customersKeys.detail(customerId) : [...customersKeys.all, 'disabled'],
    queryFn: () => getCustomerById(customerId!),
    enabled: Boolean(customerId),
    staleTime: 30_000,
  })
}

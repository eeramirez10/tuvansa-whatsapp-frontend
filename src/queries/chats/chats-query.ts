import { useQuery } from "@tanstack/react-query"
import { getChats } from "../../services/chats/api"


interface Option {
  page: number
  pageSize: number
}

export const messageKeys = {
  all: ['chats'] as const,
  list: (options?: Option) => [...messageKeys.all, 'list', options] as const,
  listChatsOnlyCustomer: (options?: Option) => [...messageKeys.all, 'listChatsOnlyCustomer', options] as const,
  detail: (id: string) => [...messageKeys.all, 'listChatsOnlyCustomer', id] as const

}

const getCustomerChats = async (options: Record<string, unknown>) => {

  const data = await getChats(options as unknown as Record<string, unknown>)
  return data?.map((d) => ({ ...d, messages: d.messages.filter((m) => m.role === 'user') }))
}

export const useChats = (options?: Option) => {

  return useQuery({
    queryKey: messageKeys.list(),
    queryFn: () => getChats(options as unknown as Record<string, unknown>),

  })

}

export const useChatsCustomers = (options?: Option) => {

  return useQuery({
    queryKey: messageKeys.listChatsOnlyCustomer(),
    queryFn: () => getCustomerChats(options as unknown as Record<string, unknown>),

  })
}
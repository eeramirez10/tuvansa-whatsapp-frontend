import { useQuery } from "@tanstack/react-query"
import { getMessagesByThread } from "../../services/messages/api"



export const messageKeys = {
  all: ['messages'] as const,
  list: (threadId: string) => [...messageKeys.all, 'list', threadId] as const,

}


export const useMessages = (threadId?: string, params?:Record<string, unknown>) => {



  return useQuery({
    queryKey: threadId ? messageKeys.list(threadId) : ['messages', 'list', '__none__'],
    queryFn: () => getMessagesByThread({ threadId }, params),
    enabled: Boolean(threadId),
    staleTime: 0,                    // ✅ fuerza refetch al cambiar
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: false,

  })

}


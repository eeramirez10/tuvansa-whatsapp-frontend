import { useMutation, useQueryClient } from "@tanstack/react-query"
import { concluideQuote } from "../../services/quotes/api"
import { refreshQuote, refreshQuoteList } from "./utils"



export const useConcluideQuote = () => {

  const queryClient = useQueryClient()


  return useMutation({
    mutationFn: (payload: { versionId: string, quoteId: string }) => {
      return concluideQuote(payload.versionId)
    },
    onSuccess: async (_data, { quoteId }) => {
      await refreshQuote(queryClient, quoteId);
      await refreshQuoteList(queryClient);
    },

  })

}
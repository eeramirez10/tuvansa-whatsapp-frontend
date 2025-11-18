import { QueryClient } from '@tanstack/react-query';
import { quoteKeys } from './keys';


export const refreshQuote = async (queryClient: QueryClient, quoteId: string) => {
  await queryClient.invalidateQueries({ queryKey: quoteKeys.byId(quoteId), exact: false })
  await queryClient.refetchQueries({ queryKey: quoteKeys.byId(quoteId), type: 'active' })

}

export const refreshQuoteList = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: quoteKeys.all, exact: false })
}
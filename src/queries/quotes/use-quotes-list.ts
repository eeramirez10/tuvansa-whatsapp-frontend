// import { useQuery } from '@tanstack/react-query';
// import { quoteKeys } from './keys';
// import { listQuotes } from '../../services/quotes/api';

// type UseQuotesListOpts = {
//   filters?: Record<string, unknown>;
//   page?: number;
//   pageSize?: number;
//   enabled?: boolean;
// };

// export function useQuotesList({ filters = {}, page = 1, pageSize = 20, enabled = true }: UseQuotesListOpts) {
//   const params = { ...filters, page, pageSize };
//   return useQuery({
//     queryKey: quoteKeys.list(params),
//     queryFn: () => listQuotes(params),
//     enabled,
//     keepPreviousData: true,
//     staleTime: 30_000,
//   });
// }
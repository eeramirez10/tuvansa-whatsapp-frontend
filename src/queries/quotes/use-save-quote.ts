import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { saveQuote } from "../../services/quotes/api";
import { refreshQuote, refreshQuoteList } from "./utils";
import { quoteKeys } from "./keys";

export interface StoreQuoteCustomer {
  id?: string;
  name: string;
  lastname?: string;
  phone?: string;
  email?: string;
  location?: string;
}

export interface StoreQuoteLine {
  id: string;
  description: string;
  ean?: string;
  um?: string;
  qty: number;

  // pricing
  cost: number | null;
  currency: string;        // 'MXN', 'USD', etc.
  price: number | null;
  margin: number | null;   // %
  // trazabilidad (opcional)
  source?: {
    productKey?: string;
    warehouse?: string;
  };
}

export interface StoreQuote {
  id: string;                    // corresponde a quoteId (BD)
  currency: string;              // ej. 'MXN'
  taxRate: number;               // ej. 0.16 (16%)
  customer?: StoreQuoteCustomer; // del UI
  items: StoreQuoteLine[];
  summary?: string;
  chatThreadId?: string;
  fileKey?: string;
  branch?: string;
}

/** Parámetros para ejecutar el caso de uso */
export interface SaveQuoteDraftParams {
  quoteId: string;               // el Quote.id original (BD)
  sellerId?: string;
  customerId?: string | null;    // si quieres ligar al Customer vivo
  storeQuote: StoreQuote;        // estado来自你的Zustand
  validUntil?: Date | null;
  paymentTerms?: string | null;
  deliveryTime?: string | null;
  notes?: string | null;
  idempotencyKey?: string | null;
}

type SaveQuoteVars = {
  quoteId: string,
  body: SaveQuoteDraftParams
}

type SaveQuoteOptions = {
  optimistic?: boolean
}

type SaveCtx = {
  snapshots: Array<[QueryKey, unknown]>
}

export const useSaveQuote = (opt: SaveQuoteOptions) => {





  const queryClient = useQueryClient()

  return useMutation<unknown, unknown, SaveQuoteVars, SaveCtx>({
    mutationFn: ({ quoteId, body }: SaveQuoteVars) => {

      return saveQuote(quoteId, body)
    },
    ...(opt?.optimistic && {
      onMutate: async ({ quoteId, body }: SaveQuoteVars) => {
        await queryClient.cancelQueries({ queryKey: quoteKeys.byId(quoteId), exact: false });
        const snapshots = queryClient.getQueriesData({ queryKey: quoteKeys.byId(quoteId) });
        queryClient.setQueriesData({ queryKey: quoteKeys.byId(quoteId), exact: false }, (old: unknown) =>
          old ? { ...old, ...body } : body
        );
        return { snapshots };
      },
      onError: (_e, _vars, ctx) => {

        for (const [key, data] of ctx?.snapshots ?? []) {

          queryClient.setQueryData(key, data);
        }
      },
    }),

    onSuccess: async (_data, { quoteId }) => {
      await refreshQuote(queryClient, quoteId);
      await refreshQuoteList(queryClient);
    },

  })
}
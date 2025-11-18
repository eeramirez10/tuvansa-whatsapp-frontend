import { useQuery } from "@tanstack/react-query";
import { getQuoteDisplay } from "../../services/quotes/api";


// queries/quotes/keys.ts
export const quoteDisplayKeys = {
  all: ['quotes','display'] as const,
  byId: (id: string) => [...quoteDisplayKeys.all, id] as const,
  detail: (id: string, params?: { prefer?: 'final'|'draft'; include?: string[] }) =>
    [...quoteDisplayKeys.byId(id), { ...params }] as const,
};

type UseQuoteDisplayOptions = {
  id?: string;
  presignSeconds?: number;         
  prefer?: 'final' | 'draft';       
  include?: Array<'items' | 'artifacts' | 'messages'>; 
  enabled?: boolean;
};

export function useQuoteDisplay(opts: UseQuoteDisplayOptions) {
  const { id, presignSeconds, prefer='final', include=['items','artifacts'], enabled=!!opts.id } = opts;

  return useQuery({
    queryKey: id ? quoteDisplayKeys.detail(id, { prefer, include }) : ['__disabled__'],
    queryFn: () => getQuoteDisplay(id!, { presignSeconds, prefer, include }), // <- fuera de la key
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always', // opcional: asegura refetch al montar
    // select: (d) => d,
  });
}
// export const quoteKeys = {
//   all: ['quotes'] as const,

//   colección
//   list: (params?: Record<string, unknown>) =>
//     [...quoteKeys.all, 'list', params ?? {}] as const,

//   recurso
//   byQuote: (quoteId: string) => [...quoteKeys.all, 'q', quoteId] as const,
//   detailByQuote: (
//     quoteId: string,
//     p?: { prefer?: 'final' | 'draft'; include?: string[] }
//   ) => [...quoteKeys.byQuote(quoteId), { ...p }] as const,
// };

export const quoteKeys = {
  all: ['quotes','display'] as const,
  byId: (id: string) => [...quoteKeys.all, id] as const,
  detail: (id: string, params?: { prefer?: 'final'|'draft'; include?: string[] }) =>
    [...quoteKeys.byId(id), { ...params }] as const,
};
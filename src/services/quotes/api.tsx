import { envs } from "../../config/envs";
import type { QuoteCustomer, Quote } from "../../store/quote/quote.store";
import { fetcher, postFetcher } from "../../utils/fetcher";

import { displayToStoreQuote, type DisplayResult } from "./quote-display.mapper";
import { quoteMapper } from "./quotesMapper";
import type { PageResult } from './types';

export type ArtifactPdfResult = {

  ok: boolean,
  data: {
    artifactId: string
    fileKey: string
    mimeType: string
    checksum: string
    sizeBytes: string
    presignedUrl: string
    expiresIn: string
  },

}


export const getQuotes = async (options: RequestInit, params?: { [key: string]: unknown; }) => {

  const obj: Record<string, unknown> = {}
  let urlParams = ''

  const pageValue = params?.page ?? 1
  const pageSize = params?.size ?? 50

  if (params?.startDate) {
    obj.startDate = params?.startDate
    obj.endDate = params?.endDate
  }

  for (const [key, value] of Object.entries(obj)) {

    urlParams += `&${key}=${value}`
  }

  const resp = await fetcher<PageResult<Quote[]>>(
    `${envs.URL}/quotes?page=${pageValue}&pageSize=${pageSize}${urlParams}`,
    options
  )

  return { ...resp, items: resp.items.map((quote) => quoteMapper({ ...quote })) }

}

export const getQuoteById = async (id: string) => {


  const quote = await fetcher<QuoteCustomer>(
    `${envs.URL}/quotes/${id}`,

  )

  return quoteMapper({ ...quote })

}

export const saveQuote = async (quoteId: string, body: Record<never, unknown>) => {

  const response = await postFetcher(`${envs.URL}/quotes/${quoteId}/versions/draft`, body)

  return response
}

export async function getQuoteDisplay(
  quoteId: string,
  opts?: { presignSeconds?: number; prefer?: 'final' | 'draft'; include?: Array<'items' | 'artifacts' | 'messages'> }
): Promise<Quote> {
  const params = new URLSearchParams();
  if (opts?.presignSeconds) params.set('presign', String(opts.presignSeconds));
  if (opts?.prefer) params.set('prefer', opts.prefer);
  if (opts?.include?.length) params.set('include', opts.include.join(','));

  const res = await fetcher<DisplayResult>(`${envs.URL}/quotes/${quoteId}/display?${params.toString()}`);

  const quote = displayToStoreQuote(res)



  return quote
}

export const generateArtifactPdf = async (quoteVersionId: string) => {



  const resp = await postFetcher<ArtifactPdfResult>(`${envs.URL}/quote-versions/${quoteVersionId}/artifacts/pdf`, {})

  return resp


}


export const concluideQuote = async (quoteVersionId: string) => {

  const resp = await postFetcher<ArtifactPdfResult>(`${envs.URL}/quote-versions/${quoteVersionId}/concluide`, {})

  return resp


}

export const sendPdfQuoteToCustomer = async (quoteVersionId: string) => {



  const resp = await postFetcher(`${envs.URL}/quote-versions/send-quote-pdf`, { quoteVersionId })


  return resp

}



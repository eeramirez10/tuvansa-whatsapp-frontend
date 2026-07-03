import { envs } from '../../config/envs'
import type { Quote } from '../../store/quote/quote.store'
import { deleteFetcher, fetcher, patchFetcher, postFetcher } from '../../utils/fetcher'
import { useAuthStore } from '../../store/auth/auth.store'

import { displayToStoreQuote, type DisplayResult } from './quote-display.mapper'
import { quoteMapper } from './quotesMapper'

import type { PageResult } from './types'

export type ArtifactPdfResult = {
  ok: boolean
  data: {
    artifactId: string
    fileKey: string
    mimeType: string
    checksum: string
    sizeBytes: string
    presignedUrl: string
    expiresIn: string
  }
}

interface GetAttachedFileResponse {
  url: string
}

export interface UpdateQuoteWorkflowPayload {
  workflowStatus: 'VIEWED' | 'DOWNLOADED' | 'IN_PROGRESS' | 'QUOTED' | 'REJECTED' | 'INVOICED'
  erpQuoteNumber?: string
  erpSystem?: string
  erpInvoiceNumber?: string
  rejectedReason?: string
}

export interface AssignQuoteSellerPayload {
  sellerId: string | null
}

export interface AssignQuoteSellerResponse {
  ok: boolean
  message: string
  quote: Quote
  notifications?: {
    whatsappSent: boolean
    emailSent: boolean
  }
}

export const getQuotes = async (options: RequestInit, params?: { [key: string]: unknown }) => {
  const query = new URLSearchParams()

  const pageValue = Number(params?.page ?? 1)
  const pageSize = Number(params?.pageSize ?? params?.size ?? 5)

  query.set('page', `${pageValue}`)
  query.set('pageSize', `${pageSize}`)

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') continue
    if (key === 'page' || key === 'pageSize' || key === 'size') continue
    query.set(key, `${value}`)
  }

  const resp = await fetcher<PageResult<Quote[]>>(
    `${envs.URL}/quotes?${query.toString()}`,
    options,
  )

  return { ...resp, items: resp.items.map((quote) => quoteMapper({ ...quote })) }
}

export const getQuoteById = async (id: string) => {
  const quote = await fetcher<Record<string, unknown>>(`${envs.URL}/quotes/${id}`)
  return quoteMapper({ ...quote })
}

export const saveQuote = async (quoteId: string, body: Record<never, unknown>) => {
  const response = await postFetcher(`${envs.URL}/quotes/${quoteId}/versions/draft`, body)
  return response
}

export async function getQuoteDisplay(
  quoteId: string,
  opts?: { presignSeconds?: number; prefer?: 'final' | 'draft'; include?: Array<'items' | 'artifacts' | 'messages'> },
): Promise<Quote> {
  const params = new URLSearchParams()
  if (opts?.presignSeconds) params.set('presign', String(opts.presignSeconds))
  if (opts?.prefer) params.set('prefer', opts.prefer)
  if (opts?.include?.length) params.set('include', opts.include.join(','))

  const res = await fetcher<DisplayResult>(`${envs.URL}/quotes/${quoteId}/display?${params.toString()}`)

  return displayToStoreQuote(res)
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

export const getAttachedFile = async (filename: string): Promise<GetAttachedFileResponse> => {
  const resp = await fetcher<GetAttachedFileResponse>(`${envs.URL}/quotes/${filename}/quote`)
  return resp
}

export const getQuoteAttachmentFileBlob = async (quoteId: string): Promise<Blob> => {
  const response = await fetch(`${envs.URL}/quotes/${quoteId}/attachment-file`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    },
  })

  if (!response.ok) {
    let errorMessage = 'No se pudo descargar el archivo adjunto'
    try {
      const body = (await response.json()) as Record<string, unknown>
      errorMessage = `${body.error ?? errorMessage}`
    } catch {
      // noop
    }
    throw new Error(errorMessage)
  }

  return await response.blob()
}

export const updateQuoteWorkflowStatus = async (
  quoteId: string,
  payload: UpdateQuoteWorkflowPayload,
) => {
  return await patchFetcher<Record<string, unknown>>(
    `${envs.URL}/quotes/${quoteId}/workflow-status`,
    payload,
  )
}

export const assignQuoteSeller = async (
  quoteId: string,
  payload: AssignQuoteSellerPayload,
): Promise<AssignQuoteSellerResponse> => {
  const response = await patchFetcher<{
    ok: boolean
    message: string
    quote: Record<string, unknown>
    notifications?: {
      whatsappSent: boolean
      emailSent: boolean
    }
  }>(`${envs.URL}/quotes/${quoteId}/assign-seller`, payload)

  return {
    ok: response.ok,
    message: response.message,
    quote: quoteMapper(response.quote),
    notifications: response.notifications,
  }
}

export const saveQuoteExtractionResult = async (
  quoteId: string,
  payload: {
    jobId?: string
    status?: string
    result?: {
      items?: Array<unknown>
      file_name?: string
      file_type?: string
      items_count?: number
    }
  },
) => {
  return await postFetcher<Record<string, unknown>>(
    `${envs.URL}/quotes/${quoteId}/extraction-result`,
    {
      jobId: payload.jobId,
      status: payload.status,
      items: payload.result?.items ?? [],
      fileName: payload.result?.file_name,
      fileType: payload.result?.file_type,
      itemsCount: payload.result?.items_count,
    },
  )
}

export const deleteQuoteById = async (quoteId: string) => {
  return await deleteFetcher<Record<string, unknown>>(`${envs.URL}/quotes/${quoteId}`)
}

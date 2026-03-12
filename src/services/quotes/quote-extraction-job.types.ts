export interface ExtractionJobItem {
  idioma?: string
  cantidad?: number
  unidad_original?: string
  requiere_revision?: boolean
  unidad_normalizada?: string
  description_original?: string
  description_normalizada?: string
}

export interface ExtractionJobCreateResponse {
  job_id: string
  status: string
}

export interface ExtractionJobStatusResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | string
  progress?: number
  error?: string
}

export interface ExtractionJobResultResponse {
  job_id: string
  status: 'completed' | 'failed' | string
  result?: {
    items?: ExtractionJobItem[]
    file_name?: string
    file_type?: string
    items_count?: number
  }
  error?: string
}

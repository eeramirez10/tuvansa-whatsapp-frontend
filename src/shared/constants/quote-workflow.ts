export type QuoteWorkflowStatusValue =
  | 'NEW'
  | 'VIEWED'
  | 'DOWNLOADED'
  | 'IN_PROGRESS'
  | 'QUOTED'
  | 'REJECTED'
  | 'INVOICED'

export const QUOTE_WORKFLOW_STATUS_OPTIONS: Array<{
  value: QuoteWorkflowStatusValue
  label: string
}> = [
  { value: 'NEW', label: 'Nueva' },
  { value: 'VIEWED', label: 'Vista' },
  { value: 'DOWNLOADED', label: 'Descargada' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'QUOTED', label: 'Cotizada' },
  { value: 'REJECTED', label: 'Rechazada' },
  { value: 'INVOICED', label: 'Facturada' },
]

const QUOTE_WORKFLOW_STATUS_STYLE: Record<QuoteWorkflowStatusValue, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  VIEWED: 'bg-sky-100 text-sky-700',
  DOWNLOADED: 'bg-cyan-100 text-cyan-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  QUOTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  INVOICED: 'bg-purple-100 text-purple-700',
}

export const normalizeWorkflowStatus = (status?: string): QuoteWorkflowStatusValue => {
  const normalized = `${status ?? 'NEW'}`.toUpperCase() as QuoteWorkflowStatusValue
  return QUOTE_WORKFLOW_STATUS_OPTIONS.some((option) => option.value === normalized) ? normalized : 'NEW'
}

export const getWorkflowStatusLabel = (status?: string) => {
  const normalized = normalizeWorkflowStatus(status)
  return QUOTE_WORKFLOW_STATUS_OPTIONS.find((option) => option.value === normalized)?.label ?? normalized
}

export const getWorkflowStatusClassName = (status?: string) => {
  const normalized = normalizeWorkflowStatus(status)
  return QUOTE_WORKFLOW_STATUS_STYLE[normalized]
}

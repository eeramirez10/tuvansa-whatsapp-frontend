import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { Building2, FileSpreadsheet, Phone, User2, UserCheck2 } from 'lucide-react'
import { ChatPreview } from '../../shared/components/chats/ChatPreview'
import { useMessages } from '../../queries/messages/messages-query'
import { useUsers } from '../../queries/users/users-query'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../lib/notifications/toast-sonner'
import { quotesKeys, useAssignQuoteSeller, useQuote as useQuoteDetailQuery } from '../../queries/quotes/quotes-queries'
import { useFiles } from '../../hooks/useFiles'
import { PdfViewerModal } from '../../shared/components/modals/PdfViewerModal'
import {
  deleteQuoteById,
  getQuoteAttachmentFileBlob,
  saveQuoteExtractionResult,
  updateQuoteWorkflowStatus,
  type UpdateQuoteWorkflowPayload
} from '../../services/quotes/api'
import { isExcel, normalizeFileKey } from '../../utils/valids'
import { QuoteExtractionJobsService } from '../../services/quotes/quote-extraction-jobs.service'
import type { ExtractionJobResultResponse, ExtractionJobStatusResponse } from '../../services/quotes/quote-extraction-job.types'
import { dateFormat } from '../../utils/dateFormat'
import { AssignSellerModal } from '../../components/quotes/AssignSellerModal'
import { canAssignQuotesToVendors, normalizeUserRole } from '../../services/users/constants'
import type { User } from '../../interfaces/user.interface'

const REJECTION_OPTIONS = [
  'Cliente rechazó la oferta',
  'Sin respuesta del cliente',
  'Precio fuera de presupuesto',
  'No es cotización',
  'No aplica al ramo',
  'Falta de material'
]

const STATUS_META: Record<string, { label: string; style: string }> = {
  NEW: { label: 'Nueva', style: 'bg-blue-100 text-blue-700' },
  VIEWED: { label: 'Vista', style: 'bg-sky-100 text-sky-700' },
  DOWNLOADED: { label: 'Descargada', style: 'bg-cyan-100 text-cyan-700' },
  IN_PROGRESS: { label: 'En progreso', style: 'bg-amber-100 text-amber-700' },
  QUOTED: { label: 'Cotizada', style: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rechazada', style: 'bg-red-100 text-red-700' },
  INVOICED: { label: 'Facturada', style: 'bg-purple-100 text-purple-700' },
}

type ExtractionJobStage = 'uploading' | 'queued' | 'processing' | 'persisting' | 'saved' | 'failed'

interface StoredExtractionJobState {
  quoteId: string
  jobId?: string
  stage: ExtractionJobStage
  progress: number
  statusText: string
  error?: string | null
  updatedAt: string
}

const EXTRACTION_JOB_STORAGE_PREFIX = 'quote-extraction-job:'

const getExtractionJobStorageKey = (quoteId: string) => `${EXTRACTION_JOB_STORAGE_PREFIX}${quoteId}`

const readStoredExtractionJobState = (quoteId: string): StoredExtractionJobState | null => {
  try {
    const raw = localStorage.getItem(getExtractionJobStorageKey(quoteId))
    if (!raw) return null
    return JSON.parse(raw) as StoredExtractionJobState
  } catch {
    return null
  }
}

const persistStoredExtractionJobState = (quoteId: string, state: StoredExtractionJobState) => {
  localStorage.setItem(getExtractionJobStorageKey(quoteId), JSON.stringify(state))
}

const isActiveExtractionStage = (stage: ExtractionJobStage) =>
  stage === 'uploading' || stage === 'queued' || stage === 'processing' || stage === 'persisting'

const escapeCsvValue = (value: unknown) => {
  const text = `${value ?? ''}`.replaceAll('"', '""')
  return `"${text}"`
}

const downloadQuoteAsCsv = (options: {
  quoteNumber?: string | number
  items: Array<{ description?: string; ean?: string; um?: string; qty?: number }>
}) => {
  const headers = ['Descripcion', 'Codigo', 'UM', 'Cantidad']
  const rows = options.items.map((item) => ([
    escapeCsvValue(item.description),
    escapeCsvValue(item.ean),
    escapeCsvValue(item.um),
    escapeCsvValue(item.qty)
  ].join(',')))

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `cotizacion-${options.quoteNumber ?? 'sin-folio'}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

const isUserActive = (value: unknown) => {
  if (typeof value === 'boolean') return value
  return ['true', '1', 'active', 'activo'].includes(`${value ?? ''}`.toLowerCase())
}

const getUserFullName = (user?: User | null) => {
  if (!user) return 'Sin asignar'
  return `${user.name} ${user.lastname}`.trim()
}
type AuditLogItem = {
  id: string
  action: string
  at: string
  actor?: string
  detail?: string
}

export const QuoteWorkflowDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isAdmin = normalizeUserRole(user?.role) === 'ADMIN'
  const canAssignSeller = canAssignQuotesToVendors(user?.role)
  const { data: users } = useUsers({
    manageableOnly: true,
    enabled: canAssignSeller,
  })
  const assignQuoteSellerMutation = useAssignQuoteSeller()

  const { data: quote, isLoading } = useQuoteDetailQuery(id)
  const {
    handleViewOrDownloadFile,
    handleDownloadExcel,
    isLoadingFile,
    isDownloadingExcel,
    fileError,
    isOpen,
    pdfUrl
  } = useFiles()

  const status = `${quote?.workflowStatus ?? 'NEW'}`.toUpperCase()
  const canSeeCustomerDetails = isAdmin || status !== 'NEW'
  const canSeeDownloadedData = isAdmin || ['IN_PROGRESS', 'QUOTED', 'REJECTED', 'INVOICED'].includes(status)
  const canShowConversation = canSeeDownloadedData
  const canMarkViewed = !isAdmin && status === 'NEW'
  const canDownloadData = isAdmin || ['VIEWED', 'DOWNLOADED'].includes(status)
  const canSaveErpQuote = isAdmin || status === 'IN_PROGRESS'
  const canReject = isAdmin || status === 'IN_PROGRESS'
  const canProcessFile = !['REJECTED', 'QUOTED', 'INVOICED'].includes(status)
  const isRejected = status === 'REJECTED'
  const isFileOnly = Boolean(quote?.fileKey) && (quote?.items?.length ?? 0) === 0
  const normalizedFileKey = normalizeFileKey(quote?.fileKey ?? '')
  const hasAttachedFile = Boolean(normalizedFileKey)
  const isExcelFile = isExcel(normalizedFileKey)
  const hasExtractedItems = (quote?.items?.length ?? 0) > 0
  const sellerCandidates = useMemo(() => {
    return (users ?? []).filter((candidate) => {
      const role = normalizeUserRole(candidate.role)
      const isVendor = role === 'VENDOR'
      const isActive = isUserActive(candidate.isActive)
      return isVendor && isActive
    })
  }, [users])
  const assignedSellerName = getUserFullName(quote?.assignedSeller)

  const [erpQuoteNumber, setErpQuoteNumber] = useState('')
  const [rejectReason, setRejectReason] = useState(REJECTION_OPTIONS[0])
  const [fileJobProgress, setFileJobProgress] = useState(0)
  const [fileJobStatusText, setFileJobStatusText] = useState<string | null>(null)
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null)
  const [isFileProcessing, setIsFileProcessing] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedSellerId, setSelectedSellerId] = useState('')
  const resumedJobIdRef = useRef<string | null>(null)

  useEffect(() => {
    setErpQuoteNumber(quote?.erpQuoteNumber ?? '')
  }, [quote?.erpQuoteNumber])

  const workflowMutation = useMutation({
    mutationFn: async (payload: UpdateQuoteWorkflowPayload) => {
      if (!id) throw new Error('Falta el id de la cotización')
      return updateQuoteWorkflowStatus(id, payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: quotesKeys.all })
      if (id) {
        await queryClient.invalidateQueries({ queryKey: quotesKeys.detail(id) })
      }
    }
  })

  const saveExtractionMutation = useMutation({
    mutationFn: async (payload: ExtractionJobResultResponse) => {
      if (!id) throw new Error('Falta el id de la cotización')
      return saveQuoteExtractionResult(id, {
        jobId: payload.job_id,
        status: payload.status,
        result: payload.result
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: quotesKeys.all })
      if (id) {
        await queryClient.invalidateQueries({ queryKey: quotesKeys.detail(id) })
      }
    }
  })

  const deleteQuoteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Falta el id de la cotización')
      return deleteQuoteById(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: quotesKeys.all })
      if (id) {
        await queryClient.removeQueries({ queryKey: quotesKeys.detail(id) })
      }
      navigate('/quotes')
    }
  })

  const threadId = canShowConversation ? quote?.chatThreadId : undefined
  const { data: chat } = useMessages(threadId, { pageSize: 100 })

  const reversedMessages = useMemo(() => {
    if (!chat) return undefined
    return {
      ...chat,
      messages: [...chat.messages].reverse()
    }
  }, [chat])

  const statusMeta = STATUS_META[status] ?? STATUS_META.NEW
  const userNameById = useMemo(() => {
    const index = new Map<string, string>()
    for (const user of users ?? []) {
      index.set(user.id, `${user.name} ${user.lastname}`.trim())
    }
    return index
  }, [users])

  const formatAuditDate = (value?: string | null) => {
    if (!value) return ''
    try {
      return dateFormat(value)
    } catch {
      return `${value}`
    }
  }

  const resolveActor = (userId?: string | null) => {
    const normalized = `${userId ?? ''}`.trim()
    if (!normalized) return 'Sistema'
    return userNameById.get(normalized) ?? normalized
  }

  const auditLogs = useMemo<AuditLogItem[]>(() => {
    if (!quote) return []

    const logs: AuditLogItem[] = [
      {
        id: 'created',
        action: 'Cotización creada',
        at: `${quote.createdAt ?? ''}`,
        actor: 'Asistente'
      }
    ]

    if (quote.assignedAt) {
      logs.push({
        id: 'assigned',
        action: 'Cotización asignada',
        at: formatAuditDate(quote.assignedAt),
        actor: getUserFullName(quote.assignedBy),
        detail: `Vendedor: ${getUserFullName(quote.assignedSeller)}`
      })
    }
    if (quote.seenAt) {
      logs.push({
        id: 'viewed',
        action: 'Cotización vista',
        at: formatAuditDate(quote.seenAt),
        actor: status === 'VIEWED' ? resolveActor(quote.workflowUpdatedById) : 'Sin registro',
      })
    }

    if (quote.downloadedAt) {
      logs.push({
        id: 'downloaded',
        action: 'Datos descargados',
        at: formatAuditDate(quote.downloadedAt),
        actor: status === 'DOWNLOADED' ? resolveActor(quote.workflowUpdatedById) : 'Sin registro',
      })
    }

    if (quote.erpQuoteAt) {
      logs.push({
        id: 'quoted',
        action: 'Cotización registrada en ERP',
        at: formatAuditDate(quote.erpQuoteAt),
        actor: status === 'QUOTED' ? resolveActor(quote.workflowUpdatedById) : 'Sin registro',
        detail: quote.erpQuoteNumber ? `Folio ERP: ${quote.erpQuoteNumber}` : undefined
      })
    }

    if (quote.invoicedAt) {
      logs.push({
        id: 'invoiced',
        action: 'Cotización facturada',
        at: formatAuditDate(quote.invoicedAt),
        actor: status === 'INVOICED' ? resolveActor(quote.workflowUpdatedById) : 'Sin registro',
        detail: quote.erpInvoiceNumber ? `Factura ERP: ${quote.erpInvoiceNumber}` : undefined
      })
    }

    if (quote.workflowUpdatedAt) {
      logs.push({
        id: 'last-update',
        action: `Último cambio: ${statusMeta.label}`,
        at: formatAuditDate(quote.workflowUpdatedAt),
        actor: resolveActor(quote.workflowUpdatedById),
        detail: quote.rejectedReason ? `Motivo: ${quote.rejectedReason}` : undefined
      })
    }

    return logs
  }, [quote, status, statusMeta.label, userNameById])

  const handleUpdateStatus = async (payload: UpdateQuoteWorkflowPayload, loading: string, success: string) => {
    await notify.promise(workflowMutation.mutateAsync(payload), {
      loading,
      success: () => success,
      error: (error: Error) => error.message || 'No se pudo actualizar el estatus'
    })
  }

  const setExtractionState = (next: StoredExtractionJobState) => {
    if (!id) return
    persistStoredExtractionJobState(id, next)
    setFileJobProgress(next.progress)
    setFileJobStatusText(next.statusText)
    setFileErrorMessage(next.error ?? null)
  }

  const getStatusText = (status: ExtractionJobStatusResponse['status']) => {
    if (status === 'queued') return 'En cola de procesamiento...'
    if (status === 'processing') return 'Extrayendo partidas del archivo...'
    if (status === 'completed') return 'Extracción completada.'
    return 'Procesando extracción...'
  }

  const completeExtractionFlow = async (jobId?: string) => {
    if (!id) throw new Error('Falta el id de la cotización')

    let currentJobId = `${jobId ?? ''}`.trim()
    try {
      if (!currentJobId) {
        if (!normalizedFileKey) throw new Error('La cotización no tiene archivo para procesar')

        setExtractionState({
          quoteId: id,
          stage: 'uploading',
          progress: 5,
          statusText: 'Preparando archivo para extracción...',
          updatedAt: new Date().toISOString()
        })

        const blob = await getQuoteAttachmentFileBlob(id)
        const fileName = normalizedFileKey.split('/').pop() || `quote-${id}.pdf`
        const file = new File([blob], fileName, {
          type: blob.type || 'application/octet-stream'
        })

        const job = await QuoteExtractionJobsService.createJob(file)
        currentJobId = `${job.job_id ?? ''}`.trim()
        if (!currentJobId) throw new Error('No se recibió job_id del extractor')
      }

      setExtractionState({
        quoteId: id,
        jobId: currentJobId,
        stage: 'processing',
        progress: 10,
        statusText: 'Procesando extracción...',
        updatedAt: new Date().toISOString()
      })

      const result = await QuoteExtractionJobsService.waitForCompletion(currentJobId, {
        onStatus: (status) => {
          const progress = Math.max(10, Math.min(90, Number(status.progress ?? 0)))
          const stage: ExtractionJobStage = status.status === 'queued' ? 'queued' : 'processing'
          setExtractionState({
            quoteId: id,
            jobId: currentJobId,
            stage,
            progress,
            statusText: getStatusText(status.status),
            updatedAt: new Date().toISOString()
          })
        }
      })

      setExtractionState({
        quoteId: id,
        jobId: currentJobId,
        stage: 'persisting',
        progress: 95,
        statusText: 'Guardando partidas en la cotización...',
        updatedAt: new Date().toISOString()
      })

      await saveExtractionMutation.mutateAsync(result)

      const loadedItems = result.result?.items?.length ?? 0
      setExtractionState({
        quoteId: id,
        jobId: currentJobId,
        stage: 'saved',
        progress: 100,
        statusText: `Listo. Se guardaron ${loadedItems} partidas.`,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo procesar el archivo'
      setExtractionState({
        quoteId: id,
        jobId: currentJobId || undefined,
        stage: 'failed',
        progress: 0,
        statusText: 'Error durante el procesamiento.',
        error: message,
        updatedAt: new Date().toISOString()
      })
      throw new Error(message)
    }
  }

  const onMarkViewed = async () => {
    await handleUpdateStatus(
      { workflowStatus: 'VIEWED' },
      'Marcando como vista...',
      'Cotización marcada como vista'
    )
  }

  const onDownloadData = async () => {
    await handleUpdateStatus(
      { workflowStatus: 'IN_PROGRESS' },
      'Actualizando estatus...',
      'Estatus actualizado a En progreso'
    )
  }

  const onMarkQuoted = async () => {
    if (!erpQuoteNumber.trim()) {
      notify.error('Ingresa el número de cotización Proscai')
      return
    }
    await handleUpdateStatus(
      {
        workflowStatus: 'QUOTED',
        erpQuoteNumber: erpQuoteNumber.trim(),
        erpSystem: 'PROSCAI'
      },
      'Guardando número de cotización...',
      'Cotización marcada como cotizada'
    )
  }

  const onReject = async () => {
    if (!rejectReason.trim()) {
      notify.error('Selecciona un motivo de rechazo')
      return
    }
    await handleUpdateStatus(
      { workflowStatus: 'REJECTED', rejectedReason: rejectReason.trim() },
      'Guardando rechazo...',
      'Cotización marcada como rechazada'
    )
  }

  const openAssignModal = () => {
    setSelectedSellerId(quote?.assignedSeller?.id ?? '')
    setIsAssignModalOpen(true)
  }

  const closeAssignModal = () => {
    setIsAssignModalOpen(false)
    setSelectedSellerId('')
  }

  const onAssignSeller = async () => {
    if (!id || !quote) {
      notify.error('No se encontró la cotización')
      return
    }

    if (!selectedSellerId) {
      notify.error('Selecciona un vendedor')
      return
    }

    await notify.promise(
      assignQuoteSellerMutation.mutateAsync({
        quoteId: id,
        payload: { sellerId: selectedSellerId }
      }),
      {
        loading: 'Asignando vendedor...',
        success: (response) => response.message || 'Cotización asignada correctamente',
        error: (error: Error) => error.message || 'No se pudo asignar la cotización'
      }
    )

    closeAssignModal()
  }

  const onClearSellerAssignment = async () => {
    if (!id || !quote) {
      notify.error('No se encontró la cotización')
      return
    }

    await notify.promise(
      assignQuoteSellerMutation.mutateAsync({
        quoteId: id,
        payload: { sellerId: null }
      }),
      {
        loading: 'Quitando asignación...',
        success: (response) => response.message || 'Asignación eliminada correctamente',
        error: (error: Error) => error.message || 'No se pudo quitar la asignación'
      }
    )

    closeAssignModal()
  }

  const onDeleteQuote = async () => {
    if (!isAdmin) return

    const accepted = window.confirm(
      `¿Seguro que deseas eliminar la cotización #${quote?.quoteNumber}? Esta acción no se puede deshacer.`
    )

    if (!accepted) return

    await notify.promise(deleteQuoteMutation.mutateAsync(), {
      loading: 'Eliminando cotización...',
      success: () => 'Cotización eliminada',
      error: (error: Error) => error.message || 'No se pudo eliminar la cotización'
    })
  }

  const onProcessFile = async () => {
    if (isFileProcessing || workflowMutation.isPending) return

    setIsFileProcessing(true)
    try {
      await notify.promise(completeExtractionFlow(), {
        loading: 'Procesando archivo...',
        success: () => 'Extracción completada y partidas guardadas',
        error: (error: Error) => error.message || 'No se pudo procesar el archivo'
      })
    } finally {
      setIsFileProcessing(false)
    }
  }

  const isExtractionLocked = isFileProcessing || saveExtractionMutation.isPending
  const isWorkflowActionLocked = workflowMutation.isPending || isExtractionLocked

  const canDownloadQuoteExcel = hasExtractedItems && canSeeDownloadedData

  const onDownloadQuoteExcel = () => {
    if (!quote) return

    if (hasAttachedFile && !hasExtractedItems) {
      notify.error('Primero procesa el archivo para extraer partidas y luego descarga el Excel')
      return
    }

    if (!hasExtractedItems) {
      notify.error('No hay partidas para descargar')
      return
    }

    downloadQuoteAsCsv({
      quoteNumber: quote.quoteNumber,
      items: quote.items.map((item) => ({
        description: item.description,
        ean: item.ean,
        um: item.um,
        qty: item.qty
      }))
    })
  }

  useEffect(() => {
    if (!id) return

    const storedState = readStoredExtractionJobState(id)
    if (!storedState) return

    setFileJobProgress(storedState.progress)
    setFileJobStatusText(storedState.statusText)
    setFileErrorMessage(storedState.error ?? null)

    if (!isActiveExtractionStage(storedState.stage)) return
    if (!storedState.jobId) return
    if (resumedJobIdRef.current === storedState.jobId) return

    resumedJobIdRef.current = storedState.jobId
    setIsFileProcessing(true)
    void completeExtractionFlow(storedState.jobId)
      .catch((error: Error) => {
        const message = error.message || 'No se pudo continuar la extracción'
        setExtractionState({
          quoteId: id,
          jobId: storedState.jobId,
          stage: 'failed',
          progress: storedState.progress ?? 0,
          statusText: 'Error durante el procesamiento.',
          error: message,
          updatedAt: new Date().toISOString()
        })
      })
      .finally(() => {
        setIsFileProcessing(false)
      })
  }, [id])

  if (isLoading) {
    return <div className='rounded-lg bg-white p-4 shadow text-sm text-gray-500'>Cargando cotización...</div>
  }

  if (!quote) {
    return <div className='rounded-lg bg-white p-4 shadow text-sm text-gray-500'>No se encontró la cotización.</div>
  }

  return (
    <div className='space-y-6'>
      <div className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Cotización #{quote.quoteNumber}</h1>
            <p className='text-sm text-gray-500'>Control de flujo y seguimiento operativo.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.style}`}>
            {statusMeta.label}
          </span>
        </div>

        <div className='mt-4 flex flex-wrap gap-2'>
          {canMarkViewed && (
            <button
              onClick={onMarkViewed}
              disabled={isWorkflowActionLocked}
              className='rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:bg-sky-300'
            >
              Ver
            </button>
          )}

          {canDownloadData && (
            <button
              onClick={onDownloadData}
              disabled={isWorkflowActionLocked}
              className='rounded-sm bg-amber-500 px-4 py-0 text-xs font-semibold text-white hover:bg-amber-600 disabled:bg-amber-300'
            >
              Descargar datos
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onDeleteQuote}
              disabled={deleteQuoteMutation.isPending || isWorkflowActionLocked}
              className='rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300'
            >
              {deleteQuoteMutation.isPending ? 'Eliminando...' : 'Eliminar cotización'}
            </button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-6'>
          <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Cliente</h2>
            {canSeeCustomerDetails ? (
              <div className='mt-3 space-y-1 text-sm text-gray-700 flex justify-between'>
                <div>
                  <p className='inline-flex items-center gap-2'>
                    <Building2 className='h-4 w-4 text-gray-500' />
                    <span><span className='font-semibold'>Sucursal:</span> {quote.branch ?? 'Sin sucursal'}</span>
                  </p>
                  <p className='flex items-center gap-2'>
                    <User2  className='h-4 w-4 text-gray-500'/>
                    <span className='font-semibold'>Nombre:</span> {quote.customer?.name} {quote.customer?.lastname}</p>
                  <p className='flex items-center gap-2'>
                    <Phone  className='h-4 w-4 text-gray-500'/>
                    <span className='font-semibold'>Teléfono:</span> {quote.customer?.phone ?? '—'}
                  </p>

                </div>

                <div>
                  <p><span className='font-semibold'>Correo:</span> {quote.customer?.email ?? '—'}</p>
                  <p><span className='font-semibold'>Ubicación:</span> {quote.customer?.location ?? '—'}</p>
                  <p><span className='font-semibold'>Empresa:</span> {quote.customer?.company ?? '—'}</p>
                </div>


              </div>
            ) : (
              <div className='mt-3 space-y-1 text-sm text-gray-500'>
                <p className='inline-flex items-center gap-2'>
                  <Building2 className='h-4 w-4' />
                  <span>Sucursal: {quote.branch ?? 'Sin sucursal'}</span>
                </p>
                <p>Nueva cotización. Presiona "Ver" para mostrar datos del cliente.</p>
              </div>
            )}
          </section>

          <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Datos de cotización</h2>
            {!canSeeDownloadedData ? (
              <p className='mt-3 text-sm text-gray-500'>
                Presiona "Descargar datos" para mostrar los items o procesar archivo.
              </p>
            ) : (
              <div className='mt-3 space-y-4'>
                {isFileOnly && (
                  <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
                    <p className='text-sm text-amber-800'>
                      {canProcessFile && 'Esta cotización llegó con archivo adjunto. Ver archivo para validar que es una cotización y después procesa para extraer los items.'}
                      {!canProcessFile && isRejected && 'Esta cotización fue rechazada. Puedes ver el archivo para consulta.'}
                      {!canProcessFile && !isRejected && 'Esta cotización ya fue registrada. Puedes ver el archivo para consulta.'}
                    </p>
                    {canProcessFile && (
                      <>
                        <button
                          onClick={onProcessFile}
                          disabled={isWorkflowActionLocked}
                          className='mt-3 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:bg-amber-300'
                        >
                          {isFileProcessing ? 'Procesando...' : 'Procesar archivo'}
                        </button>
                        {fileJobStatusText && (
                          <p className='mt-2 text-xs text-amber-900'>{fileJobStatusText}</p>
                        )}
                        {isFileProcessing && (
                          <div className='mt-2 h-2 w-full rounded-full bg-amber-100'>
                            <div
                              className='h-2 rounded-full bg-amber-500 transition-all duration-500'
                              style={{ width: `${fileJobProgress}%` }}
                            />
                          </div>
                        )}
                        {fileErrorMessage && (
                          <p className='mt-2 text-xs text-red-700'>{fileErrorMessage}</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {(quote.items?.length ?? 0) > 0 && (
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500'>Descripción</th>
                          <th className='px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500'>Código</th>
                          <th className='px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500'>UM</th>
                          <th className='px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500'>Cantidad</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-100'>
                        {quote.items.map((item) => (
                          <tr key={item.id}>
                            <td className='px-4 py-2 text-sm text-gray-700'>{item.description}</td>
                            <td className='px-4 py-2 text-sm text-gray-700'>{item.ean ?? '—'}</td>
                            <td className='px-4 py-2 text-sm text-gray-700'>{item.um ?? '—'}</td>
                            <td className='px-4 py-2 text-sm text-gray-700'>{item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className='flex justify-end'>
                  <button
                    type='button'
                    onClick={onDownloadQuoteExcel}
                    disabled={!canDownloadQuoteExcel || isWorkflowActionLocked}
                    className='inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300'
                  >
                    <FileSpreadsheet className='h-4 w-4' />
                    Descargar cotización (Excel)
                  </button>
                </div>
              </div>
            )}
          </section>

          {canShowConversation ? (
            <ChatPreview chat={reversedMessages} />
          ) : (
            <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-500'>
              Conversación relacionada bloqueada hasta descargar datos.
            </section>
          )}
        </div>

        <div className='space-y-6'>
          {canSeeDownloadedData && hasAttachedFile && (
            <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Archivo adjunto</h2>
              <p className='mt-3 text-sm text-gray-600'>
                Valida el archivo antes de procesar la cotización.
              </p>
              <button
                onClick={() => {
                  if (isExcelFile) {
                    handleDownloadExcel(normalizedFileKey)
                    return
                  }
                  handleViewOrDownloadFile(normalizedFileKey)
                }}
                disabled={isLoadingFile || isDownloadingExcel || isWorkflowActionLocked}
                className='mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300'
              >
                {isExcelFile
                  ? (isDownloadingExcel ? 'Descargando archivo...' : 'Descargar archivo')
                  : (isLoadingFile ? 'Cargando archivo...' : 'Ver archivo')}
              </button>
              {fileError && (
                <p className='mt-2 text-xs text-red-600'>{fileError}</p>
              )}
            </section>
          )}

          <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Asignación</h2>
            <div className='mt-3 space-y-3'>
              <div className='rounded-lg border border-gray-100 bg-gray-50 p-4'>
                <p className='inline-flex items-center gap-2 text-sm font-semibold text-gray-800'>
                  <UserCheck2 className={`h-4 w-4 ${quote.assignedSeller ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {assignedSellerName}
                </p>
                <p className='mt-1 text-xs text-gray-500'>
                  {quote.assignedAt ? `Asignada ${dateFormat(quote.assignedAt)}` : 'Pendiente de asignación'}
                </p>
                <p className='mt-2 text-xs text-gray-500'>
                  {quote.assignedBy ? `Asignada por ${getUserFullName(quote.assignedBy)}` : 'Sin usuario asignador registrado'}
                </p>
              </div>

              {canAssignSeller ? (
                <>
                  <button
                    type='button'
                    onClick={openAssignModal}
                    disabled={!quote.branchId || assignQuoteSellerMutation.isPending || workflowMutation.isPending}
                    className='w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:bg-amber-300'
                  >
                    {quote.assignedSeller ? 'Reasignar vendedor' : 'Asignar vendedor'}
                  </button>
                  <p className='text-xs text-gray-500'>
                    Solo se muestran vendedores activos con acceso a esta sucursal.
                  </p>
                </>
              ) : (
                <p className='text-sm text-gray-500'>
                  Solo administrador o coordinador de ventas puede asignar vendedores.
                </p>
              )}
            </div>
          </section>
          <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Flujo ERP</h2>
            {canSaveErpQuote ? (
              <div className='mt-3 space-y-3'>
                <label className='block text-sm text-gray-700'>
                  Número de cotización Proscai
                  <input
                    type='text'
                    value={erpQuoteNumber}
                    onChange={(event) => setErpQuoteNumber(event.target.value)}
                    disabled={isWorkflowActionLocked}
                    className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                    placeholder='Ejemplo: COT-ERP-12345'
                  />
                </label>
                <button
                  onClick={onMarkQuoted}
                  disabled={isWorkflowActionLocked}
                  className='w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-green-300'
                >
                  Guardar y marcar cotizada
                </button>
              </div>
            ) : (
              <div className='mt-3 space-y-2 text-sm text-gray-500'>
                <p>El número ERP se captura cuando la cotización está en progreso.</p>
                {quote.erpQuoteNumber && (
                  <p className='rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-green-700'>
                    Folio ERP registrado: <span className='font-semibold'>{quote.erpQuoteNumber}</span>
                    {quote.erpSystem ? ` (${quote.erpSystem})` : ''}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Rechazar</h2>
            {canReject ? (
              <div className='mt-3 space-y-3'>
                <label className='block text-sm text-gray-700'>
                  Motivo de rechazo
                  <select
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    disabled={isWorkflowActionLocked}
                    className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                  >
                    {REJECTION_OPTIONS.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={onReject}
                  disabled={isWorkflowActionLocked}
                  className='w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300'
                >
                  Rechazar cotización
                </button>
              </div>
            ) : (
              <p className='mt-3 text-sm text-gray-500'>
                El rechazo está disponible cuando la cotización está en progreso.
              </p>
            )}
          </section>

          <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Auditoría</h2>
            <div className='mt-3 space-y-3'>
              {auditLogs.map((log) => (
                <div key={log.id} className='rounded-lg border border-gray-100 bg-gray-50 p-3'>
                  <p className='text-sm font-semibold text-gray-800'>{log.action}</p>
                  <p className='mt-1 text-xs text-gray-600'>Fecha: {log.at || '—'}</p>
                  <p className='mt-1 text-xs text-gray-600'>Usuario: {log.actor || '—'}</p>
                  {log.detail && (
                    <p className='mt-1 text-xs text-gray-600'>{log.detail}</p>
                  )}
                </div>
              ))}
            </div>
            <p className='mt-3 text-[11px] text-gray-500'>
              Nota: el sistema guarda usuario del último movimiento del workflow.
            </p>
          </section>
        </div>
      </div>

      <AssignSellerModal
        open={isAssignModalOpen}
        onClose={closeAssignModal}
        quoteNumber={quote.quoteNumber}
        branchName={quote.branch}
        currentSellerName={assignedSellerName}
        sellers={sellerCandidates}
        selectedSellerId={selectedSellerId}
        onSelectSeller={setSelectedSellerId}
        onSubmit={onAssignSeller}
        onClearAssignment={onClearSellerAssignment}
        canClearAssignment={Boolean(quote.assignedSeller?.id)}
        isSubmitting={assignQuoteSellerMutation.isPending}
      />
      {isOpen && pdfUrl && (
        <PdfViewerModal />
      )}
    </div>
  )
}

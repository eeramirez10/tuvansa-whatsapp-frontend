import { ChevronLeft, ChevronRight, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { notify } from '../../lib/notifications/toast-sonner'
import { AssignSellerModal } from '../../components/quotes/AssignSellerModal'
import { QuotesTable } from '../../shared/components/tables/QuotesTable'
import { useAuth } from '../../hooks/useAuth'
import { useUsers } from '../../queries/users/users-query'
import { canAssignQuotesToVendors, normalizeUserRole } from '../../services/users/constants'
import { useAssignQuoteSeller, useQuotes } from '../../queries/quotes/quotes-queries'
import { QUOTE_WORKFLOW_STATUS_OPTIONS, type QuoteWorkflowStatusValue } from '../../shared/constants/quote-workflow'
import type { User } from '../../interfaces/user.interface'
import type { Quote } from '../../store/quote/quote.store'

const PAGE_SIZE = 10

const isUserActive = (value: unknown) => {
  if (typeof value === 'boolean') return value
  return ['true', '1', 'active', 'activo'].includes(`${value ?? ''}`.toLowerCase())
}

const getUserBranchIds = (user: User) => {
  return (user.branchOffices ?? (user.branchOffice ? [user.branchOffice] : [])).map((branch) => branch.id)
}

const getAssignedSellerName = (quote?: Quote | null) => {
  if (!quote?.assignedSeller) return 'Sin asignar'
  return `${quote.assignedSeller.name} ${quote.assignedSeller.lastname}`.trim()
}

export const Quotes = () => {
  const { user } = useAuth()
  const { data: users = [] } = useUsers()
  const assignQuoteSellerMutation = useAssignQuoteSeller()

  const isAdmin = normalizeUserRole(user?.role) === 'ADMIN'
  const canAssignQuotes = canAssignQuotesToVendors(user?.role)
  const userBranchIds = user?.branchOffices?.map((branch) => branch.id) ?? []
  const canLoadQuotes = isAdmin || userBranchIds.length > 0

  const [page, setPage] = useState(1)
  const [workflowStatus, setWorkflowStatus] = useState<'ALL' | QuoteWorkflowStatusValue>('ALL')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [selectedSellerId, setSelectedSellerId] = useState('')
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [workflowStatus])

  const queryParams = useMemo(() => ({
    page,
    pageSize: PAGE_SIZE,
    ...(workflowStatus === 'ALL' ? {} : { workflowStatus })
  }), [page, workflowStatus])

  const { data, isFetching } = useQuotes({
    params: queryParams,
    enabled: canLoadQuotes,
  })

  const sellerCandidates = useMemo(() => {
    if (!selectedQuote?.branchId) return []

    return users.filter((candidate) => {
      const role = normalizeUserRole(candidate.role)
      const isVendor = role === 'VENDOR'
      const isActive = isUserActive(candidate.isActive)
      const hasBranchAccess = getUserBranchIds(candidate).includes(selectedQuote.branchId ?? '')
      return isVendor && isActive && hasBranchAccess
    })
  }, [selectedQuote?.branchId, users])

  const openAssignModal = (quote: Quote) => {
    setSelectedQuote(quote)
    setSelectedSellerId(quote.assignedSeller?.id ?? '')
    setIsAssignModalOpen(true)
  }

  const closeAssignModal = () => {
    setIsAssignModalOpen(false)
    setSelectedQuote(null)
    setSelectedSellerId('')
  }

  const handleAssignSeller = async () => {
    if (!selectedQuote) {
      notify.error('No se encontró la cotización a asignar')
      return
    }

    if (!selectedSellerId) {
      notify.error('Selecciona un vendedor')
      return
    }

    await notify.promise(
      assignQuoteSellerMutation.mutateAsync({
        quoteId: selectedQuote.id,
        payload: { sellerId: selectedSellerId },
      }),
      {
        loading: 'Asignando vendedor...',
        success: (response) => response.message || 'Cotización asignada correctamente',
        error: (error: Error) => error.message || 'No se pudo asignar la cotización',
      }
    )

    closeAssignModal()
  }

  const handleClearAssignment = async () => {
    if (!selectedQuote) {
      notify.error('No se encontró la cotización a actualizar')
      return
    }

    await notify.promise(
      assignQuoteSellerMutation.mutateAsync({
        quoteId: selectedQuote.id,
        payload: { sellerId: null },
      }),
      {
        loading: 'Quitando asignación...',
        success: (response) => response.message || 'Asignación eliminada correctamente',
        error: (error: Error) => error.message || 'No se pudo quitar la asignación',
      }
    )

    closeAssignModal()
  }

  return (
    <div className='space-y-6'>
      <div className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Cotizaciones</h1>
            <p className='text-sm text-gray-500'>Consulta el flujo y asigna cotizaciones a vendedores por sucursal.</p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={() => setWorkflowStatus('ALL')}
              className={`rounded-md border px-4 py-2 text-xs font-semibold shadow-sm transition ${
                workflowStatus === 'ALL'
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-gray-300 bg-white text-gray-800 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              Todas
            </button>
            {QUOTE_WORKFLOW_STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => setWorkflowStatus(option.value)}
                className={`rounded-md border px-4 py-2 text-xs font-semibold shadow-sm transition ${
                  workflowStatus === option.value
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-amber-300 hover:text-amber-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
        <QuotesTable
          quotes={data?.items}
          isLoading={isFetching}
          isAdmin={isAdmin}
          canAssignQuotes={canAssignQuotes}
          onAssignQuote={openAssignModal}
        />

        <Pagination
          onPageChange={setPage}
          page={data?.page ?? 1}
          pageSize={data?.pageSize ?? PAGE_SIZE}
          total={data?.total ?? 0}
          maxPagesToShow={3}
        />
      </div>

      {!isAdmin && userBranchIds.length === 0 && (
        <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
          Tu usuario no tiene sucursal asignada. No se pueden mostrar cotizaciones.
        </div>
      )}

      <AssignSellerModal
        open={isAssignModalOpen}
        onClose={closeAssignModal}
        quoteNumber={selectedQuote?.quoteNumber}
        branchName={selectedQuote?.branch}
        currentSellerName={getAssignedSellerName(selectedQuote)}
        sellers={sellerCandidates}
        selectedSellerId={selectedSellerId}
        onSelectSeller={setSelectedSellerId}
        onSubmit={handleAssignSeller}
        onClearAssignment={handleClearAssignment}
        canClearAssignment={Boolean(selectedQuote?.assignedSeller?.id)}
        isSubmitting={assignQuoteSellerMutation.isPending}
      />
    </div>
  )
}

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  maxPagesToShow: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({ page, pageSize, total, maxPagesToShow, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    onPageChange(nextPage)
  }

  const getPages = (): Array<number | 'dots'> => {
    const pages: Array<number | 'dots'> = []

    if (totalPages <= maxPagesToShow) {
      for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
        pages.push(currentPage)
      }
      return pages
    }

    const half = Math.floor(maxPagesToShow / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(totalPages, page + half)

    if (start === 1) {
      end = Math.min(totalPages, start + maxPagesToShow - 1)
    } else if (end === totalPages) {
      start = Math.max(1, end - maxPagesToShow + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('dots')
    }

    for (let currentPage = start; currentPage <= end; currentPage += 1) {
      pages.push(currentPage)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('dots')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className='flex items-center justify-center p-4'>
      <div className='flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='text-sm text-gray-700'>
          <span>{from}-{to} de {total}</span>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <button type='button' className='btn btn-primary' onClick={() => goToPage(1)}>
            <ChevronsLeftIcon />
          </button>
          <button type='button' onClick={() => goToPage(page - 1)} className='btn btn-primary'>
            <ChevronLeft />
          </button>

          {getPages().map((currentPage, index) =>
            currentPage === 'dots' ? (
              <span key={`dots-${index}`} className='px-1'>
                …
              </span>
            ) : (
              <button
                key={currentPage}
                type='button'
                onClick={() => goToPage(currentPage)}
                disabled={currentPage === page}
                className='btn btn-primary'
              >
                {currentPage}
              </button>
            )
          )}

          <button
            type='button'
            className='btn btn-primary'
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight />
          </button>
          <button
            type='button'
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            className='btn btn-primary'
          >
            <ChevronsRightIcon />
          </button>
        </div>

        <div className='text-sm text-gray-700'>
          <span>Página {page} de {totalPages}</span>
        </div>
      </div>
    </div>
  )
}

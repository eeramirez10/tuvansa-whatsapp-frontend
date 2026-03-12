import { QuotesTable } from '../../shared/components/tables/QuotesTable'
import { useQuotes } from '../../queries/quotes/quotes-queries'
import { ChevronLeft, ChevronRight, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { QUOTE_WORKFLOW_STATUS_OPTIONS, type QuoteWorkflowStatusValue } from '../../shared/constants/quote-workflow'


const PAGE_SIZE = 10

export const Quotes = () => {
  const { user } = useAuth()
  const isAdmin = `${user?.role ?? ''}`.toUpperCase() === 'ADMIN'
  const userBranchIds = user?.branchOffices?.map((branch) => branch.id) ?? []
  const canLoadQuotes = isAdmin || userBranchIds.length > 0

  const [page, setPage] = useState(1)
  const [workflowStatus, setWorkflowStatus] = useState<'ALL' | QuoteWorkflowStatusValue>('ALL')

  useEffect(() => {
    setPage(1)
  }, [workflowStatus])

  const queryParams = useMemo(() => {
    const base = {
      page,
      pageSize: PAGE_SIZE,
      ...(workflowStatus === 'ALL' ? {} : { workflowStatus })
    }

    return base
  }, [page, workflowStatus])

  const { data,  isFetching } = useQuotes({
    params: queryParams,
    enabled: canLoadQuotes
  })

 

  return (
    <div>

      <div className='flex items-center space-x-2'>
        <button
          onClick={() => setWorkflowStatus('ALL')}
          className={`px-4 py-2 text-xs font-semibold border-1 border-gray-300 rounded-md shadow transition ${
            workflowStatus === 'ALL'
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-gray-800'
          }`}
        >
          Todas
        </button>
        {QUOTE_WORKFLOW_STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setWorkflowStatus(option.value)}
            className={`px-4 py-2 text-xs font-semibold border-1 border-gray-300 rounded-md shadow transition ${
              workflowStatus === option.value
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>


      <div className=' bg-white mt-6 shadow-md rounded-sm overflow-x-auto'>

        <QuotesTable quotes={data?.items} isLoading={isFetching} isAdmin={isAdmin} />

        <Pagination
          onPageChange={setPage}
          page={data?.page ?? 1}
          pageSize={data?.pageSize ?? 1}
          total={data?.total ?? 1}
          maxPagesToShow={3}

        />

      </div>

      {!isAdmin && userBranchIds.length === 0 && (
        <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
          Tu usuario no tiene sucursal asignada. No se pueden mostrar cotizaciones.
        </div>
      )}


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


  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const goToPage = (p: number) => {


    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  const getPages = (): (number | "dots")[] => {
    const pages: (number | "dots")[] = [];

    if (totalPages <= maxPagesToShow) {
      // pocas páginas: mostramos todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, page + half);

    // ajustar ventana si está pegada a los extremos
    if (start === 1) {
      end = Math.min(totalPages, start + maxPagesToShow - 1);
    } else if (end === totalPages) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("dots");
    }

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("dots");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className='flex items-center justify-center p-4'>
      {/* Resumen */}

      <div className='flex justify-between w-full'>

        <div className='flex justify-center items-center mr-5 text-sm text-gray-700'>
          <span >
            {from}–{to} de {total}
          </span>
        </div>


        <div className='flex  gap-2'>
          {/* Controles básicos */}
          <button
            className="btn btn-primary"
            onClick={() => goToPage(1)}
          >
            <ChevronsLeftIcon />
          </button>
          <button
            onCanPlay={() => goToPage(page - 1)}
            className='btn btn-primary'
          >
            <ChevronLeft />
          </button>

          {/* Números de página */}
          {pages.map((p, idx) =>
            p === "dots" ? (
              <span key={`dots-${idx}`} style={{ padding: "0 0.25rem" }}>
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p)}
                disabled={p === page}
                className="btn btn-primary"
              >
                {p}
              </button>
            )
          )}

          <button
            className="btn btn-primary "
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            className="btn btn-primary "
          >
            <ChevronsRightIcon />
          </button>

        </div>

        <div className='flex justify-center items-center text-sm text-gray-700'>
          <span className='ml-5'>
            Página {page} de {totalPages}
          </span>
        </div>


      </div>

    </div>
  );

}

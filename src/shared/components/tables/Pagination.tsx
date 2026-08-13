import { ChevronLeft, ChevronRight, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  maxPagesToShow?: number
  onPageChange: (page: number) => void
}

export const Pagination = ({
  page,
  pageSize,
  total,
  maxPagesToShow = 3,
  onPageChange,
}: PaginationProps) => {
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
      for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) pages.push(currentPage)
      return pages
    }

    const half = Math.floor(maxPagesToShow / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(totalPages, page + half)

    if (start === 1) end = Math.min(totalPages, start + maxPagesToShow - 1)
    if (end === totalPages) start = Math.max(1, end - maxPagesToShow + 1)

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('dots')
    }

    for (let currentPage = start; currentPage <= end; currentPage += 1) pages.push(currentPage)

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('dots')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className='flex items-center justify-center border-t border-gray-100 p-4'>
      <div className='flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <p className='text-sm text-gray-600'>{from}-{to} de {total}</p>

        <div className='flex flex-wrap items-center gap-2'>
          <button type='button' className='btn btn-primary' onClick={() => goToPage(1)} aria-label='Primera pagina'>
            <ChevronsLeftIcon />
          </button>
          <button type='button' className='btn btn-primary' onClick={() => goToPage(page - 1)} aria-label='Pagina anterior'>
            <ChevronLeft />
          </button>

          {getPages().map((currentPage, index) => currentPage === 'dots' ? (
            <span key={`dots-${index}`} className='px-1 text-gray-500'>...</span>
          ) : (
            <button
              key={currentPage}
              type='button'
              onClick={() => goToPage(currentPage)}
              disabled={currentPage === page}
              className={`btn btn-primary ${currentPage === page ? 'border-amber-500 bg-amber-500 text-white' : ''}`}
              aria-label={`Pagina ${currentPage}`}
            >
              {currentPage}
            </button>
          ))}

          <button type='button' className='btn btn-primary' onClick={() => goToPage(page + 1)} aria-label='Pagina siguiente'>
            <ChevronRight />
          </button>
          <button type='button' className='btn btn-primary' onClick={() => goToPage(totalPages)} aria-label='Ultima pagina'>
            <ChevronsRightIcon />
          </button>
        </div>

        <p className='text-sm text-gray-600'>Pagina {page} de {totalPages}</p>
      </div>
    </div>
  )
}

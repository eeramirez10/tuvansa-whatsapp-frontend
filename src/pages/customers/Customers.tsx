import { Search, UsersRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CustomersTable } from '../../components/customers/CustomersTable'
import { useCustomers } from '../../queries/customers/customers-query'
import { Pagination } from '../../shared/components/tables/Pagination'

const PAGE_SIZE = 20

export const Customers = () => {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => setPage(1), [search])

  const params = useMemo(() => ({ page, pageSize: PAGE_SIZE, search }), [page, search])
  const { data, isFetching, error } = useCustomers(params)

  return (
    <div className='space-y-6'>
      <section className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <div className='mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700'>
              <UsersRound className='h-4 w-4' />
              Directorio comercial
            </div>
            <h1 className='text-2xl font-bold text-gray-900'>Clientes</h1>
            <p className='mt-1 text-sm text-gray-500'>Consulta clientes y revisa el seguimiento de sus cotizaciones.</p>
          </div>

          <div className='w-full lg:max-w-md'>
            <label htmlFor='customer-search' className='mb-1.5 block text-xs font-semibold text-gray-600'>Buscar cliente</label>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                id='customer-search'
                type='search'
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder='Nombre, empresa, correo o telefono'
                className='h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
              />
              {searchInput ? (
                <button
                  type='button'
                  onClick={() => setSearchInput('')}
                  className='absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                  title='Limpiar busqueda'
                  aria-label='Limpiar busqueda'
                >
                  <X className='h-4 w-4' />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-gray-100 px-5 py-4'>
          <div>
            <h2 className='font-semibold text-gray-900'>Listado de clientes</h2>
            <p className='mt-0.5 text-xs text-gray-500'>Mostrando clientes correspondientes a tus permisos.</p>
          </div>
          <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700'>
            {data?.total ?? 0} clientes
          </span>
        </div>

        {error ? (
          <div className='m-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error instanceof Error ? error.message : 'No se pudieron cargar los clientes'}
          </div>
        ) : (
          <CustomersTable customers={data?.items} isLoading={isFetching} />
        )}

        <Pagination
          page={data?.page ?? page}
          pageSize={data?.pageSize ?? PAGE_SIZE}
          total={data?.total ?? 0}
          onPageChange={setPage}
        />
      </section>
    </div>
  )
}

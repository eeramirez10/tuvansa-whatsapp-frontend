import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { CustomerQuotesTable } from '../../components/customers/CustomerQuotesTable'
import { useCustomer } from '../../queries/customers/customers-query'
import { useBranchOptions } from '../../queries/users/users-query'

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

export const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: customer, isLoading, error } = useCustomer(id)
  const { data: branches = [] } = useBranchOptions()
  const quotes = useMemo(() => {
    if (!customer) return []

    const branchesById = new Map(branches.map((branch) => [branch.id, branch]))

    return customer.quotes.map((quote) => {
      if (quote.branch || !quote.branchId) return quote

      const branch = branchesById.get(quote.branchId)
      if (!branch) return quote

      return {
        ...quote,
        branch: {
          id: branch.id,
          name: branch.name,
        },
      }
    })
  }, [branches, customer])

  if (isLoading) {
    return (
      <div className='animate-pulse space-y-6'>
        <div className='h-36 rounded-lg bg-gray-100' />
        <div className='h-72 rounded-lg bg-gray-100' />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-6'>
        <p className='font-semibold text-red-800'>No se pudo cargar el cliente</p>
        <p className='mt-1 text-sm text-red-700'>{error instanceof Error ? error.message : 'Cliente no encontrado'}</p>
        <Link to='/customers' className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-800 hover:underline'>
          <ArrowLeft className='h-4 w-4' />
          Volver a clientes
        </Link>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <Link to='/customers' className='inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900'>
          <ArrowLeft className='h-4 w-4' />
          Clientes
        </Link>
      </div>

      <section className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between'>
          <div className='flex items-start gap-4'>
            <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800'>
              <UserRound className='h-6 w-6' />
            </span>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>{customer.name} {customer.lastname}</h1>
              <p className='mt-1 inline-flex items-center gap-1.5 text-sm text-gray-500'>
                <Building2 className='h-4 w-4' />
                {customer.company || 'Sin empresa registrada'}
              </p>
            </div>
          </div>

          <div className='grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 xl:min-w-[620px]'>
            <p className='flex items-center gap-2 text-gray-700'><Phone className='h-4 w-4 text-gray-400' />{customer.phone}</p>
            <p className='flex items-center gap-2 text-gray-700'><Mail className='h-4 w-4 text-gray-400' />{customer.email}</p>
            <p className='flex items-center gap-2 text-gray-700'><MapPin className='h-4 w-4 text-gray-400' />{customer.location || 'Sin ubicacion'}</p>
            <p className='flex items-center gap-2 text-gray-700'><CalendarDays className='h-4 w-4 text-gray-400' />Cliente desde {formatDate(customer.createdAt)}</p>
          </div>
        </div>
      </section>

      <section className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-gray-100 px-5 py-4'>
          <div>
            <h2 className='font-semibold text-gray-900'>Cotizaciones del cliente</h2>
            <p className='mt-0.5 text-xs text-gray-500'>Selecciona una cotizacion para abrir su detalle y workflow.</p>
          </div>
          <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
            {quotes.length} cotizaciones
          </span>
        </div>

        <CustomerQuotesTable quotes={quotes} />
      </section>
    </div>
  )
}

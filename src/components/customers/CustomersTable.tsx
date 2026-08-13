import { ArrowUpRight, Building2, FileText, UsersRound } from 'lucide-react'
import { Link } from 'react-router'
import type { CustomerDirectoryItem } from '../../services/customers/types'

interface CustomersTableProps {
  customers?: CustomerDirectoryItem[]
  isLoading: boolean
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin cotizaciones'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const getInitials = (customer: CustomerDirectoryItem) => {
  return `${customer.name.charAt(0)}${customer.lastname.charAt(0)}`.toUpperCase()
}

export const CustomersTable = ({ customers, isLoading }: CustomersTableProps) => {
  if (isLoading && !customers?.length) {
    return (
      <div className='animate-pulse divide-y divide-gray-100'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className='flex items-center gap-4 px-5 py-4'>
            <div className='h-10 w-10 rounded-full bg-gray-200' />
            <div className='flex-1 space-y-2'>
              <div className='h-3 w-40 bg-gray-200' />
              <div className='h-3 w-56 bg-gray-100' />
            </div>
            <div className='h-3 w-20 bg-gray-200' />
          </div>
        ))}
      </div>
    )
  }

  if (!customers?.length) {
    return (
      <div className='flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center'>
        <UsersRound className='mb-3 h-10 w-10 text-gray-300' />
        <p className='font-semibold text-gray-800'>No se encontraron clientes</p>
        <p className='mt-1 text-sm text-gray-500'>Prueba con otro nombre, empresa, correo o telefono.</p>
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Cliente</th>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Contacto</th>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Ubicacion</th>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Cotizaciones</th>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Ultima solicitud</th>
            <th className='px-5 py-3 text-right text-xs font-medium uppercase text-gray-500'>Detalle</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 bg-white'>
          {customers.map((customer) => (
            <tr key={customer.id} className='transition hover:bg-gray-50'>
              <td className='whitespace-nowrap px-5 py-4'>
                <div className='flex items-center gap-3'>
                  <span className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800'>
                    {getInitials(customer)}
                  </span>
                  <div>
                    <Link to={`/customers/${customer.id}`} className='font-semibold text-gray-900 hover:text-amber-700'>
                      {customer.name} {customer.lastname}
                    </Link>
                    <p className='mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500'>
                      <Building2 className='h-3.5 w-3.5' />
                      {customer.company || 'Sin empresa'}
                    </p>
                  </div>
                </div>
              </td>
              <td className='px-5 py-4 text-sm'>
                <p className='text-gray-800'>{customer.phone}</p>
                <p className='mt-0.5 text-gray-500'>{customer.email}</p>
              </td>
              <td className='px-5 py-4 text-sm text-gray-600'>{customer.location || 'Sin ubicacion'}</td>
              <td className='px-5 py-4'>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700'>
                  <FileText className='h-3.5 w-3.5' />
                  {customer.quoteCount}
                </span>
              </td>
              <td className='whitespace-nowrap px-5 py-4 text-sm text-gray-600'>{formatDate(customer.lastQuoteAt)}</td>
              <td className='px-5 py-4 text-right'>
                <Link
                  to={`/customers/${customer.id}`}
                  className='inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400'
                  title='Ver cliente'
                  aria-label={`Ver detalle de ${customer.name} ${customer.lastname}`}
                >
                  <ArrowUpRight className='h-4 w-4' />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { ArrowUpRight, Building2, FileText, UserCheck2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import type { CustomerQuoteSummary } from '../../services/customers/types'
import { getWorkflowStatusClassName, getWorkflowStatusLabel } from '../../shared/constants/quote-workflow'

interface CustomerQuotesTableProps {
  quotes: CustomerQuoteSummary[]
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const CustomerQuotesTable = ({ quotes }: CustomerQuotesTableProps) => {
  const navigate = useNavigate()

  if (quotes.length === 0) {
    return (
      <div className='flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center'>
        <FileText className='mb-3 h-10 w-10 text-gray-300' />
        <p className='font-semibold text-gray-800'>Este cliente no tiene cotizaciones visibles</p>
        <p className='mt-1 text-sm text-gray-500'>Las cotizaciones apareceran aqui de acuerdo con tus permisos.</p>
      </div>
    )
  }

  const openQuote = (quoteId: string) => navigate(`/quotes/workflow/${quoteId}`)

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Cotizacion</th>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Fecha</th>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Sucursal</th>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Estado</th>
            <th className='px-5 py-3 text-left text-xs font-medium uppercase text-gray-500'>Vendedor</th>
            <th className='px-5 py-3 text-right text-xs font-medium uppercase text-gray-500'>Abrir</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 bg-white'>
          {quotes.map((quote) => {
            const sellerName = quote.assignedSeller
              ? `${quote.assignedSeller.name} ${quote.assignedSeller.lastname}`.trim()
              : 'Sin asignar'

            return (
              <tr
                key={quote.id}
                role='link'
                tabIndex={0}
                onClick={() => openQuote(quote.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') openQuote(quote.id)
                }}
                className='cursor-pointer transition hover:bg-amber-50/50 focus:bg-amber-50 focus:outline-none'
              >
                <td className='whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900'>COT-{quote.quoteNumber}</td>
                <td className='whitespace-nowrap px-5 py-4 text-sm text-gray-600'>{formatDate(quote.createdAt)}</td>
                <td className='px-5 py-4 text-sm text-gray-600'>
                  <span className='inline-flex items-center gap-1.5'>
                    <Building2 className='h-4 w-4 text-gray-400' />
                    {quote.branch?.name || 'Sin sucursal'}
                  </span>
                </td>
                <td className='px-5 py-4 text-sm'>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getWorkflowStatusClassName(quote.workflowStatus)}`}>
                    {getWorkflowStatusLabel(quote.workflowStatus)}
                  </span>
                </td>
                <td className='px-5 py-4 text-sm text-gray-600'>
                  <span className='inline-flex items-center gap-1.5'>
                    <UserCheck2 className='h-4 w-4 text-gray-400' />
                    {sellerName}
                  </span>
                </td>
                <td className='px-5 py-4 text-right'>
                  <ArrowUpRight className='ml-auto h-4 w-4 text-gray-400' aria-hidden='true' />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

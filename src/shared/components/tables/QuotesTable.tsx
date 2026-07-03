import { type FC } from 'react'
import { Building2, UserCheck2 } from 'lucide-react'
import { NavLink } from 'react-router'
import type { Quote } from '../../../store/quote/quote.store'
import { getWorkflowStatusClassName, getWorkflowStatusLabel } from '../../constants/quote-workflow'

interface Props {
  quotes?: Quote[]
  isLoading: boolean
  isAdmin?: boolean
  canAssignQuotes?: boolean
  onAssignQuote?: (quote: Quote) => void
}

const getAssignedSellerName = (quote: Quote) => {
  if (!quote.assignedSeller) return 'Sin asignar'
  return `${quote.assignedSeller.name} ${quote.assignedSeller.lastname}`.trim()
}

export const QuotesTable: FC<Props> = ({
  quotes,
  isLoading,
  isAdmin = false,
  canAssignQuotes = false,
  onAssignQuote,
}) => {
  if (isLoading) {
    return <QuotesTableSkelleton items={quotes?.length ?? 10} />
  }

  return (
    <table className='min-w-full divide-y divide-gray-200 overflow-x-auto'>
      <thead className='bg-gray-50'>
        <tr>
          <th scope='col' className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>N° Cotización</th>
          <th scope='col' className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Cliente</th>
          <th scope='col' className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Fecha</th>
          <th scope='col' className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Estado</th>
          <th scope='col' className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Asignación</th>
          <th scope='col' className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>Acciones</th>
        </tr>
      </thead>

      <tbody className='divide-y divide-gray-200 bg-white'>
        {quotes?.map((quote) => {
          const assignedSellerName = getAssignedSellerName(quote)
          const hasAssignedSeller = Boolean(quote.assignedSeller?.id)

          return (
            <tr key={quote.id} className='quote-item hover:bg-gray-50'>
              <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>#{quote.quoteNumber}</td>
              <td className='whitespace-nowrap px-6 py-4'>
                <div className='flex items-center'>
                  <img className='h-8 w-8 rounded-full' src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' alt='Client picture' />
                  <div className='ml-3'>
                    {`${quote?.workflowStatus ?? ''}`.toUpperCase() === 'NEW' && !isAdmin ? (
                      <>
                        <p className='text-sm font-medium text-gray-900'>Nueva cotización</p>
                        <p className='text-sm text-gray-500'>Pendiente por revisar</p>
                        <p className='mt-1 inline-flex items-center gap-1 text-xs text-gray-500'>
                          <Building2 className='h-3 w-3' />
                          Sucursal: {quote?.branch ?? 'Sin sucursal'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className='text-sm font-medium text-gray-900'>{quote?.customer?.name} {quote?.customer?.lastname}</p>
                        <p className='text-sm text-gray-500'>{quote?.customer?.phone}</p>
                        <p className='mt-1 inline-flex items-center gap-1 text-xs text-gray-500'>
                          <Building2 className='h-3 w-3' />
                          Sucursal: {quote?.branch ?? 'Sin sucursal'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>{quote.createdAt}</td>
              <td className='whitespace-nowrap px-6 py-4 text-sm'>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getWorkflowStatusClassName(quote.workflowStatus)}`}>
                  {getWorkflowStatusLabel(quote.workflowStatus)}
                </span>
              </td>
              <td className='px-6 py-4 text-sm text-gray-600'>
                <div className='min-w-[180px]'>
                  <p className='inline-flex items-center gap-2 font-semibold text-gray-800'>
                    <UserCheck2 className={`h-4 w-4 ${hasAssignedSeller ? 'text-emerald-600' : 'text-gray-400'}`} />
                    {assignedSellerName}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {quote.assignedAt ? `Asignada ${quote.assignedAt}` : 'Pendiente de asignación'}
                  </p>
                </div>
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                <div className='flex justify-end gap-3'>
                  {canAssignQuotes && onAssignQuote ? (
                    <button
                      type='button'
                      onClick={() => onAssignQuote(quote)}
                      className='font-semibold text-amber-600 transition hover:text-amber-700'
                    >
                      {hasAssignedSeller ? 'Reasignar' : 'Asignar'}
                    </button>
                  ) : null}
                  <NavLink className='font-semibold text-blue-600 hover:text-blue-900' to={`/quotes/workflow/${quote.id}`}>
                    Ver
                  </NavLink>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

interface QuotesTableSkelletonProps {
  items: number
}

const QuotesTableSkelleton: React.FC<QuotesTableSkelletonProps> = ({ items = 1 }) => {
  return (
    <div className='min-w-full animate-pulse divide-y divide-gray-200 overflow-x-auto'>
      <div className='flex justify-between bg-gray-50'>
        <div className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>N° Cotización</div>
        <div className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Cliente</div>
        <div className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Fecha</div>
        <div className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Estado</div>
        <div className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Asignación</div>
        <div className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>Acciones</div>
      </div>

      <div className='divide-y divide-gray-200 bg-white'>
        {Array.from({ length: items }).map((_, index) => (
          <div key={index} className='quote-item flex justify-between hover:bg-gray-50'>
            <div className='px-6 py-4'>
              <div className='h-2 w-10 bg-gray-300'></div>
            </div>
            <div className='px-6 py-4'>
              <div className='flex items-center'>
                <div className='h-8 w-8 rounded-full bg-gray-300'></div>
                <div className='ml-3'>
                  <div className='mb-2 h-2 w-20 bg-gray-300'></div>
                  <div className='h-2 w-10 bg-gray-300'></div>
                </div>
              </div>
            </div>
            <div className='px-6 py-4'>
              <div className='mb-2 h-2 w-20 bg-gray-300'></div>
            </div>
            <div className='px-6 py-4'>
              <div className='mb-2 h-2 w-16 bg-gray-300'></div>
            </div>
            <div className='px-6 py-4'>
              <div className='mb-2 h-2 w-24 bg-gray-300'></div>
              <div className='h-2 w-20 bg-gray-200'></div>
            </div>
            <div className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
              <div className='mb-2 h-2 w-16 bg-gray-300'></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

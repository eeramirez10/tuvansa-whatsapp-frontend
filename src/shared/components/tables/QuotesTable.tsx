import { type FC } from 'react'
import { Building2 } from 'lucide-react'

import { NavLink } from 'react-router'
import type { Quote } from '../../../store/quote/quote.store'
import { getWorkflowStatusClassName, getWorkflowStatusLabel } from '../../constants/quote-workflow'



interface Props {
  quotes?: Quote[]
  isLoading: boolean
  isAdmin?: boolean
}

export const QuotesTable: FC<Props> = ({ quotes, isLoading, isAdmin = false }) => {



  if (isLoading) {

    return (
      <QuotesTableSkelleton items={quotes?.length ?? 10} />
    )
  }




  return (

    <>

      <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Cotización</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {
            quotes?.map((quote) => (

              <tr key={quote.id} className="quote-item hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{quote.quoteNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="w-8 h-8 rounded-full" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Client picture" />
                    <div className="ml-3">
                      {`${quote?.workflowStatus ?? ''}`.toUpperCase() === 'NEW' && !isAdmin ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">Nueva cotización</p>
                          <p className="text-sm text-gray-500">Pendiente por revisar</p>
                          <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            Sucursal: {quote?.branch ?? 'Sin sucursal'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-900">{quote?.customer?.name} {quote?.customer?.lastname}</p>
                          <p className="text-sm text-gray-500">{quote?.customer?.phone}</p>
                          <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            Sucursal: {quote?.branch ?? 'Sin sucursal'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.createdAt}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getWorkflowStatusClassName(quote.workflowStatus)}`}>
                    {getWorkflowStatusLabel(quote.workflowStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                  <NavLink className={'text-blue-600 hover:text-blue-900 mr-3'} to={`/quotes/workflow/${quote.id}`}>
                    Ver
                  </NavLink>
                  {/* <button className="text-blue-600 hover:text-blue-900 mr-3">Ver</button> */}
                  {/* <button className="text-green-600 hover:text-green-900 mr-3">Aprobar</button>
                <button className="text-red-600 hover:text-red-900">Rechazar</button> */}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

    </>



  )
}

interface QuotesTableSkelletonProps {
  items: number
}


const QuotesTableSkelleton: React.FC<QuotesTableSkelletonProps> = (props) => {

  const { items = 1 } = props



  return (

    <div className="min-w-full divide-y divide-gray-200 overflow-x-auto animate-pulse">
      <div className="bg-gray-50 flex justify-between">

        <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">N° Cotización</div>
        <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Cliente</div>
        <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</div>
        <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</div>
        <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</div>

      </div>

      <div className="bg-white divide-y divide-gray-200">

        {
          Array.from({ length: items}).map((_, index) => (
            <div key={index} className="quote-item hover:bg-gray-50 flex justify-between">
              <div className="px-6 py-4 ">
                <div className='h-2 w-10 bg-gray-300'></div>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300"  ></div>
                  <div className="ml-3">
                    <div className="h-2 w-20 bg-gray-300 mb-2"></div>
                    <div className="h-2 w-10 bg-gray-300"></div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 ">
                <div className='h-2 w-20 bg-gray-300 mb-2'></div>
              </div>
              <div className="px-6 py-4 ">
                <div className='h-2 w-16 bg-gray-300 mb-2'></div>
              </div>
              <div className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className='h-2 w-10 bg-gray-300 mb-2'></div>

                {/* <button className="text-blue-600 hover:text-blue-900 mr-3">Ver</button> */}
                {/* <button className="text-green-600 hover:text-green-900 mr-3">Aprobar</button>
                <button className="text-red-600 hover:text-red-900">Rechazar</button> */}
              </div>
            </div>
          ))
        }




      </div>
    </div>

  )
}

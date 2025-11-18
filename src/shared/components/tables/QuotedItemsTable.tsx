
import { useQuoteStore } from '../../../store/quote/quote.store'
import { formatCurrency } from '../../../utils/format'

export const QuotedItemsTable = () => {


  const quote = useQuoteStore(state => state.activeId ? state.quotesById[state.activeId] : null)

  const subtotal = useQuoteStore(state => state.subtotal)
  const total = useQuoteStore(state => state.total)
  const tax = useQuoteStore(state => state.tax)
  
  return (

    <>
      <div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">Descripción</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UM</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>

              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilidad</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>

              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">

            {
              quote?.items.map((item) => {



                const subtotal = item.price ? formatCurrency((item.price * item.qty)) : '-'
                const cost = item.cost ? formatCurrency(item.cost) : '0'


                return (
                  <tr>
                    <td className="px-6 py-4  text-xs text-gray-900 ">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ean}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.um}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.qty}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.price ?? null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {item.margin}
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm  text-green-600 font-semibold">
                      {subtotal}
                    </td>



                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">S/ 500.00</td> */}
                  </tr>

                )
              }
              )
            }



          </tbody>
        </table>

        <div className="flex justify-between border-t border-gray-200 p-3">
          <div></div>
          <div className="border p-4 rounded-sm border-gray-300">

            {
              quote?.id &&

              <>

                <div className="flex justify-between gap-2">
                  <h3>Sub Total:</h3> {formatCurrency(subtotal(quote.id))}
                </div>
                <div className="flex justify-between gap-2">
                  <h3>Iva 16%:</h3>{formatCurrency(tax(quote.id))}
                </div>
                <div className="flex justify-between gap-2">
                  <h3>Total:</h3> {formatCurrency(total(quote.id))}
                </div>
              </>
            }



          </div>
        </div>
      </div>

    </>

  )
}

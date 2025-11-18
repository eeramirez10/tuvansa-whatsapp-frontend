import { useUiBoundStore } from '../../../store/ui/useUiBoundStore'
import { useSemanticVectorStore } from '../../../store/products/semantic-vector.store'
import { Star } from 'lucide-react'
import type { AvailabilityBranch } from '../../../services/inventory/api'
import { useQuoteStore } from '../../../store/quote/quote.store'


export const ResultsModal = () => {
  const open = useUiBoundStore(state => state.openModal)
  const onClose = useUiBoundStore(state => state.setCloseModal)
  const activeRowKey = useSemanticVectorStore((state) => state.activeRowKey)
  const rows = useSemanticVectorStore(state => state.rows)

  const row = activeRowKey ? rows[activeRowKey] : undefined;

  if (!open || !activeRowKey || !row) return null

  // const results = row.results
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm text-gray-700 font-semibold">Similares: “{row.query}”</h3>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
            Cerrar
          </button>
        </div>
        <div className="p-4">
          {row.results?.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No se encontraron productos.</div>
          ) :
            (

              <div className="grid grid-cols-1 md:grid-cols-2 max-h-[60vh] gap-3 overflow-auto pr-1">
                {row.results.map((hit) => {

                  return (
                    <div key={hit.id} className="rounded-lg border border-gray-200 shadow-md p-3 hover:bg-gray-50 ">

                      <div className="flex gap-3 mb-1">
                        <h3 className="text-xs font-semibold"> {hit.id}</h3>
                        <span className="flex text-xs text-gray-700 items-center"> <Star className="h-4 text-yellow-500" />{hit.score}%</span>
                      </div>
                      <div className="text-xs text-gray-800 font-semibold mb-1">
                        {hit.metadata.description}
                      </div>
                      <div className="border-t border-gray-200 mb-1"></div>
                      <p className="text-xs text-gray-700 font-semibold mb-1">Disponibilidad por sucursal:</p>

                      <AvailabilityBranchTable
                        branches={row.availability[hit.id]?.branches ?? []}
                      />
                    </div>
                  )
                }
                )}
              </div>
            )
          }
        </div>
        <div className="flex justify-end border-t border-gray-200 px-4 py-3">
          <button onClick={onClose} className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}


const AvailabilityBranchTable = ({ branches }: { branches: AvailabilityBranch[] }) => {

  const activeId = useQuoteStore(state => state.activeId)
  const activeRowKey = useSemanticVectorStore(state => state.activeRowKey)
  const applyAvailabilityToLine = useQuoteStore(state => state.applyAvailabilityToLine)
  const close = useUiBoundStore(state => state.setCloseModal)



  const handleApplyAvailabilityToLine = (branch: AvailabilityBranch) => {



    if (!activeRowKey) return
    applyAvailabilityToLine(activeId!, activeRowKey, {
      cost: branch.cost,

      currency: branch.currency ?? 'MXN',
      warehouse: branch.warehouse
    })

    close()
  }

  return (
    <table className="text-xs text-left  rounded-md shadow-md w-full">
      <thead className="bg-gray-100">
        <tr className="text-xs uppercase">
          <th className="px-6 py-3">Almacen</th>
          <th className="px-6 py-3">Costo</th>
          <th className="px-6 py-3">Stock</th>
        </tr>
      </thead>
      <tbody>
        {
          branches.map((b) => (

            <>
              <tr onClick={() => { handleApplyAvailabilityToLine(b) }} className=" border-b-1 border-gray-200 cursor-pointer hover:bg-gray-100 ">
                <td className="px-6 py-3">{b.warehouse}</td>
                <td className="px-6 py-3 text-green-700 font-semibold">${b.cost}</td>
                <td className="px-6 py-3 text-blue-700 font-semibold ">{b.stock}</td>
              </tr>
            </>
          ))
        }

      </tbody>
    </table>
  )

}

import { useCallback, useEffect, useState } from "react";
import { useSemanticVectorStore } from "../../../store/products/semantic-vector.store";
import { useQuoteStore, type QuoteLine } from "../../../store/quote/quote.store"
import { useUiBoundStore } from "../../../store/ui/useUiBoundStore";
import { formatCurrency } from "../../../utils/format";
import { ResultsModal } from "../modals/ResultsModal"
import { notify } from "../../../lib/notifications/toast-sonner";


export const QuoteItemsTableWithInputs = () => {



  const quote = useQuoteStore(state => state.activeId ? state.quotesById[state.activeId] : null)


  const searchSimilarRaw = useSemanticVectorStore(state => state.searchRow)
  const openRow = useSemanticVectorStore(state => state.openRow)
  const setOpenModal = useUiBoundStore(state => state.setOpenModal)

  // const line = useQuoteStore(s => s.items.find(l => l.id === lineId))
  const setPrice = useQuoteStore(s => s.setLinePrice)
  const setMargin = useQuoteStore(s => s.setLineMargin)


  const subtotal = useQuoteStore(state => state.subtotal)
  const total = useQuoteStore(state => state.total)
  const tax = useQuoteStore(state => state.tax)



  // estado POR FILA (clave = id/ean/description)
  const rows = useSemanticVectorStore(state => state.rows)



  // const getRowKey = (item: QuoteLine) => String(item.id)
  const handleSearchClick = async (item: QuoteLine) => {

    const key = item.id

    openRow(key)

    const query = item.description?.trim() ?? ""
    if (!query) return

    
    await searchSimilarRaw(key, query)
      .catch(() => {

        notify.error('Hubo un error al buscar, intentalo otra vez')
      }) // devuelve array (éxito/error -> [] en error)

  }

  const handleOpenModal = (key: string) => {

    const r = rows[key]
    if (!r) return
    openRow(key)


    setOpenModal()
  }

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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>




              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">

            {
              quote?.items.map((item) => {


                const key = item.id
                const state = rows[key]?.status ?? 'idle'
                const count = rows[key]?.results?.length ?? 0

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

                      <PriceInput
                        value={item.price ?? null} // evita `|| ''` (rompe si price=0)
                        onCommit={(n) => setPrice(quote.id, key, n)} // aquí recalculas margin en el store
                        disabled={item.cost == null}
                        className="w-20 rounded border border-gray-200 px-2 py-0.5 text-sm"
                        placeholder="$0.00"

                      />
                      {/* <input
                        inputMode="decimal"
                        value={item.price || ''}
                        onChange={(e) => {


                          const val = Number((e.target.value || '').replace(/,/g, ''))
                          if (!Number.isFinite(val)) return
                          setPrice(quote.id, key, val)
                        }}
                        disabled={item.cost == null}
                        className="w-20 rounded border border-gray-200  px-2 py-0.5 text-sm"
                        placeholder="$0.00"
                      /> */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <input
                          inputMode="decimal"
                          value={item.margin || ''}
                          onChange={(e) => {
                            const val = Number((e.target.value || '').replace(/,/g, ''))


                            if (!Number.isFinite(val)) return
                            setMargin(quote.id, key, val)
                          }}
                          disabled={item.cost == null}
                          className="w-15 rounded border border-gray-200 px-2 py-0.5 text-sm"
                          placeholder="10"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm  text-green-600 font-semibold">
                      {subtotal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {state === 'idle' && (
                        <button
                          onClick={() => handleSearchClick(item)}
                          className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-2 py-1 text-xs text-white"
                        >
                          Buscar
                        </button>
                      )}

                      {state === 'loading' && (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-2 py-1 text-xs text-white opacity-80"
                        >
                          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="3" />
                          </svg>
                          Buscando…
                        </button>
                      )}

                      {state === 'success' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSearchClick(item)}
                            className="rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
                            title="Volver a buscar"
                          >
                            Rebuscar
                          </button>
                          <button
                            onClick={() => handleOpenModal(key)}
                            className="rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-1 text-xs text-white"
                          >
                            Ver similares ({count})
                          </button>
                        </div>
                      )}

                      {state === 'error' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSearchClick(item)}
                            className="rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
                            title="Volver a buscar"
                          >
                            Rebuscar
                          </button>
                          {/* <button
                            onClick={() => handleOpenModal(key)}
                            className="rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-1 text-xs text-white"
                          >
                            Ver similares ({count})
                          </button> */}
                        </div>
                      )}
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


      <ResultsModal />
    </>

  )
}


// util opcional
const decRegex = /^(\d+)?([.]\d{0,4})?$/; // permite "", "0", "0.", "0.1", "12.3456" (ajusta decimales)

function PriceInput({
  value,           // número o null desde tu store
  onCommit,        // (n:number) => void  -> setPrice(...)
  disabled,
  className,
  placeholder,
}: {
  value: number | null | undefined
  onCommit: (n: number) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}) {
  const [text, setText] = useState(value != null ? String(value) : "");

  // si el store cambia (por seleccionar almacén, etc), sincroniza el texto
  useEffect(() => {
    setText(value != null ? String(value) : "");
  }, [value]);

  return (
    <input
      type="text"               // ¡no uses number para evitar bloqueos locales!
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const v = e.target.value.replace(",", "."); // por si escriben coma
        if (v === "" || decRegex.test(v)) {
          setText(v); // permite estados intermedios como ".", "12."
        }
        // No parseamos aquí para no molestar la escritura
      }}
      onBlur={() => {
        const v = text.trim();
        if (v === "" || v === "." || v === "-") {
          // nada que commitear
          setText(value != null ? String(value) : "");
          return;
        }
        const n = Number(v);
        if (Number.isFinite(n)) {
          onCommit(n); // ← aquí actualizas el store (setPrice)
          // normaliza a 2 decimales si quieres:
          setText(n.toString());
        } else {
          // valor inválido: reestablece
          setText(value != null ? String(value) : "");
        }
      }}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
    />
  );
}



export function MarginInput({
  value,
  onCommit,
  disabled,
  className,
  placeholder,
  decimals = 2,
}: {
  value: number | null | undefined; // porcentaje
  onCommit: (n: number) => void     // p.ej. setLineMargin(...)
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  decimals?: number;                // normalización
}) {
  const [text, setText] = useState(value != null ? String(value) : "");

  useEffect(() => {
    setText(value != null ? String(value) : "");
  }, [value]);

  const commit = useCallback(() => {
    const v = text.trim();
    if (v === "" || v === "." || v === "-") {
      setText(value != null ? String(value) : "");
      return;
    }
    const n = Number(v);
    if (Number.isFinite(n)) {
      onCommit(n);
      setText(n.toFixed(decimals));
    } else {
      setText(value != null ? String(value) : "");
    }
  }, [text, value, onCommit, decimals]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const v = e.target.value.replace(",", ".");
        if (v === "" || decRegex.test(v)) setText(v);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
    />
  );
}


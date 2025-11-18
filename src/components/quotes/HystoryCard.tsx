import { useQuoteStore } from "../../store/quote/quote.store"
import { dateFormat } from "../../utils/dateFormat"


export const HistoryCard = () => {

  const quote = useQuoteStore(select => select.activeId ? select.quotesById[select.activeId] : null)

  const quoteMeta = quote?.quoteMeta





  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Historial</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">

          <div className="relative timeline-item pl-8">
            <div className="absolute left-0 top-0 w-4 h-4 bg-blue-500 rounded-full z-10"></div>
            <div className="text-sm font-medium text-gray-800">Cotización creada</div>
            <div className="text-xs text-gray-500">{dateFormat(quoteMeta?.quoteCreatedAt ?? '')}</div>
            <div className="text-sm text-gray-600 mt-1">La cotización fue generada automáticamente por el agente de IA.</div>
          </div>

          {
            quoteMeta?.versionCreatedAt &&

            <div className="relative timeline-item pl-8">
              <div className="absolute left-0 top-0 w-4 h-4 bg-yellow-500 rounded-full z-10"></div>
              <div className="text-sm font-medium text-gray-800">Cotizacion creada por:</div>
              <div className="text-xs text-gray-500">{dateFormat(quoteMeta?.versionCreatedAt)}</div>
              <div className="text-sm text-gray-600 mt-1">La cotización fue asignada a {quoteMeta?.createdByUser?.name} {quoteMeta?.createdByUser?.lastname}.</div>
            </div>
          }



          {/* <div className="relative timeline-item pl-8">
            <div className="absolute left-0 top-0 w-4 h-4 bg-yellow-500 rounded-full z-10"></div>
            <div className="text-sm font-medium text-gray-800">Asignada a vendedor</div>
            <div className="text-xs text-gray-500">15/06/2023 10:25 AM</div>
            <div className="text-sm text-gray-600 mt-1">La cotización fue asignada a Juan Pérez para seguimiento.</div>
          </div> */}
          {
            quoteMeta?.pdfSentAt &&

            <div className="relative timeline-item pl-8">
              <div className="absolute left-0 top-0 w-4 h-4 bg-gray-500 rounded-full z-10"></div>
              <div className="text-sm font-medium text-gray-800">Enviada al cliente</div>
              <div className="text-xs text-gray-500">{dateFormat(quoteMeta?.pdfSentAt)}</div>
              <div className="text-sm text-gray-600 mt-1">La cotización fue enviada por WhatsApp al cliente.</div>
            </div>

          }




        </div>
      </div>
    </div>
  )
}

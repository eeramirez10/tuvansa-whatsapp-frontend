import { useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router';

import { useMessages } from '../../queries/messages/messages-query';

import { useUiBoundStore } from '../../store/ui/useUiBoundStore';
import { useQuoteStore } from '../../store/quote/quote.store';
import { PrintButton } from '../../shared/components/PrintButton';
import { PrintableLayout } from '../../components/quotes/PrintableLayout';
import { useQuoteDisplay } from '../../queries/quotes/use-quote-display';
import { QuotationCard } from '../../shared/components/cards/QuotationCard';
import { ChatPreview } from '../../shared/components/chats/ChatPreview';






export const QuoteDetail = () => {

  const { id } = useParams<{ id?: string }>()

  const { data: display } = useQuoteDisplay({
    id,
    presignSeconds: 1800,
    prefer: 'final',
    include: ['items', 'artifacts'],
  })

  const { data: chat } = useMessages(display?.chatThreadId, { pageSize: 100 })
  const isQuoteExpand = useUiBoundStore(state => state.expand)

  const createQuote = useQuoteStore(state => state.createQuote)
  const setActive = useQuoteStore(state => state.setActive)

  console.log(display)

  useEffect(() => {
    if (id) setActive(id)
  }, [id, setActive])

  useEffect(() => {
    if (display) {

      createQuote(display);
    }
  }, [createQuote, display]);

  // useEffect(() => {

  //   if (!id || !display) return;


  //   if (!quotesById[id]) {
  //     if (display.source === 'VERSION') {

  //       const {id, ...rest} = display.version

  //       console.log(rest)

  //       // const storeQuote = quoteMapper({id:display.quote.id, rest});

  //       // console.log({storeQuote})
  //       // createQuote(storeQuote);
  //     }else {
  //       // const storeQuote = quoteMapper(display.quote);
  //       // createQuote(storeQuote);
  //       //  console.log({storeQuote})
  //     }




  //   }

  // }, [id, display, quotesById, createQuote])






  const reversedMessages = useMemo(() => {

    if (!chat) return undefined

    return {
      ...chat,
      messages: chat.messages.reverse()
    }
  }, [chat])

  const stylesRestOfCards = isQuoteExpand ? 'grid col-span-4 grid-cols-3 space-x-6' : 'space-y-6'


  return (

    <div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

        <div className={` ${isQuoteExpand ? 'lg:col-span-4' : 'lg:col-span-2'} space-y-6`}>
          <QuotationCard />
          <ChatPreview chat={reversedMessages} />
        </div>
        <div className={stylesRestOfCards}>
          <ActionCard />
          <SummaryCard />
          <HistoryCard />
        </div>
      </div>


    </div>

  )
}




const ActionCard = () => {

  const quote = useQuoteStore(state => state.getActive())


  const printRef = useRef(null);


  return (
    <>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Acciones</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          <i data-feather="check" className="mr-2"></i>
          Aprobar Cotización
        </button> */}
          {/* <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
          <i data-feather="x" className="mr-2"></i>
          Rechazar Cotización
        </button> */}

          <PrintButton ref={printRef} />

          {

            quote?.fileKey && <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
              <i data-feather="download" className="mr-2"></i>
              Descargar Archivo Adjunto
            </button>

          }

          <button className="w-full text-white flex items-center justify-center px-4 py-2 bg-purple-400  rounded-lg text-sm font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <i data-feather="message-square" className="mr-2 "></i>
            Descargar datos
          </button>

          <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <i data-feather="mail" className="mr-2"></i>
            Enviar por Email
          </button>
          <button className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500">
            <i data-feather="message-square" className="mr-2"></i>
            Contactar Cliente
          </button>
        </div>
      </div>


      <PrintableLayout
        printRef={printRef} />
    </>


  )
}





const HistoryCard = () => {
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
            <div className="text-xs text-gray-500">15/06/2023 10:20 AM</div>
            <div className="text-sm text-gray-600 mt-1">La cotización fue generada automáticamente por el agente de IA.</div>
          </div>


          <div className="relative timeline-item pl-8">
            <div className="absolute left-0 top-0 w-4 h-4 bg-gray-500 rounded-full z-10"></div>
            <div className="text-sm font-medium text-gray-800">Enviada al cliente</div>
            <div className="text-xs text-gray-500">15/06/2023 10:22 AM</div>
            <div className="text-sm text-gray-600 mt-1">La cotización fue enviada por WhatsApp al cliente.</div>
          </div>


          <div className="relative timeline-item pl-8">
            <div className="absolute left-0 top-0 w-4 h-4 bg-yellow-500 rounded-full z-10"></div>
            <div className="text-sm font-medium text-gray-800">Asignada a vendedor</div>
            <div className="text-xs text-gray-500">15/06/2023 10:25 AM</div>
            <div className="text-sm text-gray-600 mt-1">La cotización fue asignada a Juan Pérez para seguimiento.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SummaryCard = () => {

  const quote = useQuoteStore(state => state.getActive())
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Resumen de la conversacion</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <p className='text-sm text-gray-600 mt-1'>{quote?.summary}</p>
        </div>
      </div>
    </div>
  )
}
import React, { useState, type FC, type PropsWithChildren } from "react"
import { Building, Mail, MapPin, Maximize, Minimize, Phone, Sparkles } from "lucide-react"
import { useUiBoundStore } from "../../../store/ui/useUiBoundStore"
import { useQuoteStore, type QuoteLine } from "../../../store/quote/quote.store"
import { QuoteItemsTableWithInputs } from "../tables/QuoteItemsTableWithInputs"

import { dateFormat } from '../../../utils/dateFormat';
import { sendPdfQuoteToCustomer } from "../../../services/quotes/api"
import { notify } from "../../../lib/notifications/toast-sonner"
import { QuotedItemsTable } from "../tables/QuotedItemsTable"
import { type SaveQuoteDraftParams } from "../../../queries/quotes/use-save-quote"
import { useQuote } from "../../../hooks/quotes/useQuote"


interface QuoteItems {
  items: QuoteLine[]
}



export const QuotationCard = () => {

  const { save, finalize } = useQuote({})


  const quote = useQuoteStore(state => state.activeId ? state.quotesById[state.activeId] : null)



  const setIsExpand = useUiBoundStore(state => state.setExpand)
  const isExpand = useUiBoundStore(state => state.expand)

  const icon = !isExpand ? <Maximize className="h-5" /> : <Minimize className="h-5" />
  const [quoteButton, setQuoteButton] = useState(false)

  const [isLoadingDraft, setIsLoadingDraft] = useState(false)

  const customer = quote?.customer

  const buttonQuoteStyle = quoteButton ?
    ' from-red-500 to-orange-500  hover:from-red-600 hover:to-orange-600' :
    'from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600'


  const canEdit = quote?.source === 'VERSION' && (quote?.status === 'DRAFT' || quote?.status === 'FINAL')

  const canQuote = quote?.source === 'QUOTE' && quote.status === 'PENDING'
  const canFinalQuote = quote?.status === 'DRAFT'



  const saveDraftQuote = async () => {

    if (!quote) return

    const newQuote: SaveQuoteDraftParams = {
      quoteId: quote.id,
      storeQuote: {
        ...quote,
        fileKey: quote.fileKey ?? undefined,
        items: quote.items.map((i) => ({
          ...i,
          qty: +i.qty,
          cost: i.cost ? +i.cost : 0,
          currency: 'MXN',
          price: i.price ? +i.price : 0,
          margin: i.margin ? +i.margin : null,
          warehouse: i.source?.warehouse
        }))
      },
      customerId: quote.customer?.id,
    }


    setIsLoadingDraft(true)
    notify.promise(
      save.mutateAsync({ quoteId: quote.id, body: newQuote }),
      {
        loading: 'Guardando....',
        success: () => {
          return 'Guardado Correctamente'
        },
        error: () => 'Hubo un error al guardar',
        finally: () => {

          setIsLoadingDraft(false)
        },

      }
    )

  }

  const finalizeQuote = async () => {

    if (!quote) return

    if (!quote.versionId) return



    notify.promise(
      finalize.mutateAsync({ versionId: quote.versionId, quoteId: quote.id }),
      {
        loading: 'Finalizando Cotizacion...',
        success: () => {
          return 'Finalizado Correctamente'
        },
        error: () => 'Hubo un error al finalizar'
      }
    )

  }

  const handleSendQuotePdf = () => {
    if (!quote) return

    if (!quote.versionId) return

    notify.promise(
      sendPdfQuoteToCustomer(quote.versionId),
      {
        loading: 'Enviando Cotizacion...',
        success: () => {
          return 'Enviado Correctamente'
        },
        error: () => 'Hubo un error al Enviar la cotizacio al cliente'
      }
    )


  }




  return (
    <div className=' bg-white rounded-md shadow-md '>
      <div className='flex p-4 justify-between '>
        <h2 className='font-semibold'> Cotizacion #{quote?.quoteNumber}</h2>
        <button className='cursor-pointer' onClick={() => setIsExpand(!isExpand)}>
          {icon}
        </button>
      </div>
      <div className='border-b-1 border-gray-200'></div>

      <div className='flex justify-between '>

        <div className='items-center p-4'>
          <h3 className='uppercase text-sm font-medium text-gray-500 mb-2'>Cliente</h3>
          <div className='flex items-center space-x-3'>

            <img className='h-10 rounded-full' src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" alt="" />
            <div className='space-y-0.5'>
              <h2 className='text-md font-semibold'>{customer?.name} {customer?.lastname}</h2>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <p className='text-xs text-gray-500' >  {customer?.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <p className='text-xs text-gray-500'>{customer?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <p className='text-xs text-gray-500'>{customer?.location}</p>
              </div>
              {
                customer?.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    <p className='text-xs text-gray-500'>{customer?.company}</p>
                  </div>
                )
              }



            </div>
          </div>
        </div>
        <div className='items-center p-4'>
          <h2 className='uppercase text-sm font-medium text-gray-500 mb-2'>Detalles</h2>
          <div className=' items-center space-x-3'>

            <p className='text-xs text-gray-600'>
              <span className='text-gray-800'>Fecha:</span>  {quote?.quoteMeta.quoteCreatedAt ? dateFormat(quote?.quoteMeta?.quoteCreatedAt) : ''}
            </p>
            <p className='text-xs text-gray-600'>
              <span className='text-gray-900'>Generada por:</span>  AI Agente
            </p>

          </div>
        </div>



      </div>
      <div className="flex justify-between px-4">

        <div
          className="
          p-1
          px-2
          bg-linear-to-r
          from-blue-400
          to-blue-600
          text-gray-100
          text-sm
          rounded-4xl
          "
        >
          {quote?.statusVersion}
        </div>

        <div className="flex gap-4">


          {

            canFinalQuote &&

            <QuoteButton
              callback={finalizeQuote}
              st="
                from-violet-500 
                to-purple-500  
                hover:from-violet-600 
                hover:to-purple-600
              "
            >
              Finalizar
            </QuoteButton>

          }


          {
            canEdit &&

            <QuoteButton
              st={buttonQuoteStyle}
              callback={() => setQuoteButton(!quoteButton)}
            >
              {quoteButton ? 'Cancelar' : 'Editar'}
            </QuoteButton>

          }


          {

            canQuote &&

            <QuoteButton
              st={buttonQuoteStyle}
              callback={() => setQuoteButton(!quoteButton)}
            >
              {quoteButton ? 'Cancelar' : 'Cotizar'}
            </QuoteButton>



          }

          <QuoteButton
            st="from-green-400 to-green-600  hover:from-green-700"
            callback={saveDraftQuote}
            disabled={isLoadingDraft}
          >
            Guardar
          </QuoteButton>


          {

            quote?.status === 'FINAL' &&

            <QuoteButton
              st=" from-purple-400 to-purple-500"
              callback={handleSendQuotePdf}
            >
              Enviar Cotizacion
            </QuoteButton>


          }




        </div>

      </div>



      <div className="overflow-x-auto p-4">

        {
          quote?.fileKey ?
            <div className='bg-gray-50 h-45 p-4 flex justify-center items-center rounded-md'>

              <div>
                <p className='text-sm text-gray-700 font-semibold mb-2'>
                  Hay un archivo adjunto puedes descargarla o procesar el archivo para poder verlo

                </p>

                <button className='m-auto flex justify-center text-white text-sm rounded-md px-3 py-1 bg-linear-to-r from-sky-500 to-indigo-500 cursor-pointer'>
                  Procesar archivo
                  <Sparkles size={18} className='ml-3 text-center ' />
                </button>
              </div>
            </div>
            :
            quoteButton ?
              <QuoteItemsTableWithInputs />
              :
              <>
                {
                  quote?.source === 'QUOTE' ?
                    <QuoteItemsTable items={quote?.items ?? []} />
                    :
                    <QuotedItemsTable />

                }

              </>
        }
      </div>
    </div>
  )

}


const QuoteItemsTable: FC<QuoteItems> = ({ items }) => {

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">Descripción</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UM</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {
          items.map((item) => (
            <tr>
              <td className="px-6 py-4  text-xs text-gray-900 ">{item.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ean}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.um}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.qty}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}



interface QuoteButtonProps {
  callback: () => void
  st: string
  disabled?: boolean

}

const QuoteButton: React.FC<PropsWithChildren<QuoteButtonProps>> = ({ callback, st, disabled = false, children }) => {

  return (
    <button
      className={`
        px-3 
        py-0.5 
        bg-linear-to-r 
        text-sm 
      text-white 
        rounded-md 
        cursor-pointer
        flex
        justify-around
        items-center
        gap-2
        ${st}
      `
      }
      onClick={callback}
      disabled={disabled}
    >
      {children}
    </button>

  )

}


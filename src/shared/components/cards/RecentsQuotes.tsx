import { MapPin, Phone } from 'lucide-react'
import type { FC } from 'react'

import { Link, useNavigate } from 'react-router'
import type { Quote } from '../../../store/quote/quote.store'

interface QuoteItem {
  quoteNumber: string,
  customerName: string
  status: string
  description: string
}



interface Props {
  quotes: Quote[]
  isLoading: boolean
}

export const RecentsQuotes: FC<Props> = ({ quotes, isLoading }) => {
  return (
    <div className='bg-white rounded-md shadow-md mb-6'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-gray-800 text-lg'>Cotizaciones recientes</h2>

          <Link className='text-sm text-blue-600 hover:text-blue-800 cursor-pointer' to={'/quotes'}>
            Ver todas
          </Link>

        </div>
      </div>

      {

        (isLoading && !quotes) ? <QuoteItemSkelton /> :

          <div className='h-80 overflow-y-auto'>

            {


              quotes.map((q) => {

                const { id, quoteNumber = '0', customer, status, summary = '', createdAt } = q
                return (


                  <QuoteItem
                    key={id}
                    id={id}
                    quoteNumber={quoteNumber.toString() ?? ''}
                    customerName={`${customer?.name} ${customer?.lastname}`}
                    status={status}
                    description={summary ?? ''}
                    phone={customer?.phone}
                    location={customer?.location}
                    createdAt={createdAt}
                  />
                )
              }
              )
            }

          </div>


      }





    </div>
  )
}


interface QuoteItemProps {
  id: string
  quoteNumber: string,
  customerName: string
  status: string
  description?: string
  phone?: string
  location?: string
  createdAt?: string

}

const QuoteItem: FC<QuoteItemProps> = (props: QuoteItemProps) => {

  const {
    id,
    quoteNumber,
    customerName,
    status,
    description,
    phone,
    location,
    createdAt
  } = props
  
  const navigate = useNavigate();
  return (
    <div
      className='p-4 border-b border-1.5 border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors'
      onClick={() => navigate(`/quotes/${id}`)}
    >
      <div className='flex justify-between items-center mb-2'>
        <div>
          <span className='text-sm text-gray-500'>#{quoteNumber}</span>
          <h2 className='text-lg font-semibold text-gray-800 capitalize'>{customerName}</h2>
        </div>


        <BadgeStatus status={status} />
      </div>

      <p className='text-gray-700 mb-2 text-sm'>{description}</p>

      <div className='flex justify-between '>

        <div className='flex  gap-4'>
          <div className='flex justify-center items-center'>
            <Phone size={14} className='text-gray-500  mr-1' />
            <span className='text-xs text-gray-500'>{phone}</span>
          </div>
          <div className='flex justify-center items-center '>
            <MapPin size={14} className='text-gray-500 mr-1' />
            <span className='text-xs text-gray-500'>{location}</span>
          </div>

        </div>



        <p className='text-xs text-gray-500'>{createdAt}</p>

      </div>



    </div>
  )
}

export const RecentsQuotesSkelton = () => {

  return (
    <div className='bg-white rounded-md shadow-md mb-6 '>
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-gray-800 text-lg'>Cotizaciones recientes</h2>
          <Link className='text-sm text-blue-600 hover:text-blue-800 cursor-pointer' to={'/quotes'}>
            Ver todas
          </Link>
        </div>
      </div>

      <div className='h-80 overflow-y-auto animate-pulse'>
        <div
          className='p-4 border-b border-1.5 border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors space-y-5'
        >

          <div className='border-b-1 border-gray-200'>
            <div className='flex justify-between items-center mb-6 '>
              <div>
                <div className='h-3 w-10 bg-gray-200 mb-3'> </div>
                <div className='bg-gray-200 h-3 w-30'></div>
              </div>
              <span className=' bg-gray-200 h-5 rounded-full w-25 '></span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full   mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
            <div className='flex gap-4 mb-4'>
              <div className='flex justify-center items-center'>
                <Phone size={14} className='text-gray-500  mr-1' />
                <div className='bg-gray-200 w-20 h-2'></div>
              </div>
              <div className='flex justify-center items-center '>
                <MapPin size={14} className='text-gray-500 mr-1' />
                <div className='bg-gray-200 w-20 h-2'></div>
              </div>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-6'>
              <div>
                <div className='h-3 w-10 bg-gray-200 mb-3'> </div>
                <div className='bg-gray-200 h-3 w-30'></div>
              </div>
              <span className=' bg-gray-200 h-5 rounded-full w-25 '></span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full   mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
            <div className='flex gap-4'>
              <div className='flex justify-center items-center'>
                <Phone size={14} className='text-gray-500  mr-1' />
                <div className='bg-gray-200 w-20 h-2'></div>
              </div>
              <div className='flex justify-center items-center '>
                <MapPin size={14} className='text-gray-500 mr-1' />
                <div className='bg-gray-200 w-20 h-2'></div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

  )

}

export const QuoteItemSkelton = () => {

  return (

    <div className='h-80 overflow-y-auto animate-pulse'>
      <div
        className='p-4 border-b border-1.5 border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors space-y-5'
      >

        <div className='border-b-1 border-gray-200'>
          <div className='flex justify-between items-center mb-6 '>
            <div>
              <div className='h-3 w-10 bg-gray-200 mb-3'> </div>
              <div className='bg-gray-200 h-3 w-30'></div>
            </div>
            <span className=' bg-gray-200 h-5 rounded-full w-25 '></span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full   mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
          <div className='flex gap-4 mb-4'>
            <div className='flex justify-center items-center'>
              <Phone size={14} className='text-gray-500  mr-1' />
              <div className='bg-gray-200 w-20 h-2'></div>
            </div>
            <div className='flex justify-center items-center '>
              <MapPin size={14} className='text-gray-500 mr-1' />
              <div className='bg-gray-200 w-20 h-2'></div>
            </div>
          </div>
        </div>

        <div>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <div className='h-3 w-10 bg-gray-200 mb-3'> </div>
              <div className='bg-gray-200 h-3 w-30'></div>
            </div>
            <span className=' bg-gray-200 h-5 rounded-full w-25 '></span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full   mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
          <div className='flex gap-4'>
            <div className='flex justify-center items-center'>
              <Phone size={14} className='text-gray-500  mr-1' />
              <div className='bg-gray-200 w-20 h-2'></div>
            </div>
            <div className='flex justify-center items-center '>
              <MapPin size={14} className='text-gray-500 mr-1' />
              <div className='bg-gray-200 w-20 h-2'></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


const BadgeStatus = ({ status }: { status: string }) => {





  const bgColor = status === 'PENDING' ? 'bg-yellow-200 text-yellow-70' : status === 'QUOTED' ? 'bg-blue-200 text-blue-70' : 'bg-green-200 text-green-70'

  const badgeStyles = ` 
    px-2 py-1  
     font-semibold 
      rounded-2xl 
      uppercase 
      text-xs 
      ${bgColor}
    `



  return (
    <span className={` ${badgeStyles}  px-2 py-1  font-semibold rounded-2xl uppercase text-xs `}>{status}</span>
  )
}

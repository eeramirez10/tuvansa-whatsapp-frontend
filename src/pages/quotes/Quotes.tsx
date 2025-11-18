import { QuotesTable } from '../../shared/components/tables/QuotesTable'
import { useQuotes } from '../../queries/quotes/quotes-queries'
export const Quotes = () => {
  const { data, isLoading } = useQuotes()



  return (
    <div>

      <div className='flex items-center space-x-2'>

        <button className='px-4 py-2 text-xs font-semibold text-gray-800 border-1 border-gray-300 bg-white rounded-md shadow'>Todas</button>
        <button className='px-4 py-2 text-xs font-semibold text-gray-800 border-1 border-gray-300 bg-white rounded-md shadow'>Pendientes</button>
        <button className='px-4 py-2 text-xs font-semibold text-gray-800 border-1 border-gray-300 bg-white rounded-md shadow'>Aprobadas</button>
      </div>


      <div className=' bg-white mt-6 shadow-md rounded-sm overflow-x-auto'>

        <QuotesTable quotes={data?.items} isLoading={isLoading} />

      </div>


    </div>
  )
}

import { DollarSign } from 'lucide-react'
import type { FC } from 'react'


interface Props {
  description: string
  value?: string
  isLoading:boolean
}

export const StatCard: FC<Props> = ({ description, value, isLoading }) => {

  if(isLoading){

    return <StatCardSkelton />
  }
  

  return (
    <div className='rounded-md  bg-white shadow p-6 '>
      <div className='flex items-center'>
        <div className='bg-blue-100 p-2 rounded-full'>
          <DollarSign className='text-blue-500' />
        </div>
        <div className='ml-4'>
          <p className='text-gray-500 font-medium  text-xs'>{description}</p>

          <div className='font-semibold text-2xl'> {value}</div>
        </div>
      </div>
    </div>
  )
}

export const StatCardSkelton = () => {
  return (
    <div className='rounded-md  bg-white shadow p-6   animate-pulse'>
      <div className='flex items-center'>
        <div className='bg-gray-100 p-5 rounded-full'>
          {/* <DollarSign className='text-blue-500' /> */}
        </div>
        <div className='ml-4'>
          <p className='bg-gray-200 h-2 w-20 mb-2'></p>

          <div className='bg-gray-200 h-5 w-3'></div>
        </div>
      </div>
    </div>
  )
}

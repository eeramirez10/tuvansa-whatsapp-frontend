import type { FC } from "react"
import type { Chat } from "../../../services/chats/types"


export interface Customer {
  name: string,
  last: string
  date: string
  conversation: Array<string>
}



export interface RecentConversation {
  chats?: Chat[]
  isLoading: boolean
  selectedId?: string
  onSelect: (id: string) => void

}

export const RecentConversations: FC<RecentConversation> = ({ chats, isLoading, onSelect, selectedId }) => {



  return (
    <div className='bg-white rounded-md shadow mb-6 h-full'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-gray-800 text-lg'>Conversaciones Recientes</h2>
          <button className='text-sm text-blue-600 hover:text-blue-800'>
            Ver todas
          </button>
        </div>
      </div>

      <div className="h-90 overflow-y-auto  ">

        {
          (isLoading)
            ? <RecentConversationsSkeleton /> : (

              chats?.map((c) => (
                <ConversationItem chat={c} key={c.id} onSelect={onSelect} selectedId={selectedId} />
              ))
            )
        }


      </div>



    </div>
  )
}


interface ConversationItemProps {
  chat: Chat
  onSelect: (id: string) => void
  selectedId?: string
}

const ConversationItem: FC<ConversationItemProps> = ({ chat, onSelect, selectedId }) => {


  return (
    <div className={`p-4 ${selectedId === chat.id ? 'bg-gray-200' : 'hover:bg-gray-50'} border-b-1 border-gray-200  transition-colors duration-150 cursor-pointer`} onClick={() => onSelect(chat?.id)}>

      <div className='flex items-center mb-2'>

        <img className='h-8 w-8 rounded-full bg-cover' src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="image_customer" />

        <div className='ml-3'>
          <h3 className='text-sm font-semibold'> {chat?.customer?.fullName ?? chat?.phone} </h3>
          <p className='text-xs text-gray-600'>{chat?.lastInteraction}</p>
        </div>

      </div>

      <div className='flex items-center justify-between'>
   

          {
            chat?.messages && chat?.messages.length > 0 && <p className='text-sm text-gray-600 line-clamp-1'>{chat?.messages[0].content}</p>
          }

          

          {
            chat?.messages && chat?.messages.length > 0 &&
            <span className='bg-blue-400 rounded-full px-2 py-1 text-white text-xs'> {chat?.messages.length} </span>

          }


    


      </div>


    </div>
  )
}

const RecentConversationsSkeleton = () => {

  return (
    <>
      <ConversationItemSkeleton />
      <ConversationItemSkeleton />
      <ConversationItemSkeleton />

    </>

  )

}

const ConversationItemSkeleton = () => {
  return (
    <div className='p-4  animate-pulse'>

      <div className='flex items-center mb-2'>


        <div className='h-10 w-10 rounded-full bg-gray-400'></div>

        <div className='ml-3 '>
          <div className='h-1.5 w-15 bg-gray-400'>  </div>
          <div className='h-1 w-19 bg-gray-400 mt-2'></div>
        </div>

      </div>

      <div className='flex items-center justify-between'>

        <div className="">
          <div className='h-2 w-110 bg-gray-400 mb-2'></div>

        </div>




        <div className='bg-gray-400 rounded-full p-3 '>  </div>


      </div>


    </div>
  )
}

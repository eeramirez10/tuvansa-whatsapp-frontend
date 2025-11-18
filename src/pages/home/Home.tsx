
import { StatCard } from '../../shared/components/cards/StatCard';
import { RecentsQuotes } from '../../shared/components/cards/RecentsQuotes';
import { RecentConversations, } from '../../shared/components/cards/RecentConversations';
import { useQuotes, useTotalQuotesMonthly, useTotalQuotesToday } from '../../queries/quotes/quotes-queries';
import { useChatsCustomers } from '../../queries/chats/chats-query';
import { ChatPreview } from '../../shared/components/chats/ChatPreview';
import { useMessages } from '../../queries/messages/messages-query';
import { useEffect, useMemo, useState } from 'react';
import type { Chat } from '../../services/chats/types';




export const Home = () => {



  const { data: quotes, isLoading: isLoadingQuotes } = useQuotes()
  const { data: totalQuotes, isLoading } = useTotalQuotesToday()
  const { data: chats, isLoading: isLoadingChats } = useChatsCustomers()
  const { data: quotesMontly, isLoading: isLoadingQuotesMontly } = useTotalQuotesMonthly()

  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>()

  console.log(quotes)



  useEffect(() => {

    if (chats && chats.length > 0 && !selectedThreadId) {

      setSelectedThreadId(chats[0].id)

    }

  }, [chats, selectedThreadId])

  const { data: chat, } = useMessages(selectedThreadId, { pageSize: 20 });

  const reverseChats: Chat | undefined = useMemo(() => {
    if (!chat) return undefined
    return { ...chat, messages: [...(chat.messages ?? [])].reverse() }
  }, [chat])


  return (
    <div>


      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>

        <StatCard isLoading={isLoading} description={'Cotizaciones Hoy'} value={totalQuotes?.toString()} />

        <StatCard isLoading={isLoadingQuotesMontly} description={'Total del mes '} value={quotesMontly?.toString()} />
        {/* <StatCard isLoading={isLoading} description={''} value={''} />
        <StatCard isLoading={isLoading} description={''} value={''} /> */}


      </div>



      <RecentsQuotes isLoading={isLoadingQuotes} quotes={quotes?.items ?? []}  />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>


        <RecentConversations
          chats={chats}
          isLoading={isLoadingChats}
          onSelect={(id) => setSelectedThreadId(id)}
          selectedId={selectedThreadId}
        />



        <ChatPreview chat={reverseChats} />



      </div>




    </div>
  )
}

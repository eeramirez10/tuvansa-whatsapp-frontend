import { useMemo } from 'react'
import { useParams } from 'react-router';
import { useMessages } from '../../queries/messages/messages-query';
import { ChatPreview } from '../../shared/components/chats/ChatPreview';
import { QuotationCard } from '../../shared/components/cards/QuotationCard';
import { useUiBoundStore } from '../../store/ui/useUiBoundStore';
import { useQuote } from '../../hooks/quotes/useQuote';
import { HistoryCard } from '../../components/quotes/HystoryCard';
import { ActionCard } from '../../components/quotes/ActionCard';
import { SummaryCard } from '../../components/quotes/SummaryCard';


export const QuoteDetail = () => {

  const { id } = useParams<{ id?: string }>()

  const { quote } = useQuote({ quoteId: id })

  const { data: chat } = useMessages(quote?.chatThreadId, { pageSize: 100 })

  const isQuoteExpand = useUiBoundStore(state => state.expand)


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
          <ActionCard hasFile={Boolean(quote?.fileKey)} />
          <SummaryCard summary={quote?.summary || ''} />
          <HistoryCard />
        </div>
      </div>
    </div>

  )
}











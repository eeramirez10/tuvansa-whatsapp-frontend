
import { StatCard } from '../../shared/components/cards/StatCard';
import { RecentsQuotes } from '../../shared/components/cards/RecentsQuotes';
import { RecentConversations, } from '../../shared/components/cards/RecentConversations';
import { useQuotes, useTotalQuotesMonthly } from '../../queries/quotes/quotes-queries';
import { useChatsCustomers } from '../../queries/chats/chats-query';
import { ChatPreview } from '../../shared/components/chats/ChatPreview';
import { useMessages } from '../../queries/messages/messages-query';
import { useEffect, useMemo, useState } from 'react';
import type { Chat } from '../../services/chats/types';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../queries/users/users-query';




export const Home = () => {
  const { user } = useAuth()
  const { data: users = [] } = useUsers()
  const isAdmin = `${user?.role ?? ''}`.toUpperCase() === 'ADMIN'
  const userBranchIds = user?.branchOffices?.map((branch) => branch.id) ?? []
  const canLoadBranchData = isAdmin || userBranchIds.length > 0

  const quoteFilters = useMemo(() => {
    return { page: 1, pageSize: 20 }
  }, [])



  const { data: quotes, isLoading: isLoadingQuotes } = useQuotes({
    params: quoteFilters,
    enabled: canLoadBranchData
  })
  const { data: chats, isLoading: isLoadingChats } = useChatsCustomers()
  const { data: quotesMontly, isLoading: isLoadingQuotesMontly } = useTotalQuotesMonthly(
    undefined,
    canLoadBranchData
  )

  const baseStatusParams = useMemo(() => ({}), [])

  const { data: totalNew, isLoading: loadingNew } = useTotalQuotesMonthly(
    { ...baseStatusParams, workflowStatus: 'NEW' },
    canLoadBranchData
  )
  const { data: totalViewed, isLoading: loadingViewed } = useTotalQuotesMonthly(
    { ...baseStatusParams, workflowStatus: 'VIEWED' },
    canLoadBranchData
  )
  const { data: totalInProgress, isLoading: loadingInProgress } = useTotalQuotesMonthly(
    { ...baseStatusParams, workflowStatus: 'IN_PROGRESS' },
    canLoadBranchData
  )
  const { data: totalQuoted, isLoading: loadingQuoted } = useTotalQuotesMonthly(
    { ...baseStatusParams, workflowStatus: 'QUOTED' },
    canLoadBranchData
  )
  const { data: totalRejected, isLoading: loadingRejected } = useTotalQuotesMonthly(
    { ...baseStatusParams, workflowStatus: 'REJECTED' },
    canLoadBranchData
  )

  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>()

  const internalEmployeePhones = useMemo(() => {
    const normalizedPhones = new Set<string>()

    for (const internalUser of users) {
      const digits = `${internalUser.phone ?? ''}`.replace(/\D/g, '')
      if (!digits) continue

      normalizedPhones.add(digits)
      if (digits.length >= 10) {
        normalizedPhones.add(digits.slice(-10))
      }
    }

    return normalizedPhones
  }, [users])

  const visibleChats = useMemo(() => {
    const source = chats ?? []
    if (!source.length || internalEmployeePhones.size === 0) return source

    return source.filter((chatItem) => {
      const chatDigits = `${chatItem.phone ?? ''}`.replace(/\D/g, '')
      if (!chatDigits) return true

      const matchesFull = internalEmployeePhones.has(chatDigits)
      const matchesLast10 = chatDigits.length >= 10 && internalEmployeePhones.has(chatDigits.slice(-10))
      return !matchesFull && !matchesLast10
    })
  }, [chats, internalEmployeePhones])




  useEffect(() => {
    if (!visibleChats.length) {
      setSelectedThreadId(undefined)
      return
    }

    const selectedStillVisible = visibleChats.some((chatItem) => chatItem.id === selectedThreadId)
    if (!selectedStillVisible) {
      setSelectedThreadId(visibleChats[0].id)
    }
  }, [visibleChats, selectedThreadId])

  const { data: chat, } = useMessages(selectedThreadId, { pageSize: 20 });

  const reverseChats: Chat | undefined = useMemo(() => {
    if (!chat) return undefined
    return { ...chat, messages: [...(chat.messages ?? [])].reverse() }
  }, [chat])


  return (
    <div>


      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
        <StatCard isLoading={loadingNew} description={'Nuevas (mes)'} value={totalNew?.toString()} />
        <StatCard isLoading={loadingViewed} description={'Vistas (mes)'} value={totalViewed?.toString()} />
        <StatCard isLoading={loadingInProgress} description={'En progreso (mes)'} value={totalInProgress?.toString()} />
        <StatCard isLoading={loadingQuoted} description={'Cotizadas (mes)'} value={totalQuoted?.toString()} />
        <StatCard isLoading={loadingRejected} description={'Rechazadas (mes)'} value={totalRejected?.toString()} />
        <StatCard isLoading={isLoadingQuotesMontly} description={'Total (mes)'} value={quotesMontly?.toString()} />
      </div>

      {!isAdmin && userBranchIds.length === 0 && (
        <div className='mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
          Tu usuario no tiene sucursal asignada. No se pueden mostrar métricas ni cotizaciones.
        </div>
      )}



      <RecentsQuotes isLoading={isLoadingQuotes} quotes={quotes?.items ?? []}  />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        <RecentConversations
          chats={visibleChats}
          isLoading={isLoadingChats}
          onSelect={(id) => setSelectedThreadId(id)}
          selectedId={selectedThreadId}
        />

        <ChatPreview chat={reverseChats} />
      </div>




    </div>
  )
}

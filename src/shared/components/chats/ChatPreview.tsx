import type { Chat } from '../../../services/chats/types'

interface ChatPreviewProps {
  chat?: Chat
}

const formatMessageDate = (value: Date | string | undefined) => {
  if (!value) return ''

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const normalizeRole = (role?: string) => `${role ?? ''}`.trim().toUpperCase()

const isOutgoingRole = (role?: string) => {
  const normalizedRole = normalizeRole(role)
  return normalizedRole === 'ASSISTANT' || normalizedRole === 'SYSTEM' || normalizedRole === 'AGENT'
}

const getRoleLabel = (role?: string) => {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === 'USER') return 'Cliente'
  if (normalizedRole === 'ASSISTANT') return 'Asistente'
  if (normalizedRole === 'SYSTEM') return 'Sistema'
  if (normalizedRole === 'AGENT') return 'Agente'

  return role || 'Mensaje'
}

export const ChatPreview = ({ chat }: ChatPreviewProps) => {
  if (!chat) {
    return (
      <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Conversación</h2>
            <p className='mt-1 text-sm text-gray-500'>Todavía no hay mensajes para este hilo.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
      <div className='flex flex-col gap-1 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Conversación</h2>
          <p className='mt-1 text-sm font-medium text-gray-800'>{chat.customer?.name || 'Cliente sin nombre'}</p>
          <p className='text-xs text-gray-500'>{chat.phone || 'Sin teléfono'}</p>
        </div>
        <p className='text-xs text-gray-500'>Última interacción: {chat.lastInteraction || 'Sin registro'}</p>
      </div>

      <div className='mt-4 max-h-[540px] space-y-3 overflow-y-auto pr-1'>
        {chat.messages.length > 0 ? (
          chat.messages.map((message) => {
            const outgoing = isOutgoingRole(message.role)

            return (
              <div
                key={message.id}
                className={`flex ${outgoing ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    outgoing
                      ? 'bg-amber-500 text-white'
                      : 'border border-gray-200 bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className='mb-2 flex items-center justify-between gap-3'>
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${outgoing ? 'text-amber-100' : 'text-gray-500'}`}>
                      {getRoleLabel(message.role)}
                    </span>
                    <span className={`text-[11px] ${outgoing ? 'text-amber-100' : 'text-gray-400'}`}>
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                  <p className='whitespace-pre-wrap break-words'>{message.content || 'Sin contenido'}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className='rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500'>
            Este hilo todavía no tiene mensajes.
          </div>
        )}
      </div>
    </section>
  )
}

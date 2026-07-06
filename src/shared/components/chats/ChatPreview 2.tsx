import type { FC } from "react"
import type { Chat } from "../../../services/chats/types"
import { useAutoScrollToBottom } from "../../../hooks/useAutoScrollToBottom"


interface ChatProps {
  chat?: Chat
}

export const ChatPreview: FC<ChatProps> = ({ chat }) => {

  const { containerRef } = useAutoScrollToBottom([chat?.id])

  return (

    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200" >
        <h2 className="text-lg font-semibold text-gray-800">Conversación relacionada</h2>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <img className="w-8 h-8 rounded-full" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Client profile" />
          <div className="ml-3">
            <h3 className="font-medium">{chat?.customer?.fullName}</h3>
            <p className="text-xs text-gray-500">{chat?.lastInteraction}</p>
          </div>
        </div>
        <div ref={containerRef} className="space-y-3 max-h-64 overflow-y-auto">

          {

            chat?.messages?.map((message) => {

              if (message.role === 'assistant') {

                return (

                  <div key={message.id} className="flex justify-end">
                    <div className="bg-green-100 rounded-lg p-3">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      <img className="w-8 h-8 rounded-full object-cover" src="/img/logo-tuvansa.png" alt="AI Agent profile" />
                    </div>
                  </div>

                )
              }

              if (message.role === 'user') {

                return (
                  <div key={message.id} className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <img className="w-8 h-8 rounded-full" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Client profile" />

                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>

                )
              }

            })

          }






        </div>
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex">
            <input type="text" placeholder="Escribe un mensaje..." className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none">
              <i data-feather="send"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

  )
}
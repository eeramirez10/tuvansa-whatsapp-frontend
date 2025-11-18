import type { Message } from "../messages/types"
import type { Customer } from "../quotes/types"

export interface Chat {
  id: string
  status: string
  createdAt: string
  lastInteraction: string
  location: string
  phone:string
  customerId: string
  customer?: Customer
  messages: Message[]
}

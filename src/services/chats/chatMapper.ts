import { dateFormat } from "../../utils/dateFormat";
import { customerMapper } from "../customers/customerMapper";
import type { Message } from "../messages/types";
import type { Chat } from "./types";


export const chatMapper = (json: Record<string, unknown>): Chat => {

  return {
    id: json.id as string,
    status: json.status as string,
    createdAt: dateFormat(json.createdAt as string),
    lastInteraction: dateFormat(json.lastInteraction as string),
    location: json.location as string,
    customerId: json.customerId as string ?? null,
    phone: json.clientPhoneNumber as string,
    customer: json.customer ? customerMapper(json.customer as Record<string, string>) : undefined,
    messages: json.messages as Message[]
  }
}
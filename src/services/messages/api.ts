import { envs } from "../../config/envs";
import { getParams, postFetcher } from "../../utils/fetcher";
import { chatMapper } from "../chats/chatMapper";
import type { Chat } from "../chats/types";



export const getMessagesByThread = async (options: unknown, params?: { [key: string]: unknown; }) => {


  const urlParams = getParams(params ?? {})


  const resp = await postFetcher<Chat>(
    `${envs.URL}/threads/messages${urlParams}`,
    options
  )

  return chatMapper(resp as unknown as Record<string, unknown>)

}





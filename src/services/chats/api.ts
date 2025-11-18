import { envs } from "../../config/envs"
import { fetcher, getParams } from "../../utils/fetcher"
import { chatMapper } from "./chatMapper"
import type { Chat } from "./types"


export const getChats = async (params?: Record<string, unknown>) => {

  try {


    const urlParams = getParams(params ?? {})

    const resp = await fetcher<Chat[]>(
      `${envs.URL}/threads${urlParams}`,

    )

    const mapper = resp.map((r) => chatMapper(r as unknown as Record<string, unknown>))



    return mapper

  } catch (error) {
    console.log(error)
  }


}

import { envs } from "../../config/envs"
import { fetcher, postFetcher } from "../../utils/fetcher"
import { userMapper } from "./auth.mapper"
import type { LoginResponse } from "./types"




export class AuthService {

  static login = async (email: string, password: string) => {



    try {
      const { token, user } = await postFetcher<LoginResponse>(`${envs.URL}/auth/login`, { email, password })

      const newUser = userMapper(user as never)


      return {
        token,
        user: newUser
      }

    } catch (error) {
      if (error instanceof Error) throw new Error(`${error.message}`)
      throw new Error(`Error desconocido`)
    }


  }

  static checkStatus = async () => {
    try {
      const { token, user } = await fetcher<LoginResponse>(`${envs.URL}/auth/renew`)

      return {
        token,
        user: userMapper(user as never)
      }

    } catch (error) {

      if (error instanceof Error) {
        throw new Error(`${error}`)
      }
      console.log(error)

      throw new Error(`Error desconocido`)
    }

  }
}
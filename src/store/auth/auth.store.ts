import { devtools, persist } from "zustand/middleware"
import type { User } from "../../interfaces/user.interface"
import { create, type StateCreator, } from "zustand"
import { AuthService } from "../../services/auth/api"

export type AuthStatus = 'authorized' | 'unauthorized' | 'pending'

export interface AuthState {
  fetching: boolean
  status: AuthStatus
  token?: string
  user?: User

  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkStatus: () => Promise<void>
}


const storeApi: StateCreator<AuthState> = (set) => ({
  fetching: false,
  status: 'pending',
  token: undefined,
  user: undefined,
  login: async (email: string, password: string) => {

    set({ fetching: true })

    await new Promise((resolve) => {

      setTimeout(() => {
        resolve('')
      }, 1000)
    })

    try {
      const { token, user } = await AuthService.login(email, password)

      set({ token, user, status: 'authorized' })

    } catch (error) {

      set({ status: 'unauthorized', token: undefined, user: undefined })

      if (error instanceof Error) {
        throw new Error(`${error.message}`)
      }


    } finally {
      set({ fetching: false })
    }



  },
  checkStatus: async () => {
    try {

      set({ fetching: true })

      const { token, user } = await AuthService.checkStatus()

      set({ token, user, status: 'authorized' })

    } catch (error) {

      console.log(error)
      set({ status: 'unauthorized', token: undefined, user: undefined })

      throw new Error('unauthorized')
    } finally {
      set({ fetching: false })
    }
  },
  logout: () => {
    set({ status: 'unauthorized', token: undefined, user: undefined })
  }
})


export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      storeApi,
      { name: 'auth-storage-wa' }
    )
  )
)
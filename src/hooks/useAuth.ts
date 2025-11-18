import { useState } from "react"
import { useAuthStore } from "../store/auth/auth.store"
import { useNavigate } from "react-router"
import { notify } from "../lib/notifications/toast-sonner"



export const useAuth = () => {

  const [auth, setAuth] = useState<{ email: string, password: string }>({ email: '', password: '' })
  const authStatus = useAuthStore(state => state.status)
  const user = useAuthStore(state => state.user)
  const fetching = useAuthStore(state => state.fetching)
  const authLogin = useAuthStore(state => state.login)
  const logout = useAuthStore(state => state.logout)
  const checkStatus = useAuthStore(state => state.checkStatus)
  const navigate = useNavigate()



  const login = async (email: string, password: string) => {


    notify.promise(authLogin(email, password), {
      loading: 'Validando',
      success: () => {
        navigate('/home')

        return ` Verificacion correcta`
      },
      error: (error: Error) => `${error.message}`
    })

  }


  const handleOnchangeValue = (name: string, value: string) => {
    setAuth(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return {
    auth,
    authStatus,
    user,
    fetching,
    login,
    handleOnchangeValue,
    checkStatus,
    logout
  }

}
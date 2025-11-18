
import { Login } from '../pages/auth/Login'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router'


export const AuthLayout = () => {

  const { authStatus } = useAuth()

  if (authStatus === 'authorized') {
    return <Navigate to='/home' />
  }

  return (
    <Login />
  )
}


import { NavBar } from '../shared/ui/NavBar'
import { Navigate, Outlet } from 'react-router'
import { SideBar } from '../shared/ui/SideBar'

import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export const AppLayout = () => {

  const { authStatus, checkStatus } = useAuth()

  useEffect(() => {
    checkStatus()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])


  if (authStatus === 'unauthorized') {
   
    return <Navigate to='/auth/login' />

  }



  return (

    <div className='flex h-screen overflow-hidden'>
      <SideBar />

      <div className='md:ml-64 flex flex-col flex-1 overflow-hidden'>
        <NavBar />

        <div className='flex-1 overflow-auto p-6'>

          <Outlet />
        </div>
      </div>



    </div>

  )
}

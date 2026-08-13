import { Building2, ChartBarStackedIcon, CircleAlert, ContactRound, FileTextIcon, DollarSign, LucideLayoutDashboard, Power, UserRound, Users } from 'lucide-react'
import { NavLink } from 'react-router'
import { useUiBoundStore } from '../../store/ui/useUiBoundStore'
import { useAuth } from '../../hooks/useAuth'

export const SideBar = () => {
  const open = useUiBoundStore((state) => state.open)
  const setClose = useUiBoundStore((state) => state.setClose)
  const { user, logout } = useAuth()

  const isOpen = open ? 'translate-x-0' : ''

  const navBase = 'flex  p-2 text-sm rounded-lg  items-center hover:bg-gray-100  gap-2'
  const active = 'bg-gray-100 text-gray-900'
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'

  const navClass = ({ isActive }: { isActive: boolean }) => `${navBase} ${isActive ? active : inactive}`

  const normalizedRole = `${user?.role ?? ''}`.toUpperCase()

  const nav = normalizedRole === 'VENDOR'
    ? [
        { name: 'Cotizaciones', to: '/quotes', icon: <DollarSign /> },
        { name: 'Clientes', to: '/customers', icon: <ContactRound /> },
        { name: 'Perfil', to: '/user', icon: <UserRound /> },
      ]
    : [
        { name: 'Dashboard', to: '/home', icon: <LucideLayoutDashboard /> },
        { name: 'Cotizaciones', to: '/quotes', icon: <DollarSign /> },
        { name: 'Clientes', to: '/customers', icon: <ContactRound /> },
        { name: 'Perfil', to: '/user', icon: <UserRound /> },
        { name: 'Reportes', to: '/quote-reports', icon: <ChartBarStackedIcon /> },
        { name: 'Reporte Ejecutivo', to: '/quote-reports/executive', icon: <FileTextIcon /> },
      ]

  if (normalizedRole === 'ADMIN' || normalizedRole === 'SALES_COORDINATOR') {
    nav.splice(3, 0, { name: 'Usuarios', to: '/users', icon: <Users /> })
  }

  if (normalizedRole === 'ADMIN' || normalizedRole === 'SALES_COORDINATOR' || normalizedRole === 'BRANCH_MANAGER') {
    nav.push({ name: 'Sin atender', to: '/quote-reports/unattended', icon: <CircleAlert /> })
  }

  if (normalizedRole === 'ADMIN') {
    nav.splice(4, 0, { name: 'Sucursales', to: '/branchs/new', icon: <Building2 /> })
  }

  return (
    <>
      <aside
        id='default-sidebar'
        className={`app-sidebar fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full md:translate-x-0 ${isOpen}`}
        aria-label='Sidebar'
      >
        <div className=' flex justify-center bg-gradient-to-r  from-yellow-200 to-yellow-500   py-2 px-1'>
          <img className='h-12' src='/img/logo-tuvansa.png' alt='' />
        </div>
        <div className='flex flex-col  h-full overflow-y-auto bg-white relative'>
          <ul className='space-y-3 px-3 py-4 '>
            {nav.map((n) => (
              <li key={n.name} className=''>
                <NavLink onClick={() => setClose()} className={navClass} to={n.to}>
                  <div className='shrink-0 w-5 h-5  transition duration-75 text-gray-900  group-hover:text-gray-900 '>{n.icon}</div>
                  {n.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className='p-4 border-t border-gray-200 absolute bottom-17 w-full'>
            <div className='flex gap-4  justify-center items-center'>
              <img
                className='rounded-full h-10'
                src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                alt=''
              />

              <div>
                <h3 className='text-md font-bold text-gray-700'>
                  {user?.name} {user?.lastname}
                </h3>
                <h3 className='text-sm text-gray-500'></h3>
              </div>

              <div
                onClick={logout}
                className='
                cursor-pointer  
                p-2
                text-gray-500
              hover:bg-amber-300
                hover:rounded-full
              hover:text-white
                transition-all
                ease-in
              '
              >
                <Power className='h-5 w-5 ' />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

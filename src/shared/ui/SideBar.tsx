import { DollarSign, LogOut, LucideLayoutDashboard, MessageSquareTextIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { useUiBoundStore } from '../../store/ui/useUiBoundStore'
import { useAuth } from '../../hooks/useAuth'



export const SideBar = () => {

  const open = useUiBoundStore(state => state.open)
  const setClose = useUiBoundStore(state => state.setClose)
  const { user, logout } = useAuth()



  const isOpen = open ? 'translate-x-0' : '';



  const navBase =
    "flex  p-2 text-sm rounded-lg  items-center hover:bg-gray-100  gap-2";
  const active =
    "bg-gray-100 text-gray-900";
  const inactive =
    "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `${navBase} ${isActive ? active : inactive}`;



  const nav = [
    { name: 'Dashboard', to: '/home', icon: <LucideLayoutDashboard /> },
    { name: 'Cotizaciones', to: '/quotes', icon: <DollarSign /> },
    { name: 'Chats', to: '/', icon: <MessageSquareTextIcon /> }

  ]

  return (


    <>



      <aside id="default-sidebar" className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full md:translate-x-0 ${isOpen}`} aria-label="Sidebar">
        <div className=' flex justify-center bg-gradient-to-r  from-yellow-200 to-yellow-500   py-2 px-1'>

          <img className='h-12' src="/img/logo-tuvansa.png" alt="" />

        </div>
        <div className="flex flex-col  h-full overflow-y-auto bg-white relative">

          <ul className="space-y-3 px-3 py-4 ">

            {
              nav.map((n) => (
                <li key={n.name} className=''>
                  <NavLink onClick={() => setClose()} className={navClass} to={n.to}>
                    {/* <LayoutDashboard className='shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 ' /> */}
                    <div className='shrink-0 w-5 h-5  transition duration-75 text-gray-900  group-hover:text-gray-900 '>{n.icon}</div>
                    {n.name}
                  </NavLink>
                </li>
              ))

            }

            {/* <li>
              <NavLink className={'flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  gap-2'} to='/home'>
                <LayoutDashboard  className='shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 '/>
                DashBoard
              </NavLink>
            </li> */}
          </ul>

          <div className='p-4 border-t border-gray-200 absolute bottom-17 w-full'>

            <div className='flex gap-4 '>
              <img className='rounded-full h-10' src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="" />

              <div>
                <h3 className='text-sm font-medium text-gray-700'>{user?.name} {user?.lastname}</h3>
                {/* <p className='text-sm text-gray-500'>Jefe IT</p> */}
              </div>
            </div>

            <div
              onClick={logout}
              className='mt-5 flex items-center justify-between gap-5 cursor-pointer text-gray-600 hover:text-gray-900' >
              <h3 className=' text-sm'>Cerrar session</h3>
              <LogOut className='h-5 w-5 ' />
            </div>


          </div>


        </div>


      </aside>




    </>
  )


  // return (
  //   <div className=' hidden md:flex md:flex-shrink-0'>

  //     <div className='flex flex-col w-64 border-r border-gray-200 bg-white'>
  //       <div className="flex items-center justify-center h-16 px-4 bg-linear-to-r  from-yellow-200 to-yellow-500 ">
  //         <div className="flex items-center justify-center">
  //           <img className='h-12' src="/img/logo-tuvansa.png" alt="logo tuvansa" />
  //           {/* <i data-feather="message-square" className="text-white mr-2"></i>
  //           <span className="text-xl font-bold text-white">QuoteBot</span> */}
  //         </div>
  //       </div>

  //       <div className='flex flex-col flex-grow pt-5 pb-4 overflow-y-auto'>
  //         <nav className='flex-1  px-2 space-y-1'>
  //           {
  //             nav.map((n) => (
  //               <NavLink to={n.to!} className={navClass}>
  //                 {n.icon}
  //                 {n.name}
  //               </NavLink>
  //             ))
  //           }
  //         </nav>
  //       </div>

  //       <div className="p-4 border-t border-gray-200">
  //         <div className="flex items-center">
  //           <img className="w-10 h-10 rounded-full" src="http://static.photos/people/200x200/1" alt="User profile" />
  //             <div className="ml-3">
  //               <p className="text-sm font-medium text-gray-700">Erick Ramirez</p>
  //               <p className="text-sm text-gray-500">Jefe IT</p>
  //             </div>
  //         </div>
  //       </div>

  //     </div>


  //   </div>
  // )
}

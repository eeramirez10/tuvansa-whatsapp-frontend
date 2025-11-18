
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner';
import './index.css'

import { RouterProvider } from 'react-router'
import { router } from './config/router.ts'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './config/query-client.ts'

createRoot(document.getElementById('root')!).render(

  <QueryClientProvider client={queryClient}>

    <RouterProvider router={router} />
    <Toaster position='bottom-center' richColors theme='light' />
  </QueryClientProvider>


)

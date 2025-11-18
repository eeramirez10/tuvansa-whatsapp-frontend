import { createBrowserRouter, redirect, } from 'react-router';
import { Home } from "../pages/home/Home";
import { Quotes } from "../pages/quotes/Quotes";
import { AppLayout } from "../layouts/AppLayout";
import { QuoteDetail } from "../pages/quote/QuoteDetail";
import { Login } from "../pages/auth/Login";
import { AuthLayout } from "../layouts/AuthLayout";


export const router = createBrowserRouter([

  {
    path: '/',

    Component: AppLayout,
    children: [

      {
        index: true,
        path: 'home',
        Component: Home,
        handle: {
          title: "Dashboard"
        }
      },
      {
        path: '/quotes',
        Component: Quotes,
        handle: {
          title: "Cotizaciones"
        }
      },
      {
        path: '/quotes/:id',
        Component: QuoteDetail,
        handle: {
          title: 'Detalle de Cotizacion'
        }
      }
    ]
  },
  {
    path: '/auth',
    Component: AuthLayout,
    children: [
      {
        index: true,
        path: 'login',
        Component: Login
      }
    ]
  },

  {
    path: "*",
    loader: () => redirect("/dashboard"),
  },


])
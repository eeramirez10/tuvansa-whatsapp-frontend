import { createBrowserRouter, redirect, } from 'react-router';
import { Home } from "../pages/home/Home";
import { Quotes } from "../pages/quotes/Quotes";
import { AppLayout } from "../layouts/AppLayout";
import { QuoteWorkflowDetail } from "../pages/quote/QuoteWorkflowDetail";
import { Login } from "../pages/auth/Login";
import { AuthLayout } from "../layouts/AuthLayout";
import { UserProfile } from "../pages/user/UserProfile";
import { UsersList } from "../pages/user/UsersList";
import { UserCreate } from "../pages/user/UserCreate";
import { BranchCreate } from "../pages/branch/BranchCreate";
import { QuotesReports } from '../pages/reports/QuotesReports';
import { QuotesExecutivePrintableReport } from '../pages/reports/QuotesExecutivePrintableReport';
import { Customers } from '../pages/customers/Customers';
import { CustomerDetail } from '../pages/customers/CustomerDetail';
import { QuotesUnattendedReport } from '../pages/reports/QuotesUnattendedReport';

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
        path: '/quotes/workflow/:id',
        Component: QuoteWorkflowDetail,
        handle: {
          title: 'Detalle de Cotización'
        }
      },
      {
        path: '/customers',
        Component: Customers,
        handle: {
          title: 'Clientes'
        }
      },
      {
        path: '/customers/:id',
        Component: CustomerDetail,
        handle: {
          title: 'Detalle del cliente'
        }
      },
      {
        path: '/users',
        Component: UsersList,
        handle: {
          title: 'Usuarios'
        }
      },
      {
        path: '/users/new',
        Component: UserCreate,
        handle: {
          title: 'Nuevo usuario'
        }
      },
      {
        path: '/branchs/new',
        Component: BranchCreate,
        handle: {
          title: 'Sucursales'
        }
      },
      {
        path: '/user',
        Component: UserProfile,
        handle: {
          title: 'Perfil de usuario'
        }
      },
      {
        path: '/quote-reports',
        Component: QuotesReports,
        handle: {
          title: 'Reporte de cotizaciones'
        }
      },
      {
        path: '/quote-reports/executive',
        Component: QuotesExecutivePrintableReport,
        handle: {
          title: 'Reporte ejecutivo imprimible'
        }
      },
      {
        path: '/quote-reports/unattended',
        Component: QuotesUnattendedReport,
        handle: {
          title: 'Cotizaciones sin atender'
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

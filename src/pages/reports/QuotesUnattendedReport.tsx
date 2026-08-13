import {
  AlertTriangle,
  Building2,
  Clock3,
  ExternalLink,
  Printer,
  RefreshCw,
  UserRound
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useQuotesUnattendedReport } from '../../queries/reports/reports-queries'
import { useBranchOptions } from '../../queries/users/users-query'
import type {
  QuotesUnattendedBranchRow,
  QuotesUnattendedQuote
} from '../../services/reports/types'

const formatNumber = (value: number) => new Intl.NumberFormat('es-MX').format(value)

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatAge = (hours: number) => {
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours ? `${days} d ${remainingHours} h` : `${days} d`
}

const getAgeStyle = (hours: number) => {
  if (hours >= 168) return 'bg-red-100 text-red-800'
  if (hours >= 72) return 'bg-orange-100 text-orange-800'
  if (hours >= 24) return 'bg-amber-100 text-amber-800'
  return 'bg-gray-100 text-gray-700'
}

export const QuotesUnattendedReport = () => {
  const { user } = useAuth()
  const [branchId, setBranchId] = useState('')
  const normalizedRole = `${user?.role ?? ''}`.toUpperCase()
  const { data: allBranches = [] } = useBranchOptions()

  const branchOptions = useMemo(() => {
    if (normalizedRole === 'ADMIN') return allBranches

    const allowedIds = new Set((user?.branchOffices ?? []).map((branch) => branch.id))
    return allBranches.filter((branch) => allowedIds.has(branch.id))
  }, [allBranches, normalizedRole, user?.branchOffices])

  const { data, isLoading, isFetching, error, refetch } = useQuotesUnattendedReport({
    branchId: branchId || undefined
  })
  const selectedBranchName = branchOptions.find((branch) => branch.id === branchId)?.name

  useEffect(() => {
    document.body.classList.add('print-report-unattended')
    return () => document.body.classList.remove('print-report-unattended')
  }, [])

  return (
    <div className='report-unattended-page space-y-6'>
      <header className='flex flex-col gap-4 border-b border-gray-200 pb-5 print:hidden lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <div className='mb-2 flex items-center gap-2 text-sm font-semibold text-red-700'>
            <AlertTriangle className='h-4 w-4' />
            Seguimiento operativo
          </div>
          <h1 className='text-2xl font-bold text-gray-900'>Cotizaciones sin atender</h1>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'>
            Solicitudes que continúan como nuevas y todavía no han sido iniciadas por la sucursal.
          </p>
        </div>

        <div className='flex w-full flex-col gap-3 sm:flex-row lg:w-auto'>
          <label className='text-xs font-semibold text-gray-600'>
            Sucursal
            <select
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              className='mt-1 block h-10 min-w-64 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
            >
              <option value=''>Todas las sucursales permitidas</option>
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </label>

          <button
            type='button'
            onClick={() => void refetch()}
            disabled={isFetching}
            className='mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <button
            type='button'
            onClick={() => window.print()}
            disabled={isLoading || Boolean(error)}
            className='mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gray-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <Printer className='h-4 w-4' />
            Imprimir PDF
          </button>
        </div>
      </header>

      <header className='report-unattended-print-header hidden items-start justify-between border-b-2 border-gray-900 pb-3 print:flex'>
        <div className='flex items-center gap-4'>
          <img src='/img/logo-tuvansa.png' alt='Tuvansa' className='h-12 w-auto object-contain' />
          <div>
            <h1 className='text-xl font-bold text-gray-950'>Reporte de cotizaciones sin atender</h1>
            <p className='mt-0.5 text-xs text-gray-600'>Solicitudes con estado NEW que aún no han sido iniciadas.</p>
          </div>
        </div>
        <div className='text-right text-xs text-gray-600'>
          <p><span className='font-semibold text-gray-900'>Sucursal:</span> {selectedBranchName ?? 'Todas las permitidas'}</p>
          <p className='mt-1'><span className='font-semibold text-gray-900'>Generado:</span> {formatDate(data?.generatedAt ?? new Date().toISOString())}</p>
        </div>
      </header>

      {error ? (
        <div className='rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error instanceof Error ? error.message : 'No se pudo cargar el reporte'}
        </div>
      ) : null}

      <section className='report-unattended-kpis grid gap-4 sm:grid-cols-2 xl:grid-cols-5 print:grid-cols-5 print:gap-2'>
        <Kpi title='Nuevas sin atender' value={data?.kpis.totalNew} tone='amber' loading={isLoading} />
        <Kpi title='Sucursales con rezago' value={data?.kpis.branchesWithNew} tone='gray' loading={isLoading} />
        <Kpi title='Más de 24 horas' value={data?.kpis.olderThan24Hours} tone='amber' loading={isLoading} />
        <Kpi title='Más de 72 horas' value={data?.kpis.olderThan72Hours} tone='red' loading={isLoading} />
        <Kpi
          title='Mayor antigüedad'
          value={data ? formatAge(data.kpis.oldestAgeHours) : undefined}
          tone='red'
          loading={isLoading}
        />
      </section>

      <section className='report-unattended-summary overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='flex flex-col gap-1 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='font-semibold text-gray-900'>Rezago por sucursal</h2>
            <p className='mt-0.5 text-xs text-gray-500'>Ordenado por la solicitud con mayor antigüedad.</p>
          </div>
          {data?.generatedAt ? (
            <span className='text-xs text-gray-500'>Actualizado {formatDate(data.generatedAt)}</span>
          ) : null}
        </div>

        <div className='overflow-x-auto'>
          <table className='report-unattended-table min-w-[900px] w-full text-left text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase text-gray-500'>
              <tr>
                <th className='px-5 py-3'>Sucursal</th>
                <th className='px-5 py-3'>Responsable</th>
                <th className='px-5 py-3 text-right'>Total nuevas</th>
                <th className='px-5 py-3 text-right'>Menos de 24 h</th>
                <th className='px-5 py-3 text-right'>24 a 72 h</th>
                <th className='px-5 py-3 text-right'>3 a 7 días</th>
                <th className='px-5 py-3 text-right'>Más de 7 días</th>
                <th className='px-5 py-3 text-right'>Más antigua</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {(data?.branches ?? []).map((branch) => (
                <BranchSummaryRow key={branch.branchId ?? branch.branchName} branch={branch} />
              ))}
              {!isLoading && (data?.branches.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={8} className='px-5 py-10 text-center text-gray-500'>
                    No hay cotizaciones nuevas sin atender en las sucursales seleccionadas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {(data?.branches ?? []).map((branch) => (
        <BranchQuoteDetail key={`detail-${branch.branchId ?? branch.branchName}`} branch={branch} />
      ))}
    </div>
  )
}

interface KpiProps {
  title: string
  value?: number | string
  tone: 'gray' | 'amber' | 'red'
  loading: boolean
}

const Kpi = ({ title, value, tone, loading }: KpiProps) => {
  const styles = {
    gray: 'border-gray-200 bg-white text-gray-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
    red: 'border-red-200 bg-red-50 text-red-950'
  }

  return (
    <div className={`rounded-lg border p-5 shadow-sm ${styles[tone]}`}>
      <p className='text-xs font-semibold uppercase text-gray-600'>{title}</p>
      <p className='mt-2 text-2xl font-bold'>{loading ? '...' : typeof value === 'number' ? formatNumber(value) : value ?? '0'}</p>
    </div>
  )
}

const BranchSummaryRow = ({ branch }: { branch: QuotesUnattendedBranchRow }) => {
  const managerName = branch.manager
    ? `${branch.manager.name} ${branch.manager.lastname}`.trim()
    : 'Sin gerente asignado'
  const rowStyle = branch.over7Days > 0
    ? 'bg-red-50/60'
    : branch.from3To7Days > 0
      ? 'bg-orange-50/50'
      : ''

  return (
    <tr className={rowStyle}>
      <td className='px-5 py-4 font-semibold text-gray-900'>{branch.branchName}</td>
      <td className='px-5 py-4 text-gray-600'>{managerName}</td>
      <td className='px-5 py-4 text-right font-bold text-gray-900'>{formatNumber(branch.totalNew)}</td>
      <td className='px-5 py-4 text-right text-gray-600'>{formatNumber(branch.under24Hours)}</td>
      <td className='px-5 py-4 text-right font-semibold text-amber-700'>{formatNumber(branch.from24To72Hours)}</td>
      <td className='px-5 py-4 text-right font-semibold text-orange-700'>{formatNumber(branch.from3To7Days)}</td>
      <td className='px-5 py-4 text-right font-bold text-red-700'>{formatNumber(branch.over7Days)}</td>
      <td className='px-5 py-4 text-right'>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAgeStyle(branch.oldestAgeHours)}`}>
          {formatAge(branch.oldestAgeHours)}
        </span>
      </td>
    </tr>
  )
}

const BranchQuoteDetail = ({ branch }: { branch: QuotesUnattendedBranchRow }) => {
  return (
    <section className='report-unattended-branch overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='flex flex-col gap-3 border-b border-gray-200 px-5 py-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='flex items-center gap-2 font-semibold text-gray-900'>
            <Building2 className='h-4 w-4 text-gray-500' />
            {branch.branchName}
          </h2>
          <p className='mt-1 flex items-center gap-1.5 text-xs text-gray-500'>
            <UserRound className='h-3.5 w-3.5' />
            {branch.manager
              ? `${branch.manager.name} ${branch.manager.lastname} · ${branch.manager.email}`
              : 'Sin gerente asignado'}
          </p>
        </div>
        <span className='self-start rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 md:self-auto'>
          {formatNumber(branch.totalNew)} pendientes
        </span>
      </div>

      <div className='overflow-x-auto'>
        <table className='report-unattended-table min-w-[850px] w-full text-left text-sm'>
          <thead className='bg-gray-50 text-xs font-semibold uppercase text-gray-500'>
            <tr>
              <th className='px-5 py-3'>Cotización</th>
              <th className='px-5 py-3'>Cliente</th>
              <th className='px-5 py-3'>Empresa</th>
              <th className='px-5 py-3'>Recibida</th>
              <th className='px-5 py-3'>Sin atender</th>
              <th className='px-5 py-3 text-right'>Detalle</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {branch.quotes.map((quote) => <QuoteRow key={quote.id} quote={quote} />)}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const QuoteRow = ({ quote }: { quote: QuotesUnattendedQuote }) => {
  const customerName = `${quote.customer.name} ${quote.customer.lastname}`.trim()

  return (
    <tr className={quote.ageHours >= 168 ? 'bg-red-50/50' : quote.ageHours >= 72 ? 'bg-orange-50/40' : ''}>
      <td className='whitespace-nowrap px-5 py-4 font-semibold text-gray-900'>COT-{quote.quoteNumber}</td>
      <td className='px-5 py-4'>
        <p className='font-medium text-gray-800'>{customerName || 'Cliente sin nombre'}</p>
        <p className='mt-0.5 text-xs text-gray-500'>{quote.customer.email || quote.customer.phone}</p>
      </td>
      <td className='px-5 py-4 text-gray-600'>{quote.customer.company || 'Sin empresa'}</td>
      <td className='whitespace-nowrap px-5 py-4 text-gray-600'>{formatDate(quote.createdAt)}</td>
      <td className='px-5 py-4'>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getAgeStyle(quote.ageHours)}`}>
          <Clock3 className='h-3.5 w-3.5' />
          {formatAge(quote.ageHours)}
        </span>
      </td>
      <td className='px-5 py-4 text-right'>
        <Link
          to={`/quotes/workflow/${quote.id}`}
          className='inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          title='Abrir cotización'
          aria-label={`Abrir cotización COT-${quote.quoteNumber}`}
        >
          <ExternalLink className='h-4 w-4' />
        </Link>
      </td>
    </tr>
  )
}

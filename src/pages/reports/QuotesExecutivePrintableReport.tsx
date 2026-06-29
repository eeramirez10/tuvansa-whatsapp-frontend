import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  useQuotesByBranchReport,
  useQuotesByBranchStatusReport,
  useQuotesExecutivePrintableReport
} from '../../queries/reports/reports-queries'
import type { QuoteWorkflowStatus } from '../../services/reports/types'
import { Card } from '../../shared/components/cards/Card'

const INCLUDED_STATUSES: QuoteWorkflowStatus[] = [
  'NEW',
  'VIEWED',
  'IN_PROGRESS',
  'QUOTED',
  'REJECTED',
  'INVOICED'
]

const STATUS_LABELS: Record<QuoteWorkflowStatus, string> = {
  NEW: 'Nuevas',
  VIEWED: 'Vistas',
  DOWNLOADED: 'Descargadas',
  IN_PROGRESS: 'En progreso',
  QUOTED: 'Cotizadas',
  REJECTED: 'Rechazadas',
  INVOICED: 'Facturadas'
}

const formatNumber = (value: number) => new Intl.NumberFormat('es-MX').format(value)
const formatPercent = (value: number) => `${value.toFixed(2)}%`

export const QuotesExecutivePrintableReport = () => {
  const [yearInput, setYearInput] = useState(String(dayjs().year()))
  const [branchIdInput, setBranchIdInput] = useState('')

  useEffect(() => {
    document.body.classList.add('print-report-executive')
    return () => {
      document.body.classList.remove('print-report-executive')
    }
  }, [])

  const year = useMemo(() => {
    const parsed = Number(yearInput)
    return Number.isInteger(parsed) ? parsed : dayjs().year()
  }, [yearInput])

  const dateRange = useMemo(() => {
    return {
      startDate: `01-01-${year}`,
      endDate: `31-12-${year}`,
      branchId: branchIdInput.trim() || undefined
    }
  }, [year, branchIdInput])

  const { data: byBranch, isLoading: loadingByBranch } = useQuotesByBranchReport(dateRange)
  const { data: byBranchStatus, isLoading: loadingByBranchStatus } = useQuotesByBranchStatusReport(dateRange)
  const { data: executive, isLoading: loadingExecutive } = useQuotesExecutivePrintableReport({
    year,
    branchId: branchIdInput.trim() || undefined
  })

  const isLoading = loadingByBranch || loadingByBranchStatus || loadingExecutive

  const branchRows = useMemo(() => {
    const items = byBranchStatus?.items ?? []

    return items.map((item) => {
      const attended = item.statuses.VIEWED + item.statuses.IN_PROGRESS + item.statuses.QUOTED + item.statuses.REJECTED + item.statuses.INVOICED
      const attentionRate = item.totalQuotes > 0 ? Number(((attended / item.totalQuotes) * 100).toFixed(2)) : 0
      const backlog = item.statuses.NEW + item.statuses.IN_PROGRESS



      return {
        branchId: item.branchId,
        branchName: item.branchName,
        totalQuotes: item.totalQuotes,
        attended,
        attentionRate,
        backlog,
        NEW: item.statuses.NEW,
        VIEWED: item.statuses.VIEWED,
        IN_PROGRESS: item.statuses.IN_PROGRESS,
        QUOTED: item.statuses.QUOTED,
        REJECTED: item.statuses.REJECTED,
        INVOICED: item.statuses.INVOICED
      }
    }).filter((itemm) => itemm.branchId)
  }, [byBranchStatus])

  const kpis = useMemo(() => {
    const totalQuotes = byBranch?.total ?? 0
    const attended = branchRows.reduce((sum, item) => sum + item.attended, 0)
    const quoted = branchRows.reduce((sum, item) => sum + item.QUOTED, 0)
    const rejected = branchRows.reduce((sum, item) => sum + item.REJECTED, 0)
    const inProgress = branchRows.reduce((sum, item) => sum + item.IN_PROGRESS, 0)
    const invoiced = branchRows.reduce((sum, item) => sum + item.INVOICED, 0)
    const attentionRate = totalQuotes > 0 ? Number(((attended / totalQuotes) * 100).toFixed(2)) : 0

    return {
      totalQuotes,
      attended,
      quoted,
      rejected,
      inProgress,
      invoiced,
      attentionRate
    }
  }, [byBranch, branchRows])

  const highlights = useMemo(() => {
    if (branchRows.length === 0) {
      return {
        maxTotal: 0,
        bestAttention: 0,
        worstAttention: 0,
        maxRejected: 0,
        maxBacklog: 0
      }
    }

    return {
      maxTotal: Math.max(...branchRows.map((item) => item.totalQuotes)),
      bestAttention: Math.max(...branchRows.map((item) => item.attentionRate)),
      worstAttention: Math.min(...branchRows.map((item) => item.attentionRate)),
      maxRejected: Math.max(...branchRows.map((item) => item.REJECTED)),
      maxBacklog: Math.max(...branchRows.map((item) => item.backlog))
    }
  }, [branchRows])

  const branchChartData = useMemo(() => {
    return (byBranch?.items ?? []).map((item) => ({
      branchName: item.branchName,
      totalQuotes: item.totalQuotes
    }))
  }, [byBranch])

  const generatedAtLabel = executive?.generatedAt
    ? dayjs(executive.generatedAt).format('DD/MM/YYYY HH:mm')
    : dayjs().format('DD/MM/YYYY HH:mm')

  return (
    <div className='report-print-page space-y-6 print:space-y-4'>
      <header className='flex flex-col gap-4 print:hidden md:flex-row md:items-end md:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>Reporte ejecutivo de cotizaciones</h1>
          <p className='mt-1 text-sm text-gray-500'>Formato para impresión: estadísticas por sucursal y atención de solicitudes.</p>
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <label className='text-sm font-medium text-gray-700'>
            Año
            <input
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              placeholder='2026'
              className='mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-500'
            />
          </label>

          <label className='text-sm font-medium text-gray-700 sm:col-span-2'>
            Sucursal (UUID opcional)
            <input
              value={branchIdInput}
              onChange={(event) => setBranchIdInput(event.target.value)}
              placeholder='Filtra por sucursal'
              className='mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-500'
            />
          </label>
        </div>
      </header>

      <div className='report-print-card rounded-lg border border-slate-200 bg-white p-4 print:border-0 print:p-0'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>Resumen Ejecutivo {year}</h2>
            <p className='text-xs text-gray-600'>Generado: {generatedAtLabel}</p>
          </div>
          <button
            type='button'
            onClick={() => window.print()}
            className='rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 print:hidden'
          >
            Imprimir
          </button>
        </div>
      </div>

      <section className='report-print-card grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 print:grid-cols-3'>
        <KpiCard label='Solicitudes' value={kpis.totalQuotes} color='text-slate-900' loading={isLoading} />
        <KpiCard label='Atendidas' value={kpis.attended} color='text-blue-700' loading={isLoading} />
        <KpiCard label='Tasa atención' value={kpis.attentionRate} suffix='%' color='text-blue-700' loading={isLoading} />
        <KpiCard label='Cotizadas' value={kpis.quoted} color='text-emerald-700' loading={isLoading} />
        <KpiCard label='En progreso' value={kpis.inProgress} color='text-amber-700' loading={isLoading} />
        <KpiCard label='Rechazadas' value={kpis.rejected} color='text-rose-700' loading={isLoading} />
      </section>

      <Card className='report-print-card p-5 print:p-0 print:shadow-none print:border-0'>
        <h3 className='text-base font-semibold text-gray-900'>Total de cotizaciones por sucursal</h3>
        <p className='text-sm text-gray-500'>Única gráfica para visual rápido de volumen.</p>

        <div className='mt-4 h-80 print:h-[340px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={branchChartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis dataKey='branchName' tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor='end' height={64} />
              <YAxis tickFormatter={(value) => formatNumber(Number(value))} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatNumber(Number(value))} />
              <Bar dataKey='totalQuotes' fill='#1f2937' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className='report-print-card p-5 print:p-0 print:shadow-none print:border-0'>
        <h3 className='text-base font-semibold text-gray-900'>Estadísticas por sucursal</h3>


        <div className='mt-4 overflow-x-auto'>
          <table className='w-full min-w-[1280px] text-left text-sm'>
            <thead>
              <tr className='border-b border-gray-200 text-xs font-semibold uppercase text-gray-500'>
                <th className='py-3 pr-4'>Sucursal</th>
                <th className='py-3 pr-4 text-right'>Solicitudes</th>
                <th className='py-3 pr-4 text-right'>Atendidas</th>
                <th className='py-3 pr-4 text-right'>Tasa %</th>
                {INCLUDED_STATUSES.map((status) => (
                  <th key={status} className='py-3 pr-4 text-right'>{STATUS_LABELS[status]}</th>
                ))}
                <th className='py-3 pr-4 text-right'>Rezago</th>
              </tr>
            </thead>
            <tbody>
              {branchRows.sort((a, b) => b.totalQuotes - a.totalQuotes).map((row) => (
                <tr key={row.branchId ?? row.branchName} className='border-b border-gray-100'>
                  <td className='py-3 pr-4 font-medium text-gray-900'>{row.branchName}</td>
                  <td className={`py-3 pr-4 text-right ${row.totalQuotes === highlights.maxTotal && row.totalQuotes > 0 ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-gray-700'}`}>
                    {formatNumber(row.totalQuotes)}
                  </td>
                  <td className='py-3 pr-4 text-right text-gray-700'>{formatNumber(row.attended)}</td>
                  <td className={`py-3 pr-4 text-right ${row.attentionRate === highlights.bestAttention && row.attentionRate > 0 ? 'bg-blue-50 font-semibold text-blue-700' : row.attentionRate === highlights.worstAttention ? 'bg-rose-50 font-semibold text-rose-700' : 'text-gray-700'}`}>
                    {formatPercent(row.attentionRate)}
                  </td>
                  <td className='py-3 pr-4 text-right text-gray-700'>{formatNumber(row.NEW)}</td>
                  <td className='py-3 pr-4 text-right text-gray-700'>{formatNumber(row.VIEWED)}</td>
                  <td className='py-3 pr-4 text-right text-gray-700'>{formatNumber(row.IN_PROGRESS)}</td>
                  <td className='py-3 pr-4 text-right text-gray-700'>{formatNumber(row.QUOTED)}</td>
                  <td className={`py-3 pr-4 text-right ${row.REJECTED === highlights.maxRejected && row.REJECTED > 0 ? 'bg-rose-50 font-semibold text-rose-700' : 'text-gray-700'}`}>
                    {formatNumber(row.REJECTED)}
                  </td>
                  <td className='py-3 pr-4 text-right text-gray-700'>{formatNumber(row.INVOICED)}</td>
                  <td className={`py-3 pr-4 text-right ${row.backlog === highlights.maxBacklog && row.backlog > 0 ? 'bg-amber-50 font-semibold text-amber-700' : 'text-gray-700'}`}>
                    {formatNumber(row.backlog)}
                  </td>
                </tr>
              ))}

              {!isLoading && branchRows.length === 0 && (
                <tr>
                  <td className='py-6 text-center text-gray-500' colSpan={11}>
                    No hay datos para el año/sucursal seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className='report-print-card p-5 print:p-0 print:shadow-none print:border-0'>
        <h3 className='text-base font-semibold text-gray-900'>Rechazadas por tipo</h3>

        <div className='mt-4 overflow-x-auto'>
          <table className='w-full min-w-[640px] text-left text-sm'>
            <thead>
              <tr className='border-b border-gray-200 text-xs font-semibold uppercase text-gray-500'>
                <th className='py-3 pr-4'>Tipo de rechazo</th>
                <th className='py-3 pr-4 text-right'>Cantidad</th>
                <th className='py-3 pr-4 text-right'>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {(executive?.rejectedByType ?? []).map((row) => (
                <tr key={row.type} className='border-b border-gray-100'>
                  <td className='py-3 pr-4 font-medium text-gray-900'>{row.type}</td>
                  <td className='py-3 pr-4 text-right text-gray-700'>{formatNumber(row.count)}</td>
                  <td className='py-3 pr-4 text-right text-gray-700'>{formatPercent(row.percentage)}</td>
                </tr>
              ))}

              {!isLoading && (executive?.rejectedByType?.length ?? 0) === 0 && (
                <tr>
                  <td className='py-6 text-center text-gray-500' colSpan={3}>
                    No hay rechazos registrados para el periodo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

interface KpiCardProps {
  label: string
  value: number
  loading: boolean
  color?: string
  suffix?: string
}

const KpiCard = ({ label, value, loading, color = 'text-gray-900', suffix }: KpiCardProps) => {
  const shown = suffix ? `${value.toFixed(2)}${suffix}` : formatNumber(value)

  return (
    <Card className='report-print-card p-5 print:p-4 print:shadow-none'>
      <p className='text-sm text-gray-500'>{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{loading ? '...' : shown}</p>
    </Card>
  )
}

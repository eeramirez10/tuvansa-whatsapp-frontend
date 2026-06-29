import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  useQuotesByBranchReport,
  useQuotesByBranchStatusReport
} from '../../queries/reports/reports-queries'
import type { QuoteWorkflowStatus, QuotesReportFilters } from '../../services/reports/types'
import { Card } from '../../shared/components/cards/Card'

const STATUS_LABELS: Record<QuoteWorkflowStatus, string> = {
  NEW: 'Nuevas',
  VIEWED: 'Vistas',
  DOWNLOADED: 'Descargadas',
  IN_PROGRESS: 'En progreso',
  QUOTED: 'Cotizadas',
  REJECTED: 'Rechazadas',
  INVOICED: 'Facturadas'
}

const STATUS_KEYS: QuoteWorkflowStatus[] = [
  'NEW',
  'VIEWED',
  'DOWNLOADED',
  'IN_PROGRESS',
  'QUOTED',
  'REJECTED',
  'INVOICED'
]

const STATUS_COLORS: Record<QuoteWorkflowStatus, string> = {
  NEW: '#64748b',
  VIEWED: '#2563eb',
  DOWNLOADED: '#0891b2',
  IN_PROGRESS: '#d97706',
  QUOTED: '#059669',
  REJECTED: '#dc2626',
  INVOICED: '#7c3aed'
}

const formatNumber = (value: number) => new Intl.NumberFormat('es-MX').format(value)

export const QuotesReports = () => {
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('DD-MM-YYYY'))
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('DD-MM-YYYY'))

  const filters = useMemo<QuotesReportFilters>(() => ({ startDate, endDate }), [startDate, endDate])

  const { data: byBranch, isLoading: loadingBranch } = useQuotesByBranchReport(filters)

  const { data: byBranchStatus, isLoading: loadingBranchStatus } = useQuotesByBranchStatusReport({
    startDate,
    endDate
  })

  const isLoading = loadingBranch || loadingBranchStatus

  const statusTotals = useMemo(() => {
    const totals = STATUS_KEYS.reduce((acc, status) => {
      acc[status] = 0
      return acc
    }, {} as Record<QuoteWorkflowStatus, number>)

    for (const branch of byBranchStatus?.items ?? []) {
      for (const status of STATUS_KEYS) {
        totals[status] += branch.statuses[status] ?? 0
      }
    }

    return totals
  }, [byBranchStatus])

  const totalQuotes = byBranch?.total ?? 0

  const branchChartData = useMemo(
    () =>
      (byBranch?.items ?? []).map((item) => ({
        branchName: item.branchName,
        totalQuotes: item.totalQuotes
      })),
    [byBranch]
  )

  const branchStatusChartData = useMemo(
    () =>
      (byBranchStatus?.items ?? []).map((item) => ({
        branchName: item.branchName,
        NEW: item.statuses.NEW,
        VIEWED: item.statuses.VIEWED,
        DOWNLOADED: item.statuses.DOWNLOADED,
        IN_PROGRESS: item.statuses.IN_PROGRESS,
        QUOTED: item.statuses.QUOTED,
        REJECTED: item.statuses.REJECTED,
        INVOICED: item.statuses.INVOICED
      })),
    [byBranchStatus]
  )

  const donutData = useMemo(
    () =>
      STATUS_KEYS.map((status) => ({
        name: STATUS_LABELS[status],
        value: statusTotals[status],
        key: status
      })),
    [statusTotals]
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reporte de cotizaciones</h1>
          <p className="mt-1 text-sm text-gray-500">Cotizaciones por sucursal y estado del workflow.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Fecha inicio
            <input
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              placeholder="DD-MM-YYYY"
              className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-500"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Fecha fin
            <input
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              placeholder="DD-MM-YYYY"
              className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-500"
            />
          </label>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Total" value={totalQuotes} loading={isLoading} />
        <KpiCard title="Cotizadas" value={statusTotals.QUOTED} loading={isLoading} />
        <KpiCard title="En progreso" value={statusTotals.IN_PROGRESS} loading={isLoading} />
        <KpiCard title="Rechazadas" value={statusTotals.REJECTED} loading={isLoading} />
        <KpiCard title="Facturadas" value={statusTotals.INVOICED} loading={isLoading} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Cotizaciones por sucursal</h2>
          <p className="mt-1 text-sm text-gray-500">Total de solicitudes agrupadas por sucursal.</p>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchChartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="branchName" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={64} />
                <YAxis tickFormatter={(value) => formatNumber(Number(value))} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatNumber(Number(value))} labelFormatter={(label) => `${label}`} />
                <Bar dataKey="totalQuotes" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-gray-900">Distribución por estado</h2>
          <p className="mt-1 text-sm text-gray-500">Total general por estado.</p>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={2}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key as QuoteWorkflowStatus]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="text-base font-semibold text-gray-900">Estados por sucursal</h2>
        <p className="mt-1 text-sm text-gray-500">Cotizaciones apiladas por estado del workflow.</p>

        <div className="mt-6 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchStatusChartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="branchName" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={64} />
              <YAxis tickFormatter={(value) => formatNumber(Number(value))} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatNumber(Number(value))} labelFormatter={(label) => `${label}`} />
              <Legend formatter={(value) => STATUS_LABELS[value as QuoteWorkflowStatus] ?? value} />
              {STATUS_KEYS.map((status) => (
                <Bar key={status} dataKey={status} stackId="workflow" fill={STATUS_COLORS[status]} radius={status === 'INVOICED' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-900">Resumen por sucursal</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3 pr-4">Sucursal</th>
                <th className="py-3 pr-4 text-right">Total</th>
                {STATUS_KEYS.map((status) => (
                  <th key={status} className="py-3 pr-4 text-right">
                    {STATUS_LABELS[status]}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(byBranchStatus?.items ?? []).map((item) => (
                <tr key={item.branchId ?? item.branchName} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">{item.branchName}</td>
                  <td className="py-3 pr-4 text-right text-gray-700">{formatNumber(item.totalQuotes)}</td>
                  {STATUS_KEYS.map((status) => (
                    <td key={status} className="py-3 pr-4 text-right text-gray-700">
                      {formatNumber(item.statuses[status] ?? 0)}
                    </td>
                  ))}
                </tr>
              ))}

              {!isLoading && (byBranchStatus?.items ?? []).length === 0 && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={9}>
                    No hay información para el rango seleccionado.
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
  title: string
  value: number
  loading: boolean
}

const KpiCard = ({ title, value, loading }: KpiCardProps) => {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{loading ? '...' : formatNumber(value)}</p>
    </Card>
  )
}

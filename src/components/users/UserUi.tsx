import type { ReactNode } from 'react'
import { UserRound } from 'lucide-react'
export { ROLE_LABELS } from '../../services/users/constants'

export const normalizeActive = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  return ['true', '1', 'active', 'activo'].includes(`${value ?? ''}`.toLowerCase())
}

export const Avatar = ({
  name,
  lastname,
  size = 'md',
}: {
  name?: string
  lastname?: string
  size?: 'md' | 'lg'
}) => {
  const initials =
    `${name?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase() || <UserRound className='h-4 w-4' />
  const dimension = size === 'lg' ? 'h-12 w-12 text-lg' : 'h-10 w-10 text-base'

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700 ${dimension}`}
    >
      {initials}
    </div>
  )
}

export const StatusPill = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
      active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}
  >
    {active ? 'Activo' : 'Inactivo'}
  </span>
)

export const InfoRow = ({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) => (
  <div className='flex items-start gap-2'>
    <span className='mt-1 text-amber-500'>{icon}</span>
    <div>
      <p className='text-xs font-semibold uppercase text-gray-400'>{label}</p>
      <p className='font-medium text-gray-700'>{value ?? '—'}</p>
    </div>
  </div>
)

export const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) => (
  <label className='block text-sm'>
    <span className='font-semibold text-gray-700'>{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className='mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
      placeholder={label}
    />
  </label>
)

export const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) => (
  <label className='block text-sm'>
    <span className='font-semibold text-gray-700'>{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className='mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
    >
      <option value=''>Selecciona una opción</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
)

export const ToggleField = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) => (
  <label className='flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm'>
    <span className='font-semibold text-gray-700'>{label}</span>
    <input type='checkbox' checked={checked} onChange={(event) => onChange(event.target.checked)} />
  </label>
)

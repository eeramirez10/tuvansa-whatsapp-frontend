import type { PropsWithChildren } from 'react'
import { X } from 'lucide-react'

interface UserModalShellProps extends PropsWithChildren {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  widthClassName?: string
}

export const UserModalShell = ({
  open,
  title,
  subtitle,
  onClose,
  widthClassName = 'max-w-3xl',
  children,
}: UserModalShellProps) => {
  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6'>
      <div
        className={`relative max-h-[90vh] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ${widthClassName}`}
      >
        <div className='flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
            {subtitle ? <p className='mt-1 text-sm text-gray-500'>{subtitle}</p> : null}
          </div>
          <button
            type='button'
            onClick={onClose}
            className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700'
            aria-label='Cerrar modal'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='max-h-[calc(90vh-81px)] overflow-y-auto px-6 py-5'>
          {children}
        </div>
      </div>
    </div>
  )
}

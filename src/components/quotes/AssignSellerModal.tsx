import { useEffect, useMemo, useState } from 'react'
import { Building2, Mail, Phone, Search, UserCheck, X } from 'lucide-react'
import type { User } from '../../interfaces/user.interface'
import { ROLE_LABELS } from '../../services/users/constants'

interface AssignSellerModalProps {
  open: boolean
  onClose: () => void
  quoteNumber?: string | number
  branchName?: string
  currentSellerName?: string
  sellers: User[]
  selectedSellerId: string
  onSelectSeller: (sellerId: string) => void
  onSubmit: () => void | Promise<void>
  onClearAssignment?: () => void | Promise<void>
  canClearAssignment?: boolean
  isSubmitting: boolean
}

const getSellerFullName = (seller: User) => `${seller.name} ${seller.lastname}`.trim()

export const AssignSellerModal = ({
  open,
  onClose,
  quoteNumber,
  branchName,
  currentSellerName,
  sellers,
  selectedSellerId,
  onSelectSeller,
  onSubmit,
  onClearAssignment,
  canClearAssignment = false,
  isSubmitting,
}: AssignSellerModalProps) => {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const filteredSellers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return sellers

    return sellers.filter((seller) => {
      const roleLabel = ROLE_LABELS[`${seller.role ?? ''}`.toUpperCase()] ?? seller.role
      const branches = (seller.branchOffices ?? []).map((branch) => branch.name).join(' ')
      return `${getSellerFullName(seller)} ${seller.email} ${seller.phone ?? ''} ${roleLabel} ${branches}`
        .toLowerCase()
        .includes(normalized)
    })
  }, [query, sellers])

  const selectedSeller = filteredSellers.find((seller) => seller.id === selectedSellerId)
    ?? sellers.find((seller) => seller.id === selectedSellerId)
    ?? null

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6'>
      <div className='relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl'>
        <div className='flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>Gestionar asignación</h2>
            <p className='mt-1 text-sm text-gray-500'>
              Selecciona el vendedor que dará seguimiento a la cotización #{quoteNumber ?? '—'}.
            </p>
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

        <div className='grid max-h-[calc(90vh-81px)] grid-cols-1 gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,1.2fr)_320px]'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-slate-50 p-4 text-sm text-gray-700 md:grid-cols-2'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Sucursal</p>
                <p className='mt-1 inline-flex items-center gap-2 font-medium text-gray-900'>
                  <Building2 className='h-4 w-4 text-amber-600' />
                  {branchName || 'Sin sucursal'}
                </p>
              </div>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Asignación actual</p>
                <p className='mt-1 inline-flex items-center gap-2 font-medium text-gray-900'>
                  <UserCheck className='h-4 w-4 text-emerald-600' />
                  {currentSellerName || 'Sin asignar'}
                </p>
              </div>
            </div>

            <label className='block text-sm'>
              <span className='font-semibold text-gray-700'>Buscar vendedor</span>
              <div className='mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100'>
                <Search className='h-4 w-4 text-gray-400' />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder='Nombre, correo, teléfono o sucursal'
                  className='w-full border-none bg-transparent text-sm text-gray-800 outline-none'
                />
              </div>
            </label>

            <div className='overflow-hidden rounded-xl border border-gray-200'>
              <div className='grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_110px] border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                <span>Vendedor</span>
                <span>Sucursales</span>
                <span className='text-right'>Acción</span>
              </div>

              <div className='max-h-[420px] overflow-y-auto'>
                {filteredSellers.length > 0 ? (
                  filteredSellers.map((seller) => {
                    const isSelected = seller.id === selectedSellerId
                    const branchNames = (seller.branchOffices ?? []).map((branch) => branch.name).join(', ')

                    return (
                      <button
                        key={seller.id}
                        type='button'
                        onClick={() => onSelectSeller(seller.id)}
                        className={`grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_110px] items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 ${
                          isSelected ? 'bg-amber-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-semibold text-gray-900'>{getSellerFullName(seller)}</p>
                          <p className='mt-1 truncate text-xs text-gray-500'>{seller.email}</p>
                          <p className='mt-1 truncate text-xs text-gray-500'>{seller.phone || 'Sin teléfono'}</p>
                        </div>
                        <div className='min-w-0'>
                          <p className='truncate text-sm text-gray-700'>{branchNames || 'Sin sucursales'}</p>
                          <p className='mt-1 text-xs text-gray-500'>
                            {ROLE_LABELS[`${seller.role ?? ''}`.toUpperCase()] ?? seller.role}
                          </p>
                        </div>
                        <div className='flex justify-end'>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isSelected ? 'Seleccionado' : 'Elegir'}
                          </span>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className='px-4 py-8 text-center text-sm text-gray-500'>
                    No hay vendedores disponibles para esta sucursal.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Resumen</p>
              <p className='mt-2 text-sm text-gray-600'>
                Al confirmar, el vendedor seleccionado recibirá notificación por WhatsApp con template y correo con enlace al sistema.
              </p>
            </div>

            <div className='rounded-xl border border-white bg-white p-4 shadow-sm'>
              {selectedSeller ? (
                <div className='space-y-3'>
                  <div>
                    <p className='text-sm font-semibold text-gray-900'>{getSellerFullName(selectedSeller)}</p>
                    <p className='mt-1 text-xs text-gray-500'>
                      {ROLE_LABELS[`${selectedSeller.role ?? ''}`.toUpperCase()] ?? selectedSeller.role}
                    </p>
                  </div>
                  <div className='space-y-2 text-sm text-gray-600'>
                    <p className='inline-flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-amber-600' />
                      <span className='truncate'>{selectedSeller.email || 'Sin correo'}</span>
                    </p>
                    <p className='inline-flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-amber-600' />
                      <span>{selectedSeller.phone || 'Sin teléfono'}</span>
                    </p>
                    <p className='inline-flex items-start gap-2'>
                      <Building2 className='mt-0.5 h-4 w-4 text-amber-600' />
                      <span>{(selectedSeller.branchOffices ?? []).map((branch) => branch.name).join(', ') || 'Sin sucursales'}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-500'>Selecciona un vendedor para ver el resumen.</p>
              )}
            </div>

            <div className='flex flex-col gap-2 pt-2'>
              <button
                type='button'
                onClick={onClose}
                className='w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-white'
              >
                Cancelar
              </button>
              {canClearAssignment && onClearAssignment ? (
                <button
                  type='button'
                  onClick={() => void onClearAssignment()}
                  disabled={isSubmitting}
                  className='w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60'
                >
                  {isSubmitting ? 'Procesando...' : 'Quitar asignación'}
                </button>
              ) : null}
              <button
                type='button'
                onClick={() => void onSubmit()}
                disabled={!selectedSellerId || isSubmitting}
                className='w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:bg-amber-300'
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar asignación'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

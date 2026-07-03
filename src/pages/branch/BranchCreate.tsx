import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Building2, MapPin, PlusCircle, Save, UserCog } from 'lucide-react'
import { notify } from '../../lib/notifications/toast-sonner'
import { useAuth } from '../../hooks/useAuth'
import { useAssignBranchManager, useBranchOptions, useCreateBranch, useUpdateBranch, useUsers } from '../../queries/users/users-query'
import { ROLE_LABELS } from '../../services/users/constants'

export const BranchCreate = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createBranchMutation = useCreateBranch()
  const updateBranchMutation = useUpdateBranch()
  const assignBranchManagerMutation = useAssignBranchManager()
  const { data: branches = [], isLoading: branchesLoading } = useBranchOptions()
  const { data: users = [], isLoading: usersLoading } = useUsers()
  const isAdmin = `${user?.role ?? ''}`.toUpperCase() === 'ADMIN'

  const [form, setForm] = useState({
    name: '',
    address: '',
  })
  const [selectedManagerByBranch, setSelectedManagerByBranch] = useState<Record<string, string>>({})
  const [savedManagerByBranch, setSavedManagerByBranch] = useState<Record<string, string>>({})
  const [assigningBranchId, setAssigningBranchId] = useState<string | null>(null)
  const [updatingBranchId, setUpdatingBranchId] = useState<string | null>(null)
  const [branchDraftById, setBranchDraftById] = useState<Record<string, { name: string; address: string }>>({})

  const managerCandidates = useMemo(() => {
    return users.filter((candidate) => {
      const role = `${candidate.role ?? ''}`.toUpperCase()
      const isActive = isUserActive(candidate.isActive)
      return ['BRANCH_MANAGER', 'SALES_COORDINATOR'].includes(role) && isActive
    })
  }, [users])

  const usersById = useMemo(() => {
    return new Map(users.map((candidate) => [candidate.id, candidate]))
  }, [users])

  const currentManagerByBranch = useMemo(() => {
    const map: Record<string, string> = {}

    for (const branch of branches) {
      const explicitManagerId = `${savedManagerByBranch[branch.id] ?? branch.managerId ?? branch.manager?.id ?? ''}`.trim()
      if (explicitManagerId) {
        map[branch.id] = explicitManagerId
        continue
      }

      const inferredManager = managerCandidates.find((candidate) =>
        (candidate.branchOffices ?? (candidate.branchOffice ? [candidate.branchOffice] : []))
          .some((candidateBranch) => candidateBranch.id === branch.id)
      )
      if (inferredManager?.id) {
        map[branch.id] = inferredManager.id
      }
    }

    return map
  }, [branches, managerCandidates, savedManagerByBranch])

  useEffect(() => {
    setSelectedManagerByBranch((previous) => {
      const next: Record<string, string> = {}
      for (const branch of branches) {
        next[branch.id] = previous[branch.id] ?? currentManagerByBranch[branch.id] ?? ''
      }
      return next
    })
  }, [branches, currentManagerByBranch])

  useEffect(() => {
    setBranchDraftById((previous) => {
      const next: Record<string, { name: string; address: string }> = {}
      for (const branch of branches) {
        next[branch.id] = previous[branch.id] ?? {
          name: branch.name ?? '',
          address: branch.address ?? ''
        }
      }
      return next
    })
  }, [branches])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAdmin) {
      notify.error('No autorizado')
      return
    }

    if (!form.name.trim()) {
      notify.error('El nombre de la sucursal es requerido')
      return
    }

    if (!form.address.trim()) {
      notify.error('La dirección es requerida')
      return
    }

    await notify.promise(
      createBranchMutation.mutateAsync({
        name: form.name.trim(),
        address: form.address.trim()
      }),
      {
        loading: 'Creando sucursal...',
        success: () => {
          setForm({ name: '', address: '' })
          return 'Sucursal creada correctamente'
        },
        error: (error: Error) => error.message || 'No se pudo crear la sucursal'
      }
    )
  }

  const handleAssignManager = async (branchId: string) => {
    const managerId = `${selectedManagerByBranch[branchId] ?? ''}`.trim()

    if (!managerId) {
      notify.error('Selecciona un encargado')
      return
    }

    setAssigningBranchId(branchId)
    try {
      await notify.promise(
        assignBranchManagerMutation.mutateAsync({ branchId, managerId }),
        {
          loading: 'Asignando encargado...',
          success: () => {
            setSavedManagerByBranch((prev) => ({ ...prev, [branchId]: managerId }))
            return 'Encargado asignado correctamente'
          },
          error: (error: Error) => error.message || 'No se pudo asignar el encargado'
        }
      )
    } finally {
      setAssigningBranchId(null)
    }
  }

  const handleUpdateBranch = async (branchId: string) => {
    const draft = branchDraftById[branchId]
    const name = `${draft?.name ?? ''}`.trim()
    const address = `${draft?.address ?? ''}`.trim()

    if (!name) {
      notify.error('El nombre de la sucursal es requerido')
      return
    }

    if (!address) {
      notify.error('La dirección es requerida')
      return
    }

    setUpdatingBranchId(branchId)
    try {
      await notify.promise(
        updateBranchMutation.mutateAsync({
          branchId,
          payload: { name, address }
        }),
        {
          loading: 'Guardando sucursal...',
          success: () => 'Sucursal actualizada correctamente',
          error: (error: Error) => error.message || 'No se pudo actualizar la sucursal'
        }
      )
    } finally {
      setUpdatingBranchId(null)
    }
  }

  const getUserName = (userId?: string | null) => {
    if (!userId) return 'Sin encargado asignado'
    const manager = usersById.get(userId)
    if (!manager) return 'Encargado no encontrado'
    return `${manager.name} ${manager.lastname}`.trim()
  }

  if (!isAdmin) {
    return (
      <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
        Solo usuarios con rol administrador pueden gestionar sucursales.
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Sucursales</h1>
          <p className='text-gray-500 text-sm'>Registra sucursales y asigna un encargado por sucursal.</p>
        </div>

        <button
          onClick={() => navigate('/users/new')}
          className='text-sm font-semibold text-gray-600 hover:text-gray-800'
        >
          Volver a nuevo usuario
        </button>
      </div>

      <div className='bg-white rounded-2xl shadow border border-gray-100 p-6 md:p-8 space-y-6'>
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center'>
            <Building2 className='h-5 w-5' />
          </div>
          <div>
            <p className='text-lg font-semibold text-gray-800'>Datos de la sucursal</p>
            <p className='text-sm text-gray-500'>Completa la información para registrarla.</p>
          </div>
        </div>

        <form className='space-y-6' onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Nombre de sucursal'
              value={form.name}
              onChange={(value) => handleChange('name', value)}
              icon={<Building2 className='h-4 w-4 text-amber-500' />}
            />

            <Input
              label='Dirección'
              value={form.address}
              onChange={(value) => handleChange('address', value)}
              icon={<MapPin className='h-4 w-4 text-amber-500' />}
            />
          </div>

          <div className='flex flex-wrap justify-end gap-3'>
            <button
              type='button'
              onClick={() => setForm({ name: '', address: '' })}
              className='px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition'
            >
              Limpiar
            </button>
            <button
              type='submit'
              disabled={createBranchMutation.isPending}
              className='px-6 py-2 rounded-md bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:bg-amber-300 shadow-sm transition flex items-center gap-2'
            >
              <PlusCircle className='h-4 w-4' />
              {createBranchMutation.isPending ? 'Creando...' : 'Crear sucursal'}
            </button>
          </div>
        </form>
      </div>

      <div className='bg-white rounded-2xl shadow border border-gray-100 p-6 md:p-8 space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center'>
            <UserCog className='h-5 w-5' />
          </div>
          <div>
            <p className='text-lg font-semibold text-gray-800'>Editar sucursales y asignar encargado</p>
            <p className='text-sm text-gray-500'>Actualiza datos de sucursal y asigna encargado por fila.</p>
          </div>
        </div>

        <div className='overflow-auto rounded-xl border border-gray-100'>
          <table className='min-w-full text-left'>
            <thead className='bg-gray-50 text-xs uppercase text-gray-500'>
              <tr>
                <th className='px-4 py-3'>Sucursal</th>
                <th className='px-4 py-3'>Encargado actual</th>
                <th className='px-4 py-3'>Asignar encargado</th>
                <th className='px-4 py-3 text-right'>Acción</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {branchesLoading && (
                <tr>
                  <td className='px-4 py-6 text-sm text-gray-500' colSpan={4}>
                    Cargando sucursales...
                  </td>
                </tr>
              )}

              {!branchesLoading && branches.length === 0 && (
                <tr>
                  <td className='px-4 py-6 text-sm text-gray-500' colSpan={4}>
                    Aún no hay sucursales registradas.
                  </td>
                </tr>
              )}

              {!branchesLoading && branches.map((branch) => {
                const selectedManagerId = selectedManagerByBranch[branch.id] ?? ''
                const isAssigningRow = assigningBranchId === branch.id && assignBranchManagerMutation.isPending
                const isUpdatingRow = updatingBranchId === branch.id && updateBranchMutation.isPending
                const currentManagerId = currentManagerByBranch[branch.id]
                const currentManagerLabel = getUserName(currentManagerId)
                const branchDraft = branchDraftById[branch.id] ?? { name: branch.name ?? '', address: branch.address ?? '' }

                return (
                  <tr key={branch.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                        <input
                          value={branchDraft.name}
                          onChange={(event) => setBranchDraftById((prev) => ({
                            ...prev,
                            [branch.id]: {
                              ...branchDraft,
                              name: event.target.value
                            }
                          }))}
                          disabled={isUpdatingRow}
                          className='rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                          placeholder='Nombre de sucursal'
                        />
                        <input
                          value={branchDraft.address}
                          onChange={(event) => setBranchDraftById((prev) => ({
                            ...prev,
                            [branch.id]: {
                              ...branchDraft,
                              address: event.target.value
                            }
                          }))}
                          disabled={isUpdatingRow}
                          className='rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                          placeholder='Dirección'
                        />
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-700'>{currentManagerLabel}</td>
                    <td className='px-4 py-3'>
                      <select
                        value={selectedManagerId}
                        onChange={(event) =>
                          setSelectedManagerByBranch((prev) => ({
                            ...prev,
                            [branch.id]: event.target.value
                          }))
                        }
                        disabled={usersLoading || isAssigningRow || isUpdatingRow}
                        className='w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition'
                      >
                        <option value=''>{usersLoading ? 'Cargando encargados...' : 'Selecciona un encargado'}</option>
                        {managerCandidates.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name} {manager.lastname} ({ROLE_LABELS[`${manager.role ?? ''}`.toUpperCase()] ?? manager.username})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <div className='inline-flex flex-col gap-2'>
                        <button
                          type='button'
                          onClick={() => handleUpdateBranch(branch.id)}
                          disabled={isAssigningRow || isUpdatingRow}
                          className='inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:bg-sky-300'
                        >
                          <Save className='h-4 w-4' />
                          {isUpdatingRow ? 'Guardando...' : 'Guardar sucursal'}
                        </button>
                        <button
                          type='button'
                          onClick={() => handleAssignManager(branch.id)}
                          disabled={!selectedManagerId || usersLoading || isAssigningRow || isUpdatingRow}
                          className='inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:bg-amber-300'
                        >
                          <Save className='h-4 w-4' />
                          {isAssigningRow ? 'Guardando...' : 'Guardar encargado'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const Input = ({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
}) => (
  <label className='block text-sm'>
    <span className='text-gray-700 font-semibold'>{label}</span>
    <div className='mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition'>
      {icon}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full outline-none text-gray-800 placeholder-gray-400'
        placeholder={label}
      />
    </div>
  </label>
)

const isUserActive = (value: boolean | string | undefined) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return Boolean(value)
}

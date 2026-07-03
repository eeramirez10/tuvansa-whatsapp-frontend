import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import {
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
  LockKeyhole,
  Building2,
  Sparkles,
  Check,
} from 'lucide-react'
import { notify } from '../../lib/notifications/toast-sonner'
import { useBranchOptions, useCreateUser } from '../../queries/users/users-query'
import { useAuth } from '../../hooks/useAuth'
import {
  canCreateUsers,
  getRoleOptionsForUserCreation,
  normalizeUserRole,
  roleAllowsMultipleBranches,
} from '../../services/users/constants'

export const UserCreate = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: branches = [], isLoading: branchesLoading } = useBranchOptions()
  const createUserMutation = useCreateUser()

  const creatorRole = normalizeUserRole(user?.role)
  const isCreatorAuthorized = canCreateUsers(user?.role)
  const creatorBranchIds = useMemo(() => {
    return [
      ...(user?.branchOffices ?? []).map((branch) => branch.id),
      ...(user?.branchOffice ? [user.branchOffice.id] : []),
    ].filter((value, index, values) => Boolean(value) && values.indexOf(value) === index)
  }, [user?.branchOffice, user?.branchOffices])

  const availableBranches = useMemo(() => {
    if (creatorRole !== 'SALES_COORDINATOR') return branches
    return branches.filter((branch) => creatorBranchIds.includes(branch.id))
  }, [branches, creatorBranchIds, creatorRole])

  const roleOptions = useMemo(() => getRoleOptionsForUserCreation(user?.role), [user?.role])
  const defaultRole = roleOptions.find((option) => option.value === 'USER')?.value ?? roleOptions[0]?.value ?? 'USER'

  const [form, setForm] = useState({
    name: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
    role: defaultRole,
    branchIds: [] as string[],
    password: '',
    confirmPassword: '',
    isActive: true,
    allowWhatsappAssistant: false,
  })
  const [selectedBranchToAdd, setSelectedBranchToAdd] = useState('')
  const allowsMultipleBranches = roleAllowsMultipleBranches(form.role)
  const branchOptions = availableBranches.map((branch) => ({
    value: branch.id,
    label: `${branch.name}${branch.address ? ` - ${branch.address}` : ''}`,
  }))
  const branchNameById = new Map(availableBranches.map((branch) => [branch.id, branch.name]))

  const handleChange = (field: keyof typeof form, value: string | boolean | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleRoleChange = (role: string) => {
    setForm((prev) => {
      const normalizedBranchIds = roleAllowsMultipleBranches(role)
        ? prev.branchIds
        : prev.branchIds.length > 0 ? [prev.branchIds[0]] : []

      return {
        ...prev,
        role,
        branchIds: normalizedBranchIds
      }
    })
    if (!roleAllowsMultipleBranches(role)) {
      setSelectedBranchToAdd('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isCreatorAuthorized) {
      notify.error('No tienes permiso para crear usuarios')
      return
    }

    if (form.branchIds.length === 0) {
      notify.error('Selecciona al menos una sucursal')
      return
    }

    if (creatorRole === 'SALES_COORDINATOR' && form.branchIds.some((branchId) => !creatorBranchIds.includes(branchId))) {
      notify.error('Solo puedes crear usuarios en tus sucursales asignadas')
      return
    }

    if (form.password !== form.confirmPassword) {
      notify.error('Las contraseñas no coinciden')
      return
    }

    if (form.password.length < 6) {
      notify.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    await notify.promise(
      createUserMutation.mutateAsync({
        name: form.name,
        lastname: form.lastname,
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        branchIds: form.branchIds,
        isActive: form.isActive,
        allowWhatsappAssistant: form.allowWhatsappAssistant,
      }),
      {
        loading: 'Creando usuario...',
        success: () => {
          navigate('/users')
          return 'Usuario creado correctamente'
        },
        error: (error: Error) => error.message || 'No se pudo crear el usuario'
      }
    )
  }

  if (!isCreatorAuthorized) {
    return (
      <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
        No tienes permiso para crear usuarios.
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Nuevo usuario</h1>
          <p className='text-gray-500 text-sm'>Registra un usuario y define sus permisos iniciales.</p>
        </div>
        <button
          onClick={() => navigate('/users')}
          className='text-sm font-semibold text-gray-600 hover:text-gray-800'
        >
          Volver al listado
        </button>
      </div>

      <div className='bg-white rounded-2xl shadow border border-gray-100 p-6 md:p-8 space-y-6'>
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center'>
            <UserPlus className='h-5 w-5' />
          </div>
          <div>
            <p className='text-lg font-semibold text-gray-800'>Datos del usuario</p>
            <p className='text-sm text-gray-500'>Completa la información y configura su acceso.</p>
          </div>
        </div>

        {creatorRole === 'SALES_COORDINATOR' ? (
          <div className='rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>
            Solo puedes crear usuarios dentro de tus sucursales asignadas.
          </div>
        ) : null}

        <form className='space-y-6' onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input label='Nombre' value={form.name} onChange={value => handleChange('name', value)} icon={<UserRound className='h-4 w-4 text-amber-500' />} />
            <Input label='Apellido' value={form.lastname} onChange={value => handleChange('lastname', value)} icon={<UserRound className='h-4 w-4 text-amber-500' />} />
            <Input label='Usuario' value={form.username} onChange={value => handleChange('username', value)} />
            <Input label='Correo' value={form.email} onChange={value => handleChange('email', value)} type='email' icon={<Mail className='h-4 w-4 text-amber-500' />} />
            <Input label='Teléfono' value={form.phone} onChange={value => handleChange('phone', value)} icon={<Phone className='h-4 w-4 text-amber-500' />} />

            <SelectInput
              label='Rol'
              value={form.role}
              onChange={handleRoleChange}
              icon={<ShieldCheck className='h-4 w-4 text-amber-500' />}
              options={roleOptions}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              {allowsMultipleBranches ? (
                <SelectInput
                  label='Agregar sucursal'
                  value={selectedBranchToAdd}
                  onChange={(value) => {
                    if (!value) return
                    setForm((prev) => ({
                      ...prev,
                      branchIds: prev.branchIds.includes(value) ? prev.branchIds : [...prev.branchIds, value],
                    }))
                    setSelectedBranchToAdd('')
                  }}
                  icon={<Building2 className='h-4 w-4 text-amber-500' />}
                  options={branchOptions.filter((option) => !form.branchIds.includes(option.value))}
                  loading={branchesLoading}
                />
              ) : (
                <SelectInput
                  label='Sucursal'
                  value={form.branchIds[0] ?? ''}
                  onChange={(value) => handleChange('branchIds', value ? [value] : [])}
                  icon={<Building2 className='h-4 w-4 text-amber-500' />}
                  options={branchOptions}
                  loading={branchesLoading}
                />
              )}
              {allowsMultipleBranches && form.branchIds.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {form.branchIds.map((branchId) => (
                    <span
                      key={branchId}
                      className='inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold'
                    >
                      <Building2 className='h-3.5 w-3.5' />
                      {branchNameById.get(branchId) ?? branchId}
                      <button
                        type='button'
                        onClick={() => handleChange('branchIds', form.branchIds.filter((id) => id !== branchId))}
                        className='rounded-full px-1 text-amber-700 hover:bg-amber-200'
                        aria-label='Quitar sucursal'
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {creatorRole !== 'SALES_COORDINATOR' ? (
                <button
                  type='button'
                  onClick={() => navigate('/branchs/new')}
                  className='text-xs font-semibold text-amber-600 hover:text-amber-700'
                >
                  + Crear sucursal nueva
                </button>
              ) : null}
            </div>

            <div className='space-y-3'>
              <ToggleRow
                title='Estado activo'
                description='Si está desactivado no podrá iniciar sesión.'
                checked={form.isActive}
                onChange={(checked) => handleChange('isActive', checked)}
                icon={<Check className='h-4 w-4 text-amber-500' />}
              />

              <ToggleRow
                title='Permitir asistente de WhatsApp'
                description='Permite que este usuario interno converse con el asistente.'
                checked={form.allowWhatsappAssistant}
                onChange={(checked) => handleChange('allowWhatsappAssistant', checked)}
                icon={<Sparkles className='h-4 w-4 text-amber-500' />}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input label='Contraseña' value={form.password} onChange={value => handleChange('password', value)} type='password' icon={<LockKeyhole className='h-4 w-4 text-amber-500' />} />
            <Input label='Confirmar contraseña' value={form.confirmPassword} onChange={value => handleChange('confirmPassword', value)} type='password' icon={<LockKeyhole className='h-4 w-4 text-amber-500' />} />
          </div>

          <div className='flex flex-wrap justify-end gap-3'>
            <button
              type='button'
              onClick={() => {
                setForm({
                  name: '',
                  lastname: '',
                  username: '',
                  email: '',
                  phone: '',
                  role: defaultRole,
                  branchIds: [],
                  password: '',
                  confirmPassword: '',
                  isActive: true,
                  allowWhatsappAssistant: false,
                })
                setSelectedBranchToAdd('')
              }}
              className='px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition'
            >
              Limpiar
            </button>
            <button
              type='submit'
              disabled={createUserMutation.isPending}
              className='px-6 py-2 rounded-md bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:bg-amber-300 shadow-sm transition flex items-center gap-2'
            >
              <UserPlus className='h-4 w-4' />
              {createUserMutation.isPending ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Input = ({
  label,
  value,
  onChange,
  icon,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  icon?: ReactNode
  type?: string
}) => (
  <label className='block text-sm'>
    <span className='font-semibold text-gray-700'>{label}</span>
    <div className='mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100'>
      {icon ? <span>{icon}</span> : null}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='w-full border-none bg-transparent text-gray-800 outline-none'
        placeholder={label}
      />
    </div>
  </label>
)

const SelectInput = ({
  label,
  value,
  onChange,
  options,
  icon,
  loading = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  icon?: ReactNode
  loading?: boolean
}) => (
  <label className='block text-sm'>
    <span className='font-semibold text-gray-700'>{label}</span>
    <div className='mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100'>
      {icon ? <span>{icon}</span> : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='w-full border-none bg-transparent text-gray-800 outline-none'
        disabled={loading}
      >
        <option value=''>{loading ? 'Cargando...' : 'Selecciona una opción'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </label>
)

const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
  icon,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: ReactNode
}) => (
  <div className='flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3'>
    <div className='flex gap-3'>
      <div className='mt-0.5 text-amber-500'>{icon}</div>
      <div>
        <p className='font-semibold text-gray-800'>{title}</p>
        <p className='text-sm text-gray-500'>{description}</p>
      </div>
    </div>
    <label className='relative inline-flex cursor-pointer items-center'>
      <input type='checkbox' className='peer sr-only' checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-amber-500 peer-checked:after:translate-x-full' />
    </label>
  </div>
)

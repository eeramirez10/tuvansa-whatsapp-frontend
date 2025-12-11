import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Camera,
  LockKeyhole,

  UserRound,
} from 'lucide-react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../lib/notifications/toast-sonner'
import { dateFormat } from '../../utils/dateFormat'

export const UserProfile = () => {
  const { user, authStatus, fetching } = useAuth()
  const [profileForm, setProfileForm] = useState({
    name: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'activity'>('info')
  const [photoPreview, setPhotoPreview] = useState<string>()

  useEffect(() => {
    if (!user) return
    setProfileForm({
      name: user.name ?? '',
      lastname: user.lastname ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    })
  }, [user])

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
  }

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    notify.info(
      'Actualización pendiente de implementar',
      // { description: 'Conecta este formulario con el endpoint de perfil.' }
    )
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      notify.error('Las contraseñas no coinciden')
      return
    }

    notify.info(
      'Cambio de contraseña pendiente por implementar ',
      // { description: 'Integra el servicio cuando esté disponible.' }
    )
    setPasswordForm({ current: '', next: '', confirm: '' })
  }

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    notify.info('Foto lista para subir', { description: 'Envía al backend cuando el endpoint esté disponible.' })
  }

  const branchCreated = useMemo(() => user?.branchOffice?.createdAt ? dateFormat(user.branchOffice.createdAt) : '—', [user?.branchOffice?.createdAt])
  const created = useMemo(() => user?.createdAt ? dateFormat(user.createdAt) : '—', [user?.createdAt])
  const updated = useMemo(() => user?.updatedAt ? dateFormat(user.updatedAt) : '—', [user?.updatedAt])

  if (fetching || authStatus === 'pending') return <ProfileSkeleton />
  if (!user) return <ProfileError />

  const status = user.isActive ? user.isActive.toString().toLowerCase() : ''
  const isActive = ['true', '1', 'active', 'activo'].includes(status)
  const initials = getInitials(user.name, user.lastname)

  const tabs: { id: 'info' | 'security' | 'activity'; label: string; icon: ReactNode }[] = [
    { id: 'info', label: 'Información personal', icon: <UserRound className='h-4 w-4' /> },
    { id: 'security', label: 'Seguridad', icon: <LockKeyhole className='h-4 w-4' /> },
    { id: 'activity', label: 'Actividad', icon: <CalendarClock className='h-4 w-4' /> },
  ]

  return (
    <div className='space-y-8'>
      <div className='relative overflow-hidden rounded-lg bg-gradient-to-r from-yellow-500  to-yellow-300  shadow-lg'>


        <div className='relative p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center'>
          <div className='relative w-24 h-24  md:w-28 md:h-28'>
            <div className='w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden text-2xl font-semibold text-amber-700'>
              {photoPreview
                ? <img src={photoPreview} alt='Foto de perfil' className='w-full h-full object-cover' />
                : initials || <UserRound className='h-10 w-10 text-amber-600' />
              }
            </div>
            <label className='absolute -bottom-2 right-0 cursor-pointer rounded-full bg-amber-400 text-white p-2 shadow-lg hover:bg-amber-500 transition'>
              <Camera className='h-4 w-4' />
              <input type='file' accept='image/*' className='hidden' onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className='flex-1 space-y-2'>
            <div className='flex flex-wrap items-center gap-3'>
              <div className='flex items-center gap-2'>
                {/* <PencilLine className='h-5 w-5 text-amber-500' /> */}
                <h1 className='text-2xl md:text-3xl font-semibold text-white tracking-tight'>
                  {user.name} {user.lastname}
                </h1>
              </div>
              <StatusPill active={isActive} />
              <Badge icon={<ShieldCheck className='h-4 w-4' />} text={user.role} color='blue' />
            </div>
            <p className='text-gray-50 font-bold text-md'>{user.username}</p>
            <div className='flex flex-wrap gap-3 text-sm text-gray-700'>
              <InlineBadge icon={<Mail className='h-4 w-4' />} text={user.email} />
              {user.phone && <InlineBadge icon={<Phone className='h-4 w-4' />} text={user.phone} />}
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl shadow border border-gray-100 overflow-hidden'>
        <div className='flex flex-wrap border-b border-gray-100 bg-gray-50/60'>
          {tabs.map(tab => {
            const isActiveTab = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition border-b-2 ${isActiveTab
                  ? 'border-amber-500 text-amber-500 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'
                  }`}
              >
                <span className={`p-2 rounded-full ${isActiveTab ? 'bg-amber-100 text-amber-500' : 'bg-gray-100 text-gray-500'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className='p-6 md:p-8'>
          {activeTab === 'info' && (
            <form className='space-y-6' onSubmit={handleProfileSubmit}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField label='Nombre' value={profileForm.name} onChange={value => handleProfileChange('name', value)} />
                <InputField label='Apellido' value={profileForm.lastname} onChange={value => handleProfileChange('lastname', value)} />
                <InputField label='Usuario' value={profileForm.username} onChange={value => handleProfileChange('username', value)} />
                <InputField label='Correo' value={profileForm.email} onChange={value => handleProfileChange('email', value)} type='email' />
                <InputField label='Teléfono' value={profileForm.phone} onChange={value => handleProfileChange('phone', value)} />
              </div>
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => user && setProfileForm({
                    name: user.name ?? '',
                    lastname: user.lastname ?? '',
                    username: user.username ?? '',
                    email: user.email ?? '',
                    phone: user.phone ?? '',
                  })}
                  className='px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition'
                >
                  Restablecer
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 rounded-md bg-amber-500 text-white font-semibold hover:bg-amber-600 shadow-sm transition'
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form className='space-y-4' onSubmit={handlePasswordSubmit}>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <InputField label='Contraseña actual' type='password' value={passwordForm.current} onChange={value => handlePasswordChange('current', value)} icon={<LockKeyhole className='h-4 w-4 text-amber-500' />} />
                <InputField label='Nueva contraseña' type='password' value={passwordForm.next} onChange={value => handlePasswordChange('next', value)} icon={<LockKeyhole className='h-4 w-4 text-amber-500' />} />
                <InputField label='Confirmar nueva' type='password' value={passwordForm.confirm} onChange={value => handlePasswordChange('confirm', value)} icon={<LockKeyhole className='h-4 w-4 text-amber-500' />} />
              </div>
              <div className='flex justify-end'>
                <button
                  type='submit'
                  className='px-5 py-2 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800 shadow-sm transition'
                >
                  Actualizar contraseña
                </button>
              </div>
            </form>
          )}

          {activeTab === 'activity' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <h4 className='text-sm font-semibold text-gray-500'>Sucursal</h4>
                <InfoRow icon={<Building2 className='h-4 w-4' />} label='Sucursal' value={user.branchOffice?.name} />
                <InfoRow icon={<MapPin className='h-4 w-4' />} label='Dirección' value={user.branchOffice?.address} />
                <InfoRow icon={<CalendarClock className='h-4 w-4' />} label='Creada' value={branchCreated} />
              </div>
              <div className='space-y-4'>
                <h4 className='text-sm font-semibold text-gray-500'>Actividad</h4>
                <InfoRow icon={<CalendarClock className='h-4 w-4' />} label='Creado' value={created} />
                <InfoRow icon={<CalendarClock className='h-4 w-4' />} label='Última actualización' value={updated} />
                <InfoRow icon={<CheckCircle2 className='h-4 w-4' />} label='Estado' value={isActive ? 'Activo' : 'Inactivo'} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const StatusPill = ({ active }: { active: boolean }) => (
  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    {active ? 'Activo' : 'Inactivo'}
  </span>
)

const InlineBadge = ({ icon, text }: { icon: ReactNode; text?: string }) => (
  <div className='flex items-center gap-2 px-3 py-1 bg-white/80 border border-gray-100 rounded-full shadow-sm'>
    {icon}
    <span className='text-gray-700'>{text ?? '—'}</span>
  </div>
)

const Badge = ({ icon, text, color = 'gray' }: { icon: ReactNode; text?: string; color?: 'gray' | 'blue' }) => {
  const styles = color === 'blue'
    ? 'bg-blue-50 text-blue-700'
    : 'bg-gray-100 text-gray-700'

  return (
    <span className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full ${styles}`}>
      {icon}
      {text ?? '—'}
    </span>
  )
}

const InfoRow = ({ label, value, icon }: { label: string; value?: string; icon: ReactNode }) => (
  <div className='flex items-start gap-3'>
    <div className='text-amber-500 mt-1'>
      {icon}
    </div>
    <div>
      <p className='text-xs font-semibold uppercase text-gray-400'>{label}</p>
      <p className='text-gray-800 font-medium'>{value ?? '—'}</p>
    </div>
  </div>
)

const InputField = ({ label, value, onChange, type = 'text', icon }: { label: string; value: string; onChange: (value: string) => void; type?: string; icon?: ReactNode }) => (
  <label className='block text-sm'>
    <span className='text-gray-600 font-semibold'>{label}</span>
    <div className='mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition'>
      {icon}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className='w-full outline-none text-gray-800 placeholder-gray-400'
        placeholder={label}
      />
    </div>
  </label>
)

const ProfileSkeleton = () => (
  <div className='bg-white rounded-md shadow p-6 animate-pulse space-y-4'>
    <div className='flex gap-4 items-center'>
      <div className='w-20 h-20 rounded-full bg-gray-200' />
      <div className='flex-1 space-y-3'>
        <div className='h-4 bg-gray-200 w-40 rounded' />
        <div className='h-3 bg-gray-200 w-64 rounded' />
        <div className='flex gap-3'>
          <div className='h-3 bg-gray-200 w-24 rounded' />
          <div className='h-3 bg-gray-200 w-32 rounded' />
        </div>
      </div>
    </div>
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='bg-gray-100 h-32 rounded' />
      ))}
    </div>
  </div>
)

const ProfileError = () => (
  <div className='bg-white p-6 rounded-md shadow'>
    <h2 className='text-lg font-semibold text-gray-800'>Perfil de usuario</h2>
    <p className='text-gray-500 mt-2'>No pudimos cargar la información del usuario.</p>
  </div>
)

const getInitials = (name?: string, lastname?: string) => {
  const first = name?.[0] ?? ''
  const last = lastname?.[0] ?? ''
  return `${first}${last}`.toUpperCase()
}

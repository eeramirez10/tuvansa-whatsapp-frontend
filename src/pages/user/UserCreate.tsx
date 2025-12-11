import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Mail, Phone, ShieldCheck, UserPlus, UserRound, LockKeyhole, Building2, MapPin } from 'lucide-react'
import { notify } from '../../lib/notifications/toast-sonner'

export const UserCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    branchName: '',
    branchAddress: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      notify.error('Las contraseñas no coinciden')
      return
    }

    notify.info('Creación pendiente', { description: 'Integra el endpoint de creación de usuario.' })
    navigate('/users')
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Nuevo usuario</h1>
          <p className='text-gray-500 text-sm'>Registra un usuario con sus datos básicos y credenciales.</p>
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
            <p className='text-sm text-gray-500'>Completa la información y credenciales.</p>
          </div>
        </div>

        <form className='space-y-6' onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input label='Nombre' value={form.name} onChange={value => handleChange('name', value)} icon={<UserRound className='h-4 w-4 text-amber-500' />} />
            <Input label='Apellido' value={form.lastname} onChange={value => handleChange('lastname', value)} icon={<UserRound className='h-4 w-4 text-amber-500' />} />
            <Input label='Usuario' value={form.username} onChange={value => handleChange('username', value)} />
            <Input label='Correo' value={form.email} onChange={value => handleChange('email', value)} type='email' icon={<Mail className='h-4 w-4 text-amber-500' />} />
            <Input label='Teléfono' value={form.phone} onChange={value => handleChange('phone', value)} icon={<Phone className='h-4 w-4 text-amber-500' />} />
            <Input label='Rol' value={form.role} onChange={value => handleChange('role', value)} icon={<ShieldCheck className='h-4 w-4 text-amber-500' />} />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input label='Sucursal' value={form.branchName} onChange={value => handleChange('branchName', value)} icon={<Building2 className='h-4 w-4 text-amber-500' />} />
            <Input label='Dirección de sucursal' value={form.branchAddress} onChange={value => handleChange('branchAddress', value)} icon={<MapPin className='h-4 w-4 text-amber-500' />} />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input label='Contraseña' value={form.password} onChange={value => handleChange('password', value)} type='password' icon={<LockKeyhole className='h-4 w-4 text-amber-500' />} />
            <Input label='Confirmar contraseña' value={form.confirmPassword} onChange={value => handleChange('confirmPassword', value)} type='password' icon={<LockKeyhole className='h-4 w-4 text-amber-500' />} />
          </div>

          <div className='flex flex-wrap justify-end gap-3'>
            <button
              type='button'
              onClick={() => setForm({
                name: '',
                lastname: '',
                username: '',
                email: '',
                phone: '',
                role: '',
                branchName: '',
                branchAddress: '',
                password: '',
                confirmPassword: '',
              })}
              className='px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition'
            >
              Limpiar
            </button>
            <button
              type='submit'
              className='px-6 py-2 rounded-md bg-amber-500 text-white font-semibold hover:bg-amber-600 shadow-sm transition flex items-center gap-2'
            >
              <UserPlus className='h-4 w-4' />
              Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Input = ({ label, value, onChange, type = 'text', icon }: { label: string; value: string; onChange: (value: string) => void; type?: string; icon?: React.ReactNode }) => (
  <label className='block text-sm'>
    <span className='text-gray-700 font-semibold'>{label}</span>
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

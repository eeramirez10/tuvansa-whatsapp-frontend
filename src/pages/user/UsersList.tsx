import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  CalendarClock,
  UserRound,
  Users,
} from 'lucide-react'
import type { User } from '../../interfaces/user.interface'
import { notify } from '../../lib/notifications/toast-sonner'
import { dateFormat } from '../../utils/dateFormat'

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana',
    lastname: 'López',
    username: 'alopez',
    email: 'ana.lopez@tuvansa.com',
    phone: '+52 55 1111 2222',
    role: 'Admin',
    isActive: 'true',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchOffice: {
      id: 'b1',
      name: 'CDMX Centro',
      address: 'Av. Reforma 123, CDMX',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: '2',
    name: 'Luis',
    lastname: 'Pérez',
    username: 'lperez',
    email: 'luis.perez@tuvansa.com',
    phone: '+52 55 3333 4444',
    role: 'Ventas',
    isActive: 'true',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchOffice: {
      id: 'b2',
      name: 'Monterrey',
      address: 'Av. Constitución 456, Monterrey',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: '3',
    name: 'María',
    lastname: 'García',
    username: 'mgarcia',
    email: 'maria.garcia@tuvansa.com',
    phone: '+52 55 5555 6666',
    role: 'Soporte',
    isActive: 'false',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchOffice: {
      id: 'b3',
      name: 'Guadalajara',
      address: 'Av. Vallarta 789, Guadalajara',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
]

export const UsersList = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filter, setFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(mockUsers[0]?.id ?? null)
  const [editForm, setEditForm] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    role: '',
    isActive: 'true',
  })

  useEffect(() => {
    const current = users.find(u => u.id === selectedId)
    if (!current) return
    setEditForm({
      name: current.name ?? '',
      lastname: current.lastname ?? '',
      email: current.email ?? '',
      phone: current.phone ?? '',
      role: current.role ?? '',
      isActive: current.isActive ?? 'true',
    })
  }, [selectedId, users])

  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase()
    if (!term) return users
    return users.filter(u =>
      `${u.name} ${u.lastname} ${u.email} ${u.username} ${u.role}`
        .toLowerCase()
        .includes(term)
    )
  }, [users, filter])

  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedId) ?? filteredUsers[0],
    [users, selectedId, filteredUsers]
  )

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedUser) return

    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id ? { ...u, ...editForm } : u
      )
    )
    notify.info('Edición pendiente', { description: 'Conecta con el servicio de actualización.' })
  }

  const handleToggleStatus = () => {
    if (!selectedUser) return
    const newStatus = editForm.isActive === 'true' ? 'false' : 'true'
    setEditForm(prev => ({ ...prev, isActive: newStatus }))
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, isActive: newStatus } : u))
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Usuarios</h1>
          <p className='text-gray-500 text-sm'>Lista, consulta y edita usuarios.</p>
        </div>

        <div className='flex flex-wrap gap-3'>
          <div className='flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm'>
            <Search className='h-4 w-4 text-gray-400' />
            <input
              className='outline-none text-sm'
              placeholder='Buscar por nombre, correo o rol'
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate('/users/new')}
            className='flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold shadow hover:bg-amber-600 transition'
          >
            <Users className='h-4 w-4' />
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <div className='xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow overflow-hidden'>
          <div className='overflow-auto'>
            <table className='min-w-full text-left'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-500'>
                <tr>
                  <th className='px-4 py-3'>Usuario</th>
                  <th className='px-4 py-3'>Correo</th>
                  <th className='px-4 py-3'>Rol</th>
                  <th className='px-4 py-3'>Estado</th>
                  <th className='px-4 py-3 text-right'>Acciones</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {filteredUsers.map(u => {
                  const active = `${u.isActive}`.toLowerCase() === 'true'
                  const isSelected = selectedUser?.id === u.id
                  return (
                    <tr key={u.id} className={isSelected ? 'bg-amber-50/60' : 'hover:bg-gray-50'}>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <Avatar name={u.name} lastname={u.lastname} />
                          <div>
                            <p className='font-semibold text-gray-800 capitalize'>{u.name} {u.lastname}</p>
                            <p className='text-xs text-gray-500'>{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>{u.email}</td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        <span className='px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold'>{u.role}</span>
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        <StatusPill active={active} />
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <button
                          className='inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-semibold'
                          onClick={() => setSelectedId(u.id)}
                        >
                          <Pencil className='h-4 w-4' /> Ver/Editar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className='bg-white border border-gray-100 rounded-2xl shadow p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>Detalle</h3>
              <p className='text-xs text-gray-500'>Selecciona un usuario para ver y editar.</p>
            </div>
            {selectedUser && (
              <span className='px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600'>{selectedUser.username}</span>
            )}
          </div>

          {selectedUser ? (
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <Avatar name={selectedUser.name} lastname={selectedUser.lastname} size='lg' />
                <div>
                  <p className='text-xl font-bold text-gray-900 capitalize'>{selectedUser.name} {selectedUser.lastname}</p>
                  <div className='flex gap-2 flex-wrap mt-1'>
                    <span className='px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-semibold flex items-center gap-1'>
                      <ShieldCheck className='h-3 w-3' /> {selectedUser.role}
                    </span>
                    <StatusPill active={`${selectedUser.isActive}`.toLowerCase() === 'true'} />
                  </div>
                </div>
              </div>

              <form className='space-y-3' onSubmit={handleUpdate}>
                <Input label='Nombre' value={editForm.name} onChange={value => setEditForm(prev => ({ ...prev, name: value }))} />
                <Input label='Apellido' value={editForm.lastname} onChange={value => setEditForm(prev => ({ ...prev, lastname: value }))} />
                <Input label='Correo' value={editForm.email} onChange={value => setEditForm(prev => ({ ...prev, email: value }))} icon={<Mail className='h-4 w-4 text-amber-500' />} />
                <Input label='Teléfono' value={editForm.phone} onChange={value => setEditForm(prev => ({ ...prev, phone: value }))} icon={<Phone className='h-4 w-4 text-amber-500' />} />
                <Input label='Rol' value={editForm.role} onChange={value => setEditForm(prev => ({ ...prev, role: value }))} icon={<ShieldCheck className='h-4 w-4 text-amber-500' />} />
                <div className='flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 bg-gray-50'>
                  <div>
                    <p className='text-sm font-semibold text-gray-800'>Estado</p>
                    <p className='text-xs text-gray-500'>Activa o suspende al usuario</p>
                  </div>
                  <button
                    type='button'
                    onClick={handleToggleStatus}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${editForm.isActive === 'true' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {editForm.isActive === 'true' ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <button
                  type='submit'
                  className='w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg shadow transition'
                >
                  Guardar cambios
                </button>
              </form>

              <div className='border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600'>
                <InfoRow icon={<Phone className='h-4 w-4' />} label='Teléfono' value={selectedUser.phone} />
                <InfoRow icon={<Mail className='h-4 w-4' />} label='Correo' value={selectedUser.email} />
                <InfoRow icon={<Building2 className='h-4 w-4' />} label='Sucursal' value={selectedUser.branchOffice?.name} />
                <InfoRow icon={<MapPin className='h-4 w-4' />} label='Dirección' value={selectedUser.branchOffice?.address} />
                <InfoRow icon={<CalendarClock className='h-4 w-4' />} label='Creado' value={selectedUser.createdAt ? dateFormat(selectedUser.createdAt) : '—'} />
              </div>
            </div>
          ) : (
            <div className='text-sm text-gray-500'>Selecciona un usuario en la tabla para ver el detalle.</div>
          )}
        </div>
      </div>
    </div>
  )
}

const Avatar = ({ name, lastname, size = 'md' }: { name?: string; lastname?: string; size?: 'md' | 'lg' }) => {
  const initials = `${name?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase() || <UserRound className='h-4 w-4' />
  const dimension = size === 'lg' ? 'h-12 w-12 text-lg' : 'h-10 w-10 text-base'
  return (
    <div className={`rounded-full bg-amber-100 text-amber-700 flex items-center justify-center ${dimension} font-semibold`}>
      {initials}
    </div>
  )
}

const StatusPill = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    {active ? 'Activo' : 'Inactivo'}
  </span>
)

const Input = ({ label, value, onChange, icon }: { label: string; value: string; onChange: (value: string) => void; icon?: React.ReactNode }) => (
  <label className='block text-sm'>
    <span className='text-gray-700 font-semibold'>{label}</span>
    <div className='mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition'>
      {icon}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className='w-full outline-none text-gray-800 placeholder-gray-400'
        placeholder={label}
      />
    </div>
  </label>
)

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => (
  <div className='flex items-start gap-2'>
    <span className='text-amber-500 mt-1'>{icon}</span>
    <div>
      <p className='text-xs uppercase text-gray-400 font-semibold'>{label}</p>
      <p className='text-gray-700 font-medium'>{value ?? '—'}</p>
    </div>
  </div>
)

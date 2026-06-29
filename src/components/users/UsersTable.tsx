import React from 'react'
import { BellRing, Eye, FlaskConical, UserRound } from 'lucide-react'
import type { User } from '../../interfaces/user.interface'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuario',
  BRANCH_MANAGER: 'Gerente de sucursal',
  SUPPORT: 'Soporte',
  VIEWER: 'Consulta',
}

interface UsersTableProps {
  users: User[]
  isLoading: boolean
  selectedUserId?: string | null
  onViewDetail: (id: string) => void
  onOpenNotifications: (id: string) => void
  onOpenTester: (id: string) => void
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  selectedUserId,
  onViewDetail,
  onOpenNotifications,
  onOpenTester,
}) => {
  return (
    <div className='w-full overflow-x-auto overflow-y-auto max-h-[60vh]'>
      <table className='min-w-[700px] w-full  text-left'>
        <thead className='sticky top-0 z-10 bg-gray-50 text-xs uppercase text-gray-500'>
          <tr>
            <th className='px-4 py-3'>Usuario</th>
            <th className='px-4 py-3'>Correo</th>
            <th className='px-4 py-3'>Rol</th>
            <th className='px-4 py-3'>Estado</th>
            <th className='px-4 py-3 text-right'>Acciones</th>
          </tr>
        </thead>

        <tbody className='divide-y divide-gray-100'>
          {(isLoading ? [] : users).map((user) => {
            const active = normalizeActive(user.isActive)
            const isSelected = selectedUserId === user.id
            const roleLabel = ROLE_LABELS[`${user.role ?? ''}`.toUpperCase()] ?? user.role

            return (
              <tr key={user.id} className={isSelected ? 'bg-amber-50/70' : 'hover:bg-gray-50'}>
                <td className='px-4 py-3'>
                  <div className='flex items-center gap-3'>
                    <Avatar name={user.name} lastname={user.lastname} />
                    <div>
                      <p className='font-semibold text-gray-800 capitalize'>
                        {user.name} {user.lastname}
                      </p>
                      <p className='text-xs text-gray-500'>{user.username}</p>
                    </div>
                  </div>
                </td>

                <td className='px-4 py-3 text-sm text-gray-700'>{user.email}</td>

                <td className='px-4 py-3 text-sm text-gray-700'>
                  <span className='inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700'>
                    {roleLabel}
                  </span>
                </td>

                <td className='px-4 py-3 text-sm'>
                  <StatusPill active={active} />
                </td>

                <td className='px-4 py-3'>
                  <div className='flex flex-wrap justify-end gap-2'>
                    <ActionButton
                      label='Ver detalle'
                      icon={<Eye className='h-4 w-4' />}
                      onClick={() => onViewDetail(user.id)}
                    />
                    <ActionButton
                      label='Notificaciones'
                      icon={<BellRing className='h-4 w-4' />}
                      onClick={() => onOpenNotifications(user.id)}
                    />
                    <ActionButton
                      label='Probador'
                      icon={<FlaskConical className='h-4 w-4' />}
                      onClick={() => onOpenTester(user.id)}
                    />
                  </div>
                </td>
              </tr>
            )
          })}

          {isLoading && (
            <tr>
              <td className='px-4 py-6 text-sm text-gray-500' colSpan={5}>
                Cargando usuarios...
              </td>
            </tr>
          )}

          {!isLoading && users.length === 0 && (
            <tr>
              <td className='px-4 py-6 text-sm text-gray-500' colSpan={5}>
                No se encontraron usuarios.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const ActionButton = ({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
}) => (
  <button
    type='button'
    onClick={onClick}
    className='inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
  >
    {icon}
    {label}
  </button>
)

const StatusPill = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
      active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}
  >
    {active ? 'Activo' : 'Inactivo'}
  </span>
)

const normalizeActive = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  return ['true', '1', 'active', 'activo'].includes(`${value ?? ''}`.toLowerCase())
}

const Avatar = ({
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

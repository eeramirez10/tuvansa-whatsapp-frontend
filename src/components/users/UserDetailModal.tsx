import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { Building2, CalendarClock, Mail, MapPin, Phone, Save, ShieldCheck } from 'lucide-react'
import type { UpdateUserPayload } from '../../services/users/types'
import type { User } from '../../interfaces/user.interface'
import { ROLE_OPTIONS } from '../../services/users/constants'
import { UserModalShell } from './UserModalShell'
import { Avatar, InfoRow, InputField, ROLE_LABELS, SelectField, StatusPill, ToggleField, normalizeActive } from './UserUi'

interface UserDetailModalProps {
  open: boolean
  onClose: () => void
  isAdmin: boolean
  selectedUser?: User
  editForm: UpdateUserPayload
  branchOptions: Array<{ value: string; label: string }>
  branchNameById: Map<string, string>
  selectedBranchToAdd: string
  branchesLoading: boolean
  selectedUserBranchNames: string
  selectedUserBranchAddresses: string
  allowsMultipleBranches: boolean
  isSavingUser: boolean
  dateFormat: (value: string) => string
  setEditForm: Dispatch<SetStateAction<UpdateUserPayload>>
  setSelectedBranchToAdd: (value: string) => void
  handleEditChange: (field: keyof UpdateUserPayload, value: string | boolean | string[]) => void
  handleEditRoleChange: (role: string) => void
  handleSaveUser: (event: FormEvent<HTMLFormElement>) => Promise<void>
  resetEditForm: () => void
}

export const UserDetailModal = ({
  open,
  onClose,
  isAdmin,
  selectedUser,
  editForm,
  branchOptions,
  branchNameById,
  selectedBranchToAdd,
  branchesLoading,
  selectedUserBranchNames,
  selectedUserBranchAddresses,
  allowsMultipleBranches,
  isSavingUser,
  dateFormat,
  setEditForm,
  setSelectedBranchToAdd,
  handleEditChange,
  handleEditRoleChange,
  handleSaveUser,
  resetEditForm,
}: UserDetailModalProps) => {
  return (
    <UserModalShell
      open={open}
      onClose={onClose}
      title='Detalle de usuario'
      subtitle='Información general y edición del usuario seleccionado.'
      widthClassName='max-w-4xl'
    >
      {selectedUser ? (
        <div className='space-y-5'>
          <div className='flex items-start gap-4'>
            <Avatar name={selectedUser.name} lastname={selectedUser.lastname} size='lg' />
            <div>
              <p className='text-xl font-bold capitalize text-gray-900'>
                {selectedUser.name} {selectedUser.lastname}
              </p>
              <div className='mt-2 flex flex-wrap gap-2'>
                <span className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700'>
                  <ShieldCheck className='h-3 w-3' />
                  {ROLE_LABELS[`${selectedUser.role}`.toUpperCase()] ?? selectedUser.role}
                </span>
                <StatusPill active={normalizeActive(selectedUser.isActive)} />
                <span className='rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600'>
                  {selectedUser.username}
                </span>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <form className='space-y-4 border-t border-gray-100 pt-5' onSubmit={handleSaveUser}>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <InputField label='Nombre' value={editForm.name} onChange={(value) => handleEditChange('name', value)} />
                <InputField label='Apellido' value={editForm.lastname} onChange={(value) => handleEditChange('lastname', value)} />
                <InputField label='Usuario' value={editForm.username} onChange={(value) => handleEditChange('username', value)} />
                <InputField label='Correo' value={editForm.email} onChange={(value) => handleEditChange('email', value)} type='email' />
                <InputField label='Teléfono' value={editForm.phone} onChange={(value) => handleEditChange('phone', value)} />
                <SelectField label='Rol' value={editForm.role} onChange={handleEditRoleChange} options={[...ROLE_OPTIONS]} />

                {allowsMultipleBranches ? (
                  <div className='space-y-2 md:col-span-2'>
                    <SelectField
                      label='Agregar sucursal'
                      value={selectedBranchToAdd}
                      onChange={(value) => {
                        if (!value) return
                        setEditForm((prev) => {
                          const current = prev.branchIds ?? []
                          if (current.includes(value)) return prev
                          return { ...prev, branchIds: [...current, value] }
                        })
                        setSelectedBranchToAdd('')
                      }}
                      options={branchOptions.filter((option) => !(editForm.branchIds ?? []).includes(option.value))}
                    />
                    {(editForm.branchIds ?? []).length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {(editForm.branchIds ?? []).map((branchId) => (
                          <span
                            key={branchId}
                            className='inline-flex items-center gap-2 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800'
                          >
                            <Building2 className='h-3.5 w-3.5' />
                            {branchNameById.get(branchId) ?? branchId}
                            <button
                              type='button'
                              onClick={() => handleEditChange('branchIds', (editForm.branchIds ?? []).filter((id) => id !== branchId))}
                              className='rounded-full px-1 text-amber-700 hover:bg-amber-200'
                              aria-label='Quitar sucursal'
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <SelectField
                    label='Sucursal'
                    value={editForm.branchIds?.[0] ?? ''}
                    onChange={(value) => handleEditChange('branchIds', value ? [value] : [])}
                    options={branchOptions}
                  />
                )}

                <InputField
                  label='Nueva contraseña (opcional)'
                  value={editForm.password ?? ''}
                  onChange={(value) => handleEditChange('password', value)}
                  type='password'
                />
              </div>

              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <ToggleField
                  label='Usuario activo'
                  checked={editForm.isActive}
                  onChange={(checked) => handleEditChange('isActive', checked)}
                />
                <ToggleField
                  label='Permitir asistente de WhatsApp'
                  checked={editForm.allowWhatsappAssistant}
                  onChange={(checked) => handleEditChange('allowWhatsappAssistant', checked)}
                />
              </div>

              <div className='flex justify-end gap-2 border-t border-gray-100 pt-4'>
                <button
                  type='button'
                  onClick={resetEditForm}
                  className='rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50'
                >
                  Restablecer
                </button>
                <button
                  type='submit'
                  disabled={isSavingUser || branchesLoading}
                  className='inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:bg-amber-300'
                >
                  <Save className='h-4 w-4' />
                  {isSavingUser ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          ) : (
            <div className='grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 text-sm text-gray-600 md:grid-cols-2'>
              <InfoRow icon={<Phone className='h-4 w-4' />} label='Teléfono' value={selectedUser.phone ?? '—'} />
              <InfoRow icon={<Mail className='h-4 w-4' />} label='Correo' value={selectedUser.email} />
              <InfoRow icon={<Building2 className='h-4 w-4' />} label='Sucursales' value={selectedUserBranchNames} />
              <InfoRow icon={<MapPin className='h-4 w-4' />} label='Direcciones' value={selectedUserBranchAddresses} />
              <InfoRow icon={<CalendarClock className='h-4 w-4' />} label='Creado' value={selectedUser.createdAt ? dateFormat(selectedUser.createdAt) : '—'} />
            </div>
          )}
        </div>
      ) : (
        <p className='text-sm text-gray-500'>Selecciona un usuario para ver el detalle.</p>
      )}
    </UserModalShell>
  )
}

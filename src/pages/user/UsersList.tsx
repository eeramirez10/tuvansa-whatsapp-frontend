import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  CalendarClock,
  UserRound,
  Users,
  BellRing,
  Save,
} from 'lucide-react'
import { notify } from '../../lib/notifications/toast-sonner'
import { dateFormat } from '../../utils/dateFormat'
import {
  useNotificationSettings,
  useBranchOptions,
  useSendNotificationTest,
  useSendNotificationTests,
  useUpdateUser,
  useUpsertNotificationSetting,
  useUsers
} from '../../queries/users/users-query'
import type {
  NotificationSetting,
  NotificationTestResult,
  UpdateUserPayload,
  UpsertNotificationSettingPayload
} from '../../services/users/types'
import { useAuth } from '../../hooks/useAuth'

const EVENT_OPTIONS = [
  { value: 'QUOTE_CREATED', label: 'Nueva cotización' },
  { value: 'QUOTE_VIEWED', label: 'Cotización vista' },
  { value: 'QUOTE_DOWNLOADED', label: 'Cotización descargada' },
  { value: 'QUOTE_IN_PROGRESS', label: 'En progreso' },
  { value: 'QUOTE_QUOTED', label: 'Cotizada en ERP' },
  { value: 'QUOTE_REJECTED', label: 'Rechazada' },
  { value: 'QUOTE_INVOICED', label: 'Facturada' },
]

const CHANNEL_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'WEB', label: 'Web' },
  { value: 'EMAIL', label: 'Correo' },
]

const SCOPE_OPTIONS = [
  { value: 'GLOBAL', label: 'Global' },
  { value: 'OWN_BRANCH', label: 'Solo su sucursal' },
]

const TEMPLATE_OPTIONS = [
  { value: 'QUOTE_WEB_NOTIFICATION', label: 'Aviso web básico' },
  { value: 'QUOTE_WEB_NOTIFICATION_ICONS', label: 'Aviso web con íconos' },
  { value: 'QUOTE_WORKFLOW_MANAGER_NEW', label: 'Workflow nuevo (manager)' },
  { value: 'QUOTE_WORKFLOW_MANAGER_VIEWED', label: 'Workflow vista (manager)' },
  { value: 'QUOTE_WORKFLOW_MANAGER_AFTER_DOWNLOAD', label: 'Workflow post descarga (manager)' },
  { value: 'QUOTE_WORKFLOW_MANAGER_REMINDER_PENDING_ERP', label: 'Workflow recordatorio ERP (manager)' },
  { value: 'QUOTE_WORKFLOW_MANAGER_REJECT_REASON_PENDING_ERP', label: 'Workflow motivos rechazo (manager)' },
]

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuario',
  BRANCH_MANAGER: 'Gerente de sucursal',
  SUPPORT: 'Soporte',
  VIEWER: 'Consulta',
}

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'USER', label: 'Usuario' },
  { value: 'BRANCH_MANAGER', label: 'Gerente de sucursal' },
  { value: 'SUPPORT', label: 'Soporte' },
  { value: 'VIEWER', label: 'Consulta' },
]

const EMPTY_EDIT_FORM: UpdateUserPayload = {
  name: '',
  lastname: '',
  username: '',
  email: '',
  phone: '',
  role: 'USER',
  branchIds: [],
  isActive: true,
  allowWhatsappAssistant: false,
  password: '',
}

const EMPTY_NOTIFICATION_FORM: UpsertNotificationSettingPayload = {
  userId: '',
  event: 'QUOTE_CREATED',
  channel: 'WHATSAPP',
  template: 'QUOTE_WORKFLOW_MANAGER_NEW',
  scope: 'OWN_BRANCH',
  enabled: true,
}

export const UsersList = () => {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const isAdmin = `${authUser?.role ?? ''}`.toUpperCase() === 'ADMIN'

  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers()
  const { data: branches = [], isLoading: branchesLoading } = useBranchOptions()
  const {
    data: settings = [],
    isLoading: settingsLoading,
    error: settingsError,
  } = useNotificationSettings(undefined, isAdmin)

  const upsertNotificationSettingMutation = useUpsertNotificationSetting()
  const updateUserMutation = useUpdateUser()
  const sendNotificationTestMutation = useSendNotificationTest()
  const sendNotificationTestsMutation = useSendNotificationTests()

  const [filter, setFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notificationForm, setNotificationForm] = useState<UpsertNotificationSettingPayload>(EMPTY_NOTIFICATION_FORM)
  const [notificationTestResults, setNotificationTestResults] = useState<NotificationTestResult[]>([])
  const [editForm, setEditForm] = useState<UpdateUserPayload>(EMPTY_EDIT_FORM)
  const [selectedBranchToAdd, setSelectedBranchToAdd] = useState('')
  const branchOptions = useMemo(
    () => branches.map((branch) => ({
      value: branch.id,
      label: `${branch.name}${branch.address ? ` - ${branch.address}` : ''}`,
    })),
    [branches]
  )
  const branchNameById = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch.name])),
    [branches]
  )

  useEffect(() => {
    if (!selectedId && users[0]?.id) {
      setSelectedId(users[0].id)
    }
  }, [selectedId, users])

  useEffect(() => {
    if (!notificationForm.userId && selectedId) {
      setNotificationForm((prev) => ({ ...prev, userId: selectedId }))
    }
  }, [notificationForm.userId, selectedId])

  useEffect(() => {
    if (usersError instanceof Error) {
      notify.error('Error cargando usuarios', usersError.message)
    }
  }, [usersError])

  useEffect(() => {
    if (settingsError instanceof Error && isAdmin) {
      notify.error('Error cargando notificaciones', settingsError.message)
    }
  }, [settingsError, isAdmin])

  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase()
    if (!term) return users

    return users.filter((u) => {
      const roleLabel = ROLE_LABELS[`${u.role ?? ''}`.toUpperCase()] ?? u.role
      return `${u.name} ${u.lastname} ${u.email} ${u.username} ${roleLabel}`
        .toLowerCase()
        .includes(term)
    })
  }, [users, filter])

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedId) ?? filteredUsers[0]
  }, [users, selectedId, filteredUsers])
  const selectedUserBranchIds = useMemo(
    () => (selectedUser?.branchOffices ?? []).map((branch) => branch.id),
    [selectedUser]
  )
  const selectedUserBranchNames = useMemo(
    () => (selectedUser?.branchOffices ?? []).map((branch) => branch.name).join(', '),
    [selectedUser]
  )
  const selectedUserBranchAddresses = useMemo(
    () => (selectedUser?.branchOffices ?? []).map((branch) => branch.address).filter(Boolean).join(', '),
    [selectedUser]
  )

  useEffect(() => {
    if (!selectedUser) {
      setEditForm(EMPTY_EDIT_FORM)
      setSelectedBranchToAdd('')
      return
    }
    setSelectedBranchToAdd('')
    setEditForm({
      name: selectedUser.name ?? '',
      lastname: selectedUser.lastname ?? '',
      username: selectedUser.username ?? '',
      email: selectedUser.email ?? '',
      phone: selectedUser.phone ?? '',
      role: selectedUser.role ?? 'USER',
      branchIds: selectedUserBranchIds,
      isActive: normalizeActive(selectedUser.isActive),
      allowWhatsappAssistant: Boolean(selectedUser.allowWhatsappAssistant),
      password: '',
    })
  }, [selectedUser, selectedUserBranchIds])

  const orderedSettings = useMemo(() => {
    return [...settings].sort((a, b) => {
      if (a.user?.name === b.user?.name) {
        return a.event.localeCompare(b.event)
      }
      return `${a.user?.name ?? ''}`.localeCompare(`${b.user?.name ?? ''}`)
    })
  }, [settings])

  const isSavingNotification = upsertNotificationSettingMutation.isPending
  const isSavingUser = updateUserMutation.isPending
  const isSendingTest = sendNotificationTestMutation.isPending
  const isSendingAllTests = sendNotificationTestsMutation.isPending
  const allowsMultipleBranches = editForm.role === 'BRANCH_MANAGER'

  const handleSaveNotification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!notificationForm.userId) {
      notify.error('Selecciona un usuario')
      return
    }

    await notify.promise(
      upsertNotificationSettingMutation.mutateAsync(notificationForm),
      {
        loading: 'Guardando configuración de notificación...',
        success: () => 'Configuración guardada correctamente',
        error: (error: Error) => error.message || 'No se pudo guardar'
      }
    )
  }

  const handleLoadSettingInForm = (setting: NotificationSetting) => {
    setNotificationForm({
      userId: setting.userId,
      event: setting.event,
      channel: setting.channel,
      template: setting.template,
      scope: setting.scope,
      enabled: setting.enabled,
    })
  }

  const handleEditChange = (field: keyof UpdateUserPayload, value: string | boolean | string[]) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditRoleChange = (role: string) => {
    setEditForm((prev) => {
      const branchIds = role === 'BRANCH_MANAGER'
        ? (prev.branchIds ?? [])
        : (prev.branchIds ?? []).length > 0 ? [prev.branchIds[0]] : []

      return {
        ...prev,
        role,
        branchIds
      }
    })
    if (role !== 'BRANCH_MANAGER') {
      setSelectedBranchToAdd('')
    }
  }

  const handleSaveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedUser?.id) {
      notify.error('Selecciona un usuario')
      return
    }

    if (!editForm.branchIds?.length) {
      notify.error('Selecciona al menos una sucursal')
      return
    }

    await notify.promise(
      updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        payload: {
          ...editForm,
          password: editForm.password?.trim() ? editForm.password.trim() : undefined,
        }
      }),
      {
        loading: 'Guardando usuario...',
        success: () => 'Usuario actualizado correctamente',
        error: (error: Error) => error.message || 'No se pudo actualizar el usuario'
      }
    )
  }

  const saveTestResult = (result: NotificationTestResult) => {
    setNotificationTestResults((prev) => {
      const deduped = prev.filter((item) => !(item.userId === result.userId && item.template === result.template && item.event === result.event))
      return [result, ...deduped].slice(0, 30)
    })
  }

  const handleSendTest = async (payload: {
    userId: string;
    event: string;
    channel: string;
    template: string;
  }) => {
    if (!payload.userId) {
      notify.error('Selecciona un usuario para enviar la prueba')
      return
    }

    if (`${payload.channel}`.toUpperCase() !== 'WHATSAPP') {
      notify.error('La prueba solo está disponible para canal WhatsApp')
      return
    }

    await notify.promise(
      sendNotificationTestMutation.mutateAsync(payload),
      {
        loading: 'Enviando prueba de notificación...',
        success: (result) => {
          saveTestResult(result)
          const label = result.status === 'SENT'
            ? 'Prueba enviada'
            : result.status === 'SKIPPED'
              ? 'Prueba omitida'
              : 'Prueba fallida'
          return `${label}: ${result.template}`
        },
        error: (error: Error) => error.message || 'No se pudo enviar la prueba'
      }
    )
  }

  const handleSendAllTests = async () => {
    await notify.promise(
      sendNotificationTestsMutation.mutateAsync({ enabledOnly: true, channel: 'WHATSAPP' }),
      {
        loading: 'Enviando pruebas masivas...',
        success: (response) => {
          setNotificationTestResults(response.results)
          return `Pruebas completadas. Enviadas: ${response.summary.sent}, fallidas: ${response.summary.failed}, omitidas: ${response.summary.skipped}`
        },
        error: (error: Error) => error.message || 'No se pudo enviar las pruebas'
      }
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Usuarios</h1>
          <p className='text-gray-500 text-sm'>Consulta usuarios, crea nuevas cuentas y asigna notificaciones.</p>
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
          {isAdmin && (
            <button
              onClick={() => navigate('/users/new')}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold shadow hover:bg-amber-600 transition'
            >
              <Users className='h-4 w-4' />
              Nuevo usuario
            </button>
          )}
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
                {(usersLoading ? [] : filteredUsers).map(u => {
                  const active = normalizeActive(u.isActive)
                  const isSelected = selectedUser?.id === u.id
                  const roleLabel = ROLE_LABELS[`${u.role ?? ''}`.toUpperCase()] ?? u.role
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
                        <span className='px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold'>{roleLabel}</span>
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        <StatusPill active={active} />
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <button
                          className='inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-semibold'
                          onClick={() => {
                            setSelectedId(u.id)
                            setNotificationForm((prev) => ({ ...prev, userId: u.id }))
                          }}
                        >
                          <Pencil className='h-4 w-4' /> Ver detalle
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {usersLoading && (
                  <tr>
                    <td className='px-4 py-6 text-sm text-gray-500' colSpan={5}>Cargando usuarios...</td>
                  </tr>
                )}

                {!usersLoading && filteredUsers.length === 0 && (
                  <tr>
                    <td className='px-4 py-6 text-sm text-gray-500' colSpan={5}>No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='bg-white border border-gray-100 rounded-2xl shadow p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>Detalle</h3>
              <p className='text-xs text-gray-500'>Información del usuario seleccionado.</p>
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
                      <ShieldCheck className='h-3 w-3' /> {ROLE_LABELS[`${selectedUser.role}`.toUpperCase()] ?? selectedUser.role}
                    </span>
                    <StatusPill active={normalizeActive(selectedUser.isActive)} />
                  </div>
                </div>
              </div>

              {isAdmin ? (
                <form className='border-t border-gray-100 pt-4 space-y-3' onSubmit={handleSaveUser}>
                  <div className='grid grid-cols-1 gap-3'>
                    <InputField label='Nombre' value={editForm.name} onChange={(value) => handleEditChange('name', value)} />
                    <InputField label='Apellido' value={editForm.lastname} onChange={(value) => handleEditChange('lastname', value)} />
                    <InputField label='Usuario' value={editForm.username} onChange={(value) => handleEditChange('username', value)} />
                    <InputField label='Correo' value={editForm.email} onChange={(value) => handleEditChange('email', value)} type='email' />
                    <InputField label='Teléfono' value={editForm.phone} onChange={(value) => handleEditChange('phone', value)} />

                    <SelectField
                      label='Rol'
                      value={editForm.role}
                      onChange={handleEditRoleChange}
                      options={ROLE_OPTIONS}
                    />

                    {allowsMultipleBranches ? (
                      <div className='space-y-2'>
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
                        {(editForm.branchIds ?? []).length > 0 && (
                          <div className='flex flex-wrap gap-2'>
                            {(editForm.branchIds ?? []).map((branchId) => (
                              <span
                                key={branchId}
                                className='inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold'
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
                        )}
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

                  <div className='flex justify-end gap-2 pt-2'>
                    <button
                      type='button'
                      onClick={() => {
                        if (!selectedUser) return
                        setEditForm({
                          name: selectedUser.name ?? '',
                          lastname: selectedUser.lastname ?? '',
                          username: selectedUser.username ?? '',
                          email: selectedUser.email ?? '',
                          phone: selectedUser.phone ?? '',
                          role: selectedUser.role ?? 'USER',
                          branchIds: selectedUserBranchIds,
                          isActive: normalizeActive(selectedUser.isActive),
                          allowWhatsappAssistant: Boolean(selectedUser.allowWhatsappAssistant),
                          password: '',
                        })
                        setSelectedBranchToAdd('')
                      }}
                      className='px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition'
                    >
                      Restablecer
                    </button>
                    <button
                      type='submit'
                      disabled={isSavingUser || branchesLoading}
                      className='px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:bg-amber-300 transition inline-flex items-center gap-1'
                    >
                      <Save className='h-4 w-4' />
                      {isSavingUser ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className='border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600'>
                  <InfoRow icon={<Phone className='h-4 w-4' />} label='Teléfono' value={selectedUser.phone ?? '—'} />
                  <InfoRow icon={<Mail className='h-4 w-4' />} label='Correo' value={selectedUser.email} />
                  <InfoRow icon={<Building2 className='h-4 w-4' />} label='Sucursales' value={selectedUserBranchNames} />
                  <InfoRow icon={<MapPin className='h-4 w-4' />} label='Direcciones' value={selectedUserBranchAddresses} />
                  <InfoRow icon={<CalendarClock className='h-4 w-4' />} label='Creado' value={selectedUser.createdAt ? dateFormat(selectedUser.createdAt) : '—'} />
                </div>
              )}
            </div>
          ) : (
            <div className='text-sm text-gray-500'>Selecciona un usuario en la tabla para ver el detalle.</div>
          )}
        </div>
      </div>

      {isAdmin ? (
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          <div className='xl:col-span-1 bg-white border border-gray-100 rounded-2xl shadow p-6 space-y-4'>
            <div className='flex items-center gap-2'>
              <BellRing className='h-4 w-4 text-amber-500' />
              <h2 className='text-lg font-semibold text-gray-900'>Asignar notificaciones</h2>
            </div>
            <p className='text-xs text-gray-500'>Configura qué usuario recibe cada tipo de evento.</p>

            <form className='space-y-3' onSubmit={handleSaveNotification}>
              <SelectField
                label='Usuario'
                value={notificationForm.userId}
                onChange={(value) => setNotificationForm((prev) => ({ ...prev, userId: value }))}
                options={users.map((u) => ({ value: u.id, label: `${u.name} ${u.lastname} (${u.username})` }))}
              />

              <SelectField
                label='Evento'
                value={notificationForm.event}
                onChange={(value) => setNotificationForm((prev) => ({ ...prev, event: value }))}
                options={EVENT_OPTIONS}
              />

              <SelectField
                label='Canal'
                value={notificationForm.channel}
                onChange={(value) => setNotificationForm((prev) => ({ ...prev, channel: value }))}
                options={CHANNEL_OPTIONS}
              />

              <SelectField
                label='Plantilla'
                value={notificationForm.template}
                onChange={(value) => setNotificationForm((prev) => ({ ...prev, template: value }))}
                options={TEMPLATE_OPTIONS}
              />

              <SelectField
                label='Alcance'
                value={notificationForm.scope}
                onChange={(value) => setNotificationForm((prev) => ({ ...prev, scope: value }))}
                options={SCOPE_OPTIONS}
              />

              <label className='flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2'>
                <span className='text-sm font-semibold text-gray-700'>Notificación activa</span>
                <input
                  type='checkbox'
                  checked={notificationForm.enabled}
                  onChange={(e) => setNotificationForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
              </label>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <button
                  type='submit'
                  disabled={isSavingNotification}
                  className='w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2 rounded-lg shadow transition flex items-center justify-center gap-2'
                >
                  <Save className='h-4 w-4' />
                  {isSavingNotification ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type='button'
                  disabled={isSendingTest || isSavingNotification}
                  onClick={() => handleSendTest(notificationForm)}
                  className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-lg shadow transition flex items-center justify-center gap-2'
                >
                  <BellRing className='h-4 w-4' />
                  {isSendingTest ? 'Enviando...' : 'Enviar prueba'}
                </button>
              </div>
            </form>
          </div>

          <div className='xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow overflow-hidden'>
            <div className='px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2'>
              <h3 className='text-sm font-semibold text-gray-700'>Configuraciones registradas</h3>
              <button
                type='button'
                onClick={handleSendAllTests}
                disabled={isSendingAllTests || settingsLoading || orderedSettings.length === 0}
                className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 transition'
              >
                <BellRing className='h-3.5 w-3.5' />
                {isSendingAllTests ? 'Enviando pruebas...' : 'Probar todas activas'}
              </button>
            </div>
            <div className='overflow-auto'>
              <table className='min-w-full text-left'>
                <thead className='bg-gray-50 text-xs uppercase text-gray-500'>
                  <tr>
                    <th className='px-4 py-3'>Usuario</th>
                    <th className='px-4 py-3'>Evento</th>
                    <th className='px-4 py-3'>Plantilla</th>
                    <th className='px-4 py-3'>Alcance</th>
                    <th className='px-4 py-3'>Estado</th>
                    <th className='px-4 py-3 text-right'>Acción</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {settingsLoading && (
                    <tr>
                      <td className='px-4 py-6 text-sm text-gray-500' colSpan={6}>Cargando configuraciones...</td>
                    </tr>
                  )}

                  {!settingsLoading && orderedSettings.map((setting) => (
                    <tr key={setting.id} className='hover:bg-gray-50'>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {setting.user ? `${setting.user.name} ${setting.user.lastname}` : setting.userId}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {EVENT_OPTIONS.find((option) => option.value === setting.event)?.label ?? setting.event}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {TEMPLATE_OPTIONS.find((option) => option.value === setting.template)?.label ?? setting.template}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {SCOPE_OPTIONS.find((option) => option.value === setting.scope)?.label ?? setting.scope}
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        <StatusPill active={setting.enabled} />
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <div className='inline-flex items-center gap-3'>
                          <button
                            className='inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-semibold'
                            onClick={() => handleLoadSettingInForm(setting)}
                          >
                            <Pencil className='h-4 w-4' /> Cargar
                          </button>
                          <button
                            className='inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold disabled:text-blue-300'
                            disabled={isSendingTest}
                            onClick={() => handleSendTest({
                              userId: setting.userId,
                              event: setting.event,
                              channel: setting.channel,
                              template: setting.template
                            })}
                          >
                            <BellRing className='h-4 w-4' /> Probar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!settingsLoading && orderedSettings.length === 0 && (
                    <tr>
                      <td className='px-4 py-6 text-sm text-gray-500' colSpan={6}>Aún no hay configuraciones de notificación.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='border-t border-gray-100 p-4 space-y-3'>
              <div>
                <p className='text-sm font-semibold text-gray-800'>Resultados de prueba</p>
                <p className='text-xs text-gray-500'>La prueba envía la leyenda: <span className='font-semibold'>PRUEBA DE NOTIFICACIÓN</span> y el nombre del template.</p>
              </div>
              {notificationTestResults.length === 0 ? (
                <p className='text-sm text-gray-500'>Aún no has ejecutado pruebas.</p>
              ) : (
                <div className='max-h-52 overflow-auto divide-y divide-gray-100'>
                  {notificationTestResults.map((result) => (
                    <div key={`${result.userId}-${result.template}-${result.event}-${result.sentAt}`} className='py-2 flex flex-col gap-1 text-xs'>
                      <div className='flex items-center justify-between gap-2 flex-wrap'>
                        <span className='font-semibold text-gray-700'>{result.userName}</span>
                        <span className={`px-2 py-1 rounded-full font-semibold ${result.status === 'SENT' ? 'bg-green-100 text-green-700' : result.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {result.status}
                        </span>
                      </div>
                      <p className='text-gray-600'>
                        Template: <span className='font-semibold'>{result.template}</span> | Evento: <span className='font-semibold'>{result.event}</span>
                      </p>
                      <p className='text-gray-500'>{result.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
          Solo usuarios con rol administrador pueden gestionar notificaciones y crear usuarios.
        </div>
      )}
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

const InfoRow = ({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) => (
  <div className='flex items-start gap-2'>
    <span className='text-amber-500 mt-1'>{icon}</span>
    <div>
      <p className='text-xs uppercase text-gray-400 font-semibold'>{label}</p>
      <p className='text-gray-700 font-medium'>{value ?? '—'}</p>
    </div>
  </div>
)

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <label className='block text-sm'>
    <span className='text-gray-700 font-semibold'>{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
      placeholder={label}
    />
  </label>
)

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) => (
  <label className='block text-sm'>
    <span className='text-gray-700 font-semibold'>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
    >
      <option value=''>Selecciona una opción</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
)

const ToggleField = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className='flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm'>
    <span className='text-gray-700 font-semibold'>{label}</span>
    <input
      type='checkbox'
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
)

const normalizeActive = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  return ['true', '1', 'active', 'activo'].includes(`${value ?? ''}`.toLowerCase())
}

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { notify } from '../../../lib/notifications/toast-sonner'
import {
  useBranchOptions,
  useDeleteNotificationSetting,
  useNotificationSettings,
  useSendNotificationTest,
  useSendNotificationTests,
  useUpdateUser,
  useUpdateWorkflowReminderConfig,
  useUpsertNotificationSetting,
  useUsers,
  useWorkflowReminderConfig,
} from '../../../queries/users/users-query'
import type {
  NotificationSetting,
  NotificationTestResult,
  UpdateUserPayload,
  UpsertNotificationSettingPayload,
} from '../../../services/users/types'
import { ROLE_LABELS, roleAllowsMultipleBranches } from '../../../services/users/constants'
import { dateFormat } from '../../../utils/dateFormat'

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

export const useUsersListPage = () => {
  const { user: authUser } = useAuth()
  const isAdmin = `${authUser?.role ?? ''}`.toUpperCase() === 'ADMIN'

  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers()
  const { data: branches = [], isLoading: branchesLoading } = useBranchOptions()
  const {
    data: settings = [],
    isLoading: settingsLoading,
    error: settingsError,
  } = useNotificationSettings(undefined, isAdmin)
  const {
    data: workflowReminderConfig,
    isLoading: workflowReminderConfigLoading,
    error: workflowReminderConfigError,
  } = useWorkflowReminderConfig(isAdmin)

  const upsertNotificationSettingMutation = useUpsertNotificationSetting()
  const deleteNotificationSettingMutation = useDeleteNotificationSetting()
  const updateUserMutation = useUpdateUser()
  const sendNotificationTestMutation = useSendNotificationTest()
  const sendNotificationTestsMutation = useSendNotificationTests()
  const updateWorkflowReminderConfigMutation = useUpdateWorkflowReminderConfig()

  const [filter, setFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notificationForm, setNotificationForm] = useState<UpsertNotificationSettingPayload>(EMPTY_NOTIFICATION_FORM)
  const [notificationTestResults, setNotificationTestResults] = useState<NotificationTestResult[]>([])
  const [workflowReminderEnabled, setWorkflowReminderEnabled] = useState(true)
  const [editForm, setEditForm] = useState<UpdateUserPayload>(EMPTY_EDIT_FORM)
  const [selectedBranchToAdd, setSelectedBranchToAdd] = useState('')

  const branchOptions = useMemo(
    () =>
      branches.map((branch) => ({
        value: branch.id,
        label: `${branch.name}${branch.address ? ` - ${branch.address}` : ''}`,
      })),
    [branches],
  )

  const branchNameById = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch.name])),
    [branches],
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

  useEffect(() => {
    if (workflowReminderConfigError instanceof Error && isAdmin) {
      notify.error('Error cargando configuración de recordatorios', workflowReminderConfigError.message)
    }
  }, [workflowReminderConfigError, isAdmin])

  useEffect(() => {
    if (workflowReminderConfig?.enabled === undefined) return
    setWorkflowReminderEnabled(Boolean(workflowReminderConfig.enabled))
  }, [workflowReminderConfig])

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
    [selectedUser],
  )

  const selectedUserBranchNames = useMemo(
    () => (selectedUser?.branchOffices ?? []).map((branch) => branch.name).join(', '),
    [selectedUser],
  )

  const selectedUserBranchAddresses = useMemo(
    () => (selectedUser?.branchOffices ?? []).map((branch) => branch.address).filter(Boolean).join(', '),
    [selectedUser],
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
  const isDeletingNotification = deleteNotificationSettingMutation.isPending
  const isSavingUser = updateUserMutation.isPending
  const isSendingTest = sendNotificationTestMutation.isPending
  const isSendingAllTests = sendNotificationTestsMutation.isPending
  const isUpdatingWorkflowReminderConfig = updateWorkflowReminderConfigMutation.isPending
  const allowsMultipleBranches = roleAllowsMultipleBranches(editForm.role)

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
      const branchIds = roleAllowsMultipleBranches(role)
        ? (prev.branchIds ?? [])
        : (prev.branchIds ?? []).length > 0
          ? [prev.branchIds[0]]
          : []

      return {
        ...prev,
        role,
        branchIds,
      }
    })

    if (!roleAllowsMultipleBranches(role)) {
      setSelectedBranchToAdd('')
    }
  }

  const resetEditForm = () => {
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
        },
      }),
      {
        loading: 'Guardando usuario...',
        success: () => 'Usuario actualizado correctamente',
        error: (error: Error) => error.message || 'No se pudo actualizar el usuario',
      },
    )
  }

  const handleSaveNotification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!notificationForm.userId) {
      notify.error('Selecciona un usuario')
      return
    }

    await notify.promise(upsertNotificationSettingMutation.mutateAsync(notificationForm), {
      loading: 'Guardando configuración de notificación...',
      success: () => 'Configuración guardada correctamente',
      error: (error: Error) => error.message || 'No se pudo guardar',
    })
  }

  const saveTestResult = (result: NotificationTestResult) => {
    setNotificationTestResults((prev) => {
      const deduped = prev.filter(
        (item) => !(item.userId === result.userId && item.template === result.template && item.event === result.event),
      )
      return [result, ...deduped].slice(0, 30)
    })
  }

  const handleSendTest = async (payload: {
    userId: string
    event: string
    channel: string
    template: string
  }) => {
    if (!payload.userId) {
      notify.error('Selecciona un usuario para enviar la prueba')
      return
    }

    if (`${payload.channel}`.toUpperCase() !== 'WHATSAPP') {
      notify.error('La prueba solo está disponible para canal WhatsApp')
      return
    }

    await notify.promise(sendNotificationTestMutation.mutateAsync(payload), {
      loading: 'Enviando prueba de notificación...',
      success: (result) => {
        saveTestResult(result)
        const label = result.status === 'SENT' ? 'Prueba enviada' : result.status === 'SKIPPED' ? 'Prueba omitida' : 'Prueba fallida'
        return `${label}: ${result.template}`
      },
      error: (error: Error) => error.message || 'No se pudo enviar la prueba',
    })
  }

  const handleSendAllTests = async () => {
    await notify.promise(sendNotificationTestsMutation.mutateAsync({ enabledOnly: true, channel: 'WHATSAPP' }), {
      loading: 'Enviando pruebas masivas...',
      success: (response) => {
        setNotificationTestResults(response.results)
        return `Pruebas completadas. Enviadas: ${response.summary.sent}, fallidas: ${response.summary.failed}, omitidas: ${response.summary.skipped}`
      },
      error: (error: Error) => error.message || 'No se pudo enviar las pruebas',
    })
  }

  const handleSaveWorkflowReminderConfig = async () => {
    await notify.promise(updateWorkflowReminderConfigMutation.mutateAsync({ enabled: workflowReminderEnabled }), {
      loading: 'Guardando configuración del recordatorio...',
      success: () =>
        workflowReminderEnabled ? 'Recordatorio en progreso activado' : 'Recordatorio en progreso desactivado',
      error: (error: Error) => error.message || 'No se pudo guardar la configuración',
    })
  }

  const handleDeleteNotificationSetting = async (settingId: string) => {
    await notify.promise(deleteNotificationSettingMutation.mutateAsync(settingId), {
      loading: 'Eliminando configuración...',
      success: () => 'Configuración eliminada',
      error: (error: Error) => error.message || 'No se pudo eliminar la configuración',
    })
  }

  return {
    dateFormat,
    isAdmin,
    users,
    filteredUsers,
    usersLoading,
    branchesLoading,
    branchOptions,
    branchNameById,
    orderedSettings,
    settingsLoading,
    workflowReminderConfigLoading,
    filter,
    setFilter,
    selectedId,
    setSelectedId,
    selectedUser,
    selectedUserBranchIds,
    selectedUserBranchNames,
    selectedUserBranchAddresses,
    notificationForm,
    setNotificationForm,
    notificationTestResults,
    workflowReminderEnabled,
    setWorkflowReminderEnabled,
    editForm,
    setEditForm,
    selectedBranchToAdd,
    setSelectedBranchToAdd,
    isSavingNotification,
    isDeletingNotification,
    isSavingUser,
    isSendingTest,
    isSendingAllTests,
    isUpdatingWorkflowReminderConfig,
    allowsMultipleBranches,
    handleLoadSettingInForm,
    handleEditChange,
    handleEditRoleChange,
    handleSaveUser,
    handleSaveNotification,
    handleSendTest,
    handleSendAllTests,
    handleSaveWorkflowReminderConfig,
    handleDeleteNotificationSetting,
    resetEditForm,
  }
}

const normalizeActive = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  return ['true', '1', 'active', 'activo'].includes(`${value ?? ''}`.toLowerCase())
}

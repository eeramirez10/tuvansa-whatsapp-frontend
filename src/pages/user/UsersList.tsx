import { useMemo, useState } from 'react'
import { BellRing, Search, Settings2, Users } from 'lucide-react'
import { useNavigate } from 'react-router'
import { UserDetailModal } from '../../components/users/UserDetailModal'
import { UserNotificationTesterModal } from '../../components/users/UserNotificationTesterModal'
import { UserNotificationsModal } from '../../components/users/UserNotificationsModal'
import { UsersTable } from '../../components/users/UsersTable'
import { normalizeActive } from '../../components/users/UserUi'
import { useAuth } from '../../hooks/useAuth'
import type { NotificationSetting } from '../../services/users/types'
import { canCreateUsers } from '../../services/users/constants'
import { useUsersListPage } from './hooks/useUsersListPage'

export const UsersList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [detailOpen, setDetailOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [testerOpen, setTesterOpen] = useState(false)

  const {
    dateFormat,
    isAdmin,
    canManageUsers,
    users,
    filteredUsers,
    usersLoading,
    branchesLoading,
    branchOptions,
    branchNameById,
    orderedSettings,
    selectedUserNotificationSettings,
    settingsLoading,
    workflowReminderConfigLoading,
    filter,
    setFilter,
    setSelectedId,
    selectedUser,
    selectedUserBranchNames,
    selectedUserBranchAddresses,
    notificationForm,
    setNotificationForm,
    notificationTestResults,
    workflowReminderEnabled,
    setWorkflowReminderEnabled,
    editForm,
    setEditForm,
    editRoleOptions,
    selectedBranchToAdd,
    setSelectedBranchToAdd,
    isSavingNotification,
    isDeletingNotification,
    isDeletingUser,
    isSavingUser,
    isSendingTest,
    isSendingAllTests,
    isUpdatingWorkflowReminderConfig,
    allowsMultipleBranches,
    handleLoadSettingInForm,
    handleSelectNotificationUser,
    handleStartNewNotificationSetting,
    handleEditChange,
    handleEditRoleChange,
    handleSaveUser,
    handleDeleteUser,
    handleSaveNotification,
    handleSendTest,
    handleSendAllTests,
    handleSaveWorkflowReminderConfig,
    handleDeleteNotificationSetting,
    resetEditForm,
  } = useUsersListPage()

  const canOpenUserCreate = canCreateUsers(user?.role)

  const activeUsers = useMemo(
    () => filteredUsers.filter((userItem) => normalizeActive(userItem.isActive)).length,
    [filteredUsers],
  )

  const openUserDetail = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  const openNotifications = (id: string) => {
    setSelectedId(id)
    handleSelectNotificationUser(id)
    setNotificationsOpen(true)
  }

  const openTester = (id: string) => {
    setSelectedId(id)
    setNotificationForm((prev) => ({ ...prev, userId: id }))
    setTesterOpen(true)
  }

  const openNotificationsFromSetting = (setting: NotificationSetting) => {
    handleLoadSettingInForm(setting)
    setNotificationsOpen(true)
    setTesterOpen(false)
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Usuarios</h1>
          <p className='text-sm text-gray-500'>
            Administra vendedores y revisa su configuración sin mezclar toda la operación en una sola vista.
          </p>
        </div>

        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm'>
            <Search className='h-4 w-4 text-gray-400' />
            <input
              className='w-full text-sm lg:w-96 border-1 border-gray-200'
              placeholder='Buscar por nombre, correo o rol'
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>

          {canOpenUserCreate ? (
            <button
              type='button'
              onClick={() => navigate('/users/new')}
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white shadow transition hover:bg-amber-600'
            >
              <Users className='h-4 w-4' />
              Nuevo usuario
            </button>
          ) : null}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <SummaryCard label='Usuarios visibles' value={filteredUsers.length} tone='slate' />
          <SummaryCard label='Usuarios activos' value={activeUsers} tone='emerald' />
          <SummaryCard label='Configuraciones' value={orderedSettings.length} tone='amber' />
        </div>
      </div>

      <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow'>
        <UsersTable
          users={filteredUsers}
          isLoading={usersLoading}
          selectedUserId={selectedUser?.id ?? null}
          canManageNotifications={isAdmin}
          onViewDetail={openUserDetail}
          onOpenNotifications={openNotifications}
          onOpenTester={openTester}
        />
      </div>

      {!canOpenUserCreate ? (
        <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
          Solo usuarios con rol administrador o coordinador de ventas pueden crear usuarios.
        </div>
      ) : null}

      <UserDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        canManageUsers={canManageUsers}
        selectedUser={selectedUser}
        editForm={editForm}
        roleOptions={editRoleOptions}
        branchOptions={branchOptions}
        branchNameById={branchNameById}
        selectedBranchToAdd={selectedBranchToAdd}
        branchesLoading={branchesLoading}
        selectedUserBranchNames={selectedUserBranchNames}
        selectedUserBranchAddresses={selectedUserBranchAddresses}
        allowsMultipleBranches={allowsMultipleBranches}
        isSavingUser={isSavingUser}
        isDeletingUser={isDeletingUser}
        dateFormat={dateFormat}
        setEditForm={setEditForm}
        setSelectedBranchToAdd={setSelectedBranchToAdd}
        handleEditChange={handleEditChange}
        handleEditRoleChange={handleEditRoleChange}
        handleSaveUser={handleSaveUser}
        handleDeleteUser={handleDeleteUser}
        resetEditForm={resetEditForm}
      />

      <UserNotificationsModal
        open={notificationsOpen && isAdmin}
        onClose={() => setNotificationsOpen(false)}
        users={users}
        notificationForm={notificationForm}
        notificationSettings={selectedUserNotificationSettings}
        settingsLoading={settingsLoading}
        workflowReminderEnabled={workflowReminderEnabled}
        workflowReminderConfigLoading={workflowReminderConfigLoading}
        isSavingNotification={isSavingNotification}
        isSendingTest={isSendingTest}
        isUpdatingWorkflowReminderConfig={isUpdatingWorkflowReminderConfig}
        setNotificationForm={setNotificationForm}
        handleLoadSettingInForm={handleLoadSettingInForm}
        handleSelectNotificationUser={handleSelectNotificationUser}
        handleStartNewNotificationSetting={handleStartNewNotificationSetting}
        setWorkflowReminderEnabled={setWorkflowReminderEnabled}
        handleSaveNotification={handleSaveNotification}
        handleSendTest={handleSendTest}
        handleSaveWorkflowReminderConfig={handleSaveWorkflowReminderConfig}
      />

      <UserNotificationTesterModal
        open={testerOpen && isAdmin}
        onClose={() => setTesterOpen(false)}
        orderedSettings={orderedSettings}
        settingsLoading={settingsLoading}
        notificationTestResults={notificationTestResults}
        isSendingTest={isSendingTest}
        isSendingAllTests={isSendingAllTests}
        isDeletingNotification={isDeletingNotification}
        handleLoadSettingInForm={handleLoadSettingInForm}
        handleSendTest={handleSendTest}
        handleSendAllTests={handleSendAllTests}
        handleDeleteNotificationSetting={handleDeleteNotificationSetting}
        openNotificationsModalFromSetting={openNotificationsFromSetting}
      />
    </div>
  )
}

const SummaryCard = ({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'slate' | 'emerald' | 'amber'
}) => {
  const tones = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  }

  const icons = {
    slate: <Users className='h-4 w-4' />,
    emerald: <BellRing className='h-4 w-4' />,
    amber: <Settings2 className='h-4 w-4' />,
  }

  return (
    <div className={`rounded-xl border px-4 py-4 ${tones[tone]}`}>
      <div className='flex items-center justify-between gap-3'>
        <span className='text-sm font-semibold'>{label}</span>
        <span>{icons[tone]}</span>
      </div>
      <p className='mt-3 text-2xl font-bold'>{value}</p>
    </div>
  )
}

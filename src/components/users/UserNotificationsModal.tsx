import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { BellRing, Plus, Save } from 'lucide-react'
import type { NotificationSetting, UpsertNotificationSettingPayload } from '../../services/users/types'
import { CHANNEL_OPTIONS, EVENT_OPTIONS, SCOPE_OPTIONS, TEMPLATE_OPTIONS } from './UserNotificationOptions'
import { SelectField } from './UserUi'
import { UserModalShell } from './UserModalShell'

interface UserNotificationsModalProps {
  open: boolean
  onClose: () => void
  users: Array<{ id: string; name: string; lastname: string; username: string }>
  notificationForm: UpsertNotificationSettingPayload
  notificationSettings: NotificationSetting[]
  settingsLoading: boolean
  workflowReminderEnabled: boolean
  workflowReminderConfigLoading: boolean
  isSavingNotification: boolean
  isSendingTest: boolean
  isUpdatingWorkflowReminderConfig: boolean
  setNotificationForm: Dispatch<SetStateAction<UpsertNotificationSettingPayload>>
  handleLoadSettingInForm: (setting: NotificationSetting) => void
  handleSelectNotificationUser: (userId: string) => void
  handleStartNewNotificationSetting: () => void
  setWorkflowReminderEnabled: (value: boolean) => void
  handleSaveNotification: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleSendTest: (payload: { userId: string; event: string; channel: string; template: string }) => Promise<void>
  handleSaveWorkflowReminderConfig: () => Promise<void>
}

export const UserNotificationsModal = ({
  open,
  onClose,
  users,
  notificationForm,
  notificationSettings,
  settingsLoading,
  workflowReminderEnabled,
  workflowReminderConfigLoading,
  isSavingNotification,
  isSendingTest,
  isUpdatingWorkflowReminderConfig,
  setNotificationForm,
  handleLoadSettingInForm,
  handleSelectNotificationUser,
  handleStartNewNotificationSetting,
  setWorkflowReminderEnabled,
  handleSaveNotification,
  handleSendTest,
  handleSaveWorkflowReminderConfig,
}: UserNotificationsModalProps) => {
  const selectedSetting = notificationSettings.find(
    (setting) => setting.event === notificationForm.event && setting.channel === notificationForm.channel,
  )

  const registeredSettingOptions = notificationSettings.map((setting) => {
    const eventLabel = EVENT_OPTIONS.find((option) => option.value === setting.event)?.label ?? setting.event
    const channelLabel = CHANNEL_OPTIONS.find((option) => option.value === setting.channel)?.label ?? setting.channel
    const templateLabel = TEMPLATE_OPTIONS.find((option) => option.value === setting.template)?.label ?? setting.template
    const statusLabel = setting.enabled ? 'Activa' : 'Inactiva'

    return {
      value: setting.id,
      label: `${eventLabel} · ${channelLabel} · ${templateLabel} · ${statusLabel}`,
    }
  })

  return (
    <UserModalShell
      open={open}
      onClose={onClose}
      title='Configurar notificaciones'
      subtitle='Consulta las configuraciones reales del usuario y edita cada evento por separado.'
      widthClassName='max-w-2xl'
    >
      <div className='space-y-5'>
        <form className='space-y-3' onSubmit={handleSaveNotification}>
          <SelectField
            label='Usuario'
            value={notificationForm.userId}
            onChange={handleSelectNotificationUser}
            options={users.map((user) => ({ value: user.id, label: `${user.name} ${user.lastname} (${user.username})` }))}
          />

          <div className='space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm font-semibold text-gray-800'>Configuraciones registradas</p>
                <p className='text-xs text-gray-500'>
                  {settingsLoading
                    ? 'Cargando configuraciones...'
                    : `${notificationSettings.length} configuración${notificationSettings.length === 1 ? '' : 'es'} para este usuario`}
                </p>
              </div>
              <button
                type='button'
                onClick={handleStartNewNotificationSetting}
                disabled={!notificationForm.userId || settingsLoading}
                className='inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed disabled:text-gray-400'
              >
                <Plus className='h-4 w-4' />
                Nueva configuración
              </button>
            </div>

            {notificationSettings.length > 0 ? (
              <SelectField
                label='Configuración guardada'
                value={selectedSetting?.id ?? ''}
                onChange={(settingId) => {
                  const setting = notificationSettings.find((item) => item.id === settingId)
                  if (setting) handleLoadSettingInForm(setting)
                }}
                options={registeredSettingOptions}
              />
            ) : !settingsLoading ? (
              <p className='rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-xs text-gray-500'>
                Este usuario no tiene configuraciones registradas. El formulario muestra valores iniciales para crear una.
              </p>
            ) : null}
          </div>

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
              onChange={(event) => setNotificationForm((prev) => ({ ...prev, enabled: event.target.checked }))}
            />
          </label>

          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            <button
              type='submit'
              disabled={isSavingNotification}
              className='flex items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 font-semibold text-white shadow transition hover:bg-amber-600 disabled:bg-amber-300'
            >
              <Save className='h-4 w-4' />
              {isSavingNotification ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type='button'
              disabled={isSendingTest || isSavingNotification}
              onClick={() => handleSendTest(notificationForm)}
              className='flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 font-semibold text-white shadow transition hover:bg-blue-700 disabled:bg-blue-300'
            >
              <BellRing className='h-4 w-4' />
              {isSendingTest ? 'Enviando...' : 'Enviar prueba'}
            </button>
          </div>
        </form>

        <div className='space-y-3 border-t border-gray-100 pt-5'>
          <div>
            <p className='text-sm font-semibold text-gray-800'>Recordatorio global del sistema</p>
            <p className='text-xs text-gray-500'>Esta opción aplica de forma general y no pertenece al usuario seleccionado.</p>
          </div>
          <p className='text-xs text-gray-500'>
            Controla si se envía la notificación al manager cuando la cotización pasa a <span className='font-semibold'>En progreso</span>.
          </p>
          <label className='flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2'>
            <span className='text-sm font-semibold text-gray-700'>Notificación “En progreso” activa</span>
            <input
              type='checkbox'
              checked={workflowReminderEnabled}
              disabled={workflowReminderConfigLoading}
              onChange={(event) => setWorkflowReminderEnabled(event.target.checked)}
            />
          </label>
          <button
            type='button'
            onClick={handleSaveWorkflowReminderConfig}
            disabled={workflowReminderConfigLoading || isUpdatingWorkflowReminderConfig}
            className='w-full rounded-lg bg-slate-700 py-2 font-semibold text-white shadow transition hover:bg-slate-800 disabled:bg-slate-400'
          >
            {isUpdatingWorkflowReminderConfig ? 'Guardando configuración...' : 'Guardar configuración de recordatorio'}
          </button>
        </div>
      </div>
    </UserModalShell>
  )
}

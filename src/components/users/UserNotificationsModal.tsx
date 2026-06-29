import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { BellRing, Save } from 'lucide-react'
import type { UpsertNotificationSettingPayload } from '../../services/users/types'
import { CHANNEL_OPTIONS, EVENT_OPTIONS, SCOPE_OPTIONS, TEMPLATE_OPTIONS } from './UserNotificationOptions'
import { SelectField } from './UserUi'
import { UserModalShell } from './UserModalShell'

interface UserNotificationsModalProps {
  open: boolean
  onClose: () => void
  users: Array<{ id: string; name: string; lastname: string; username: string }>
  notificationForm: UpsertNotificationSettingPayload
  workflowReminderEnabled: boolean
  workflowReminderConfigLoading: boolean
  isSavingNotification: boolean
  isSendingTest: boolean
  isUpdatingWorkflowReminderConfig: boolean
  setNotificationForm: Dispatch<SetStateAction<UpsertNotificationSettingPayload>>
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
  workflowReminderEnabled,
  workflowReminderConfigLoading,
  isSavingNotification,
  isSendingTest,
  isUpdatingWorkflowReminderConfig,
  setNotificationForm,
  setWorkflowReminderEnabled,
  handleSaveNotification,
  handleSendTest,
  handleSaveWorkflowReminderConfig,
}: UserNotificationsModalProps) => {
  return (
    <UserModalShell
      open={open}
      onClose={onClose}
      title='Asignar notificaciones'
      subtitle='Configura qué usuario recibe cada tipo de evento y controla el recordatorio de workflow.'
      widthClassName='max-w-2xl'
    >
      <div className='space-y-5'>
        <form className='space-y-3' onSubmit={handleSaveNotification}>
          <SelectField
            label='Usuario'
            value={notificationForm.userId}
            onChange={(value) => setNotificationForm((prev) => ({ ...prev, userId: value }))}
            options={users.map((user) => ({ value: user.id, label: `${user.name} ${user.lastname} (${user.username})` }))}
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

import { BellRing, Pencil, Trash2 } from 'lucide-react'
import type { NotificationSetting, NotificationTestResult } from '../../services/users/types'
import { EVENT_OPTIONS, SCOPE_OPTIONS, TEMPLATE_OPTIONS } from './UserNotificationOptions'
import { StatusPill } from './UserUi'
import { UserModalShell } from './UserModalShell'

interface UserNotificationTesterModalProps {
  open: boolean
  onClose: () => void
  orderedSettings: NotificationSetting[]
  settingsLoading: boolean
  notificationTestResults: NotificationTestResult[]
  isSendingTest: boolean
  isSendingAllTests: boolean
  isDeletingNotification: boolean
  handleLoadSettingInForm: (setting: NotificationSetting) => void
  handleSendTest: (payload: { userId: string; event: string; channel: string; template: string }) => Promise<void>
  handleSendAllTests: () => Promise<void>
  handleDeleteNotificationSetting: (settingId: string) => Promise<void>
  openNotificationsModalFromSetting: (setting: NotificationSetting) => void
}

export const UserNotificationTesterModal = ({
  open,
  onClose,
  orderedSettings,
  settingsLoading,
  notificationTestResults,
  isSendingTest,
  isSendingAllTests,
  isDeletingNotification,
  handleLoadSettingInForm,
  handleSendTest,
  handleSendAllTests,
  handleDeleteNotificationSetting,
  openNotificationsModalFromSetting,
}: UserNotificationTesterModalProps) => {
  return (
    <UserModalShell
      open={open}
      onClose={onClose}
      title='Probador de notificaciones'
      subtitle='Revisa configuraciones registradas y ejecuta pruebas de entrega.'
      widthClassName='max-w-5xl'
    >
      <div className='space-y-5'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h3 className='text-sm font-semibold text-gray-800'>Configuraciones registradas</h3>
            <p className='text-xs text-gray-500'>Edita una configuración o lanza pruebas unitarias y masivas.</p>
          </div>
          <button
            type='button'
            onClick={handleSendAllTests}
            disabled={isSendingAllTests || settingsLoading || orderedSettings.length === 0}
            className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300'
          >
            <BellRing className='h-3.5 w-3.5' />
            {isSendingAllTests ? 'Enviando pruebas...' : 'Probar todas activas'}
          </button>
        </div>

        <div className='overflow-auto rounded-xl border border-gray-100'>
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
              {settingsLoading ? (
                <tr>
                  <td className='px-4 py-6 text-sm text-gray-500' colSpan={6}>
                    Cargando configuraciones...
                  </td>
                </tr>
              ) : null}

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
                        type='button'
                        className='inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700'
                        onClick={() => {
                          handleLoadSettingInForm(setting)
                          openNotificationsModalFromSetting(setting)
                        }}
                      >
                        <Pencil className='h-4 w-4' /> Cargar
                      </button>
                      <button
                        type='button'
                        className='inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-blue-300'
                        disabled={isSendingTest || isDeletingNotification}
                        onClick={() =>
                          handleSendTest({
                            userId: setting.userId,
                            event: setting.event,
                            channel: setting.channel,
                            template: setting.template,
                          })
                        }
                      >
                        <BellRing className='h-4 w-4' /> Probar
                      </button>
                      <button
                        type='button'
                        className='inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 disabled:text-red-300'
                        disabled={isDeletingNotification || isSendingTest}
                        onClick={() => {
                          if (!window.confirm('Se eliminará la configuración de notificación por completo. ¿Deseas continuar?')) return
                          handleDeleteNotificationSetting(setting.id)
                        }}
                      >
                        <Trash2 className='h-4 w-4' /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!settingsLoading && orderedSettings.length === 0 ? (
                <tr>
                  <td className='px-4 py-6 text-sm text-gray-500' colSpan={6}>
                    Aún no hay configuraciones de notificación.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className='space-y-3 border-t border-gray-100 pt-5'>
          <div>
            <p className='text-sm font-semibold text-gray-800'>Resultados de prueba</p>
            <p className='text-xs text-gray-500'>
              La prueba envía la leyenda: <span className='font-semibold'>PRUEBA DE NOTIFICACIÓN</span> y el nombre del template.
            </p>
          </div>
          {notificationTestResults.length === 0 ? (
            <p className='text-sm text-gray-500'>Aún no has ejecutado pruebas.</p>
          ) : (
            <div className='max-h-64 divide-y divide-gray-100 overflow-auto'>
              {notificationTestResults.map((result) => (
                <div key={`${result.userId}-${result.template}-${result.event}-${result.sentAt}`} className='flex flex-col gap-1 py-2 text-xs'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <span className='font-semibold text-gray-700'>{result.userName}</span>
                    <span
                      className={`rounded-full px-2 py-1 font-semibold ${
                        result.status === 'SENT'
                          ? 'bg-green-100 text-green-700'
                          : result.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <p className='text-gray-600'>
                    Template: <span className='font-semibold'>{result.template}</span> | Evento:{' '}
                    <span className='font-semibold'>{result.event}</span>
                  </p>
                  <p className='text-gray-500'>{result.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserModalShell>
  )
}

export const EVENT_OPTIONS = [
  { value: 'QUOTE_CREATED', label: 'Nueva cotización' },
  { value: 'QUOTE_VIEWED', label: 'Cotización vista' },
  { value: 'QUOTE_DOWNLOADED', label: 'Cotización descargada' },
  { value: 'QUOTE_IN_PROGRESS', label: 'En progreso' },
  { value: 'QUOTE_QUOTED', label: 'Cotizada en ERP' },
  { value: 'QUOTE_REJECTED', label: 'Rechazada' },
  { value: 'QUOTE_INVOICED', label: 'Facturada' },
]

export const CHANNEL_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'WEB', label: 'Web' },
  { value: 'EMAIL', label: 'Correo' },
]

export const SCOPE_OPTIONS = [
  { value: 'GLOBAL', label: 'Global' },
  { value: 'OWN_BRANCH', label: 'Solo su sucursal' },
]

export const TEMPLATE_OPTIONS = [
  { value: 'QUOTE_WEB_NOTIFICATION', label: 'Aviso web básico' },
  { value: 'QUOTE_WEB_NOTIFICATION_ICONS', label: 'Aviso web con íconos' },
  { value: 'QUOTE_WORKFLOW_MANAGER_NEW', label: 'Workflow nuevo (manager)' },
  { value: 'QUOTE_WORKFLOW_MANAGER_VIEWED', label: 'Workflow vista (manager)' },
  { value: 'QUOTE_WORKFLOW_MANAGER_AFTER_DOWNLOAD', label: 'Workflow post descarga (manager)' },
  { value: 'QUOTE_WORKFLOW_MANAGER_REMINDER_PENDING_ERP', label: 'Workflow recordatorio ERP (manager)' },
  { value: 'QUOTE_WORKFLOW_MANAGER_REJECT_REASON_PENDING_ERP', label: 'Workflow motivos rechazo (manager)' },
]

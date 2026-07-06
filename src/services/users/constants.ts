export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuario',
  BRANCH_MANAGER: 'Gerente de sucursal',
  SALES_COORDINATOR: 'Coordinador de ventas',
  VENDOR: 'Vendedor',
  SUPPORT: 'Soporte',
  VIEWER: 'Consulta',
}

export const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'USER', label: 'Usuario' },
  { value: 'BRANCH_MANAGER', label: 'Gerente de sucursal' },
  { value: 'SALES_COORDINATOR', label: 'Coordinador de ventas' },
  { value: 'VENDOR', label: 'Vendedor' },
  { value: 'SUPPORT', label: 'Soporte' },
  { value: 'VIEWER', label: 'Consulta' },
] as const

const MULTI_BRANCH_ROLES = new Set(['BRANCH_MANAGER', 'SALES_COORDINATOR'])
const QUOTE_ASSIGNMENT_ROLES = new Set(['ADMIN', 'SALES_COORDINATOR'])
const BRANCH_COORDINATOR_ROLES = new Set(['BRANCH_MANAGER', 'SALES_COORDINATOR'])
const USER_CREATION_ROLES = new Set(['ADMIN', 'SALES_COORDINATOR'])

export const normalizeUserRole = (role?: string) => `${role ?? ''}`.trim().toUpperCase()

export const roleAllowsMultipleBranches = (role?: string) => {
  return MULTI_BRANCH_ROLES.has(normalizeUserRole(role))
}

export const canAssignQuotesToVendors = (role?: string) => {
  return QUOTE_ASSIGNMENT_ROLES.has(normalizeUserRole(role))
}

export const canManageMultipleBranches = (role?: string) => {
  return BRANCH_COORDINATOR_ROLES.has(normalizeUserRole(role))
}

export const canCreateUsers = (role?: string) => {
  return USER_CREATION_ROLES.has(normalizeUserRole(role))
}

export const getRoleOptionsForUserCreation = (creatorRole?: string) => {
  const normalizedCreatorRole = normalizeUserRole(creatorRole)

  if (normalizedCreatorRole !== 'SALES_COORDINATOR') {
    return [...ROLE_OPTIONS]
  }

  return ROLE_OPTIONS.filter((option) => option.value === 'VENDOR')
}

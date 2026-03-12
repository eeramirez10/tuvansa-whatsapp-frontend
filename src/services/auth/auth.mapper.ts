import type { BranchOffice } from "../../interfaces/branchoffice.interface";
import type { User } from "../../interfaces/user.interface";

const mapBranchOffice = (json: Record<string, unknown>): BranchOffice => ({
  id: `${json.id ?? ''}`,
  name: `${json.name ?? ''}`,
  address: `${json.address ?? ''}`,
  createdAt: `${json.createdAt ?? ''}`,
  updatedAt: `${json.updatedAt ?? ''}`,
})

export const userMapper = (json: Record<string, unknown>): User => {
  const rawBranches = Array.isArray(json.branches)
    ? json.branches
    : Array.isArray(json.branchAssignments)
      ? json.branchAssignments.map((assignment) => {
        if (!assignment || typeof assignment !== 'object') return null
        return (assignment as Record<string, unknown>).branch
      })
      : []
  const branches = Array.isArray(rawBranches)
    ? rawBranches
      .filter((branch) => branch && typeof branch === 'object')
      .map((branch) => mapBranchOffice(branch as Record<string, unknown>))
    : []
  const primaryBranch = json.branch && typeof json.branch === 'object'
    ? mapBranchOffice(json.branch as Record<string, unknown>)
    : null
  const branchOffices = [
    ...(primaryBranch ? [primaryBranch] : []),
    ...branches
  ].filter((branch, index, values) => values.findIndex((item) => item.id === branch.id) === index)

  return {
    id: `${json.id ?? ''}`,
    name: `${json.name ?? ''}`,
    lastname: `${json.lastname ?? ''}`,
    username: `${json.username ?? ''}`,
    email: `${json.email ?? ''}`,
    phone: `${json.phone ?? ''}`,
    role: `${json.role ?? ''}`,
    isActive: Boolean(json.isActive),
    createdAt: `${json.createdAt ?? ''}`,
    updatedAt: `${json.updatedAt ?? ''}`,
    allowWhatsappAssistant: Boolean(json.allowWhatsappAssistant),
    branchOffice: branchOffices[0] ?? null,
    branchOffices
  }
}

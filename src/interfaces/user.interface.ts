import type { BranchOffice } from "./branchoffice.interface"

export interface User {
  id: string
  name: string
  lastname: string
  username: string
  email: string
  phone?: string | null
  role: string
  isActive: boolean | string
  allowWhatsappAssistant?: boolean
  createdAt: string
  updatedAt: string
  branchOffice?: BranchOffice | null
  branchOffices?: BranchOffice[]

}

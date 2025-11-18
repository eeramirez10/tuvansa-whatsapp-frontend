import type { BranchOffice } from "./branchoffice.interface"

export interface User {
  id: string
  name: string
  lastname: string
  username: string
  email: string
  phone: string
  role: string
  isActive: string
  createdAt: string
  updatedAt: string
  branchOffice: BranchOffice

}


import type { BranchOffice } from "../../interfaces/branchoffice.interface";
import type { User } from "../../interfaces/user.interface";


export const userMapper = (json: never): User => ({
  id: json['id'],
  name: json['name'],
  lastname: json['lastname'],
  username: json['username'],
  email: json['email'],
  phone: json['phone'],
  role: json['role'],
  isActive: json['isActive'],
  createdAt: json['createdAt'],
  updatedAt: json['updatedAt'],
  branchOffice: branchMapper(json['branch']),
})

export const branchMapper = (json: never): BranchOffice => ({
  id: json['id'],
  name: json['name'],
  address: json['address'],
  createdAt: json['createdAt'],
  updatedAt: json['updatedAt'],
})
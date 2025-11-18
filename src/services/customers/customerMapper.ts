import type { Customer } from "../quotes/types";


export const customerMapper = (json: Record<string, string>): Customer => {

  return {
    id: json['id'] ?? null,
    name: json.name ?? 'desconocido',
    lastname: json.lastname ?? 'desconocido',
    email: json.email,
    phone: json.phone,
    location: json.location,
    createdAt: json.createdAt,
    fullName:  `${json.name} ${json.lastname ?? ''}`,
  }
}
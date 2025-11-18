import { proscaiApi } from '../../api/proscai.api';


export type Currency = 'MXN' | 'USD' // ajusta si más adelante llega del backend

// Lo que devuelve tu backend (raw)
export interface RawAvailabilityBranch {
  id: string         // "3925"
  name: string       // "MEXICO"
  stock: string      // "0.000"
  cost: string       // "28.1667"
}

// Normalizado para el front
export interface AvailabilityBranch {
  warehouseId: string
  warehouse: string
  stock: number
  cost: number
  currency: Currency
}

export interface AvailabilityById {
  id: string                 // ean/id consultado
  branches: AvailabilityBranch[]
}

// Normalizador de una lista raw → AvailabilityById
function normalizeAvailability(raw: RawAvailabilityBranch[], id: string, currency: Currency = 'MXN'): AvailabilityById {
  return {
    id,
    branches: raw.map(b => ({
      warehouseId: b.id,
      warehouse: b.name,
      stock: Number(b.stock),         // "0.000" → 0
      cost: Number(b.cost),           // "28.1667" → 28.1667
      currency: currency ?? 'MXN',                       // por ahora default; cámbialo si tu backend lo envía
    })),
  }
}

// Ajusta el query param (id vs ean) a tu backend real


export class InventoryService {

  static getAvailabilityById = async (ean: string, signal?: AbortSignal) => {
    const { data } = await proscaiApi.post<RawAvailabilityBranch[]>('/warehouse', { ean }, { signal })

    return normalizeAvailability(data, ean, 'MXN') 
  }
}



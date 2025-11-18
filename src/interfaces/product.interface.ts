export type CurrencyType = 'MXN' | 'USD'

export interface Product {
  id: string
  description: string
  code: string
  uom: string
  unitCost: number
  costCurrency: CurrencyType
  gtin?: string
}

export interface SemanticSearchRequest {
  description: string
  topK?: number
  minScore?: number
  branch?: string
}

export interface SemanticHit {
  product: Product
  score: number
  highlights?: string[]
}

export interface SemanticSearchResponse {
  items: SemanticHit[]
  total: number
  tookMs: number
}
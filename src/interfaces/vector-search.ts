// types/vector-search.ts
export interface VectorSearchMetadata {
  acabado?: string
  ced?: string
  costura?: string
  description?: string
  diameter?: string         // ej. 2"
  ean?: string              // ojo: puede ser interno/alfanumérico
  id?: string               // mismo que 'id' del hit
  material?: string
  originalDescription?: string
  product?: string          // ej. "TUBO"
}

export interface VectorSearchHit {
  id: string
  score: number
  values: unknown[]         // según tu backend, de momento array vacío
  metadata: VectorSearchMetadata
}

// Si tu backend devuelve literalmente un array:
export type VectorSearchResponse = VectorSearchHit[]

// Si mañana devuelves objeto con más info, cambiamos a:
// export interface VectorSearchResponse {
//   items: VectorSearchHit[]
//   total?: number
//   tookMs?: number
// }

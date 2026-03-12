// store/products/semantic-vector.store.ts
import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { VectorSearchHit } from '../../interfaces/vector-search'
import { InventoryService, type AvailabilityById } from '../../services/inventory/api'
import { ProductsService } from '../../services/products/api'

// Ajusta estos imports a tus rutas reales


type RowStatus = 'idle' | 'loading' | 'success' | 'error'

type RowState = {
  status: RowStatus
  query: string
  results: VectorSearchHit[]
  availability: Record<string, AvailabilityById | null> // key = eanOrId de cada similar
  error?: string
  updatedAt: number
}

interface SemanticVectorState {

  rows: Record<string, RowState>

  activeRowKey: string | null


  searchRow: (rowKey: string, description: string, topN?: number, signal?: AbortSignal) => Promise<void>
  openRow: (rowKey: string | null) => void
  clearRow: (rowKey: string) => void
  clearAll: () => void
}

const storeApi: StateCreator<SemanticVectorState> = (set) => ({
  rows: {},
  activeRowKey: null,

  openRow: (rowKey) => set({ activeRowKey: rowKey }),

  clearRow: (rowKey) =>
    set((state) => {
      const next = { ...state.rows }
      delete next[rowKey]
      return { rows: next }
    }),

  clearAll: () => set({ rows: {}, activeRowKey: null }),

  searchRow: async (rowKey, description, topN = 6, signal) => {
    const query = description.trim()
    if (!query) return

    // 1) marca loading en esa fila
    set((state) => ({
      rows: {
        ...state.rows,
        [rowKey]: {
          status: 'loading',
          query,
          results: [],
          availability: {},
          updatedAt: Date.now(),
        }
      }
    }))

    try {
      // 2) similares
      const hits = await ProductsService.searchSimilar({ description: query }, signal) // VectorSearchHit[]
      const top = hits.slice(0, topN)
      const ids = top.map(h => h.metadata.ean ?? h.id)

      // 3) disponibilidad por cada similar (sin cache)
      const availabilityEntries = await Promise.all(
        ids.map(async id => {
          try {
            const data = await InventoryService.getAvailabilityById(id, signal)



            return [id, data] as const
          } catch {
            return [id, null] as const
          }
        })
      )
      const availabilityMap = Object.fromEntries(availabilityEntries) as Record<string, AvailabilityById | null>

      // 4) consolidar fila
      set((state) => ({
        rows: {
          ...state.rows,
          [rowKey]: {
            status: 'success',
            query,
            results: hits,
            availability: availabilityMap,
            updatedAt: Date.now(),
          }
        }
      }))
    } catch (e) {



      if (e instanceof Error) {
        const msg = e?.message ?? 'Unknown error'
        set((state) => ({
          rows: {
            ...state.rows,
            [rowKey]: {
              status: 'error',
              query,
              results: [],
              availability: {},
              error: msg,
              updatedAt: Date.now(),
            }
          }
        }))

      }

      throw new Error('Error[ semantic vector store searchRow]')

    }
  },
})

export const useSemanticVectorStore = create<SemanticVectorState>()(
  persist(
    devtools(storeApi, { name: 'semantic-vector-store' }),
    {
      name: 'semantic-vector-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // persistimos solo lo necesario
      partialize: (s) => ({
        rows: s.rows,
        activeRowKey: s.activeRowKey,
      }),
    }
  )
)

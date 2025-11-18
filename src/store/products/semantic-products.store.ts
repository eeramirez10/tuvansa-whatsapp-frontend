import { create, type StateCreator } from "zustand"
import type { SemanticHit, SemanticSearchRequest } from "../../interfaces/product.interface"

import { devtools } from "zustand/middleware"
import { ProductsService } from "../../services/products/api"

type Status = 'idle' | 'loading' | 'success' | 'error'

interface SemanticState {
  status: Status
  error: string | null
  lastQuery: string | null
  results: SemanticHit[]
  total: number
  abortCtrl?: AbortController
  cache: Record<string, SemanticHit[]>

  searchByDescription: (req: SemanticSearchRequest) => Promise<SemanticHit[]>
  clearResults: () => void
}

const hashQuery = (req: SemanticSearchRequest) =>
  JSON.stringify({
    d: req.description.trim().toLowerCase(),
    k: req.topK ?? 20,
    s: req.minScore ?? 0.65,
    b: req.branch ?? ''
  })

const storeApi: StateCreator<SemanticState> = (set, get) => ({
  status: 'idle',
  error: null,
  lastQuery: null,
  results: [],
  total: 0,
  cache: {},

  clearResults: () =>
    set({ results: [], total: 0, status: 'idle', error: null }),

  searchByDescription: async (req) => {
    const desc = req.description?.trim()
    if (!desc) {
      set({ status: 'error', error: 'Description required' })
      return []
    }

    // Cache
    const key = hashQuery(req)
    const cached = get().cache[key]
    if (cached) {
      set({
        results: cached,
        total: cached.length,
        status: 'success',
        error: null,
        lastQuery: desc
      })
      return cached
    }

    // Cancelación previa
    get().abortCtrl?.abort()
    const abortCtrl = new AbortController()

    set({ status: 'loading', error: null, abortCtrl, lastQuery: desc })

    try {
      const data  = await ProductsService.searchSimilar(req, abortCtrl.signal)


      set(state => ({
        results: data.items,
        total: data.total,
        status: 'success',
        error: null,
        abortCtrl: undefined,
        cache: { ...state.cache, [key]: data.items }
      }))

      return data.items
    } catch (e) {

      if (e instanceof Error) {
        if (e?.name === 'AbortError') return []
        const message = e?.message ?? 'Unknown error'

        set({ status: 'error', error: message, abortCtrl: undefined })
      }

      return []
    }
  }

})


export const useSemanticStore = create<SemanticState>()(
  devtools(
    storeApi
  )
)
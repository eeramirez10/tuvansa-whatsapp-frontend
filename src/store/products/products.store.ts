// import { create, type StateCreator } from 'zustand';
// import type { Product } from '../../interfaces/product.interface';
// import { devtools } from 'zustand/middleware';

// type ProductsStatus = 'idle' | 'loading' | 'success' | 'error'

// export interface ProductsState {
//   status: ProductsStatus
//   products: Product[]
//   error: string | null
//   setProducts: (items: Product[]) => void
//   getProductsByGtin: (gtin: string) => Promise<void>
//   reset: () => void
// }

// const storeApi: StateCreator<ProductsState> = (set, get) => ({
//   fetching: false,
//   products: [],
//   error: null,

//   setProducts: (items: Product[]) => {
//     set({ products: items })
//   },
//   getProductsByGtin: async (gtin: string) => {
//     if (!gtin?.trim()) {
//       set({ status: 'error', error: 'GTIN requerido' })
//       return get().products
//     }
//     return undefined
//   },
//   reset: () => {
//     set({ status: 'idle', error: null, products: [] })
//   },
// })

// export const useProductsStore = create<ProductsState>()(

//   devtools(
//     storeApi
//   )
// )
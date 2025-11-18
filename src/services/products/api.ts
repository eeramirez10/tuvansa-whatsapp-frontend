import { proscaiGptApi } from "../../api/proscai-gpt.api"
import type { SemanticSearchRequest } from "../../interfaces/product.interface"
import type { VectorSearchResponse } from "../../interfaces/vector-search"


export class ProductsService {

  static searchSimilar = async (req: SemanticSearchRequest, signal?: AbortSignal) => {

    try {

      const { data } = await proscaiGptApi.post<VectorSearchResponse>('/gpt/match-product', req, { signal })

      return data

    } catch (error) {

      if (error instanceof Error) {

        throw new Error(`${error.message}`)
      }
      throw new Error(`Unknown Error`)
    }

  }
}
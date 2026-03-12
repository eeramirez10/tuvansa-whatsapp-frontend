import { proscaiGptApi } from "../../api/proscai-gpt.api";
import type {
  ExtractionJobCreateResponse,
  ExtractionJobResultResponse,
  ExtractionJobStatusResponse,
} from "./quote-extraction-job.types";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export class QuoteExtractionJobsService {
  static async createJob(file: File): Promise<ExtractionJobCreateResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await proscaiGptApi.post<ExtractionJobCreateResponse>("/extract/jobs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  }

  static async getStatus(jobId: string): Promise<ExtractionJobStatusResponse> {
    const { data } = await proscaiGptApi.get<ExtractionJobStatusResponse>(`/extract/jobs/${jobId}/status`);
    return data;
  }

  static async getResult(jobId: string): Promise<ExtractionJobResultResponse> {
    const { data } = await proscaiGptApi.get<ExtractionJobResultResponse>(`/extract/jobs/${jobId}/result`);
    return data;
  }

  static async waitForCompletion(
    jobId: string,
    options?: {
      timeoutMs?: number;
      pollIntervalMs?: number;
      onStatus?: (status: ExtractionJobStatusResponse) => void;
    }
  ): Promise<ExtractionJobResultResponse> {
    const timeoutMs = options?.timeoutMs ?? 4 * 60_000;
    const pollIntervalMs = options?.pollIntervalMs ?? 10_000;
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const status = await this.getStatus(jobId);
      options?.onStatus?.(status);

      if (status.status === "failed") {
        throw new Error(status.error || "El procesamiento de la extracción falló.");
      }

      if (status.status === "completed") {
        const result = await this.getResult(jobId);

        if (result.status === "failed") {
          throw new Error(result.error || "El procesamiento de la extracción falló.");
        }

        if (result.result) {
          return result;
        }
      }

      await sleep(pollIntervalMs);
    }

    throw new Error("Tiempo de espera agotado al procesar la extracción.");
  }
}

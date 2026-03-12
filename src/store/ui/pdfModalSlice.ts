import type { StateCreator } from "zustand"

export interface PdfModalSlice {
  isOpen: boolean,
  pdfUrl: string | null,

  setIsOpen: (open: boolean) => void
  setpdfUrl: (pdfUrl: string | null) => void

}


export const createPdfModalSlice: StateCreator<PdfModalSlice> = (set) => ({

  isOpen: false,
  pdfUrl: null,
  setIsOpen: (open: boolean) => set({ isOpen: open }),
  setpdfUrl: (pdfUrl: string | null) => set({ pdfUrl })
}); 
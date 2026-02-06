import { create } from "zustand";
import { createCardSlice, createModalSlice, createSidebarSlice, type CardSlice, type ModalSlice, type SidebarSlice } from "./sidebar.slice";
import { devtools, persist } from "zustand/middleware";
import { createPdfModalSlice, type PdfModalSlice } from './pdfModalSlice';


export const useUiBoundStore = create<SidebarSlice & ModalSlice & CardSlice & PdfModalSlice>()(
  devtools(
    persist(
      (...a) => ({
        ...createSidebarSlice(...a),
        ...createModalSlice(...a),
        ...createCardSlice(...a),
        ...createPdfModalSlice(...a)
        
      }),
      {name:'ui-storage'}
    )
  )
)
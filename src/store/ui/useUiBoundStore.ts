import { create } from "zustand";
import { createCardSlice, createModalSlice, createSidebarSlice, type CardSlice, type ModalSlice, type SidebarSlice } from "./sidebar.slice";
import { devtools, persist } from "zustand/middleware";


export const useUiBoundStore = create<SidebarSlice & ModalSlice & CardSlice>()(
  devtools(
    persist(
      (...a) => ({
        ...createSidebarSlice(...a),
        ...createModalSlice(...a),
        ...createCardSlice(...a)
      }),
      {name:'ui-storage'}
    )
  )
)
import type { StateCreator } from "zustand"

export interface SidebarSlice {
  open: boolean

  setOpen: () => void
  setClose: () => void
}

export interface ModalSlice {
  openModal: boolean

  setOpenModal: () => void
  setCloseModal: () => void
}

export interface CardSlice {
  expand: boolean
  setExpand: (expand: boolean) => void
}

export const createSidebarSlice: StateCreator<SidebarSlice> = (set) => ({
  open: false,

  setOpen: () => set({ open: true }),
  setClose: () => set({ open: false })
})

export const createModalSlice: StateCreator<ModalSlice> = (set) => ({
  openModal: false,

  setOpenModal: () => set({ openModal: true }),
  setCloseModal: () => set({ openModal: false }),
})

export const createCardSlice: StateCreator<CardSlice> = (set) => ({
  expand: false,
  setExpand: (expand: boolean) => set({ expand })

})
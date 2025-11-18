import { useEffect } from "react";
import { useUiBoundStore } from "../store/ui/useUiBoundStore";


export const useMediaQuery = () => {

  const setOpen = useUiBoundStore(state => state.setOpen)
  const setClose = useUiBoundStore(state => state.setClose)


  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    mediaQuery.addEventListener('change', (e) => {


      if (e.matches) {

        setOpen()
      
      }

      if (!e.matches) {

        setClose()


      }
    })
  }, [])

  const handleOpenSideBar = () => {
    setOpen()
  }

  const handleCloseSideBaronClickNavItem = () => {


    setClose()

  }
  return {
    handleOpenSideBar,
    handleCloseSideBaronClickNavItem
  }
}

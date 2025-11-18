import type { FC, RefObject } from "react"
import { useReactToPrint } from "react-to-print"

interface Props {
  ref: RefObject<HTMLDivElement | null>
}

export const PrintButton: FC<Props> = ({ ref }) => {
  const handlePrint = useReactToPrint({
    contentRef: ref,
    documentTitle: 'Cotizaicion'
  })
  return (
    <button
      onClick={handlePrint}
      className={
        `     w-full
              px-3 
              py-2 
              bg-linear-to-r 
              from-blue-400
              to-indigo-600
              text-sm 
              text-white 
              rounded-md 
              cursor-pointer
              hover:from-blue-500
              hover:to-indigo-700
            `
      }

    >
      Vista previa
    </button>
  )
}

import { useRef, type FC } from "react";
import { PrintButton } from "../../shared/components/PrintButton";
import { PrintableLayout } from "./PrintableLayout";


interface ActionCardProps {
  hasFile: boolean
}

export const ActionCard: FC<ActionCardProps> = ({ hasFile }) => {



  const printRef = useRef(null);


  return (
    <>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Acciones</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          <i data-feather="check" className="mr-2"></i>
          Aprobar Cotización
        </button> */}
          {/* <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
          <i data-feather="x" className="mr-2"></i>
          Rechazar Cotización
        </button> */}

          <PrintButton ref={printRef} />



          {

            hasFile && <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
              <i data-feather="download" className="mr-2"></i>
              Descargar Archivo Adjunto
            </button>

          }

          <button className="w-full text-white flex items-center justify-center px-4 py-2 bg-purple-400  rounded-lg text-sm font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <i data-feather="message-square" className="mr-2 "></i>
            Descargar datos
          </button>

          <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <i data-feather="mail" className="mr-2"></i>
            Enviar por Email
          </button>
          <button className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500">
            <i data-feather="message-square" className="mr-2"></i>
            Contactar Cliente
          </button>
        </div>
      </div>


      <PrintableLayout
        printRef={printRef} />
    </>


  )
}
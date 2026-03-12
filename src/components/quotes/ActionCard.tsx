import { useRef, type FC } from "react";
import { PrintButton } from "../../shared/components/PrintButton";
import { PrintableLayout } from "./PrintableLayout";

import { isExcel, isPdf, normalizeFileKey } from "../../utils/valids";
import { useFiles } from "../../hooks/useFiles";


interface ActionCardProps {
  fileKey?: string | null
}

export const ActionCard: FC<ActionCardProps> = ({ fileKey }) => {

  const printRef = useRef(null);



  const { handleViewOrDownloadFile, isLoadingFile, fileError, handleDownloadExcel, isDownloadingExcel } = useFiles()




  const normalizedFileKey = normalizeFileKey(fileKey ?? '')
  const hasFile = Boolean(normalizedFileKey)
  const isPdfFile = Boolean(hasFile && isPdf(normalizedFileKey))
  const isExcelFile = Boolean(hasFile && isExcel(normalizedFileKey))


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

          {isPdfFile && (
            <button
              className="
                w-full 
                flex 
                items-center 
                justify-center 
                px-4 
                py-2 
                bg-linear-to-r
                from-red-400
                to-red-700
                text-white
                rounded-lg 
                text-sm 
                font-medium 
                hover:bg-gray-200 
                focus:outline-none 
                focus:ring-2 
               
                disabled:opacity-60 
                disabled:cursor-not-allowed
              "
              onClick={() => {
                if (normalizedFileKey)
                  handleViewOrDownloadFile(normalizedFileKey)
              }
              }
              disabled={isLoadingFile}
            >
              <i data-feather="download" className="mr-2"></i>
              {isLoadingFile ? 'Cargando PDF...' : 'Ver PDF'}
            </button>
          )}

          {isExcelFile && (
            <button
              className="
                w-full 
                flex 
                items-center 
                justify-center 
                px-4 
                py-2 
                bg-gradient-to-r 
                from-green-300 
                to-green-600 
                text-white 
                rounded-lg 
                text-sm 
                font-medium 
                hover:bg-green-700 
                focus:outline-none 
                focus:ring-2  
                disabled:opacity-60 
                disabled:cursor-not-allowed
                
              "
              onClick={() => {
                if (normalizedFileKey)
                  handleDownloadExcel(normalizedFileKey)
              }}
              disabled={isDownloadingExcel}
            >
              <i data-feather="file" className="mr-2"></i>
              {isDownloadingExcel ? 'Descargando Excel...' : 'Descargar Excel'}
            </button>
          )}

          {/* <button className="w-full text-white flex items-center justify-center px-4 py-2 bg-purple-400  rounded-lg text-sm font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
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
          </button> */}

          {fileError && (
            <p className="text-sm text-red-600">{fileError}</p>
          )}
        </div>
      </div>


      <PrintableLayout
        printRef={printRef} />

      {/* {isViewerOpen && pdfUrl && (
        <PdfViewerModal pdfUrl={pdfUrl} setIsViewerOpen={setIsViewerOpen} />
      )} */}
    </>


  )
}
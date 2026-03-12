import { useFiles } from "../../../hooks/useFiles"



export const PdfViewerModal = () => {

  const { pdfUrl, setIsViewerOpen, setPdfUrl } = useFiles()


  const handleCloseModal = () => {
    setIsViewerOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Vista previa del PDF</h3>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => {
              handleCloseModal()
              setPdfUrl(null)
            }}
          >
            Cerrar
          </button>
        </div>
        {
          pdfUrl && (
            <iframe
              title="PDF viewer"
              src={pdfUrl}
              className="w-full h-full"
            />
          )
        }

      </div>
    </div>
  )
}

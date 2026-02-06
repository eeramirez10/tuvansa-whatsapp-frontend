import { useState } from 'react'
import { useUiBoundStore } from '../store/ui/useUiBoundStore'
import { getAttachedFile } from '../services/quotes/api'
import { isExcel, isPdf } from '../utils/valids'

export const useFiles = () => {

  const [isLoadingFile, setIsLoadingFile] = useState(false)
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const setIsViewerOpen = useUiBoundStore(state => state.setIsOpen)
  const setPdfUrl = useUiBoundStore(state => state.setpdfUrl)

  const isOpen = useUiBoundStore(state => state.isOpen)
  const pdfUrl = useUiBoundStore(state => state.pdfUrl)



  const downloadFile = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }


  const handleViewOrDownloadFile = async (fileName: string) => {
    try {
      setIsLoadingFile(true)
      setFileError(null)

      const resp = await getAttachedFile(fileName)
      const url = resp.url

      if (!url) throw new Error('No se encontró URL del archivo.')

      if (isPdf(fileName, url)) {
        setPdfUrl(url)
        setIsViewerOpen(true)
        return
      }

      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'No se pudo cargar el archivo.')
    } finally {
      setIsLoadingFile(false)
    }
  }

  const handleDownloadExcel = async (fileName: string) => {
    try {
      setIsDownloadingExcel(true)
      setFileError(null)

      const resp = await getAttachedFile(fileName)
      const url = resp.url

      if (!url) throw new Error('No se encontró URL del archivo.')

      if (!isExcel(fileName, url)) {
        throw new Error('El archivo adjunto no es un Excel.')
      }

      downloadFile(url)
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'No se pudo descargar el archivo.')
    } finally {
      setIsDownloadingExcel(false)
    }
  }




  return {
    isLoadingFile,
    isDownloadingExcel,
    fileError,
    isOpen,
    pdfUrl,
    handleViewOrDownloadFile,
    handleDownloadExcel,
    setIsViewerOpen,
    setPdfUrl
  }

}

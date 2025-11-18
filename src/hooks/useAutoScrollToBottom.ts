// hooks/useAutoScrollToBottom.ts
import { useEffect, useLayoutEffect, useRef } from 'react'

export function useAutoScrollToBottom<T extends HTMLDivElement>(
  deps: unknown[],          // pon aquí [chatId, messages.length, loading]
  opts?: { stickThreshold?: number; smooth?: boolean }
) {
 const containerRef = useRef<T | null>(null)
 
  const { stickThreshold = 100, smooth = true } = opts || {}



  // helper
  const scrollToBottom = (behavior: ScrollBehavior = smooth ? 'smooth' : 'auto') => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  // Si el layout cambia (altura) justo al montar/cambiar chat, usa layoutEffect
  useLayoutEffect(() => {
    scrollToBottom('auto') // sin animación al abrir/cambiar chat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps[0]]) // típicamente chatId

  // Cuando cambien mensajes, auto scroll solo si estás cerca del fondo
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const shouldStick = distanceToBottom <= stickThreshold

    if (shouldStick) {
      // usar setTimeout(0) por si hay imágenes/medidas async
      const t = setTimeout(() => scrollToBottom(), 0)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { containerRef, scrollToBottom }
}

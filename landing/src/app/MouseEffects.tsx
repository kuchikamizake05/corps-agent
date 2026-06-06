'use client'

import { useEffect } from 'react'

export default function MouseEffects() {
  useEffect(() => {
    let raf = 0
    let x = window.innerWidth * 0.5
    let y = window.innerHeight * 0.35

    const apply = () => {
      document.documentElement.style.setProperty('--mouse-x', `${x}px`)
      document.documentElement.style.setProperty('--mouse-y', `${y}px`)
      document.documentElement.style.setProperty('--mx', `${x}px`)
      document.documentElement.style.setProperty('--my', `${y}px`)
      raf = 0
    }

    const onMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      if (!raf) raf = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return null
}

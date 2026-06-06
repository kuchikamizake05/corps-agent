'use client'

import { useEffect } from 'react'

export default function MouseEffects() {
  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement
      const isScrolled = root.classList.contains('is-scrolled')
      const y = window.scrollY

      if (!isScrolled && y > 28) root.classList.add('is-scrolled')
      if (isScrolled && y < 8) root.classList.remove('is-scrolled')
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}

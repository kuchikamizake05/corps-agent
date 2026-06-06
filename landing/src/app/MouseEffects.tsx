'use client'

import { useEffect } from 'react'

export default function MouseEffects() {
  useEffect(() => {
    const onScroll = () => {
      document.documentElement.classList.toggle('is-scrolled', window.scrollY > 24)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}

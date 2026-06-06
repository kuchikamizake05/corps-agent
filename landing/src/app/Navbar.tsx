'use client'

import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'

const spring = {
  type: 'spring' as const,
  stiffness: 170,
  damping: 26,
  mass: 0.72,
}

export default function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled((current) => {
      if (!current && latest > 72) return true
      if (current && latest < 28) return false
      return current
    })
  })

  return (
    <motion.nav
      className="topnav motion-nav"
      initial={false}
      animate={{ height: scrolled ? 78 : 68, paddingTop: scrolled ? 10 : 0 }}
      transition={spring}
      data-scrolled={scrolled ? 'true' : 'false'}
    >
      <motion.div
        className="container-x nav-row motion-nav-row"
        initial={false}
        animate={{
          width: scrolled ? 'calc(100vw - 56px)' : '100vw',
          maxWidth: scrolled ? 1320 : 9999,
          height: scrolled ? 58 : 68,
          borderRadius: scrolled ? 999 : 0,
          paddingLeft: scrolled ? 20 : 24,
          paddingRight: scrolled ? 20 : 24,
        }}
        transition={spring}
      >
        <a href="#top" className="nav-brand" aria-label="Corps Agent home">
          <span className="nav-logo">CA</span>
          <span className="nav-brand-copy"><span>Corps Agent</span><span>Autonomous treasury ops</span></span>
        </a>
        <div className="nav-center" aria-label="Primary navigation">
          <a className="nav-link" href="#agents">Agents</a>
          <a className="nav-link" href="#audit">Audit</a>
          <a className="nav-link" href="#proof">Proof</a>
          <a className="nav-link" href="https://github.com/kuchikamizake05/corps-agent" target="_blank">GitHub</a>
        </div>
        <div className="nav-actions"><a className="nav-cta" href="https://t.me/CorpsAgentBot" target="_blank">Open bot</a></div>
      </motion.div>
    </motion.nav>
  )
}

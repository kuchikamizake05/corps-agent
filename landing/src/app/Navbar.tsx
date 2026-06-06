'use client'

import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled((current) => {
        if (!current && y > 72) return true
        if (current && y < 32) return false
        return current
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`topnav motion-nav ${scrolled ? 'nav-is-pill' : 'nav-is-full'}`}>
      <div className="container-x nav-row motion-nav-row">
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
      </div>
    </nav>
  )
}

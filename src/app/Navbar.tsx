'use client'

import { useEffect, useState } from 'react'

const navLinks = [
  { label: 'Agents', href: '#agents' },
  { label: 'Audit', href: '#audit' },
  { label: 'Proof', href: '#proof' },
  { label: 'Deposit', href: '/deposit' },
  { label: 'GitHub', href: 'https://github.com/kuchikamizake05/corps-agent', external: true },
]

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
    <nav
      className={[
        'fixed left-0 right-0 top-0 z-[1000] overflow-visible border-0 transition-[height,padding,background] duration-[560ms] ease-[cubic-bezier(.16,1,.3,1)]',
        scrolled ? 'h-[78px] bg-transparent pt-2.5 pointer-events-none' : 'h-[68px] bg-[linear-gradient(180deg,#15171a_0%,#090a0c_72%,#07080a_100%)] pt-0',
      ].join(' ')}
      aria-label="Primary"
    >
      <div
        className={[
          'pointer-events-auto mx-auto flex items-center justify-between overflow-hidden transition-[width,max-width,height,padding,border-radius,background,box-shadow] duration-[620ms] ease-[cubic-bezier(.16,1,.3,1)]',
          scrolled
            ? 'h-[58px] w-[calc(100vw-56px)] max-w-[1320px] rounded-full bg-[linear-gradient(180deg,#15171a_0%,#090a0c_72%,#07080a_100%)] px-5 shadow-[0_18px_58px_rgba(0,0,0,.50),0_0_0_1px_rgba(252,255,82,.045),inset_0_1px_0_rgba(255,255,255,.035)] max-md:h-[54px] max-md:w-[calc(100vw-18px)] max-md:px-4'
            : 'h-[68px] w-screen max-w-[100vw] rounded-none px-[max(24px,calc((100vw-1180px)/2))] shadow-none max-md:h-[62px] max-md:px-4',
        ].join(' ')}
      >
        <a href="#top" className="flex items-center gap-2.5 text-white" aria-label="Corps Agent home">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#15171a] text-[11px] font-semibold tracking-[.08em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">CA</span>
          <span className="text-sm font-semibold tracking-[-.01em]">Corps Agent</span>
        </a>

        <div className="hidden items-center gap-7 text-[13px] font-medium text-zinc-400 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              className="transition-colors duration-200 hover:text-white"
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center">
          <a
            className="inline-flex h-[33px] items-center justify-center rounded-full bg-[#f5f257] px-3.5 text-[13px] font-semibold text-[#08090a] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_24px_rgba(245,242,87,.16)] transition hover:-translate-y-px hover:bg-[#ffff75]"
            href="https://t.me/CorpsAgentBot"
            target="_blank"
            rel="noreferrer"
          >
            Open bot
          </a>
        </div>
      </div>
    </nav>
  )
}

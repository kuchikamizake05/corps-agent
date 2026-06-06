import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Corps Agent — Multi-Agent Company on Celo',
  description: 'An autonomous AI company running 24/7 on Celo blockchain. CEO, Trader, and DevOps agents registered as ERC-8004 identities.',
  openGraph: {
    title: 'Corps Agent — Multi-Agent Company on Celo',
    description: 'Autonomous AI agents running 24/7 on Celo. CEO, Trader & DevOps — all ERC-8004 registered.',
    type: 'website',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}

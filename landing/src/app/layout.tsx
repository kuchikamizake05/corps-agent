import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Corps Agent — Autonomous treasury ops on Celo',
  description:
    'Three on-chain agents running 24/7 on Celo Sepolia. ERC-8004 identities, transparent treasury, on-chain audit. Built for the Celo Onchain Agents hackathon.',
  openGraph: {
    title: 'Corps Agent — Autonomous treasury ops on Celo',
    description:
      'Three on-chain agents running 24/7 on Celo Sepolia. ERC-8004 identities, transparent treasury, on-chain audit.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}

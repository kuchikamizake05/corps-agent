'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiProvider } from 'wagmi'
import { celoSepolia } from '../celoSepolia'
import { ReactNode, useState } from 'react'

export const projectId = 'cf123a0a2dd51e390a60096b99d72bd8'

const metadata = {
  name: 'Corps Agent',
  description: 'Autonomous treasury ops on Celo',
  url: 'https://corps-agent-site.vercel.app',
  icons: ['https://corps-agent-site.vercel.app/favicon.ico'],
}

const networks = [celoSepolia] as [AppKitNetwork, ...AppKitNetwork[]]

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  defaultNetwork: celoSepolia,
  features: {
    analytics: false,
    socials: false,
    email: false,
  },
})

export function DepositProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

import type { Metadata } from 'next'
import DepositClient from './DepositClient'

export const metadata: Metadata = {
  title: 'Deposit — Corps Agent',
  description: 'Connect wallet and deposit test tUSDC into Corps Agent Treasury on Celo Sepolia.',
}

export default function DepositPage() {
  return <DepositClient />
}

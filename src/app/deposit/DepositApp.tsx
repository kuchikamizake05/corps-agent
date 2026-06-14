'use client'

import { DepositProviders } from './appkit'
import DepositClient from './DepositClient'

export default function DepositApp() {
  return (
    <DepositProviders>
      <DepositClient />
    </DepositProviders>
  )
}

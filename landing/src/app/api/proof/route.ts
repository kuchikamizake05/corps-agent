import { NextResponse } from 'next/server'
import { EXPLORER, FAUCET, TOKEN, TREASURY } from '../_shared'

export const dynamic = 'force-dynamic'

const LAST_DEPOSIT = process.env.NEXT_PUBLIC_LAST_DEPOSIT_TX || '0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d'
const LAST_PROFIT = process.env.NEXT_PUBLIC_LAST_PROFIT_TX || '0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e'

export async function GET() {
  return NextResponse.json({
    treasury: { address: TREASURY, explorer: `${EXPLORER}/address/${TREASURY}` },
    token: { address: TOKEN, explorer: `${EXPLORER}/address/${TOKEN}` },
    faucet: FAUCET ? { address: FAUCET, explorer: `${EXPLORER}/address/${FAUCET}` } : null,
    lastDeposit: { tx: LAST_DEPOSIT, explorer: `${EXPLORER}/tx/${LAST_DEPOSIT}` },
    lastProfit: { tx: LAST_PROFIT, explorer: `${EXPLORER}/tx/${LAST_PROFIT}` },
  })
}

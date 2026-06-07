import { NextResponse } from 'next/server'
import { EXPLORER, FAUCET, TOKEN, TREASURY } from '../_shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    ok: true,
    network: 'celo-sepolia',
    treasury: TREASURY,
    token: TOKEN,
    faucet: FAUCET || null,
    explorer: EXPLORER,
    timestamp: new Date().toISOString(),
  })
}

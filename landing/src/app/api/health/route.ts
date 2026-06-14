import { NextResponse } from 'next/server'
import { client, EXPLORER, FAUCET, TOKEN, TREASURY, withRpc } from '../_shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  return withRpc(async () => {
    const blockNumber = await client.getBlockNumber()

    return NextResponse.json({
      ok: true,
      network: 'celo-sepolia',
      blockNumber: blockNumber.toString(),
      treasury: TREASURY,
      token: TOKEN,
      faucet: FAUCET || null,
      explorer: EXPLORER,
      timestamp: new Date().toISOString(),
    })
  })
}

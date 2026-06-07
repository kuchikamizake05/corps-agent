import { NextResponse } from 'next/server'
import { asPrice, asToken, client, EXPLORER, TOKEN, treasuryAbi, TREASURY } from '../_shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [totalAssets, totalShares, sharePrice, pendingOwnerFee, vaultBalance] = await Promise.all([
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'totalAssets' }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'totalShares' }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'sharePrice' }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'pendingOwnerFee' }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'vaultBalance' }),
  ])

  return NextResponse.json({
    network: 'celo-sepolia',
    treasury: { address: TREASURY, explorer: `${EXPLORER}/address/${TREASURY}` },
    token: { address: TOKEN, explorer: `${EXPLORER}/address/${TOKEN}` },
    totalAssets: asToken(totalAssets),
    totalShares: asToken(totalShares),
    sharePrice: asPrice(sharePrice),
    pendingOwnerFee: asToken(pendingOwnerFee),
    vaultBalance: asToken(vaultBalance),
  })
}

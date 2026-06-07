import { NextResponse } from 'next/server'
import { asToken, client, treasuryAbi, TREASURY } from '../_shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [totalAssets, totalShares, pendingOwnerFee, vaultBalance] = await Promise.all([
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'totalAssets' }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'totalShares' }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'pendingOwnerFee' }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'vaultBalance' }),
  ])
  const accounted = totalAssets + pendingOwnerFee
  const solvency = vaultBalance >= accounted
  const zero = BigInt(0)
  const shareAccounting = totalShares > zero || totalAssets === zero
  const feePct = totalAssets > zero ? Number((pendingOwnerFee * BigInt(10000)) / totalAssets) / 100 : 0

  return NextResponse.json({
    treasury: TREASURY,
    solvency: solvency ? 'PASS' : 'FAIL',
    shareAccounting: shareAccounting ? 'PASS' : 'FAIL',
    payoutRisk: solvency && shareAccounting ? 'LOW' : 'HIGH',
    feeLiability: `${feePct.toFixed(2)}%`,
    totalAssets: `${asToken(totalAssets, 2)} tUSDC`,
    lastCheck: new Date().toISOString(),
  })
}

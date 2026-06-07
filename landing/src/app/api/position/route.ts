import { NextRequest, NextResponse } from 'next/server'
import { asPrice, asToken, client, treasuryAbi, TREASURY, validAddress } from '../_shared'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')
  if (!validAddress(address)) return NextResponse.json({ error: 'Invalid address' }, { status: 400 })

  const [shares, userValue, sharePrice] = await Promise.all([
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'shares', args: [address as `0x${string}`] }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'userValue', args: [address as `0x${string}`] }),
    client.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'sharePrice' }),
  ])

  const principal = Number(asToken(shares, 6).replace(/,/g, ''))
  const current = Number(asToken(userValue, 6).replace(/,/g, ''))
  const pnlPct = principal > 0 ? ((current - principal) / principal) * 100 : 0

  return NextResponse.json({
    wallet: address,
    shares: asToken(shares),
    currentValue: asToken(userValue),
    sharePrice: asPrice(sharePrice),
    pnlPct: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`,
  })
}

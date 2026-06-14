import { NextRequest, NextResponse } from 'next/server'

const VPS_WEBHOOK = 'http://23.26.4.42:7890'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tg_id } = body

    if (!tg_id) {
      return NextResponse.json({ ok: false, error: 'tg_id required' }, { status: 400 })
    }

    const res = await fetch(`${VPS_WEBHOOK}/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tg_id }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

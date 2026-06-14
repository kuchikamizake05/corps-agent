import { NextRequest, NextResponse } from 'next/server'

const VPS_WEBHOOK = process.env.CORPS_AGENT_WEBHOOK_URL

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tg_id, wallet, signature, nonce } = body

    if (!VPS_WEBHOOK) {
      return NextResponse.json({ ok: false, error: 'CORPS_AGENT_WEBHOOK_URL not configured' }, { status: 500 })
    }

    if (!tg_id || !wallet || !signature || !nonce) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    // Forward to VPS webhook
    const res = await fetch(`${VPS_WEBHOOK}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tg_id, wallet, signature, nonce }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

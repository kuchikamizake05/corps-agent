'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useSignMessage, useSwitchChain } from 'wagmi'
import { celoSepolia } from '../celoSepolia'
import { DepositProviders } from '../deposit/appkit'

type Step = 'loading' | 'connect' | 'signing' | 'verifying' | 'done' | 'error'

function ConnectInner() {
  const searchParams = useSearchParams()
  const { open } = useAppKit()
  const { address, isConnected, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { signMessageAsync } = useSignMessage()

  const tg = searchParams.get('tg')
  const nonce = searchParams.get('nonce')

  const [step, setStep] = useState<Step>('loading')
  const [message, setMessage] = useState('')

  const verify = useCallback(async (walletAddr: string, sig: `0x${string}`) => {
    setStep('verifying')
    setMessage('Verifying signature with Corps Agent...')
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tg_id: tg,
          wallet: walletAddr,
          signature: sig,
          nonce,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setStep('done')
        setMessage(`✅ Wallet ${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)} terverifikasi!`)
      } else {
        setStep('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch {
      setStep('error')
      setMessage('Gagal hubungi server verifikasi')
    }
  }, [tg, nonce])

  useEffect(() => {
    if (!tg || !nonce) {
      setStep('error')
      setMessage('Link tidak valid — parameter tg atau nonce hilang.')
      return
    }
    if (step !== 'loading') return
    setStep('connect')
    setMessage('Klik tombol Connect Wallet untuk memulai.')
  }, [tg, nonce, step])

  async function handleConnect() {
    if (!isConnected) {
      await open({ view: 'Connect' })
      return
    }

    if (chainId !== celoSepolia.id) {
      try {
        await switchChainAsync({ chainId: celoSepolia.id })
      } catch {
        setStep('error')
        setMessage('Gagal switch ke Celo Sepolia')
        return
      }
    }

    setStep('signing')
    setMessage(`Sign pesan: CorpsAgent:verify:${nonce}`)
    try {
      const sig = await signMessageAsync({ message: `CorpsAgent:verify:${nonce}` })
      await verify(address!, sig)
    } catch {
      setStep('error')
      setMessage('Signature ditolak atau gagal. Coba lagi.')
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      <main className="mx-auto grid min-h-screen w-full max-w-[520px] items-center px-6 py-24">
        <section className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#f5f257]">Corps Agent</p>
          <h1 className="mt-4 text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[.96] tracking-[-.05em]">
            Verify your wallet
          </h1>
          <p className="mt-3 text-xs text-zinc-500">
            tg: {tg || '-'} &middot; nonce: {nonce ? nonce.slice(0, 8) + '...' : '-'}
          </p>

          <div className="mt-8 rounded-[32px] bg-[#0d0f12] p-5 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_100px_rgba(0,0,0,.45)]">
            <div className="rounded-[26px] bg-[#111318] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
              <div className="space-y-4">
                <div className="grid gap-3 rounded-2xl bg-black/20 p-4 text-sm text-zinc-400 shadow-[0_0_0_1px_rgba(255,255,255,.06)]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Status</span>
                    <strong className="text-xs text-white">{step}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Wallet</span>
                    <strong className="font-mono text-xs text-white">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'not connected'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Chain</span>
                    <strong className="text-xs text-white">
                      {isConnected && chainId === celoSepolia.id ? 'Celo Sepolia ✓' : isConnected ? 'wrong network' : '-'}
                    </strong>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f5f257]/[.08] p-4 text-sm leading-6 text-[#d9d77a] shadow-[0_0_0_1px_rgba(245,242,87,.12)]">
                  {message || 'Loading...'}
                </div>

                {step === 'connect' && (
                  <button onClick={handleConnect} className="w-full rounded-full bg-[#f5f257] px-5 py-3 text-sm font-semibold text-[#08090a] transition hover:-translate-y-px">
                    {isConnected ? 'Switch Chain & Sign' : 'Connect Wallet'}
                  </button>
                )}

                {step === 'done' && (
                  <a href="https://t.me/CorpsAgentBot" target="_blank" rel="noreferrer" className="block w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-px text-center">
                    Buka bot &rarr;
                  </a>
                )}

                {step === 'error' && (
                  <button onClick={() => { setStep('connect'); setMessage('Coba lagi. Klik Connect Wallet.') }} className="w-full rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40">
                    Coba Lagi
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function ConnectClient() {
  return (
    <DepositProviders>
      <ConnectInner />
    </DepositProviders>
  )
}

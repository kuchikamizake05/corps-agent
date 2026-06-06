'use client'

import { useMemo, useState } from 'react'

const TREASURY = '0xbC46a13BEEDd08592e69ac0EDF20893416A406de'
const TOKEN = '0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2'
const CHAIN_ID = 11142220
const CHAIN_HEX = `0x${CHAIN_ID.toString(16)}`
const DECIMALS = 6
const EXPLORER = 'https://sepolia.celoscan.io'

const CELO_SEPOLIA = {
  chainId: CHAIN_HEX,
  chainName: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: ['https://forno.celo-sepolia.celo-testnet.org'],
  blockExplorerUrls: [EXPLORER],
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

function short(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function encodeUint256(value: bigint) {
  return value.toString(16).padStart(64, '0')
}

function parseUnits(value: string, decimals: number) {
  const clean = value.trim()
  if (!/^\d+(\.\d+)?$/.test(clean)) throw new Error('Enter a valid amount')
  const [whole, fraction = ''] = clean.split('.')
  if (fraction.length > decimals) throw new Error(`Use max ${decimals} decimals`)
  let multiplier = BigInt(1)
  for (let i = 0; i < decimals; i += 1) multiplier *= BigInt(10)
  return BigInt(whole) * multiplier + BigInt(fraction.padEnd(decimals, '0') || '0')
}

async function ensureCeloSepolia(provider: EthereumProvider) {
  const current = await provider.request({ method: 'eth_chainId' })
  if (current === CHAIN_HEX) return

  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] })
  } catch (error) {
    const err = error as { code?: number }
    if (err.code !== 4902) throw error
    await provider.request({ method: 'wallet_addEthereumChain', params: [CELO_SEPOLIA] })
  }
}

async function waitForReceipt(provider: EthereumProvider, hash: string) {
  for (let i = 0; i < 45; i += 1) {
    const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [hash] })
    if (receipt) return receipt
    await new Promise((resolve) => setTimeout(resolve, 2500))
  }
  return null
}

export default function DepositClient() {
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('10')
  const [step, setStep] = useState<'idle' | 'connecting' | 'approving' | 'depositing' | 'confirmed' | 'error'>('idle')
  const [message, setMessage] = useState('Connect wallet to deposit test tUSDC into Corps Treasury.')
  const [txHash, setTxHash] = useState('')

  const explorerUrl = useMemo(() => (txHash ? `${EXPLORER}/tx/${txHash}` : ''), [txHash])
  const busy = ['connecting', 'approving', 'depositing'].includes(step)

  async function connect() {
    if (!window.ethereum) {
      setStep('error')
      setMessage('No wallet detected. Open this page in MetaMask, Valora, or wallet browser.')
      return
    }

    setStep('connecting')
    setMessage('Requesting wallet connection...')
    const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
    await ensureCeloSepolia(window.ethereum)
    setAccount(accounts[0])
    setStep('idle')
    setMessage('Wallet connected. Enter amount, then approve and deposit.')
  }

  async function deposit() {
    try {
      if (!window.ethereum) throw new Error('No wallet detected')
      const [from] = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      await ensureCeloSepolia(window.ethereum)
      setAccount(from)

      const units = parseUnits(amount, DECIMALS)
      if (units <= BigInt(0)) throw new Error('Amount must be greater than zero')
      const amountHex = encodeUint256(units)

      setStep('approving')
      setMessage('Step 1/2: approve test tUSDC spend for Treasury contract.')
      const approveHash = (await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: TOKEN, data: `0x095ea7b3${TREASURY.slice(2).padStart(64, '0')}${amountHex}` }],
      })) as string
      setTxHash(approveHash)
      await waitForReceipt(window.ethereum, approveHash)

      setStep('depositing')
      setMessage('Step 2/2: call Treasury.deposit(amount).')
      const depositHash = (await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: TREASURY, data: `0xb6b55f25${amountHex}` }],
      })) as string
      setTxHash(depositHash)
      await waitForReceipt(window.ethereum, depositHash)

      setStep('confirmed')
      setMessage('Deposit submitted. Bot can now verify the on-chain event and update balance.')
    } catch (error) {
      setStep('error')
      setMessage(error instanceof Error ? error.message : 'Transaction cancelled or failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      <main className="mx-auto grid min-h-screen w-full max-w-[1180px] gap-8 px-6 pb-16 pt-24 md:grid-cols-[.92fr_1.08fr] md:px-8 md:pb-24 md:pt-32">
        <section className="flex flex-col justify-center">
          <a href="/" className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-white">← Back to landing</a>
          <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#f5f257]">Corps Agent Deposit</p>
          <h1 className="mt-4 max-w-[620px] text-[clamp(2.4rem,5.4vw,4.8rem)] font-semibold leading-[.96] tracking-[-.06em]">Deposit through wallet, verify through bot.</h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-[#a1a7b0] md:text-base">Connect wallet on Celo Sepolia, approve test tUSDC, then call Treasury.deposit(). Corps Agent bot watches the event and confirms your credited balance.</p>
          <div className="mt-8 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            {['Connect wallet', 'Approve tUSDC', 'Deposit to Treasury'].map((item, index) => <div key={item} className="rounded-2xl bg-white/[.035] p-4 shadow-[0_0_0_1px_rgba(255,255,255,.07)]"><span className="font-mono text-xs text-[#f5f257]">0{index + 1}</span><p className="mt-2 font-medium text-white">{item}</p></div>)}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-[520px] rounded-[32px] bg-[#0d0f12] p-5 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_100px_rgba(0,0,0,.45)]">
            <div className="rounded-[26px] bg-[#111318] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[.22em] text-zinc-500">Network</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Celo Sepolia</h2>
                </div>
                <span className="rounded-full bg-[#f5f257] px-3 py-1 text-xs font-semibold text-[#08090a]">testnet</span>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[.18em] text-zinc-500">Amount</span>
                  <div className="mt-2 flex items-center rounded-2xl bg-black/30 px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                    <input className="w-full bg-transparent text-3xl font-semibold tracking-[-.04em] outline-none" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
                    <span className="text-sm font-semibold text-zinc-400">tUSDC</span>
                  </div>
                </label>

                <div className="grid gap-3 rounded-2xl bg-black/20 p-4 text-sm text-zinc-400 shadow-[0_0_0_1px_rgba(255,255,255,.06)]">
                  <div className="flex items-center justify-between gap-4"><span>Wallet</span><strong className="font-mono text-xs text-white">{account ? short(account) : 'not connected'}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span>Treasury</span><a className="font-mono text-xs text-white hover:text-[#f5f257]" href={`${EXPLORER}/address/${TREASURY}`} target="_blank" rel="noreferrer">{short(TREASURY)}</a></div>
                  <div className="flex items-center justify-between gap-4"><span>Token</span><a className="font-mono text-xs text-white hover:text-[#f5f257]" href={`${EXPLORER}/address/${TOKEN}`} target="_blank" rel="noreferrer">{short(TOKEN)}</a></div>
                </div>

                <div className="rounded-2xl bg-[#f5f257]/[.08] p-4 text-sm leading-6 text-[#d9d77a] shadow-[0_0_0_1px_rgba(245,242,87,.12)]">{message}</div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button disabled={busy} onClick={connect} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60">{account ? 'Wallet connected' : 'Connect wallet'}</button>
                  <button disabled={busy} onClick={deposit} className="rounded-full bg-[#f5f257] px-5 py-3 text-sm font-semibold text-[#08090a] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Processing...' : 'Approve + Deposit'}</button>
                </div>

                {explorerUrl ? <a className="block truncate rounded-full border border-white/10 px-4 py-3 text-center font-mono text-xs text-zinc-300 transition hover:border-[#f5f257]/40 hover:text-white" href={explorerUrl} target="_blank" rel="noreferrer">View transaction: {short(txHash)}</a> : null}
                <a className="block rounded-full border border-white/10 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white" href="https://t.me/CorpsAgentBot" target="_blank" rel="noreferrer">Open bot after deposit</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

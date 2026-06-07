'use client'

import { useMemo, useState } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { parseUnits } from 'viem'
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi'
import { celoSepolia } from 'viem/chains'

const TREASURY = '0xbC46a13BEEDd08592e69ac0EDF20893416A406de' as const
const TOKEN = '0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2' as const
const DECIMALS = 6
const EXPLORER = 'https://sepolia.celoscan.io'
const APPROVAL_AMOUNT = parseUnits('10000000', DECIMALS)

const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

const treasuryAbi = [
  {
    type: 'function',
    name: 'deposit',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

function short(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function shortError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ''

  if (message.includes('user rejected') || message.includes('rejected the request')) return 'Request cancelled.'
  if (message.includes('insufficient funds')) return 'Insufficient funds.'
  if (message.includes('chain') || message.includes('network')) return 'Switch network and try again.'
  if (message.includes('allowance') || message.includes('approve')) return 'Approval failed.'
  if (message.includes('amount')) return 'Enter a valid amount.'

  return 'Transaction failed.'
}

export default function DepositClient() {
  const { open } = useAppKit()
  const { address, isConnected, chainId } = useAccount()
  const publicClient = usePublicClient({ chainId: celoSepolia.id })
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const [amount, setAmount] = useState('10')
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing' | 'confirmed' | 'error'>('idle')
  const [message, setMessage] = useState('Connect wallet to deposit tUSDC.')
  const [txHash, setTxHash] = useState<`0x${string}` | ''>('')

  const explorerUrl = useMemo(() => (txHash ? `${EXPLORER}/tx/${txHash}` : ''), [txHash])
  const busy = ['approving', 'depositing'].includes(step)
  const wrongNetwork = isConnected && chainId !== celoSepolia.id

  async function ensureNetwork() {
    if (chainId === celoSepolia.id) return
    await switchChainAsync({ chainId: celoSepolia.id })
  }

  async function deposit() {
    try {
      if (!isConnected || !address) {
        await open({ view: 'Connect' })
        return
      }

      await ensureNetwork()
      const units = parseUnits(amount, DECIMALS)
      if (units <= BigInt(0)) throw new Error('Amount must be greater than zero')
      if (!publicClient) throw new Error('Celo Sepolia client is not ready')

      const allowance = await publicClient.readContract({
        address: TOKEN,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, TREASURY],
      })

      if (allowance < units) {
        setStep('approving')
        setMessage('One-time setup: approving 10,000,000 tUSDC allowance for Treasury.')
        const approveHash = await writeContractAsync({
          address: TOKEN,
          abi: erc20Abi,
          functionName: 'approve',
          args: [TREASURY, APPROVAL_AMOUNT],
          chainId: celoSepolia.id,
        })
        setTxHash(approveHash)
        await publicClient.waitForTransactionReceipt({ hash: approveHash })
      }

      setStep('depositing')
      setMessage('Calling Treasury.deposit(amount).')
      const depositHash = await writeContractAsync({
        address: TREASURY,
        abi: treasuryAbi,
        functionName: 'deposit',
        args: [units],
        chainId: celoSepolia.id,
      })
      setTxHash(depositHash)

      setStep('confirmed')
      setMessage('Deposit transaction submitted. Corps Agent bot can verify the on-chain event and update balance.')
    } catch (error) {
      setStep('error')
      setMessage(shortError(error))
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      <main className="mx-auto grid min-h-screen w-full max-w-[1120px] items-center gap-4 px-5 py-3 md:grid-cols-[.82fr_1.18fr] md:px-7 md:py-8">
        <section className="flex flex-col justify-center">
          <a href="/" className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-white md:mb-4">Back to landing</a>
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#f5f257]">Corps Agent Deposit</p>
          <h1 className="mt-2 max-w-[560px] text-[clamp(1.95rem,4.8vw,4rem)] font-semibold leading-[.94] tracking-[-.06em] md:mt-3">Deposit through wallet, verify through bot.</h1>
          <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#a1a7b0] md:mt-4 md:text-[15px]">Deposit tUSDC on Celo Sepolia. First deposit auto-approves once; later deposits go straight to Treasury.</p>
          <div className="mt-5 hidden gap-2 text-sm text-zinc-300 sm:grid sm:grid-cols-3">
            {['Connect', 'Auto-approve', 'Deposit'].map((item, index) => <div key={item} className="rounded-2xl bg-white/[.035] p-3 shadow-[0_0_0_1px_rgba(255,255,255,.07)]"><span className="font-mono text-[11px] text-[#f5f257]">0{index + 1}</span><p className="mt-1.5 font-medium text-white">{item}</p></div>)}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-[500px] rounded-[26px] bg-[#0d0f12] p-3 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_80px_rgba(0,0,0,.42)]">
            <div className="rounded-[22px] bg-[#111318] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[.18em] text-zinc-500">Network</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-[-.03em]">Celo Sepolia</h2>
                </div>
                <span className="rounded-full bg-[#f5f257] px-3 py-1 text-xs font-semibold text-[#08090a]">Reown</span>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-[.16em] text-zinc-500">Amount</span>
                  <div className="mt-2 flex items-center rounded-2xl bg-black/30 px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                    <input className="w-full bg-transparent text-2xl font-semibold tracking-[-.04em] outline-none" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
                    <span className="text-sm font-semibold text-zinc-400">tUSDC</span>
                  </div>
                </label>

                <div className="grid gap-2 rounded-2xl bg-black/20 p-3 text-sm text-zinc-400 shadow-[0_0_0_1px_rgba(255,255,255,.06)]">
                  <div className="flex items-center justify-between gap-4"><span>Wallet</span><strong className="font-mono text-xs text-white">{address ? short(address) : 'not connected'}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span>Chain</span><strong className={wrongNetwork ? 'text-xs text-red-300' : 'text-xs text-white'}>{wrongNetwork ? 'wrong network' : 'Celo Sepolia'}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span>Treasury</span><a className="font-mono text-xs text-white hover:text-[#f5f257]" href={`${EXPLORER}/address/${TREASURY}`} target="_blank" rel="noreferrer">{short(TREASURY)}</a></div>
                  <div className="flex items-center justify-between gap-4"><span>Token</span><a className="font-mono text-xs text-white hover:text-[#f5f257]" href={`${EXPLORER}/address/${TOKEN}`} target="_blank" rel="noreferrer">{short(TOKEN)}</a></div>
                </div>

                <div className="rounded-2xl bg-[#f5f257]/[.08] p-3 text-sm leading-5 text-[#d9d77a] shadow-[0_0_0_1px_rgba(245,242,87,.12)]">{message}</div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button disabled={busy} onClick={() => open({ view: 'Connect' })} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60">{isConnected ? 'Manage wallet' : 'Connect wallet'}</button>
                  <button disabled={busy} onClick={deposit} className="rounded-full bg-[#f5f257] px-5 py-2.5 text-sm font-semibold text-[#08090a] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60">{step === 'approving' ? 'Approving...' : step === 'depositing' ? 'Depositing...' : wrongNetwork ? 'Switch + Deposit' : 'Deposit'}</button>
                </div>

                {explorerUrl ? <a className="block truncate rounded-full border border-white/10 px-4 py-2.5 text-center font-mono text-xs text-zinc-300 transition hover:border-[#f5f257]/40 hover:text-white" href={explorerUrl} target="_blank" rel="noreferrer">View transaction: {short(txHash)}</a> : null}
                <a className="block rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white" href="https://t.me/CorpsAgentBot" target="_blank" rel="noreferrer">Open bot after deposit</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

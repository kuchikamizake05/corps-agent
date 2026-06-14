'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { formatUnits, parseUnits } from 'viem'
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi'
import { celoSepolia } from '../celoSepolia'

const TREASURY = '0xbC46a13BEEDd08592e69ac0EDF20893416A406de' as const
const TOKEN = '0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2' as const
const FAUCET = process.env.NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS as `0x${string}` | undefined
const DECIMALS = 6
const EXPLORER = 'https://sepolia.celoscan.io'
const CELO_FAUCET = 'https://faucet.celo.org'
const APPROVAL_AMOUNT = parseUnits('10000000', DECIMALS)
const ZERO = BigInt(0)
const ONE = BigInt('1000000000000000000')

const erc20Abi = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
] as const

const treasuryAbi = [
  { type: 'function', name: 'deposit', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'withdraw', stateMutability: 'nonpayable', inputs: [{ name: 'shareAmount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'shares', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'userValue', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'sharePrice', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'totalAssets', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'totalShares', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'previewWithdraw', stateMutability: 'view', inputs: [{ name: 'shareAmount', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }] },
] as const

const faucetAbi = [
  { type: 'function', name: 'claim', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'function', name: 'canClaim', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'nextClaimTime', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
] as const

function short(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function token(value: bigint, digits = 6) {
  return Number(formatUnits(value, DECIMALS)).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

function price(value: bigint) {
  return Number(formatUnits(value, 18)).toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 4 })
}

function cooldownLabel(nextClaimTime: bigint, canClaim: boolean) {
  if (canClaim || nextClaimTime === ZERO) return 'ready'
  const left = Number(nextClaimTime) - Math.floor(Date.now() / 1000)
  if (left <= 0) return 'ready'
  const minutes = Math.ceil(left / 60)
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`
  return `${minutes}m left`
}

function shortError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  if (message.includes('user rejected') || message.includes('rejected the request')) return 'Request cancelled.'
  if (message.includes('insufficient funds')) return 'Insufficient CELO for gas.'
  if (message.includes('chain') || message.includes('network')) return 'Switch network and try again.'
  if (message.includes('allowance') || message.includes('approve')) return 'Approval failed.'
  if (message.includes('cooldown')) return 'Faucet cooldown is still active.'
  if (message.includes('amount') || message.includes('shares')) return 'Enter a valid amount.'
  return 'Transaction failed.'
}

function parseTokenInput(value: string) {
  try {
    return parseUnits(value || '0', DECIMALS)
  } catch {
    return ZERO
  }
}

export default function DepositClient() {
  const { open } = useAppKit()
  const { address, isConnected, chainId } = useAccount()
  const publicClient = usePublicClient({ chainId: celoSepolia.id })
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('10')
  const [withdrawShares, setWithdrawShares] = useState('0')
  const [step, setStep] = useState<'idle' | 'claiming' | 'approving' | 'depositing' | 'withdrawing' | 'confirmed' | 'error'>('idle')
  const [message, setMessage] = useState('Connect wallet to deposit tUSDC.')
  const [txHash, setTxHash] = useState<`0x${string}` | ''>('')
  const [position, setPosition] = useState({ shares: ZERO, userValue: ZERO, sharePrice: ONE, totalAssets: ZERO, totalShares: ZERO, previewOut: ZERO })
  const [faucet, setFaucet] = useState({ canClaim: false, nextClaimTime: ZERO })

  const explorerUrl = useMemo(() => (txHash ? `${EXPLORER}/tx/${txHash}` : ''), [txHash])
  const busy = ['claiming', 'approving', 'depositing', 'withdrawing'].includes(step)
  const wrongNetwork = isConnected && chainId !== celoSepolia.id
  const faucetReady = Boolean(FAUCET)

  async function ensureWallet() {
    if (!isConnected || !address) {
      await open({ view: 'Connect' })
      return false
    }
    if (chainId !== celoSepolia.id) await switchChainAsync({ chainId: celoSepolia.id })
    return true
  }

  const refresh = useCallback(async () => {
    if (!publicClient || !address) return
    const [shares, userValue, sharePriceValue, totalAssets, totalShares] = await Promise.all([
      publicClient.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'shares', args: [address] }),
      publicClient.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'userValue', args: [address] }),
      publicClient.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'sharePrice' }),
      publicClient.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'totalAssets' }),
      publicClient.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'totalShares' }),
    ])
    const shareUnits = parseTokenInput(withdrawShares)
    const previewOut = shareUnits > ZERO
      ? await publicClient.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'previewWithdraw', args: [shareUnits] })
      : ZERO
    setPosition({ shares, userValue, sharePrice: sharePriceValue, totalAssets, totalShares, previewOut })

    if (FAUCET) {
      const [canClaim, nextClaimTime] = await Promise.all([
        publicClient.readContract({ address: FAUCET, abi: faucetAbi, functionName: 'canClaim', args: [address] }),
        publicClient.readContract({ address: FAUCET, abi: faucetAbi, functionName: 'nextClaimTime', args: [address] }),
      ])
      setFaucet({ canClaim, nextClaimTime })
    }
  }, [address, publicClient, withdrawShares])

  useEffect(() => {
    refresh().catch(() => undefined)
  }, [refresh])

  function fillPercent(percent: number) {
    const value = Number(formatUnits(position.shares, DECIMALS)) * percent
    setWithdrawShares(value.toFixed(6).replace(/\.?0+$/, ''))
  }

  async function claim() {
    try {
      if (!FAUCET) throw new Error('Faucet address missing')
      if (!(await ensureWallet()) || !publicClient) return
      setStep('claiming')
      setMessage('Claiming 100 tUSDC from demo faucet.')
      const hash = await writeContractAsync({ address: FAUCET, abi: faucetAbi, functionName: 'claim', chainId: celoSepolia.id })
      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setStep('confirmed')
      setMessage('100 tUSDC claimed. You can deposit now.')
      await refresh()
    } catch (error) {
      setStep('error')
      setMessage(shortError(error))
    }
  }

  async function deposit() {
    try {
      if (!(await ensureWallet()) || !address || !publicClient) return
      const units = parseUnits(amount || '0', DECIMALS)
      if (units <= ZERO) throw new Error('Amount must be greater than zero')

      const allowance = await publicClient.readContract({ address: TOKEN, abi: erc20Abi, functionName: 'allowance', args: [address, TREASURY] })
      if (allowance < units) {
        setStep('approving')
        setMessage('Approving Treasury allowance.')
        const approveHash = await writeContractAsync({ address: TOKEN, abi: erc20Abi, functionName: 'approve', args: [TREASURY, APPROVAL_AMOUNT], chainId: celoSepolia.id })
        setTxHash(approveHash)
        await publicClient.waitForTransactionReceipt({ hash: approveHash })
      }

      setStep('depositing')
      setMessage('Calling Treasury.deposit(amount).')
      const depositHash = await writeContractAsync({ address: TREASURY, abi: treasuryAbi, functionName: 'deposit', args: [units], chainId: celoSepolia.id })
      setTxHash(depositHash)
      await publicClient.waitForTransactionReceipt({ hash: depositHash })
      setStep('confirmed')
      setMessage('Deposit confirmed. Your position panel is refreshed.')
      await refresh()
    } catch (error) {
      setStep('error')
      setMessage(shortError(error))
    }
  }

  async function withdraw() {
    try {
      if (!(await ensureWallet()) || !publicClient) return
      const units = parseUnits(withdrawShares || '0', DECIMALS)
      if (units <= ZERO) throw new Error('Shares must be greater than zero')
      setStep('withdrawing')
      setMessage('Calling Treasury.withdraw(shares).')
      const hash = await writeContractAsync({ address: TREASURY, abi: treasuryAbi, functionName: 'withdraw', args: [units], chainId: celoSepolia.id })
      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setStep('confirmed')
      setMessage('Withdraw confirmed. Your position panel is refreshed.')
      await refresh()
    } catch (error) {
      setStep('error')
      setMessage(shortError(error))
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      <main className="mx-auto grid min-h-screen w-full max-w-[1180px] items-center gap-4 px-5 py-3 md:grid-cols-[.78fr_1.22fr] md:px-7 md:py-8">
        <section className="flex flex-col justify-center">
          <a href="/" className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-white md:mb-4">Back to landing</a>
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#f5f257]">Corps Agent Deposit</p>
          <h1 className="mt-2 max-w-[560px] text-[clamp(1.95rem,4.8vw,4rem)] font-semibold leading-[.94] tracking-[-.06em] md:mt-3">Deposit through wallet, verify through bot.</h1>
          <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#a1a7b0] md:mt-4 md:text-[15px]">Get demo funds, deposit tUSDC, inspect vault shares, then withdraw from the same Celo Sepolia flow.</p>

          <div className="mt-5 rounded-2xl bg-white/[.035] p-4 text-sm text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,.07)]">
            <p className="font-semibold text-white">Need test funds?</p>
            <p className="mt-1.5 text-zinc-400">You need Celo Sepolia CELO for gas and tUSDC for deposit.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <a className="rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-black transition hover:-translate-y-px" href={CELO_FAUCET} target="_blank" rel="noreferrer">Get CELO gas</a>
              <button disabled={busy || !faucetReady || (isConnected && !faucet.canClaim)} onClick={claim} className="rounded-full bg-[#f5f257] px-4 py-2 text-xs font-semibold text-[#08090a] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50">{step === 'claiming' ? 'Claiming...' : 'Claim 100 tUSDC'}</button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Cooldown: {faucetReady ? cooldownLabel(faucet.nextClaimTime, faucet.canClaim) : 'faucet address not configured'}</p>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-[1fr_.9fr]">
          <div className="rounded-[26px] bg-[#0d0f12] p-3 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_80px_rgba(0,0,0,.42)]">
            <div className="rounded-[22px] bg-[#111318] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                <div><p className="text-[11px] uppercase tracking-[.18em] text-zinc-500">Network</p><h2 className="mt-1 text-lg font-semibold tracking-[-.03em]">Celo Sepolia</h2></div>
                <span className="rounded-full bg-[#f5f257] px-3 py-1 text-xs font-semibold text-[#08090a]">Reown</span>
              </div>

              <div className="mt-4 grid grid-cols-2 rounded-full bg-black/30 p-1 text-sm font-semibold">
                <button className={`rounded-full px-4 py-2 ${mode === 'deposit' ? 'bg-white text-black' : 'text-zinc-400'}`} onClick={() => setMode('deposit')}>Deposit</button>
                <button className={`rounded-full px-4 py-2 ${mode === 'withdraw' ? 'bg-white text-black' : 'text-zinc-400'}`} onClick={() => setMode('withdraw')}>Withdraw</button>
              </div>

              <div className="mt-4 space-y-3">
                {mode === 'deposit' ? (
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[.16em] text-zinc-500">Amount</span>
                    <div className="mt-2 flex items-center rounded-2xl bg-black/30 px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                      <input className="w-full bg-transparent text-2xl font-semibold tracking-[-.04em] outline-none" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
                      <span className="text-sm font-semibold text-zinc-400">tUSDC</span>
                    </div>
                  </label>
                ) : (
                  <div>
                    <label className="block">
                      <span className="text-[11px] font-medium uppercase tracking-[.16em] text-zinc-500">Shares</span>
                      <div className="mt-2 flex items-center rounded-2xl bg-black/30 px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                        <input className="w-full bg-transparent text-2xl font-semibold tracking-[-.04em] outline-none" inputMode="decimal" value={withdrawShares} onChange={(event) => setWithdrawShares(event.target.value)} />
                        <span className="text-sm font-semibold text-zinc-400">shares</span>
                      </div>
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[0.25, 0.5, 1].map((pct) => <button key={pct} onClick={() => fillPercent(pct)} className="rounded-full bg-white/[.06] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/[.1]">{pct * 100}%</button>)}
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">Preview out: {token(position.previewOut)} tUSDC</p>
                  </div>
                )}

                <div className="grid gap-2 rounded-2xl bg-black/20 p-3 text-sm text-zinc-400 shadow-[0_0_0_1px_rgba(255,255,255,.06)]">
                  <div className="flex items-center justify-between gap-4"><span>Wallet</span><strong className="font-mono text-xs text-white">{address ? short(address) : 'not connected'}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span>Chain</span><strong className={wrongNetwork ? 'text-xs text-red-300' : 'text-xs text-white'}>{wrongNetwork ? 'wrong network' : 'Celo Sepolia'}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span>Treasury</span><a className="font-mono text-xs text-white hover:text-[#f5f257]" href={`${EXPLORER}/address/${TREASURY}`} target="_blank" rel="noreferrer">{short(TREASURY)}</a></div>
                  <div className="flex items-center justify-between gap-4"><span>Token</span><a className="font-mono text-xs text-white hover:text-[#f5f257]" href={`${EXPLORER}/address/${TOKEN}`} target="_blank" rel="noreferrer">{short(TOKEN)}</a></div>
                  <div className="flex items-center justify-between gap-4"><span>Faucet</span>{FAUCET ? <a className="font-mono text-xs text-white hover:text-[#f5f257]" href={`${EXPLORER}/address/${FAUCET}`} target="_blank" rel="noreferrer">{short(FAUCET)}</a> : <strong className="text-xs text-red-300">not configured</strong>}</div>
                </div>

                <div className="rounded-2xl bg-[#f5f257]/[.08] p-3 text-sm leading-5 text-[#d9d77a] shadow-[0_0_0_1px_rgba(245,242,87,.12)]">{message}</div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button disabled={busy} onClick={() => open({ view: 'Connect' })} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60">{isConnected ? 'Manage wallet' : 'Connect wallet'}</button>
                  <button disabled={busy} onClick={mode === 'deposit' ? deposit : withdraw} className="rounded-full bg-[#f5f257] px-5 py-2.5 text-sm font-semibold text-[#08090a] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60">{step === 'approving' ? 'Approving...' : step === 'depositing' ? 'Depositing...' : step === 'withdrawing' ? 'Withdrawing...' : wrongNetwork ? `Switch + ${mode}` : mode === 'deposit' ? 'Deposit' : 'Withdraw'}</button>
                </div>

                {explorerUrl ? <a className="block truncate rounded-full border border-white/10 px-4 py-2.5 text-center font-mono text-xs text-zinc-300 transition hover:border-[#f5f257]/40 hover:text-white" href={explorerUrl} target="_blank" rel="noreferrer">View transaction: {short(txHash)}</a> : null}
                <a className="block rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white" href="https://t.me/CorpsAgentBot" target="_blank" rel="noreferrer">Open bot after deposit</a>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] bg-[#0d0f12] p-4 shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#f5f257]">Your position</p>
            <div className="mt-4 grid gap-2 text-sm text-zinc-400">
              <Row label="Wallet" value={address ? short(address) : 'not connected'} mono />
              <Row label="Shares" value={token(position.shares)} mono />
              <Row label="Current value" value={`${token(position.userValue)} tUSDC`} mono />
              <Row label="Share price" value={price(position.sharePrice)} mono />
              <Row label="Treasury assets" value={`${token(position.totalAssets, 2)} tUSDC`} mono />
              <Row label="Total shares" value={token(position.totalShares)} mono />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-black/20 px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,.05)]">
      <span>{label}</span>
      <strong className={`${mono ? 'font-mono text-xs' : 'text-sm'} text-white`}>{value}</strong>
    </div>
  )
}

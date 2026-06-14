'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { formatUnits, getAddress, isAddress, parseUnits } from 'viem'
import { useSearchParams } from 'next/navigation'
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi'
import { celoSepolia } from '../celoSepolia'

const TREASURY = '0xbC46a13BEEDd08592e69ac0EDF20893416A406de' as const
const TOKEN = '0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2' as const
const FAUCET = process.env.NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS as `0x${string}` | undefined
const DECIMALS = 18
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

function formatDecimal(value: number, digits = 4) {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: value === 0 ? 0 : Math.min(2, digits),
  })
}

function token(value: bigint, digits = 4) {
  return formatDecimal(Number(formatUnits(value, DECIMALS)), digits)
}

function tokenPrecise(value: bigint, digits = 6) {
  const parsed = Number(formatUnits(value, DECIMALS))
  return parsed.toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: parsed === 0 ? 0 : Math.min(2, digits),
  })
}

function price(value: bigint) {
  return formatDecimal(Number(formatUnits(value, 18)), 4)
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
  const searchParams = useSearchParams()
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
  const tg = searchParams.get('tg')
  const verifiedWalletParam = searchParams.get('wallet')
  const verifiedWallet = verifiedWalletParam && isAddress(verifiedWalletParam) ? getAddress(verifiedWalletParam) : null
  const connectedWallet = address ? getAddress(address) : null
  const walletMismatch = Boolean(verifiedWallet && connectedWallet && verifiedWallet !== connectedWallet)
  const busy = ['claiming', 'approving', 'depositing', 'withdrawing'].includes(step)
  const wrongNetwork = isConnected && chainId !== celoSepolia.id
  const faucetReady = Boolean(FAUCET)

  async function ensureWallet() {
    if (!isConnected || !address) {
      await open({ view: 'Connect' })
      return false
    }
    if (walletMismatch) {
      setStep('error')
      setMessage(`Wallet mismatch. Connect verified wallet ${short(verifiedWallet!)}.`)
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
    <div className="min-h-screen overflow-x-hidden bg-[#07080a] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <header className="grid gap-3 border-b border-white/[.07] pb-3 lg:grid-cols-[1fr_560px] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <a href="/" className="inline-flex h-7 items-center rounded-md border border-white/10 bg-white/[.035] px-2.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:text-white">Back</a>
              <p className="text-[10px] font-semibold uppercase text-[#f5f257]">Corps Agent Deposit</p>
            </div>
            <div className="mt-2">
              <h1 className="text-[clamp(2rem,3.1vw,3.1rem)] font-semibold leading-none tracking-normal lg:whitespace-nowrap">Deposit, verify, report.</h1>
              <p className="mt-2 max-w-[760px] text-sm leading-5 text-[#a1a7b0]">Claim demo tUSDC, deposit into Treasury, then prove the result through the Telegram bot.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <StatusPill label="Network" value={wrongNetwork ? 'Wrong' : 'Sepolia'} tone={wrongNetwork ? 'bad' : 'ok'} />
            <StatusPill label="Wallet" value={address ? short(address) : 'Offline'} tone={address ? 'ok' : 'idle'} />
            <StatusPill label="Faucet" value={faucetReady ? cooldownLabel(faucet.nextClaimTime, faucet.canClaim) : 'Missing'} tone={faucetReady && faucet.canClaim ? 'ok' : 'idle'} />
          </div>
        </header>

        <section className="grid flex-1 items-start gap-3 lg:grid-cols-[280px_minmax(360px,520px)_minmax(420px,1fr)]">
          <aside className="self-start rounded-lg border border-white/[.08] bg-[#0d0f12]/90 p-3 shadow-[0_18px_55px_rgba(0,0,0,.28)] lg:h-[430px]">
            <div>
              <p className="text-sm font-semibold text-white">Test funds</p>
              <p className="mt-1 text-sm leading-5 text-zinc-400">Gas first, then claim demo tUSDC.</p>
              <div className="mt-3 grid gap-2">
                <a className="inline-flex h-9 items-center justify-center rounded-md bg-white px-3 text-sm font-semibold text-black transition hover:-translate-y-px" href={CELO_FAUCET} target="_blank" rel="noreferrer">Get CELO gas</a>
                <button disabled={busy || walletMismatch || !faucetReady || (isConnected && !faucet.canClaim)} onClick={claim} className="inline-flex h-9 items-center justify-center rounded-md bg-[#f5f257] px-3 text-sm font-semibold text-[#08090a] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50">{step === 'claiming' ? 'Claiming...' : 'Claim 100 tUSDC'}</button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">Cooldown: {faucetReady ? cooldownLabel(faucet.nextClaimTime, faucet.canClaim) : 'faucet address not configured'}</p>
            </div>

            <div className="my-3 h-px bg-white/[.07]" />

            <div>
              <p className="text-[11px] font-semibold uppercase text-zinc-500">Contracts</p>
              <div className="mt-2 grid gap-1.5 text-sm text-zinc-400">
                <LinkRow label="Treasury" href={`${EXPLORER}/address/${TREASURY}`} value={short(TREASURY)} />
                <LinkRow label="Token" href={`${EXPLORER}/address/${TOKEN}`} value={short(TOKEN)} />
                {FAUCET ? <LinkRow label="Faucet" href={`${EXPLORER}/address/${FAUCET}`} value={short(FAUCET)} /> : <Row label="Faucet" value="not configured" />}
              </div>
            </div>
          </aside>

          <div className="self-start rounded-lg border border-white/[.08] bg-[#101216] p-2 shadow-[0_24px_70px_rgba(0,0,0,.32)] lg:h-[430px]">
            <div className="rounded-lg border border-white/[.06] bg-[#151820] p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-zinc-500">Wallet module</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-normal">Celo Sepolia Treasury</h2>
                </div>
                <span className="rounded-md bg-[#f5f257] px-2 py-1 text-xs font-semibold text-[#08090a]">Reown</span>
              </div>

              <div className="mt-3 grid grid-cols-2 rounded-lg bg-black/30 p-1 text-sm font-semibold">
                <button className={`rounded-md px-3 py-1.5 transition ${mode === 'deposit' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`} onClick={() => setMode('deposit')}>Deposit</button>
                <button className={`rounded-md px-3 py-1.5 transition ${mode === 'withdraw' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`} onClick={() => setMode('withdraw')}>Withdraw</button>
              </div>

              <div className="mt-3 space-y-2.5">
                {mode === 'deposit' ? (
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase text-zinc-500">Amount</span>
                    <div className="mt-1 flex h-14 items-center rounded-lg border border-white/[.08] bg-black/25 px-3 sm:h-12">
                      <input className="w-full bg-transparent text-3xl font-semibold tracking-normal outline-none sm:text-2xl" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
                      <span className="text-sm font-semibold text-zinc-400">tUSDC</span>
                    </div>
                  </label>
                ) : (
                  <div>
                    <label className="block">
                      <span className="text-[11px] font-medium uppercase text-zinc-500">Shares</span>
                      <div className="mt-1 flex h-14 items-center rounded-lg border border-white/[.08] bg-black/25 px-3 sm:h-12">
                        <input className="w-full bg-transparent text-3xl font-semibold tracking-normal outline-none sm:text-2xl" inputMode="decimal" value={withdrawShares} onChange={(event) => setWithdrawShares(event.target.value)} />
                        <span className="text-sm font-semibold text-zinc-400">shares</span>
                      </div>
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[0.25, 0.5, 1].map((pct) => <button key={pct} onClick={() => fillPercent(pct)} className="rounded-lg border border-white/[.08] bg-white/[.04] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/[.08]">{pct * 100}%</button>)}
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">Preview out: <span className="font-mono text-white">{token(position.previewOut)} tUSDC</span></p>
                  </div>
                )}

                <div className="grid gap-1.5 rounded-lg border border-white/[.07] bg-black/20 p-1.5 text-sm text-zinc-400 sm:grid-cols-2">
                  <Row label="Wallet" value={address ? short(address) : 'not connected'} mono />
                  <Row label="Chain" value={wrongNetwork ? 'wrong network' : 'Celo Sepolia'} tone={wrongNetwork ? 'bad' : 'default'} />
                  {tg ? <Row label="Telegram" value={tg} mono /> : null}
                  {verifiedWallet ? <Row label="Verified" value={short(verifiedWallet)} mono tone={walletMismatch ? 'bad' : 'default'} /> : null}
                </div>

                {walletMismatch ? (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/[.08] px-3 py-2 text-sm leading-5 text-red-200">
                    Wallet mismatch. Connected wallet {address ? short(address) : 'unknown'} beda dari verified wallet {verifiedWallet ? short(verifiedWallet) : 'unknown'}. Switch ke verified wallet dulu.
                  </div>
                ) : null}

                <div className={`rounded-lg border px-3 py-2 text-sm leading-5 ${step === 'error' ? 'border-red-400/20 bg-red-400/[.08] text-red-200' : 'border-[#f5f257]/15 bg-[#f5f257]/[.08] text-[#e8e68a]'}`}>{message}</div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button disabled={busy} onClick={() => open({ view: 'Connect' })} className="h-9 rounded-lg bg-white px-3 text-sm font-semibold text-black transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60">{isConnected ? 'Manage wallet' : 'Connect wallet'}</button>
                  <button disabled={busy || walletMismatch} onClick={mode === 'deposit' ? deposit : withdraw} className="h-9 rounded-lg bg-[#f5f257] px-3 text-sm font-semibold text-[#08090a] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60">{walletMismatch ? 'Wrong wallet' : step === 'approving' ? 'Approving...' : step === 'depositing' ? 'Depositing...' : step === 'withdrawing' ? 'Withdrawing...' : wrongNetwork ? `Switch + ${mode}` : mode === 'deposit' ? 'Deposit' : 'Withdraw'}</button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {explorerUrl ? <a className="truncate rounded-lg border border-white/10 px-3 py-2 text-center font-mono text-xs text-zinc-300 transition hover:border-[#f5f257]/40 hover:text-white" href={explorerUrl} target="_blank" rel="noreferrer">Tx {short(txHash)}</a> : <div className="rounded-lg border border-white/[.06] px-3 py-2 text-center text-xs text-zinc-600">No transaction yet</div>}
                  <a className="rounded-lg border border-white/10 px-3 py-2 text-center text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white" href="https://t.me/CorpsAgentBot" target="_blank" rel="noreferrer">Open bot after deposit</a>
                </div>
              </div>
            </div>
          </div>

          <aside className="self-start rounded-lg border border-white/[.08] bg-[#0d0f12]/90 p-3 shadow-[0_18px_55px_rgba(0,0,0,.28)] lg:h-[430px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase text-[#f5f257]">Your position</p>
                <h2 className="mt-1 text-lg font-semibold tracking-normal">Vault snapshot</h2>
              </div>
              <span className="rounded-md border border-white/[.08] bg-black/25 px-2.5 py-1 text-xs text-zinc-400">Live</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-2">
              <Metric label="Current value" value={token(position.userValue)} unit="tUSDC" highlight />
              <Metric label="Shares" value={tokenPrecise(position.shares)} />
              <Metric label="Share price" value={price(position.sharePrice)} />
              <Metric label="Treasury assets" value={token(position.totalAssets)} unit="tUSDC" />
              <Metric label="Total shares" value={tokenPrecise(position.totalShares)} />
            </div>
            <div className="mt-2 rounded-lg border border-white/[.07] bg-black/20 p-2.5">
              <p className="text-[11px] font-semibold uppercase text-zinc-500">Wallet</p>
              <p className="mt-2 truncate font-mono text-sm text-white">{address ? address : 'not connected'}</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

function Row({ label, value, mono = false, tone = 'default' }: { label: string; value: string; mono?: boolean; tone?: 'default' | 'bad' }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-black/20 px-2.5 py-1.5">
      <span>{label}</span>
      <strong className={`min-w-0 truncate ${mono ? 'font-mono text-xs' : 'text-sm'} ${tone === 'bad' ? 'text-red-300' : 'text-white'}`}>{value}</strong>
    </div>
  )
}

function LinkRow({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <a className="flex items-center justify-between gap-3 rounded-md bg-black/20 px-2.5 py-1.5 transition hover:bg-white/[.05]" href={href} target="_blank" rel="noreferrer">
      <span>{label}</span>
      <strong className="font-mono text-xs text-white">{value}</strong>
    </a>
  )
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: 'ok' | 'idle' | 'bad' }) {
  const color = tone === 'ok' ? 'bg-emerald-300' : tone === 'bad' ? 'bg-red-300' : 'bg-zinc-500'
  return (
    <div className="rounded-lg border border-white/[.08] bg-white/[.035] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 flex items-center gap-2 truncate font-mono text-[11px] text-white"><span className={`h-1.5 w-1.5 rounded-full ${color}`} />{value}</p>
    </div>
  )
}

function Metric({ label, value, unit, highlight = false }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className={`min-w-0 rounded-lg border p-2.5 ${highlight ? 'border-[#f5f257]/20 bg-[#f5f257]/[.07]' : 'border-white/[.07] bg-black/20'}`}>
      <p className="truncate text-[10px] font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 flex min-w-0 items-baseline gap-1.5">
        <span className="min-w-0 truncate font-mono text-lg font-semibold text-white">{value}</span>
        {unit ? <span className="shrink-0 text-xs font-semibold text-zinc-400">{unit}</span> : null}
      </p>
    </div>
  )
}

import { createPublicClient, formatUnits, http, isAddress } from 'viem'
import { celoSepolia } from 'viem/chains'

export const TREASURY = '0xbC46a13BEEDd08592e69ac0EDF20893416A406de' as const
export const TOKEN = '0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2' as const
export const FAUCET = process.env.NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS || ''
export const EXPLORER = 'https://sepolia.celoscan.io'
export const DECIMALS = 6

export const client = createPublicClient({
  chain: celoSepolia,
  transport: http(process.env.CELO_SEPOLIA_RPC || 'https://forno.celo-sepolia.celo-testnet.org'),
})

export const treasuryAbi = [
  { type: 'function', name: 'shares', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'userValue', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'sharePrice', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'totalAssets', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'totalShares', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'pendingOwnerFee', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'vaultBalance', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
] as const

export function asToken(value: bigint, digits = 6) {
  return Number(formatUnits(value, DECIMALS)).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function asPrice(value: bigint) {
  return Number(formatUnits(value, 18)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 4,
  })
}

export function validAddress(address: string | null) {
  return Boolean(address && isAddress(address))
}

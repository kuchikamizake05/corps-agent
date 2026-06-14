'use client'

import dynamic from 'next/dynamic'

const ConnectClient = dynamic(() => import('./ConnectClient'), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-screen place-items-center bg-[#07080a] px-6 text-center text-white">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#f5f257]">Corps Agent</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-.04em]">Loading wallet module...</h1>
        <p className="mt-3 text-sm text-zinc-400">Preparing wallet connect flow.</p>
      </div>
    </div>
  ),
})

export default function ConnectShell() {
  return <ConnectClient />
}

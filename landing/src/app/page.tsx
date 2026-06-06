'use client'

const TREASURY = '0xbC46a13BEEDd08592e69ac0EDF20893416A406de'
const TOKEN = '0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2'

const agents = [
  { id: '#310', name: 'CEO Agent', role: 'Treasury & payouts', status: 'online', accent: 'from-amber-300 to-orange-500', icon: '◆', desc: 'Records realized profit, approves community payouts, and controls treasury execution.' },
  { id: '#311', name: 'Trader Agent', role: 'Treasury growth', status: 'scheduled', accent: 'from-cyan-300 to-blue-500', icon: '↗', desc: 'Runs controlled testnet growth operations and routes profit back to Treasury.' },
  { id: '#312', name: 'DevOps Agent', role: 'Reliability', status: 'online', accent: 'from-violet-300 to-fuchsia-500', icon: '◉', desc: 'Monitors VPS health, gateway uptime, cron jobs, CPU/RAM/disk signals.' },
  { id: 'module', name: 'Auditor Module', role: 'Governance & risk', status: 'healthy', accent: 'from-emerald-300 to-teal-500', icon: '✓', desc: 'Read-only audit report with PASS checks, risk score, and accounting verification.' },
]

const kpis = [
  { label: 'Total assets', value: '9.009500', unit: 'tUSDC', tone: 'text-emerald-300' },
  { label: 'Vault balance', value: '9.010000', unit: 'tUSDC', tone: 'text-cyan-300' },
  { label: 'Share price', value: '0.900950', unit: 'tUSDC', tone: 'text-amber-300' },
  { label: 'Audit risk', value: 'LOW', unit: 'HEALTHY', tone: 'text-emerald-300' },
]

const flow = [
  ['01', 'Deposit', 'Community deposits tUSDC and receives vault shares.'],
  ['02', 'Trader profit', 'Trader Agent sends simulated profit into Treasury.'],
  ['03', 'Record profit', 'CEO Agent calls recordProfit() and accrues 5% fee.'],
  ['04', 'Payout', 'CEO Agent executes on-chain payout with reason string.'],
  ['05', 'Audit', 'Auditor module verifies accounting gap = 0 and risk LOW.'],
]

const txs = [
  ['Deploy Treasury v3', '0xba5bf6c466abb8b7b01e1c9c47ef7162652401487865e228b653701ccc7f2438'],
  ['Deposit 10 tUSDC', '0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d'],
  ['Record profit', '0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e'],
  ['Community payout', '0xaf7d69109bfc66c26201b5055b0cfaac2d45a1666dc460d8031c18a31d334841'],
]

const commands = ['/status', '/treasury', '/audit', '/agents', '/profit-demo', '/payout-demo', '/demo-script']

function short(addr: string) {
  return `${addr.slice(0, 10)}…${addr.slice(-8)}`
}

function SectionTitle({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/80">{kicker}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-400">{copy}</p>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-slate-200">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="aurora aurora-a" />
        <div className="aurora aurora-b" />
        <div className="aurora aurora-c" />
        <div className="grid-bg" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-300/10 text-emerald-300 shadow-[0_0_24px_rgba(53,208,127,.25)]">CA</div>
            <div>
              <p className="text-sm font-semibold text-white">Corps Agent</p>
              <p className="text-xs text-slate-500">Autonomous treasury ops on Celo</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#agents" className="hover:text-white">Agents</a>
            <a href="#audit" className="hover:text-white">Audit</a>
            <a href="#proof" className="hover:text-white">Proof</a>
            <a href="https://github.com/kuchikamizake05/corps-agent" target="_blank" className="hover:text-white">GitHub</a>
          </div>
          <a href="https://sepolia.celoscan.io/address/0xbC46a13BEEDd08592e69ac0EDF20893416A406de" target="_blank" className="status-pill">
            <span className="pulse-dot" /> Live on Celo
          </a>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-16 md:grid-cols-[1.05fr_.95fr] md:pb-28 md:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200">
            <span className="pulse-dot" /> ERC-8004 agents + Celo treasury + audit module
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl lg:text-8xl">
            AI company that <span className="gradient-text">moves money</span> on-chain.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400 md:text-xl">
            Corps Agent is a 24/7 autonomous team: CEO handles treasury, Trader grows funds, DevOps keeps infrastructure alive, and Auditor verifies accounting health.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="https://t.me/CorpsAgentBot" target="_blank" className="primary-btn">Chat with bot</a>
            <a href="https://github.com/kuchikamizake05/corps-agent" target="_blank" className="ghost-btn">View GitHub</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="chip">Solidity</span><span className="chip">Python Agents</span><span className="chip">Hermes Cron</span><span className="chip">Celo Sepolia</span><span className="chip">ERC-8004</span>
          </div>
        </div>

        <div className="hero-card shimmer-card">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-slate-500">Live Treasury Console</p>
              <p className="font-mono text-xs text-emerald-300">{short(TREASURY)}</p>
            </div>
            <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-300">HEALTHY</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <p className={`mt-2 text-2xl font-semibold ${kpi.tone}`}>{kpi.value}</p>
                <p className="text-xs text-slate-500">{kpi.unit}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-6 text-slate-300">
            <p><span className="text-emerald-300">$</span> auditor.py</p>
            <p>Balance check: <span className="text-emerald-300">PASS</span></p>
            <p>Accounting gap: <span className="text-emerald-300">0.000000 tUSDC</span></p>
            <p>Risk level: <span className="text-emerald-300">LOW</span></p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="metric-card">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{kpi.label}</p>
              <p className={`mt-3 text-3xl font-semibold ${kpi.tone}`}>{kpi.value}</p>
              <p className="mt-1 text-sm text-slate-500">{kpi.unit}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="agents" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <SectionTitle kicker="agent mesh" title="Four roles. One autonomous company." copy="Three identities are registered as ERC-8004 agents. Auditor stays as a lightweight read-only module for governance and risk checks." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <div key={agent.name} className="agent-card group">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.accent} text-lg font-bold text-white shadow-lg transition group-hover:scale-110`}>{agent.icon}</div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{agent.name}</h3>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400">{agent.id}</span>
              </div>
              <p className="mb-3 text-sm text-emerald-300">{agent.role}</p>
              <p className="text-sm leading-6 text-slate-400">{agent.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><span className="pulse-dot" /> {agent.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <SectionTitle kicker="demo path" title="Judge-friendly on-chain flow." copy="Clean story: community funds enter, Trader generates yield, CEO books profit, Treasury pays vendor, Auditor confirms no accounting gap." />
        <div className="flow-line">
          {flow.map(([step, title, copy]) => (
            <div key={step} className="flow-card">
              <span className="flow-num">{step}</span>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="audit" className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 py-24 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/80">auditor module</p>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Trust layer for autonomous payouts.</h2>
          <p className="mt-5 leading-7 text-slate-400">Auditor is intentionally not a full agent. It is a fast read-only governance module that checks treasury solvency, share accounting, fee liability, payout visibility, and risk level.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="pass-badge">Balance PASS</span><span className="pass-badge">Accounting PASS</span><span className="pass-badge">Risk LOW</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="mb-4 flex gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" /></div>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-slate-300">{`=== Treasury Audit Report ===
Module: Auditor

Checks
- Balance check: PASS
- Accounting check: PASS
- Share supply check: PASS
- Share price check: PASS
- Fee liability check: PASS
- Payout impact check: PASS

Risk level: LOW
Status: HEALTHY
Recommendation: treasury healthy for community operations`}</pre>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <SectionTitle kicker="bot interface" title="Command palette for live demos." copy="Judges can ask the bot for status, treasury, audit, agents, profit demo, payout demo, or full script." />
        <div className="command-grid">
          {commands.map((cmd) => <div key={cmd} className="command-pill"><span className="text-emerald-300">›</span> {cmd}</div>)}
        </div>
      </section>

      <section id="proof" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <SectionTitle kicker="on-chain proof" title="Every important action has a transaction." copy="Treasury contract, deposit, profit recording, and community payout are verifiable on Celo Sepolia." />
        <div className="mb-5 grid gap-4 lg:grid-cols-2">
          <div className="proof-card">
            <p className="text-sm text-slate-500">Treasury contract</p>
            <a className="mt-2 block break-all font-mono text-sm text-emerald-300" href={`https://sepolia.celoscan.io/address/${TREASURY}`} target="_blank">{TREASURY}</a>
          </div>
          <div className="proof-card">
            <p className="text-sm text-slate-500">tUSDC test token</p>
            <a className="mt-2 block break-all font-mono text-sm text-cyan-300" href={`https://sepolia.celoscan.io/address/${TOKEN}`} target="_blank">{TOKEN}</a>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {txs.map(([label, hash]) => (
            <a key={hash} href={`https://sepolia.celoscan.io/tx/${hash}`} target="_blank" className="proof-card hover:border-emerald-300/40">
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-500">{hash}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="cta-card">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/80">hackathon ready</p>
            <h2 className="text-3xl font-semibold text-white md:text-5xl">Autonomous treasury ops for real-world community payments.</h2>
            <p className="mt-4 max-w-2xl text-slate-400">Built for Celo: low-cost stablecoin flows, on-chain agent identity, payout accountability, and auditability.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="https://t.me/CorpsAgentBot" target="_blank" className="primary-btn">Open Bot</a>
            <a href="https://sepolia.celoscan.io/address/0xbC46a13BEEDd08592e69ac0EDF20893416A406de" target="_blank" className="ghost-btn">Verify Contract</a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500">
        <p>Built for Celo Onchain Agents Hackathon · Solidity · Python · Hermes · Next.js</p>
      </footer>
    </main>
  )
}

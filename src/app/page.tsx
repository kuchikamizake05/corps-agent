import LiquidEther from './LiquidEther'
import Navbar from './Navbar'

const TREASURY = '0xbC46a13BEEDd08592e69ac0EDF20893416A406de'
const TOKEN = '0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2'

const agents = [
  ['310', 'CEO Agent', 'Treasury execution', 'Records profit, approves community payouts, signs operational decisions.', 'online'],
  ['311', 'Trader Agent', 'Treasury growth', 'Runs controlled testnet growth operations and returns profit to Treasury.', 'scheduled'],
  ['312', 'DevOps Agent', 'Reliability', 'Monitors scheduled runtime, gateway health, resource usage, and service uptime.', 'online'],
  ['AUD', 'Auditor Module', 'Risk checks', 'Verifies solvency, fee liability, share accounting, and payout visibility.', 'healthy'],
]

const metrics = [
  ['Total assets', '9.009500', 'tUSDC'],
  ['Vault balance', '9.010000', 'tUSDC'],
  ['Share price', '0.900950', 'tUSDC'],
  ['Audit risk', 'LOW', 'HEALTHY'],
]

const flow = [
  ['01', 'Deposit', 'Community deposits tUSDC into Treasury and receives vault shares.'],
  ['02', 'Profit', 'Trader Agent sends simulated yield into Treasury.'],
  ['03', 'Record', 'CEO Agent calls recordProfit() and accrues protocol fee.'],
  ['04', 'Payout', 'CEO Agent executes community payout with reason string.'],
  ['05', 'Audit', 'Auditor confirms accounting gap = 0 and risk = LOW.'],
]

const txs = [
  ['Treasury contract', 'Contract address', TREASURY, `https://sepolia.celoscan.io/address/${TREASURY}`],
  ['tUSDC test token', 'Token address', TOKEN, `https://sepolia.celoscan.io/address/${TOKEN}`],
  ['Treasury v3 deployment', 'Transaction hash', '0xba5bf6c466abb8b7b01e1c9c47ef7162652401487865e228b653701ccc7f2438', 'https://sepolia.celoscan.io/tx/0xba5bf6c466abb8b7b01e1c9c47ef7162652401487865e228b653701ccc7f2438'],
  ['Deposit 10 tUSDC', 'Transaction hash', '0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d', 'https://sepolia.celoscan.io/tx/0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d'],
  ['Record profit', 'Transaction hash', '0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e', 'https://sepolia.celoscan.io/tx/0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e'],
  ['Community payout', 'Transaction hash', '0xaf7d69109bfc66c26201b5055b0cfaac2d45a1666dc460d8031c18a31d334841', 'https://sepolia.celoscan.io/tx/0xaf7d69109bfc66c26201b5055b0cfaac2d45a1666dc460d8031c18a31d334841'],
]

const commands = ['/status', '/treasury', '/audit', '/agents', '/profit-demo', '/payout-demo', '/demo-script']

const stack = [
  ['Identity', 'ERC-8004 agent IDs', '310 / 311 / 312'],
  ['Treasury', 'Celo Sepolia vault', 'tUSDC accounting'],
  ['Runtime', 'Scheduled autonomous ops', '24/7 command surface'],
  ['Governance', 'Read-only auditor', 'PASS / LOW risk'],
]

const why = [
  ['Transparent operators', 'Community treasury actions need a visible trail, not opaque off-chain decisions.'],
  ['Repeatable execution', 'Agents handle recurring operations like profit booking, payouts, and runtime checks.'],
  ['Cheap verification', 'Celo keeps stablecoin transactions low-cost and easy to inspect from a public explorer.'],
]

const celo = [
  ['Stablecoin-first', 'Treasury flow uses tUSDC-style accounting for deposits, profit, and payouts.'],
  ['Public identity', 'Agents are represented with ERC-8004 identities, not anonymous scripts.'],
  ['Audit trail', 'Important actions resolve to Celo Sepolia proof links for judges and operators.'],
  ['Practical payouts', 'Built around low-cost community payments instead of speculative token mechanics.'],
]

function short(addr: string) {
  return `${addr.slice(0, 10)}…${addr.slice(-8)}`
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-9 max-w-2xl">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.18em] text-[#f5f257]">{eyebrow}</p>
      <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[.98] tracking-[-.06em] text-white">{title}</h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[#a1a7b0] md:text-base">{copy}</p>
    </div>
  )
}

export default function Home() {
  return (
    <main>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="liquid-ether-layer" aria-hidden="true"><LiquidEther /></div>
      <div className="ambient-bg" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-noise" />
        <div className="scanline" />
        <div className="orbit orbit-a" />
        <div className="orbit orbit-b" />
        <div className="beam beam-a" />
        <div className="beam beam-b" />
      </div>

      <Navbar />

      <section id="top" className="mx-auto w-full max-w-[1120px] px-5 pb-10 pt-20 md:px-7 md:pt-[74px]">
        <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_350px] xl:gap-9">
          <div>
            <p className="reveal mb-3 text-[10px] font-semibold uppercase tracking-[.17em] text-[#f5f257]">ERC-8004 identities / Celo Sepolia / autonomous operations</p>
            <h1 className="reveal max-w-[650px] text-[clamp(2.25rem,5.1vw,4.55rem)] font-semibold leading-[.94] tracking-[-.065em] text-white [animation-delay:90ms]">Autonomous treasury operations, running as on-chain agents.</h1>
            <p className="reveal mt-4 max-w-[590px] text-sm leading-6 text-[#a1a7b0] [animation-delay:180ms] md:text-[15px]">
              Corps Agent is a small operating company made of three agents: CEO, Trader, and DevOps. Treasury actions are recorded on Celo, identities are registered through ERC-8004, and an auditor module keeps payout risk visible.
            </p>
            <div className="reveal mt-5 flex flex-wrap gap-2.5 [animation-delay:270ms]">
              <a className="inline-flex h-9 items-center justify-center rounded-full bg-[#f5f257] px-4 text-[13px] font-semibold text-[#08090a] shadow-[0_12px_28px_rgba(245,242,87,.16)] transition hover:-translate-y-px hover:bg-[#ffff75]" href="/deposit">Deposit demo</a>
              <a className="inline-flex h-9 items-center justify-center rounded-full bg-[#15171a] px-4 text-[13px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition hover:-translate-y-px hover:bg-[#1b1e23]" href="https://t.me/CorpsAgentBot" target="_blank" rel="noreferrer">Open bot</a>
            </div>
          </div>

          <div className="reveal rounded-[24px] bg-[#0d0f12] p-3.5 shadow-[0_0_0_1px_rgba(255,255,255,.07),0_24px_72px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.035)] [animation-delay:300ms] md:p-4">
            <div className="mb-2.5 flex items-center justify-between gap-4 border-b border-white/[.06] pb-2.5 font-mono text-[10px] uppercase tracking-[.12em] text-[#8a8f98]"><span>treasury workflow</span><span className="truncate text-[#f5f257]">{short(TREASURY)}</span></div>
            <div className="space-y-1">
              {flow.map(([step, title, copy]) => (
                <div className="grid grid-cols-[30px_1fr] gap-2.5 rounded-xl p-2.5 transition hover:bg-white/[.035]" key={step}>
                  <span className="font-mono text-[11px] text-[#f5f257]">{step}</span>
                  <div><strong className="block text-[13px] font-semibold text-white">{title}</strong><p className="mt-0.5 text-[13px] leading-5 text-[#8a8f98]">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, value, unit], index) => (
            <div className="reveal rounded-[18px] bg-[#0d0f12] p-4 shadow-[0_0_0_1px_rgba(255,255,255,.06),inset_0_1px_0_rgba(255,255,255,.03)] transition hover:-translate-y-1 hover:bg-[#101216]" style={{ animationDelay: `${360 + index * 70}ms` }} key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8a8f98]">{label}</p><p className="mt-3 font-mono text-[clamp(1.2rem,1.9vw,1.65rem)] font-semibold tracking-[-.04em] text-white">{value}</p><p className="mt-1.5 text-[11px] uppercase tracking-[.14em] text-[#f5f257]">{unit}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="hairline" />

      <section className="mx-auto w-full max-w-[1180px] px-6 py-[72px] md:px-8 md:py-[88px]">
        <SectionHeader eyebrow="Why it matters" title="Community treasuries need operators that can be audited." copy="The prototype focuses on repeatable treasury actions: deposits, profit recording, community payouts, and risk checks with public proof." />
        <div className="grid gap-4 md:grid-cols-3">
          {why.map(([title, copy], index) => <div className="reveal rounded-[24px] bg-[#0d0f12] p-6 shadow-[0_0_0_1px_rgba(255,255,255,.06),inset_0_1px_0_rgba(255,255,255,.03)] transition hover:-translate-y-1 hover:bg-[#101216]" style={{ animationDelay: `${index * 70}ms` }} key={title}><h3 className="text-lg font-semibold tracking-[-.03em] text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-[#a1a7b0]">{copy}</p></div>)}
        </div>
      </section>

      <section id="agents" className="mx-auto w-full max-w-[1180px] px-6 py-[72px] pt-4 md:px-8 md:py-[88px]">
        <SectionHeader eyebrow="Agent registry" title="Clear roles, minimal surface area." copy="Each unit maps to a concrete runtime responsibility and a verifiable identity or module in the system." />
        <div className="reveal overflow-hidden rounded-[24px] bg-[#0d0f12] shadow-[0_0_0_1px_rgba(255,255,255,.06),inset_0_1px_0_rgba(255,255,255,.03)]">
          <table className="w-full border-collapse text-left text-sm text-[#a1a7b0]"><thead><tr className="border-b border-white/[.06] text-[11px] uppercase tracking-[.14em] text-[#62666d]"><th className="px-5 py-4 font-semibold">ID</th><th className="px-5 py-4 font-semibold">Name</th><th className="px-5 py-4 font-semibold">Responsibility</th><th className="hidden px-5 py-4 font-semibold md:table-cell">Runtime notes</th><th className="px-5 py-4 font-semibold">Status</th></tr></thead><tbody>{agents.map(([id, name, role, notes, status]) => <tr className="border-b border-white/[.045] transition hover:bg-white/[.025] last:border-0" key={id}><td className="px-5 py-4 font-mono text-[#8a8f98]">#{id}</td><td className="px-5 py-4 font-medium text-white">{name}</td><td className="px-5 py-4">{role}</td><td className="hidden px-5 py-4 text-[#8a8f98] md:table-cell">{notes}</td><td className="px-5 py-4"><span className="rounded-full bg-[#f5f257]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.12em] text-[#f5f257]">{status}</span></td></tr>)}</tbody></table>
        </div>
      </section>

      <section className="container-x section-y">
        <div className="bento">
          <div className="bento-card bento-large reveal">
            <div className="map-head"><span className="dot" /> operational graph</div>
            <div className="agent-graph" aria-label="Corps Agent operating graph">
              <div className="node node-core">Treasury<br /><span>{short(TREASURY)}</span></div><div className="node node-ceo">CEO<br /><span>#310</span></div><div className="node node-trader">Trader<br /><span>#311</span></div><div className="node node-devops">DevOps<br /><span>#312</span></div><div className="node node-audit">Auditor<br /><span>read-only</span></div>
              <svg className="graph-lines" viewBox="0 0 640 360" aria-hidden="true"><path d="M320 180 C240 110 190 90 145 85" /><path d="M320 180 C420 100 490 82 545 88" /><path d="M320 180 C210 230 170 285 120 300" /><path d="M320 180 C430 235 490 270 552 302" /></svg>
            </div>
          </div>
          {stack.map(([label, title, copy], index) => <div className="bento-card hover-lift reveal" style={{ animationDelay: `${index * 70}ms` }} key={label}><p className="metric-label">{label}</p><h3 className="h3 mt-4">{title}</h3><p className="body mt-2">{copy}</p></div>)}
        </div>
      </section>

      <div className="hairline" />

      <section className="mx-auto w-full max-w-[1180px] px-6 py-[72px] md:px-8 md:py-[88px]">
        <SectionHeader eyebrow="Built for Celo" title="Stablecoin-native operations, not speculative mechanics." copy="The demo is shaped around cheap payments, public agent identity, and explorer-readable treasury proof." />
        <div className="grid gap-4 md:grid-cols-4">{celo.map(([title, copy]) => <div className="rounded-[22px] bg-[#0d0f12] p-5 shadow-[0_0_0_1px_rgba(255,255,255,.06),inset_0_1px_0_rgba(255,255,255,.03)]" key={title}><h3 className="text-base font-semibold tracking-[-.03em] text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-[#a1a7b0]">{copy}</p></div>)}</div>
      </section>

      <section id="audit" className="container-x section-y grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div><p className="eyebrow mb-3">Auditor module</p><h2 className="h2">Trust layer for autonomous payouts.</h2><p className="body mt-5 max-w-xl">Auditor is intentionally read-only. It checks treasury solvency, share supply, fee liability, payout impact, and risk level without becoming another actor that can move funds.</p><div className="mt-6 flex flex-wrap gap-2"><span className="tag">balance PASS</span><span className="tag">accounting PASS</span><span className="tag">risk LOW</span></div></div>
        <div className="terminal reveal terminal-glow"><div className="terminal-head"><span className="led bg-[#ff5f57]" /><span className="led bg-[#febc2e]" /><span className="led bg-[#28c840]" /><span className="ml-2">auditor.py</span></div><pre className="terminal-body"><span className="muted">$</span> run audit --treasury {short(TREASURY)}

Balance check       <span className="ok">PASS</span>
Accounting check    <span className="ok">PASS</span>
Share supply check  <span className="ok">PASS</span>
Fee liability check <span className="ok">PASS</span>
Payout impact check <span className="ok">PASS</span>

Risk level          <span className="ok">LOW</span>
Status              <span className="ok">HEALTHY</span></pre></div>
      </section>

      <section className="container-x section-y pt-4">
        <SectionHeader eyebrow="Bot interface" title="A command surface for live demos." copy="Telegram bot exposes a small command set for status, treasury, agents, audit, and scripted profit/payout demos." />
        <div className="command-shell reveal"><div className="command-marquee" aria-hidden="true">{[...commands, ...commands].map((cmd, index) => <span key={`${cmd}-${index}`}>{cmd}</span>)}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{commands.map((cmd, index) => <div className="card command-card flex h-14 items-center px-4 font-mono text-sm text-[#d0d6e0]" style={{ animationDelay: `${index * 45}ms` }} key={cmd}><span className="mr-3 text-[#62666d]">›</span>{cmd}</div>)}</div></div>
      </section>

      <div className="hairline" />

      <section id="proof" className="mx-auto w-full max-w-[1180px] px-6 py-[72px] md:px-8 md:py-[88px]">
        <SectionHeader eyebrow="On-chain proof" title="Proof links stay available without dominating the page." copy="Important contracts and transactions are listed as explorer actions. Full hashes stay visible, but secondary." />
        <div className="space-y-3">{txs.map(([label, kind, value, href], index) => <a className="reveal grid items-center gap-3 rounded-[18px] bg-[#0d0f12] p-4 shadow-[0_0_0_1px_rgba(255,255,255,.06)] transition hover:-translate-y-px hover:bg-[#111318] md:grid-cols-[1fr_auto_auto]" style={{ animationDelay: `${index * 45}ms` }} href={href} target="_blank" key={value}><span><strong className="block text-sm font-semibold text-white">{label}</strong><em className="mt-1 block text-xs not-italic uppercase tracking-[.14em] text-[#8a8f98]">{kind}</em></span><code className="font-mono text-sm text-[#a1a7b0]">{short(value)}</code><b className="inline-flex h-8 items-center justify-center rounded-full bg-[#f5f257] px-3 text-xs font-semibold text-[#08090a]">View</b></a>)}</div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-6 pb-24 md:px-8">
        <div className="rounded-[28px] bg-[#0d0f12] p-8 shadow-[0_0_0_1px_rgba(255,255,255,.06),0_28px_90px_rgba(0,0,0,.42),inset_0_1px_0_rgba(255,255,255,.03)] md:p-10"><p className="mb-3 text-[11px] font-semibold uppercase tracking-[.18em] text-[#f5f257]">Submission-ready</p><h2 className="max-w-2xl text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[.98] tracking-[-.06em] text-white">A working prototype for stablecoin-native community treasury operations.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#a1a7b0] md:text-base">Built for Celo Onchain Agents: low-cost stablecoin flows, agent identity, payout accountability, and readable proof links in one repo.</p><div className="mt-7 flex flex-wrap gap-3"><a className="inline-flex h-10 items-center justify-center rounded-full bg-[#f5f257] px-5 text-sm font-semibold text-[#08090a] shadow-[0_14px_34px_rgba(245,242,87,.18)] transition hover:-translate-y-px hover:bg-[#ffff75]" href="https://t.me/CorpsAgentBot" target="_blank">Open bot</a><a className="inline-flex h-10 items-center justify-center rounded-full bg-[#15171a] px-5 text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition hover:-translate-y-px hover:bg-[#1b1e23]" href="https://github.com/kuchikamizake05/corps-agent" target="_blank">Source code</a></div></div>
      </section>

      <footer className="border-t border-white/[0.06] py-8"><div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-6 text-xs text-[#62666d] md:flex-row md:items-center md:justify-between md:px-8"><p>Corps Agent · Celo Onchain Agents Hackathon</p><p className="font-mono">Solidity / Python / Hermes / Next.js</p></div></footer>
    </main>
  )
}

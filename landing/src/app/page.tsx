const TREASURY = '0xbC46a13BEEDd08592e69ac0EDF20893416A406de'
const TOKEN = '0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2'

const agents = [
  ['310', 'CEO Agent', 'Treasury execution', 'Records profit, approves community payouts, signs operational decisions.', 'online'],
  ['311', 'Trader Agent', 'Treasury growth', 'Runs controlled testnet growth operations and returns profit to Treasury.', 'scheduled'],
  ['312', 'DevOps Agent', 'Reliability', 'Monitors VPS, gateway, cron jobs, CPU, RAM, disk, and service uptime.', 'online'],
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
  ['Treasury v3 deployment', '0xba5bf6c466abb8b7b01e1c9c47ef7162652401487865e228b653701ccc7f2438'],
  ['Deposit 10 tUSDC', '0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d'],
  ['Record profit', '0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e'],
  ['Community payout', '0xaf7d69109bfc66c26201b5055b0cfaac2d45a1666dc460d8031c18a31d334841'],
]

const commands = ['/status', '/treasury', '/audit', '/agents', '/profit-demo', '/payout-demo', '/demo-script']

function short(addr: string) {
  return `${addr.slice(0, 10)}…${addr.slice(-8)}`
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="h2">{title}</h2>
      <p className="body mt-4 max-w-xl">{copy}</p>
    </div>
  )
}

export default function Home() {
  return (
    <main>
      <div className="ambient-bg" aria-hidden="true">
        <div className="scanline" />
        <div className="orbit orbit-a" />
        <div className="orbit orbit-b" />
      </div>
      <nav className="topnav">
        <div className="container-x flex h-16 items-center justify-between">
          <a href="#top" className="link flex items-center gap-3" aria-label="Corps Agent home">
            <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-xs text-white">CA</span>
            <span>
              <span className="block text-sm font-medium text-white">Corps Agent</span>
              <span className="block font-mono text-[11px] text-[#62666d]">celo / treasury ops</span>
            </span>
          </a>

          <div className="hidden items-center gap-7 text-[13px] md:flex">
            <a className="link" href="#agents">Agents</a>
            <a className="link" href="#audit">Audit</a>
            <a className="link" href="#proof">Proof</a>
            <a className="link" href="https://github.com/kuchikamizake05/corps-agent" target="_blank">GitHub</a>
          </div>

          <a className="pill" href={`https://sepolia.celoscan.io/address/${TREASURY}`} target="_blank">
            <span className="dot" /> live on Celo
          </a>
        </div>
      </nav>

      <section id="top" className="container-x pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="max-w-4xl">
          <p className="eyebrow reveal mb-5">ERC-8004 identities / Celo Sepolia / autonomous operations</p>
          <h1 className="display reveal max-w-4xl [animation-delay:90ms]">Autonomous treasury operations, running as on-chain agents.</h1>
          <p className="lede reveal mt-6 [animation-delay:180ms]">
            Corps Agent is a small operating company made of three agents: CEO, Trader, and DevOps. Treasury actions are recorded on Celo, identities are registered through ERC-8004, and an auditor module keeps payout risk visible.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3 [animation-delay:270ms]">
            <a className="btn btn-primary" href="https://t.me/CorpsAgentBot" target="_blank">Open bot</a>
            <a className="btn btn-ghost" href="https://github.com/kuchikamizake05/corps-agent" target="_blank">View source</a>
            <a className="btn btn-ghost" href={`https://sepolia.celoscan.io/address/${TREASURY}`} target="_blank">Verify contract</a>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-4">
          {metrics.map(([label, value, unit], index) => (
            <div className="card hover-lift reveal p-5" style={{ animationDelay: `${360 + index * 70}ms` }} key={label}>
              <p className="metric-label">{label}</p>
              <p className="metric mt-4">{value}</p>
              <p className="label mt-2">{unit}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="hairline" />

      <section id="agents" className="container-x py-24">
        <SectionHeader
          eyebrow="Agent registry"
          title="Clear roles, minimal surface area."
          copy="No fake dashboard metrics. Each unit maps to a concrete runtime responsibility and a verifiable identity or module in the system."
        />
        <div className="card reveal overflow-hidden">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Responsibility</th>
                <th className="hidden md:table-cell">Runtime notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(([id, name, role, notes, status]) => (
                <tr className="row-motion" key={id}>
                  <td className="font-mono text-[#8a8f98]">#{id}</td>
                  <td className="font-medium text-white">{name}</td>
                  <td>{role}</td>
                  <td className="hidden text-[#8a8f98] md:table-cell">{notes}</td>
                  <td><span className="tag">{status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeader
          eyebrow="Demo path"
          title="One auditable flow from deposit to payout."
          copy="Designed for judges to verify quickly: funds enter Treasury, profit is recorded, payout is executed, and audit checks stay green."
        />
        <div className="grid gap-3 md:grid-cols-5">
          {flow.map(([step, title, copy], index) => (
            <div className="card hover-lift reveal p-5" style={{ animationDelay: `${index * 70}ms` }} key={step}>
              <p className="label">{step}</p>
              <h3 className="h3 mt-5">{title}</h3>
              <p className="body mt-3">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="hairline" />

      <section id="audit" className="container-x grid gap-8 py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow mb-3">Auditor module</p>
          <h2 className="h2">Trust layer for autonomous payouts.</h2>
          <p className="body mt-5 max-w-xl">
            Auditor is intentionally read-only. It checks treasury solvency, share supply, fee liability, payout impact, and risk level without becoming another actor that can move funds.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="tag">balance PASS</span>
            <span className="tag">accounting PASS</span>
            <span className="tag">risk LOW</span>
          </div>
        </div>
        <div className="terminal reveal terminal-glow">
          <div className="terminal-head">
            <span className="led bg-[#ff5f57]" />
            <span className="led bg-[#febc2e]" />
            <span className="led bg-[#28c840]" />
            <span className="ml-2">auditor.py</span>
          </div>
          <pre className="terminal-body"><span className="muted">$</span> run audit --treasury {short(TREASURY)}

Balance check       <span className="ok">PASS</span>
Accounting check    <span className="ok">PASS</span>
Share supply check  <span className="ok">PASS</span>
Share price check   <span className="ok">PASS</span>
Fee liability check <span className="ok">PASS</span>
Payout impact check <span className="ok">PASS</span>

Risk level          <span className="ok">LOW</span>
Status              <span className="ok">HEALTHY</span>
Recommendation      treasury healthy for community operations</pre>
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeader
          eyebrow="Bot interface"
          title="A command surface for live demos."
          copy="Telegram bot exposes a small command set for status, treasury, agents, audit, and scripted profit/payout demos."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {commands.map((cmd, index) => (
            <div className="card command-card reveal flex h-14 items-center px-4 font-mono text-sm text-[#d0d6e0]" style={{ animationDelay: `${index * 45}ms` }} key={cmd}>
              <span className="mr-3 text-[#62666d]">›</span>{cmd}
            </div>
          ))}
        </div>
      </section>

      <div className="hairline" />

      <section id="proof" className="container-x py-24">
        <SectionHeader
          eyebrow="On-chain proof"
          title="Important actions are public."
          copy="Treasury contract, test token, deployment, deposit, profit recording, and payout are linked to Celo Sepolia explorer."
        />
        <div className="grid gap-3 lg:grid-cols-2">
          <a className="link-card reveal" href={`https://sepolia.celoscan.io/address/${TREASURY}`} target="_blank">
            <span>
              <span className="block text-sm font-medium text-white">Treasury contract</span>
              <span className="mt-1 block break-all font-mono text-xs text-[#8a8f98]">{TREASURY}</span>
            </span>
            <span className="arrow">→</span>
          </a>
          <a className="link-card reveal" href={`https://sepolia.celoscan.io/address/${TOKEN}`} target="_blank">
            <span>
              <span className="block text-sm font-medium text-white">tUSDC test token</span>
              <span className="mt-1 block break-all font-mono text-xs text-[#8a8f98]">{TOKEN}</span>
            </span>
            <span className="arrow">→</span>
          </a>
          {txs.map(([label, hash], index) => (
            <a className="link-card reveal" style={{ animationDelay: `${index * 45}ms` }} href={`https://sepolia.celoscan.io/tx/${hash}`} target="_blank" key={hash}>
              <span>
                <span className="block text-sm font-medium text-white">{label}</span>
                <span className="mt-1 block break-all font-mono text-xs text-[#8a8f98]">{hash}</span>
              </span>
              <span className="arrow">→</span>
            </a>
          ))}
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="card cta-motion p-8 md:p-10">
          <p className="eyebrow mb-3">Submission-ready</p>
          <h2 className="h2 max-w-2xl">A working prototype for stablecoin-native community treasury operations.</h2>
          <p className="body mt-4 max-w-2xl">
            Built for Celo Onchain Agents: low-cost stablecoin flows, agent identity, payout accountability, and readable proof links in one repo.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="https://t.me/CorpsAgentBot" target="_blank">Open bot</a>
            <a className="btn btn-ghost" href="https://github.com/kuchikamizake05/corps-agent" target="_blank">Source code</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="container-x flex flex-col gap-3 text-xs text-[#62666d] md:flex-row md:items-center md:justify-between">
          <p>Corps Agent · Celo Onchain Agents Hackathon</p>
          <p className="font-mono">Solidity / Python / Hermes / Next.js</p>
        </div>
      </footer>
    </main>
  )
}

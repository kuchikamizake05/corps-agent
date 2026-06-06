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
    <div className="section-head">
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
        <div className="container-x nav-row">
          <a href="#top" className="nav-brand" aria-label="Corps Agent home">
            <span className="nav-logo">CA</span>
            <span className="nav-brand-copy"><span>Corps Agent</span><span>Autonomous treasury ops</span></span>
          </a>
          <div className="nav-center" aria-label="Primary navigation">
            <a className="nav-link" href="#agents">Agents</a>
            <a className="nav-link" href="#audit">Audit</a>
            <a className="nav-link" href="#proof">Proof</a>
            <a className="nav-link" href="https://github.com/kuchikamizake05/corps-agent" target="_blank">GitHub</a>
          </div>
          <div className="nav-actions"><a className="nav-cta" href="https://t.me/CorpsAgentBot" target="_blank">Open bot</a></div>
        </div>
      </nav>

      <section id="top" className="container-x section-hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow reveal mb-5">ERC-8004 identities / Celo Sepolia / autonomous operations</p>
            <h1 className="display reveal [animation-delay:90ms]">Autonomous treasury operations, running as on-chain agents.</h1>
            <p className="lede reveal mt-6 [animation-delay:180ms]">
              Corps Agent is a small operating company made of three agents: CEO, Trader, and DevOps. Treasury actions are recorded on Celo, identities are registered through ERC-8004, and an auditor module keeps payout risk visible.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3 [animation-delay:270ms]">
              <a className="btn btn-primary" href="https://t.me/CorpsAgentBot" target="_blank">Open bot demo</a>
              <a className="btn btn-ghost" href="https://github.com/kuchikamizake05/corps-agent" target="_blank">View source</a>
            </div>
          </div>

          <div className="hero-panel reveal [animation-delay:300ms]">
            <div className="panel-top"><span>treasury workflow</span><span>{short(TREASURY)}</span></div>
            <div className="workflow-stack">
              {flow.map(([step, title, copy]) => (
                <div className="workflow-row" key={step}>
                  <span>{step}</span>
                  <div><strong>{title}</strong><p>{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="metric-grid mt-14">
          {metrics.map(([label, value, unit], index) => (
            <div className="card hover-lift reveal p-5" style={{ animationDelay: `${360 + index * 70}ms` }} key={label}>
              <p className="metric-label">{label}</p><p className="metric mt-4">{value}</p><p className="label mt-2">{unit}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="hairline" />

      <section className="container-x section-y">
        <SectionHeader eyebrow="Why it matters" title="Community treasuries need operators that can be audited." copy="The prototype focuses on repeatable treasury actions: deposits, profit recording, community payouts, and risk checks with public proof." />
        <div className="grid gap-4 md:grid-cols-3">
          {why.map(([title, copy], index) => <div className="card hover-lift reveal p-6" style={{ animationDelay: `${index * 70}ms` }} key={title}><h3 className="h3">{title}</h3><p className="body mt-3">{copy}</p></div>)}
        </div>
      </section>

      <section id="agents" className="container-x section-y pt-4">
        <SectionHeader eyebrow="Agent registry" title="Clear roles, minimal surface area." copy="Each unit maps to a concrete runtime responsibility and a verifiable identity or module in the system." />
        <div className="card reveal overflow-hidden">
          <table className="tbl"><thead><tr><th>ID</th><th>Name</th><th>Responsibility</th><th className="hidden md:table-cell">Runtime notes</th><th>Status</th></tr></thead><tbody>{agents.map(([id, name, role, notes, status]) => <tr className="row-motion" key={id}><td className="font-mono text-[#8a8f98]">#{id}</td><td className="font-medium text-white">{name}</td><td>{role}</td><td className="hidden text-[#8a8f98] md:table-cell">{notes}</td><td><span className="tag">{status}</span></td></tr>)}</tbody></table>
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

      <section className="container-x section-y">
        <SectionHeader eyebrow="Built for Celo" title="Stablecoin-native operations, not speculative mechanics." copy="The demo is shaped around cheap payments, public agent identity, and explorer-readable treasury proof." />
        <div className="grid gap-4 md:grid-cols-4">{celo.map(([title, copy]) => <div className="card p-5" key={title}><h3 className="h3">{title}</h3><p className="body mt-3">{copy}</p></div>)}</div>
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

      <section id="proof" className="container-x section-y">
        <SectionHeader eyebrow="On-chain proof" title="Proof links stay available without dominating the page." copy="Important contracts and transactions are listed as explorer actions. Full hashes stay visible, but secondary." />
        <div className="proof-list">{txs.map(([label, kind, value, href], index) => <a className="proof-row reveal" style={{ animationDelay: `${index * 45}ms` }} href={href} target="_blank" key={value}><span><strong>{label}</strong><em>{kind}</em></span><code>{short(value)}</code><b>View</b></a>)}</div>
      </section>

      <section className="container-x pb-24">
        <div className="card cta-motion p-8 md:p-10"><p className="eyebrow mb-3">Submission-ready</p><h2 className="h2 max-w-2xl">A working prototype for stablecoin-native community treasury operations.</h2><p className="body mt-4 max-w-2xl">Built for Celo Onchain Agents: low-cost stablecoin flows, agent identity, payout accountability, and readable proof links in one repo.</p><div className="mt-7 flex flex-wrap gap-3"><a className="btn btn-primary" href="https://t.me/CorpsAgentBot" target="_blank">Open bot</a><a className="btn btn-ghost" href="https://github.com/kuchikamizake05/corps-agent" target="_blank">Source code</a></div></div>
      </section>

      <footer className="border-t border-white/[0.06] py-8"><div className="container-x flex flex-col gap-3 text-xs text-[#62666d] md:flex-row md:items-center md:justify-between"><p>Corps Agent · Celo Onchain Agents Hackathon</p><p className="font-mono">Solidity / Python / Hermes / Next.js</p></div></footer>
    </main>
  )
}

# Corps Agent 🤖🏢

**Multi-agent autonomous company on Celo** — CEO, Trader, and DevOps agents working 24/7, registered as ERC-8004 on-chain identities.

Built for the **Onchain Agents Hackathon** by Celo.

- Landing page: https://corps-agent-site.vercel.app
- Telegram bot: https://t.me/CorpsAgentBot
- Treasury: `0xbC46a13BEEDd08592e69ac0EDF20893416A406de`
- Test token: `0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2`

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│              VPS (Hermes Agent)                   │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Hermes   │  │ Cron     │  │ Agent Scripts  │  │
│  │ Gateway  │  │ Scheduler│  │ CEO/Trader/    │  │
│  │          │  │          │  │ DevOps         │  │
│  └──────────┘  └──────────┘  └───────┬───────┘  │
└──────────────────────────────────────┼───────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────┐
│              CELO SEPOLIA (Testnet)               │
│                                                   │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Treasury     │  │ ERC-8004 Identities      │  │
│  │ Contract     │  │ CEO  #310                │  │
│  │ (custom)     │  │ Trader #311              │  │
│  └──────────────┘  │ DevOps #312              │  │
│                     └──────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## 🎯 Agents

| Agent | Role | ERC-8004 ID | Stack |
|-------|------|-------------|-------|
| **CEO** | Community treasury management, payout execution, profit accounting | #310 | Python + Web3 |
| **Trader** | Treasury growth and controlled testnet market operations | #311 | Python + Web3 |
| **DevOps** | VPS health monitoring (CPU/RAM/disk), uptime reports | #312 | Python |
| **Auditor** | Read-only treasury consistency checks, risk flags, audit reports | module | Python + Cast |

## 🧠 Smart Contract

**Treasury.sol** — ERC-20 vault model with shares, profit accounting, and 5% performance fee.

- `deposit(amount)` — Deposit test USDC/tUSDC and mint vault shares
- `withdraw(shares)` — Burn shares and withdraw proportional token value
- `recordProfit()` — CEO records Trader profit already sent to treasury
- `claimFee()` — Owner claims accrued 5% performance fee

### Deployments

| Network | Address | Explorer |
|---------|---------|---------|
| Celo Sepolia | `0xbC46a13BEEDd08592e69ac0EDF20893416A406de` | [View](https://sepolia.celoscan.io/address/0xbC46a13BEEDd08592e69ac0EDF20893416A406de) |

## ⏰ Cron Schedule

| Agent | Interval | Trigger |
|-------|----------|---------|
| Trader | Every 30 min | Balance scan & report |
| CEO | Every 6 hours | Treasury evaluation & allocation |
| DevOps | Every 24 hours | VPS health report |

Powered by **Hermes Agent** cron system running 24/7 on a VPS.

## 🚀 Quick Start

```bash
# Prerequisites
forge --version   # Foundry
python3 --version # Python 3.11+

# Install deps
pip install web3 python-dotenv

# Setup wallets
cp .env.example .env
# Edit .env with your private keys

# Build & test
forge build
forge test

# Deploy
source .env
forge script script/Deploy.s.sol:DeployTreasury \
  --rpc-url $CELO_SEPOLIA_RPC --broadcast --private-key $CEO_PRIVATE_KEY
```

## 🏆 Hackathon Tracks

| Track | How Corps Agent competes |
|-------|--------------------------|
| **Best Agent** | Multi-agent orchestration = innovation beyond single-agent bots |
| **Most Activity** | 3 cron jobs = continuous on-chain transactions |
| **Highest 8004scan Rank** | 3 ERC-8004 registered identities (CEO + Trader + DevOps) |

## 📁 Project Structure

```
├── src/Treasury.sol          # Smart contract
├── test/Treasury.t.sol       # Foundry tests (16 tests)
├── script/Deploy.s.sol       # Deploy script
├── agents/
│   ├── ceo.py                # CEO agent logic
│   ├── trader.py             # Trader agent logic
│   ├── devops.py             # DevOps agent logic
│   └── auditor.py            # Read-only treasury audit report
├── metadata/
│   ├── ceo.json              # ERC-8004 metadata
│   ├── trader.json
│   └── devops.json
├── foundry.toml
└── .env                      # Wallet keys (gitignored)
```

## 📜 License

MIT

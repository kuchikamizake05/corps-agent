# Corps Agent 🤖🏢

**Multi-agent autonomous company on Celo** — CEO, Trader, and DevOps agents working 24/7, registered as ERC-8004 on-chain identities.

Built for the **Onchain Agents Hackathon** by Celo.

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
| **CEO** | Treasury management, fund allocation, strategic decisions | #310 | Python + Web3 |
| **Trader** | DEX price scanning, arbitrage opportunities | #311 | Python + Web3 |
| **DevOps** | VPS health monitoring (CPU/RAM/disk), budget requests | #312 | Python |

## 🧠 Smart Contract

**Treasury.sol** — Holds funds, tracks agent balances, handles deposits/allocations/payments.

- `deposit()` — Accept CELO from any address
- `allocate(to, amount)` — CEO allocates to sub-agents
- `release(to, amount)` — CEO executes payments
- Full on-chain transaction history with pagination

### Deployments

| Network | Address | Explorer |
|---------|---------|---------|
| Celo Sepolia | `0xf4832E5d4e653cAA6A345ab038445de076559544` | [View](https://sepolia.celoscan.io/address/0xf4832E5d4e653cAA6A345ab038445de076559544) |

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
├── test/Treasury.t.sol       # Foundry tests (8 tests)
├── script/Deploy.s.sol       # Deploy script
├── agents/
│   ├── ceo.py                # CEO agent logic
│   ├── trader.py             # Trader agent logic
│   └── devops.py             # DevOps agent logic
├── metadata/
│   ├── ceo.json              # ERC-8004 metadata
│   ├── trader.json
│   └── devops.json
├── foundry.toml
└── .env                      # Wallet keys (gitignored)
```

## 📜 License

MIT

# PRD — Corps Agent Mantle Migration

## Status

Planned. Current execution stays focused on Celo. This document stores the Mantle migration/product direction so we can revisit after the Celo version is stable.

## Goal

Create a Mantle-native variant of Corps Agent for The Turing Test Hackathon 2026.

Corps Agent on Mantle should position itself as an agentic treasury wallet economy: users deposit test stablecoins, receive vault shares, and autonomous agents coordinate treasury actions, strategy reporting, payouts, and audits. Every key agent decision and outcome should be recorded permanently on Mantle.

## Target hackathon fit

Primary track:

```txt
Agentic Wallets & Economy
```

Secondary tracks:

```txt
AI Trading & Strategy
AI Alpha & Data
```

Why:

```txt
- wallet-based user deposits
- share-based treasury balance
- autonomous CEO / Trader / DevOps / Auditor agents
- Telegram command cockpit
- on-chain decision proof
- auditable agent economy
```

## Pitch

Corps Agent is an agentic treasury wallet economy on Mantle. Users deposit test stablecoins, receive vault shares, and autonomous agents coordinate strategy, profit reporting, payouts, and audits. Every key decision is logged on Mantle as permanent proof, creating a benchmarkable operating history for AI agents.

## Current Celo features to reuse

```txt
- landing page design
- Telegram bot concept
- /deposit wallet flow
- Reown AppKit setup
- treasury vault/share accounting
- test stablecoin faucet concept
- proof section
- agent roles: CEO, Trader, DevOps, Auditor
- public proof links
```

## Required Mantle migration

### Network

Replace Celo Sepolia with Mantle testnet.

Need final constants:

```txt
Mantle chain id
Mantle RPC URL
Mantle explorer URL
Mantle test stablecoin address
Mantle Treasury address
Mantle Faucet address
```

### Contracts

Deploy on Mantle testnet:

```txt
1. TestUSDC / tUSDC token
2. TestUSDCFaucet
3. Treasury
4. AgentDecisionLog
```

If existing Celo contracts are reused as templates, update proof links and constants everywhere.

### Landing copy

Replace Celo-specific copy:

```txt
Built for Celo
Celo Sepolia
CeloScan
cUSD / tUSDC on Celo
```

with Mantle-specific copy:

```txt
Built on Mantle
Mantle testnet
Mantle explorer
Mantle treasury
agentic wallet economy
```

### Deposit page

Update:

```txt
- Reown network config → Mantle testnet
- explorer links → Mantle explorer
- token address → Mantle test stablecoin
- treasury address → Mantle Treasury
- faucet address → Mantle Faucet
```

Keep flow:

```txt
Connect wallet
Claim 100 tUSDC if needed
Approve if allowance < amount
Deposit to Treasury
Show tx proof
Open Telegram bot
```

## New Mantle-native features

### 1. Agent Decision Log

Most important feature for Mantle hackathon alignment.

Purpose:

```txt
Record every key agent decision and outcome permanently on Mantle.
```

Example event:

```solidity
event AgentDecision(
    uint256 indexed agentId,
    string action,
    string reason,
    string metadataURI,
    uint256 timestamp
);
```

Example actions:

```txt
CEO Agent: payout approved
Trader Agent: strategy result recorded
Auditor Agent: solvency check passed
DevOps Agent: uptime check reported
```

Landing copy:

```txt
Every key agent decision is recorded on Mantle.
```

### 2. Agent Benchmark Scorecard

Purpose:

```txt
Show measurable agent performance and fit the hackathon's AI benchmark narrative.
```

Metrics:

```txt
- Treasury health
- Solvency: PASS / FAIL
- Payout risk: LOW / MEDIUM / HIGH
- Execution success rate
- Proof coverage
- Autonomy score
```

Landing section:

```txt
Agent Benchmark
Solvency: PASS
Payout risk: LOW
Proof coverage: 100%
Autonomy: 4/5
```

### 3. Mantle Proof Section

Show Mantle-native proof links:

```txt
- Treasury contract
- Test stablecoin token
- Faucet contract
- Deposit tx
- Profit record tx
- Payout tx
- Agent decision tx
```

### 4. Agentic Wallet Session

User wallet owns treasury shares.

Bot/display should show:

```txt
Wallet
Shares
Current value
Deposit history
Profit exposure
Last agent decision affecting treasury
```

### 5. Mantle RWA / yield adapter placeholder

Mantle ecosystem has RWA/liquidity narrative. Add adapter-ready section without overclaiming.

Possible copy:

```txt
Strategy adapters are designed for Mantle-native liquidity routes, including stablecoin, USDY-style yield, and mETH reserve strategies.
```

Do not claim live integration unless built.

### 6. Bybit strategy adapter mock

For AI Trading & Strategy angle.

MVP:

```txt
- mock Bybit market signal
- Trader Agent records strategy decision
- AgentDecisionLog stores reason/hash on Mantle
- Treasury recordProfit() captures result
```

Do not claim real trading unless implemented.

### 7. Telegram command cockpit

Commands to support/show:

```txt
/status
/position
/proof
/audit
/deposit
/faucet
/decisions
```

Mantle angle:

```txt
Telegram command cockpit for Mantle treasury agents.
```

### 8. Public API

Developer/API surface:

```txt
GET /api/status
GET /api/proof
GET /api/agents
GET /api/decisions
GET /api/position?wallet=0x...
```

## Faucet concept

Mantle version should include faucet for demo.

Flow:

```txt
1. user connects wallet
2. user claims 100 tUSDC
3. cooldown is 1 hour per wallet
4. user deposits tUSDC into Treasury
5. app auto-triggers approve if allowance is insufficient
```

Important:

```txt
Auto approve still requires wallet confirmation.
```

## Migration checklist

```txt
[ ] Choose Mantle testnet RPC/explorer constants
[ ] Deploy TestUSDC on Mantle
[ ] Deploy TestUSDCFaucet on Mantle
[ ] Deploy Treasury using Mantle TestUSDC
[ ] Deploy AgentDecisionLog
[ ] Update landing constants
[ ] Update /deposit Reown chain config
[ ] Update proof links
[ ] Replace Celo copy with Mantle copy
[ ] Add Agent Benchmark Scorecard
[ ] Add Decision Log section
[ ] Add /api/decisions endpoint if API exists
[ ] Update Telegram bot /deposit link
[ ] Update Telegram bot /proof and /decisions commands
[ ] Build landing
[ ] Verify deploy
[ ] Submit repo + live demo
```

## Non-goals for first Mantle pass

```txt
- real Bybit trading with funds
- production custody
- mainnet user funds
- guaranteed RWA yield
- full account abstraction
- gas sponsorship/paymaster
```

## Risks

```txt
- overclaiming real trading or yield
- leaving Celo references in Mantle submission
- changing too many things before Celo version is stable
- deploying token/treasury but forgetting landing constants
- faucet mint permission mismatch
```

## Recommended order after Celo is stable

```txt
1. Port contracts to Mantle testnet
2. Update /deposit constants and proof links
3. Add AgentDecisionLog
4. Add Agent Benchmark Scorecard
5. Update landing copy to Mantle
6. Update Telegram bot commands
7. Build + push + verify live demo
```

# Corps Agent

Multi-agent autonomous company on Celo Sepolia: CEO, Trader, DevOps, and Auditor modules operating a testnet community treasury.

- Landing page: https://corps-agent-site.vercel.app
- Telegram bot: https://t.me/CorpsAgentBot
- Treasury: `0xbC46a13BEEDd08592e69ac0EDF20893416A406de`
- Test token: `0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2`
- Test faucet: set `NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS` after deploying `TestUSDCFaucet`

## Agents

| Agent | Role | ERC-8004 ID | Stack |
|-------|------|-------------|-------|
| CEO | Community treasury management, payout execution, profit accounting | #310 | Python + Cast |
| Trader | Treasury growth and controlled testnet market operations | #311 | Python + Cast |
| DevOps | VPS health monitoring, uptime reports | #312 | Python |
| Auditor | Read-only solvency, share accounting, fee liability, and risk checks | module | Python + Cast |

## Smart Contracts

`Treasury.sol` is an ERC-20 vault model with shares, profit accounting, withdrawals, payouts, and a 5% performance fee.

- `deposit(amount)` - Deposit tUSDC and mint vault shares.
- `withdraw(shares)` - Burn shares and withdraw proportional tUSDC value.
- `previewDeposit(amount)` - Preview shares minted before deposit.
- `previewWithdraw(shares)` - Preview tUSDC returned before withdraw.
- `recordProfit()` - CEO records Trader profit already sent to Treasury.
- `payout(recipient, amount, reason)` - CEO pays community/vendor expenses with an on-chain reason.
- `claimFee()` - Owner claims accrued 5% performance fee.
- `recordAgentDecision(agentId, action, reason, evidenceHash)` - Emit a public decision log for agent activity.

`TestUSDCFaucet.sol` mints 100 tUSDC per wallet every hour for demo deposits.

## Deposit Demo

The `/deposit` page supports:

- CELO gas faucet link.
- tUSDC faucet claim button.
- Faucet cooldown display.
- Deposit flow with allowance approval.
- User position panel: wallet, shares, current value, share price, treasury assets, total shares.
- Withdraw tab with 25%, 50%, and 100% shortcuts and amount-out preview.

## Bot Demo Commands

Run the local bot process:

```bash
export TELEGRAM_BOT_TOKEN=...
python3 agents/bot.py
```

| Command | Purpose |
|---------|---------|
| `/status` | Project status, treasury address, token address, agent overview |
| `/treasury` | Assets, shares, share price, vault balance, fee, explorer |
| `/audit` | Solvency, share accounting, payout risk, fee liability |
| `/setwallet 0x...` | Map your Telegram user to a wallet address |
| `/position` | Wallet shares, current value, and PnL |
| `/proof` | Treasury, token, faucet, deposit, profit, and explorer links |
| `/agents` | CEO #310, Trader #311, DevOps #312, Auditor module |
| `/demo-script` | Judge-ready end-to-end demo sequence |

## Judge Demo Path

1. Open https://corps-agent-site.vercel.app
2. Click **Deposit demo**
3. Connect wallet on Celo Sepolia
4. Click **Get CELO gas**
5. Click **Claim 100 tUSDC**
6. Deposit 10 tUSDC
7. Open https://t.me/CorpsAgentBot
8. Run `/setwallet 0x...`
9. Run `/position`
10. Run `/proof`

## Read-only API

- `GET /api/health`
- `GET /api/status`
- `GET /api/proof`
- `GET /api/position?address=0x...`
- `GET /api/audit`

## Deployments

| Network | Contract | Address | Explorer |
|---------|----------|---------|----------|
| Celo Sepolia | Treasury | `0xbC46a13BEEDd08592e69ac0EDF20893416A406de` | https://sepolia.celoscan.io/address/0xbC46a13BEEDd08592e69ac0EDF20893416A406de |
| Celo Sepolia | tUSDC | `0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2` | https://sepolia.celoscan.io/address/0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2 |

## Quick Start

```bash
# Prerequisites
forge --version
python3 --version

# Install Python deps used by agent scripts
pip install web3 python-dotenv

# Build and test
forge build
forge test

# Deploy token + treasury
source .env
forge script script/Deploy.s.sol:DeployAll \
  --rpc-url $CELO_SEPOLIA_RPC --broadcast --private-key $CEO_PRIVATE_KEY

# Deploy faucet for the configured TOKEN
forge script script/DeployFaucet.s.sol:DeployFaucet \
  --rpc-url $CELO_SEPOLIA_RPC --broadcast --private-key $CEO_PRIVATE_KEY
```

## Cron Schedule

| Agent | Interval | Trigger |
|-------|----------|---------|
| Trader | Every 30 min | Balance scan and report |
| CEO | Every 6 hours | Treasury evaluation and allocation |
| DevOps | Every 24 hours | VPS health report |

## Project Structure

```text
src/Treasury.sol             # Treasury vault contract
src/TestERC20.sol            # 6-decimal tUSDC test token
src/TestUSDCFaucet.sol       # 100 tUSDC demo faucet
test/Treasury.t.sol          # Treasury tests
test/TestUSDCFaucet.t.sol    # Faucet tests
script/Deploy.s.sol          # Token + Treasury deploy script
script/DeployFaucet.s.sol    # Faucet deploy script
agents/bot.py                # Telegram command handler
agents/ceo.py                # CEO agent logic
agents/trader.py             # Trader agent logic
agents/devops.py             # DevOps agent logic
agents/auditor.py            # Read-only treasury audit report
landing/src/app/deposit      # Wallet deposit/withdraw/faucet UI
landing/src/app/api          # Read-only status/proof/position/audit API
```

## License

MIT

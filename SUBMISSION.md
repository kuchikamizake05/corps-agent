# Corps Agent Hackathon Submission

## One-liner

Corps Agent is an autonomous treasury operations prototype on Celo Sepolia, where CEO, Trader, DevOps, and Auditor agents coordinate stablecoin deposits, profit reporting, payouts, and public proof links.

## Links

- Live demo: https://corps-agent-site.vercel.app
- Telegram bot: https://t.me/CorpsAgentBot
- Source code: https://github.com/kuchikamizake05/corps-agent
- Treasury: https://sepolia.celoscan.io/address/0xbC46a13BEEDd08592e69ac0EDF20893416A406de
- tUSDC token: https://sepolia.celoscan.io/address/0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2
- Demo faucet: https://sepolia.celoscan.io/address/0x2129ca0C60aB45508bFC66e93f96Df44246FD42C
- Last deposit proof: https://sepolia.celoscan.io/tx/0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d
- Last profit proof: https://sepolia.celoscan.io/tx/0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e

## What It Does

Corps Agent turns a testnet stablecoin treasury into a small autonomous operating company:

- Users claim demo tUSDC and deposit into a vault-style Treasury.
- Treasury mints shares, tracks total assets, previews withdrawals, and exposes read-only API status.
- Trader sends simulated profit into the Treasury.
- CEO records profit, accrues a 5% performance fee, and can execute reason-tagged payouts.
- Auditor checks solvency, share accounting, fee liability, and payout visibility.
- Telegram bot exposes `/status`, `/treasury`, `/audit`, `/position`, `/proof`, `/agents`, and `/demo-script`.
- Important actions resolve to public Celo Sepolia proof links.

## Why Celo

Celo fits the product shape because Corps Agent is about practical stablecoin operations rather than speculative mechanics. The demo uses low-cost Celo Sepolia transactions, explorer-readable treasury state, and a payment-style user flow: claim test funds, deposit, inspect value, and verify operational actions.

## Agent Identities

| Agent | ERC-8004 ID | Responsibility |
| --- | --- | --- |
| CEO | 310 | Profit accounting, fee claiming, payout execution, public decision records |
| Trader | 311 | Controlled testnet treasury growth and profit return |
| DevOps | 312 | Runtime and uptime monitoring |
| Auditor | module | Read-only treasury and payout risk checks |

## Demo Script

1. Open https://corps-agent-site.vercel.app.
2. Click `Deposit demo`.
3. Connect a wallet on Celo Sepolia.
4. Use the Celo faucet link if the wallet needs gas.
5. Claim demo tUSDC.
6. Deposit 10 tUSDC into the Treasury.
7. Open https://t.me/CorpsAgentBot.
8. Run `/setwallet 0xYOUR_WALLET`.
9. Run `/position`.
10. Run `/proof`.
11. Show the Treasury, token, deposit, profit, and agent identity links.

## Target Tracks

- Best Agent on Celo: working autonomous treasury operations with on-chain proof.
- Most Activity: repeatable demo flow with bot commands and public transactions.
- Highest Rank in 8004scan: three registered agent identities with clear runtime roles.

## Final Submission Checklist

- [x] Landing page deployed.
- [x] Telegram bot command surface implemented.
- [x] Treasury, token, and proof links documented.
- [x] ERC-8004 agent IDs documented.
- [x] Local readiness check passes.
- [x] Contract tests pass.
- [x] Landing production build passes.
- [x] Redeploy `TinyUSDCFaucet` from the current decimal-aware source and update `TUSDC_FAUCET_ADDRESS` plus `NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS`.
- [ ] Redeploy Vercel after updating the faucet address.
- [ ] Run one fresh judge-wallet deposit after the faucet refresh.

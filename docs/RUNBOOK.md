# Corps Agent Runbook

## Landing Deployment

Set these Vercel environment variables for the `landing` app:

```env
CELO_SEPOLIA_RPC=https://forno.celo-sepolia.celo-testnet.org
NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS=0x2129ca0C60aB45508bFC66e93f96Df44246FD42C
NEXT_PUBLIC_LAST_DEPOSIT_TX=0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d
NEXT_PUBLIC_LAST_PROFIT_TX=0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e
```

Do not put private keys or `TELEGRAM_BOT_TOKEN` in Vercel for the landing app.

## Bot And Agent Host

The VPS or local bot host needs:

```env
CELO_SEPOLIA_RPC=https://forno.celo-sepolia.celo-testnet.org
TREASURY_ADDRESS=0xbC46a13BEEDd08592e69ac0EDF20893416A406de
TOKEN=0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2
TUSDC_FAUCET_ADDRESS=0x2129ca0C60aB45508bFC66e93f96Df44246FD42C
TELEGRAM_BOT_TOKEN=...
CEO_PRIVATE_KEY=...
TRADER_PRIVATE_KEY=...
```

Run:

```bash
python3 agents/bot.py
```

## Verification

```bash
node scripts/check-demo-readiness.js
forge test
cd landing && npm ci && npm run build
```

On Windows, use the bundled Foundry path if needed:

```powershell
C:\Users\ASUS\.foundry\bin\forge.exe test
```

## Faucet Path

The current demo faucet is `TinyUSDCFaucet`, which has no cooldown. If abuse becomes a problem, deploy `TestUSDCFaucet` and update:

```env
TUSDC_FAUCET_ADDRESS=0x...
NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS=0x...
```

Then redeploy the landing app and run readiness again.

## Rollback

- Landing rollback: use the previous Vercel deployment.
- Bot rollback: stop the current bot process, restore the previous git revision, and restart `python3 agents/bot.py`.
- Contract rollback: contracts are immutable; deploy a new faucet/treasury and update env/docs.

## Incident Checklist

- If RPC reads fail, check `/api/health` and switch `CELO_SEPOLIA_RPC` if needed.
- If bot commands fail, inspect stdout logs and verify `cast` is installed on the host.
- If faucet fails, verify `canClaim(address)` and token `mint(address,uint256)`.
- If a secret is suspected leaked, rotate it before resuming automated operations.

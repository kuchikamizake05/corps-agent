# PLAN — Corps Agent di Celo

## Konsep
Multi-agent company autonomous di Celo. CEO + 3 sub-agent (Trader, DevOps, Treasury Contract). 
Semua terdaftar ERC-8004, transaksi on-chain, profit reinvest.

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────┐
│                    HERMES (VPS 24/7)                     │
│                                                          │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Cron        │  │ Python   │  │ Telegram │           │
│  │ Scheduler   │  │ Scripts  │  │ Gateway  │           │
│  └──────┬──────┘  └─────┬────┘  └─────┬────┘           │
│         │               │             │                 │
└─────────┼───────────────┼─────────────┼─────────────────┘
          │               │             │
          ▼               ▼             ▼
┌──────────────────────────────────────────────────────────┐
│                    CELO MAINNET                          │
│                                                          │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Treasury   │  │ Uniswap  │  │ stCELO   │            │
│  │ Contract   │  │ Pools    │  │ Contract │            │
│  └────────────┘  └──────────┘  └──────────┘            │
│                                                          │
│  ERC-8004: CEO (#1) + Trader (#2) + DevOps (#3)         │
└──────────────────────────────────────────────────────────┘
```

---

## Wallet / Identitas

| Role | Wallet | ERC-8004 | Fungsi |
|------|--------|----------|--------|
| CEO | generate#0 | Agent #1 | Treasury, alokasi, report |
| Trader | generate#1 | Agent #2 | Eksekusi arbitrage |
| DevOps | generate#2 | Agent #3 | Minta budget operasional |
| Treasury | Smart contract | - | Hold dana, release payment |

---

## Timeline Implementasi — 10 Hari

### Hari 1: Setup Wallet + Smart Contract
```
[ ] Generate 3 wallet address pake cast/viem
[ ] Dapet CELO testnet dari faucet
[ ] Dapet USDC testnet (swap atau faucet)
[ ] Bikin Treasury.sol:
    - hold balance
    - release(address to, uint amount)
    - track setiap transaksi (event)
    - hanya CEO yg bisa approve release
[ ] Compile + test pake anvil
[ ] Deploy ke Celo Sepolia testnet
```

### Hari 2: Trader Agent (scan + execute)
```
[ ] Bikin script Python/JS:
    - scan harga CELO/USDC di Uniswap V3
    - scan harga CELO/USDC di Ubeswap
    - kalau selisih > threshold → execute arbitrage
[ ] Integrasi pake viem (call contract)
[ ] Tes swap di testnet
[ ] Catat profit ke Treasury contract
```

### Hari 3: Liquidity + Staking Agent
```
[ ] Bikin script deposit ke Uniswap V3 pool
[ ] Bikin script claim fee dari pool
[ ] Bikin script stake CELO → stCELO
[ ] Bikin script claim staking reward
[ ] Integrasi semua ke Treasury flow
```

### Hari 4: CEO Agent Logic
```
[ ] Bikin Hermes cron job:
    - tiap 1 jam: trigger Trader scan harga
    - tiap 6 jam: trigger profit report
    - tiap 24 jam: hitung profit & alokasi
[ ] CEO decision logic:
    - profit > threshold → deploy ke liquidity/staking
    - VPS perlu upgrade → alokasi budget
[ ] Report profit harian via Telegram
```

### Hari 5: DevOps Agent
```
[ ] Bikin script monitor VPS:
    - CPU, RAM, disk usage
    - uptime
    - hitung cost server
[ ] Kalau perlu upgrade → mintak budget ke CEO
[ ] Record request on-chain (lewat Treasury)
```

### Hari 6: ERC-8004 Registration + Metadata
```
[ ] Register CEO, Trader, DevOps di ERC-8004
[ ] Bikin metadata JSON buat tiap agent
[ ] Upload metadata ke IPFS (pinata / filebase)
[ ] Verify di 8004scan.io
```

### Hari 7: Full Integration Test
```
[ ] Cron jalan 24 jam penuh
[ ] Monitor semua transaksi di Celoscan
[ ] Fix bug, optimize timing
[ ] Pastikan semua agent terekam di ERC-8004
[ ] Track volume transaksi (target: 50+ tx)
```

### Hari 8: Social Agent + Demo
```
[ ] Twitter/X setup (buat akun corps)
[ ] Post screenshot transaksi on-chain
[ ] Rekam video demo (2-3 menit):
    - Tunjukkin cron jalan
    - Tunjukkin transaksi di Celoscan
    - Tunjukkin ERC-8004 di 8004scan
    - Tunjukkin report Telegram
```

### Hari 9: GitHub + README
```
[ ] Push semua code ke repo publik
[ ] Bikin README keren:
    - arsitektur diagram
    - cara jalanin
    - link ke Celoscan
    - link ke ERC-8004
[ ] Bikin submission text + screenshots
```

### Hari 10: Submit
```
[ ] Submit lewat Celopedia (portal buka 8 Juni)
[ ] Tweet pake format resmi (tag @CeloDevs + @Celo)
[ ] Join Telegram group buat pengumuman
```

---

## Stack Teknis

| Komponen | Tools | Status |
|----------|-------|--------|
| Smart Contract | Solidity + Foundry | ✅ Sudah terinstall |
| Blockchain interaction | viem + cast | ✅ Butuh install npm |
| Cron | Hermes cron system | ✅ Udah jalan |
| Telegram report | Hermes gateway | ✅ Udah jalan |
| DEX interaction | Uniswap V3 contracts | ✅ Contract address known |
| Staking | stCELO contract | ✅ Address known |
| ERC-8004 | Identity Registry | ✅ Skill terinstall |
| IPFS metadata | Pinata / filebase | ❌ Butuh setup |
| Twitter/X | xurl CLI | ❌ Butuh auth |
| Password/Key storage | .env file | ⚠️ Hati-hati |

---

## Yang perlu diputusin sekarang

1. **Modal?** Minimal 5-10 USDC + 5 CELO buat demo di mainnet. Atau testnet dulu?
2. **Timeline?** Mulai besok atau nanti?
3. **Wallet?** Gue generate manual atau lo punya?

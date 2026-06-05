# PRD: Corps Agent — Multi-Agent Autonomous Company di Celo

**Versi:** 1.0
**Penulis:** Faaid + Hermes
**Hackathon:** Onchain Agents Hackathon (Celo)
**Timeline:** 3 Juni – 14 Juni 2026

---

## 1. Vision

> Sebuah perusahaan otonom yang dijalankan 100% oleh AI agents di atas Celo blockchain. Punya CEO, Trader, dan DevOps. Mencari profit, membayar biaya operasional, dan tumbuh sendiri — tanpa intervensi manusia.

---

## 2. Infrastruktur

### 2.1 VPS
- **VPS saat ini sudah cukup.** Tidak perlu VPS baru.
- Spesifikasi: 2 vCPU, 4GB RAM, ~49GB disk
- OS: Ubuntu 24.04
- Udah jalan: Hermes default profile (gateway + 7 cron jobs)
- Tambahan beban: ~5-10% CPU & RAM — aman

### 2.2 Hermes Profile
- **Pakai profile default.** Gak perlu profile baru.
- Yang kita tambahin:
  - Project folder `/root/celo-agent/`
  - Cron job baru (via Hermes cron system)
  - Wallet file (di `/root/celo-agent/.env`, gak nyentuh konfigurasi Hermes)
- Gateway existing gak terganggu.

### 2.3 Tools
- Foundry (forge, cast, anvil) — ✅ udah terinstall
- Node.js — ✅ v22
- Python — ✅ 3.11
- npm packages: viem, `@celo/abis`

---

## 3. Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────────┐
│                        VPS (Hermes)                              │
│                                                                  │
│  ┌─────────────────────┐     ┌──────────────────────────────┐   │
│  │   Hermes Gateway    │     │   Hermes Cron System          │   │
│  │   (Telegram)        │     │                               │   │
│  │   - Daily news      │     │   tiap 15 menit: Trader scan  │   │
│  │   - GitHub trending │     │   tiap 6 jam:   CEO evaluate  │   │
│  │   - Report harian   │     │   tiap 24 jam:  DevOps report │   │
│  └─────────────────────┘     └──────────────┬────────────────┘   │
│                                              │                    │
│  ┌───────────────────────────────────────────┴───────────────┐   │
│  │              Agent Scripts (Python / Node)                 │   │
│  │                                                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │   │
│  │  │ CEO      │ │ Trader   │ │ DevOps   │ │ Social       │ │   │
│  │  │ agent    │ │ agent    │ │ agent    │ │ agent (ops)  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │   │
│  └───────────────────────────┬───────────────────────────────┘   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CELO MAINNET                                │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Treasury    │  │  Uniswap V3  │  │  stCELO              │   │
│  │  Contract    │  │  / Ubeswap   │  │  (liquid staking)    │   │
│  │  (custom)    │  │  (swap/pool) │  │                      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           │                                      │
│  ┌────────────────────────▼──────────────────────────────────┐   │
│  │            ERC-8004 Identity Registry                      │   │
│  │  CEO (Agent #1) | Trader (Agent #2) | DevOps (Agent #3)   │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Komponen Detail

### 4.1 Wallet & Key Management

| Wallet | Alamat | Fungsi | Key Disimpan |
|--------|--------|--------|-------------|
| CEO | generate #0 | Treasury owner | `/root/celo-agent/.env` (encrypted) |
| Trader | generate #1 | Eksekusi swap | `/root/celo-agent/.env` (encrypted) |
| DevOps | generate #2 | Biaya operasional | `/root/celo-agent/.env` (encrypted) |

**Keamanan:**
- Private key disimpan di `.env` — **tidak** di commit ke GitHub
- File `.env` masuk `.gitignore`
- Semua transaksi via viem (bukan export private key ke shell)

### 4.2 Smart Contract: Treasury.sol

```
Treasury
├── state:
│   ├── owner: address              (CEO wallet)
│   ├── balances: mapping(address => uint)     (saldo tiap sub-agent)
│   └── txHistory: array of Tx       (riwayat transaksi)
│
├── functions:
│   ├── deposit()                  (terima USDC/CELO)
│   ├── allocate(to, amount)       (CEO alokasi dana ke sub-agent)
│   ├── release(to, amount)        (CEO bayar biaya)
│   └── getBalance()               (cek total treasury)
│
└── events:
    ├── Deposit(from, amount)
    ├── Allocated(to, amount)
    └── Released(to, amount)
```

**Tidak perlu upgradeable.** Hackathon project, cukup simple.

### 4.3 Trader Agent Script

**Trigger:** Cron tiap 15-30 menit

**Flow:**
```
1. Call Uniswap V3 Quoter → harga CELO/USDC
2. Call Ubeswap Quoter → harga CELO/USDC
3. Kalau selisih > 0.5%:
   a. Swap via Uniswap (buy low)
   b. Swap via Ubeswap (sell high)
   c. Transfer profit ke Treasury
4. Catat tx hash ke log
5. Kirim report ke CEO
```

**Error handling:**
- Kalau gas price > threshold → skip
- Kalau slippage > 1% → cancel
- Retry 2x kalau gagal

### 4.4 DevOps Agent Script

**Trigger:** Cron tiap 24 jam

**Flow:**
```
1. Baca /proc/stat, /proc/meminfo, df
2. Catat: CPU%, RAM%, DISK%
3. Kalau CPU > 90% atau RAM > 85%:
   - Hitung biaya upgrade ($5-$10/bulan)
   - Kirim request ke CEO buat alokasi budget
4. Catat report on-chain ke Treasury event
5. Kirim report via Telegram
```

### 4.5 CEO Agent (Hermes Cron Logic)

**Trigger:** Tiap 6 jam + manual via Telegram

**Flow:**
```
1. Baca laporan Trader: "Profit hari ini: 0.02 USDC"
2. Baca laporan DevOps: "Server OK, CPU 45%"
3. Baca laporan Liquidity: "Fee pool: 0.005 USDC"
4. Baca laporan Staking: "Reward: 0.001 CELO"
5. Decision logic:
   if profit > threshold:
     - 30% → modal trading (biar profit naik)
     - 20% → tambah likuiditas pool
     - 20% → stake CELO
     - 20% → cadangan
     - 10% → devops budget
6. Execute allocation via Treasury contract
7. Kirim report ke Telegram user
```

### 4.6 ERC-8004 Registration

| Agent | Metadata IPFS | Skills/Endpoints |
|-------|--------------|-----------------|
| CEO | `ipfs://...` | web, MCP |
| Trader | `ipfs://...` | web (API endpoint) |
| DevOps | `ipfs://...` | web |

**Metadata format (spec compliant):**
```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Corps CEO Agent",
  "description": "CEO of autonomous agent company on Celo",
  "image": "ipfs://...",
  "services": [
    { "name": "web", "endpoint": "https://celo-agent.example.com" }
  ],
  "supportedTrust": ["reputation"]
}
```

---

## 5. Schedule / Cron

| Interval | Script | Transaksi On-Chain |
|----------|--------|-------------------|
| Setiap 15 menit | Trader: scan harga | Hanya kalo execute swap |
| Setiap 6 jam | CEO: evaluate profit | 1-3 tx (allocate) |
| Setiap 24 jam | DevOps: report | 1 tx (record) |
| Setiap 24 jam | Staking: claim reward | 1 tx (claim) |
| Setiap 24 jam | Liquidity: claim fee | 1 tx (claim) |
| Setiap 12 jam | Social: tweet summary | 0 (off-chain) |

**Target volume:** 15-30 tx/hari → 150-300 tx selama hackathon

---

## 6. Teknologi Stack

| Lapisan | Teknologi |
|---------|-----------|
| Blockchain | Celo Mainnet (Chain ID 42220) |
| Smart Contract | Solidity 0.8.28 + Foundry |
| Blockchain SDK | viem v2 |
| Scripting | Python 3.11 + Node.js |
| Scheduling | Hermes cron system |
| Reporting | Hermes Telegram gateway |
| Agent Identity | ERC-8004 |
| Micropayments | x402 (optional) |
| DEX | Uniswap V3, Ubeswap V2 |
| Staking | stCELO |
| Metadata Storage | IPFS (via Pinata or filebase) |

---

## 7. Target Track Hackathon

| Track | Target | Cara |
|-------|--------|------|
| Track 1: Best Agent | $2.500 | Multi-agent company = inovatif, first-of-its-kind |
| Track 2: Most Activity | $500 | 150-300 tx ensure ranking |
| Track 3: 8004scan | $500 | 3 ERC-8004 agents registered + aktif |

---

## 8. Constraints

### 8.1 Waktu
- Deadline: 15 Juni 2026 (12 hari dari sekarang)
- Submission via Celopedia: buka 8 Juni
- Prioritas: demo jalan > fitur lengkap

### 8.2 Modal
- **Opsi A (testnet dulu):** Celo Sepolia faucet — gratis
- **Opsi B (mainnet real):** Butuh deposit minimal 5 USDC + 5 CELO
- **Rekomendasi:** Testnet dulu untuk development, mainnet untuk final demo (isi sedikit)

### 8.3 Keamanan
- Private key **tidak** di-push ke GitHub
- Gas di-set manual (gak auto — biar gak boncos)
- Transaksi dikonfirmasi manual dulu sebelum cron full auto

---

## 9. File Structure

```
/root/celo-agent/
├── .env                    # Private keys (gitignored)
├── .gitignore
├── README.md               # Dokumentasi project
├── PLAN.md                 # PRD ini
├── foundry.toml            # Config Foundry
│
├── src/
│   └── Treasury.sol        # Smart contract
│
├── test/
│   └── Treasury.t.sol      # Test contract
│
├── script/
│   └── Deploy.s.sol        # Deploy script
│
├── agents/
│   ├── ceo.py              # CEO logic
│   ├── trader.py           # DEX arbitrage
│   └── devops.py           # VPS monitor
│
├── metadata/
│   ├── ceo.json            # ERC-8004 metadata CEO
│   ├── trader.json         # ERC-8004 metadata Trader
│   └── devops.json         # ERC-8004 metadata DevOps
│
└── submission/
    ├── demo-video.mp4      # Video demo
    └── screenshots/        # Bukti transaksi
```

---

## 10. Deliverables Buat Judges

1. **GitHub repo open source** — semua kode, README, arsitektur diagram
2. **Video demo 2-3 menit** — cron jalan → transaksi on-chain → profit → report
3. **ERC-8004 identities** — terdaftar & visible di 8004scan
4. **Celoscan transaction history** — minimal 50+ transaksi real
5. **README/submission text** — arsitektur, flow, link
6. **Tweet resmi** — tag @CeloDevs + @Celo

---

## 11. Risk & Mitigation

| Risk | Dampak | Mitigasi |
|------|--------|----------|
| Arbitrage gak profit | Revenue 0 | Pake liquidity + staking sebagai backup |
| Waktu mepet | Gak selesai | Drop social agent, fokus ke 3 agent inti |
| Bug smart contract | Dana ilang | Test pake anvil dulu, testnet dulu |
| Cron gagal | Gak ada transaksi | Manual trigger + logging |

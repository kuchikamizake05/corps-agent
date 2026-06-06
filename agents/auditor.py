#!/usr/bin/env python3
"""Auditor Agent — read-only treasury consistency and risk report."""
import os
import subprocess
from pathlib import Path

ENV = Path(__file__).parent.parent / ".env"
for line in ENV.read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())

RPC = os.environ.get("CELO_SEPOLIA_RPC", "https://forno.celo-sepolia.celo-testnet.org")
TREASURY = os.environ["TREASURY_ADDRESS"]
TOKEN = os.environ["TOKEN"]
CEO = os.environ.get("CEO_ADDRESS", "")


def cast(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["cast", *args], capture_output=True, text=True)


def uint(*args: str) -> int:
    r = cast(*args)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip())
    return int(r.stdout.strip().split()[0])


def ether(n: int) -> str:
    return f"{n / 1e18:.6f}"


def main() -> None:
    assets = uint("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC)
    shares = uint("call", TREASURY, "totalShares()(uint256)", "--rpc-url", RPC)
    fee = uint("call", TREASURY, "pendingOwnerFee()(uint256)", "--rpc-url", RPC)
    price = uint("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC)
    vault = uint("call", TREASURY, "vaultBalance()(uint256)", "--rpc-url", RPC)
    ceo_shares = uint("call", TREASURY, "shares(address)(uint256)", CEO, "--rpc-url", RPC) if CEO else 0

    accounted = assets + fee
    mismatch = vault - accounted

    flags = []
    if mismatch < 0:
        flags.append(f"❌ Vault underfunded by {ether(abs(mismatch))} tUSDC")
    elif mismatch > 10**14:  # >0.0001 token unrecorded profit/dust
        flags.append(f"⚠️ Unrecorded token balance: {ether(mismatch)} tUSDC")
    else:
        flags.append("✅ Vault balance matches accounted assets + fees")

    if shares == 0 and assets > 0:
        flags.append("⚠️ Assets exist but no shares are minted")
    elif shares > 0:
        flags.append("✅ Active vault shares exist")

    if price == 0:
        flags.append("❌ Share price is zero")
    else:
        flags.append("✅ Share price is valid")

    if fee > assets // 10 if assets else fee > 0:
        flags.append("⚠️ Pending owner fee is high relative to assets")
    else:
        flags.append("✅ Pending owner fee within normal range")

    status = "HEALTHY" if not any(f.startswith("❌") for f in flags) else "CHECK_REQUIRED"

    print("=== Auditor Report (Agent #Auditor) ===")
    print(f"Treasury: {TREASURY}")
    print(f"Token:    {TOKEN}")
    print(f"Assets:   {ether(assets)} tUSDC")
    print(f"Shares:   {ether(shares)}")
    print(f"CEO shares: {ether(ceo_shares)}")
    print(f"Price:    {ether(price)} tUSDC")
    print(f"Vault:    {ether(vault)} tUSDC")
    print(f"Fee:      {ether(fee)} tUSDC")
    print(f"Mismatch: {ether(mismatch)} tUSDC")
    print("\nRisk flags:")
    for flag in flags:
        print(f"- {flag}")
    print(f"\nStatus: {status}")


if __name__ == "__main__":
    main()

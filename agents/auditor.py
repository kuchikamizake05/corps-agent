#!/usr/bin/env python3
"""Auditor module: read-only treasury consistency, risk score, and report."""

import os
import subprocess
from pathlib import Path

try:
    from agents.token_units import TokenUnits, cast_binary
except ModuleNotFoundError:
    from token_units import TokenUnits, cast_binary

ENV = Path(__file__).parent.parent / ".env"
if ENV.exists():
    for line in ENV.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

RPC = os.environ.get("CELO_SEPOLIA_RPC", "https://forno.celo-sepolia.celo-testnet.org")
TREASURY = os.environ["TREASURY_ADDRESS"]
TOKEN = os.environ["TOKEN"]
CEO = os.environ.get("CEO_ADDRESS", "")
DEVOPS = os.environ.get("DEVOPS_ADDRESS", "")
PRICE_SCALE = 10**18
DUST = 100


def cast(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run([cast_binary(), *args], capture_output=True, text=True)


def uint(*args: str) -> int:
    result = cast(*args)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip())
    return int(result.stdout.strip().split()[0])


def share_price(value: int) -> str:
    return f"{value / PRICE_SCALE:.6f}"


def verdict(ok: bool) -> str:
    return "PASS" if ok else "FAIL"


def main() -> None:
    units = TokenUnits.from_chain(TOKEN, RPC)
    assets = uint("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC)
    shares = uint("call", TREASURY, "totalShares()(uint256)", "--rpc-url", RPC)
    fee = uint("call", TREASURY, "pendingOwnerFee()(uint256)", "--rpc-url", RPC)
    price = uint("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC)
    vault = uint("call", TREASURY, "vaultBalance()(uint256)", "--rpc-url", RPC)
    ceo_shares = uint("call", TREASURY, "shares(address)(uint256)", CEO, "--rpc-url", RPC) if CEO else 0
    devops_bal = uint("call", TOKEN, "balanceOf(address)(uint256)", DEVOPS, "--rpc-url", RPC) if DEVOPS else 0

    accounted = assets + fee
    mismatch = vault - accounted
    checks = [
        ("Solvency", abs(mismatch) <= DUST, "vault == totalAssets + pendingOwnerFee"),
        ("Share accounting", not (shares == 0 and assets > 0), "assets should have matching shares"),
        ("Share price", price > 0 if shares > 0 else assets == 0, "share price must stay valid"),
        ("Fee liability", fee <= max(assets // 10, DUST), "pending fee should not dominate assets"),
        ("Payout visibility", devops_bal >= units.parse("1"), "demo vendor/devops payout is visible"),
    ]
    failures = [name for name, ok, _ in checks if not ok]
    warnings = []
    if mismatch > DUST:
        warnings.append(f"Unrecorded token balance: {units.format(mismatch)} tUSDC")
    if assets and price < int(0.95 * PRICE_SCALE):
        warnings.append("Share price below 0.95 tUSDC after payout; expected when treasury funds are spent")
    risk = "LOW" if not failures and not warnings else "MEDIUM" if not failures else "HIGH"

    print("=== Treasury Audit Report ===")
    print("Module: Auditor")
    print(f"Treasury: {TREASURY}")
    print(f"Token:    {TOKEN}")
    print("")
    print("Snapshot")
    print(f"- Total assets:      {units.format(assets)} tUSDC")
    print(f"- Total shares:      {units.format(shares)}")
    print(f"- CEO shares:        {units.format(ceo_shares)}")
    print(f"- Share price:       {share_price(price)} tUSDC")
    print(f"- Vault balance:     {units.format(vault)} tUSDC")
    print(f"- Pending owner fee: {units.format(fee)} tUSDC")
    print(f"- Accounting gap:    {units.format(mismatch)} tUSDC")
    print(f"- DevOps/vendor bal: {units.format(devops_bal)} tUSDC")
    print("")
    print("Checks")
    for name, ok, detail in checks:
        print(f"- {name}: {verdict(ok)} - {detail}")
    if warnings:
        print("")
        print("Warnings")
        for warning in warnings:
            print(f"- {warning}")
    print("")
    print(f"Risk level: {risk}")
    print("Status: HEALTHY" if risk == "LOW" else "Status: CHECK_REQUIRED")


if __name__ == "__main__":
    main()

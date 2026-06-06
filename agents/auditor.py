#!/usr/bin/env python3
"""Auditor module — read-only treasury consistency, risk score, and report."""
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
DEVOPS = os.environ.get("DEVOPS_ADDRESS", "")

WAD = 10**18
DUST = 10**14  # 0.0001 token


def cast(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["cast", *args], capture_output=True, text=True)


def uint(*args: str) -> int:
    r = cast(*args)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip())
    return int(r.stdout.strip().split()[0])


def ether(n: int) -> str:
    sign = "-" if n < 0 else ""
    return f"{sign}{abs(n) / WAD:.6f}"


def verdict(ok: bool) -> str:
    return "PASS" if ok else "FAIL"


def main() -> None:
    assets = uint("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC)
    shares = uint("call", TREASURY, "totalShares()(uint256)", "--rpc-url", RPC)
    fee = uint("call", TREASURY, "pendingOwnerFee()(uint256)", "--rpc-url", RPC)
    price = uint("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC)
    vault = uint("call", TREASURY, "vaultBalance()(uint256)", "--rpc-url", RPC)
    ceo_shares = uint("call", TREASURY, "shares(address)(uint256)", CEO, "--rpc-url", RPC) if CEO else 0
    devops_bal = uint("call", TOKEN, "balanceOf(address)(uint256)", DEVOPS, "--rpc-url", RPC) if DEVOPS else 0

    accounted = assets + fee
    mismatch = vault - accounted

    checks = []
    checks.append(("Balance check", abs(mismatch) <= DUST, "vault == totalAssets + pendingOwnerFee"))
    checks.append(("Accounting check", assets >= 0 and vault >= fee, "tracked assets and fee liability are solvent"))
    checks.append(("Share supply check", not (shares == 0 and assets > 0), "assets should have matching shares"))
    checks.append(("Share price check", price > 0 if shares > 0 else assets == 0, "share price must stay valid"))
    checks.append(("Fee liability check", fee <= max(assets // 10, DUST), "pending fee should not dominate assets"))
    checks.append(("Payout impact check", devops_bal >= WAD, "demo vendor/devops payout is visible"))

    failures = [name for name, ok, _ in checks if not ok]
    warnings = []
    notes = []
    if mismatch > DUST:
        warnings.append(f"Unrecorded token balance: {ether(mismatch)} tUSDC")
    if assets and price < int(0.95 * WAD):
        notes.append("Share price below 0.95 tUSDC after payout; expected when treasury funds are spent")
    if not failures and not warnings:
        risk = "LOW"
        status = "HEALTHY"
    elif not failures:
        risk = "MEDIUM"
        status = "HEALTHY_WITH_NOTES"
    else:
        risk = "HIGH"
        status = "CHECK_REQUIRED"

    print("=== Treasury Audit Report ===")
    print("Module: Auditor")
    print(f"Treasury: {TREASURY}")
    print(f"Token:    {TOKEN}")
    print("")
    print("Snapshot")
    print(f"- Total assets:      {ether(assets)} tUSDC")
    print(f"- Total shares:      {ether(shares)}")
    print(f"- CEO shares:        {ether(ceo_shares)}")
    print(f"- Share price:       {ether(price)} tUSDC")
    print(f"- Vault balance:     {ether(vault)} tUSDC")
    print(f"- Pending owner fee: {ether(fee)} tUSDC")
    print(f"- Accounting gap:    {ether(mismatch)} tUSDC")
    print(f"- DevOps/vendor bal: {ether(devops_bal)} tUSDC")
    print("")
    print("Checks")
    for name, ok, detail in checks:
        print(f"- {name}: {verdict(ok)} — {detail}")
    if warnings:
        print("")
        print("Warnings")
        for warning in warnings:
            print(f"- {warning}")
    if notes:
        print("")
        print("Notes")
        for note in notes:
            print(f"- {note}")
    print("")
    print(f"Risk level: {risk}")
    print(f"Status: {status}")
    if failures:
        print(f"Recommendation: investigate {', '.join(failures)}")
    elif warnings:
        print("Recommendation: treasury usable; review notes before large payouts")
    else:
        print("Recommendation: treasury healthy for community operations")


if __name__ == "__main__":
    main()

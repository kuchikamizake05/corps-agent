#!/usr/bin/env python3
"""CEO Agent: record profit, claim fees, and report treasury state."""

import os
import subprocess
import time
from pathlib import Path

ENV = Path(__file__).parent.parent / ".env"
if ENV.exists():
    for line in ENV.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

RPC = os.environ.get("CELO_SEPOLIA_RPC", "https://forno.celo-sepolia.celo-testnet.org")
TREASURY = os.environ["TREASURY_ADDRESS"]
TOKEN = os.environ["TOKEN"]
CEO_PK = os.environ["CEO_PRIVATE_KEY"]
TOKEN_SCALE = 10**6
PRICE_SCALE = 10**18


def cast(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["cast", *args], capture_output=True, text=True)


def parse_uint(result: subprocess.CompletedProcess) -> int:
    try:
        return int(result.stdout.strip().split()[0])
    except Exception:
        return 0


def main() -> None:
    assets = parse_uint(cast("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC))
    shares = parse_uint(cast("call", TREASURY, "totalShares()(uint256)", "--rpc-url", RPC))
    share_price = parse_uint(cast("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC))
    vault_bal = parse_uint(cast("call", TOKEN, "balanceOf(address)(uint256)", TREASURY, "--rpc-url", RPC))
    fee = parse_uint(cast("call", TREASURY, "pendingOwnerFee()(uint256)", "--rpc-url", RPC))

    print("=== CEO Report (Agent #310) ===")
    print("ERC-8004: https://sepolia.celoscan.io/token/0x8004A818BFB912233c491871b3d84c89A494BD9e?a=310")
    print(f"Assets:    {assets / TOKEN_SCALE:.6f} tUSDC")
    print(f"Shares:    {shares / TOKEN_SCALE:.6f}")
    print(f"Price:     {share_price / PRICE_SCALE:.6f} tUSDC")
    print(f"Vault bal: {vault_bal / TOKEN_SCALE:.6f} tUSDC")
    print(f"Fee owed:  {fee / TOKEN_SCALE:.6f} tUSDC")
    print("")

    accounted = assets + fee
    if vault_bal > accounted:
        diff = vault_bal - accounted
        print(f"Unrecorded profit: {diff / TOKEN_SCALE:.6f} tUSDC")
        result = cast("send", TREASURY, "recordProfit()", "--private-key", CEO_PK, "--rpc-url", RPC, "--gas-limit", "100000")
        if result.returncode == 0:
            print("Profit recorded.")
            time.sleep(2)
            new_assets = parse_uint(cast("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC))
            new_price = parse_uint(cast("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC))
            new_fee = parse_uint(cast("call", TREASURY, "pendingOwnerFee()(uint256)", "--rpc-url", RPC))
            print(f"   New assets: {new_assets / TOKEN_SCALE:.6f} tUSDC")
            print(f"   New price:  {new_price / PRICE_SCALE:.6f} tUSDC")
            print(f"   Fee:        {new_fee / TOKEN_SCALE:.6f} tUSDC")
        else:
            print(f"Failed: {result.stderr[-200:]}")

    if fee > 0.01 * TOKEN_SCALE:
        print(f"\nClaiming {fee / TOKEN_SCALE:.6f} tUSDC fee...")
        result = cast("send", TREASURY, "claimFee()", "--private-key", CEO_PK, "--rpc-url", RPC, "--gas-limit", "100000")
        print("Fee claimed." if result.returncode == 0 else f"Failed: {result.stderr[-200:]}")


if __name__ == "__main__":
    main()

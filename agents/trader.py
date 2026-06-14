#!/usr/bin/env python3
"""Trader Agent: send simulated profit to Treasury using cast."""

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
TRADER_PK = os.environ["TRADER_PRIVATE_KEY"]
TRADER = os.environ["TRADER_ADDRESS"]
PRICE_SCALE = 10**18


def cast(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run([cast_binary(), *args], capture_output=True, text=True)


def parse_uint(result: subprocess.CompletedProcess) -> int:
    try:
        return int(result.stdout.strip().split()[0])
    except Exception:
        return 0


def main() -> None:
    units = TokenUnits.from_chain(TOKEN, RPC)
    bal = parse_uint(cast("call", TOKEN, "balanceOf(address)(uint256)", TRADER, "--rpc-url", RPC))
    assets = parse_uint(cast("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC))
    shares = parse_uint(cast("call", TREASURY, "totalShares()(uint256)", "--rpc-url", RPC))
    share_price = parse_uint(cast("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC))
    celo_bal = parse_uint(cast("balance", TRADER, "--rpc-url", RPC))

    print("=== Trader Report (Agent #311) ===")
    print(f"Trader:  {TRADER}")
    print("ERC-8004: https://sepolia.celoscan.io/token/0x8004A818BFB912233c491871b3d84c89A494BD9e?a=311")
    print(f"CELO:    {celo_bal / 1e18:.4f}")
    print(f"tUSDC:   {units.format(bal, 4)}")
    print("")
    print(f"Treasury assets: {units.format(assets, 4)} tUSDC")
    print(f"Treasury shares: {units.format(shares, 4)}")
    print(f"Share price:     {share_price / PRICE_SCALE:.4f} tUSDC")
    print("")

    profit_target = units.parse("0.005")
    if bal >= profit_target:
        profit = min(bal, profit_target)
        print(f"Sending {units.format(profit, 4)} tUSDC to Treasury...")
        result = cast("send", TOKEN, "transfer(address,uint256)", TREASURY, str(profit), "--private-key", TRADER_PK, "--rpc-url", RPC, "--gas-limit", "100000")
        for line in result.stderr.splitlines():
            if "transactionHash" in line or "status" in line or "Error" in line:
                print(f"  {line.strip()}")
        print("Done." if result.returncode == 0 else f"Failed: {result.stderr[-200:]}")
    else:
        print(f"Low balance ({units.format(bal, 4)}), need >= 0.005")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Trader Agent — send simulated profit to Treasury using cast"""
import os, subprocess, sys
from pathlib import Path

# Load env
env_file = Path(__file__).parent.parent / ".env"
for line in env_file.read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())

RPC = "https://forno.celo-sepolia.celo-testnet.org"
TREASURY = os.environ["TREASURY_ADDRESS"]
TOKEN = os.environ["TOKEN"]
TRADER_PK = os.environ["TRADER_PRIVATE_KEY"]

def cast(*args):
    result = subprocess.run(["cast"] + list(args), capture_output=True, text=True)
    return result

def parse_uint(output):
    """Parse cast output: '99995000000000000000 [9.999e19]' → int"""
    val = output.stdout.strip().split()[0]
    try:
        return int(val)
    except:
        return 0

# Read state
bal = cast("call", TOKEN, "balanceOf(address)(uint256)", os.environ["TRADER_ADDRESS"], "--rpc-url", RPC)
treasury_assets = cast("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC)
treasury_shares = cast("call", TREASURY, "totalShares()(uint256)", "--rpc-url", RPC)
price = cast("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC)
celo_bal = cast("balance", os.environ["TRADER_ADDRESS"], "--rpc-url", RPC)

bal_i = parse_uint(bal)
print(f"=== Trader Report ===")
print(f"Trader:  {os.environ['TRADER_ADDRESS']}")
print(f"CELO:    {parse_uint(celo_bal) / 1e18:.4f}")
print(f"tUSDC:   {bal_i / 1e18:.4f}")
print(f"")
print(f"Treasury assets: {parse_uint(treasury_assets) / 1e18:.4f} tUSDC")
print(f"Treasury shares: {parse_uint(treasury_shares) / 1e18:.4f}")
print(f"Share price:     {parse_uint(price) / 1e18:.4f} tUSDC")
print(f"")

# Send simulated profit
if bal_i >= int(0.005 * 1e18):
    profit = min(bal_i, int(0.005 * 1e18))
    print(f"Sending {profit / 1e18:.4f} tUSDC to Treasury...")
    result = cast("send", TOKEN, f"transfer(address,uint256)", TREASURY, str(profit),
                  "--private-key", TRADER_PK, "--rpc-url", RPC, "--gas-limit", "100000")
    for line in result.stderr.splitlines():
        if "transactionHash" in line or "status" in line or "Error" in line:
            print(f"  {line.strip()}")
    if result.returncode == 0:
        print(f"✅ Done!")
    else:
        print(f"❌ Failed: {result.stderr[-200:]}")
else:
    print(f"⚠️  Low balance ({bal_i / 1e18:.4f}), need >= 0.005")

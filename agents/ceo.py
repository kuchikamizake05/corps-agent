#!/usr/bin/env python3
"""CEO Agent — record profit, claim fees, report"""
import os, subprocess
from pathlib import Path

env_file = Path(__file__).parent.parent / ".env"
for line in env_file.read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())

RPC = "https://forno.celo-sepolia.celo-testnet.org"
TREASURY = os.environ["TREASURY_ADDRESS"]
TOKEN = os.environ["TOKEN"]
CEO_PK = os.environ["CEO_PRIVATE_KEY"]

def cast(*args):
    result = subprocess.run(["cast"] + list(args), capture_output=True, text=True)
    return result

def parse_uint(output):
    val = output.stdout.strip().split()[0]
    try: return int(val)
    except: return 0

# Read state
assets = parse_uint(cast("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC))
shares = parse_uint(cast("call", TREASURY, "totalShares()(uint256)", "--rpc-url", RPC))
price = parse_uint(cast("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC))
vault_bal = parse_uint(cast("call", TOKEN, "balanceOf(address)(uint256)", TREASURY, "--rpc-url", RPC))
fee = parse_uint(cast("call", TREASURY, "pendingOwnerFee()(uint256)", "--rpc-url", RPC))

print(f"=== CEO Report (Agent #310) ===")
print(f"ERC-8004: https://sepolia.celoscan.io/token/0x8004A818BFB912233c491871b3d84c89A494BD9e?a=310")
print(f"Assets:    {assets / 1e18:.6f} tUSDC")
print(f"Shares:    {shares / 1e18:.6f}")
print(f"Price:     {price / 1e18:.6f} tUSDC")
print(f"Vault bal: {vault_bal / 1e18:.6f} tUSDC")
print(f"Fee owed:  {fee / 1e18:.6f} tUSDC")
print(f"")

# Record profit if available
if vault_bal > assets:
    diff = vault_bal - assets
    print(f"📈 Unrecorded profit: {diff / 1e18:.6f} tUSDC")
    r = cast("send", TREASURY, "recordProfit()", "--private-key", CEO_PK, "--rpc-url", RPC, "--gas-limit", "100000")
    if r.returncode == 0:
        print(f"✅ Profit recorded!")
        import time; time.sleep(2)  # wait for propagation
        new_assets = parse_uint(cast("call", TREASURY, "totalAssets()(uint256)", "--rpc-url", RPC))
        new_price = parse_uint(cast("call", TREASURY, "sharePrice()(uint256)", "--rpc-url", RPC))
        new_fee = parse_uint(cast("call", TREASURY, "pendingOwnerFee()(uint256)", "--rpc-url", RPC))
        print(f"   New assets: {new_assets / 1e18:.6f} tUSDC")
        print(f"   New price:  {new_price / 1e18:.6f} tUSDC")
        print(f"   Fee:        {new_fee / 1e18:.6f} tUSDC")
    else:
        print(f"❌ Failed: {r.stderr[-200:]}")

# Claim fee if > 0.01
if fee > 0.01 * 1e18:
    print(f"\n💰 Claiming {fee / 1e18:.6f} tUSDC fee...")
    r = cast("send", TREASURY, "claimFee()", "--private-key", CEO_PK, "--rpc-url", RPC, "--gas-limit", "100000")
    if r.returncode == 0:
        print(f"✅ Fee claimed!")
    else:
        print(f"❌ Failed: {r.stderr[-200:]}")

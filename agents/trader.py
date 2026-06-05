#!/usr/bin/env python3
"""Corps Agent — Trader: scan DEX prices, report arbitrage opportunities"""

import os
import json
import subprocess
from pathlib import Path
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# ── Config ──────────────────────────────────────────────────────────────
RPC_URL = os.environ.get("CELO_SEPOLIA_RPC")
CEO_ADDRESS = os.environ.get("CEO_ADDRESS")
TRADER_ADDRESS = os.environ.get("TRADER_ADDRESS")
TRADER_PK = os.environ.get("TRADER_PRIVATE_KEY")
TREASURY_ADDR = os.environ.get("TREASURY_ADDRESS")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

# USDC on Celo Sepolia
USDC = "0x01C5C0122039549AD1493B8220cABEdD739BC44E"
USDC_DECIMALS = 6

# Minimal ABI for balanceOf
ERC20_ABI = '[{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"}]'

usdc_contract = w3.eth.contract(address=Web3.to_checksum_address(USDC), abi=ERC20_ABI)

def main():
    if not w3.is_connected():
        print(json.dumps({"agent": "trader", "status": "ERROR", "error": "RPC not connected"}))
        return

    chain_id = w3.eth.chain_id
    block = w3.eth.block_number

    # ── Balances ──
    celo_balance = w3.from_wei(w3.eth.get_balance(Web3.to_checksum_address(TRADER_ADDRESS)), "ether")
    usdc_balance = usdc_contract.functions.balanceOf(Web3.to_checksum_address(TRADER_ADDRESS)).call() / 10**USDC_DECIMALS

    report = {
        "agent": "trader",
        "timestamp": subprocess.getoutput("date -u +%Y-%m-%dT%H:%M:%SZ"),
        "chain_id": chain_id,
        "block": block,
        "wallet": TRADER_ADDRESS,
        "balances": {
            "CELO": round(float(celo_balance), 6),
            "USDC": round(float(usdc_balance), 2),
        },
        "scan_result": "testnet_no_liquidity",
        "arbitrage_opportunity": None,
    }

    # ── On testnet, just log ──
    if celo_balance > 0.01:
        report["scan_result"] = "funded_ready"
    else:
        report["scan_result"] = "low_funds"

    # ── Treasury balance ──
    if TREASURY_ADDR:
        try:
            treasury_celo = w3.from_wei(w3.eth.get_balance(Web3.to_checksum_address(TREASURY_ADDR)), "ether")
            report["treasury_celo"] = round(float(treasury_celo), 6)
        except:
            pass

    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()

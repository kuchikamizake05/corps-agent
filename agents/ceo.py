#!/usr/bin/env python3
"""Corps Agent — CEO: evaluate agent reports, make allocation decisions"""

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
CEO_PK = os.environ.get("CEO_PRIVATE_KEY")
TRADER_ADDRESS = os.environ.get("TRADER_ADDRESS")
DEVOPS_ADDRESS = os.environ.get("DEVOPS_ADDRESS")
TREASURY_ADDR = os.environ.get("TREASURY_ADDRESS")

w3 = Web3(Web3.HTTPProvider(RPC_URL))
TREASURY_ABI = json.loads(Path(__file__).parent.parent.joinpath("out", "Treasury.sol", "Treasury.json").read_text())["abi"]

def main():
    chain_id = w3.eth.chain_id
    block = w3.eth.block_number

    report = {
        "agent": "ceo",
        "timestamp": subprocess.getoutput("date -u +%Y-%m-%dT%H:%M:%SZ"),
        "chain_id": chain_id,
        "block": block,
        "ceo_wallet": CEO_ADDRESS,
        "treasury_address": TREASURY_ADDR,
    }

    # ── Treasury state ──
    if TREASURY_ADDR and w3.is_connected():
        treasury = w3.eth.contract(address=Web3.to_checksum_address(TREASURY_ADDR), abi=TREASURY_ABI)
        try:
            owner = treasury.functions.owner().call()
            report["treasury_owner"] = owner
            report["treasury_owner_match"] = (owner.lower() == CEO_ADDRESS.lower())

            balance = treasury.functions.getBalance().call()
            report["treasury_balance_celo"] = round(float(w3.from_wei(balance, "ether")), 6)

            tx_count = treasury.functions.getTxCount().call()
            report["treasury_tx_count"] = tx_count

            # ── Decision logic ──
            decisions = []
            if tx_count == 0:
                decisions.append("INIT: Treasury deployed, awaiting first deposit")

            report["decisions"] = decisions
            report["status"] = "OPERATIONAL" if owner else "ERROR"

        except Exception as e:
            report["status"] = "ERROR"
            report["error"] = str(e)
    else:
        report["status"] = "NO_TREASURY"

    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()

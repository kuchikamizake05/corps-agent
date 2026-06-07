#!/usr/bin/env python3
"""Telegram bot command surface for Corps Agent demos.

Uses only the Python standard library plus Foundry's `cast` command.
Required env: TELEGRAM_BOT_TOKEN.
Optional env: TREASURY_ADDRESS, TOKEN, CELO_SEPOLIA_RPC, TUSDC_FAUCET_ADDRESS.
"""

import json
import os
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent.parent
ENV = ROOT / ".env"
WALLETS = ROOT / "agents" / "wallets.json"

if ENV.exists():
    for line in ENV.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

RPC = os.environ.get("CELO_SEPOLIA_RPC", "https://forno.celo-sepolia.celo-testnet.org")
TREASURY = os.environ.get("TREASURY_ADDRESS", "0xbC46a13BEEDd08592e69ac0EDF20893416A406de")
TOKEN = os.environ.get("TOKEN", "0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2")
FAUCET = os.environ.get("TUSDC_FAUCET_ADDRESS", "")
EXPLORER = "https://sepolia.celoscan.io"
LAST_DEPOSIT_TX = os.environ.get("LAST_DEPOSIT_TX", "0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d")
LAST_PROFIT_TX = os.environ.get("LAST_PROFIT_TX", "0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e")
TOKEN_SCALE = 10**6
PRICE_SCALE = 10**18


def load_wallets() -> dict[str, str]:
    if not WALLETS.exists():
        return {}
    return json.loads(WALLETS.read_text())


def save_wallets(wallets: dict[str, str]) -> None:
    WALLETS.write_text(json.dumps(wallets, indent=2) + "\n")


def cast_uint(signature: str, *args: str) -> int:
    result = subprocess.run(
        ["cast", "call", TREASURY, signature, *args, "--rpc-url", RPC],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip()[-240:])
    return int(result.stdout.strip().split()[0])


def token(value: int, digits: int = 6) -> str:
    return f"{value / TOKEN_SCALE:,.{digits}f}"


def price(value: int) -> str:
    return f"{value / PRICE_SCALE:,.4f}"


def api(method: str, params: dict | None = None) -> dict:
    token_value = os.environ["TELEGRAM_BOT_TOKEN"]
    data = urllib.parse.urlencode(params or {}).encode()
    with urllib.request.urlopen(f"https://api.telegram.org/bot{token_value}/{method}", data=data, timeout=30) as response:
        return json.loads(response.read())


def send(chat_id: int, text: str) -> None:
    api("sendMessage", {"chat_id": chat_id, "text": text, "disable_web_page_preview": "true"})


def is_address(value: str) -> bool:
    return value.startswith("0x") and len(value) == 42


def treasury_text() -> str:
    assets = cast_uint("totalAssets()(uint256)")
    shares = cast_uint("totalShares()(uint256)")
    share_price = cast_uint("sharePrice()(uint256)")
    fee = cast_uint("pendingOwnerFee()(uint256)")
    vault = cast_uint("vaultBalance()(uint256)")
    return "\n".join([
        "Treasury",
        f"Assets: {token(assets)} tUSDC",
        f"Shares: {token(shares)}",
        f"Share price: {price(share_price)}",
        f"Vault balance: {token(vault)} tUSDC",
        f"Fee liability: {token(fee)} tUSDC",
        f"{EXPLORER}/address/{TREASURY}",
    ])


def position_text(user_id: str) -> str:
    wallet = load_wallets().get(user_id)
    if not wallet:
        return "Set your wallet first:\n/setwallet 0x..."
    shares = cast_uint("shares(address)(uint256)", wallet)
    current = cast_uint("userValue(address)(uint256)", wallet)
    pnl = 0 if shares == 0 else ((current - shares) / shares) * 100
    return "\n".join([
        "Position",
        f"Wallet: {wallet}",
        f"Shares: {token(shares)}",
        f"Current value: {token(current, 2)} tUSDC",
        f"PnL: {pnl:+.2f}%",
    ])


def proof_text() -> str:
    lines = [
        "On-chain proof",
        f"Treasury contract: {TREASURY}",
        f"Token contract: {TOKEN}",
    ]
    if FAUCET:
        lines.append(f"Faucet contract: {FAUCET}")
    lines.extend([
        f"Last deposit: {EXPLORER}/tx/{LAST_DEPOSIT_TX}",
        f"Last profit: {EXPLORER}/tx/{LAST_PROFIT_TX}",
        f"Treasury: {EXPLORER}/address/{TREASURY}",
        f"Token: {EXPLORER}/address/{TOKEN}",
    ])
    return "\n".join(lines)


def audit_text() -> str:
    assets = cast_uint("totalAssets()(uint256)")
    shares = cast_uint("totalShares()(uint256)")
    fee = cast_uint("pendingOwnerFee()(uint256)")
    vault = cast_uint("vaultBalance()(uint256)")
    solvency = vault >= assets + fee
    share_accounting = shares > 0 or assets == 0
    fee_pct = 0 if assets == 0 else (fee / assets) * 100
    risk = "LOW" if solvency and share_accounting else "HIGH"
    return "\n".join([
        "Treasury Audit",
        f"Solvency: {'PASS' if solvency else 'FAIL'}",
        f"Share accounting: {'PASS' if share_accounting else 'FAIL'}",
        f"Payout risk: {risk}",
        f"Fee liability: {fee_pct:.2f}%",
        f"Assets: {token(assets, 2)} tUSDC",
        "Last check: now",
    ])


def handle(chat_id: int, user_id: str, text: str) -> None:
    parts = text.strip().split()
    command = parts[0].lower() if parts else ""
    if command in {"/start", "/help"}:
        send(chat_id, "/status /treasury /audit /setwallet 0x... /position /proof /demo-script")
    elif command == "/status":
        send(chat_id, f"Corps Agent on Celo Sepolia\nTreasury: {TREASURY}\nToken: {TOKEN}\nAgents: CEO #310, Trader #311, DevOps #312")
    elif command == "/treasury":
        send(chat_id, treasury_text())
    elif command == "/setwallet":
        if len(parts) != 2 or not is_address(parts[1]):
            send(chat_id, "Usage: /setwallet 0x...")
            return
        wallets = load_wallets()
        wallets[user_id] = parts[1]
        save_wallets(wallets)
        send(chat_id, f"Wallet saved: {parts[1]}")
    elif command == "/position":
        send(chat_id, position_text(user_id))
    elif command == "/proof":
        send(chat_id, proof_text())
    elif command == "/audit":
        send(chat_id, audit_text())
    elif command == "/agents":
        send(chat_id, "CEO Agent #310\nTrader Agent #311\nDevOps Agent #312\nAuditor module")
    elif command == "/demo-script":
        send(chat_id, "1. Open landing\n2. Click Deposit\n3. Connect wallet\n4. Get CELO gas\n5. Claim 100 tUSDC\n6. Deposit 10 tUSDC\n7. Run /setwallet 0x...\n8. Run /position\n9. Run /proof")
    else:
        send(chat_id, "Unknown command. Try /help")


def main() -> None:
    if not os.environ.get("TELEGRAM_BOT_TOKEN"):
        raise SystemExit("Missing TELEGRAM_BOT_TOKEN")
    offset = 0
    while True:
        result = api("getUpdates", {"timeout": 30, "offset": offset})
        for update in result.get("result", []):
            offset = update["update_id"] + 1
            message = update.get("message") or {}
            text = message.get("text", "")
            chat = message.get("chat") or {}
            user = message.get("from") or {}
            if text and chat.get("id") and user.get("id"):
                try:
                    handle(chat["id"], str(user["id"]), text)
                except Exception as exc:
                    send(chat["id"], f"Command failed: {exc}")
        time.sleep(1)


if __name__ == "__main__":
    main()

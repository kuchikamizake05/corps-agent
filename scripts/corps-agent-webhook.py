#!/usr/bin/env python3
"""
Corps Agent Wallet Verify Webhook
POST /nonce   { tg_id }  -> { nonce, url }
POST /verify  { tg_id, wallet, signature, nonce }

Environment:
  CORPS_AGENT_DATA_DIR=/root/.hermes/profiles/corps-agent/data
  CORPS_AGENT_SITE_URL=https://corps-agent-site.vercel.app
  CORPS_AGENT_WEBHOOK_PORT=7890
"""

import json
import os
import re
import subprocess
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

DATA_DIR = os.path.expanduser(os.environ.get("CORPS_AGENT_DATA_DIR", "/root/.hermes/profiles/corps-agent/data"))
WALLETS_FILE = os.path.join(DATA_DIR, "wallets.json")
NONCES_FILE = os.path.join(DATA_DIR, "nonces.json")
SITE = os.environ.get("CORPS_AGENT_SITE_URL", "https://corps-agent-site.vercel.app")
PORT = int(os.environ.get("CORPS_AGENT_WEBHOOK_PORT", "7890"))
ADDRESS_RE = re.compile(r"^0x[a-fA-F0-9]{40}$")
SIGNATURE_RE = re.compile(r"^0x[a-fA-F0-9]{130}$")


def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = f"{path}.tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, path)


def verify_signature(wallet, message, signature):
    """Verify EIP-191 personal_sign signature using Foundry cast."""
    try:
        result = subprocess.run(
            ["cast", "wallet", "verify", "--address", wallet, message, signature],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return result.returncode == 0
    except Exception:
        return False


class VerifyHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", SITE)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code, data):
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
        except json.JSONDecodeError:
            return self._json(400, {"ok": False, "error": "Invalid JSON"})

        path = urlparse(self.path).path

        if path == "/nonce":
            tg_id = body.get("tg_id")
            if not tg_id:
                return self._json(400, {"ok": False, "error": "tg_id required"})

            nonce = os.urandom(16).hex()
            expires = int(time.time()) + 300

            nonces = load_json(NONCES_FILE)
            nonces.setdefault("nonces", {})[str(tg_id)] = {
                "nonce": nonce,
                "expires": expires,
            }
            save_json(NONCES_FILE, nonces)

            url = f"{SITE}/connect?tg={tg_id}&nonce={nonce}"
            return self._json(200, {"ok": True, "nonce": nonce, "url": url, "expires": expires})

        if path == "/verify":
            tg_id = body.get("tg_id")
            wallet = body.get("wallet")
            signature = body.get("signature")
            nonce = body.get("nonce")

            if not all([tg_id, wallet, signature, nonce]):
                return self._json(400, {"ok": False, "error": "Missing fields"})
            tg_id = str(tg_id)
            wallet = str(wallet)
            signature = str(signature)
            nonce = str(nonce)
            if not ADDRESS_RE.match(wallet):
                return self._json(400, {"ok": False, "error": "Invalid wallet address"})
            if not SIGNATURE_RE.match(signature):
                return self._json(400, {"ok": False, "error": "Invalid signature"})

            nonces = load_json(NONCES_FILE)
            entry = nonces.get("nonces", {}).get(str(tg_id))
            if not entry or entry.get("nonce") != nonce:
                return self._json(400, {"ok": False, "error": "Invalid or expired nonce"})
            if time.time() > entry.get("expires", 0):
                del nonces["nonces"][str(tg_id)]
                save_json(NONCES_FILE, nonces)
                return self._json(400, {"ok": False, "error": "Nonce expired"})

            message = f"CorpsAgent:verify:{nonce}"
            if not verify_signature(wallet, message, signature):
                return self._json(400, {"ok": False, "error": "Signature verification failed"})

            wallets = load_json(WALLETS_FILE)
            wallets[str(tg_id)] = wallet
            save_json(WALLETS_FILE, wallets)

            del nonces["nonces"][str(tg_id)]
            save_json(NONCES_FILE, nonces)

            return self._json(200, {"ok": True, "wallet": wallet})

        return self._json(404, {"ok": False, "error": "Not found"})

    def log_message(self, format, *args):
        print(f"[webhook] {self.address_string()} {format % args}")


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), VerifyHandler)
    print(f"Corps Agent webhook running on :{PORT}")
    print("  POST /nonce   — generate nonce + link")
    print("  POST /verify  — verify signature + save wallet")
    server.serve_forever()

#!/usr/bin/env python3
"""Corps Agent — DevOps: monitor VPS health & report to Treasury"""

import os
import json
import subprocess
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Config ──────────────────────────────────────────────────────────────
RPC_URL = os.environ.get("CELO_SEPOLIA_RPC")
DEVOPS_ADDRESS = os.environ.get("DEVOPS_ADDRESS")
CEO_ADDRESS = os.environ.get("CEO_ADDRESS")
TREASURY = os.environ.get("TREASURY_ADDRESS")
DEV_HOME = Path(__file__).parent.parent

def get_cpu():
    """Read CPU usage from /proc/stat"""
    with open("/proc/stat") as f:
        line = f.readline().strip().split()
    # idle = line[4]; total = sum(line[1:])
    idle = int(line[4])
    total = sum(int(v) for v in line[1:])
    return 100 * (1 - idle / total) if total else 0

def get_ram():
    """Read RAM usage from /proc/meminfo"""
    with open("/proc/meminfo") as f:
        lines = f.readlines()
    total = int([l for l in lines if "MemTotal" in l][0].split()[1])
    avail = int([l for l in lines if "MemAvailable" in l][0].split()[1])
    return 100 * (1 - avail / total)

def get_disk():
    stat = os.statvfs("/")
    total = stat.f_frsize * stat.f_blocks
    free = stat.f_frsize * stat.f_bfree
    return 100 * (1 - free / total)

def main():
    cpu = round(get_cpu(), 1)
    ram = round(get_ram(), 1)
    disk = round(get_disk(), 1)

    report = {
        "agent": "devops",
        "timestamp": subprocess.getoutput("date -u +%Y-%m-%dT%H:%M:%SZ"),
        "cpu_pct": cpu,
        "ram_pct": ram,
        "disk_pct": disk,
        "uptime": subprocess.getoutput("uptime -p"),
        "status": "OK" if cpu < 90 and ram < 85 else "WARN",
    }

    print(json.dumps(report, indent=2))

    # ── Alert if critical ──
    if cpu > 90 or ram > 85:
        print(f"\n⚠️  VPS WARNING: CPU {cpu}% | RAM {ram}%")
        print(f"Recommendation: Upgrade VPS (≈$5-10/month)")

if __name__ == "__main__":
    main()

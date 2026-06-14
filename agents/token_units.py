"""ERC-20 unit conversion backed by the token contract's decimals value."""

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
import os
from pathlib import Path
import shutil
import subprocess
from typing import Callable


RunCommand = Callable[..., subprocess.CompletedProcess]


def cast_binary() -> str:
    configured = os.environ.get("CAST_BIN")
    if configured:
        return configured
    discovered = shutil.which("cast")
    if discovered:
        return discovered
    windows_install = Path.home() / ".foundry" / "bin" / "cast.exe"
    if windows_install.exists():
        return str(windows_install)
    return "cast"


@dataclass(frozen=True)
class TokenUnits:
    token: str
    decimals: int

    @property
    def scale(self) -> int:
        return 10**self.decimals

    @classmethod
    def from_chain(
        cls,
        token: str,
        rpc: str,
        run: RunCommand = subprocess.run,
        cast_bin: str | None = None,
    ) -> "TokenUnits":
        result = run(
            [cast_bin or cast_binary(), "call", token, "decimals()(uint8)", "--rpc-url", rpc],
            capture_output=True,
            text=True,
            timeout=20,
        )
        if result.returncode != 0:
            raise RuntimeError(f"unable to read token decimals: {result.stderr.strip()[-240:]}")
        try:
            decimals = int(result.stdout.strip().split()[0])
        except (ValueError, IndexError) as exc:
            raise RuntimeError("invalid token decimals response") from exc
        if not 0 <= decimals <= 255:
            raise RuntimeError(f"invalid token decimals: {decimals}")
        return cls(token=token, decimals=decimals)

    def parse(self, value: str | int | Decimal) -> int:
        try:
            amount = Decimal(str(value))
        except InvalidOperation as exc:
            raise ValueError(f"invalid token amount: {value}") from exc
        raw = amount * self.scale
        if raw != raw.to_integral_value():
            raise ValueError(f"token amount has more than {self.decimals} decimals: {value}")
        return int(raw)

    def format(self, value: int, digits: int = 6, grouped: bool = False) -> str:
        amount = Decimal(value) / self.scale
        spec = f",.{digits}f" if grouped else f".{digits}f"
        return format(amount, spec)

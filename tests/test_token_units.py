import subprocess
import unittest

from agents.token_units import TokenUnits


class TokenUnitsTest(unittest.TestCase):
    def test_reads_decimals_from_token_contract(self):
        calls = []

        def run(command, **kwargs):
            calls.append(command)
            return subprocess.CompletedProcess(command, 0, stdout="18\n", stderr="")

        units = TokenUnits.from_chain(
            token="0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2",
            rpc="https://forno.celo-sepolia.celo-testnet.org",
            run=run,
            cast_bin="cast",
        )

        self.assertEqual(units.decimals, 18)
        self.assertEqual(units.scale, 10**18)
        self.assertEqual(calls[0][0:4], ["cast", "call", units.token, "decimals()(uint8)"])

    def test_converts_decimal_amount_without_float_rounding(self):
        units = TokenUnits(
            token="0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2",
            decimals=18,
        )

        self.assertEqual(units.parse("0.005"), 5_000_000_000_000_000)
        self.assertEqual(units.format(9_038_000_000_000_000_000), "9.038000")

    def test_rejects_invalid_contract_decimals(self):
        def run(command, **kwargs):
            return subprocess.CompletedProcess(command, 0, stdout="999\n", stderr="")

        with self.assertRaisesRegex(RuntimeError, "invalid token decimals"):
            TokenUnits.from_chain("0xToken", "https://rpc.example", run=run, cast_bin="cast")


if __name__ == "__main__":
    unittest.main()

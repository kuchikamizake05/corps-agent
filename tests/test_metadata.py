import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_TREASURY = "0xbC46a13BEEDd08592e69ac0EDF20893416A406de"
EXPECTED_TOKEN = "0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2"
EXPECTED_FAUCET = "0x2129ca0C60aB45508bFC66e93f96Df44246FD42C"


class AgentMetadataTest(unittest.TestCase):
    def test_metadata_references_live_services_and_contracts(self):
        for path in sorted((ROOT / "metadata").glob("*.json")):
            with self.subTest(metadata=path.name):
                payload = json.loads(path.read_text(encoding="utf-8"))
                encoded = json.dumps(payload)

                self.assertNotIn("example.com", encoded)
                self.assertIn(
                    "https://corps-agent-site.vercel.app",
                    [service["endpoint"] for service in payload["services"]],
                )
                self.assertEqual(payload["contracts"]["treasury"], EXPECTED_TREASURY)
                self.assertEqual(payload["contracts"]["token"], EXPECTED_TOKEN)
                self.assertEqual(payload["contracts"]["faucet"], EXPECTED_FAUCET)


if __name__ == "__main__":
    unittest.main()

# Deployments

## Celo Sepolia

| Component | Address | Explorer |
| --- | --- | --- |
| Treasury v2 | `0xbC46a13BEEDd08592e69ac0EDF20893416A406de` | https://sepolia.celoscan.io/address/0xbC46a13BEEDd08592e69ac0EDF20893416A406de |
| tUSDC | `0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2` | https://sepolia.celoscan.io/address/0x1e2B14dF5aef2FD74DAb48DFE94Ea9295a9D89E2 |
| TinyUSDCFaucet | `0x2129ca0C60aB45508bFC66e93f96Df44246FD42C` | https://sepolia.celoscan.io/address/0x2129ca0C60aB45508bFC66e93f96Df44246FD42C |

## Proof Transactions

| Action | Transaction |
| --- | --- |
| Last deposit | https://sepolia.celoscan.io/tx/0x4a8e6b78172304d5e9fcfd3c9b384ac8738d020b800a51667a94edaadde0004d |
| Last profit | https://sepolia.celoscan.io/tx/0xff511ef3667e60c24373d59a0d114740068d8324241efe0cadf59c618198c08e |
| Tiny faucet deploy | https://sepolia.celoscan.io/tx/0x3014f5b839d62837454be52135f6171ec82798645ea3318894482cf9f1872a33 |

## Ownership Note

The currently deployed Treasury v2 remains controlled by its deployed owner. The two-step ownership code in `Treasury.sol` improves future deployments; it does not change ownership of the already deployed treasury unless that contract is redeployed or a compatible ownership path already exists onchain.

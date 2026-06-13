// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title TinyUSDCFaucet
/// @notice Gas-minimal faucet compatible with the demo UI.
contract TinyUSDCFaucet {
    address private immutable token;

    constructor(address _token) {
        token = _token;
    }

    function claim() external {
        (bool ok,) = token.call(abi.encodeWithSignature("mint(address,uint256)", msg.sender, uint256(100_000_000)));
        require(ok, "Mint failed");
    }

    function nextClaimTime(address) external pure returns (uint256) {
        return 0;
    }

    function canClaim(address) external pure returns (bool) {
        return true;
    }
}

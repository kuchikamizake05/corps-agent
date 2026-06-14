// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title TinyUSDCFaucet
interface IERC20MetadataLike {
    function decimals() external view returns (uint8);
}

/// @notice Gas-minimal faucet compatible with the demo UI.
contract TinyUSDCFaucet {
    address private immutable token;
    uint256 public immutable claimAmount;

    constructor(address _token) {
        token = _token;
        claimAmount = 100 * 10 ** IERC20MetadataLike(_token).decimals();
    }

    function claim() external {
        (bool ok,) = token.call(abi.encodeWithSignature("mint(address,uint256)", msg.sender, claimAmount));
        require(ok, "Mint failed");
    }

    function nextClaimTime(address) external pure returns (uint256) {
        return 0;
    }

    function canClaim(address) external pure returns (bool) {
        return true;
    }
}

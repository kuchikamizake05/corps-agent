// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMintableERC20 {
    function mint(address to, uint256 amount) external;
}

/// @title TestUSDCFaucet
/// @notice Claims 100 test USDC per wallet every hour for Corps Agent demo deposits.
contract TestUSDCFaucet {
    IMintableERC20 public immutable token;

    /// @dev tUSDC uses 6 decimals, so 100 tokens = 100_000_000 units.
    uint256 public constant CLAIM_AMOUNT = 100 * 1e6;
    uint256 public constant COOLDOWN = 1 hours;

    mapping(address => uint256) public lastClaimAt;

    event Claimed(address indexed user, uint256 amount, uint256 nextClaimAt);

    constructor(address _token) {
        require(_token != address(0), "Invalid token");
        token = IMintableERC20(_token);
    }

    function claim() external {
        uint256 previousClaimAt = lastClaimAt[msg.sender];
        uint256 nextClaimAt = previousClaimAt + COOLDOWN;
        require(previousClaimAt == 0 || block.timestamp >= nextClaimAt, "Cooldown active");

        lastClaimAt[msg.sender] = block.timestamp;
        token.mint(msg.sender, CLAIM_AMOUNT);

        emit Claimed(msg.sender, CLAIM_AMOUNT, block.timestamp + COOLDOWN);
    }

    function nextClaimTime(address user) external view returns (uint256) {
        return lastClaimAt[user] + COOLDOWN;
    }

    function canClaim(address user) external view returns (bool) {
        uint256 previousClaimAt = lastClaimAt[user];
        return previousClaimAt == 0 || block.timestamp >= previousClaimAt + COOLDOWN;
    }
}

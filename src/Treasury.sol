// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Treasury v2 — Vault model with 5% performance fee
/// @notice Users deposit ERC-20 (USDm on testnet), get shares
///         CEO records profit from trading, 5% fee auto-accrued to owner
///         Users withdraw deposit + profit proportionally
contract Treasury {
    IERC20 public token;
    address public owner;
    address public pendingOwner;

    uint256 public totalShares;
    uint256 public totalAssets; // total token balance tracked

    mapping(address => uint256) public shares;
    uint256 public pendingOwnerFee; // unclaimed 5% fees in token

    event Deposited(address indexed user, uint256 amount, uint256 mintedShares);
    event Withdrawn(address indexed user, uint256 sharesBurned, uint256 amount);
    event ProfitRecorded(uint256 grossProfit, uint256 fee, uint256 netProfit, uint256 newAssets);
    event FeeClaimed(address indexed owner, uint256 amount);
    event Payout(address indexed recipient, uint256 amount, string reason);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event AgentDecision(
        uint256 indexed agentId,
        string action,
        string reason,
        bytes32 evidenceHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _token) {
        owner = msg.sender;
        token = IERC20(_token);
    }

    /// @notice Deposit token, mint shares at current price
    function deposit(uint256 amount) external {
        require(amount > 0, "Zero amount");

        SafeERC20Lite.safeTransferFrom(address(token), msg.sender, address(this), amount);

        uint256 minted;
        if (totalShares == 0) {
            minted = amount; // 1:1 initial
        } else {
            minted = amount * totalShares / totalAssets;
        }

        shares[msg.sender] += minted;
        totalShares += minted;
        totalAssets += amount;

        emit Deposited(msg.sender, amount, minted);
    }

    /// @notice Burn shares, withdraw proportional token amount
    /// @param shareAmount Number of shares to burn
    function withdraw(uint256 shareAmount) external {
        require(shareAmount > 0, "Zero shares");
        require(shares[msg.sender] >= shareAmount, "Insufficient shares");

        uint256 amount = shareAmount * totalAssets / totalShares;

        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;
        totalAssets -= amount;

        SafeERC20Lite.safeTransfer(address(token), msg.sender, amount);

        emit Withdrawn(msg.sender, shareAmount, amount);
    }

    /// @notice Owner records profit from trading. 5% fee accrues to owner.
    /// @dev Assumes profit token is already in this contract's balance.
    ///      totalAssets tracks user-owned assets, excluding pending owner fees.
    function recordProfit() external onlyOwner {
        uint256 accounted = totalAssets + pendingOwnerFee;
        uint256 grossProfit = token.balanceOf(address(this)) - accounted;
        require(grossProfit > 0, "No profit to record");

        uint256 fee = grossProfit * 5 / 100;
        uint256 netProfit = grossProfit - fee;
        pendingOwnerFee += fee;
        totalAssets += netProfit;

        emit ProfitRecorded(grossProfit, fee, netProfit, totalAssets);
    }

    /// @notice Owner claims accumulated performance fees
    function claimFee() external onlyOwner {
        uint256 amount = pendingOwnerFee;
        require(amount > 0, "No fees to claim");
        pendingOwnerFee = 0;
        SafeERC20Lite.safeTransfer(address(token), owner, amount);
        emit FeeClaimed(owner, amount);
    }

    /// @notice Owner executes a stablecoin payout for community expenses/vendors.
    function payout(address recipient, uint256 amount, string calldata reason) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Zero amount");
        require(amount <= totalAssets, "Insufficient assets");

        totalAssets -= amount;
        SafeERC20Lite.safeTransfer(address(token), recipient, amount);

        emit Payout(recipient, amount, reason);
    }

    /// @notice Owner records a public agent decision without moving funds.
    function recordAgentDecision(
        uint256 agentId,
        string calldata action,
        string calldata reason,
        bytes32 evidenceHash
    ) external onlyOwner {
        emit AgentDecision(agentId, action, reason, evidenceHash, block.timestamp);
    }

    /// @notice Start a two-step ownership transfer.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Accept ownership after the current owner nominates the caller.
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        address previousOwner = owner;
        owner = msg.sender;
        pendingOwner = address(0);
        emit OwnershipTransferred(previousOwner, msg.sender);
    }

    /// @notice User's total value in token
    function userValue(address user) external view returns (uint256) {
        return shares[user] * _sharePrice() / 1e18;
    }

    /// @notice Shares minted for a deposit at current price.
    function previewDeposit(uint256 amount) external view returns (uint256) {
        if (totalShares == 0) return amount;
        return amount * totalShares / totalAssets;
    }

    /// @notice Token amount returned for burning shares at current price.
    function previewWithdraw(uint256 shareAmount) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return shareAmount * totalAssets / totalShares;
    }

    /// @notice Current share price in token decimals (1e18 precision)
    function _sharePrice() internal view returns (uint256) {
        if (totalShares == 0) return 1e18;
        return totalAssets * 1e18 / totalShares;
    }

    /// @notice Public share price view
    function sharePrice() external view returns (uint256) {
        return _sharePrice();
    }

    /// @notice Total token balance held by this contract
    function vaultBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}

/// @notice Minimal ERC-20 interface for the token we accept
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/// @notice Dependency-free ERC-20 safety wrapper supporting non-standard tokens.
library SafeERC20Lite {
    function safeTransfer(address token, address to, uint256 amount) internal {
        _call(token, abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
    }

    function safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        _call(token, abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount));
    }

    function _call(address token, bytes memory data) private {
        (bool ok, bytes memory returndata) = token.call(data);
        require(ok, "ERC20 call failed");
        require(returndata.length == 0 || abi.decode(returndata, (bool)), "ERC20 operation failed");
    }
}

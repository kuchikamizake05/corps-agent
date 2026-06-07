// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {Treasury} from "../src/Treasury.sol";

/// @notice Minimal ERC-20 for testing
contract TestToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract TreasuryV2Test is Test {
    Treasury public treasury;
    TestToken public token;

    event AgentDecision(
        uint256 indexed agentId,
        string action,
        string reason,
        bytes32 evidenceHash,
        uint256 timestamp
    );

    address CEO = makeAddr("ceo");
    address USER_A = makeAddr("user_a");
    address USER_B = makeAddr("user_b");
    address TRADER = makeAddr("trader");

    uint256 constant INITIAL = 1000e18; // 1000 tokens

    function setUp() public {
        token = new TestToken();

        // Mint tokens to users
        token.mint(CEO, INITIAL);
        token.mint(USER_A, INITIAL);
        token.mint(USER_B, INITIAL);
        token.mint(TRADER, INITIAL);

        vm.prank(CEO);
        treasury = new Treasury(address(token));

        // Approve treasury for all
        vm.prank(CEO);
        token.approve(address(treasury), type(uint256).max);
        vm.prank(USER_A);
        token.approve(address(treasury), type(uint256).max);
        vm.prank(USER_B);
        token.approve(address(treasury), type(uint256).max);
        vm.prank(TRADER);
        token.approve(address(treasury), type(uint256).max);
    }

    // ── Initial state ──

    function test_Owner() public view {
        assertEq(treasury.owner(), CEO);
    }

    function test_Token() public view {
        assertEq(address(treasury.token()), address(token));
    }

    // ── Deposit ──

    function test_Deposit() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        assertEq(treasury.totalShares(), 100e18);
        assertEq(treasury.totalAssets(), 100e18);
        assertEq(treasury.shares(USER_A), 100e18);
    }

    function test_DepositMultiple() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        vm.prank(USER_B);
        treasury.deposit(200e18);

        assertEq(treasury.totalShares(), 300e18);
        assertEq(treasury.totalAssets(), 300e18);
        assertEq(treasury.shares(USER_A), 100e18);
        assertEq(treasury.shares(USER_B), 200e18);
    }

    function test_SharePriceInitial() public view {
        assertEq(treasury.sharePrice(), 1e18); // 1:1 initially
    }

    // ── Profit & Fee ──

    function test_RecordProfit() public {
        // User deposits
        vm.prank(USER_A);
        treasury.deposit(100e18);

        // Trader sends profit to treasury
        vm.prank(TRADER);
        token.transfer(address(treasury), 50e18); // 50 token profit

        // CEO records profit
        vm.prank(CEO);
        treasury.recordProfit();

        uint256 expectedFee = 50e18 * 5 / 100; // 2.5
        uint256 expectedAssets = 100e18 + 47.5e18; // net profit after 5% fee

        assertEq(treasury.totalAssets(), expectedAssets);
        assertEq(treasury.pendingOwnerFee(), expectedFee);
    }

    function test_SharePriceAfterProfit() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        vm.prank(TRADER);
        token.transfer(address(treasury), 50e18);

        vm.prank(CEO);
        treasury.recordProfit();

        // After 5% fee (2.5), net profit to pool = 47.5
        // Share price = 150 * 1e18 / 100 = 1.5e18 (before fee deduction? no, fee is pending)
        // Actually totalAssets = 150, totalShares = 100
        // sharePrice = 150/100 = 1.5e18
        assertEq(treasury.sharePrice(), 1.475e18);
    }

    function test_UserValueAfterProfit() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        vm.prank(TRADER);
        token.transfer(address(treasury), 50e18);

        vm.prank(CEO);
        treasury.recordProfit();

        // User A has 100 shares, share price 1.5
        // userValue = 100 * 1.5 = 150
        assertEq(treasury.userValue(USER_A), 147.5e18);
    }

    function test_PreviewDepositAndWithdraw() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        vm.prank(TRADER);
        token.transfer(address(treasury), 50e18);

        vm.prank(CEO);
        treasury.recordProfit();

        assertEq(treasury.previewDeposit(147.5e18), 100e18);
        assertEq(treasury.previewWithdraw(100e18), 147.5e18);
    }

    function test_RecordAgentDecision() public {
        bytes32 evidence = keccak256("audit-pass");

        vm.expectEmit(true, false, false, true);
        emit AgentDecision(310, "recordProfit", "cycleComplete", evidence, block.timestamp);

        vm.prank(CEO);
        treasury.recordAgentDecision(310, "recordProfit", "cycleComplete", evidence);
    }

    // ── Withdraw ──

    function test_Withdraw() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        uint256 userTokenBefore = token.balanceOf(USER_A);

        vm.prank(USER_A);
        treasury.withdraw(50e18); // withdraw half

        assertEq(treasury.shares(USER_A), 50e18);
        assertEq(treasury.totalShares(), 50e18);
        assertEq(treasury.totalAssets(), 50e18);
        assertEq(token.balanceOf(USER_A), userTokenBefore + 50e18);
    }

    function test_WithdrawFull() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        vm.prank(TRADER);
        token.transfer(address(treasury), 50e18);

        vm.prank(CEO);
        treasury.recordProfit();

        uint256 userTokenBefore = token.balanceOf(USER_A);

        vm.prank(USER_A);
        treasury.withdraw(100e18); // burn all shares

        // User should get 150 tokens (100 deposit + 47.5 profit share + 2.5? no, fee is 5% of profit)
        // Wait, 50 profit - 2.5 fee = 47.5 remaining for pool
        // User has 100/100 = 100% of pool
        // So user gets 100 deposit + 47.5 profit = 147.5?
        // Actually totalAssets = 150, shares = 100
        // For 100 shares: 100 * 150 / 100 = 150 tokens
        // But fee hasn't been claimed yet. It's in pendingOwnerFee.
        // So yes, user gets 150. The fee is just a pending amount the owner can claim.
        // The 150 represents totalAssets which includes the fee. When owner claims fee,
        // totalAssets decreases by the claimed amount.
        assertEq(token.balanceOf(USER_A), userTokenBefore + 147.5e18);
    }


    // ── Payouts ──

    function test_Payout() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        uint256 recipientBefore = token.balanceOf(USER_B);

        vm.prank(CEO);
        treasury.payout(USER_B, 10e18, "Community vendor payout");

        assertEq(treasury.totalAssets(), 90e18);
        assertEq(token.balanceOf(USER_B), recipientBefore + 10e18);
        assertEq(treasury.sharePrice(), 0.9e18);
    }

    function test_RevertIf_NotOwnerPayout() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        vm.prank(USER_A);
        vm.expectRevert("Only owner");
        treasury.payout(USER_B, 10e18, "bad");
    }

    function test_RevertIf_PayoutTooLarge() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        vm.prank(CEO);
        vm.expectRevert("Insufficient assets");
        treasury.payout(USER_B, 101e18, "too much");
    }

    // ── Fee Claim ──

    function test_ClaimFee() public {
        vm.prank(USER_A);
        treasury.deposit(100e18);

        vm.prank(TRADER);
        token.transfer(address(treasury), 50e18);

        vm.prank(CEO);
        treasury.recordProfit();

        uint256 ceoBefore = token.balanceOf(CEO);
        uint256 expectedFee = 50e18 * 5 / 100; // 2.5

        vm.prank(CEO);
        treasury.claimFee();

        assertEq(treasury.pendingOwnerFee(), 0);
        assertEq(token.balanceOf(CEO), ceoBefore + expectedFee);
    }

    // ── Edge cases ──

    function test_RevertIf_ZeroDeposit() public {
        vm.prank(USER_A);
        vm.expectRevert("Zero amount");
        treasury.deposit(0);
    }

    function test_RevertIf_ZeroWithdraw() public {
        vm.prank(USER_A);
        vm.expectRevert("Zero shares");
        treasury.withdraw(0);
    }

    function test_RevertIf_InsufficientShares() public {
        vm.prank(USER_A);
        vm.expectRevert("Insufficient shares");
        treasury.withdraw(1e18);
    }

    function test_RevertIf_NotOwnerRecordProfit() public {
        vm.prank(USER_A);
        vm.expectRevert("Only owner");
        treasury.recordProfit();
    }

    function test_RevertIf_NoProfit() public {
        vm.prank(CEO);
        vm.expectRevert("No profit to record");
        treasury.recordProfit();
    }
}

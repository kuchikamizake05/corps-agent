// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {Treasury} from "../src/Treasury.sol";

contract TreasuryTest is Test {
    Treasury public treasury;

    address CEO = makeAddr("ceo");
    address TRADER = makeAddr("trader");
    address DEVOPS = makeAddr("devops");
    address EXTERNAL = makeAddr("external");

    function setUp() public {
        vm.prank(CEO);
        treasury = new Treasury();
    }

    function test_Owner() public view {
        assertEq(treasury.owner(), CEO);
    }

    function test_Deposit() public {
        vm.deal(CEO, 10 ether);
        vm.prank(CEO);
        payable(address(treasury)).call{value: 1 ether}("");

        assertEq(treasury.getBalance(), 1 ether);
        assertEq(treasury.balances(CEO), 1 ether);
        assertEq(treasury.getTxCount(), 1);
    }

    function test_DepositAndAllocate() public {
        // CEO deposit 10 CELO
        vm.deal(CEO, 10 ether);
        vm.prank(CEO);
        payable(address(treasury)).call{value: 10 ether}("");

        // CEO allocate 3 CELO ke Trader
        vm.prank(CEO);
        treasury.allocate(TRADER, 3 ether);

        assertEq(treasury.balances(CEO), 7 ether);
        assertEq(treasury.balances(TRADER), 3 ether);
        assertEq(treasury.getTxCount(), 2);
    }

    function test_Release() public {
        vm.deal(CEO, 10 ether);
        vm.prank(CEO);
        payable(address(treasury)).call{value: 5 ether}("");

        uint256 beforeBalance = EXTERNAL.balance;

        vm.prank(CEO);
        treasury.release(payable(EXTERNAL), 2 ether);

        assertEq(EXTERNAL.balance - beforeBalance, 2 ether);
        assertEq(treasury.getBalance(), 3 ether);
        assertEq(treasury.getTxCount(), 2);
    }

    function test_RevertIf_NotOwner() public {
        vm.deal(CEO, 10 ether);
        vm.prank(CEO);
        payable(address(treasury)).call{value: 10 ether}("");

        vm.prank(TRADER);
        vm.expectRevert("Only CEO can call this");
        treasury.allocate(DEVOPS, 1 ether);
    }

    function test_RevertIf_ZeroDeposit() public {
        vm.deal(CEO, 1 ether);
        vm.prank(CEO);
        (bool ok,) = address(treasury).call{value: 0}("");
        assertFalse(ok);
    }

    function test_GetTxHistory() public {
        vm.deal(CEO, 10 ether);
        vm.prank(CEO);
        payable(address(treasury)).call{value: 5 ether}("");

        vm.prank(CEO);
        treasury.allocate(TRADER, 2 ether);

        Treasury.Tx[] memory txs = treasury.getTxHistory(0, 10);
        assertEq(txs.length, 2);
        assertEq(keccak256(bytes(txs[0].txType)), keccak256(bytes("deposit")));
        assertEq(keccak256(bytes(txs[1].txType)), keccak256(bytes("allocate")));
    }

    function test_EmptyTxHistory() public view {
        Treasury.Tx[] memory txs = treasury.getTxHistory(0, 10);
        assertEq(txs.length, 0);
    }
}

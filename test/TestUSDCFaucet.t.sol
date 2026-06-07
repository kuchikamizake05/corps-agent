// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {TestERC20} from "../src/TestERC20.sol";
import {TestUSDCFaucet} from "../src/TestUSDCFaucet.sol";

contract TestUSDCFaucetTest is Test {
    TestERC20 token;
    TestUSDCFaucet faucet;

    address user = makeAddr("user");

    function setUp() public {
        token = new TestERC20();
        faucet = new TestUSDCFaucet(address(token));
    }

    function test_ClaimMints100tUSDC() public {
        vm.prank(user);
        faucet.claim();

        assertEq(token.balanceOf(user), 100e6);
        assertEq(faucet.lastClaimAt(user), block.timestamp);
        assertEq(faucet.nextClaimTime(user), block.timestamp + 1 hours);
        assertFalse(faucet.canClaim(user));
    }

    function test_RevertDuringCooldown() public {
        vm.prank(user);
        faucet.claim();

        vm.warp(block.timestamp + 59 minutes);
        vm.prank(user);
        vm.expectRevert("Cooldown active");
        faucet.claim();
    }

    function test_CanClaimAfterCooldown() public {
        vm.prank(user);
        faucet.claim();

        vm.warp(block.timestamp + 1 hours);
        assertTrue(faucet.canClaim(user));

        vm.prank(user);
        faucet.claim();

        assertEq(token.balanceOf(user), 200e6);
    }
}

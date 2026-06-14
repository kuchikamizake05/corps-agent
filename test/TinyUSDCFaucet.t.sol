// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {TestERC20} from "../src/TestERC20.sol";
import {TinyUSDCFaucet} from "../src/TinyUSDCFaucet.sol";

contract TinyUSDCFaucetTest is Test {
    TestERC20 token;
    TinyUSDCFaucet faucet;

    address user = makeAddr("user");

    function setUp() public {
        token = new TestERC20();
        faucet = new TinyUSDCFaucet(address(token));
    }

    function test_ClaimMints100tUSDCWithoutCooldown() public {
        assertTrue(faucet.canClaim(user));
        assertEq(faucet.nextClaimTime(user), 0);

        vm.prank(user);
        faucet.claim();

        assertEq(token.balanceOf(user), 100e6);
        assertTrue(faucet.canClaim(user));

        vm.prank(user);
        faucet.claim();

        assertEq(token.balanceOf(user), 200e6);
    }
}

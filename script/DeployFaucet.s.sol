// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {TestUSDCFaucet} from "../src/TestUSDCFaucet.sol";

contract DeployFaucet is Script {
    function run() external {
        uint256 pk = vm.envUint("CEO_PRIVATE_KEY");
        address token = vm.envAddress("TOKEN");

        vm.startBroadcast(pk);
        TestUSDCFaucet faucet = new TestUSDCFaucet(token);
        vm.stopBroadcast();

        console2.log("TestUSDCFaucet:", address(faucet));
        console2.log("Token:", token);
        console2.log("Claim amount:", faucet.CLAIM_AMOUNT());
        console2.log("Cooldown:", faucet.COOLDOWN());
    }
}

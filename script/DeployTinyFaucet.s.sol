// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {TinyUSDCFaucet} from "../src/TinyUSDCFaucet.sol";

contract DeployTinyFaucet is Script {
    function run() external {
        uint256 pk = vm.envUint("CEO_PRIVATE_KEY");
        address token = vm.envAddress("TOKEN");

        vm.startBroadcast(pk);
        TinyUSDCFaucet faucet = new TinyUSDCFaucet(token);
        vm.stopBroadcast();

        console2.log("TinyUSDCFaucet:", address(faucet));
        console2.log("Token:", token);
    }
}

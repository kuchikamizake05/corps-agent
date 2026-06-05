// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {Treasury} from "../src/Treasury.sol";

contract DeployTreasury is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("CEO_PRIVATE_KEY");

        // USDm on Celo Sepolia testnet
        address usdm = 0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b;

        console2.log("Deploying Treasury.sol v2...");
        console2.log("Deployer (CEO):", vm.addr(deployerPrivateKey));
        console2.log("Token: USDm at", usdm);

        vm.startBroadcast(deployerPrivateKey);

        Treasury treasury = new Treasury(usdm);

        vm.stopBroadcast();

        console2.log("Treasury v2 deployed at:", address(treasury));
    }
}

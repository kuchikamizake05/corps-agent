// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {Treasury} from "../src/Treasury.sol";

contract DeployTreasury is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("CEO_PRIVATE_KEY");
        
        console2.log("Deploying Treasury.sol...");
        console2.log("Deployer (CEO):", vm.addr(deployerPrivateKey));

        vm.startBroadcast(deployerPrivateKey);

        Treasury treasury = new Treasury();

        vm.stopBroadcast();

        console2.log("Treasury deployed at:", address(treasury));
    }
}

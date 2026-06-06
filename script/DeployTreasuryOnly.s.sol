// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {Treasury} from "../src/Treasury.sol";

contract DeployTreasuryOnly is Script {
    function run() external {
        uint256 pk = vm.envUint("CEO_PRIVATE_KEY");
        address token = vm.envAddress("TOKEN");

        vm.startBroadcast(pk);
        Treasury treasury = new Treasury(token);
        console2.log("Treasury v3:", address(treasury));
        console2.log("Token:", token);
        vm.stopBroadcast();
    }
}

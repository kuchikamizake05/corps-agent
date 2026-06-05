// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {TestERC20} from "../src/TestERC20.sol";
import {Treasury} from "../src/Treasury.sol";

contract DeployAll is Script {
    function run() external {
        uint256 pk = vm.envUint("CEO_PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        // 1. Deploy test token
        TestERC20 token = new TestERC20();
        console2.log("TestERC20:", address(token));

        // 2. Mint to wallets
        token.mint(vm.envAddress("TRADER_ADDRESS"), 100 * 1e18);
        token.mint(deployer, 1000 * 1e18);
        token.mint(vm.envAddress("DEVOPS_ADDRESS"), 10 * 1e18);
        console2.log("Minted: Trader 100, CEO 1000, DevOps 10");

        // 3. Deploy Treasury v2 with test token
        Treasury treasury = new Treasury(address(token));
        console2.log("Treasury v2:", address(treasury));

        vm.stopBroadcast();
    }
}

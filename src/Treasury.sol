// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Treasury - Multi-agent company treasury on Celo
/// @notice Holds funds, allocates to sub-agents, tracks all transactions
contract Treasury {
    address public owner;

    struct Tx {
        string txType;       // "deposit", "allocate", "release"
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => uint256) public balances;
    Tx[] public txHistory;

    event Deposit(address indexed from, uint256 amount);
    event Allocated(address indexed to, uint256 amount);
    event Released(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only CEO can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Accept CELO deposits
    receive() external payable {
        require(msg.value > 0, "Zero deposit");
        balances[msg.sender] += msg.value;
        txHistory.push(Tx("deposit", msg.sender, address(this), msg.value, block.timestamp));
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice CEO allocates funds to a sub-agent wallet
    /// @param to Sub-agent address
    /// @param amount Amount in wei
    function allocate(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Zero amount");
        require(balances[owner] >= amount, "Insufficient balance");

        balances[owner] -= amount;
        balances[to] += amount;
        txHistory.push(Tx("allocate", owner, to, amount, block.timestamp));
        emit Allocated(to, amount);
    }

    /// @notice CEO releases payment to an external address
    /// @param to Recipient address
    /// @param amount Amount in wei
    function release(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Zero amount");
        require(address(this).balance >= amount, "Insufficient treasury");

        balances[owner] -= amount;
        to.transfer(amount);
        txHistory.push(Tx("release", owner, to, amount, block.timestamp));
        emit Released(to, amount);
    }

    /// @notice Get total CELO balance of this contract
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Get transaction count
    function getTxCount() external view returns (uint256) {
        return txHistory.length;
    }

    /// @notice Get paginated transaction history
    /// @param offset Start index
    /// @param limit Max items
    function getTxHistory(uint256 offset, uint256 limit)
        external
        view
        returns (Tx[] memory)
    {
        uint256 total = txHistory.length;
        if (offset >= total) return new Tx[](0);
        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 count = end - offset;
        Tx[] memory result = new Tx[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = txHistory[offset + i];
        }
        return result;
    }
}

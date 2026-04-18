// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBehaviorToken {
    event TokensMinted(
        address indexed to,
        uint256 amount,
        string action
    );

    function mint(address to, uint256 amount, string calldata action) external;
}

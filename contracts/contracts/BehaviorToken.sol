// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBehaviorToken.sol";

/**
 * @title BehaviorToken
 * @notice Soulbound (non-transferable) ERC-20 token awarded for positive financial behavior.
 * @dev Overrides _update to block all transfers except minting.
 */
contract BehaviorToken is ERC20, Ownable, IBehaviorToken {
    // ========================================================================
    // Errors
    // ========================================================================

    error OnlyOracle();
    error SoulboundNonTransferable();
    error ZeroAddress();

    // ========================================================================
    // State
    // ========================================================================

    address public oracle;

    // ========================================================================
    // Modifiers
    // ========================================================================

    modifier onlyOracle() {
        if (msg.sender != oracle) revert OnlyOracle();
        _;
    }

    // ========================================================================
    // Constructor
    // ========================================================================

    constructor(
        address _oracle
    ) ERC20("TrustLedger Behavior Token", "TBT") Ownable(msg.sender) {
        if (_oracle == address(0)) revert ZeroAddress();
        oracle = _oracle;
    }

    // ========================================================================
    // Admin
    // ========================================================================

    function setOracle(address _newOracle) external onlyOwner {
        if (_newOracle == address(0)) revert ZeroAddress();
        oracle = _newOracle;
    }

    // ========================================================================
    // Soulbound: block all transfers except mints
    // ========================================================================

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        // Allow minting (from == address(0)) but block everything else
        if (from != address(0)) revert SoulboundNonTransferable();
        super._update(from, to, value);
    }

    // ========================================================================
    // Oracle actions
    // ========================================================================

    function mint(
        address to,
        uint256 amount,
        string calldata action
    ) external onlyOracle {
        if (to == address(0)) revert ZeroAddress();
        _mint(to, amount);
        emit TokensMinted(to, amount, action);
    }

    // ========================================================================
    // Overrides
    // ========================================================================

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}

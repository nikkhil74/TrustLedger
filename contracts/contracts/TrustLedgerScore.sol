// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITrustLedgerScore.sol";

/**
 * @title TrustLedgerScore
 * @notice Stores credit score attestations on-chain. Only the trusted oracle can write scores.
 * @dev Scores are stored as uint16 (300-900) with a keccak256 attestation hash.
 */
contract TrustLedgerScore is ITrustLedgerScore, Ownable {
    // ========================================================================
    // Errors
    // ========================================================================

    error OnlyOracle();
    error InvalidScore(uint16 score);
    error ZeroAddress();

    // ========================================================================
    // State
    // ========================================================================

    address public oracle;
    mapping(address => ScoreAttestation) private _scores;

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

    constructor(address _oracle) Ownable(msg.sender) {
        if (_oracle == address(0)) revert ZeroAddress();
        oracle = _oracle;
    }

    // ========================================================================
    // Admin
    // ========================================================================

    function setOracle(address _newOracle) external onlyOwner {
        if (_newOracle == address(0)) revert ZeroAddress();
        address old = oracle;
        oracle = _newOracle;
        emit OracleUpdated(old, _newOracle);
    }

    // ========================================================================
    // Oracle writes
    // ========================================================================

    function updateScore(
        address user,
        uint16 score,
        bytes32 attestationHash
    ) external onlyOracle {
        if (user == address(0)) revert ZeroAddress();
        if (score < 300 || score > 900) revert InvalidScore(score);

        uint64 ts = uint64(block.timestamp);
        _scores[user] = ScoreAttestation({
            score: score,
            timestamp: ts,
            attestationHash: attestationHash
        });

        emit ScoreUpdated(user, score, ts, attestationHash);
    }

    // ========================================================================
    // Public reads
    // ========================================================================

    function getScore(
        address user
    )
        external
        view
        returns (uint16 score, uint64 timestamp, bytes32 attestationHash)
    {
        ScoreAttestation storage att = _scores[user];
        return (att.score, att.timestamp, att.attestationHash);
    }

    function verifyScoreAbove(
        address user,
        uint16 threshold
    ) external view returns (bool) {
        ScoreAttestation storage att = _scores[user];
        return att.timestamp != 0 && att.score >= threshold;
    }
}

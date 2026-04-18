// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITrustLedgerScore {
    struct ScoreAttestation {
        uint16 score;
        uint64 timestamp;
        bytes32 attestationHash;
    }

    event ScoreUpdated(
        address indexed user,
        uint16 score,
        uint64 timestamp,
        bytes32 attestationHash
    );

    event OracleUpdated(address indexed oldOracle, address indexed newOracle);

    function updateScore(
        address user,
        uint16 score,
        bytes32 attestationHash
    ) external;

    function getScore(
        address user
    )
        external
        view
        returns (uint16 score, uint64 timestamp, bytes32 attestationHash);

    function verifyScoreAbove(
        address user,
        uint16 threshold
    ) external view returns (bool);
}

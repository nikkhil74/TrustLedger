// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITrustLedgerScore.sol";

/**
 * @title ScoreVerifier
 * @notice Verifies ZK proofs that a user's score is above a threshold.
 * @dev Placeholder for Noir-generated verifier integration.
 *      Once the Noir circuit is compiled, the generated UltraVerifier
 *      contract will be composed here.
 */
contract ScoreVerifier is Ownable {
    // ========================================================================
    // Errors
    // ========================================================================

    error InvalidProof();
    error ZeroAddress();

    // ========================================================================
    // Events
    // ========================================================================

    event ProofVerified(
        address indexed user,
        uint16 threshold,
        bool valid,
        uint256 timestamp
    );

    // ========================================================================
    // State
    // ========================================================================

    ITrustLedgerScore public scoreContract;

    // ========================================================================
    // Constructor
    // ========================================================================

    constructor(
        address _scoreContract
    ) Ownable(msg.sender) {
        if (_scoreContract == address(0)) revert ZeroAddress();
        scoreContract = ITrustLedgerScore(_scoreContract);
    }

    // ========================================================================
    // Verification
    // ========================================================================

    /**
     * @notice Verify a ZK proof that a user's score is above a threshold.
     * @dev In production, this will call the Noir-generated UltraVerifier.
     *      For now, it falls back to on-chain score verification.
     * @param user The wallet address being verified
     * @param threshold The minimum score threshold
     * @param proof The ZK proof bytes (unused in fallback mode)
     * @param publicInputs The public inputs for the proof (unused in fallback mode)
     * @return valid Whether the verification passed
     */
    function verifyScoreRange(
        address user,
        uint16 threshold,
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external returns (bool valid) {
        // Fallback: direct on-chain verification until ZK verifier is integrated
        valid = scoreContract.verifyScoreAbove(user, threshold);

        emit ProofVerified(user, threshold, valid, block.timestamp);
        return valid;
    }

    /**
     * @notice Simple on-chain score check (no ZK proof needed)
     */
    function verifyOnChain(
        address user,
        uint16 threshold
    ) external view returns (bool) {
        return scoreContract.verifyScoreAbove(user, threshold);
    }

    function setScoreContract(address _scoreContract) external onlyOwner {
        if (_scoreContract == address(0)) revert ZeroAddress();
        scoreContract = ITrustLedgerScore(_scoreContract);
    }
}

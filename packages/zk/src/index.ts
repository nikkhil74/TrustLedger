/**
 * @trustledger/zk — Zero-Knowledge Proof utilities for TrustLedger
 *
 * Provides TypeScript wrappers around the Noir ZK circuit for
 * score range proofs. In production, this integrates with nargo
 * CLI or @noir-lang/noir_js for in-browser proving.
 */

export { generateScoreRangeProof, type ProofInput, type ProofResult } from './prover.js';
export {
  verifyScoreRangeProof,
  type VerificationInput,
  type VerificationResult,
} from './verifier.js';
export { computeScoreCommitment, generateSalt } from './commitment.js';
export { CIRCUIT_CONFIG } from './config.js';

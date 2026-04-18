import { computeScoreCommitment, generateSalt } from './commitment.js';
import { CIRCUIT_CONFIG } from './config.js';

export interface ProofInput {
  /** The actual credit score (private, 300-900) */
  score: number;
  /** Minimum threshold to prove score >= min (public) */
  minThreshold: number;
  /** Maximum threshold to prove score <= max (public) */
  maxThreshold: number;
}

export interface ProofResult {
  /** The generated ZK proof (hex-encoded) */
  proof: string;
  /** Public inputs used in the proof */
  publicInputs: {
    scoreHash: string;
    minThreshold: number;
    maxThreshold: number;
  };
  /** Salt used for commitment (store securely, needed for future proofs) */
  salt: string;
  /** Whether this is a simulated proof (true until Noir runtime integrated) */
  simulated: boolean;
}

/**
 * Generate a ZK range proof for a credit score.
 *
 * Proves: "My score is in [minThreshold, maxThreshold]"
 * without revealing the actual score.
 *
 * In production, this calls nargo prove or uses @noir-lang/noir_js
 * for in-browser proving. Currently returns a simulated proof
 * structure for integration testing.
 */
export async function generateScoreRangeProof(
  input: ProofInput,
): Promise<ProofResult> {
  const { score, minThreshold, maxThreshold } = input;

  // Validate inputs
  if (score < CIRCUIT_CONFIG.scoreMin || score > CIRCUIT_CONFIG.scoreMax) {
    throw new Error(
      `Score must be between ${CIRCUIT_CONFIG.scoreMin} and ${CIRCUIT_CONFIG.scoreMax}`,
    );
  }
  if (minThreshold > maxThreshold) {
    throw new Error('minThreshold must be <= maxThreshold');
  }
  if (score < minThreshold || score > maxThreshold) {
    throw new Error(
      'Score is not within the requested proof range — proof would be invalid',
    );
  }

  // Generate commitment
  const salt = generateSalt();
  const scoreHash = computeScoreCommitment(score, salt);

  // In production: call Noir prover here
  // const noir = new Noir(circuit);
  // const proof = await noir.generateProof({
  //   score, salt, score_hash: scoreHash, min_threshold: minThreshold, max_threshold: maxThreshold
  // });

  // Simulated proof for integration
  const proofData = JSON.stringify({
    circuit: CIRCUIT_CONFIG.circuitName,
    publicInputs: { scoreHash, minThreshold, maxThreshold },
    timestamp: Date.now(),
    version: '0.1.0-simulated',
  });

  const proof =
    '0x' + Buffer.from(proofData).toString('hex');

  return {
    proof,
    publicInputs: {
      scoreHash,
      minThreshold,
      maxThreshold,
    },
    salt,
    simulated: true,
  };
}

import { CIRCUIT_CONFIG } from './config.js';

export interface VerificationInput {
  /** The ZK proof to verify (hex-encoded) */
  proof: string;
  /** Public inputs that the proof claims */
  publicInputs: {
    scoreHash: string;
    minThreshold: number;
    maxThreshold: number;
  };
}

export interface VerificationResult {
  /** Whether the proof is valid */
  valid: boolean;
  /** Reason if invalid */
  reason?: string;
  /** Whether this was a simulated verification */
  simulated: boolean;
}

/**
 * Verify a ZK range proof.
 *
 * In production, this calls nargo verify or the on-chain
 * ScoreVerifier contract. Currently performs structural validation
 * on simulated proofs.
 */
export async function verifyScoreRangeProof(
  input: VerificationInput,
): Promise<VerificationResult> {
  const { proof, publicInputs } = input;

  // Validate public inputs
  if (
    publicInputs.minThreshold < CIRCUIT_CONFIG.scoreMin ||
    publicInputs.maxThreshold > CIRCUIT_CONFIG.scoreMax
  ) {
    return {
      valid: false,
      reason: 'Threshold out of valid score range',
      simulated: true,
    };
  }

  if (publicInputs.minThreshold > publicInputs.maxThreshold) {
    return {
      valid: false,
      reason: 'minThreshold > maxThreshold',
      simulated: true,
    };
  }

  if (!proof.startsWith('0x') || proof.length < 10) {
    return {
      valid: false,
      reason: 'Invalid proof format',
      simulated: true,
    };
  }

  // In production: call Noir verifier here
  // const noir = new Noir(circuit);
  // const isValid = await noir.verifyProof(proof, publicInputs);

  // Simulated verification: decode and check structure
  try {
    const proofBytes = Buffer.from(proof.slice(2), 'hex');
    const proofData = JSON.parse(proofBytes.toString()) as {
      circuit: string;
      publicInputs: {
        scoreHash: string;
        minThreshold: number;
        maxThreshold: number;
      };
    };

    if (proofData.circuit !== CIRCUIT_CONFIG.circuitName) {
      return {
        valid: false,
        reason: 'Circuit name mismatch',
        simulated: true,
      };
    }

    // Verify public inputs match
    if (
      proofData.publicInputs.scoreHash !== publicInputs.scoreHash ||
      proofData.publicInputs.minThreshold !== publicInputs.minThreshold ||
      proofData.publicInputs.maxThreshold !== publicInputs.maxThreshold
    ) {
      return {
        valid: false,
        reason: 'Public inputs mismatch',
        simulated: true,
      };
    }

    return { valid: true, simulated: true };
  } catch {
    return {
      valid: false,
      reason: 'Failed to decode proof',
      simulated: true,
    };
  }
}

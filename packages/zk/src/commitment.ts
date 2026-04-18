import { createHash, randomBytes } from 'crypto';

/**
 * Generate a cryptographic salt for score commitment.
 * Uses 32 bytes of randomness.
 */
export function generateSalt(): string {
  return '0x' + randomBytes(32).toString('hex');
}

/**
 * Compute a Pedersen-like commitment to a score.
 *
 * In production, this should match the Noir circuit's
 * `std::hash::pedersen_hash([score, salt])`. For now, we use
 * a SHA-256 based commitment as a placeholder that can be
 * verified off-chain. The on-chain ScoreVerifier contract
 * will verify the actual Noir proof.
 */
export function computeScoreCommitment(
  score: number,
  salt: string,
): string {
  const hash = createHash('sha256')
    .update(`${score}:${salt}`)
    .digest('hex');
  return '0x' + hash;
}

/**
 * Verify a score commitment matches expected values.
 */
export function verifyScoreCommitment(
  score: number,
  salt: string,
  expectedHash: string,
): boolean {
  const computed = computeScoreCommitment(score, salt);
  return computed === expectedHash;
}

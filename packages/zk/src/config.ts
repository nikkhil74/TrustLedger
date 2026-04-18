/**
 * Circuit configuration constants.
 */
export const CIRCUIT_CONFIG = {
  /** Name of the Noir circuit */
  circuitName: 'score_range_proof',

  /** Path to circuit relative to package root */
  circuitPath: '../circuits/score_range_proof',

  /** Valid score range */
  scoreMin: 300,
  scoreMax: 900,

  /** Standard tier thresholds for common proofs */
  tiers: {
    excellent: { min: 800, max: 900 },
    good: { min: 700, max: 900 },
    fair: { min: 600, max: 900 },
    aboveAverage: { min: 450, max: 900 },
  },
} as const;

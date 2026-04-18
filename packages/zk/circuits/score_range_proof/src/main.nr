// Noir circuit for TrustLedger score range proof
//
// Proves: "My credit score is within [min_threshold, max_threshold]"
// WITHOUT revealing the actual score.
//
// Public inputs:  score_hash, min_threshold, max_threshold
// Private inputs: score, salt
//
// The prover demonstrates:
// 1. score >= min_threshold
// 2. score <= max_threshold
// 3. hash(score, salt) == score_hash (binds the proof to a committed score)

fn main(
    // Private inputs (known only to prover)
    score: u32,
    salt: Field,
    // Public inputs (visible to verifier)
    score_hash: pub Field,
    min_threshold: pub u32,
    max_threshold: pub u32,
) {
    // Constraint 1: Score is within valid global range [300, 900]
    assert(score >= 300, "Score below minimum (300)");
    assert(score <= 900, "Score above maximum (900)");

    // Constraint 2: Score is within the requested proof range
    assert(score >= min_threshold, "Score below min_threshold");
    assert(score <= max_threshold, "Score above max_threshold");

    // Constraint 3: Score commitment matches
    // Hash the score with a salt to create a binding commitment
    let score_field = score as Field;
    let computed_hash = std::hash::pedersen_hash([score_field, salt]);
    assert(computed_hash == score_hash, "Score commitment mismatch");
}

#[test]
fn test_valid_score_in_range() {
    // Score 742 should prove it's in range [700, 900]
    let score: u32 = 742;
    let salt = 12345;
    let score_hash = std::hash::pedersen_hash([score as Field, salt]);

    main(score, salt, score_hash, 700, 900);
}

#[test]
fn test_score_at_boundaries() {
    // Score exactly at min threshold
    let score: u32 = 700;
    let salt = 99999;
    let score_hash = std::hash::pedersen_hash([score as Field, salt]);

    main(score, salt, score_hash, 700, 900);
}

#[test(should_fail)]
fn test_score_below_range() {
    // Score 650 should fail range [700, 900]
    let score: u32 = 650;
    let salt = 12345;
    let score_hash = std::hash::pedersen_hash([score as Field, salt]);

    main(score, salt, score_hash, 700, 900);
}

#[test(should_fail)]
fn test_score_above_global_max() {
    // Score 950 should fail (above 900)
    let score: u32 = 950;
    let salt = 12345;
    let score_hash = std::hash::pedersen_hash([score as Field, salt]);

    main(score, salt, score_hash, 300, 950);
}

#[test(should_fail)]
fn test_wrong_commitment() {
    // Wrong salt should cause commitment mismatch
    let score: u32 = 742;
    let salt = 12345;
    let wrong_salt = 99999;
    let score_hash = std::hash::pedersen_hash([score as Field, wrong_salt]);

    main(score, salt, score_hash, 700, 900);
}

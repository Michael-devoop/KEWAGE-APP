export interface MatchingWeights {
  skillCoverage: number;
  proximity: number;
  rating: number;
  responseRate: number;
  experience: number;
}

export interface MatchingConfig {
  radiusKm: number;
  maxCandidates: number;
  /** Minimum share of required skills a worker must have (1 = all). */
  minSkillCoverage: number;
  /** Bayesian rating prior so new workers are not ranked at zero. */
  ratingPrior: number;
  ratingPriorCount: number;
  /** Years of experience that earns full experience points. */
  experienceCeilingYears: number;
  weights: MatchingWeights;
}

/**
 * SRS v1.0 leaves ranking, radius and timeout open.
 * Change these defaults here — no other module needs to know the numbers.
 */
export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  radiusKm: 10,
  maxCandidates: 10,
  minSkillCoverage: 1,
  ratingPrior: 3.5,
  ratingPriorCount: 5,
  experienceCeilingYears: 10,
  weights: {
    skillCoverage: 30,
    proximity: 25,
    rating: 20,
    responseRate: 15,
    experience: 10,
  },
};

export const OFFER_TIMEOUT_MINUTES = 5;
export const MAX_SMS_ATTEMPTS = 3;

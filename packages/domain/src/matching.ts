import { distanceKm } from "./geo";
import { DEFAULT_MATCHING_CONFIG, type MatchingConfig } from "./matching-config";
import type { Job, ScoredWorker, WorkerProfile } from "./types";

export function skillCoverage(required: string[], workerSkills: string[]): number {
  if (required.length === 0) return 0;
  const owned = new Set(workerSkills);
  const matched = required.filter((skill) => owned.has(skill)).length;
  return matched / required.length;
}

export function bayesianRating(
  avg: number,
  count: number,
  prior: number,
  priorCount: number,
): number {
  return (avg * count + prior * priorCount) / (count + priorCount);
}

export function isEligible(
  job: Job,
  worker: WorkerProfile,
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG,
  excludedWorkerIds: string[] = [],
): boolean {
  if (worker.userId === job.clientId) return false;
  if (!worker.availableNow) return false;
  if (excludedWorkerIds.includes(worker.userId)) return false;
  if (skillCoverage(job.skills, worker.skills) < config.minSkillCoverage) return false;
  return distanceKm(job.location, worker.location) <= config.radiusKm;
}

export function scoreWorker(
  job: Job,
  worker: WorkerProfile,
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG,
): ScoredWorker {
  const distance = distanceKm(job.location, worker.location);
  const coverage = skillCoverage(job.skills, worker.skills);
  const proximity = Math.max(0, 1 - distance / config.radiusKm);
  const rating =
    bayesianRating(
      worker.ratingAvg,
      worker.ratingCount,
      config.ratingPrior,
      config.ratingPriorCount,
    ) / 5;
  const experience =
    Math.min(worker.experienceYears, config.experienceCeilingYears) /
    config.experienceCeilingYears;
  const w = config.weights;

  const score =
    w.skillCoverage * coverage +
    w.proximity * proximity +
    w.rating * rating +
    w.responseRate * worker.responseRate +
    w.experience * experience;

  return {
    workerId: worker.userId,
    score: Math.round(score * 100) / 100,
    distanceKm: Math.round(distance * 100) / 100,
    skillCoverage: coverage,
  };
}

export function rankWorkers(
  job: Job,
  workers: WorkerProfile[],
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG,
  excludedWorkerIds: string[] = [],
): ScoredWorker[] {
  return workers
    .filter((worker) => isEligible(job, worker, config, excludedWorkerIds))
    .map((worker) => scoreWorker(job, worker, config))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      return a.workerId.localeCompare(b.workerId);
    })
    .slice(0, config.maxCandidates);
}

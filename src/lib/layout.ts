import type { Plant, LayoutResult } from './types';
import { adj4, scoreGrid } from './score';

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function buildPairSets(plants: Plant[]): { avoidPairs: Set<string>; helpPairs: Set<string> } {
  const avoidPairs = new Set<string>();
  const helpPairs = new Set<string>();

  for (const plant of plants) {
    for (const other of plant.helps) {
      helpPairs.add(pairKey(plant.id, other));
    }
    for (const other of plant.avoid) {
      avoidPairs.add(pairKey(plant.id, other));
    }
  }

  return { avoidPairs, helpPairs };
}

export function computeLayout(
  entries: { plantId: string; count: number }[],
  cols: number,
  rows: number,
  plants: Plant[]
): LayoutResult {
  const total = cols * rows;
  const { avoidPairs, helpPairs } = buildPairSets(plants);

  // Build initial grid: fill blocks left-to-right, sorted by count desc
  const sorted = [...entries].sort((a, b) => b.count - a.count);
  const grid: string[] = new Array(total).fill('');
  let cellIdx = 0;
  for (const { plantId, count } of sorted) {
    for (let i = 0; i < count && cellIdx < total; i++) {
      grid[cellIdx++] = plantId;
    }
  }

  // Simulated annealing
  const T0 = 2.5;
  const Tmin = 0.001;
  const iterations = 10000;
  const cooling = Math.pow(Tmin / T0, 1 / iterations);

  let currentScore = scoreGrid(grid, cols, rows, avoidPairs, helpPairs);
  let T = T0;

  for (let iter = 0; iter < iterations; iter++) {
    const i = Math.floor(Math.random() * total);
    const j = Math.floor(Math.random() * total);
    if (i === j) { T *= cooling; continue; }

    // Swap
    const tmp = grid[i];
    grid[i] = grid[j];
    grid[j] = tmp;

    const newScore = scoreGrid(grid, cols, rows, avoidPairs, helpPairs);
    const delta = newScore - currentScore;

    if (delta > 0 || Math.random() < Math.exp(delta / T)) {
      currentScore = newScore;
    } else {
      // Revert
      grid[j] = grid[i];
      grid[i] = tmp;
    }

    T *= cooling;
  }

  // Compute result arrays
  const companionSet = new Set<string>();
  const conflictSet = new Set<string>();
  const allAvoidSet = new Set<string>();

  for (let i = 0; i < total; i++) {
    const a = grid[i];
    if (!a) continue;
    for (const j of adj4(i, cols, rows)) {
      if (j <= i) continue;
      const b = grid[j];
      if (!b || a === b) continue;
      const key = pairKey(a, b);
      if (helpPairs.has(key)) companionSet.add(key);
      if (avoidPairs.has(key)) conflictSet.add(key);
    }
  }

  // Find avoid pairs that were successfully kept apart
  for (const key of avoidPairs) {
    if (!conflictSet.has(key)) {
      const [a, b] = key.split('|');
      const aPresent = entries.some((e) => e.plantId === a);
      const bPresent = entries.some((e) => e.plantId === b);
      if (aPresent && bPresent) allAvoidSet.add(key);
    }
  }

  const toPlantPair = (key: string): [string, string] => {
    const [a, b] = key.split('|');
    return [a, b];
  };

  return {
    grid,
    cols,
    rows,
    companions: [...companionSet].map(toPlantPair),
    conflicts: [...conflictSet].map(toPlantPair),
    avoided: [...allAvoidSet].map(toPlantPair),
  };
}

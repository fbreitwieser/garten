import type { Plant, ParsedEntry } from './types';
import { normalize, levenshtein } from './match';

function getAllNames(plant: Plant): string[] {
  const names: string[] = [
    normalize(plant.names.en),
    normalize(plant.names.de),
    normalize(plant.names.fr),
    normalize(plant.names.la),
    ...(plant.synonyms ?? []).map(normalize),
  ];
  return names.filter(Boolean);
}

function minDistToPlant(query: string, plant: Plant): number {
  const names = getAllNames(plant);
  return Math.min(...names.map((n) => levenshtein(query, n)));
}

export function parseInput(text: string, plants: Plant[]): ParsedEntry[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);

  return lines.map((line): ParsedEntry => {
    const raw = line.trim();

    // Extract leading integer: "3 Tomaten" or trailing: "Basilikum 2"
    let count = 1;
    let namePart = raw;

    const leadingMatch = raw.match(/^(\d+)\s+(.+)$/);
    const trailingMatch = raw.match(/^(.+?)\s+(\d+)$/);

    if (leadingMatch) {
      count = parseInt(leadingMatch[1], 10);
      namePart = leadingMatch[2].trim();
    } else if (trailingMatch) {
      count = parseInt(trailingMatch[2], 10);
      namePart = trailingMatch[1].trim();
    }

    const query = normalize(namePart);

    // Try exact match across all name fields
    for (const plant of plants) {
      const names = getAllNames(plant);
      if (names.includes(query)) {
        return { plantId: plant.id, count, raw, matched: true, suggestions: [] };
      }
    }

    // Fuzzy match: find plants with levenshtein distance ≤ 3
    const scored = plants
      .map((plant) => ({ plant, dist: minDistToPlant(query, plant) }))
      .filter(({ dist }) => dist <= 3)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    return {
      plantId: null,
      count,
      raw,
      matched: false,
      suggestions: scored.map(({ plant }) => plant.id),
    };
  });
}

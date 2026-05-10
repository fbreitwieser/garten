import type { Plant, ParsedEntry } from './types';
import { normalize, levenshtein } from './match';

function getAllNames(plant: Plant): string[] {
  const raw = [
    plant.names.en,
    plant.names.de,
    plant.names.fr,
    plant.names.la,
    ...(plant.synonyms ?? []),
  ].filter(Boolean);

  const names: string[] = [];
  for (const name of raw) {
    names.push(normalize(name));
    // Also index individual parts of compound names like "Paprika / Chili"
    const parts = name.split(' / ');
    if (parts.length > 1) {
      for (const part of parts) names.push(normalize(part));
    }
  }
  return [...new Set(names)].filter(Boolean);
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

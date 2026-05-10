import type { Plant, LayoutResult } from './types';

export interface ExplanationItem {
  plantA: Plant;
  plantB: Plant;
  relationship: 'companion' | 'conflict' | 'avoided';
  comment?: string;
}

function findPlant(id: string, plants: Plant[]): Plant | undefined {
  return plants.find((p) => p.id === id);
}

function getComment(a: Plant, b: Plant): string | undefined {
  if (a.comments) return a.comments;
  if (b.comments) return b.comments;
  return undefined;
}

export function buildExplanation(result: LayoutResult, plants: Plant[]): ExplanationItem[] {
  const items: ExplanationItem[] = [];

  for (const [idA, idB] of result.companions) {
    const plantA = findPlant(idA, plants);
    const plantB = findPlant(idB, plants);
    if (plantA && plantB) {
      items.push({ plantA, plantB, relationship: 'companion', comment: getComment(plantA, plantB) });
    }
  }

  for (const [idA, idB] of result.conflicts) {
    const plantA = findPlant(idA, plants);
    const plantB = findPlant(idB, plants);
    if (plantA && plantB) {
      items.push({ plantA, plantB, relationship: 'conflict', comment: getComment(plantA, plantB) });
    }
  }

  for (const [idA, idB] of result.avoided) {
    const plantA = findPlant(idA, plants);
    const plantB = findPlant(idB, plants);
    if (plantA && plantB) {
      items.push({ plantA, plantB, relationship: 'avoided', comment: getComment(plantA, plantB) });
    }
  }

  return items;
}

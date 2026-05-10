import type { Plant, LayoutResult } from './types';
import type { Lang } from './i18n';

export interface ExplanationItem {
  plantA: Plant;
  plantB: Plant;
  relationship: 'companion' | 'conflict' | 'avoided';
  comment?: string;
}

function findPlant(id: string, plants: Plant[]): Plant | undefined {
  return plants.find((p) => p.id === id);
}

function extractComment(plant: Plant, lang: Lang): string | undefined {
  const c = plant.comments;
  if (!c) return undefined;
  if (typeof c === 'string') return c || undefined;
  return c[lang] || c.en || undefined;
}

function getComment(a: Plant, b: Plant, lang: Lang): string | undefined {
  return extractComment(a, lang) ?? extractComment(b, lang);
}

export function buildExplanation(result: LayoutResult, plants: Plant[], lang: Lang = 'en'): ExplanationItem[] {
  const items: ExplanationItem[] = [];

  for (const [idA, idB] of result.companions) {
    const plantA = findPlant(idA, plants);
    const plantB = findPlant(idB, plants);
    if (plantA && plantB) {
      items.push({ plantA, plantB, relationship: 'companion', comment: getComment(plantA, plantB, lang) });
    }
  }

  for (const [idA, idB] of result.conflicts) {
    const plantA = findPlant(idA, plants);
    const plantB = findPlant(idB, plants);
    if (plantA && plantB) {
      items.push({ plantA, plantB, relationship: 'conflict', comment: getComment(plantA, plantB, lang) });
    }
  }

  for (const [idA, idB] of result.avoided) {
    const plantA = findPlant(idA, plants);
    const plantB = findPlant(idB, plants);
    if (plantA && plantB) {
      items.push({ plantA, plantB, relationship: 'avoided', comment: getComment(plantA, plantB, lang) });
    }
  }

  return items;
}

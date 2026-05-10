export interface Plant {
  id: string;
  names: { en: string; de: string; fr: string; la: string };
  synonyms?: string[];
  helps: string[];
  avoid: string[];
  comments?: string;
  source?: string;
}

export interface PlantsData {
  version: string;
  plants: Plant[];
}

export interface ParsedEntry {
  plantId: string | null;
  count: number;
  raw: string;
  matched: boolean;
  suggestions: string[];
}

export interface LayoutResult {
  grid: string[];
  cols: number;
  rows: number;
  companions: [string, string][];
  conflicts: [string, string][];
  avoided: [string, string][];
}

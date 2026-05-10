import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENRICHED = resolve(__dirname, '../data/plants.enriched.json');
const OVERRIDES = resolve(__dirname, '../data/plants.overrides.json');
const OUT = resolve(__dirname, '../data/plants.json');

interface EnrichedPlant {
  nameEn: string;
  nameDe: string;
  nameFr: string;
  nameLa: string;
  helps: string[];
  avoid: string[];
  comments: string;
  wikiTitle: string;
}

function makeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Non-plant tokens produced by bad comma-splits inside parentheticals
const SKIP_TOKENS = new Set(['etc', 'and', 'or', 'the', 'see above', 'see below', 'many types of grass including kentucky bluegrass']);

// Explicit synonyms not derivable from the plant names (normalized form → target id)
const EXTRA_SYNONYMS: [string, string][] = [
  ['black walnut',   'walnut-tree'],
  ['black walnuts',  'walnut-tree'],
  ['walnut',         'walnut-tree'],
  ['walnuts',        'walnut-tree'],
  ['swiss chard',    'chard'],
  ['chards',         'chard'],
  ['chili pepper',   'peppers'],
  ['chili peppers',  'peppers'],
  ['hot pepper',     'peppers'],
  ['chili',          'peppers'],
  ['love apple',     'tomatoes'],
  ['love apples',    'tomatoes'],
  ['corn',           'corn-maize'],
  ['maize',          'corn-maize'],
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    // strip balanced and unbalanced parenthetical content
    .replace(/\([^)]*\)?/g, '')
    .replace(/\)/g, '')
    .replace(/[.,;!?]+$/, '')   // trailing punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function trySingular(norm: string): string[] {
  const candidates: string[] = [];
  if (norm.endsWith('ies') && norm.length > 4) candidates.push(norm.slice(0, -3) + 'y');
  if (norm.endsWith('es') && norm.length > 3)  candidates.push(norm.slice(0, -2));
  if (norm.endsWith('s')  && norm.length > 3)  candidates.push(norm.slice(0, -1));
  return candidates;
}

function main() {
  const enriched: EnrichedPlant[] = JSON.parse(readFileSync(ENRICHED, 'utf8'));
  const overrides: Record<string, any> = existsSync(OVERRIDES)
    ? JSON.parse(readFileSync(OVERRIDES, 'utf8'))
    : {};

  // Build normalized-name → id map from plant names (all languages)
  const idMap = new Map<string, string>();

  const plantsWithIds = enriched.map(p => {
    const id = makeId(p.nameEn);
    [p.nameEn, p.nameDe, p.nameFr, p.nameLa].forEach(name => {
      if (name) idMap.set(normalize(name), id);
    });
    return { ...p, id };
  });

  // Add extra synonyms after the plant loop so they don't get overwritten
  for (const [syn, targetId] of EXTRA_SYNONYMS) {
    if (!idMap.has(syn)) idMap.set(syn, targetId);
  }

  // Resolve a raw plant-name string to a plant id
  function resolveId(raw: string): string | null {
    const norm = normalize(raw);

    // Skip obvious non-plant tokens
    if (!norm || norm.length < 3 || SKIP_TOKENS.has(norm)) return null;

    // 1. Exact match
    if (idMap.has(norm)) return idMap.get(norm)!;

    // 2. Try singular forms
    for (const s of trySingular(norm)) {
      if (idMap.has(s)) return idMap.get(s)!;
    }

    // 3. Try last word (e.g. "chili peppers" → "peppers")
    const words = norm.split(' ');
    if (words.length > 1) {
      const last = words[words.length - 1];
      if (last.length > 3 && idMap.has(last)) return idMap.get(last)!;
      for (const s of trySingular(last)) {
        if (s.length > 3 && idMap.has(s)) return idMap.get(s)!;
      }
    }

    // 4. Try first word
    const first = words[0];
    if (first.length > 3) {
      if (idMap.has(first)) return idMap.get(first)!;
      for (const s of trySingular(first)) {
        if (s.length > 3 && idMap.has(s)) return idMap.get(s)!;
      }
    }

    return null;
  }

  const output = plantsWithIds.map(p => {
    const helps: string[] = [];
    const avoid: string[] = [];

    for (const name of p.helps) {
      const id = resolveId(name);
      if (id && id !== p.id) helps.push(id);
      else if (!id) console.warn(`  ⚠ Cannot resolve helps: "${name}" for ${p.nameEn}`);
    }
    for (const name of p.avoid) {
      const id = resolveId(name);
      if (id && id !== p.id) avoid.push(id);
      else if (!id) console.warn(`  ⚠ Cannot resolve avoid: "${name}" for ${p.nameEn}`);
    }

    const base = {
      id: p.id,
      names: {
        en: p.nameEn,
        de: p.nameDe || p.nameEn,
        fr: p.nameFr || p.nameEn,
        la: p.nameLa || '',
      },
      synonyms: [] as string[],
      helps: [...new Set(helps)],
      avoid: [...new Set(avoid)],
      comments: p.comments || '',
      source: 'https://en.wikipedia.org/wiki/List_of_companion_plants',
    };

    // Apply overrides
    const override = overrides[p.id];
    if (override) {
      Object.assign(base, override);
      if (override.names) base.names = { ...base.names, ...override.names };
    }

    return base;
  });

  const result = { version: '2026-05-10', plants: output };
  writeFileSync(OUT, JSON.stringify(result, null, 2));

  const withDe = output.filter(p => p.names.de !== p.names.en).length;
  const withFr = output.filter(p => p.names.fr !== p.names.en).length;
  const withLa = output.filter(p => p.names.la).length;
  const withRelations = output.filter(p => p.helps.length > 0 || p.avoid.length > 0).length;

  console.log(`\n✅ Merged ${output.length} plants → ${OUT}`);
  console.log(`   German names: ${withDe}/${output.length}`);
  console.log(`   French names: ${withFr}/${output.length}`);
  console.log(`   Latin names:  ${withLa}/${output.length}`);
  console.log(`   With relations (helps/avoid): ${withRelations}/${output.length}`);
  console.log('\nFirst 3 plants:');
  output.slice(0, 3).forEach(p => console.log(JSON.stringify(p, null, 2)));
}

main();

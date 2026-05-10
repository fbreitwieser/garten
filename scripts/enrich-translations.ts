import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IN = resolve(__dirname, '../data/plants.raw.json');
const OUT = resolve(__dirname, '../data/plants.enriched.json');

interface RawPlant {
  nameEn: string;
  nameLa: string;
  helps: string[];
  avoid: string[];
  comments: string;
  wikiTitle: string;
}

interface EnrichedPlant extends RawPlant {
  nameDe: string;
  nameFr: string;
}

async function getLangLink(title: string, lang: string): Promise<string> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&titles=${encodeURIComponent(title)}&format=json&lllang=${lang}&redirects=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'GardenPlannerBot/1.0' } });
    if (!res.ok) return '';
    const data = await res.json() as any;
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    if (page?.missing !== undefined) return '';
    return page?.langlinks?.[0]?.['*'] ?? '';
  } catch {
    return '';
  }
}

async function extractLatinName(title: string): Promise<string> {
  try {
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'GardenPlannerBot/1.0' } });
    if (!res.ok) return '';
    const html = await res.text();
    const $ = cheerio.load(html);

    // Try biota table (taxobox)
    const biotaSpecies = $('.biota .species i, .biota td i').first().text().trim();
    if (biotaSpecies) return biotaSpecies;

    // Try infobox binomial
    const binomial = $('.infobox .binomial i, .infobox .species i').first().text().trim();
    if (binomial) return binomial;

    return '';
  } catch {
    return '';
  }
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const plants: RawPlant[] = JSON.parse(readFileSync(IN, 'utf8'));
  const enriched: EnrichedPlant[] = [];

  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    await sleep(300);

    const [de, fr] = await Promise.all([
      getLangLink(plant.wikiTitle, 'de'),
      getLangLink(plant.wikiTitle, 'fr'),
    ]);

    let nameLa = plant.nameLa;
    if (!nameLa) {
      await sleep(300);
      nameLa = await extractLatinName(plant.wikiTitle);
    }

    console.log(`Enriching ${i + 1}/${plants.length}: ${plant.nameEn} → ${de || '—'} (de), ${fr || '—'} (fr)`);

    enriched.push({ ...plant, nameDe: de, nameFr: fr, nameLa });
  }

  writeFileSync(OUT, JSON.stringify(enriched, null, 2));
  console.log(`Written ${enriched.length} plants to ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });

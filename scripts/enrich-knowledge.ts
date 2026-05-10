/**
 * enrich-knowledge.ts
 *
 * Scrapes companion-planting sources and merges new relationships into
 * data/plants.overrides.json, then re-runs merge.ts to update plants.json.
 *
 * Sources scraped:
 *   - https://de.wikipedia.org/wiki/Mischkultur
 *
 * No API key required — pure web scraping + data merging.
 *
 * Usage:
 *   npx tsx scripts/enrich-knowledge.ts
 */

import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OVERRIDES_PATH = resolve(__dirname, '../data/plants.overrides.json');

const MISCHKULTUR_URL = 'https://de.wikipedia.org/wiki/Mischkultur';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlantOverride {
  names?: { de?: string; fr?: string };
  helps?: string[];
  avoid?: string[];
  comments?: string | { en?: string; de?: string; fr?: string };
  synonyms?: string[];
  [key: string]: unknown;
}

interface Override {
  _comment?: string;
  [plantId: string]: PlantOverride | string | undefined;
}

// ─── Scraper ─────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}

function splitList(s: string): string[] {
  return s.split(/[,;\n]+/).map(x => x.trim().replace(/\[[^\]]*\]/g, '').trim()).filter(x => x.length > 1);
}

async function scrapeMischkultur(): Promise<{ good: [string, string][]; bad: [string, string][] }> {
  console.log(`Fetching ${MISCHKULTUR_URL} …`);
  const res = await fetch(MISCHKULTUR_URL, {
    headers: { 'User-Agent': 'GardenPlannerBot/1.0 (research/education)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const good: [string, string][] = [];
  const bad: [string, string][] = [];

  $('table.wikitable').each((_, table) => {
    const rows = $(table).find('tr').toArray();
    if (rows.length < 2) return;

    const headers: string[] = [];
    $(rows[0]).find('th').each((_, th) => headers.push($(th).text().trim().toLowerCase()));

    const plantCol = headers.findIndex(h =>
      h.includes('pflanze') || h.includes('gemüse') || h.includes('kultur') || h === 'art'
    );
    const goodCol = headers.findIndex(h =>
      h.includes('gute') || h.includes('vorteilhaft') || h.includes('freund') || h.includes('positiv')
    );
    const badCol = headers.findIndex(h =>
      h.includes('schlechte') || h.includes('nachteilig') || h.includes('feind') || h.includes('negativ') || h.includes('vermeide')
    );

    if (plantCol === -1) return;

    for (let i = 1; i < rows.length; i++) {
      const cells = $(rows[i]).find('td');
      if (cells.length < 2) continue;

      const get = (idx: number) =>
        idx >= 0 && cells.eq(idx).length
          ? cells.eq(idx).text().replace(/\[[^\]]*\]/g, '').trim()
          : '';

      const name = get(plantCol).trim();
      if (!name || name.length < 2) continue;

      if (goodCol >= 0) {
        for (const partner of splitList(get(goodCol))) {
          if (partner !== name) good.push([norm(name), norm(partner)]);
        }
      }
      if (badCol >= 0) {
        for (const partner of splitList(get(badCol))) {
          if (partner !== name) bad.push([norm(name), norm(partner)]);
        }
      }
    }
  });

  // Fallback: parse list items for "Pflanze: gut/schlecht mit X" patterns
  if (good.length === 0 && bad.length === 0) {
    $('li, p').each((_, el) => {
      const text = $(el).text().trim();
      // Look for "A + B" in "günstige" or "ungünstige" section headings
      const plusMatch = text.match(/^([^+]+)\s*\+\s*(.+)$/);
      if (plusMatch) {
        const section = $(el).closest('div, section').prev('h2,h3,h4').text().toLowerCase();
        const pair: [string, string] = [norm(plusMatch[1]), norm(plusMatch[2])];
        if (section.includes('günstig') || section.includes('positiv')) good.push(pair);
        else if (section.includes('ungünstig') || section.includes('negativ')) bad.push(pair);
      }
    });
  }

  console.log(`  Parsed ${good.length} good pairs, ${bad.length} bad pairs`);
  return { good, bad };
}

// ─── Match German name → override key ────────────────────────────────────────

function matchKey(deOrEnName: string, overrides: Override): string | null {
  const n = norm(deOrEnName);
  for (const key of Object.keys(overrides)) {
    if (key.startsWith('_')) continue;
    const ov = overrides[key] as PlantOverride;
    if (!ov || typeof ov !== 'object') continue;
    // Match against override de name if set
    if (ov.names?.de && norm(ov.names.de) === n) return key;
    // Match against the key itself (which is usually the en name slug)
    if (norm(key.replace(/-/g, ' ')) === n) return key;
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const overrides: Override = JSON.parse(readFileSync(OVERRIDES_PATH, 'utf8'));

  let { good, bad } = await scrapeMischkultur().catch(err => {
    console.warn(`Warning: Mischkultur scrape failed — ${err.message}`);
    return { good: [] as [string, string][], bad: [] as [string, string][] };
  });

  let addedGood = 0;
  let addedBad = 0;

  for (const [plant, partner] of good) {
    const plantKey = matchKey(plant, overrides);
    const partnerKey = matchKey(partner, overrides);
    if (!plantKey || !partnerKey || plantKey === partnerKey) continue;

    const ov = overrides[plantKey] as PlantOverride;
    if (!ov.helps) ov.helps = [];
    if (!ov.helps.includes(partnerKey)) {
      ov.helps.push(partnerKey);
      console.log(`  + ${plantKey} helps ${partnerKey}  (Mischkultur)`);
      addedGood++;
    }
  }

  for (const [plant, partner] of bad) {
    const plantKey = matchKey(plant, overrides);
    const partnerKey = matchKey(partner, overrides);
    if (!plantKey || !partnerKey || plantKey === partnerKey) continue;

    const ov = overrides[plantKey] as PlantOverride;
    if (!ov.avoid) ov.avoid = [];
    if (!ov.avoid.includes(partnerKey)) {
      ov.avoid.push(partnerKey);
      console.log(`  - ${plantKey} avoids ${partnerKey}  (Mischkultur)`);
      addedBad++;
    }
  }

  if (addedGood > 0 || addedBad > 0) {
    writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2));
    console.log(`\nWrote ${OVERRIDES_PATH} (+${addedGood} helps, +${addedBad} avoid)`);

    // Re-run merge.ts to update plants.json
    console.log('Running merge.ts …');
    const result = spawnSync('node', ['node_modules/tsx/dist/cli.mjs', 'scripts/merge.ts'], {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
      encoding: 'utf8',
    });
    if (result.status !== 0) {
      console.error('merge.ts failed');
      process.exit(1);
    }
  } else {
    console.log('\nNo new relationships found — overrides unchanged.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });

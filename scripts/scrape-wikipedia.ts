import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../data/plants.raw.json');
const URL = 'https://en.wikipedia.org/wiki/List_of_companion_plants';

interface RawPlant {
  nameEn: string;
  nameLa: string;
  helps: string[];
  avoid: string[];
  comments: string;
  wikiTitle: string;
}

function cleanText(s: string): string {
  return s
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitList(s: string): string[] {
  if (!s || /see (above|below)/i.test(s)) return [];
  return s
    .split(/[,;\n]+/)
    .map(cleanText)
    .filter(x => x.length > 1 && !/^(and|or|the|some|many|most|all|none|various|several|other)$/i.test(x));
}

function detectColumns(headers: string[]): { nameIdx: number; latinIdx: number; helpsIdx: number; avoidIdx: number } {
  const h = headers.map(h => h.toLowerCase());
  const find = (...terms: string[]) => h.findIndex(col => terms.some(t => col.includes(t)));

  const nameIdx = find('common name', 'plant', 'name') ?? 0;
  const latinIdx = find('scientific', 'latin', 'binomial');
  const helpsIdx = find('helps', 'benefit', 'good companion', 'companion', 'attract');
  const avoidIdx = find('avoid', 'bad', 'hinder', 'inhibit', 'enemy', 'do not');

  return {
    nameIdx: nameIdx === -1 ? 0 : nameIdx,
    latinIdx: latinIdx === -1 ? 1 : latinIdx,
    helpsIdx: helpsIdx === -1 ? 2 : helpsIdx,
    avoidIdx: avoidIdx === -1 ? 3 : avoidIdx,
  };
}

async function main() {
  console.log('Fetching', URL);
  const res = await fetch(URL, { headers: { 'User-Agent': 'GardenPlannerBot/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const plants: RawPlant[] = [];
  const seen = new Set<string>();

  $('table.wikitable').each((_, table) => {
    const rows = $(table).find('tr').toArray();
    if (rows.length < 2) return;

    // Parse header row(s) — some tables have two header rows
    const headerCells: string[] = [];
    $(rows[0]).find('th').each((_, th) => {
      headerCells.push($(th).text().trim().toLowerCase());
    });

    const cols = detectColumns(headerCells);

    for (let i = 1; i < rows.length; i++) {
      const row = $(rows[i]);
      const cells = row.find('td');
      if (cells.length < 3) continue;

      const getText = (idx: number) => {
        const cell = cells.eq(idx);
        if (!cell.length) return '';
        return cell.text().trim();
      };

      const rawName = getText(cols.nameIdx);
      if (!rawName || rawName.length < 2) continue;

      const nameEn = cleanText(rawName);
      if (!nameEn || nameEn.length < 2) continue;

      const key = nameEn.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const nameLa = cleanText(getText(cols.latinIdx));
      const helpsRaw = getText(cols.helpsIdx);
      const avoidRaw = getText(cols.avoidIdx);

      // Get comments from any remaining columns
      let comments = '';
      cells.each((ci, cell) => {
        if (ci > Math.max(cols.nameIdx, cols.latinIdx, cols.helpsIdx, cols.avoidIdx)) {
          const txt = $(cell).text().trim();
          if (txt) comments = txt;
        }
      });

      plants.push({
        nameEn,
        nameLa,
        helps: splitList(helpsRaw),
        avoid: splitList(avoidRaw),
        comments: cleanText(comments),
        wikiTitle: nameEn,
      });
    }
  });

  console.log(`Found ${plants.length} plants`);
  writeFileSync(OUT, JSON.stringify(plants, null, 2));
  console.log(`Written to ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });

# Garten

A companion planting garden planner. Enter the plants you want to grow, configure your bed dimensions, and the app arranges them to maximise beneficial neighbours and avoid harmful combinations.

Available in German, English, and French.

## Features

- Parse a free-text list of plants with quantities
- Score and layout plants across a configurable grid based on companion planting data
- Visual grid with colour-coded plants, a legend, and an explanation of pairings
- Plant data sourced from Wikipedia's [List of companion plants](https://en.wikipedia.org/wiki/List_of_companion_plants) via a scraper script
- Print-ready layout

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run scrape` | Scrape Wikipedia for companion planting data and regenerate `data/plants.json` |

## Data pipeline

Plant data lives in `data/`:

- `plants.raw.json` — raw scrape from Wikipedia
- `plants.overrides.json` — manual corrections
- `plants.enriched.json` — after translation enrichment
- `plants.json` — final merged file used by the app

Run `npm run scrape` to refresh all of these from the source.

## Tech stack

- [Svelte 4](https://svelte.dev/) + TypeScript
- [Vite](https://vitejs.dev/)
- [Cheerio](https://cheerio.js.org/) for scraping

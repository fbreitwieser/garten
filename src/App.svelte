<script lang="ts">
  import './styles/app.css';
  import './styles/print.css';

  import type { Plant, ParsedEntry, LayoutResult } from './lib/types';
  import type { Lang } from './lib/i18n';
  import { t } from './lib/i18n';
  import { fallbackPlants } from './lib/fallbackPlants';
  import { parseInput } from './lib/parseInput';
  import { computeLayout } from './lib/layout';
  import { buildExplanation } from './lib/explain';
  import type { ExplanationItem } from './lib/explain';
  import plantsJson from '../data/plants.json';

  import PlantInput from './components/PlantInput.svelte';
  import BedConfig from './components/BedConfig.svelte';
  import GardenGrid from './components/GardenGrid.svelte';
  import Legend from './components/Legend.svelte';
  import Explanation from './components/Explanation.svelte';

  // --- State ---
  let lang: Lang = 'de';
  let inputText = '';
  let bedCols = 10;
  let bedRows = 8;
  let cellSizeCm = 30;
  let layoutResult: LayoutResult | null = null;
  let explanationItems: ExplanationItem[] = [];

  // --- Plant data: prefer scraper output, fall back to built-in data ---
  const jsonPlants = (plantsJson as any)?.plants;
  let plants: Plant[] = Array.isArray(jsonPlants) && jsonPlants.length > 0
    ? (jsonPlants as Plant[])
    : fallbackPlants.plants;

  // --- Reactive ---
  $: tr = t[lang];
  $: entries = inputText.trim() ? parseInput(inputText, plants) : ([] as ParsedEntry[]);
  $: matchedEntries = entries.filter((e) => e.matched && e.plantId);
  $: plantIds = [...new Set(layoutResult?.grid.filter(Boolean) ?? [])];

  const WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/List_of_companion_plants';

  // --- Actions ---
  function planGarden() {
    const toLayout = matchedEntries
      .map((e) => ({ plantId: e.plantId!, count: e.count }))
      .filter((e) => e.count > 0);

    if (toLayout.length === 0) return;

    layoutResult = computeLayout(toLayout, bedCols, bedRows, plants);
    explanationItems = buildExplanation(layoutResult, plants);
  }

  function regenerate() {
    planGarden();
  }

  function printPage() {
    window.print();
  }
</script>

<div class="app">
  <header class="app-header">
    <h1>🌱 {tr.title}</h1>
    <div class="lang-switcher">
      <button class:active={lang === 'de'} on:click={() => (lang = 'de')}>DE</button>
      <button class:active={lang === 'en'} on:click={() => (lang = 'en')}>EN</button>
      <button class:active={lang === 'fr'} on:click={() => (lang = 'fr')}>FR</button>
    </div>
    <button class="print-btn" on:click={printPage}>🖨 {tr.print}</button>
  </header>

  <div class="app-body">
    <!-- Sidebar -->
    <aside class="sidebar sidebar-controls">
      <PlantInput
        bind:text={inputText}
        {entries}
        {plants}
        {lang}
      />

      <div>
        <p class="section-title">{tr.bedDimensions}</p>
        <BedConfig bind:cols={bedCols} bind:rows={bedRows} bind:cellSizeCm {lang} />
      </div>

      <div class="btn-row">
        <button on:click={planGarden} disabled={matchedEntries.length === 0}>
          🌿 {tr.plan}
        </button>
        {#if layoutResult}
          <button class="btn-secondary regenerate-btn" on:click={regenerate}>
            🔄 {tr.regenerate}
          </button>
        {/if}
      </div>

      {#if matchedEntries.length > 0}
        <p style="font-size:0.8rem; color:#666; margin:0">
          {matchedEntries.length} {tr.plantsRecognised}
          · {matchedEntries.reduce((s, e) => s + e.count, 0)} {tr.empty !== 'empty' ? 'Felder' : 'cells'}
        </p>
      {/if}
    </aside>

    <!-- Main panel -->
    <main class="main">
      {#if layoutResult}
        <Legend {plantIds} {plants} {lang} />

        <GardenGrid result={layoutResult} {plants} {lang} {cellSizeCm} />

        <Explanation items={explanationItems} {lang} source={WIKIPEDIA_URL} />
      {:else}
        <div class="no-layout">
          <span>{tr.noLayout}</span>
        </div>
      {/if}
    </main>
  </div>
</div>

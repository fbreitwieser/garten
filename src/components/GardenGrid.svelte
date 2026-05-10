<script lang="ts">
  import type { Plant, LayoutResult } from '../lib/types';
  import type { Lang } from '../lib/i18n';
  import { t } from '../lib/i18n';
  import { getColor, getEmoji } from '../lib/plantColors';

  export let result: LayoutResult;
  export let plants: Plant[];
  export let lang: Lang;
  export let cellSizeCm: number;

  $: tr = t[lang];
  $: cellPx = Math.max(44, cellSizeCm * 1.4);

  $: allPlantIds = [...new Set(result.grid.filter(Boolean))];

  // Build sets for fast lookup
  $: conflictCells = buildConflictCells(result);
  $: companionCells = buildCompanionCells(result);

  function buildConflictCells(r: LayoutResult): Set<number> {
    const set = new Set<number>();
    const conflictPairs = new Set(r.conflicts.map(([a, b]) => pairKey(a, b)));
    for (let i = 0; i < r.grid.length; i++) {
      const a = r.grid[i];
      if (!a) continue;
      for (const j of adj4(i, r.cols, r.rows)) {
        const b = r.grid[j];
        if (!b || a === b) continue;
        if (conflictPairs.has(pairKey(a, b))) {
          set.add(i);
          set.add(j);
        }
      }
    }
    return set;
  }

  function buildCompanionCells(r: LayoutResult): Set<number> {
    const set = new Set<number>();
    const companionPairs = new Set(r.companions.map(([a, b]) => pairKey(a, b)));
    for (let i = 0; i < r.grid.length; i++) {
      const a = r.grid[i];
      if (!a) continue;
      for (const j of adj4(i, r.cols, r.rows)) {
        const b = r.grid[j];
        if (!b || a === b) continue;
        if (companionPairs.has(pairKey(a, b))) {
          set.add(i);
          set.add(j);
        }
      }
    }
    return set;
  }

  function pairKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  function adj4(idx: number, cols: number, rows: number): number[] {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    const neighbors: number[] = [];
    if (r > 0) neighbors.push((r - 1) * cols + c);
    if (r < rows - 1) neighbors.push((r + 1) * cols + c);
    if (c > 0) neighbors.push(r * cols + (c - 1));
    if (c < cols - 1) neighbors.push(r * cols + (c + 1));
    return neighbors;
  }

  function getShortName(plantId: string): string {
    if (!plantId) return '';
    const p = plants.find((pl) => pl.id === plantId);
    if (!p) return plantId.slice(0, 5);
    const name = p.names[lang] ?? p.names.en;
    const firstWord = name.split(/\s+/)[0];
    return firstWord.length > 6 ? firstWord.slice(0, 5) + '…' : firstWord;
  }

  function getPlant(id: string): Plant | undefined {
    return plants.find((p) => p.id === id);
  }

  function getCompanionNames(plant: Plant): string {
    return plant.helps
      .map((id) => plants.find((p) => p.id === id)?.names[lang] ?? id)
      .join(', ');
  }

  function getAvoidNames(plant: Plant): string {
    return plant.avoid
      .map((id) => plants.find((p) => p.id === id)?.names[lang] ?? id)
      .join(', ');
  }

  let hoveredIdx: number | null = null;

  // Column labels A, B, C...
  $: colLabels = Array.from({ length: result.cols }, (_, i) =>
    String.fromCharCode(65 + (i % 26))
  );
</script>

<div class="garden-wrap">
  <!-- Column headers -->
  <div class="col-headers" style="margin-left: {cellPx + 4}px; gap: 2px;">
    {#each colLabels as lbl}
      <div class="col-label" style="width:{cellPx}px; text-align:center;">{lbl}</div>
    {/each}
  </div>

  <!-- Rows -->
  {#each Array.from({ length: result.rows }, (_, r) => r) as rowIdx}
    <div class="grid-row-with-label" style="gap:2px; margin-bottom:2px;">
      <div class="row-label" style="width:{cellPx}px; text-align:right; padding-right:4px;">
        {rowIdx + 1}
      </div>
      {#each Array.from({ length: result.cols }, (_, c) => c) as colIdx}
        {@const cellIdx = rowIdx * result.cols + colIdx}
        {@const plantId = result.grid[cellIdx]}
        {@const plant = getPlant(plantId)}
        <div
          class="garden-cell"
          class:cell-empty={!plantId}
          class:cell-conflict={conflictCells.has(cellIdx)}
          class:cell-companion-glow={companionCells.has(cellIdx) && !conflictCells.has(cellIdx)}
          style="
            width:{cellPx}px;
            height:{cellPx}px;
            background:{getColor(plantId, allPlantIds)};
          "
          role="img"
          aria-label={plant ? plant.names[lang] : tr.empty}
          on:mouseenter={() => (hoveredIdx = cellIdx)}
          on:mouseleave={() => (hoveredIdx = null)}
        >
          {#if plantId}
            <span class="cell-emoji">{getEmoji(plantId)}</span>
            <span class="cell-name">{getShortName(plantId)}</span>
          {/if}

          {#if hoveredIdx === cellIdx && plant}
            <div class="cell-tooltip">
              <h4>{getEmoji(plantId)} {plant.names[lang] ?? plant.names.en}</h4>
              <div class="tooltip-names">
                <em>{plant.names.la}</em><br />
                {plant.names.en} · {plant.names.de} · {plant.names.fr}
              </div>
              {#if plant.helps.length > 0}
                <div class="tooltip-section">
                  <strong>{tr.companions}</strong>
                  {getCompanionNames(plant)}
                </div>
              {/if}
              {#if plant.avoid.length > 0}
                <div class="tooltip-section">
                  <strong>{tr.antagonists}</strong>
                  {getAvoidNames(plant)}
                </div>
              {/if}
              {#if plant.comments}
                <div class="tooltip-section" style="color:#555">{plant.comments}</div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

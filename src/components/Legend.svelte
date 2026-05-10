<script lang="ts">
  import type { Plant } from '../lib/types';
  import type { Lang } from '../lib/i18n';
  import { getColor, getEmoji } from '../lib/plantColors';

  export let plantIds: string[];
  export let plants: Plant[];
  export let lang: Lang;

  function getPlantName(id: string): string {
    const p = plants.find((pl) => pl.id === id);
    if (!p) return id;
    return p.names[lang] ?? p.names.en;
  }

  function getLatinName(id: string): string {
    const p = plants.find((pl) => pl.id === id);
    return p?.names.la ?? '';
  }
</script>

{#if plantIds.length > 0}
  <div class="legend">
    {#each plantIds as id}
      <div class="legend-item" title={getLatinName(id)}>
        <div class="legend-swatch" style="background:{getColor(id, plantIds)}"></div>
        <span>{getEmoji(id)}</span>
        <span>{getPlantName(id)}</span>
      </div>
    {/each}
  </div>
{/if}

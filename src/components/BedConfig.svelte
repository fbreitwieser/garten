<script lang="ts">
  import type { Lang } from '../lib/i18n';
  import { t } from '../lib/i18n';

  export let cols: number;
  export let rows: number;
  export let cellSizeCm: number;
  export let lang: Lang;

  $: tr = t[lang];
</script>

<div class="bed-config">
  <div>
    <label for="bed-cols">{tr.bedWidth}</label>
    <input id="bed-cols" type="number" bind:value={cols} min="3" max="30" />
  </div>
  <div>
    <label for="bed-rows">{tr.bedHeight}</label>
    <input id="bed-rows" type="number" bind:value={rows} min="2" max="20" />
  </div>
  <div class="full-width">
    <label for="cell-size">{tr.cellSize}</label>
    <input id="cell-size" type="number" bind:value={cellSizeCm} min="15" max="100" step="5" />
  </div>
</div>

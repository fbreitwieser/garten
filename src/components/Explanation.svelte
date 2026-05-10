<script lang="ts">
  import type { ExplanationItem } from '../lib/explain';
  import type { Lang } from '../lib/i18n';
  import { t } from '../lib/i18n';
  import { getEmoji } from '../lib/plantColors';

  export let items: ExplanationItem[];
  export let lang: Lang;
  export let source: string;

  $: tr = t[lang];

  $: companions = items.filter((i) => i.relationship === 'companion');
  $: avoided = items.filter((i) => i.relationship === 'avoided');
  $: conflicts = items.filter((i) => i.relationship === 'conflict');

  function name(item: ExplanationItem, which: 'A' | 'B'): string {
    const plant = which === 'A' ? item.plantA : item.plantB;
    return plant.names[lang] ?? plant.names.en;
  }
</script>

{#if items.length > 0}
  <div class="explanation">
    <h3>📋 {tr.goodNeighbours}</h3>

    {#if companions.length > 0}
      <div class="explanation-section">
        <h4 class="good">✅ {tr.goodNeighbours} ({companions.length})</h4>
        {#each companions as item}
          <div class="explanation-item">
            <span class="expl-pair">
              {getEmoji(item.plantA.id)} {name(item, 'A')} ↔ {getEmoji(item.plantB.id)} {name(item, 'B')}
            </span>
            {#if item.comment}
              <span class="expl-comment">— {item.comment}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if avoided.length > 0}
      <div class="explanation-section">
        <h4 class="avoided">↔ {tr.keptApart} ({avoided.length})</h4>
        {#each avoided as item}
          <div class="explanation-item">
            <span class="expl-pair">
              {getEmoji(item.plantA.id)} {name(item, 'A')} / {getEmoji(item.plantB.id)} {name(item, 'B')}
            </span>
            {#if item.comment}
              <span class="expl-comment">— {item.comment}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if conflicts.length > 0}
      <div class="explanation-section">
        <h4 class="conflict">⚠️ {tr.compromises} ({conflicts.length})</h4>
        {#each conflicts as item}
          <div class="explanation-item">
            <span class="expl-pair" style="color:#c62828">
              {getEmoji(item.plantA.id)} {name(item, 'A')} ⚡ {getEmoji(item.plantB.id)} {name(item, 'B')}
            </span>
            {#if item.comment}
              <span class="expl-comment">— {item.comment}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <div class="source-link">
      {tr.dataSource}: <a href={source} target="_blank" rel="noopener">Wikipedia – List of companion plants</a>
    </div>
  </div>
{/if}

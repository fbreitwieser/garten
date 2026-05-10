<script lang="ts">
  import type { Plant, ParsedEntry } from '../lib/types';
  import type { Lang } from '../lib/i18n';
  import { t } from '../lib/i18n';
  import { createEventDispatcher } from 'svelte';

  export let text: string;
  export let entries: ParsedEntry[];
  export let plants: Plant[];
  export let lang: Lang;

  $: tr = t[lang];

  const dispatch = createEventDispatcher<{ acceptSuggestion: { raw: string; plantId: string } }>();

  function getPlantName(id: string): string {
    const p = plants.find((pl) => pl.id === id);
    if (!p) return id;
    return p.names[lang] ?? p.names.en;
  }

  function acceptSuggestion(entry: ParsedEntry, plantId: string) {
    const countStr = entry.count > 1 ? `${entry.count} ` : '';
    const plantName = getPlantName(plantId);
    // Replace the original line with the canonical name
    const lines = text.split('\n');
    const updated = lines.map((line) => {
      if (line.trim() === entry.raw) {
        return `${countStr}${plantName}`;
      }
      return line;
    });
    text = updated.join('\n');
  }
</script>

<div>
  <label for="plant-input">{tr.inputLabel}</label>
  <textarea
    id="plant-input"
    bind:value={text}
    placeholder={tr.inputPlaceholder}
    spellcheck="false"
  />
</div>

{#if entries.length > 0}
  <div class="entry-list">
    {#each entries as entry}
      {#if entry.matched}
        <div class="matched">
          <span>✓</span>
          <span>
            {entry.count > 1 ? `${entry.count}×` : ''}
            {getPlantName(entry.plantId ?? '')}
          </span>
        </div>
      {:else}
        <div class="unmatched">
          <span>⚠ {entry.raw}</span>
          {#if entry.suggestions.length > 0}
            <div class="suggestion-row">
              <span style="color:#888;font-size:0.75rem">{tr.didYouMean}:</span>
              {#each entry.suggestions as sug}
                <button
                  class="suggestion-btn"
                  type="button"
                  on:click={() => acceptSuggestion(entry, sug)}
                >
                  {getPlantName(sug)}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
{/if}

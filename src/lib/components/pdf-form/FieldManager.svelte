<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let fields: Array<{id: string, name: string, type: string, x: number, y: number, width: number, height: number}> = [];

  function removeField(fieldId: string): void {
    dispatch('removeField', fieldId);
  }
</script>

{#if fields.length > 0}
  <div class="fields-summary">
    <h3>Detected Fields ({fields.length})</h3>
    <div class="fields-list">
      {#each fields as field (field.id)}
        <div class="field-item">
          <span class="field-name">{field.name}</span>
          <span class="field-type">{field.type}</span>
          <button 
            class="remove-field-btn"
            on:click={() => removeField(field.id)}
            title="Remove field"
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .fields-summary {
    margin-top: 2rem;
    text-align: left;
  }

  .fields-summary h3 {
    color: #fff;
    margin-bottom: 1rem;
  }

  .fields-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .field-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
  }

  .field-name {
    display: block;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .field-type {
    font-size: 0.9rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .remove-field-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ff6b6b;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .remove-field-btn:hover {
    background: #ff5252;
  }
</style>

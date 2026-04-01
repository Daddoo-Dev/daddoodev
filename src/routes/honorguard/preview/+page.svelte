<script lang="ts">
  interface Props {
    data: { sheetHtml: string };
  }
  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Sign-in sheet</title>
  <style>
    body { margin: 0; padding: 0; background: #fff; }
    :global(.sheet-root) { margin: 0; padding: 0; min-height: 100vh; width: 100%; background: #fff; }
  </style>
</svelte:head>

<div class="sheet-root">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- sheetHtml is from buildSignInSheetHtml (escaped), not user input -->
  {@html data.sheetHtml}
</div>

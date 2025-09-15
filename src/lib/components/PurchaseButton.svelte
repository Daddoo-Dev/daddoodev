<script lang="ts">
  export let purchaseUrl: string;
  export let buttonText: string = "Purchase Now";
  export let variant: 'primary' | 'secondary' = 'primary';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let disabled: boolean = false;
  export let loading: boolean = false;

  function handlePurchase() {
    if (disabled || loading || !purchaseUrl) return;
    
    // Open RevenueCat paywall in new tab
    window.open(purchaseUrl, '_blank');
  }
</script>

<button 
  class="purchase-button {variant} {size}" 
  class:disabled 
  class:loading
  on:click={handlePurchase}
  {disabled}
>
  {#if loading}
    <span class="spinner"></span>
    Processing...
  {:else}
    {buttonText}
  {/if}
</button>

<style>
  .purchase-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .purchase-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }

  .purchase-button.secondary {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .purchase-button.small {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .purchase-button.medium {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .purchase-button.large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }

  .purchase-button:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  .purchase-button.primary:hover:not(.disabled) {
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }

  .purchase-button.secondary:hover:not(.disabled) {
    background: #667eea;
    color: #fff;
  }

  .purchase-button.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .purchase-button.loading {
    cursor: wait;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>

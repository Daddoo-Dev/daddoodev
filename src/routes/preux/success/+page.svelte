<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let purchaseSuccess = false;
  let appUserId = '';

  onMount(() => {
    // Check URL parameters for purchase success
    const urlParams = new URLSearchParams(window.location.search);
    const purchase = urlParams.get('purchase');
    const userId = urlParams.get('app_user_id');
    
    if (purchase === 'success') {
      purchaseSuccess = true;
    }
    
    if (userId) {
      appUserId = userId;
    }
  });

  function goToPreux() {
    goto('/preux');
  }

  function goHome() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Purchase Successful - Preux | Daddoo Dev</title>
  <meta name="description" content="Thank you for purchasing Preux! Your subscription is now active." />
</svelte:head>

<div class="success-page">
  <div class="container">
    <div class="success-content">
      {#if purchaseSuccess}
        <div class="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
          </svg>
        </div>
        
        <h1>Purchase Successful!</h1>
        <p class="success-message">
          Thank you for purchasing Preux! Your subscription is now active and you can start using all the premium features.
        </p>
        
        {#if appUserId}
          <p class="user-info">
            Your account ID: <code>{appUserId}</code>
          </p>
        {/if}
        
        <div class="next-steps">
          <h2>What's Next?</h2>
          <div class="steps-grid">
            <div class="step">
              <div class="step-number">1</div>
              <h3>Download Preux</h3>
              <p>Download the latest version of Preux to get started with your new subscription.</p>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <h3>Sign In</h3>
              <p>Use your account credentials to sign in and access all premium features.</p>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <h3>Start Tracking</h3>
              <p>Begin monitoring your applications with AI-powered error classification.</p>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-primary" on:click={goToPreux}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <path d="M7 10l5 5 5-5"/>
              <path d="M12 15V3"/>
            </svg>
            Download Preux
          </button>
          <button class="btn-secondary" on:click={goHome}>
            Back to Home
          </button>
        </div>
      {:else}
        <div class="error-state">
          <h1>Something went wrong</h1>
          <p>We couldn't process your purchase information. Please contact support if you continue to experience issues.</p>
          <button class="btn-primary" on:click={goHome}>
            Back to Home
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .success-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .container {
    max-width: 800px;
    width: 100%;
  }

  .success-content {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    backdrop-filter: blur(10px);
  }

  .success-icon {
    color: #4ade80;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .success-message {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .user-info {
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .user-info code {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    color: #4ade80;
  }

  .next-steps {
    margin: 3rem 0;
    text-align: left;
  }

  .next-steps h2 {
    text-align: center;
    font-size: 2rem;
    color: #fff;
    margin-bottom: 2rem;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }

  .step {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
  }

  .step-number {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
    margin: 0 auto 1rem;
  }

  .step h3 {
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .step p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 1rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  .btn-secondary {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-secondary:hover {
    background: #667eea;
    color: #fff;
  }

  .error-state {
    color: #fff;
  }

  .error-state h1 {
    color: #ef4444;
  }

  @media (max-width: 768px) {
    .success-content {
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
    }

    .action-buttons {
      flex-direction: column;
      align-items: center;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
      max-width: 300px;
    }
  }
</style>

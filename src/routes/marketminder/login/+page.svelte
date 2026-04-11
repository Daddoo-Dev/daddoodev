<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
  import { getFirebaseAuth, isFirebaseConfigured } from '$lib/firebase/client';

  let email = '';
  let password = '';
  let errorMsg = '';
  let busy = false;
  let misconfigured = false;

  onMount(() => {
    if (!isFirebaseConfigured()) {
      misconfigured = true;
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) goto('/marketminder');
    });
    return () => unsub();
  });

  async function submit(e: Event) {
    e.preventDefault();
    errorMsg = '';
    busy = true;
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      goto('/marketminder');
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Sign-in failed';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>MarketMinder — Sign in</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mm-root-wrap mm-scope mm-login-page" data-theme="dark">
  <div class="section">
    <h2 class="mm-app-title">MarketMinder</h2>
    {#if misconfigured}
      <p class="error">
        Firebase is not configured. Set PUBLIC_FIREBASE_API_KEY and PUBLIC_FIREBASE_PROJECT_ID (and auth domain / app id) in your environment, then rebuild.
      </p>
    {:else}
      <p class="muted">Sign in with your account.</p>
      <form class="card card-form mm-login-form" on:submit={submit}>
        <label class="sr-only" for="mm-email">Email</label>
        <input
          id="mm-email"
          type="email"
          autocomplete="username"
          bind:value={email}
          placeholder="Email"
          required />
        <label class="sr-only" for="mm-password">Password</label>
        <input
          id="mm-password"
          type="password"
          autocomplete="current-password"
          bind:value={password}
          placeholder="Password"
          required />
        {#if errorMsg}
          <p class="error">{errorMsg}</p>
        {/if}
        <button type="submit" class="primary-button submit-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    {/if}
  </div>
</div>

<script lang="ts">
	import { tryCyoaLogin } from '$lib/cyoa/auth';

	let { onSuccess }: { onSuccess: () => void } = $props();

	let username = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let busy = $state(false);

	function submit(e: Event) {
		e.preventDefault();
		errorMsg = '';
		busy = true;
		const ok = tryCyoaLogin(username, password);
		busy = false;
		if (ok) {
			onSuccess();
			return;
		}
		errorMsg = 'Invalid credentials.';
	}
</script>

<div class="cyoa-panel">
	<h1 class="cyoa-title">Private</h1>
	<p class="muted">Sign in to continue.</p>
	<form class="card card-form cyoa-login-form" onsubmit={submit}>
		<label class="sr-only" for="cyoa-user">Username</label>
		<input
			id="cyoa-user"
			type="text"
			autocomplete="username"
			bind:value={username}
			placeholder="Username"
			required
		/>
		<label class="sr-only" for="cyoa-pass">Password</label>
		<input
			id="cyoa-pass"
			type="password"
			autocomplete="current-password"
			bind:value={password}
			placeholder="Password"
			required
		/>
		{#if errorMsg}
			<p class="error">{errorMsg}</p>
		{/if}
		<button type="submit" class="primary-button" disabled={busy}>
			{busy ? 'Signing in…' : 'Sign in'}
		</button>
	</form>
</div>

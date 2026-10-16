<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="Bottled Star Support | Daddoo Dev"
	description="Support for Bottled Star. Contact Daddoo Dev for help with gameplay, purchases, or leaderboard issues."
	url="https://daddoodev.pro/bottledstar/support"
	image="https://daddoodev.pro/images/bottledstar.png"
	keywords="bottled star support, bottled star help, daddoo dev support"
	noindex={true}
/>

<div class="product-page">
	<div class="container">
		<header class="page-header">
			<a class="back-button" href="/">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				Back to Home
			</a>
		</header>

		<div class="app-content">
			<div class="app-header">
				<img src="/images/bottledstar.png" alt="Bottled Star app icon" class="app-icon" />
				<div class="app-title-section">
					<h1>Bottled Star Support</h1>
					<p class="app-tagline">Help and contact for the game.</p>
				</div>
			</div>

			<div class="app-description">
				<p>
					Bottled Star is a fusion drop-and-merge physics game. Use this page for support requests,
					purchase questions, or leaderboard issues.
				</p>
			</div>

			<section>
				<h2>Contact</h2>
				<ul class="contact-list">
					<li>Email: <a href="mailto:support@daddoodev.pro">support@daddoodev.pro</a></li>
					<li>Website: <a href="https://daddoodev.pro">https://daddoodev.pro</a></li>
				</ul>
				<p>We aim to respond within a few business days.</p>
			</section>

			<section>
				<h2>Purchases</h2>
				<p>
					Challenge packs and the all-packs bundle are one-time in-app purchases. If a purchase does
					not unlock, restore purchases from the unlock screen in the app, or contact us with your
					store receipt.
				</p>
			</section>

			<section>
				<h2>Privacy</h2>
				<ul class="contact-list">
					<li>Anonymous account for leaderboards (Firebase Auth).</li>
					<li>Optional display name and high scores stored in Firestore.</li>
					<li>Purchase status handled by RevenueCat and the App Store / Google Play.</li>
					<li>No advertising ID. No tracking for ads.</li>
				</ul>
				<p>
					<a href="/privacy">Privacy Policy</a>
					|
					<a href="/terms">Terms of Service</a>
				</p>
			</section>
		</div>
	</div>
</div>

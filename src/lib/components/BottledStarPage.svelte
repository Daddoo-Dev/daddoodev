<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import StoreBadges from '$lib/components/StoreBadges.svelte';

	let {
		title,
		description,
		url,
		noindex = false
	}: {
		title: string;
		description: string;
		url: string;
		noindex?: boolean;
	} = $props();

	const playUrl = 'https://play.google.com/store/apps/details?id=pro.daddoodev.bottledstar';
	const appStoreUrl = 'https://apps.apple.com/us/app/bottled-star-fusion-game/id6798914010';
</script>

<SEO
	{title}
	{description}
	{url}
	image="https://daddoodev.pro/images/bottledstar.png"
	keywords="bottled star, fusion game, star fusion game, nuclear fusion game, daddoo dev"
	{noindex}
/>

<div class="product-page">
	<div class="container">
		<header class="page-header">
			<a class="back-button" href="/">
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				Back to Home
			</a>
		</header>

		<div class="app-content">
			<div class="app-header">
				<img src="/images/bottledstar.png" alt="Bottled Star app icon" class="app-icon" />
				<div class="app-title-section">
					<h1>Bottled Star</h1>
					<p class="app-tagline">Hold a star in a bottle.</p>
				</div>
			</div>

			<div class="app-description">
				<p>
					Bottled Star is a fusion game. Inject nuclei into a sealed chamber, fuse them up the
					stellar ladder, and decide whether your star ends quietly — or goes out loud.
				</p>
				<p>
					Drag to aim. Hold to charge. Release to fire. Same-tier pairs fuse. Helium captures climb
					the ladder. Miss your timing and the chamber fills until the rim cracks.
				</p>
			</div>

			<div class="download-section">
				<h2>Get the game</h2>
				<div class="download-buttons">
					<StoreBadges googlePlay={playUrl} appStore={appStoreUrl} />
				</div>
			</div>

			<section>
				<h2>How it plays</h2>
				<div class="features-grid">
					<div class="feature-card">
						<h3>Classic</h3>
						<p>
							Build toward iron. End as a quiet white dwarf, or push iron into iron until the core
							collapses into a supernova.
						</p>
					</div>
					<div class="feature-card">
						<h3>Collapse</h3>
						<p>
							Every supernova leaves a remnant. Drive two together for a kilonova. Score by
							kilonovas first, efficiency second.
						</p>
					</div>
					<div class="feature-card">
						<h3>Challenge packs</h3>
						<p>
							Hand-crafted puzzles with shot budgets and a finish line. Unlock packs one at a time,
							or all three as a bundle.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2>In the game</h2>
				<div class="screenshot-row">
					<figure>
						<img
							src="/images/bottledstar/climb.jpg"
							alt="Classic mode climbing the fusion ladder to iron"
							loading="lazy"
						/>
						<figcaption>Climb to iron</figcaption>
					</figure>
					<figure>
						<img
							src="/images/bottledstar/inject.jpg"
							alt="Aim, charge, and inject a nucleus into the chamber"
							loading="lazy"
						/>
						<figcaption>Aim, charge, inject</figcaption>
					</figure>
					<figure>
						<img
							src="/images/bottledstar/collapse.jpg"
							alt="Collapse mode with remnants around the core"
							loading="lazy"
						/>
						<figcaption>Collapse mode</figcaption>
					</figure>
				</div>
			</section>

			<section id="support">
				<h2>Support</h2>
				<p>
					This page is the public support destination for Bottled Star. Email Daddoo Dev for
					gameplay, purchases, or leaderboard issues. We aim to respond within a few business days.
				</p>
				<ul class="contact-list">
					<li>Email: <a href="mailto:support@daddoodev.pro">support@daddoodev.pro</a></li>
					<li>
						Website: <a href="https://daddoodev.pro/bottledstar"
							>https://daddoodev.pro/bottledstar</a
						>
					</li>
				</ul>
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
				<ul class="privacy-list">
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

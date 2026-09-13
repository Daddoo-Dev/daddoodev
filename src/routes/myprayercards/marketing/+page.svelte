<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import StoreBadges from '$lib/components/StoreBadges.svelte';

	const playUrl = 'https://play.google.com/store/apps/details?id=dev.daddoodev.myprayercards';
</script>

<SEO
	title="My Prayer Cards | Daddoo Dev"
	description="Digitize the prayer cards you already own. Scan the artwork, read the prayer, and keep a private library on your phone."
	url="https://daddoodev.pro/myprayercards/marketing"
	image="https://daddoodev.pro/images/myprayercards.png"
	keywords="my prayer cards, catholic prayer cards, digitize prayer cards, prayer library, OCR prayer card"
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
				<img src="/images/myprayercards.png" alt="My Prayer Cards app icon" class="app-icon" />
				<div class="app-title-section">
					<h1>My Prayer Cards</h1>
					<p class="app-tagline">Digitize the prayer cards you already own.</p>
				</div>
			</div>

			<div class="app-description">
				<p>
					Turn the prayer cards in your drawer into a library on your phone. Scan the front for
					the artwork, then the back for the prayer. Read them anywhere — including offline when
					you pin a card.
				</p>
				<p>
					Your library is private. Favorite, search, and sort your cards. The reader puts the
					prayer on a calm, readable panel over the card art, with pinch to zoom.
				</p>
			</div>

			<div class="download-section">
				<h2>Get the app</h2>
				<div class="download-buttons">
					<StoreBadges googlePlay={playUrl} appStore={undefined} />
				</div>
			</div>

			<section>
				<h2>In the app</h2>
				<div class="screenshot-row">
					<figure>
						<img src="/images/myprayercards/library.png" alt="Prayer card library" loading="lazy" />
						<figcaption>Your library</figcaption>
					</figure>
					<figure>
						<img src="/images/myprayercards/reader.png" alt="Prayer reader" loading="lazy" />
						<figcaption>Read with the card art behind the text</figcaption>
					</figure>
					<figure>
						<img src="/images/myprayercards/scan.png" alt="Scanning a prayer card" loading="lazy" />
						<figcaption>Scan front, then the prayer</figcaption>
					</figure>
				</div>
			</section>

			<section>
				<h2>Features</h2>
				<div class="features-grid">
					<div class="feature-card">
						<h3>Scan once, pray anytime</h3>
						<p>
							Photograph the art, then the text. You can fix the title or the words before you
							save.
						</p>
					</div>
					<div class="feature-card">
						<h3>A library that stays yours</h3>
						<p>Favorite, search, sort, and pin cards for offline.</p>
					</div>
					<div class="feature-card">
						<h3>Free, then unlimited</h3>
						<p>
							Free accounts can save 10 prayer cards. A one-time purchase unlocks unlimited cards
							on this Apple or Google account.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2>Privacy</h2>
				<p>
					<a href="/privacy">Privacy Policy</a>
					|
					<a href="/terms">Terms of Service</a>
				</p>
			</section>
		</div>
	</div>
</div>

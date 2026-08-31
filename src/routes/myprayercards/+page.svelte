<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import StoreBadges from '$lib/components/StoreBadges.svelte';

	const playUrl = 'https://play.google.com/store/apps/details?id=dev.daddoodev.myprayercards';
	const frontUrl = '/images/myprayercards/review-front.jpg';
	const backUrl = '/images/myprayercards/review-back.png';
</script>

<SEO
	title="My Prayer Cards | Daddoo Dev"
	description="Digitize the prayer cards you already own. Scan the artwork, read the prayer, and keep a private library on your phone."
	url="https://daddoodev.pro/myprayercards"
	image="https://daddoodev.pro/images/myprayercards.png"
	keywords="my prayer cards, catholic prayer cards, digitize prayer cards, prayer library, OCR prayer card"
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
					Scan the front for the artwork, then the back for the prayer. OCR runs on the text side
					only. The back photo is discarded. You can fix the title or the text before you save.
				</p>
				<p>
					Your library is private. Favorite, search, and sort your cards. Pin the ones you want
					offline. The reader puts the prayer on a calm, readable panel over the card art, with
					pinch to zoom.
				</p>
			</div>

			<div class="download-section">
				<h2>Get the app</h2>
				<p>Google Play and App Store listings are in review.</p>
				<div class="download-buttons">
					<StoreBadges googlePlay={playUrl} appStore={undefined} />
				</div>
			</div>

			<section>
				<h2>Features</h2>
				<div class="features-grid">
					<div class="feature-card">
						<h3>Front, then text</h3>
						<p>
							Capture the art side first, then the prayer side. Only the text photo is read. The
							back image is never stored.
						</p>
					</div>
					<div class="feature-card">
						<h3>One prayer, not copies</h3>
						<p>
							If that prayer already exists in the shared pool, you link to it. Unique prayers are
							added automatically. Deleting a card from your library does not remove the shared
							prayer.
						</p>
					</div>
					<div class="feature-card">
						<h3>A library that stays yours</h3>
						<p>
							Favorite, search, sort, and pin cards offline. Sign in with email and a password, or
							use a guest session on this device. There is no social login.
						</p>
					</div>
					<div class="feature-card">
						<h3>Free, then unlimited</h3>
						<p>
							Free accounts can save 10 prayer cards. A one-time purchase unlocks unlimited cards on
							this Apple or Google account.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2>In the app</h2>
				<div class="screenshot-row">
					<img src="/images/myprayercards/library.png" alt="Prayer card library" loading="lazy" />
					<img src="/images/myprayercards/reader.png" alt="Prayer reader" loading="lazy" />
					<img src="/images/myprayercards/scan.png" alt="Scanning a prayer card" loading="lazy" />
				</div>
			</section>

			<section>
				<h2>How to add a card</h2>
				<ol class="how-to-list">
					<li><strong>Photograph the front</strong> — the artwork side.</li>
					<li><strong>Photograph the back</strong> — the prayer text. OCR runs here only.</li>
					<li>
						<strong>Confirm the match</strong> — use an existing prayer if it is the same, or save a
						new one.
					</li>
					<li><strong>Keep or replace the art</strong> — reuse a known image when it is a match.</li>
				</ol>
			</section>

			<section id="review">
				<h2>For App Review</h2>
				<p>
					Print these two images, or open them full-screen on another device. In the app, tap Add
					card. Capture <strong>Front</strong> first, then <strong>Back</strong>.
				</p>
				<ol class="review-steps">
					<li>Guest works with no account. A guest can add up to 10 cards.</li>
					<li>Email sign-in is optional. Use the demo account from the store listing notes.</li>
					<li>The demo library already has a few cards so you can open the reader and search.</li>
					<li>Unlimited cards is a one-time in-app purchase, not part of the email login.</li>
				</ol>
				<div class="review-card-row">
					<figure class="review-card">
						<img src={frontUrl} alt="Sample Memento Mori prayer card front" />
						<p><strong>1. Front</strong> — photograph this side first.</p>
						<p>
							<a href={frontUrl} download="my-prayer-cards-front.jpg">Download front</a>
						</p>
					</figure>
					<figure class="review-card">
						<img src={backUrl} alt="Sample Memento Mori prayer card back" />
						<p><strong>2. Back</strong> — photograph this side second. OCR reads this text.</p>
						<p>
							<a href={backUrl} download="my-prayer-cards-back.png">Download back</a>
						</p>
					</figure>
				</div>
			</section>

			<section>
				<h2>Privacy</h2>
				<ul class="privacy-list">
					<li>Email and a user ID if you create an account.</li>
					<li>Prayer text and front artwork you add, including the shared canonical pool.</li>
					<li>Crash logs and app interaction for analytics. No advertising ID. No tracking.</li>
				</ul>
				<p>
					<a href="/privacy">Privacy Policy</a>
					|
					<a href="/terms">Terms of Service</a>
				</p>
			</section>

			<section>
				<h2>Support</h2>
				<ul class="contact-list">
					<li>Email: <a href="mailto:daddoodev@proton.me">daddoodev@proton.me</a></li>
					<li>Website: <a href="https://daddoodev.pro">https://daddoodev.pro</a></li>
				</ul>
			</section>
		</div>
	</div>
</div>

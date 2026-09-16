<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="My Prayer Cards Support | Daddoo Dev"
	description="Support for My Prayer Cards. Email Daddoo Dev, use in-app contact, or read how camera access is used when scanning prayer cards."
	url="https://daddoodev.pro/myprayercards/support"
	image="https://daddoodev.pro/images/myprayercards.png"
	keywords="my prayer cards support, prayer card help, daddoo dev support"
/>

<div class="product-page">
	<div class="container">
		<header class="page-header">
			<a class="back-button" href="/myprayercards">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				Back to My Prayer Cards
			</a>
		</header>

		<div class="app-content">
			<div class="app-header">
				<img src="/images/myprayercards.png" alt="My Prayer Cards app icon" class="app-icon" />
				<div class="app-title-section">
					<h1>My Prayer Cards Support</h1>
					<p class="app-tagline">Help and contact information for the app.</p>
				</div>
			</div>

			<div class="app-description">
				<p>
					Need help with My Prayer Cards? This is the public support destination for the app. Reach
					Daddoo Dev by email, from the website, or from inside the app.
				</p>
			</div>

			<section>
				<h2>Support</h2>
				<ul class="contact-list">
					<li>Email: <a href="mailto:daddoodev@proton.me">daddoodev@proton.me</a></li>
					<li>Website: <a href="https://daddoodev.pro">https://daddoodev.pro</a></li>
					<li>In-app: Settings → Contact support / Report a bug</li>
					<li>
						Camera: used only to scan physical prayer cards (front artwork + back prayer text). The
						back photo is discarded after OCR. You can change camera access in iOS Settings.
					</li>
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

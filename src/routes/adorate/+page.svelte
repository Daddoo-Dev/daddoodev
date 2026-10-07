<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="Adorate | Daddoo Dev"
	description="Pray your Holy Hour before the Blessed Sacrament. Plan the hour, keep time with gentle bells and a beeswax candle, and pray offline."
	url="https://daddoodev.pro/adorate"
	image="https://daddoodev.pro/images/adorate.png"
	keywords="adorate, holy hour, eucharistic adoration, catholic prayer, blessed sacrament, rosary, prayer timer"
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
				<img src="/images/adorate.png" alt="Adorate app icon" class="app-icon" />
				<div class="app-title-section">
					<h1>Adorate</h1>
					<p class="app-tagline">Pray your Holy Hour.</p>
				</div>
			</div>

			<div class="app-description">
				<p>
					Adorate helps you spend a Holy Hour before the Blessed Sacrament, at the chapel or at
					home. Choose a preset hour or build your own from an opening, meditation, Scripture,
					prayers to the saints, silence, the Rosary, an examen, and a closing.
				</p>
				<p>
					During the hour, Adorate keeps time so you don't have to. A gentle bell marks each change,
					and a beeswax candle burns down beside the prayers as the hour passes.
				</p>
			</div>

			<div class="download-section">
				<h2>Get the app</h2>
				<p>Google Play and App Store listings are in review.</p>
			</div>

			<section>
				<h2>Features</h2>
				<div class="features-grid">
					<div class="feature-card">
						<h3>Plan the hour</h3>
						<p>
							Drag the parts into the order you like, set how long each lasts, and see how close
							the plan is to the length you aim for.
						</p>
					</div>
					<div class="feature-card">
						<h3>A theme for each day</h3>
						<p>
							32 themes from the virtues, the gifts and fruits of the Holy Spirit, and the capital
							sins, each with a meditation, Scripture, and The Imitation of Christ. The liturgical
							seasons have their own.
						</p>
					</div>
					<div class="feature-card">
						<h3>Keep time</h3>
						<p>
							A bell marks each change. Stay longer in any part when you want to. Turn the candle
							off for a plain progress line.
						</p>
					</div>
					<div class="feature-card">
						<h3>Quiet backgrounds</h3>
						<p>
							For silent time, choose rain, a river, waves on stones, a town at night, soft piano,
							or Gregorian chant.
						</p>
					</div>
					<div class="feature-card">
						<h3>Your library</h3>
						<p>
							Built-in prayers and readings, plus your own: paste text, import a document or PDF,
							or take a photo of a page.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2>In the app</h2>
				<div class="screenshot-row">
					<img src="/images/adorate/session.png" alt="A reading during the Holy Hour" loading="lazy" />
					<img src="/images/adorate/rosary.png" alt="Praying the Rosary" loading="lazy" />
					<img src="/images/adorate/plan.png" alt="Editing a Holy Hour plan" loading="lazy" />
				</div>
			</section>

			<section>
				<h2>Privacy</h2>
				<ul class="privacy-list">
					<li>No account. Nothing to sign in to.</li>
					<li>Your plans, texts, and history stay on your device.</li>
					<li>Photos you choose are read into text on the device and are not uploaded.</li>
					<li>No ads. No analytics. No tracking.</li>
				</ul>
			</section>

			<section id="support">
				<h2>Support</h2>
				<p>Need help with Adorate? Reach Daddoo Dev by email or from the website.</p>
				<ul class="contact-list">
					<li>Email: <a href="mailto:daddoodev@proton.me">daddoodev@proton.me</a></li>
					<li>Website: <a href="https://daddoodev.pro">https://daddoodev.pro</a></li>
					<li>
						Photos: used only when you choose a photo of a printed prayer to add to your library.
						You can change photo access in your phone's settings.
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

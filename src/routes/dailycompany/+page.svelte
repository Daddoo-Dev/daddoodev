<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import StoreBadges from '$lib/components/StoreBadges.svelte';

	const playUrl = 'https://play.google.com/store/apps/details?id=pro.daddoodev.dailycompany';
	const appStoreUrl = 'https://apps.apple.com/us/app/daily-company/id6804503930';
</script>

<SEO
	title="Daily Company | Daddoo Dev"
	description="Daily spiritual reading with a saint and their writing. Today's reading is already waiting. Offline, no account, no streaks."
	url="https://daddoodev.pro/dailycompany"
	image="https://daddoodev.pro/images/dailycompany.png"
	keywords="daily company, spiritual reading, lectio, catholic formation, benedict, rule, saints"
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
				<img src="/images/dailycompany.png" alt="Daily Company app icon" class="app-icon" />
				<div class="app-title-section">
					<h1>Daily Company</h1>
					<p class="app-tagline">Keep company with a saint.</p>
				</div>
			</div>

			<div class="app-description">
				<p>
					Daily Company is daily spiritual reading with one writer at a time — a saint or spiritual
					master and the book they left. The hallway is the front door. You choose a house, then
					live in it: today's reading is already waiting.
				</p>
				<p>
					There is no plan to start, and no streak to break. Depth is optional. The house is the
					app.
				</p>
			</div>

			<div class="download-section">
				<h2>Get the app</h2>
				<div class="download-buttons">
					<StoreBadges googlePlay={playUrl} appStore={appStoreUrl} />
				</div>
			</div>

			<section>
				<h2>The hallway</h2>
				<p>
					Benedict, Thomas à Kempis, Francis de Sales, Ignatius, Augustine, Francis of Assisi,
					Teresa of Avila, Gregory, Alphonsus Liguori, Thérèse, John of the Cross, Catherine,
					Montfort, Scupoli, Brother Lawrence, Cassian, the Desert Fathers, Newman, Bernard, and
					Serra.
				</p>
			</section>

			<section>
				<h2>What you get</h2>
				<div class="features-grid">
					<div class="feature-card">
						<h3>Today's reading</h3>
						<p>A quiet, breviary-like page. The calendar and the text do the rest.</p>
					</div>
					<div class="feature-card">
						<h3>Benedict's house</h3>
						<p>
							The Rule on the thrice-yearly Benedictine calendar, a lay-scaled Hours, Lectio over
							the day's passage, Gregory's Life of Benedict, the Tools of Good Works, and the Medal.
						</p>
					</div>
					<div class="feature-card">
						<h3>The other houses</h3>
						<p>
							The book they left, cut for the year, and the practice that belongs to that life — de
							Sales' Bouquet, Kempis' Cell, Ignatius' Examen, Serra's journey and twenty-one
							missions.
						</p>
					</div>
					<div class="feature-card">
						<h3>Read Through</h3>
						<p>Take the book as written, if you would rather not follow the year's cycle.</p>
					</div>
					<div class="feature-card">
						<h3>Offline</h3>
						<p>After download, daily reading needs no account and no feed.</p>
					</div>
					<div class="feature-card">
						<h3>One-time unlocks</h3>
						<p>
							Unlock a house once, or All Saints for the whole hallway. No subscription. You buy a
							house the way you keep a book.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2>In the app</h2>
				<div class="screenshot-row">
					<img src="/images/dailycompany/today.png" alt="Today's reading" loading="lazy" />
					<img src="/images/dailycompany/hallway.png" alt="The hallway of houses" loading="lazy" />
					<img src="/images/dailycompany/reading.png" alt="The reading calendar" loading="lazy" />
				</div>
			</section>

			<section>
				<h2>Privacy</h2>
				<ul class="privacy-list">
					<li>No account. Nothing to sign in to.</li>
					<li>Readings, notes, and progress stay on your device.</li>
					<li>
						If the app crashes, a report may be sent. Journal text is removed from that report
						before it leaves the phone.
					</li>
					<li>Purchases are one-time, through the App Store or Google Play.</li>
					<li>No ads.</li>
				</ul>
				<p>
					<a href="/privacy">Privacy Policy</a>
					|
					<a href="/terms">Terms of Service</a>
				</p>
			</section>

			<section id="support">
				<h2>Support</h2>
				<p>
					This page is the support destination for Daily Company. Questions about a house, a
					purchase, or a reading go to Daddoo Dev.
				</p>
				<ul class="contact-list">
					<li>Email: <a href="mailto:daddoodev@proton.me">daddoodev@proton.me</a></li>
					<li>
						Website: <a href="https://daddoodev.pro/dailycompany"
							>https://daddoodev.pro/dailycompany</a
						>
					</li>
				</ul>
				<p>
					An independent app from Daddoo Dev. Not affiliated with, endorsed by, or produced by any
					monastery, abbey, congregation, or religious order.
				</p>
			</section>
		</div>
	</div>
</div>

<script lang="ts">
	import { openTerminal } from '$lib/components/terminal/terminalStore';

	const currentYear = new Date().getFullYear();
	const vscodeBase = 'https://marketplace.visualstudio.com/items?itemName=DaddooDev';
</script>

<footer class="site-footer">
	<div class="footer-grid">
		<div class="footer-brand">
			<div class="footer-brand-name">DADDOO<span class="logo-accent">_</span>DEV</div>
			<p>
				Cross-platform apps, games and developer tools — designed and shipped by Shawn McPeek.
			</p>
			<div class="footer-meta-links">
				<button type="button" class="footer-text-mode" onclick={openTerminal}>TEXT MODE</button>
			</div>
		</div>

		<div class="footer-col">
			<div class="footer-col-title">APPS</div>
			<a href="https://conclavium.app" target="_blank" rel="noopener noreferrer">Conclavium</a>
			<a href="https://ridewealthassistant.com/marketing/" target="_blank" rel="noopener noreferrer"
				>Ridewealth Assistant</a>
			<a href="/twistedfortunes">Twisted Fortunes</a>
		</div>

		<div class="footer-col">
			<div class="footer-col-title">TOOLS</div>
			<a href="/clocks">ChronoCluster</a>
			<a href="/qr-generator">QR Generator</a>
		</div>

		<div class="footer-col">
			<div class="footer-col-title">EXTENSIONS</div>
			<a href="{vscodeBase}.zivora" target="_blank" rel="noopener noreferrer">Zivora</a>
			<a href="{vscodeBase}.notchlist" target="_blank" rel="noopener noreferrer">NotchList</a>
			<a href="{vscodeBase}.addasaint" target="_blank" rel="noopener noreferrer">AddASaint</a>
			<a href="{vscodeBase}.secretkeeper" target="_blank" rel="noopener noreferrer">SecretKeeper</a>
		</div>

		<div class="footer-col">
			<div class="footer-col-title">COMPANY</div>
			<a href="/#about">About</a>
			<a href="/#projects">Work</a>
			<a href="/#contact">Contact</a>
		</div>
	</div>

	<div class="footer-subbar">
		<div class="footer-subbar-inner">
			<span>© {currentYear} Daddoo Dev · Firestone, CO</span>
			<div class="footer-subbar-links">
				<a href="/privacy">Privacy</a>
				<a href="/terms">Terms</a>
				<a href="https://github.com/Daddoo-Dev" target="_blank" rel="noopener noreferrer">GitHub</a>
				<a
					href="https://play.google.com/store/apps/developer?id=Daddoo+Dev"
					target="_blank"
					rel="noopener noreferrer">Play Store</a>
				<a href="https://apps.apple.com/us/developer/shawn-mcpeek/id1783843453" target="_blank" rel="noopener noreferrer"
					>App Store</a>
			</div>
		</div>
	</div>
</footer>

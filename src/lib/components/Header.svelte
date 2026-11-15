<script lang="ts">
	import { onMount } from 'svelte';
	import { setViewPref } from '$lib/island/preference';

	const navItems = [
		{ label: 'Work', href: '/#projects' },
		{ label: 'Tools', href: '/#tools' },
		{ label: 'Lab', href: '/clocks' },
		{ label: 'About', href: '/#about' },
		{ label: 'Contact', href: '/#contact' }
	];

	let isMenuOpen = $state(false);
	let isMobile = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	function chooseIsland() {
		setViewPref('island');
		closeMenu();
	}

	onMount(() => {
		const checkWidth = () => {
			isMobile = window.innerWidth < 768;
		};

		window.addEventListener('resize', checkWidth);
		checkWidth();

		return () => window.removeEventListener('resize', checkWidth);
	});
</script>

<header class={['header', { 'menu-open': isMenuOpen && isMobile }]}>
	<nav class="nav">
		<div class="logo">
			<a href="/#home" class="logo-wordmark">DADDOO<span class="logo-accent">_</span>DEV</a>
		</div>

		{#if isMobile}
			<button class="menu-button" type="button" onclick={toggleMenu} aria-label="Toggle menu">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					{#if isMenuOpen}
						<path d="M18 6L6 18M6 6l12 12"/>
					{:else}
						<path d="M3 12h18M3 6h18M3 18h18"/>
					{/if}
				</svg>
			</button>
		{/if}

		{#if isMobile && isMenuOpen}
			<button class="close-menu-button" type="button" onclick={toggleMenu} aria-label="Close menu">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		{/if}

		<ul class={['nav-list', { mobile: isMobile, open: isMenuOpen }]}>
			<li>
				<a href="/island" class="nav-link" onclick={chooseIsland}>Get a new point of view</a>
			</li>
			{#each navItems as item (item.href)}
				<li>
					<a href={item.href} class="nav-link" onclick={closeMenu}>{item.label}</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<script lang="ts">
	function getYearsOfExperience(): number {
		const startDate = new Date('2023-01-01');
		const today = new Date();
		let years = today.getFullYear() - startDate.getFullYear();
		const monthsDiff = today.getMonth() - startDate.getMonth();
		const daysDiff = today.getDate() - startDate.getDate();
		if (monthsDiff < 0 || (monthsDiff === 0 && daysDiff < 0)) {
			years -= 1;
		}
		return Math.max(years, 1);
	}

	const yearsOfExperience = getYearsOfExperience();
	const skills = ['Flutter', 'SvelteKit', 'TypeScript', 'Supabase', 'Firebase', 'Unity'];
</script>

<section class="about" id="about">
	<div class="container">
		<p class="section-label">ABOUT</p>
		<p class="about-narrative">
			I'm a solo developer who ships end to end — from first sketch through store submission and
			ongoing updates. Over {yearsOfExperience} years I've focused on Flutter and SvelteKit with
			TypeScript, backed by Supabase and Firebase when a project needs auth, data, or payments.
		</p>
		<div class="skill-chips">
			{#each skills as skill}
				<span class="skill-chip">{skill}</span>
			{/each}
		</div>
	</div>
</section>

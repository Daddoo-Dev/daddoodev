<script lang="ts">
	import LazyImage from './LazyImage.svelte';
	import StoreBadges from './StoreBadges.svelte';
	import { featuredProjects, toolProjects, labProjects } from '$lib/data/homeProjects';
</script>

<section class="projects-section" id="projects">
	<div class="container">
		<p class="section-label">FEATURED WORK</p>
		<div class="featured-grid">
			{#each featuredProjects as project}
				<article class="featured-card">
					<div class="featured-card__media">
						<LazyImage src={project.image} alt={project.title} objectFit="contain" />
						<span class="status-pill">LIVE ON BOTH STORES</span>
					</div>
					<h3>{project.title}</h3>
					<p class="featured-card__desc">{project.description}</p>
					<div class="tech-pills">
						{#each project.technologies as tech}
							<span class="tech-pill">{tech}</span>
						{/each}
					</div>
					<div class="featured-card__actions">
						{#if project.store?.googlePlay || project.store?.appStore}
							<StoreBadges
								googlePlay={project.store.googlePlay}
								appStore={project.store.appStore}
							/>
						{/if}
						{#if project.liveUrl}
							<a
								class="secondary-button secondary-button--compact"
								href={project.liveUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								Site
							</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<section class="projects-section" id="tools">
	<div class="container">
		<p class="section-label">DEVELOPER TOOLS</p>
		<div class="tools-grid">
			{#each toolProjects as tool}
				<a class="tool-card" href={tool.href} target="_blank" rel="noopener noreferrer">
					<img class="tool-card__icon" src={tool.image} alt="" loading="lazy" decoding="async" />
					<h4>{tool.title}</h4>
					<p>{tool.description}</p>
					<span class="tool-card__link">{tool.linkLabel} ↗</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<section class="projects-section" id="lab">
	<div class="container">
		<p class="section-label">THE LAB</p>
		<p class="lab-intro">
			Experiments, gifts, and small tools. Built for fun, kept because they work.
		</p>
		<div class="lab-strip">
			{#each labProjects as item}
				{#if item.href}
					<a
						class="lab-item"
						href={item.href}
						target={item.href.startsWith('http') ? '_blank' : undefined}
						rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
					>
						{item.title}
					</a>
				{:else}
					<span class="lab-item lab-item--static">{item.title}</span>
				{/if}
			{/each}
		</div>
	</div>
</section>

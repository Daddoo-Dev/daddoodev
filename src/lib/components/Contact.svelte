<script lang="ts">
	let formData = {
		name: '',
		email: '',
		message: ''
	};
	let isSubmitting = false;
	let submitStatus: 'idle' | 'success' | 'error' = 'idle';

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		try {
			const response = await fetch('https://formspree.io/f/xannlzpb', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				submitStatus = 'success';
				formData = { name: '', email: '', message: '' };
			} else {
				submitStatus = 'error';
			}
		} catch {
			submitStatus = 'error';
		}

		isSubmitting = false;
	}
</script>

<section class="contact" id="contact">
	<div class="contact-inner">
		<p class="section-label">CONTACT</p>
		<h2>Let's build something</h2>
		<p class="contact-sub">Have a project in mind, or just want to talk shop? Drop a line.</p>

		<form
			class="contact-form"
			on:submit={handleSubmit}
			action="https://formspree.io/f/xannlzpb"
			method="POST"
		>
			<div class="form-group">
				<label for="name">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					bind:value={formData.name}
					placeholder="Your name"
					required
				/>
			</div>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					bind:value={formData.email}
					placeholder="you@example.com"
					required
				/>
			</div>
			<div class="form-group">
				<label for="message">Message</label>
				<textarea
					id="message"
					name="message"
					bind:value={formData.message}
					rows="5"
					placeholder="Tell me about your project…"
					required
				></textarea>
			</div>
			<button type="submit" class="primary-button" disabled={isSubmitting}>
				{isSubmitting ? 'Sending…' : 'Send message'}
			</button>

			{#if submitStatus === 'success'}
				<p class="success-message">Message sent successfully!</p>
			{:else if submitStatus === 'error'}
				<p class="error-message">There was an error sending your message. Please try again.</p>
			{/if}
		</form>
	</div>
</section>

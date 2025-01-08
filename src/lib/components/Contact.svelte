<script lang="ts">
  import SectionNav from './SectionNav.svelte';
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
    } catch (error) {
      submitStatus = 'error';
    }
    
    isSubmitting = false;
  }
</script>

<section class="contact" id="contact">
  <div class="container">
    <h2 class="section-title">Get in Touch</h2>
    <div class="contact-content">
      <form 
        on:submit={handleSubmit} 
        class="contact-form"
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
            required
          ></textarea>
        </div>
        <button
          type="submit"
          class="primary-button submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
        
        {#if submitStatus === 'success'}
          <p class="success-message">Message sent successfully!</p>
        {:else if submitStatus === 'error'}
          <p class="error-message">There was an error sending your message. Please try again.</p>
        {/if}
      </form>
    </div>
  </div>
  <SectionNav />
</section> 
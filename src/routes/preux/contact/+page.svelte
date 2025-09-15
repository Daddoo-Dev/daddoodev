<script lang="ts">
  import { goto } from '$app/navigation';

  let formData = {
    name: '',
    email: '',
    message: ''
  };
  let isSubmitting = false;
  let submitStatus: 'idle' | 'success' | 'error' = 'idle';

  function goBack() {
    goto('/preux');
  }

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

<svelte:head>
  <title>Contact - Preux Support | Daddoo Dev</title>
  <meta name="description" content="Get support for Preux - Intelligent Error Tracking Dashboard. Contact our development team for assistance." />
</svelte:head>

<div class="contact-page">
  <div class="container">
    <header class="page-header">
      <button class="back-button" on:click={goBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Preux
      </button>
    </header>

    <div class="contact-content">
      <h1>Contact Support</h1>
      <p class="contact-subtitle">Get help with Preux from our development team</p>

      <div class="contact-grid">
        <div class="contact-info">
          <h2>How can we help?</h2>
          <p>Our team is here to assist you with:</p>
          <ul>
            <li>Technical support and troubleshooting</li>
            <li>Setup and configuration assistance</li>
            <li>Feature requests and feedback</li>
            <li>Subscription and billing questions</li>
            <li>Integration help with your database</li>
          </ul>

          <div class="response-time">
            <h3>Response Time</h3>
            <p>We typically respond within 24 hours during business days.</p>
          </div>
        </div>

        <div class="contact-form-section">
          <h2>Send us a message</h2>
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
              class="submit-button"
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
    </div>
  </div>
</div>

<style>
  .contact-page {
    min-height: 100vh;
    background-color: #000;
    background-image: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)),
      url('/images/vortex-bg.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    color: #e0e0e0;
    padding: 2rem 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-bottom: 2rem;
    cursor: pointer;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .contact-content {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 3rem;
    backdrop-filter: blur(20px);
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
  }

  .contact-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin-bottom: 3rem;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }

  .contact-info h2 {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 1rem;
  }

  .contact-info p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
  }

  .contact-info ul {
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
  }

  .contact-info li {
    padding: 0.5rem 0;
    color: rgba(255, 255, 255, 0.9);
    position: relative;
    padding-left: 1.5rem;
  }

  .contact-info li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-lighter);
  }

  .response-time {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .response-time h3 {
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .response-time p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .contact-form-section h2 {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 2rem;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    color: #fff;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 0.75rem;
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.15);
  }

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .form-group select option {
    background: #1a1a2e;
    color: #fff;
  }

  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  .success-message {
    color: #4ade80;
    text-align: center;
    margin-top: 1rem;
    font-weight: 600;
  }

  .error-message {
    color: #ef4444;
    text-align: center;
    margin-top: 1rem;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .contact-content {
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
    }
  }
</style>

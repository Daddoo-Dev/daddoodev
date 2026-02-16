<script lang="ts">
  import { goto } from '$app/navigation';
  import SEO from '$lib/components/SEO.svelte';
  import StoreBadges from '$lib/components/StoreBadges.svelte';
  import '$lib/styles/global.css';

  function goHome() {
    goto('/');
  }
</script>

<SEO 
  title="Twisted Fortunes - Creepy Fortune Cookies Mobile App | Daddoo Dev"
  description="Break open a fortune cookie and discover your darkly twisted destiny. Download Twisted Fortunes for iOS and Android - a delightfully creepy fortune cookie experience."
  url="https://dadddodev.pro/twistedfortunes"
  keywords="twisted fortunes, fortune cookie app, mobile app, iOS app, Android app, dark humor, creepy fortunes"
/>

<svelte:head>
  <title>Twisted Fortunes - Creepy Fortune Cookies Mobile App | Daddoo Dev</title>
  <meta name="description" content="Break open a fortune cookie and discover your darkly twisted destiny. Download Twisted Fortunes for iOS and Android." />
</svelte:head>

<div class="twistedfortunes-page">
  <div class="container">
    <header class="page-header">
      <button class="back-button" on:click={goHome}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </button>
    </header>

    <div class="app-content">
      <div class="app-header">
        <img src="/images/twistedfortune.png" alt="Twisted Fortunes App Icon" class="app-icon" />
        <div class="app-title-section">
          <h1>Twisted Fortunes</h1>
          <p class="app-tagline">Break open a fortune cookie and discover your darkly twisted destiny.</p>
        </div>
      </div>

      <div class="app-description">
        <p>
          A delightfully creepy fortune cookie experience that serves up darkly humorous fortunes with every click. 
          Perfect for those who prefer their wisdom with a side of sinister humor.
        </p>
      </div>

      <div class="download-section">
        <h2>Download on Mobile</h2>
        <div class="download-buttons">
          <StoreBadges
            googlePlay="https://play.google.com/store/apps/details?id=com.daddoodev.twistedfortunes"
            appStore="https://apps.apple.com/us/app/twisted-fortunes/id6756530267"
          />
        </div>
      </div>

      <section class="features-section">
        <h2>Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>🎲 Endless Twisted Fortunes</h3>
            <p>Break open fortune cookies to reveal darkly humorous fortunes. Each cookie holds a unique, twisted message waiting to be discovered.</p>
          </div>
          <div class="feature-card">
            <h3>🔊 Atmospheric Sound Effects</h3>
            <p>Experience the satisfying crack of breaking a fortune cookie with immersive sound effects. Toggle sound on or off anytime.</p>
          </div>
          <div class="feature-card">
            <h3>🎁 Extra Fortunes</h3>
            <p>Watch a short ad to instantly get another fortune without waiting. Perfect for when you need that extra dose of twisted wisdom.</p>
          </div>
          <div class="feature-card">
            <h3>🎨 Beautiful Dark Aesthetic</h3>
            <p>Immerse yourself in a beautifully designed dark theme with animated particles and glowing text effects that bring the twisted atmosphere to life.</p>
          </div>
          <div class="feature-card">
            <h3>🔒 Privacy First</h3>
            <p>Your privacy matters. The app works completely offline, collects zero personal data, and only stores your sound preference locally on your device.</p>
          </div>
          <div class="feature-card">
            <h3>📱 Works Offline</h3>
            <p>All fortunes are bundled with the app, so no internet connection is required to enjoy your twisted destiny.</p>
          </div>
        </div>
      </section>

      <section class="how-to-section">
        <h2>How to Play</h2>
        <ol class="how-to-list">
          <li><strong>Click the fortune cookie</strong> to break it open</li>
          <li><strong>Read your twisted fortune</strong> and ponder its dark wisdom</li>
          <li><strong>Get another fortune</strong> instantly, or watch an ad for an extra one</li>
        </ol>
        <p>It's that simple. No accounts, no sign-ups, just pure twisted fortune fun.</p>
      </section>

      <section class="privacy-section">
        <h2>Privacy & Data</h2>
        <p>We believe in privacy by design:</p>
        <ul class="privacy-list">
          <li><strong>No data collection</strong> - We don't collect, store, or transmit any personal information</li>
          <li><strong>Works offline</strong> - All fortunes are bundled with the app, no internet required</li>
          <li><strong>Local storage only</strong> - Only your sound preference is saved on your device</li>
          <li><strong>No tracking</strong> - No analytics, no cookies, no surveillance</li>
        </ul>
        <p>
          <a href="/twistedfortunes/privacy" class="privacy-link">Read the Twisted Fortunes Privacy Policy →</a> | 
          <a href="/privacy" class="privacy-link">General Privacy Policy →</a>
        </p>
      </section>

      <section class="support-section">
        <h2>Support</h2>
        <p>If you have questions, feedback, or need support with the Twisted Fortunes app, please contact us:</p>
        <ul class="contact-list">
          <li>Email: <a href="mailto:daddoodev@proton.me">daddoodev@proton.me</a></li>
          <li>Website: <a href="https://dadddodev.pro">https://dadddodev.pro</a></li>
        </ul>
      </section>

      <section class="disclaimer-section">
        <h2>Disclaimer</h2>
        <p>
          These fortunes are purely for entertainment purposes. Any resemblance to actual events, persons, 
          or dark prophecies is purely coincidental. 😈
        </p>
      </section>

      <section class="developer-section">
        <h2>About the Developer</h2>
        <p>
          Twisted Fortunes is created by <a href="https://dadddodev.pro">Daddoo Dev</a>, a software developer 
          specializing in mobile apps, web development, and developer tools.
        </p>
        <p>
          Enjoying Twisted Fortunes? 
          <a href="https://buymeacoffee.com/daddoodev" target="_blank" rel="noopener noreferrer">
            Consider buying me a coffee
          </a> to support future updates and features!
        </p>
      </section>
    </div>
  </div>
</div>

<style>
  .twistedfortunes-page {
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
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .page-header {
    margin-bottom: 3rem;
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
    cursor: pointer;
    font-size: 1rem;
    font-family: inherit;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .app-content {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 3rem;
    backdrop-filter: blur(10px);
  }

  .app-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  }

  .app-icon {
    width: 120px;
    height: 120px;
    border-radius: 24px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .app-title-section {
    flex: 1;
  }

  h1 {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .app-tagline {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;
    margin: 0;
  }

  .app-description {
    margin-bottom: 3rem;
  }

  .app-description p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.8;
  }

  .download-section {
    margin-bottom: 4rem;
    text-align: center;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
  }

  .download-section h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #fff;
  }

  .download-buttons {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  section {
    margin-bottom: 3rem;
  }

  h2 {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
    padding-bottom: 0.5rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.75rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .feature-card {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .feature-card p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin: 0;
  }

  .how-to-section p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-top: 1rem;
  }

  .how-to-list {
    color: rgba(255, 255, 255, 0.9);
    margin-left: 1.5rem;
    margin-bottom: 1rem;
    line-height: 1.8;
  }

  .how-to-list li {
    margin-bottom: 0.75rem;
  }

  .how-to-list strong {
    color: #fff;
    font-weight: 600;
  }

  .privacy-list,
  .contact-list {
    color: rgba(255, 255, 255, 0.9);
    margin-left: 1.5rem;
    margin-bottom: 1rem;
    line-height: 1.8;
  }

  .privacy-list li,
  .contact-list li {
    margin-bottom: 0.75rem;
  }

  .privacy-list strong {
    color: #fff;
    font-weight: 600;
  }

  .privacy-link {
    color: var(--primary-lighter);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }

  .privacy-link:hover {
    color: var(--primary-light);
    text-decoration: underline;
  }

  .contact-list a {
    color: var(--primary-lighter);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .contact-list a:hover {
    color: var(--primary-light);
    text-decoration: underline;
  }

  .support-section p,
  .disclaimer-section p,
  .developer-section p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .developer-section a {
    color: var(--primary-lighter);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .developer-section a:hover {
    color: var(--primary-light);
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .app-content {
      padding: 2rem;
    }

    .app-header {
      flex-direction: column;
      text-align: center;
      gap: 1.5rem;
    }

    h1 {
      font-size: 1.75rem;
      letter-spacing: 0.03em;
    }

    .app-tagline {
      font-size: 1.1rem;
    }

    h2 {
      font-size: 1.25rem;
      letter-spacing: 0.03em;
    }

    .download-buttons {
      flex-direction: column;
      align-items: center;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
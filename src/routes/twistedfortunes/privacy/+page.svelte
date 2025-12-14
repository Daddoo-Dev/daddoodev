<script lang="ts">
  import { goto } from '$app/navigation';
  import SEO from '$lib/components/SEO.svelte';
  import '$lib/styles/global.css';

  function goBack() {
    goto('/twistedfortunes');
  }
</script>

<SEO 
  title="Privacy Policy - Twisted Fortunes | Daddoo Dev"
  description="Privacy Policy for Twisted Fortunes mobile app. Learn how we handle your information when you use our app."
  url="https://dadddodev.pro/twistedfortunes/privacy"
  keywords="twisted fortunes privacy policy, mobile app privacy, data collection, iOS privacy, Android privacy"
/>

<svelte:head>
  <title>Privacy Policy - Twisted Fortunes | Daddoo Dev</title>
  <meta name="description" content="Privacy Policy for Twisted Fortunes mobile app. Learn how we handle your information when you use our app." />
</svelte:head>

<div class="privacy-page">
  <div class="container">
    <header class="page-header">
      <button class="back-button" on:click={goBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Twisted Fortunes
      </button>
    </header>

    <div class="privacy-content">
      <h1>Privacy Policy</h1>
      <p class="last-updated">Last updated: January 14, 2025</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Daddoo Dev ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
          how we handle information when you use the Twisted Fortunes mobile application ("App").
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <p>
          <strong>Twisted Fortunes does not collect, store, or transmit any personal information.</strong>
        </p>
        <p>The App operates entirely offline and locally on your device. The only data stored is:</p>
        <ul>
          <li><strong>Mute Preference:</strong> Your sound mute/unmute preference is stored locally on your device using local storage. This data never leaves your device and is not shared with anyone.</li>
        </ul>
        <p>
          All fortunes are bundled with the App and no internet connection is required for core functionality. 
          No accounts or user registration is required.
        </p>
      </section>

      <section>
        <h2>3. Third-Party Services</h2>
        
        <h3>3.1 Advertisements</h3>
        <p>
          The App includes optional rewarded advertisements through <strong>Google AdMob</strong>. When you choose to watch 
          an ad for an extra fortune, Google AdMob may collect anonymous usage data per Google's privacy policy. 
          We do not collect, receive, or have access to any data collected by Google AdMob. For more information, 
          please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.
        </p>
        
        <h3>3.2 External Links</h3>
        <p>
          The App may include links to external websites (such as "Buy Me a Coffee" support links) that open in 
          your default web browser. When you click these links, you will be directed to third-party websites, 
          which have their own privacy policies. We are not responsible for the privacy practices of third-party websites.
        </p>
      </section>

      <section>
        <h2>4. Data Sharing and Disclosure</h2>
        <p>
          We do not collect personal information, therefore we do not and cannot share, sell, trade, or rent any 
          personal information to third parties.
        </p>
        <p>
          As mentioned above, when you interact with optional advertisements through Google AdMob, Google may 
          collect anonymous data according to their privacy policy, but this data is not shared with us.
        </p>
      </section>

      <section>
        <h2>5. Data Security</h2>
        <p>
          Since we do not collect or transmit any personal data, there is no risk of data breaches or unauthorized 
          access to your personal information through our App. All App functionality operates entirely on your device, 
          and the only locally stored data is your sound preference setting.
        </p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>
          Since we do not collect personal information, there is no personal data to access, correct, or delete. 
          You can clear the App's local storage (including your mute preference) by uninstalling and reinstalling 
          the App, or through your device's application settings.
        </p>
        <p>
          If you have questions about this Privacy Policy, please contact us at daddoodev@proton.me
        </p>
      </section>

      <section>
        <h2>7. Children's Privacy</h2>
        <p>
          Our App is suitable for all ages. We do not knowingly collect any information from anyone, including children. 
          Since the App does not collect any personal information, there is no data collection from children or adults.
        </p>
      </section>

      <section>
        <h2>8. International Data Transfers</h2>
        <p>
          Since we do not collect or transmit any personal information, no international data transfers occur. 
          All App functionality operates locally on your device.
        </p>
      </section>

      <section>
        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 
          "Last updated" date. Continued use of the App after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2>10. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us:</p>
        <ul>
          <li>Email: daddoodev@proton.me</li>
          <li>Website: <a href="https://dadddodev.pro">https://dadddodev.pro</a></li>
          <li>Twisted Fortunes Page: <a href="https://dadddodev.pro/twistedfortunes">https://dadddodev.pro/twistedfortunes</a></li>
        </ul>
      </section>

      <section>
        <h2>11. Related Policies</h2>
        <p>
          This Privacy Policy is specific to the Twisted Fortunes mobile application. For information about 
          our general privacy practices across all products and services, please see our 
          <a href="/privacy">general Privacy Policy</a>.
        </p>
      </section>
    </div>
  </div>
</div>

<style>
  .privacy-page {
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
    max-width: 800px;
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

  .privacy-content {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 3rem;
    backdrop-filter: blur(10px);
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
  }

  .last-updated {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    margin-bottom: 3rem;
  }

  section {
    margin-bottom: 2.5rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 1rem;
    border-bottom: 2px solid rgba(102, 126, 234, 0.3);
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--primary-lighter);
    margin: 1.5rem 0 0.75rem 0;
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  ul {
    color: rgba(255, 255, 255, 0.9);
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  strong {
    color: #fff;
    font-weight: 600;
  }

  a {
    color: var(--primary-lighter);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  a:hover {
    color: var(--primary-light);
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .privacy-content {
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
    }

    h2 {
      font-size: 1.3rem;
    }
  }
</style>
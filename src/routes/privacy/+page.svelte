<script lang="ts">
  import { goto } from '$app/navigation';

  function goHome() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Privacy Policy | Daddoo Dev</title>
  <meta name="description" content="Privacy Policy for Daddoo Dev - Learn how we collect, use, and protect your information." />
</svelte:head>

<div class="privacy-page">
  <div class="container">
    <header class="page-header">
      <button class="back-button" on:click={goHome}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </button>
    </header>

    <div class="privacy-content">
      <h1>Privacy Policy</h1>
      <p class="last-updated">Last updated: January 14, 2025</p>

      <section>
        <h2>1. Introduction</h2>
        <p>Daddoo Dev ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Information You Provide</h3>
        <p>We collect information that you voluntarily provide to us when you:</p>
        <ul>
          <li>Fill out contact forms (name, email, message)</li>
          <li>Subscribe to our newsletter or mailing list</li>
          <li>Purchase products or services (processed through third-party payment providers)</li>
          <li>Create an account for our products</li>
        </ul>

        <h3>2.2 Automatically Collected Information</h3>
        <p>When you visit our website, we may automatically collect:</p>
        <ul>
          <li>IP address and browser information</li>
          <li>Pages visited and time spent on pages</li>
          <li>Referring website addresses</li>
          <li>Device and operating system information</li>
        </ul>

        <h3>2.3 Cookies and Tracking Technologies</h3>
        <p>We use cookies and similar tracking technologies to improve your experience on our website. You can control cookie preferences through your browser settings.</p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Respond to your inquiries and provide customer support</li>
          <li>Process transactions and send confirmations</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Improve our website and services</li>
          <li>Detect and prevent fraud or abuse</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party services that may collect information:</p>
        
        <h3>4.1 Payment Processing</h3>
        <p><strong>RevenueCat & Stripe:</strong> Payment information is processed securely through RevenueCat and Stripe. We do not store credit card information on our servers.</p>
        
        <h3>4.2 Email Services</h3>
        <p><strong>Formspree:</strong> Contact form submissions are processed through Formspree. Your email and message are transmitted securely.</p>
        
        <h3>4.3 Hosting</h3>
        <p><strong>Firebase Hosting:</strong> Our website is hosted on Google Firebase, which may collect standard web server logs.</p>

        <h3>4.4 Analytics</h3>
        <p>We may use analytics services to understand how visitors use our site. These services may use cookies and similar technologies.</p>
      </section>

      <section>
        <h2>5. Data Sharing and Disclosure</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share information:</p>
        <ul>
          <li>With service providers who assist in our operations (payment processors, email services)</li>
          <li>When required by law or to protect our rights</li>
          <li>In connection with a business transfer or merger</li>
          <li>With your explicit consent</li>
        </ul>
      </section>

      <section>
        <h2>6. Product-Specific Privacy</h2>
        
        <h3>6.1 Preux - Error Tracking Dashboard</h3>
        <p>Preux collects error logs and application data as part of its error tracking functionality. This data is stored in your chosen database (Supabase, PostgreSQL, MongoDB, etc.) and is under your control. We do not have access to your error data unless you explicitly grant it for support purposes.</p>
        
        <h3>6.2 ToDoSync - VS Code Extension</h3>
        <p>ToDoSync connects to your Notion workspace using API keys you provide. We do not store or have access to your Notion data or API keys. All data remains in your Notion workspace.</p>
        
        <h3>6.3 AddASaint - VS Code Extension</h3>
        <p>AddASaint operates entirely locally within VS Code. No data is collected or transmitted to external servers.</p>
      </section>

      <section>
        <h2>7. Data Security</h2>
        <p>We implement appropriate technical and organizational security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
      </section>

      <section>
        <h2>8. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt-out of marketing communications</li>
          <li>Object to processing of your information</li>
        </ul>
        <p>To exercise these rights, contact us at daddoodev@proton.me</p>
      </section>

      <section>
        <h2>9. Children's Privacy</h2>
        <p>Our services are not intended for children under 13. We do not knowingly collect information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.</p>
      </section>

      <section>
        <h2>10. International Data Transfers</h2>
        <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.</p>
      </section>

      <section>
        <h2>11. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
      </section>

      <section>
        <h2>12. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us:</p>
        <ul>
          <li>Email: daddoodev@proton.me</li>
          <li>Website: https://dadddodev.pro</li>
        </ul>
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

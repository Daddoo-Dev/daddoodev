<script lang="ts">
  import { goto } from '$app/navigation';

  function goHome() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Terms of Service | Daddoo Dev</title>
  <meta name="description" content="Terms of Service for Daddoo Dev - Review our terms and conditions for using our website and services." />
</svelte:head>

<div class="terms-page">
  <div class="container">
    <header class="page-header">
      <button class="back-button" on:click={goHome}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </button>
    </header>

    <div class="terms-content">
      <h1>Terms of Service</h1>
      <p class="last-updated">Last updated: January 14, 2025</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using the Daddoo Dev website and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.</p>
      </section>

      <section>
        <h2>2. Description of Services</h2>
        <p>Daddoo Dev provides:</p>
        <ul>
          <li>Software development tools and applications</li>
          <li>VS Code extensions</li>
          <li>Desktop applications</li>
          <li>Web applications and services</li>
          <li>Information about our products and services</li>
        </ul>
      </section>

      <section>
        <h2>3. User Accounts</h2>
        <h3>3.1 Account Creation</h3>
        <p>Some Services may require you to create an account. You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use</li>
        </ul>

        <h3>3.2 Account Requirements</h3>
        <p>You must be at least 13 years old to create an account. You must provide accurate and complete information.</p>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use our Services for any illegal purposes</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt our Services</li>
          <li>Distribute malware or harmful code</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Harass, abuse, or harm other users</li>
        </ul>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <h3>5.1 Our Content</h3>
        <p>All content on this website, including text, graphics, logos, software, and images, is the property of Daddoo Dev and is protected by copyright and other intellectual property laws.</p>

        <h3>5.2 User Content</h3>
        <p>By submitting content to our Services (such as feedback or support requests), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content for the purpose of operating and improving our Services.</p>
      </section>

      <section>
        <h2>6. Product-Specific Terms</h2>
        <p>Each product or service may have additional terms and conditions. Please refer to product-specific documentation:</p>
        <ul>
          <li>Zivora - See VS Code Marketplace listing for license terms</li>
          <li>ToDoSync - See VS Code Marketplace listing for license terms</li>
          <li>AddASaint - See VS Code Marketplace listing for license terms</li>
        </ul>
      </section>

      <section>
        <h2>7. Payment and Subscriptions</h2>
        <h3>7.1 Pricing</h3>
        <p>Prices for our products and services are listed on our website and may change without notice. All prices are in USD unless otherwise specified.</p>

        <h3>7.2 Payment Processing</h3>
        <p>Payments are processed through third-party payment processors (RevenueCat, Stripe). By making a purchase, you agree to their terms of service.</p>

        <h3>7.3 Refunds</h3>
        <p>Refund policies vary by product. Please refer to product-specific terms for refund information.</p>
      </section>

      <section>
        <h2>8. Disclaimer of Warranties</h2>
        <p>Our Services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:</p>
        <ul>
          <li>The Services will be uninterrupted or error-free</li>
          <li>Defects will be corrected</li>
          <li>The Services are free of viruses or harmful components</li>
          <li>Results from using the Services will meet your requirements</li>
        </ul>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Daddoo Dev shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our Services. Our total liability shall not exceed the amount paid by you for the specific Service in question.</p>
      </section>

      <section>
        <h2>10. Indemnification</h2>
        <p>You agree to indemnify and hold harmless Daddoo Dev from any claims, damages, losses, liabilities, and expenses arising from your use of our Services or violation of these Terms.</p>
      </section>

      <section>
        <h2>11. Termination</h2>
        <p>We reserve the right to suspend or terminate your access to our Services at any time, with or without cause, with or without notice. Upon termination, your right to use the Services will immediately cease.</p>
      </section>

      <section>
        <h2>12. Governing Law</h2>
        <p>These Terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
      </section>

      <section>
        <h2>13. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. Your continued use of our Services after changes constitutes acceptance of the modified Terms.</p>
      </section>

      <section>
        <h2>14. Severability</h2>
        <p>If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</p>
      </section>

      <section>
        <h2>15. Contact Information</h2>
        <p>For questions about these Terms, please contact us:</p>
        <ul>
          <li>Email: daddoodev@proton.me</li>
          <li>Website: https://dadddodev.pro</li>
        </ul>
      </section>
    </div>
  </div>
</div>

<style>
  .terms-page {
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

  .terms-content {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 3rem;
    backdrop-filter: blur(10px);
  }

  h1 {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
    letter-spacing: 0.05em;
    text-transform: uppercase;
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

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .terms-content {
      padding: 2rem;
    }

    h1 {
      font-size: 1.75rem;
      letter-spacing: 0.03em;
    }

    h2 {
      font-size: 1.3rem;
    }
  }
</style>

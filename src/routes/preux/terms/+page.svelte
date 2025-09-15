<script lang="ts">
  import { goto } from '$app/navigation';

  function goBack() {
    goto('/preux');
  }
</script>

<svelte:head>
  <title>Terms and Conditions - Preux | Daddoo Dev</title>
  <meta name="description" content="Terms and Conditions for Preux - Intelligent Error Tracking Dashboard" />
</svelte:head>

<div class="terms-page">
  <div class="container">
    <header class="page-header">
      <button class="back-button" on:click={goBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Preux
      </button>
    </header>

    <div class="terms-content">
      <h1>Terms and Conditions</h1>
      <p class="last-updated">Last updated: January 14, 2025</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By purchasing, downloading, installing, or using Preux ("the Software"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, do not use the Software.</p>
      </section>

      <section>
        <h2>2. Software License</h2>
        <p>Preux is licensed, not sold. Upon purchase, you are granted a non-exclusive, non-transferable license to use the Software in accordance with your subscription plan:</p>
        <ul>
          <li><strong>Monthly Plan:</strong> Valid for 30 days from purchase date</li>
          <li><strong>Yearly Plan:</strong> Valid for 365 days from purchase date</li>
          <li><strong>Lifetime Plan:</strong> Valid indefinitely for the current major version</li>
        </ul>
      </section>

      <section>
        <h2>3. Subscription Terms</h2>
        <h3>3.1 Billing and Renewal</h3>
        <p>Monthly and yearly subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time through your account settings.</p>
        
        <h3>3.2 Plan Limitations</h3>
        <ul>
          <li><strong>Monthly Plan:</strong> Up to 5 projects, basic support</li>
          <li><strong>Yearly Plan:</strong> Up to 25 projects, priority support, advanced analytics</li>
          <li><strong>Lifetime Plan:</strong> Unlimited projects, premium support, custom integrations</li>
        </ul>
      </section>

      <section>
        <h2>4. Data Handling and Privacy</h2>
        <h3>4.1 Error Data Collection</h3>
        <p>Preux collects error logs, stack traces, and application performance data from your connected applications. This data is processed using AI-powered analysis to provide insights and recommendations.</p>
        
        <h3>4.2 Data Security</h3>
        <p>All data is encrypted in transit and at rest. We implement industry-standard security measures to protect your data. You retain ownership of all data collected by Preux.</p>
        
        <h3>4.3 Database Connections</h3>
        <p>Preux connects to your databases (Supabase, PostgreSQL, MySQL, MongoDB, PlanetScale) for error logging purposes. Connection credentials are stored securely and encrypted.</p>
      </section>

      <section>
        <h2>5. AI-Powered Features</h2>
        <p>Preux uses the Gemma 3 270M IT model for error classification and analysis. The AI processing occurs on our secure servers and does not store your source code or sensitive business logic.</p>
      </section>

      <section>
        <h2>6. SDK Usage Rights</h2>
        <p>Preux provides SDKs for Flutter, React, Vue.js, Angular, Node.js, Python, Java, and C#. You may integrate these SDKs into your applications for error tracking purposes only.</p>
      </section>

      <section>
        <h2>7. Support Terms</h2>
        <ul>
          <li><strong>Monthly Plan:</strong> Email support within 48 hours</li>
          <li><strong>Yearly Plan:</strong> Priority email support within 24 hours</li>
          <li><strong>Lifetime Plan:</strong> Premium support including custom integrations and dedicated assistance</li>
        </ul>
      </section>

      <section>
        <h2>8. Refund Policy</h2>
        <p>We offer a 30-day money-back guarantee for all subscription plans. Refunds are processed within 5-7 business days. Lifetime purchases are non-refundable after 30 days.</p>
      </section>

      <section>
        <h2>9. Prohibited Uses</h2>
        <p>You may not:</p>
        <ul>
          <li>Reverse engineer, decompile, or disassemble the Software</li>
          <li>Use the Software for illegal activities or to violate others' rights</li>
          <li>Share your license with others or resell the Software</li>
          <li>Attempt to circumvent security measures or usage limitations</li>
        </ul>
      </section>

      <section>
        <h2>10. Updates and Maintenance</h2>
        <p>Preux may receive updates, bug fixes, and new features. Major version updates may require separate licensing for lifetime plan holders.</p>
      </section>

      <section>
        <h2>11. Limitation of Liability</h2>
        <p>Daddoo Dev shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of Preux. Our total liability shall not exceed the amount paid for the Software.</p>
      </section>

      <section>
        <h2>12. Termination</h2>
        <p>We may terminate your license immediately if you violate these Terms. Upon termination, you must cease all use of the Software and delete all copies.</p>
      </section>

      <section>
        <h2>13. Governing Law</h2>
        <p>These Terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration.</p>
      </section>

      <section>
        <h2>14. Contact Information</h2>
        <p>For questions about these Terms, contact us at:</p>
        <ul>
          <li>Email: daddoodev@proton.me</li>
          <li>Website: https:/www./daddoodev.pro</li>
        </ul>
      </section>

      <section>
        <h2>15. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of Preux constitutes acceptance of modified Terms.</p>
      </section>
    </div>
  </div>
</div>

<style>
  .terms-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
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
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .terms-content {
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

    .terms-content {
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

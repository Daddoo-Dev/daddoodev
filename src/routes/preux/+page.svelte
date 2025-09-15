<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import PurchaseButton from '$lib/components/PurchaseButton.svelte';
  import { getPurchaseUrl } from '$lib/config/revenuecat';

  let versionData: any = null;
  let loading = true;
  let error = '';

  // Pricing plans
  const pricingPlans = [
    {
      name: "Preux License",
      price: "$9.99",
      period: "per year",
      description: "Full access to all Preux features",
      features: [
        "AI-Powered Error Classification using Gemma 3 270M IT model",
        "Universal Database Support (Supabase, PostgreSQL, MySQL, MongoDB, PlanetScale)",
        "Multi-Framework SDKs (Flutter, React, Vue.js, Angular, Node.js, Python, Java, C#)",
        "Real-time Error Monitoring and Analytics",
        "Professional Material Design 3 Interface",
        "Mock Testing System for Development",
        "2-week free trial included"
      ],
      plan: "yearly" as const,
      popular: false
    }
  ];

  onMount(async () => {
    try {
      const response = await fetch('/preux/api/latest-version.json');
      if (response.ok) {
        versionData = await response.json();
      } else {
        error = 'Failed to load version information';
      }
    } catch (err) {
      error = 'Error loading version information';
    } finally {
      loading = false;
    }
  });

  function goBack() {
    goto('/');
  }

  function handlePurchase(plan: 'yearly') {
    // For now, we'll use anonymous purchases
    // Later you can implement user authentication and pass appUserId
    const purchaseUrl = getPurchaseUrl(plan);
    window.open(purchaseUrl, '_blank');
  }
</script>

<svelte:head>
  <title>Preux - Intelligent Error Tracking Dashboard | Daddoo Dev</title>
  <meta name="description" content="Preux is a comprehensive error tracking and monitoring platform with AI-powered insights and multi-database support for modern development workflows." />
</svelte:head>

<div class="preux-page">
  <div class="container">
    <!-- Header -->
    <header class="page-header">
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>Preux</h1>
            <p class="pronunciation">pronounced "pruh"</p>
            <p class="tagline">Intelligent Error Tracking Dashboard</p>
            <p class="description">
              Database-agnostic error tracking that works with your existing infrastructure. 
              Get AI-powered insights without vendor lock-in - works with Supabase, PostgreSQL, 
              MySQL, MongoDB, and PlanetScale.
            </p>
            <div class="hero-highlights">
              <div class="highlight">
                <span class="highlight-icon">⚡</span>
                <span>2-week free trial</span>
              </div>
              <div class="highlight">
                <span class="highlight-icon">💰</span>
                <span>Then $9.99/year</span>
              </div>
              <div class="highlight">
                <span class="highlight-icon">🔧</span>
                <span>Setup in minutes</span>
              </div>
            </div>
          </div>
          <div class="hero-image">
            <img src="/images/preuxtext.png" alt="Preux Logo" />
          </div>
        </div>
      </div>
    </header>

    <!-- Why Choose Preux Section -->
    <section class="why-choose-section">
      <h2>Why Choose Preux?</h2>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">🔓</div>
          <h3>No Vendor Lock-in</h3>
          <p>Works with your existing database infrastructure. Switch providers anytime without losing your error data.</p>
        </div>
        
        <div class="benefit-card">
          <div class="benefit-icon">🤖</div>
          <h3>AI-Powered Insights</h3>
          <p>Get instant error classification and root cause analysis. Spend less time debugging, more time building.</p>
        </div>
        
        <div class="benefit-card">
          <div class="benefit-icon">⚡</div>
          <h3>Quick Setup</h3>
          <p>Add SDK, connect database, start tracking. Get up and running in minutes, not hours.</p>
        </div>
        
        <div class="benefit-card">
          <div class="benefit-icon">💰</div>
          <h3>Affordable Pricing</h3>
          <p>Annual pricing that won't break the bank. Get enterprise-level error tracking at a fraction of the cost.</p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2>Core Features</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>Intelligent Error Analysis</h3>
          <ul>
            <li>AI-Powered Classification using Gemma 3 270M IT model</li>
            <li>Smart Pattern Detection</li>
            <li>Root Cause Analysis with AI-generated explanations</li>
            <li>Automatic Priority Scoring</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🗄️</div>
          <h3>Universal Database Support</h3>
          <ul>
            <li>Supabase - Real-time PostgreSQL</li>
            <li>PostgreSQL - Self-hosted or cloud instances</li>
            <li>MySQL - Traditional MySQL and MariaDB</li>
            <li>MongoDB - Document-based NoSQL</li>
            <li>PlanetScale - Serverless MySQL platform</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>Multi-Framework SDKs</h3>
          <ul>
            <li>Flutter/Dart - Cross-platform mobile and desktop</li>
            <li>React - Modern web applications</li>
            <li>Vue.js - Progressive web framework</li>
            <li>Angular - Enterprise web applications</li>
            <li>Node.js - Server-side JavaScript</li>
            <li>Python - Flask, Django frameworks</li>
            <li>Java - Spring Boot and enterprise apps</li>
            <li>C#/.NET - Microsoft ecosystem</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Advanced Analytics</h3>
          <ul>
            <li>Real-time Monitoring and notifications</li>
            <li>Multi-project dashboard management</li>
            <li>Intelligent error grouping and deduplication</li>
            <li>Performance metrics and trends</li>
            <li>User impact analysis</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>Professional Interface</h3>
          <ul>
            <li>Modern Material Design 3 UI</li>
            <li>Dark/light theme support</li>
            <li>Responsive design for desktop workflows</li>
            <li>Intuitive developer-focused navigation</li>
            <li>Real-time data synchronization</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🧪</div>
          <h3>Mock Testing System</h3>
          <ul>
            <li>Test all features without real infrastructure</li>
            <li>Realistic simulations and mock connections</li>
            <li>Comprehensive SDK generation testing</li>
            <li>Development-ready immediate testing</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Version and Pricing Section -->
    <section class="version-pricing-section">
      <div class="version-pricing-grid">
        <!-- Version Information Column -->
        <div class="version-column">
          {#if loading}
            <div class="loading">Loading version information...</div>
          {:else if error}
            <div class="error">{error}</div>
          {:else if versionData}
            <div class="version-card">
              <h2>Latest Version Information</h2>
              <div class="version-header">
                <span class="version-number">v{versionData.version}</span>
                <span class="version-date">{new Date(versionData.releaseDate).toLocaleDateString()}</span>
              </div>
              <div class="version-details">
                <h3>{versionData.title}</h3>
                <p class="version-description">{versionData.description}</p>
                
                <div class="version-features">
                  <h4>Key Features:</h4>
                  <ul>
                    {#each versionData.keyFeatures as feature}
                      <li>{feature}</li>
                    {/each}
                  </ul>
                </div>

                <div class="version-improvements">
                  <h4>Improvements:</h4>
                  <ul>
                    {#each versionData.improvements as improvement}
                      <li>{improvement}</li>
                    {/each}
                  </ul>
                </div>

                {#if versionData.bugFixes && versionData.bugFixes.length > 0}
                  <div class="version-bugfixes">
                    <h4>Bug Fixes:</h4>
                    <ul>
                      {#each versionData.bugFixes as fix}
                        <li>{fix}</li>
                      {/each}
                    </ul>
                  </div>
                {/if}

                <div class="version-download">
                  <a href={versionData.downloadUrl} class="download-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Preux
                  </a>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Pricing Column -->
        <div class="pricing-column">
          <div class="pricing-card">
            <h2>Purchase Preux</h2>
            <p class="pricing-subtitle">2-week free trial, then $9.99/year for full access</p>
            
            {#each pricingPlans as plan}
              <div class="plan-card" class:popular={plan.popular}>
                {#if plan.popular}
                  <div class="popular-badge">Most Popular</div>
                {/if}
                
                <div class="plan-header">
                  <h3>{plan.name}</h3>
                  <div class="price">
                    <span class="amount">{plan.price}</span>
                    <span class="period">{plan.period}</span>
                  </div>
                  <p class="plan-description">{plan.description}</p>
                </div>
                
                <div class="plan-features">
                  <ul>
                    {#each plan.features as feature}
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        {feature}
                      </li>
                    {/each}
                  </ul>
                </div>
                
                <div class="plan-action">
                  <PurchaseButton 
                    variant="primary" 
                    size="large"
                    buttonText="Purchase Subscription"
                    purchaseUrl={getPurchaseUrl(plan.plan)}
                    on:click={() => handlePurchase(plan.plan)}
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="preux-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <a href="/" class="footer-brand-link">Daddoo Dev</a>
        </div>
        <div class="footer-links">
          <a href="/preux/contact" class="footer-link">Contact</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Daddoo Dev. All rights reserved.</p>
      </div>
    </footer>
  </div>
</div>

<style>
  .preux-page {
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

  .page-header {
    margin-bottom: 4rem;
  }

  .hero-section {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 3rem;
    margin-bottom: 3rem;
  }

  .hero-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 3rem;
    align-items: center;
  }

  .hero-text h1 {
    font-size: 4rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .pronunciation {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
    margin-bottom: 1rem;
  }

  .tagline {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--primary-lighter);
    margin-bottom: 1.5rem;
  }

  .description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
  }

  .hero-highlights {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  .highlight {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
  }

  .highlight-icon {
    font-size: 1.2rem;
  }

  .highlight span:last-child {
    font-weight: 600;
    color: #fff;
  }

  .hero-image {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hero-image img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
  }

  .features-section,
  .why-choose-section,
  .version-pricing-section {
    margin-bottom: 4rem;
  }

  .features-section h2,
  .why-choose-section h2 {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }

  /* Why Choose Preux Section */
  .why-choose-section {
    text-align: center;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .benefit-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
  }

  .benefit-card:hover {
    transform: translateY(-5px);
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .benefit-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .benefit-card h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 1rem;
  }

  .benefit-card p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    font-size: 1rem;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #fff;
  }

  .feature-card ul {
    list-style: none;
    padding: 0;
  }

  .feature-card li {
    padding: 0.5rem 0;
    color: rgba(255, 255, 255, 0.8);
    position: relative;
    padding-left: 1.5rem;
  }

  .feature-card li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--primary-lighter);
    font-weight: bold;
  }

  .version-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .version-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .version-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-lighter);
  }

  .version-date {
    color: rgba(255, 255, 255, 0.6);
  }

  .version-details h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #fff;
  }

  .version-description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
  }

  .version-features,
  .version-improvements,
  .version-bugfixes {
    margin-bottom: 1.5rem;
  }

  .version-features h4,
  .version-improvements h4,
  .version-bugfixes h4 {
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .version-features ul,
  .version-improvements ul,
  .version-bugfixes ul {
    list-style: none;
    padding: 0;
  }

  .version-features li,
  .version-improvements li,
  .version-bugfixes li {
    padding: 0.25rem 0;
    color: rgba(255, 255, 255, 0.8);
    position: relative;
    padding-left: 1.5rem;
  }

  .version-features li::before,
  .version-improvements li::before,
  .version-bugfixes li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-lighter);
  }

  .version-download {
    margin-top: 2rem;
    text-align: center;
  }

  .download-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    text-decoration: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .download-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  /* Version and Pricing Section Styles */
  .version-pricing-section {
    margin-bottom: 4rem;
  }

  .version-pricing-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .version-column,
  .pricing-column {
    display: flex;
    flex-direction: column;
  }

  .version-column h2,
  .pricing-column h2 {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .version-card,
  .pricing-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    height: 100%;
  }

  .version-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .version-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-lighter);
  }

  .version-date {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  .version-details h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #fff;
  }

  .version-description {
    font-size: 1rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 1.5rem;
  }

  .version-features,
  .version-improvements,
  .version-bugfixes {
    margin-bottom: 1rem;
  }

  .version-features h4,
  .version-improvements h4,
  .version-bugfixes h4 {
    color: #fff;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .version-features ul,
  .version-improvements ul,
  .version-bugfixes ul {
    list-style: none;
    padding: 0;
  }

  .version-features li,
  .version-improvements li,
  .version-bugfixes li {
    padding: 0.25rem 0;
    color: rgba(255, 255, 255, 0.8);
    position: relative;
    padding-left: 1.5rem;
    font-size: 0.9rem;
  }

  .version-features li::before,
  .version-improvements li::before,
  .version-bugfixes li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-lighter);
  }

  .version-download {
    margin-top: 2rem;
    text-align: center;
  }

  .download-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .download-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  .pricing-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
    text-align: center;
  }

  .plan-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    transition: all 0.3s ease;
  }

  .plan-card:hover {
    transform: translateY(-5px);
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .plan-card.popular {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .plan-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .plan-header h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
  }

  .price {
    margin-bottom: 1rem;
  }

  .amount {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-lighter);
    display: block;
  }

  .period {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .plan-description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
    margin-bottom: 0;
  }

  .plan-features {
    margin-bottom: 2rem;
    text-align: left;
  }

  .plan-features ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .plan-features li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
  }

  .plan-features li svg {
    color: var(--primary-lighter);
    flex-shrink: 0;
  }

  .plan-action {
    margin-top: auto;
    text-align: center;
  }

  @media (max-width: 1024px) {
    .version-pricing-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  @media (max-width: 768px) {
    .version-pricing-grid {
      gap: 1.5rem;
    }

    .version-card,
    .pricing-card,
    .plan-card {
      padding: 1.5rem;
    }

    .version-column h2,
    .pricing-column h2 {
      font-size: 1.5rem;
    }

    .amount {
      font-size: 2rem;
    }
  }

  /* Footer Styles */

  .loading,
  .error {
    text-align: center;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .error {
    color: #ff6b6b;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .hero-text h1 {
      font-size: 3rem;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }


    .version-header {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }

  /* Footer Styles */
  .preux-footer {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 4rem;
    padding: 3rem 0 1rem;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .footer-brand-link {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    text-decoration: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: all 0.3s ease;
  }

  .footer-brand-link:hover {
    transform: scale(1.05);
  }

  .footer-links {
    display: flex;
    gap: 2rem;
  }

  .footer-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 8px;
  }

  .footer-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-bottom p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
      text-align: center;
    }

    .footer-links {
      justify-content: center;
    }
  }
</style>

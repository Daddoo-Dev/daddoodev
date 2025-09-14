<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let versionData: any = null;
  let loading = true;
  let error = '';

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
</script>

<svelte:head>
  <title>Preux - Intelligent Error Tracking Dashboard | Daddoo Dev</title>
  <meta name="description" content="Preux is a comprehensive error tracking and monitoring platform with AI-powered insights and multi-database support for modern development workflows." />
</svelte:head>

<div class="preux-page">
  <div class="container">
    <!-- Header -->
    <header class="page-header">
      <button class="back-button" on:click={goBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </button>
      
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>Preux</h1>
            <p class="pronunciation">pronounced "pruh"</p>
            <p class="tagline">Intelligent Error Tracking Dashboard</p>
            <p class="description">
              Preux (French for "valiant") is a comprehensive error tracking and monitoring platform 
              that helps developers identify, analyze, and resolve application issues with AI-powered 
              insights and multi-database support.
            </p>
          </div>
          <div class="hero-image">
            <img src="/images/preuxtext.png" alt="Preux Logo" />
          </div>
        </div>
      </div>
    </header>

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

    <!-- Technical Architecture -->
    <section class="architecture-section">
      <h2>Technical Architecture</h2>
      
      <div class="architecture-grid">
        <div class="arch-card">
          <h3>Frontend Application</h3>
          <ul>
            <li><strong>Platform:</strong> Windows desktop application</li>
            <li><strong>Framework:</strong> Flutter with native Windows integration</li>
            <li><strong>State Management:</strong> Provider pattern for reactive UI</li>
            <li><strong>Theming:</strong> Dynamic light/dark mode with system detection</li>
          </ul>
        </div>

        <div class="arch-card">
          <h3>Backend Integration</h3>
          <ul>
            <li><strong>Database Agnostic:</strong> Works with any supported database</li>
            <li><strong>Real-time Sync:</strong> Live error data streaming</li>
            <li><strong>Secure Connections:</strong> Encrypted database communications</li>
            <li><strong>Scalable Architecture:</strong> Handles high-volume error tracking</li>
          </ul>
        </div>

        <div class="arch-card">
          <h3>AI & Machine Learning</h3>
          <ul>
            <li><strong>Model:</strong> Gemma 3 270M IT (ONNX format)</li>
            <li><strong>Inference:</strong> Local ONNX Runtime for fast analysis</li>
            <li><strong>Classification:</strong> Automatic error categorization</li>
            <li><strong>Intelligence:</strong> Pattern recognition and trend analysis</li>
          </ul>
        </div>

        <div class="arch-card">
          <h3>Business Features</h3>
          <ul>
            <li><strong>Licensing:</strong> RevenueCat integration with Stripe payments</li>
            <li><strong>Updates:</strong> Automatic version checking and updates</li>
            <li><strong>Support:</strong> Built-in contact system with Resend email</li>
            <li><strong>Security:</strong> Environment-based configuration management</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Version Information -->
    {#if loading}
      <section class="version-section">
        <div class="loading">Loading version information...</div>
      </section>
    {:else if error}
      <section class="version-section">
        <div class="error">{error}</div>
      </section>
    {:else if versionData}
      <section class="version-section">
        <h2>Latest Version Information</h2>
        <div class="version-card">
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
                Download Preux v{versionData.version}
              </a>
            </div>
          </div>
        </div>
      </section>
    {/if}

    <!-- Contact Section -->
    <section class="contact-section">
      <h2>Get Started with Preux</h2>
      <p>
        Ready to make your debugging process valiant and intelligent? 
        Download Preux today and experience the power of AI-driven error tracking.
      </p>
      <div class="contact-actions">
        <a href="/#contact" class="contact-button primary">Contact Us</a>
        <a href="/#projects" class="contact-button secondary">View More Projects</a>
      </div>
    </section>
  </div>
</div>

<style>
  .preux-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    color: #fff;
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
  .architecture-section,
  .version-section,
  .contact-section {
    margin-bottom: 4rem;
  }

  .features-section h2,
  .architecture-section h2,
  .version-section h2,
  .contact-section h2 {
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

  .architecture-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .arch-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
  }

  .arch-card h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #fff;
  }

  .arch-card ul {
    list-style: none;
    padding: 0;
  }

  .arch-card li {
    padding: 0.5rem 0;
    color: rgba(255, 255, 255, 0.8);
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

  .contact-section {
    text-align: center;
  }

  .contact-section p {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .contact-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .contact-button {
    display: inline-flex;
    align-items: center;
    padding: 1rem 2rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .contact-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }

  .contact-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  .contact-button.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .contact-button.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

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

    .architecture-grid {
      grid-template-columns: 1fr;
    }

    .contact-actions {
      flex-direction: column;
      align-items: center;
    }

    .version-header {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }
</style>

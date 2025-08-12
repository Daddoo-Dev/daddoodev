<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import '$lib/styles/global.css';
</script>

<Header />

<main class="crypticdash-page">
  <div class="hero-section">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">CrypticDash</span>
        </h1>
        <p class="hero-subtitle">
          The intelligent todo manager for developers who work with repositories
        </p>
        <p class="hero-description">
          Manage your project todos directly in your repositories with markdown files. 
          CrypticDash reads your todo.md files and gives you a beautiful dashboard 
          to track your progress across all projects.
        </p>
        <div class="hero-actions">
          <button class="primary-button">Download for Windows</button>
          <button class="primary-button">Download for macOS</button>
        </div>
        <div class="version-info">
          <span class="version-badge">v1.0.0</span>
          <span class="release-date">Coming Soon</span>
        </div>
      </div>
      <div class="hero-visual">
        <div class="app-preview">
          <div class="window-frame">
            <div class="window-controls">
              <div class="control red"></div>
              <div class="control yellow"></div>
              <div class="control green"></div>
            </div>
            <div class="app-content">
              <div class="sidebar">
                <div class="sidebar-header">Projects</div>
                <div class="project-item active">
                  <div class="project-icon">📁</div>
                  <div class="project-name">my-app</div>
                  <div class="todo-count">3</div>
                </div>
                <div class="project-item">
                  <div class="project-icon">📁</div>
                  <div class="project-name">backend-api</div>
                  <div class="todo-count">7</div>
                </div>
                <div class="project-item">
                  <div class="project-icon">📁</div>
                  <div class="project-name">docs</div>
                  <div class="todo-count">2</div>
                </div>
              </div>
              <div class="main-content">
                <div class="content-header">
                  <h2>my-app</h2>
                  <div class="project-stats">
                    <span class="stat">3 todos</span>
                    <span class="stat">1 in progress</span>
                  </div>
                </div>
                <div class="todo-list">
                  <div class="todo-item">
                    <div class="todo-checkbox checked"></div>
                    <div class="todo-text completed">Set up project structure</div>
                    <div class="todo-priority high">High</div>
                  </div>
                  <div class="todo-item">
                    <div class="todo-checkbox"></div>
                    <div class="todo-text">Implement user authentication</div>
                    <div class="todo-priority medium">Medium</div>
                  </div>
                  <div class="todo-item">
                    <div class="todo-checkbox"></div>
                    <div class="todo-text">Write API documentation</div>
                    <div class="todo-priority low">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <section class="features-section">
    <div class="container">
      <h2 class="section-title">How It Works</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <h3>Create Todo Files</h3>
          <p>Add a `todo.md` file to your repository with your project tasks. Use simple markdown syntax to organize your todos.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>Sync with Repos</h3>
          <p>CrypticDash automatically detects and syncs with your repositories, reading the todo files and updating your dashboard.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Dashboard View</h3>
          <p>Get a beautiful overview of all your todos across projects. See progress, priorities, and deadlines at a glance.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">✅</div>
          <h3>Mark Complete</h3>
          <p>Check off completed todos directly in the app. Changes are automatically committed back to your repository.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="example-section">
    <div class="container">
      <h2 class="section-title">Example Todo File</h2>
      <div class="code-example">
        <div class="code-header">
          <span>todo.md</span>
        </div>
        <pre class="code-content"><code># Project Todos

## High Priority
- [ ] Set up authentication system
- [ ] Fix login bug in production

## Medium Priority  
- [ ] Add user profile page
- [ ] Implement search functionality

## Low Priority
- [ ] Update documentation
- [ ] Add unit tests

## Completed
- [x] Project setup
- [x] Basic routing</code></pre>
      </div>
    </div>
  </section>

  <section class="benefits-section">
    <div class="container">
      <h2 class="section-title">Why CrypticDash?</h2>
      <div class="benefits-grid">
        <div class="benefit-item">
          <h3>Repository-First</h3>
          <p>Your todos live with your code, making them part of your project's documentation and history.</p>
        </div>
        <div class="benefit-item">
          <h3>Cross-Platform</h3>
          <p>Native desktop apps for Windows and macOS with a consistent, beautiful interface.</p>
        </div>
        <div class="benefit-item">
          <h3>Git Integration</h3>
          <p>Automatic commits and pushes keep your todo files in sync with your development workflow.</p>
        </div>
        <div class="benefit-item">
          <h3>Simple & Fast</h3>
          <p>Lightweight app that doesn't slow you down. Focus on coding, not managing another tool.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="container">
      <h2>Ready to Organize Your Development?</h2>
      <p>Join the waitlist for early access to CrypticDash</p>
      <div class="cta-form">
        <input type="email" placeholder="Enter your email" class="email-input" />
        <button class="cta-button">Join Waitlist</button>
      </div>
    </div>
  </section>
</main>

<style>
  .crypticdash-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    color: #fff;
  }

  .hero-section {
    padding: 6rem 0 4rem;
    position: relative;
    overflow: hidden;
  }

  .hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    position: relative;
    z-index: 1;
  }

  .hero-content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto 4rem;
  }

  .hero-title {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1.1;
  }

  .gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 1.5rem;
    color: #a8b2d1;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .hero-description {
    font-size: 1.1rem;
    color: #8892b0;
    line-height: 1.6;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .primary-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
  }

  .version-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .version-badge {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .release-date {
    color: #8892b0;
    font-size: 0.875rem;
  }

  .hero-visual {
    display: flex;
    justify-content: center;
  }

  .app-preview {
    perspective: 1000px;
  }

  .window-frame {
    background: #1e1e2e;
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    transform: rotateY(-15deg) rotateX(5deg);
    transition: transform 0.3s ease;
  }

  .window-frame:hover {
    transform: rotateY(-10deg) rotateX(2deg);
  }

  .window-controls {
    display: flex;
    gap: 8px;
    padding: 16px;
    background: #2a2a3e;
    border-radius: 16px 16px 0 0;
  }

  .control {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .control.red { background: #ff5f56; }
  .control.yellow { background: #ffbd2e; }
  .control.green { background: #27ca3f; }

  .app-content {
    display: flex;
    height: 400px;
  }

  .sidebar {
    width: 200px;
    background: #2a2a3e;
    padding: 1rem;
    border-right: 1px solid #3a3a4e;
  }

  .sidebar-header {
    font-size: 0.875rem;
    font-weight: 600;
    color: #a8b2d1;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .project-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .project-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .project-item.active {
    background: rgba(102, 126, 234, 0.2);
    border: 1px solid rgba(102, 126, 234, 0.3);
  }

  .project-icon {
    font-size: 1.2rem;
  }

  .project-name {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .todo-count {
    background: rgba(255, 255, 255, 0.1);
    color: #a8b2d1;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .main-content {
    flex: 1;
    padding: 1.5rem;
    background: #1e1e2e;
  }

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .content-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .project-stats {
    display: flex;
    gap: 1rem;
  }

  .stat {
    background: rgba(255, 255, 255, 0.05);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    color: #a8b2d1;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .todo-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .todo-checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid #4a4a5e;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .todo-checkbox.checked {
    background: #667eea;
    border-color: #667eea;
    position: relative;
  }

  .todo-checkbox.checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  .todo-text {
    flex: 1;
    font-size: 0.875rem;
    color: #e2e8f0;
  }

  .todo-text.completed {
    text-decoration: line-through;
    color: #8892b0;
  }

  .todo-priority {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .todo-priority.high {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .todo-priority.medium {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .todo-priority.low {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .features-section {
    padding: 6rem 0;
    background: rgba(255, 255, 255, 0.02);
  }

  .section-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.03);
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #e2e8f0;
  }

  .feature-card p {
    color: #8892b0;
    line-height: 1.6;
  }

  .example-section {
    padding: 6rem 0;
  }

  .code-example {
    max-width: 800px;
    margin: 0 auto;
    background: #1e1e2e;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .code-header {
    background: #2a2a3e;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    color: #a8b2d1;
  }

  .code-content {
    padding: 2rem;
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #e2e8f0;
    background: #1e1e2e;
  }

  .code-content code {
    background: none;
    padding: 0;
    color: inherit;
  }

  .benefits-section {
    padding: 6rem 0;
    background: rgba(255, 255, 255, 0.02);
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .benefit-item {
    text-align: center;
    padding: 2rem;
  }

  .benefit-item h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #e2e8f0;
  }

  .benefit-item p {
    color: #8892b0;
    line-height: 1.6;
  }

  .cta-section {
    padding: 6rem 0;
    text-align: center;
  }

  .cta-section h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cta-section p {
    font-size: 1.2rem;
    color: #8892b0;
    margin-bottom: 2rem;
  }

  .cta-form {
    display: flex;
    gap: 1rem;
    justify-content: center;
    max-width: 500px;
    margin: 0 auto;
    flex-wrap: wrap;
  }

  .email-input {
    flex: 1;
    min-width: 250px;
    padding: 1rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;
  }

  .email-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .email-input::placeholder {
    color: #8892b0;
  }

  .cta-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.25rem;
    }

    .hero-actions {
      flex-direction: column;
      align-items: center;
    }

    .primary-button {
      width: 100%;
      max-width: 300px;
    }

    .app-content {
      flex-direction: column;
      height: auto;
    }

    .sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #3a3a4e;
    }

    .cta-form {
      flex-direction: column;
      align-items: center;
    }

    .email-input {
      min-width: auto;
      width: 100%;
    }
  }
</style>

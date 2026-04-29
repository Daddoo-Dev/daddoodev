<script lang="ts">
  const currentYear = new Date().getFullYear();

  const vscodeBase = 'https://marketplace.visualstudio.com/items?itemName=DaddooDev';
</script>

<footer class="site-footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-brand">
        <h3>Daddoo Dev</h3>
        <p>Creating intelligent developer tools and applications.</p>
      </div>

      <div class="footer-links">
        <div class="footer-column">
          <h4>Extensions</h4>
          <p class="footer-column-note">
            Visual Studio Marketplace links work in VS Code. Cursor installs many extensions from Open VSX; SecretKeeper is listed there too.
          </p>
          <a href="{vscodeBase}.zivora" target="_blank" rel="noopener noreferrer">Zivora</a>
          <div class="footer-extension-block">
            <a href="{vscodeBase}.notchlist" target="_blank" rel="noopener noreferrer">NotchList</a>
            <a
              class="footer-secondary-link"
              href="https://open-vsx.org/extension/DaddooDev/notchlist"
              target="_blank"
              rel="noopener noreferrer">Open VSX (Cursor-friendly)</a>
          </div>
          <a href="{vscodeBase}.addasaint" target="_blank" rel="noopener noreferrer">AddASaint</a>
          <div class="footer-extension-block">
            <a href="{vscodeBase}.secretkeeper" target="_blank" rel="noopener noreferrer">SecretKeeper</a>
            <a
              class="footer-secondary-link"
              href="https://open-vsx.org/extension/DaddooDev/secretkeeper"
              target="_blank"
              rel="noopener noreferrer">Open VSX (Cursor-friendly)</a>
          </div>
        </div>

        <div class="footer-column">
          <h4>Apps &amp; tools</h4>
          <a href="https://ridewealthassistant.com/marketing/" target="_blank" rel="noopener noreferrer"
            >RideWealth Assistant</a>
          <a href="https://conclavium.app" target="_blank" rel="noopener noreferrer">Conclavium</a>
          <a href="/twistedfortunes">Twisted Fortunes</a>
          <a href="/clocks">ChronoCluster</a>
          <a href="/honorguard">Honor Guard sign-in</a>
        </div>

        <div class="footer-column">
          <h4>Company</h4>
          <a href="/#about">About</a>
          <a href="/#projects">Projects</a>
          <a href="/#contact">Contact</a>
        </div>

        <div class="footer-column">
          <h4>Legal</h4>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {currentYear} Daddoo Dev. All rights reserved.</p>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 3rem 0 1rem;
    margin-top: 6rem;
  }

  .footer-content {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 3fr);
    gap: 3rem;
    margin-bottom: 2rem;
    align-items: start;
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
  }

  .footer-brand h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .footer-brand p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .footer-column h4 {
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .footer-column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .footer-column-note {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.78rem;
    line-height: 1.45;
    margin: -0.35rem 0 0.35rem;
  }

  .footer-extension-block {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: flex-start;
  }

  .footer-column a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s ease, transform 0.3s ease;
    width: fit-content;
  }

  .footer-column a:hover {
    color: #fff;
    transform: translateX(3px);
  }

  .footer-secondary-link {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.55);
  }

  .footer-secondary-link:hover {
    color: rgba(255, 255, 255, 0.85);
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

  @media (max-width: 1100px) {
    .footer-links {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .footer-brand {
      text-align: center;
    }

    .footer-links {
      grid-template-columns: 1fr;
    }

    .footer-column {
      text-align: center;
      align-items: center;
    }

    .footer-extension-block {
      align-items: center;
    }

    .footer-column-note {
      text-align: center;
    }
  }
</style>

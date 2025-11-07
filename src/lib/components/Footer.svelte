<script lang="ts">
  const currentYear = new Date().getFullYear();
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
          <h4>Products</h4>
          <a href="/preux">Preux</a>
          <a href="https://marketplace.visualstudio.com/items?itemName=DaddooDev.todo-sync" target="_blank" rel="noopener">ToDoSync</a>
          <a href="https://marketplace.visualstudio.com/items?itemName=DaddooDev.addasaint" target="_blank" rel="noopener">AddASaint</a>
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
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 3rem;
    margin-bottom: 2rem;
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

  .footer-column a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    width: fit-content;
  }

  .footer-column a:hover {
    color: #fff;
    transform: translateX(3px);
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
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .footer-brand {
      text-align: center;
    }

    .footer-column {
      text-align: center;
      align-items: center;
    }
  }
</style>

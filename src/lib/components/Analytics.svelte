<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  // Google Analytics Measurement ID
  const GA_MEASUREMENT_ID = 'G-W7DNPNJ5H5';

  // Extend Window interface for TypeScript
  declare global {
    interface Window {
      dataLayer: any[];
      gtag: (...args: any[]) => void;
    }
  }

  onMount(() => {
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      // Load Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      // Initialize GA
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
    }
  });

  // Track page views on route changes
  $: if ($page.url.pathname && GA_MEASUREMENT_ID) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: $page.url.pathname
      });
    }
  }
</script>

<!-- Analytics component doesn't render anything -->


<script lang="ts">
  export let title: string;
  export let description: string;
  export let url: string = 'https://dadddodev.pro';
  export let image: string = 'https://dadddodev.pro/images/daddoodevheader.png';
  export let type: string = 'website';
  export let author: string = 'Daddoo Dev';
  export let keywords: string = 'software development, web development, mobile apps, developer tools';
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <meta name="author" content={author} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={type} />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:site_name" content="Daddoo Dev" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={url} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={image} />
  
  <!-- Additional Meta -->
  <meta name="robots" content="index, follow" />
  <meta name="language" content="English" />
  <meta name="revisit-after" content="7 days" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href={url} />
</svelte:head>

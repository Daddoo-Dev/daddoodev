<script lang="ts">
  export let googlePlay: string | undefined;
  export let appStore: string | undefined;
</script>

{#if googlePlay || appStore}
  <div class="store-badges">
    {#if googlePlay}
      <a
        class="store-badge-link"
        href={googlePlay}
        target="_blank"
        rel="noopener"
        aria-label="Get it on Google Play"
      >
        <img
          class="store-badge-image"
          src="/images/GetItOnGooglePlay_Badge_Web_color_English.png"
          alt="Get it on Google Play"
          loading="lazy"
          decoding="async"
        />
      </a>
    {/if}

    {#if appStore}
      <a
        class="store-badge-link"
        href={appStore}
        target="_blank"
        rel="noopener"
        aria-label="Download on the App Store"
      >
        <img
          class="store-badge-image store-badge-image--apple"
          src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
          alt="Download on the App Store"
          loading="lazy"
          decoding="async"
        />
      </a>
    {/if}
  </div>
{/if}

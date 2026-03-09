<script lang="ts">
  import { fillSignInTemplate } from '$lib/honorguardSigninSheet';
  import { buildSignInSheetHtml } from '$lib/honorguardPdfHtml';

  const TEMPLATE_URL = '/templates/honorguard-signin-template.xlsx';

  const POSITIONS: { label: string; abbr: string }[] = [
    { label: 'Honor Guard', abbr: 'HG' },
    { label: 'Color Guard', abbr: 'CG' },
    { label: 'Color Corps Commander', abbr: 'CCC' },
    { label: 'District Marshal', abbr: 'DM' },
    { label: 'District Master', abbr: 'MFD' },
    { label: 'Vice Supreme Master', abbr: 'VSM' },
    { label: 'Supreme Master', abbr: 'SM' },
  ];

  type SignInRow = {
    name: string;
    contact: string;
    position: string;
    orgNumber: string;
    orgName: string;
  };

  let nameQuery = $state('');
  let contact = $state('');
  let position = $state('');
  let orgNumber = $state('');
  let orgName = $state('');
  let submitStatus = $state<'idle' | 'success'>('idle');
  let successName = $state('');
  let eventDate = $state('');
  let occasion = $state('');
  let location = $state('');
  let marshalName = $state('');
  let signIns = $state<SignInRow[]>([]);
  let isSheetDownloading = $state(false);
  let sheetDownloadError = $state('');

  /** "Last, First" → "First Last" for display. */
  function formatNameForDisplay(name: string): string {
    const s = (name || '').trim();
    const i = s.indexOf(', ');
    if (i > 0 && i < s.length - 2) {
      return `${s.slice(i + 2).trim()} ${s.slice(0, i).trim()}`;
    }
    return s || name;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const row: SignInRow = {
      name: nameQuery.trim(),
      contact: contact.trim(),
      position: position,
      orgNumber: orgNumber.trim(),
      orgName: orgName.trim()
    };
    signIns = [...signIns, row];
    successName = row.name;
    submitStatus = 'success';
    nameQuery = '';
    contact = '';
    position = '';
    orgNumber = '';
    orgName = '';
  }

  async function downloadSignInSheet() {
    isSheetDownloading = true;
    sheetDownloadError = '';
    try {
      const templateRes = await fetch(TEMPLATE_URL);
      if (!templateRes.ok) throw new Error('Failed to load template');
      const templateBuf = await templateRes.arrayBuffer();
      const event = {
        date: eventDate.trim(),
        occasion: occasion.trim(),
        location: location.trim(),
        marshalName: marshalName.trim()
      };

      const filledXlsx = await fillSignInTemplate(templateBuf, event, signIns);
      const xlsxBlob = new Blob([filledXlsx], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const xlsxUrl = URL.createObjectURL(xlsxBlob);
      const xlsxA = document.createElement('a');
      xlsxA.href = xlsxUrl;
      xlsxA.download = 'honor-guard-sign-in.xlsx';
      xlsxA.click();
      URL.revokeObjectURL(xlsxUrl);

      const imageBase =
        typeof window !== 'undefined'
          ? `${window.location.origin}/4TH%20DEGREE%20HG%20SIGN-IN%20TEMPLATE/resources`
          : '';
      const pdfContent = buildSignInSheetHtml(event, signIns, imageBase || undefined);
      const container = document.createElement('div');
      container.style.cssText =
        'position:fixed;left:0;top:0;width:793px;max-width:100vw;background:#fff;z-index:9999;overflow:auto;max-height:100vh;visibility:visible;opacity:1';
      container.innerHTML = pdfContent;
      document.body.appendChild(container);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      container.offsetHeight;
      const imgs = container.querySelectorAll('img');
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) resolve();
              else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(resolve, 3000);
              }
            })
        )
      );
      await new Promise<void>((resolve) => setTimeout(resolve, 300));
      const w = container.scrollWidth;
      const h = container.scrollHeight;
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: 10,
          filename: 'honor-guard-sign-in.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: w,
            height: h,
            windowWidth: w,
            windowHeight: h
          },
          jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' }
        })
        .from(container)
        .save();
      document.body.removeChild(container);
    } catch (e) {
      sheetDownloadError = e instanceof Error ? e.message : 'Download failed';
    } finally {
      isSheetDownloading = false;
    }
  }

  function clearForNewEvent() {
    eventDate = '';
    occasion = '';
    location = '';
    marshalName = '';
    signIns = [];
    submitStatus = 'idle';
  }
</script>

<div class="honorguard-page">
  <div class="honorguard-container">
    <h1 class="honorguard-title">Honor Guard Sign In</h1>

    <div class="honorguard-event-section">
      <h2 class="honorguard-event-title">Event</h2>
      <div class="honorguard-event-grid">
        <div class="honorguard-field">
          <label for="honorguard-event-date">Date</label>
          <input
            id="honorguard-event-date"
            type="text"
            class="honorguard-input"
            bind:value={eventDate}
            placeholder="e.g. 3/8/2025"
          />
        </div>
        <div class="honorguard-field">
          <label for="honorguard-marshal">Marshal's Name</label>
          <input
            id="honorguard-marshal"
            type="text"
            class="honorguard-input"
            bind:value={marshalName}
          />
        </div>
        <div class="honorguard-field full-width">
          <label for="honorguard-occasion">Occasion</label>
          <input
            id="honorguard-occasion"
            type="text"
            class="honorguard-input"
            bind:value={occasion}
            placeholder="e.g. Council Meeting"
          />
        </div>
        <div class="honorguard-field full-width">
          <label for="honorguard-location">Location</label>
          <input
            id="honorguard-location"
            type="text"
            class="honorguard-input"
            bind:value={location}
          />
        </div>
      </div>
      <div class="honorguard-clear-row">
        <button
          type="button"
          class="honorguard-clear-btn"
          onclick={clearForNewEvent}
        >
          Clear for new event
        </button>
        {#if signIns.length === 0 && !eventDate && !occasion && !location && !marshalName}
          <span class="honorguard-clear-ok">Ready for new sign-ins.</span>
        {:else if signIns.length > 0}
          <span class="honorguard-clear-ok">{signIns.length} signed in.</span>
        {/if}
      </div>
    </div>

    <form class="honorguard-form" onsubmit={handleSubmit}>
      <h2 class="honorguard-form-title">Member sign-in</h2>
      <div class="honorguard-field">
        <label for="honorguard-name">Full Name (Last, First)</label>
        <input
          id="honorguard-name"
          type="text"
          class="honorguard-input"
          placeholder="e.g. Smith, John"
          bind:value={nameQuery}
          required
        />
      </div>

      <div class="honorguard-field">
        <label for="honorguard-contact">Email or Phone</label>
        <input
          id="honorguard-contact"
          type="text"
          class="honorguard-input"
          bind:value={contact}
          required
        />
      </div>

      <div class="honorguard-field">
        <label for="honorguard-position">Position</label>
        <select
          id="honorguard-position"
          class="honorguard-select"
          bind:value={position}
          required
        >
          <option value="">Select position</option>
          {#each POSITIONS as p}
            <option value={p.abbr}>{p.label}</option>
          {/each}
        </select>
      </div>

      <div class="honorguard-field">
        <label for="honorguard-org-number">Assembly Number</label>
        <input
          id="honorguard-org-number"
          type="text"
          class="honorguard-input"
          bind:value={orgNumber}
        />
      </div>

      <div class="honorguard-field">
        <label for="honorguard-org-name">Assembly Name</label>
        <input
          id="honorguard-org-name"
          type="text"
          class="honorguard-input"
          bind:value={orgName}
        />
      </div>

      {#if submitStatus === 'success'}
        <p class="honorguard-success honorguard-success-inline">
          Thanks, {formatNameForDisplay(successName)}! Added. ({signIns.length} total)
        </p>
      {/if}

      <button type="submit" class="honorguard-submit">
        Add to sign-in list
      </button>

      <div class="honorguard-pdf-row">
        <button
          type="button"
          class="honorguard-pdf-btn"
          onclick={downloadSignInSheet}
          disabled={isSheetDownloading || signIns.length === 0}
        >
          {isSheetDownloading ? 'Generating…' : 'Download sign-in sheet (XLSX + PDF)'}
        </button>
        {#if signIns.length === 0}
          <p class="honorguard-hint">Add at least one person to enable download.</p>
        {/if}
        {#if sheetDownloadError}
          <p class="honorguard-error">{sheetDownloadError}</p>
        {/if}
      </div>
    </form>

    <div class="honorguard-pdf-row">
      <a
        href="/honorguard/preview"
        target="_blank"
        rel="noopener noreferrer"
        class="honorguard-pdf-btn"
      >
        View full-page sheet
      </a>
    </div>
  </div>
</div>

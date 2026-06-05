/* icons.js — canonical source for the Image-Missing / Error-State placeholder system.
 * Every icon is authored on a shared 0 0 64 64 grid, ~12u inset, 2.3 stroke,
 * round caps/joins. Structural lines use currentColor (so they adapt to any
 * surface); the error accent uses var(--ph-accent) / var(--ph-accent2) so each
 * skin can re-tint without touching geometry.
 *
 * Class vocabulary (defined in system.css, baked into standalone .svg exports):
 *   ph-line  ph-faint  ph-thin  ph-dash
 *   ph-accent  ph-accent2          (stroke = skin accent)
 *   ph-fill  ph-fill-accent  ph-fill-accent2   (fill instead of stroke)
 *   ph-q                          (the centred "?" glyph)
 * Motion hooks: ph-spin ph-spin-slow ph-spin-rev ph-fog ph-pulse ph-scan
 *   ph-glitch ph-g1 ph-g2 ph-tear ph-drift1 ph-drift2 ph-drift3
 */
(function () {
  const ICONS = [
    /* ---------------------------------------------------------------- BASE */
    {
      group: 'Base UI',
      id: 'broken-frame',
      name: 'Broken Frame',
      intent: 'The asset is corrupt or partially decoded.',
      usage: 'Default broken-image fallback in <img> onError.',
      inner: `
        <g class="ph-line">
          <rect x="12" y="14" width="40" height="36" rx="5"/>
          <circle cx="21" cy="25" r="3"/>
          <polyline points="15 47 24 36 30 42 37 32 49 47"/>
        </g>
        <polyline class="ph-accent" points="34 11 31 27 39 33 33 53"/>`,
    },
    {
      group: 'Base UI',
      id: 'unknown-image',
      name: 'Unknown Image',
      intent: 'Source resolved but the format is unrecognised.',
      usage: 'Preview slot when MIME type is unknown.',
      inner: `
        <g class="ph-line"><rect x="12" y="14" width="40" height="36" rx="5"/></g>
        <g class="ph-line ph-faint">
          <circle cx="21" cy="25" r="3"/>
          <polyline points="15 47 24 36 30 42 37 32 49 47"/>
        </g>
        <text class="ph-q" x="32" y="35">?</text>`,
    },
    {
      group: 'Base UI',
      id: 'card-error',
      name: 'Card Error State',
      intent: 'A content card whose image slot failed to populate.',
      usage: 'Version / family cards with a missing thumbnail.',
      inner: `
        <g class="ph-line">
          <rect x="9" y="11" width="46" height="42" rx="6"/>
          <line class="ph-faint" x1="15" y1="18" x2="33" y2="18"/>
          <rect class="ph-dash ph-faint" x="15" y="24" width="34" height="21" rx="3"/>
          <circle class="ph-faint" cx="22" cy="31" r="2.4"/>
          <polyline class="ph-faint" points="17 41 24 34 29 38 35 32 47 43"/>
        </g>
        <g class="ph-accent">
          <path d="M43 39 L52 39 L47.5 31 Z"/>
          <line x1="47.5" y1="34" x2="47.5" y2="36"/>
        </g>
        <circle class="ph-fill-accent" cx="47.5" cy="37.4" r="0.7"/>`,
    },
    {
      group: 'Base UI',
      id: 'failed-loading',
      name: 'Failed Loading',
      intent: 'The fetch stalled or returned an error.',
      usage: 'Async thumbnail that timed out or 4xx/5xx’d.',
      inner: `
        <g class="ph-line"><rect x="12" y="14" width="40" height="36" rx="5"/></g>
        <circle class="ph-line ph-spin" cx="32" cy="32" r="9" stroke-dasharray="42 16"/>
        <line class="ph-accent" x1="24" y1="40" x2="40" y2="24"/>`,
    },
    {
      group: 'Base UI',
      id: 'glitch-thumbnail',
      name: 'Glitch Thumbnail',
      intent: 'Partial / corrupted pixel data on decode.',
      usage: 'Truncated download or interrupted stream.',
      inner: `
        <g class="ph-line"><rect x="12" y="14" width="40" height="36" rx="5"/></g>
        <g class="ph-bars">
          <rect class="ph-fill ph-faint" x="17" y="22" width="22" height="3.4" rx="1"/>
          <rect class="ph-fill-accent ph-g1" x="22" y="28" width="26" height="3.4" rx="1"/>
          <rect class="ph-fill ph-faint ph-g2" x="16" y="34" width="20" height="3.4" rx="1"/>
          <rect class="ph-fill ph-faint" x="20" y="40" width="24" height="3.4" rx="1"/>
        </g>`,
    },
    {
      group: 'Base UI',
      id: 'unknown-file',
      name: 'Unknown File',
      intent: 'A non-image asset where a preview was expected.',
      usage: 'GLB / blend reference with no rendered still.',
      inner: `
        <g class="ph-line">
          <path d="M19 12 H40 L48 20 V52 H19 Z"/>
          <polyline points="40 12 40 20 48 20"/>
        </g>
        <text class="ph-q" x="33.5" y="37">?</text>`,
    },
    {
      group: 'Base UI',
      id: 'disabled-slot',
      name: 'Disabled Image Slot',
      intent: 'Intentionally empty — no asset assigned.',
      usage: 'Empty registry slot or locked variant.',
      inner: `
        <rect class="ph-line ph-dash ph-faint" x="12" y="14" width="40" height="36" rx="5"/>
        <line class="ph-line" x1="17" y1="47" x2="47" y2="17"/>`,
    },

    /* ---------------------------------------------------------- D&D FANTASY */
    {
      group: 'D&D Fantasy',
      id: 'faded-divination',
      name: 'Faded Divination',
      intent: 'The vision never fully resolved — clarity lost.',
      usage: 'Fantasy-skin failed render / empty preview.',
      inner: `
        <g class="ph-line"><rect x="12" y="14" width="40" height="36" rx="5"/></g>
        <g class="ph-line"><circle cx="32" cy="33" r="12"/></g>
        <circle class="ph-accent ph-spin-slow" cx="32" cy="33" r="9" stroke-dasharray="34 11"/>
        <circle class="ph-accent ph-spin-rev" cx="32" cy="33" r="5.5" stroke-dasharray="15 8"/>
        <circle class="ph-fill-accent ph-fog" cx="32" cy="33" r="6.5"/>
        <g class="ph-line ph-faint">
          <line x1="32" y1="18" x2="32" y2="21"/>
          <line x1="32" y1="45" x2="32" y2="48"/>
          <line x1="17" y1="33" x2="20" y2="33"/>
          <line x1="44" y1="33" x2="47" y2="33"/>
        </g>`,
    },
    {
      group: 'D&D Fantasy',
      id: 'broken-spell-frame',
      name: 'Broken Spell Frame',
      intent: 'The binding ward shattered mid-cast.',
      usage: 'Fantasy-skin corrupt / broken asset.',
      inner: `
        <g class="ph-line">
          <rect x="12" y="14" width="40" height="36" rx="5"/>
          <polyline class="ph-faint" points="12 20 16 20 16 14"/>
          <polyline class="ph-faint" points="52 44 48 44 48 50"/>
        </g>
        <polyline class="ph-accent2" points="30 13 33 28 26 34 32 51"/>
        <g class="ph-accent">
          <polyline points="27 26 31 22 31 30"/>
          <polyline points="37 26 33 30 33 22"/>
        </g>
        <g class="ph-fill-accent">
          <path class="ph-drift1" d="M44 20 l1.7 1.7 -1.7 1.7 -1.7 -1.7 z"/>
          <circle class="ph-drift2" cx="19" cy="42" r="1.3"/>
          <path class="ph-drift3" d="M46 41 l1.4 1.4 -1.4 1.4 -1.4 -1.4 z"/>
          <circle class="ph-drift1" cx="18" cy="22" r="1.1"/>
        </g>`,
    },
    {
      group: 'D&D Fantasy',
      id: 'unwritten-rune',
      name: 'Unwritten Rune Panel',
      intent: 'The glyph was never finished — half-carved.',
      usage: 'Fantasy-skin empty / unassigned slot.',
      inner: `
        <g class="ph-line">
          <path d="M16 25 Q16 12 32 12 Q48 12 48 25 V49 a3 3 0 0 1 -3 3 H19 a3 3 0 0 1 -3 -3 Z"/>
        </g>
        <circle class="ph-accent ph-thin" cx="32" cy="34" r="11" stroke-dasharray="6 7"/>
        <g class="ph-accent">
          <line x1="32" y1="27" x2="32" y2="41"/>
          <line x1="32" y1="34" x2="38" y2="30"/>
        </g>
        <g class="ph-line ph-faint ph-dash">
          <line x1="32" y1="34" x2="26" y2="38"/>
          <line x1="32" y1="41" x2="37" y2="44"/>
        </g>`,
    },

    /* ------------------------------------------------------------ CYBERPUNK */
    {
      group: 'Cyberpunk',
      id: 'data-feed-corruption',
      name: 'Data Feed Corruption',
      intent: 'The signal fragmented into scan-line noise.',
      usage: 'Sci-fi skin failed render / dropped feed.',
      inner: `
        <g class="ph-accent ph-thin">
          <polyline points="14 21 14 14 21 14"/>
          <polyline points="43 14 50 14 50 21"/>
          <polyline points="50 43 50 50 43 50"/>
          <polyline points="21 50 14 50 14 43"/>
        </g>
        <g class="ph-accent ph-thin">
          <line class="ph-scan" x1="20" y1="23" x2="44" y2="23"/>
          <line class="ph-scan" x1="20" y1="27" x2="44" y2="27"/>
          <line class="ph-scan" x1="20" y1="31" x2="40" y2="31"/>
        </g>
        <g class="ph-accent2 ph-thin ph-glitch">
          <line x1="25" y1="37" x2="42" y2="37"/>
          <line x1="20" y1="41" x2="31" y2="41"/>
          <line x1="35" y1="41" x2="45" y2="41"/>
          <line class="ph-faint" x1="23" y1="45" x2="34" y2="45"/>
        </g>`,
    },
    {
      group: 'Cyberpunk',
      id: 'asset-not-found',
      name: 'Asset Not Found Node',
      intent: 'The asset node dropped off the mesh.',
      usage: 'Sci-fi skin missing reference / dead link.',
      inner: `
        <rect class="ph-accent ph-dash ph-thin" x="24" y="25" width="16" height="16" rx="3"/>
        <g class="ph-accent ph-thin">
          <circle cx="15" cy="16" r="3"/>
          <circle cx="49" cy="49" r="3"/>
          <line x1="18" y1="18" x2="24" y2="25"/>
        </g>
        <g class="ph-accent2 ph-thin">
          <line class="ph-dash" x1="40" y1="41" x2="44" y2="45"/>
          <path d="M45 43 l3 3 M48 43 l-3 3"/>
        </g>
        <circle class="ph-fill-accent2 ph-pulse" cx="40" cy="25" r="2.6"/>`,
    },
    {
      group: 'Cyberpunk',
      id: 'glitched-media',
      name: 'Glitched Media Preview',
      intent: 'Reconstruction stalled — tearing and pixel rot.',
      usage: 'Sci-fi skin partial / corrupt thumbnail.',
      inner: `
        <g class="ph-accent ph-thin"><rect x="12" y="14" width="40" height="36" rx="4"/></g>
        <g class="ph-accent ph-thin">
          <circle cx="22" cy="25" r="3"/>
          <polyline class="ph-faint" points="15 47 24 37"/>
          <polyline points="24 37 30 43 38 33"/>
          <polyline class="ph-faint" points="38 33 49 47"/>
        </g>
        <g class="ph-tear">
          <rect class="ph-fill-accent2" x="14" y="30" width="36" height="2" opacity="0.85"/>
          <rect class="ph-fill-accent2 ph-g1" x="18" y="40" width="30" height="2.4" opacity="0.7"/>
        </g>
        <g class="ph-glitch">
          <rect class="ph-fill-accent" x="42" y="16" width="3" height="3"/>
          <rect class="ph-fill-accent2" x="46" y="16" width="3" height="3"/>
          <rect class="ph-fill-accent2" x="42" y="20" width="3" height="3"/>
        </g>`,
    },
  ];

  // Skin accent tokens — one source of truth, reused by gallery + .svg export.
  const SKINS = {
    'Base UI':     { accent: 'var(--accent, #c8822f)', accent2: '#a8632a', glow: false,
                     blurb: 'Neutral grayscale geometry with a single calm amber accent. The structural lines ride on currentColor, so they read on any surface.' },
    'D&D Fantasy': { accent: '#b88a36', accent2: '#c4622f', glow: true,
                     blurb: 'Same grid, re-skinned with faded gold and ember. Arcane rings, wards and half-carved runes replace the SaaS motifs — calm “spell failed”, not alarm.' },
    'Cyberpunk':   { accent: '#1fa6bd', accent2: '#cc5aa0', glow: true,
                     blurb: 'Same grid as a HUD: neon cyan structure, magenta corruption. Scan-lines, broken mesh links and pixel tearing signal “feed lost”.' },
  };

  window.ICONS = ICONS;
  window.SKINS = SKINS;

  /* bakeSvg — transform the class-based authoring markup into a clean,
   * dependency-free, attribute-based standalone SVG string. currentColor is
   * preserved (themeable by the consumer's text color); the skin accent is
   * baked as a literal hex. No <style>/<script> — safe + portable for a repo.
   * Animations are intentionally a gallery/HTML concern, not baked here. */
  function bakeSvg(icon, accent, accent2) {
    const doc = new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg">' + icon.inner + '</svg>', 'image/svg+xml');
    const root = doc.documentElement;
    root.querySelectorAll('*').forEach(el => {
      const cl = (el.getAttribute('class') || '').split(/\s+/);
      const has = c => cl.indexOf(c) !== -1;
      if (has('ph-line'))         el.setAttribute('stroke', 'currentColor');
      if (has('ph-accent'))       el.setAttribute('stroke', accent);
      if (has('ph-accent2'))      el.setAttribute('stroke', accent2);
      if (has('ph-fill'))        { el.setAttribute('fill', 'currentColor'); el.setAttribute('stroke', 'none'); }
      if (has('ph-fill-accent')) { el.setAttribute('fill', accent);  el.setAttribute('stroke', 'none'); }
      if (has('ph-fill-accent2')){ el.setAttribute('fill', accent2); el.setAttribute('stroke', 'none'); }
      if (has('ph-faint'))        el.setAttribute('opacity', '0.42');
      if (has('ph-thin'))         el.setAttribute('stroke-width', '1.9');
      if (has('ph-dash'))         el.setAttribute('stroke-dasharray', '4 4');
      if (has('ph-q')) {
        el.setAttribute('fill', accent);
        el.setAttribute('font-family', "'Plus Jakarta Sans', sans-serif");
        el.setAttribute('font-size', '21'); el.setAttribute('font-weight', '800');
        el.setAttribute('text-anchor', 'middle');
      }
      el.removeAttribute('class');
    });
    const body = root.innerHTML
      .replace(/ xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')
      .replace(/\s+/g, ' ').replace(/> </g, '>\n  <').trim();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" `
      + `fill="none" stroke="none" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" `
      + `color="#5b5963" role="img" aria-label="${icon.name}">\n  <title>${icon.name}</title>\n  ${body}\n</svg>\n`;
  }

  // resolve a skin's baked accents (Base uses fixed amber for exports)
  function skinAccents(group) {
    const s = SKINS[group];
    return { accent: group === 'Base UI' ? '#c8822f' : s.accent, accent2: s.accent2 };
  }

  window.bakeSvg = bakeSvg;
  window.skinAccents = skinAccents;
})();

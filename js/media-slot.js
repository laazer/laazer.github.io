/**
 * <media-slot> — themed image element with placeholder fallback.
 *
 * Requires js/placeholders/icons.js to be loaded first (sets window.ICONS).
 * Falls back to a generic SVG if icons.js is absent.
 *
 * Accepts every attribute a native <img> accepts, plus:
 *   theme="cyber"  (default) — Cyberpunk skin  → glitched-media icon
 *   theme="dnd"              — D&D Fantasy skin → faded-divination icon
 *   theme="std"              — Base UI skin     → broken-frame icon
 *
 * Usage:
 *   <media-slot src="hero.png" alt="Hero" width="800" height="450"></media-slot>
 *   <media-slot alt="Coming soon" width="400" height="300" theme="dnd"></media-slot>
 */
class MediaSlot extends HTMLElement {
  static observedAttributes = [
    'src', 'alt', 'width', 'height', 'loading', 'srcset', 'sizes',
    'crossorigin', 'decoding', 'fetchpriority', 'referrerpolicy', 'theme', 'caption',
  ];

  #broken = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()         { this.#render(); }
  attributeChangedCallback(n) { if (n === 'src') this.#broken = false; this.#render(); }

  get #theme() { return this.getAttribute('theme') || 'cyber'; }

  #imgAttrs() {
    return Array.from(this.attributes)
      .filter(a => a.name !== 'theme' && a.name !== 'caption')
      .map(a => `${a.name}="${a.value.replace(/"/g, '&quot;')}"`)
      .join(' ');
  }

  static #THEME_MAP = {
    cyber: { iconId: 'glitched-media',   accent: '#1fa6bd', accent2: '#cc5aa0' },
    dnd:   { iconId: 'faded-divination', accent: '#b88a36', accent2: '#c4622f' },
    std:   { iconId: 'broken-frame',     accent: '#c8822f', accent2: '#a8632a' },
  };

  #iconSvg(theme) {
    const map     = MediaSlot.#THEME_MAP[theme] ?? MediaSlot.#THEME_MAP.cyber;
    const icons   = window.ICONS;
    const icon    = icons ? icons.find(i => i.id === map.iconId) : null;

    if (icon) {
      return `<svg class="ms-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"
          fill="none" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"
          style="--ph-accent:${map.accent};--ph-accent2:${map.accent2}">
          ${icon.inner}
        </svg>`;
    }

    // Fallback when icons.js is not loaded
    return `<svg class="ms-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>`;
  }

  #label(theme) {
    return { cyber: '[ MEDIA ]', dnd: '⟨ Awaiting Art ⟩', std: 'No Image' }[theme] ?? '[ MEDIA ]';
  }

  #render() {
    const src     = this.getAttribute('src');
    const alt     = this.getAttribute('alt') || '';
    const w       = this.getAttribute('width');
    const h       = this.getAttribute('height');
    const theme   = this.#theme;
    const caption = this.getAttribute('caption') || '';

    this.shadowRoot.innerHTML = `
      <style>${this.#css(theme, w, h)}</style>
      ${(src && !this.#broken)
        ? `<img ${this.#imgAttrs()} class="ms-img">`
        : `<div class="ms-ph" role="img" aria-label="${alt || 'Media placeholder'}">
             <div class="ms-inner">
               ${this.#iconSvg(theme)}
               <span class="ms-label">${this.#label(theme)}</span>
             </div>
           </div>`
      }
      ${caption ? `<figcaption class="ms-caption">${caption}</figcaption>` : ''}
    `;

    if (src && !this.#broken) {
      this.shadowRoot.querySelector('.ms-img').addEventListener('error', () => {
        this.#broken = true;
        this.#render();
      }, { once: true });
    }
  }

  #css(theme, w, h) {
    const phW = w ? `${w}px` : '100%';
    const phH = h ? `${h}px` : '200px';

    const base = `
      :host { display: inline-block; line-height: 0; }

      .ms-img {
        display: block;
        max-width: 100%;
        border-radius: inherit;
        height: auto;
      }

      .ms-ph {
        width: ${phW};
        height: ${phH};
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        overflow: hidden;
        box-sizing: border-box;
      }

      .ms-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      .ms-icon { width: 72px; height: 72px; }

      .ms-label {
        font-size: 0.78rem;
        user-select: none;
        letter-spacing: 0.08em;
      }

      .ms-caption {
        display: block;
        text-align: center;
        font-size: 0.82rem;
        line-height: 1.5;
        color: rgba(148, 163, 184, 0.7);
        padding: 8px 4px 0;
        font-style: italic;
      }

      /* ── icon class vocabulary (mirrors js/placeholders/system.css) ── */
      .ph-line    { stroke: currentColor; fill: none; }
      .ph-faint   { opacity: 0.42; }
      .ph-thin    { stroke-width: 1.9; }
      .ph-dash    { stroke-dasharray: 4 4; }
      .ph-accent  { stroke: var(--ph-accent);  fill: none; }
      .ph-accent2 { stroke: var(--ph-accent2); fill: none; }
      .ph-fill         { fill: currentColor;      stroke: none; }
      .ph-fill-accent  { fill: var(--ph-accent);  stroke: none; }
      .ph-fill-accent2 { fill: var(--ph-accent2); stroke: none; }
      .ph-q { fill: var(--ph-accent); stroke: none; font: 800 21px system-ui, sans-serif; text-anchor: middle; }

      /* ── animation setup ── */
      .ph-spin, .ph-spin-slow, .ph-spin-rev, .ph-fog, .ph-pulse,
      .ph-g1, .ph-g2, .ph-glitch, .ph-tear, .ph-scan,
      .ph-drift1, .ph-drift2, .ph-drift3 {
        transform-box: fill-box;
        transform-origin: center;
      }

      @media (prefers-reduced-motion: no-preference) {
        .ph-spin      { animation: phspin 3.6s linear infinite; }
        .ph-spin-slow { animation: phspin 11s linear infinite; }
        .ph-spin-rev  { animation: phspin 8s linear infinite reverse; }
        .ph-fog       { animation: phfog 4.2s ease-in-out infinite; }
        .ph-pulse     { animation: phpulse 2.1s ease-in-out infinite; }
        .ph-scan      { animation: phscan 3.2s ease-in-out infinite; }
        .ph-glitch    { animation: phglitch 4.5s steps(1) infinite; }
        .ph-g1        { animation: phjit1 3.7s steps(1) infinite; }
        .ph-g2        { animation: phjit2 4.6s steps(1) infinite; }
        .ph-tear      { animation: phtear 5.5s steps(1) infinite; }
        .ph-drift1    { animation: phdrift 5s ease-in-out infinite; }
        .ph-drift2    { animation: phdrift 6.2s ease-in-out infinite; }
        .ph-drift3    { animation: phdrift 4.4s ease-in-out infinite .4s; }
      }

      @keyframes phspin   { to { transform: rotate(360deg); } }
      @keyframes phfog    { 0%,100% { opacity:.16; transform:scale(.85); }  50% { opacity:.42; transform:scale(1.06); } }
      @keyframes phpulse  { 0%,100% { opacity:.35; transform:scale(.65); }  50% { opacity:1;   transform:scale(1.12); } }
      @keyframes phscan   { 0%,100% { transform:translateY(-1.2px); opacity:.9; } 50% { transform:translateY(1.4px); opacity:.5; } }
      @keyframes phglitch { 0%,90%,100% { transform:translateX(0); } 91% { transform:translateX(-2px); } 94% { transform:translateX(2.5px); } 97% { transform:translateX(-1px); } }
      @keyframes phjit1   { 0%,88%,100% { transform:translateX(0); } 90% { transform:translateX(3px);  } 93% { transform:translateX(-2px); } }
      @keyframes phjit2   { 0%,82%,100% { transform:translateX(0); } 85% { transform:translateX(-3px); } 89% { transform:translateX(1.5px); } }
      @keyframes phtear   { 0%,86%,100% { transform:translateX(0); } 88% { transform:translateX(4px);  } 91% { transform:translateX(-3px); } 94% { transform:translateX(2px); } }
      @keyframes phdrift  { 0%,100% { transform:translate(0,0); opacity:.9; } 50% { transform:translate(1.5px,-1.5px); opacity:.5; } }
    `;

    const themes = {
      cyber: `
        .ms-ph {
          background:
            linear-gradient(rgba(31,166,189,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31,166,189,0.06) 1px, transparent 1px),
            #020617;
          background-size: 28px 28px, 28px 28px, auto;
          border: 1px solid rgba(31,166,189,0.35);
          box-shadow: 0 0 24px rgba(31,166,189,0.06), inset 0 0 40px rgba(31,166,189,0.04);
        }
        .ms-inner { color: rgba(31,166,189,0.7); }
        .ms-label {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          color: rgba(31,166,189,0.6);
          text-shadow: 0 0 8px rgba(31,166,189,0.5);
        }
      `,
      dnd: `
        .ms-ph {
          background: radial-gradient(ellipse at center, #1e1608 0%, #0d0a04 100%);
          border: 2px solid #7a5c2a;
          box-shadow: 0 0 0 1px #0d0a04, 0 0 0 5px rgba(122,92,42,0.35), inset 0 0 40px rgba(0,0,0,0.5);
          position: relative;
        }
        .ms-ph::before, .ms-ph::after {
          content: '✦';
          position: absolute;
          color: #c49a3c;
          font-size: 1rem;
          opacity: 0.75;
          line-height: 1;
        }
        .ms-ph::before { top: 10px; left: 14px; }
        .ms-ph::after  { bottom: 10px; right: 14px; }
        .ms-inner { color: #b88a36; }
        .ms-label { font-family: Georgia, 'Times New Roman', serif; color: #b88a36; font-style: italic; opacity: 0.85; }
      `,
      std: `
        .ms-ph {
          background: rgba(148,163,184,0.07);
          border: 1px solid rgba(148,163,184,0.18);
        }
        .ms-inner { color: rgba(148,163,184,0.5); }
        .ms-label { color: rgba(148,163,184,0.45); font-family: system-ui, sans-serif; }
      `,
    };

    return base + (themes[theme] ?? themes.cyber);
  }
}

customElements.define('media-slot', MediaSlot);

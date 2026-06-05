/* heroes.js — "hero" tier illustrations for full-pane states.
 * The system's line icons (icons.js) stay minimal for thumbnail clarity; these
 * richer, landscape (200×160) renders — stone texture + ember runes, neon HUD +
 * glitch shards — are what scale up into whole-pane empty / failed states.
 * Built from primitives + gradients + an SVG glow filter, after the reference. */
(function () {
  const HEROES = {

    /* ---- D&D · Broken Spell Frame ---- */
    'broken-spell-frame': `
<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Broken spell frame">
  <defs>
    <linearGradient id="bsf-stone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d2cabb"/><stop offset="1" stop-color="#827a6d"/>
    </linearGradient>
    <linearGradient id="bsf-inner" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#928c80"/><stop offset="1" stop-color="#5e584e"/>
    </linearGradient>
    <radialGradient id="bsf-ember" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffbe78"/><stop offset="0.6" stop-color="#ff8a2a" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/>
    </radialGradient>
    <filter id="bsf-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect x="14" y="16" width="172" height="128" rx="15" fill="url(#bsf-stone)" stroke="#3e3931" stroke-width="2.5"/>
  <rect x="16.5" y="18.5" width="167" height="123" rx="13" fill="none" stroke="#ece5d7" stroke-width="1" opacity="0.45"/>
  <rect x="30" y="32" width="140" height="96" rx="7" fill="url(#bsf-inner)" stroke="#48433a" stroke-width="2"/>
  <g opacity="0.5">
    <circle cx="64" cy="62" r="9" fill="#bdb6aa"/>
    <path d="M38 116 L68 76 L88 98 L112 68 L150 116 Z" fill="#aaa498"/>
  </g>
  <g stroke="#5d574c" stroke-width="1.4" opacity="0.65" stroke-linecap="round">
    <path d="M44 24v4M64 24v4M84 24v4M104 24v4M124 24v4M144 24v4M160 24v4"/>
    <path d="M44 136v-4M64 136v-4M84 136v-4M104 136v-4M124 136v-4M144 136v-4"/>
  </g>
  <path d="M186 70 L171 86 L186 105 Z" fill="#15140f"/>
  <g>
    <path d="M104 16 L113 45 L95 64 L121 88 L107 144" fill="none" stroke="#2c2822" stroke-width="5" stroke-linejoin="round"/>
    <path d="M104 16 L113 45 L95 64 L121 88 L107 144" fill="none" stroke="#6d6557" stroke-width="1.5" stroke-linejoin="round" opacity="0.85"/>
    <path d="M113 45 L143 51 M95 64 L70 71 M121 88 L150 98" fill="none" stroke="#2c2822" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M113 45 L143 51 M95 64 L70 71 M121 88 L150 98" fill="none" stroke="#6d6557" stroke-width="0.9" stroke-linecap="round" opacity="0.7"/>
  </g>
  <g filter="url(#bsf-glow)">
    <circle class="hg-ember" cx="176" cy="58" r="15" fill="url(#bsf-ember)"/>
    <circle class="hg-ember-b" cx="182" cy="104" r="13" fill="url(#bsf-ember)"/>
    <path class="hg-rune" d="M172 51 v13 M172 51 l6 4 l-6 4" fill="none" stroke="#ffc488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="hg-rune-b" d="M180 99 v13 M180 99 l-5 5 M180 105 l5 5" fill="none" stroke="#ffb872" stroke-width="2" stroke-linecap="round"/>
    <circle class="hg-spark" cx="164" cy="82" r="1.9" fill="#ffe1bb"/>
    <circle class="hg-spark-b" cx="192" cy="80" r="1.4" fill="#ffe1bb"/>
    <circle class="hg-spark-c" cx="170" cy="124" r="1.6" fill="#ffd6a4"/>
    <circle class="hg-spark" cx="158" cy="60" r="1.2" fill="#ffd6a4"/>
  </g>
</svg>`,

    /* ---- Cyberpunk · Glitched Media Preview ---- */
    'glitched-media': `
<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Glitched media preview">
  <defs>
    <linearGradient id="gm-img" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#176aa8"/><stop offset="1" stop-color="#4ce6e6"/>
    </linearGradient>
    <filter id="gm-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.9" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g class="hg-scan" stroke="#34dce4" stroke-width="1" opacity="0.16">
    <path d="M40 44H150M40 52H150M40 60H150M40 68H150M40 76H150M40 84H150M40 92H150M40 100H150M40 108H150M40 116H150"/>
  </g>
  <g filter="url(#gm-glow)" fill="none" stroke="#34e1e6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M54 24 H40 a9 9 0 0 0 -9 9 V46"/>
    <path d="M146 24 H160 a9 9 0 0 1 9 9 V46"/>
    <path d="M169 114 V127 a9 9 0 0 1 -9 9 H146"/>
    <path d="M31 114 V127 a9 9 0 0 0 9 9 H54"/>
    <path d="M31 66 V94 M169 66 V94 M78 24 H122 M78 136 H122" opacity="0.85"/>
  </g>
  <g stroke="#34e1e6" stroke-width="2" opacity="0.65" stroke-linecap="round">
    <path d="M38 31 h7 M155 31 h7 M38 129 h7 M155 129 h7"/>
  </g>
  <g filter="url(#gm-glow)">
    <circle cx="64" cy="60" r="8" fill="url(#gm-img)"/>
    <path d="M42 112 L70 76 L90 96 L112 70 L136 112 Z" fill="url(#gm-img)"/>
  </g>
  <g filter="url(#gm-glow)">
    <rect class="hg-shard" x="118" y="48" width="42" height="4" fill="#34e1e6" opacity="0.9"/>
    <rect class="hg-shard-b" x="138" y="57" width="36" height="3" fill="#e857a6" opacity="0.85"/>
    <rect class="hg-shard" x="126" y="68" width="50" height="5" fill="#34e1e6" opacity="0.72"/>
    <rect class="hg-shard-b" x="150" y="79" width="30" height="3" fill="#e857a6" opacity="0.8"/>
    <rect class="hg-shard" x="132" y="90" width="46" height="4" fill="#34e1e6" opacity="0.58"/>
    <rect class="hg-shard-b" x="156" y="100" width="28" height="3" fill="#e857a6" opacity="0.68"/>
    <rect class="hg-shard" x="140" y="110" width="40" height="4" fill="#34e1e6" opacity="0.46"/>
  </g>
  <g class="hg-pix">
    <rect x="150" y="40" width="5" height="5" fill="#e857a6"/>
    <rect x="159" y="44" width="4" height="4" fill="#34e1e6"/>
    <rect x="146" y="118" width="4" height="4" fill="#e857a6" opacity="0.8"/>
  </g>
</svg>`,
  };

  window.HEROES = HEROES;
})();

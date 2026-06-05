/* gallery.js — renders the specimen gallery from window.ICONS + window.SKINS,
 * wires the control bar, and builds standalone .svg files for download. */
(function () {
  const ICONS = window.ICONS, SKINS = window.SKINS;
  const NS = 'http://www.w3.org/2000/svg';

  // ---- accent swatch options for the Base skin (tweakable) ----
  const ACCENTS = [
    { v: '#c8822f', n: 'Amber' },
    { v: '#cf6a3c', n: 'Ember' },
    { v: '#b8843a', n: 'Brass' },
    { v: '#9a9aa6', n: 'Neutral' },
  ];

  // Wrap an icon's inner markup in an <svg>. `skin` sets the accent vars inline
  // so the same markup themes correctly wherever it's dropped.
  function svgEl(icon, skin) {
    const s = SKINS[icon.group];
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', '0 0 64 64');
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke-width', '2.3');
    el.setAttribute('stroke-linecap', 'round');
    el.setAttribute('stroke-linejoin', 'round');
    el.style.setProperty('--ph-accent', s.accent);
    el.style.setProperty('--ph-accent2', s.accent2);
    el.innerHTML = icon.inner;
    if (skin && s.glow) el.classList.add('glow'); // glow handled by .tile.dark .glow
    return el;
  }

  function icon2(icon, cls) {
    const e = svgEl(icon, true);
    e.setAttribute('class', (e.getAttribute('class') || '') + ' ' + cls);
    return e;
  }

  // ---------------------------------------------------- in-context strip
  function renderContext() {
    const rows = [
      { icon: 'broken-frame',  name: 'fire_spider',     sub: 'pool · v05',  tag: 'decode failed' },
      { icon: 'failed-loading',name: 'poison_spider',   sub: 'pool · v00',  tag: 'timed out' },
      { icon: 'card-error',    name: 'lightning_spider',sub: 'draft · v09', tag: 'no thumb' },
      { icon: 'disabled-slot', name: '— empty slot —',  sub: 'draft · v15', tag: 'unassigned' },
    ];
    const wrap = document.getElementById('context-rows');
    rows.forEach(r => {
      const icon = ICONS.find(i => i.id === r.icon);
      const row = document.createElement('div');
      row.className = 'vrow';
      const t = document.createElement('div'); t.className = 'vthumb';
      t.appendChild(svgEl(icon, true));
      const m = document.createElement('div'); m.className = 'vmeta';
      m.innerHTML = `<b>${r.name}</b><span>${r.sub}</span>`;
      const g = document.createElement('div'); g.className = 'vtag'; g.textContent = r.tag;
      row.append(t, m, g);
      wrap.appendChild(row);
    });
  }

  // ---------------------------------------------------- full-pane states
  function renderBigStates() {
    const host = document.getElementById('big-grid');
    if (!host) return;
    const states = [
      { icon: 'failed-loading', label: 'Center preview · base', accent: '#c8822f',
        h: 'Couldn’t load preview', p: 'The GLB for fire_spider · v05 failed to decode. The file may still be building.',
        acts: [['solid', 'Retry'], ['ghost', 'Open log']] },
      { icon: 'card-error', label: 'Empty registry · base', accent: '#c8822f',
        h: 'No versions yet', p: 'This family has no rendered variants. Generate one to see it here.',
        acts: [['solid', '＋  New variant'], ['ghost', 'Import']] },
      { icon: 'broken-spell-frame', label: 'Preview · fantasy skin', accent: '#b88a36',
        h: 'The ward shattered', p: 'The binding spell broke mid-cast and the asset lost its form. Recast to rebind it.',
        acts: [['solid', '✦  Recast'], ['ghost', 'Dismiss']] },
      { icon: 'glitched-media', label: 'Preview · sci-fi skin', accent: '#1fa6bd',
        h: 'Signal corrupted', p: 'Reconstruction stalled mid-stream — the preview tore apart before it finished decoding.',
        acts: [['solid', 'Rebuild'], ['ghost', 'Diagnostics']] },
    ];
    states.forEach(st => {
      const icon = ICONS.find(i => i.id === st.icon);
      const pane = document.createElement('div'); pane.className = 'pane';
      const lbl = document.createElement('div'); lbl.className = 'ctxlabel'; lbl.textContent = st.label;
      const hero = window.HEROES && window.HEROES[st.icon];
      let g;
      if (hero) {
        g = document.createElement('div'); g.className = 'glyph hero'; g.innerHTML = hero;
      } else {
        g = svgEl(icon, true); g.setAttribute('class', (g.getAttribute('class') || '') + ' glyph');
      }
      const h = document.createElement('h4'); h.textContent = st.h;
      const p = document.createElement('p'); p.textContent = st.p;
      const acts = document.createElement('div'); acts.className = 'acts';
      st.acts.forEach(([kind, txt]) => {
        const b = document.createElement('button'); b.className = 'pbtn ' + kind; b.textContent = txt;
        if (kind === 'solid') b.style.background = st.accent;
        acts.appendChild(b);
      });
      pane.append(lbl, g, h, p, acts);
      host.appendChild(pane);
    });
  }

  // ---------------------------------------------------- sections + cards
  function renderSections() {
    const host = document.getElementById('sections');
    const groups = ['Base UI', 'D&D Fantasy', 'Cyberpunk'];
    groups.forEach((group, gi) => {
      const items = ICONS.filter(i => i.group === group);
      const skin = SKINS[group];
      const sec = document.createElement('section');
      sec.className = 'section';
      sec.innerHTML = `
        <div class="section-head">
          <div class="section-num">${String(gi + 1).padStart(2, '0')}</div>
          <div>
            <h2>${group}<span style="color:var(--ink-faint);font-weight:600;font-size:14px"> · ${items.length}</span></h2>
            <p>${skin.blurb}</p>
          </div>
        </div>`;
      const grid = document.createElement('div'); grid.className = 'grid';
      items.forEach(icon => grid.appendChild(card(icon)));
      sec.appendChild(grid);
      host.appendChild(sec);
    });
  }

  function card(icon) {
    const c = document.createElement('div'); c.className = 'card';

    const tiles = document.createElement('div'); tiles.className = 'tiles';
    [['dark', 'on dark'], ['light', 'on light']].forEach(([mode, label]) => {
      const tile = document.createElement('div'); tile.className = 'tile ' + mode;
      const lg = icon2(icon, 'lg');
      const sm = icon2(icon, 'sm');
      const tag = document.createElement('div'); tag.className = 'tile-tag'; tag.textContent = label;
      tile.append(lg, sm, tag);
      tiles.appendChild(tile);
    });

    const body = document.createElement('div'); body.className = 'card-body';
    body.innerHTML = `
      <div class="nm">${icon.name}</div>
      <div class="it">${icon.intent}</div>
      <div class="us">› ${icon.usage}</div>`;

    const foot = document.createElement('div'); foot.className = 'card-foot';
    const dl = document.createElement('button'); dl.className = 'dl';
    dl.innerHTML = `${dlIcon()} ${icon.id}.svg`;
    dl.onclick = () => download(icon);
    foot.appendChild(dl);

    c.append(tiles, body, foot);
    return c;
  }

  // ---------------------------------------------------- standalone export
  // Clean, dependency-free, attribute-based SVG (see bakeSvg in icons.js).
  function buildSvgFile(icon) {
    const a = window.skinAccents(icon.group);
    return window.bakeSvg(icon, a.accent, a.accent2);
  }

  function download(icon) {
    const blob = new Blob([buildSvgFile(icon)], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = icon.id + '.svg';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  window.__buildSvgFile = buildSvgFile; // used by the project export script

  // ---------------------------------------------------- controls
  function renderControls() {
    // accent swatches
    const sw = document.getElementById('swatches');
    ACCENTS.forEach((a, i) => {
      const b = document.createElement('button');
      b.className = 'sw' + (i === 0 ? ' sel' : '');
      b.style.background = a.v; b.title = a.n;
      b.onclick = () => {
        document.documentElement.style.setProperty('--accent', a.v);
        [...sw.children].forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
      };
      sw.appendChild(b);
    });

    const motion = document.getElementById('ctl-motion');
    motion.onclick = () => {
      document.body.classList.toggle('motion-on');
      motion.classList.toggle('on', document.body.classList.contains('motion-on'));
      motion.querySelector('.lbl').textContent =
        document.body.classList.contains('motion-on') ? 'Motion on' : 'Motion off';
    };

    const theme = document.getElementById('ctl-theme');
    theme.onclick = () => {
      document.body.classList.toggle('dark');
      theme.querySelector('.lbl').textContent =
        document.body.classList.contains('dark') ? 'Dark page' : 'Light page';
    };

    const dlAll = document.getElementById('ctl-dlall');
    dlAll.onclick = () => ICONS.forEach((ic, i) => setTimeout(() => download(ic), i * 130));
  }

  function dlIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>';
  }

  // ---------------------------------------------------- tokens footer
  function renderTokens() {
    const grid = document.getElementById('tok-grid');
    const toks = [
      { c: 'var(--accent)', b: '--ph-accent', s: 'Base error accent · amber' },
      { c: '#a8632a',       b: '--ph-accent2', s: 'Base deep · shadow' },
      { c: '#b88a36',       b: 'D&D --ph-accent', s: 'Faded gold' },
      { c: '#c4622f',       b: 'D&D --ph-accent2', s: 'Ember' },
      { c: '#1fa6bd',       b: 'Cyber --ph-accent', s: 'Neon cyan' },
      { c: '#cc5aa0',       b: 'Cyber --ph-accent2', s: 'Magenta corruption' },
      { c: 'currentColor',  b: '.ph-line', s: 'Structure · inherits text color' },
    ];
    toks.forEach(t => {
      const d = document.createElement('div'); d.className = 'tok';
      const chip = document.createElement('div'); chip.className = 'chip';
      chip.style.background = t.c;
      if (t.c === 'currentColor') { chip.style.background = 'transparent'; chip.style.border = '2px dashed var(--ink-faint)'; }
      const txt = document.createElement('div');
      txt.innerHTML = `<b>${t.b}</b><span>${t.s}</span>`;
      d.append(chip, txt); grid.appendChild(d);
    });
  }

  // ---------------------------------------------------- boot
  function boot() {
    document.body.classList.add('motion-on');
    renderControls();
    renderContext();
    renderBigStates();
    renderSections();
    renderTokens();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

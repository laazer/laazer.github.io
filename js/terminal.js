/**
 * loreOS terminal layer.
 *
 * 1. Window chrome: the traffic lights on every `.win` become real controls
 *    (red = close, yellow = minimise, green = maximise; Esc restores).
 * 2. A small interactive shell in the hero window, backed by a virtual
 *    filesystem built from the page's sections + profile data.
 *
 * All output is built with textContent / DOM nodes — never innerHTML — and
 * profile data always passes through ReferrerGate, so the "Laazer" persona
 * never sees personal details even if another script published raw data.
 */
(function () {
  var gate = window.ReferrerGate;
  var isJbrandt = !!(gate && gate.isJbrandtAccess());
  var USER = isJbrandt ? 'jacob' : 'guest';
  var HOST = isJbrandt ? 'brandt' : 'laazer';
  var BOOT = Date.now();

  /* ------------------------------------------------------------ helpers */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  // Only same-site relative paths and http(s) URLs are ever linked/opened.
  function safeHref(href) {
    if (typeof href !== 'string' || !href) return null;
    var trimmed = href.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.indexOf('//') === 0) return null;
    return trimmed;
  }

  function isExternal(href) {
    return /^https?:\/\//i.test(href);
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled';
  }

  function isVisible(node) {
    return !!node && getComputedStyle(node).display !== 'none';
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ------------------------------------------------------------ window chrome */

  var maximised = null;

  function setMaximised(win, on) {
    if (on && maximised && maximised !== win) setMaximised(maximised, false);
    win.classList.toggle('win--max', on);
    document.documentElement.classList.toggle('win-max-open', on);
    maximised = on ? win : null;
    if (on) {
      win.classList.remove('win--min');
      win.scrollTop = 0;
    } else {
      // Put the window back where the reader was looking.
      win.scrollIntoView({ behavior: 'instant', block: 'nearest' });
    }
    updateLightLabels(win);
  }

  function setMinimised(win, on) {
    if (on && win.classList.contains('win--max')) setMaximised(win, false);
    win.classList.toggle('win--min', on);
    updateLightLabels(win);
  }

  function setClosed(win, on) {
    if (on) {
      if (win.classList.contains('win--max')) setMaximised(win, false);
      win.classList.remove('win--min');
    }
    win.classList.toggle('win--closed', on);
    var stub = win.previousElementSibling;
    if (stub && stub.classList.contains('win-stub')) stub.hidden = !on;
    if (on && stub) stub.querySelector('button').focus();
    if (!on) {
      var red = win.querySelector('.light.r');
      if (red) red.focus();
    }
  }

  function windowTitle(win) {
    var t = win.querySelector('.win-title');
    return t ? t.textContent.replace(/^[\s—-]+|[\s—-]+$/g, '') : 'window';
  }

  function updateLightLabels(win) {
    var title = windowTitle(win);
    var y = win.querySelector('.light.y');
    var g = win.querySelector('.light.g');
    if (y) {
      var min = win.classList.contains('win--min');
      y.setAttribute('aria-label', (min ? 'Restore ' : 'Minimise ') + title);
      y.setAttribute('aria-pressed', String(min));
    }
    if (g) {
      var max = win.classList.contains('win--max');
      g.setAttribute('aria-label', (max ? 'Exit full screen: ' : 'Full screen: ') + title);
      g.setAttribute('aria-pressed', String(max));
    }
  }

  function initWindow(win) {
    var bar = win.querySelector('.win-bar');
    if (!bar) return;
    var title = windowTitle(win);

    var actions = { r: 'close', y: 'min', g: 'max' };
    Object.keys(actions).forEach(function (key) {
      var light = bar.querySelector('.light.' + key);
      if (!light) return;
      light.setAttribute('role', 'button');
      light.setAttribute('tabindex', '0');
      light.classList.add('light--btn');
      if (key === 'r') light.setAttribute('aria-label', 'Close ' + title);
      var act = function () {
        if (key === 'r') setClosed(win, true);
        else if (key === 'y') setMinimised(win, !win.classList.contains('win--min'));
        else setMaximised(win, !win.classList.contains('win--max'));
      };
      light.addEventListener('click', function (e) {
        e.stopPropagation();
        act();
      });
      light.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          act();
        }
      });
    });
    updateLightLabels(win);

    // Double-clicking the title bar toggles full screen, like a real WM.
    bar.addEventListener('dblclick', function (e) {
      if (e.target.closest('.light')) return;
      setMaximised(win, !win.classList.contains('win--max'));
    });

    // Closed windows leave a small stub behind so they can be reopened.
    var stub = el('div', 'win-stub');
    stub.hidden = true;
    var reopen = el('button', 'win-stub-btn');
    reopen.type = 'button';
    reopen.appendChild(el('span', 'win-stub-name', title));
    reopen.appendChild(el('span', 'win-stub-hint', '[closed] — click to reopen'));
    reopen.addEventListener('click', function () { setClosed(win, false); });
    stub.appendChild(reopen);
    win.parentNode.insertBefore(stub, win);
  }

  document.querySelectorAll('.win').forEach(initWindow);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && maximised) setMaximised(maximised, false);
  });

  /* ------------------------------------------------------------ profile data */

  var profile = null;

  function acceptProfile(data) {
    if (!data || typeof data !== 'object') return;
    // projects.js / blogs.js may publish the unfiltered JSON first; always
    // re-run the gate (it is idempotent) before anything reaches the shell.
    profile = gate ? gate.filterProfileData(data) : data;
    if (profile && gate && Array.isArray(profile.blogs)) {
      profile.blogs = gate.filterBlogs(profile.blogs);
    }
  }

  if (window['__profileData']) acceptProfile(window['__profileData']);
  window.addEventListener('laazer:profile', function (e) { acceptProfile(e.detail); });

  /* ------------------------------------------------------------ virtual fs */

  function sectionEl(id) {
    var node = document.getElementById(id);
    return isVisible(node) ? node : null;
  }

  function projectEntries() {
    var list = (profile && Array.isArray(profile.projects)) ? profile.projects : [];
    return list.map(function (p, i) {
      var href = safeHref(p.url);
      return {
        name: slugify(p.title),
        index: i + 1,
        title: String(p.title || ''),
        description: String(p.description || ''),
        href: href
      };
    });
  }

  function blogEntries() {
    var list = (profile && Array.isArray(profile.blogs)) ? profile.blogs.slice() : [];
    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    return list.map(function (b, i) {
      var href = b.type === 'local'
        ? 'blog.html?post=' + encodeURIComponent(b.url || '') + '&v=6'
        : safeHref(b.url);
      return {
        name: slugify(b.title).slice(0, 48).replace(/-+$/, ''),
        index: i + 1,
        title: String(b.title || ''),
        date: String(b.date || ''),
        href: href
      };
    });
  }

  // Root listing. `section` = element id to scroll to; `href` = page to open.
  function rootEntries() {
    var entries = [
      { name: 'about.md', type: 'file', section: 'about' },
      { name: 'experience.log', type: 'file', section: 'experience' },
      { name: 'projects', type: 'dir', section: 'projects' },
      { name: 'blog', type: 'dir', section: 'blogs' },
      { name: 'contact.txt', type: 'file', section: 'contact' },
      { name: 'resume.pdf', type: 'file', href: 'resume.html?v=14' }
    ];
    return entries.filter(function (e) { return !e.section || sectionEl(e.section); });
  }

  function dirChildren(dir) {
    if (dir === 'projects') return projectEntries().map(function (p) { return { name: p.name, type: 'file', item: p, kind: 'project' }; });
    if (dir === 'blog') return blogEntries().map(function (b) { return { name: b.name, type: 'file', item: b, kind: 'post' }; });
    return rootEntries();
  }

  /**
   * Resolve a path against cwd. Returns { path: [segments], node } or null.
   * Numeric names inside a dir resolve by index ("open 2" in ~/projects).
   */
  function resolve(input) {
    var raw = String(input || '').trim();
    var segs;
    if (raw === '' || raw === '~' || raw === '/') segs = [];
    else if (/^~?\//.test(raw)) segs = raw.replace(/^~?\/+/, '').split('/');
    else if (raw.indexOf('~') === 0) return null;
    else segs = (cwd ? [cwd] : []).concat(raw.split('/'));

    var out = [];
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (!s || s === '.') continue;
      if (s === '..') { out.pop(); continue; }
      out.push(s);
    }
    if (out.length === 0) return { path: [], node: { name: '~', type: 'dir' } };
    if (out.length > 2) return null;

    var top = null;
    rootEntries().forEach(function (e) { if (e.name === out[0]) top = e; });
    if (!top) return null;
    if (out.length === 1) return { path: [top.name], node: top };
    if (top.type !== 'dir') return null;

    var kids = dirChildren(top.name);
    var match = null;
    kids.forEach(function (k) {
      if (k.name === out[1] || String(k.item.index) === out[1]) match = k;
    });
    return match ? { path: [top.name, match.name], node: match } : null;
  }

  /* ------------------------------------------------------------ shell UI */

  var heroWin = document.querySelector('.hero .win');
  var heroBody = heroWin && heroWin.querySelector('.win-body');
  if (!heroBody) return;

  var cwd = '';
  var history = [];
  var histPos = 0;
  var draft = '';
  var MAX_LINES = 400;

  var term = el('div', 'term');
  var output = el('div', 'term-output');
  output.setAttribute('role', 'log');
  output.setAttribute('aria-live', 'polite');
  output.setAttribute('aria-label', 'Terminal output');

  var form = el('form', 'term-line');
  form.setAttribute('autocomplete', 'off');
  var promptEl = el('label', 'term-prompt');
  var input = el('input', 'term-input');
  input.type = 'text';
  input.id = 'term-input';
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('enterkeyhint', 'send');
  input.setAttribute('aria-label', 'Terminal command');
  input.maxLength = 200;
  promptEl.htmlFor = 'term-input';
  form.appendChild(promptEl);
  form.appendChild(input);

  term.appendChild(output);
  term.appendChild(form);
  heroBody.appendChild(term);

  var heroTitle = heroWin.querySelector('.win-title');
  if (heroTitle) heroTitle.textContent = '— ' + USER + '@' + HOST + ': ~ —';

  function cwdLabel() { return cwd ? '~/' + cwd : '~'; }

  function renderPrompt(target) {
    target.textContent = '';
    target.appendChild(el('span', 'a', '➜'));
    target.appendChild(document.createTextNode(' '));
    target.appendChild(el('span', 't', cwdLabel()));
    target.appendChild(document.createTextNode(' '));
  }

  function scrollToEnd() {
    output.scrollTop = output.scrollHeight;
  }

  /**
   * Print one line. `parts` is a string or array of strings /
   * { text, cls, href } objects.
   */
  function print(parts, lineCls) {
    var line = el('div', 'term-out' + (lineCls ? ' ' + lineCls : ''));
    (Array.isArray(parts) ? parts : [parts]).forEach(function (p) {
      if (p == null) return;
      if (typeof p === 'string') {
        line.appendChild(document.createTextNode(p));
        return;
      }
      var href = p.href ? safeHref(p.href) : null;
      var node;
      if (href) {
        node = el('a', p.cls || 'tk-link', p.text);
        node.href = href;
        if (isExternal(href)) {
          node.target = '_blank';
          node.rel = 'noopener noreferrer';
        }
      } else {
        node = el('span', p.cls || null, p.text);
      }
      line.appendChild(node);
    });
    output.appendChild(line);
    while (output.childNodes.length > MAX_LINES) output.removeChild(output.firstChild);
    scrollToEnd();
    return line;
  }

  function echoCommand(cmd) {
    var line = el('div', 'term-out term-echo');
    renderPrompt(line);
    line.appendChild(el('span', 'c', cmd));
    output.appendChild(line);
  }

  function focusTerm(opts) {
    if (heroWin.classList.contains('win--closed')) setClosed(heroWin, false);
    if (heroWin.classList.contains('win--min')) setMinimised(heroWin, false);
    if (opts && opts.scroll) {
      // Scroll the section (it carries scroll-margin-top for the menu bar).
      (heroWin.closest('.hero') || heroWin).scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' });
    }
    input.focus({ preventScroll: true });
  }

  function goToSection(id) {
    var node = sectionEl(id);
    if (!node) return false;
    node.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' });
    return true;
  }

  function navigate(href) {
    var safe = safeHref(href);
    if (!safe) return false;
    if (isExternal(safe)) {
      var w = window.open(safe, '_blank', 'noopener,noreferrer');
      if (!w) print(['popup blocked — ', { text: safe, href: safe }]);
    } else {
      window.location.href = safe;
    }
    return true;
  }

  function displayName() {
    var h = document.querySelector('.hero-name');
    return h ? h.textContent.trim() : 'Laazer';
  }

  function needProfile(cmd) {
    if (profile) return true;
    print(cmd + ': still loading profile data — try again in a moment', 'term-err');
    return false;
  }

  function uptime() {
    var s = Math.floor((Date.now() - BOOT) / 1000);
    var m = Math.floor(s / 60);
    return m ? m + ' min' + (m === 1 ? '' : 's') + ', ' + (s % 60) + ' secs' : s + ' secs';
  }

  /* ------------------------------------------------------------ commands */

  var COMMANDS = {
    help: {
      desc: 'list commands',
      run: function () {
        print('loreOS lzsh — available commands:', 'term-dim');
        Object.keys(COMMANDS).forEach(function (name) {
          if (COMMANDS[name].hidden) return;
          var pad = new Array(Math.max(1, 12 - name.length)).join(' ');
          print([{ text: name, cls: 'tk-cmd' }, pad + ' ' + COMMANDS[name].desc]);
        });
        print('tab completes · ↑/↓ history · ctrl+l clears · ` focuses this window', 'term-dim');
      }
    },
    whoami: {
      desc: 'who is this',
      run: function () {
        var role = profile && profile.contact && profile.contact.title;
        print([{ text: displayName(), cls: 'tk-name' }, ' — ' + (role || 'Software Engineer')]);
        print('Full Stack Code Alchemist. Builds personalization systems by day, slime platformers by night.', 'term-dim');
      }
    },
    ls: {
      desc: 'list files',
      args: 'path',
      run: function (args) {
        var long = args.indexOf('-l') !== -1 || args.indexOf('-la') !== -1 || args.indexOf('-al') !== -1;
        var target = args.filter(function (a) { return a.charAt(0) !== '-'; })[0];
        var res = resolve(target || '.');
        if (!res) return print('ls: ' + target + ': No such file or directory', 'term-err');
        if (res.node.type !== 'dir') return print({ text: res.node.name, cls: 'tk-file' });
        var dir = res.path[0] || '';
        if (dir && !needProfile('ls')) return;
        var kids = dirChildren(dir);
        if (!kids.length) return print('(empty)', 'term-dim');
        if (dir && !long) print('open <n> or open <name> · ls -l for file names', 'term-dim');
        if (dir) {
          kids.forEach(function (k) {
            var it = k.item;
            print([
              { text: '[' + it.index + '] ', cls: 'term-dim' },
              it.date ? { text: it.date + '  ', cls: 'term-dim' } : null,
              { text: long ? k.name : it.title, cls: 'tk-file', href: it.href }
            ]);
          });
          return;
        }
        if (long) {
          kids.forEach(function (k) {
            print([
              { text: (k.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--') + '  ' + USER + '  ', cls: 'term-dim' },
              { text: k.name + (k.type === 'dir' ? '/' : ''), cls: k.type === 'dir' ? 'tk-dir' : 'tk-file' }
            ]);
          });
          return;
        }
        var parts = [];
        kids.forEach(function (k) {
          parts.push({ text: k.name + (k.type === 'dir' ? '/' : ''), cls: k.type === 'dir' ? 'tk-dir' : 'tk-file' });
          parts.push('   ');
        });
        print(parts);
      }
    },
    cd: {
      desc: 'change directory (scrolls there)',
      args: 'dir',
      run: function (args) {
        var res = resolve(args[0] || '~');
        if (!res) return print('cd: no such file or directory: ' + args[0], 'term-err');
        if (res.node.type !== 'dir') return print('cd: not a directory: ' + args[0], 'term-err');
        cwd = res.path[0] || '';
        renderPrompt(promptEl);
        if (res.node.section) goToSection(res.node.section);
      }
    },
    pwd: {
      desc: 'print working directory',
      run: function () { print('/home/' + USER + (cwd ? '/' + cwd : '')); }
    },
    cat: {
      desc: 'print a file',
      args: 'path',
      run: function (args) {
        if (!args.length) return print('cat: missing file operand', 'term-err');
        var res = resolve(args[0]);
        if (!res) return print('cat: ' + args[0] + ': No such file or directory', 'term-err');
        var n = res.node;
        if (n.type === 'dir') return print('cat: ' + args[0] + ': Is a directory', 'term-err');
        if (n.kind === 'project') {
          print({ text: n.item.title, cls: 'tk-name' });
          print(n.item.description);
          return print(['→ ', { text: 'open ' + n.name, cls: 'tk-link', href: n.item.href }], 'term-dim');
        }
        if (n.kind === 'post') {
          print({ text: n.item.title, cls: 'tk-name' });
          return print([n.item.date + '  → ', { text: 'read post', cls: 'tk-link', href: n.item.href }], 'term-dim');
        }
        if (n.name === 'about.md') {
          var p = document.querySelector('#about .win-body p');
          return print(p ? p.textContent.trim() : '');
        }
        if (n.name === 'experience.log') return COMMANDS.tail.run(['-n', '99']);
        if (n.name === 'contact.txt') return COMMANDS.mail.run([]);
        if (n.name === 'resume.pdf') return print('cat: resume.pdf: binary file — try `open resume.pdf`', 'term-err');
      }
    },
    open: {
      desc: 'open a file, project or post',
      args: 'path',
      run: function (args) {
        if (!args.length) return print('open: missing operand — e.g. `open resume.pdf`', 'term-err');
        var res = resolve(args[0]);
        if (!res) return print('open: ' + args[0] + ': No such file or directory', 'term-err');
        var n = res.node;
        if (n.item) {
          if (!n.item.href) return print('open: ' + n.name + ': no link available', 'term-err');
          print('opening ' + n.item.title + '…', 'term-dim');
          return navigate(n.item.href);
        }
        if (n.href) {
          print('opening ' + n.name + '…', 'term-dim');
          return navigate(n.href);
        }
        if (n.section) return goToSection(n.section);
        goToSection('about');
      }
    },
    tail: {
      desc: 'latest experience (tail -n N)',
      run: function (args) {
        if (!needProfile('tail')) return;
        var n = 3;
        var i = args.indexOf('-n');
        if (i !== -1) n = parseInt(args[i + 1], 10);
        if (!isFinite(n) || n < 1) return print('tail: invalid number of lines', 'term-err');
        var jobs = Array.isArray(profile.experience) ? profile.experience.slice(0, n) : [];
        jobs.forEach(function (job) {
          print([
            { text: '[' + job.dateRange + '] ', cls: 'term-dim' },
            { text: job.title, cls: 'tk-role' },
            ' @ ',
            { text: job.company, cls: 'tk-name' }
          ]);
        });
      }
    },
    projects: {
      desc: 'alias for `ls ~/projects`',
      run: function () { COMMANDS.ls.run(['~/projects']); }
    },
    blog: {
      desc: 'alias for `ls ~/blog`',
      run: function () { COMMANDS.ls.run(['~/blog']); }
    },
    resume: {
      desc: 'open my résumé',
      run: function () { COMMANDS.open.run(['~/resume.pdf']); }
    },
    mail: {
      desc: 'how to reach me',
      run: function () {
        var c = profile && profile.contact;
        var linkedIn = c && safeHref(c.linkedIn);
        if (linkedIn) {
          print(['LinkedIn: ', { text: linkedIn.replace(/^https?:\/\/(www\.)?/, ''), href: linkedIn }]);
        } else {
          print('mail: no route to host — personal contact is private on this mirror.', 'term-err');
        }
        var gh = c && safeHref(c.github);
        if (gh) print(['GitHub:   ', { text: gh.replace(/^https?:\/\//, ''), href: gh }]);
      }
    },
    github: {
      desc: 'open GitHub',
      run: function () {
        var gh = profile && profile.contact && safeHref(profile.contact.github);
        navigate(gh || 'https://github.com/laazer');
      }
    },
    neofetch: {
      desc: 'system info',
      run: function () {
        var art = ['  .-----.   ', '  | LZR |   ', "  '-----'   ", '            ', '            ', '            ', '            '];
        var jobs = profile && Array.isArray(profile.experience) ? profile.experience.length : '?';
        var info = [
          [{ text: USER + '@' + HOST, cls: 'tk-name' }],
          ['---------------'],
          [{ text: 'OS: ', cls: 'tk-dir' }, 'loreOS 1d Hybrid'],
          [{ text: 'Shell: ', cls: 'tk-dir' }, 'lzsh 0.1'],
          [{ text: 'Uptime: ', cls: 'tk-dir' }, uptime()],
          [{ text: 'Roles: ', cls: 'tk-dir' }, jobs + ' logged'],
          [{ text: 'Projects: ', cls: 'tk-dir' }, String(projectEntries().length) + '   ',
            { text: 'Posts: ', cls: 'tk-dir' }, String(blogEntries().length)]
        ];
        art.forEach(function (a, i) {
          print([{ text: a, cls: 'tk-art' }].concat(info[i] || []), 'term-pre');
        });
      }
    },
    history: {
      desc: 'command history',
      run: function () {
        history.forEach(function (h, i) { print([{ text: String(i + 1) + '  ', cls: 'term-dim' }, h], 'term-pre'); });
      }
    },
    echo: {
      desc: 'print text',
      run: function (args) { print(args.join(' ')); }
    },
    date: {
      desc: 'current date',
      run: function () { print(new Date().toString()); }
    },
    uname: {
      desc: 'system name',
      run: function (args) {
        print(args.indexOf('-a') !== -1 ? 'loreOS ' + HOST + ' 1d-hybrid lzsh web x86_64' : 'loreOS');
      }
    },
    clear: {
      desc: 'clear the screen',
      run: function () { output.textContent = ''; }
    },
    exit: {
      desc: 'minimise this window',
      run: function () {
        input.blur();
        setMinimised(heroWin, true);
      }
    },
    sudo: {
      hidden: true,
      run: function () { print(USER + ' is not in the sudoers file. This incident will be reported.', 'term-err'); }
    },
    rm: {
      hidden: true,
      run: function () { print('rm: read-only file system (nice try)', 'term-err'); }
    },
    vim: {
      hidden: true,
      run: function () { print('you are now trapped in vim. just kidding — type `help`.', 'term-dim'); }
    },
    man: {
      desc: 'describe a command',
      args: 'cmd',
      run: function (args) {
        var c = COMMANDS[args[0]];
        if (!args[0]) return print('What manual page do you want?', 'term-err');
        if (!c || c.hidden) return print('No manual entry for ' + args[0], 'term-err');
        print([{ text: args[0], cls: 'tk-cmd' }, ' — ' + c.desc]);
      }
    }
  };
  var arcade = window.LoreGames;

  function playGame(name) {
    if (!arcade || !arcade.has(name)) return print('play: no such game: ' + name + ' — try `games`', 'term-err');
    print('launching ' + name + '… (esc to quit)', 'term-dim');
    arcade.launch(name, function (res) {
      print(name + ' closed · best ' + res.best, 'term-dim');
      input.focus({ preventScroll: true });
    });
  }

  COMMANDS.games = {
    desc: 'list the loreOS arcade',
    run: function () {
      if (!arcade) return print('games: arcade not installed', 'term-err');
      arcade.list().forEach(function (g) {
        var pad = new Array(Math.max(1, 12 - g.name.length)).join(' ');
        print([{ text: g.name, cls: 'tk-cmd' }, pad + ' ' + g.desc]);
      });
      print('run one by name, e.g. `snake`', 'term-dim');
    }
  };
  COMMANDS.play = {
    desc: 'play <game>',
    args: 'game',
    run: function (args) {
      if (!args[0]) return COMMANDS.games.run([]);
      playGame(args[0].toLowerCase());
    }
  };
  if (arcade) {
    arcade.list().forEach(function (g) {
      COMMANDS[g.name] = { hidden: true, run: function () { playGame(g.name); } };
    });
  }

  COMMANDS.ll = { hidden: true, args: 'path', run: function (args) { COMMANDS.ls.run(['-l'].concat(args)); } };
  COMMANDS.nano = COMMANDS.vim;
  COMMANDS.emacs = COMMANDS.vim;

  function tokenize(line) {
    var tokens = [];
    var re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    var m;
    while ((m = re.exec(line))) tokens.push(m[1] != null ? m[1] : m[2] != null ? m[2] : m[3]);
    return tokens;
  }

  function execute(line) {
    var trimmed = line.trim();
    echoCommand(line);
    if (!trimmed) return scrollToEnd();
    if (history[history.length - 1] !== trimmed) history.push(trimmed);
    if (history.length > 100) history.shift();

    var tokens = tokenize(trimmed);
    var name = tokens[0].toLowerCase();
    var cmd = Object.prototype.hasOwnProperty.call(COMMANDS, name) ? COMMANDS[name] : null;
    if (!cmd) {
      print('lzsh: command not found: ' + tokens[0] + ' — try `help`', 'term-err');
      return;
    }
    try {
      cmd.run(tokens.slice(1));
    } catch (err) {
      console.error('terminal:', err);
      print(name + ': something went wrong', 'term-err');
    }
    scrollToEnd();
  }

  /* ------------------------------------------------------------ completion */

  function commonPrefix(list) {
    if (!list.length) return '';
    var p = list[0];
    list.forEach(function (s) {
      while (s.indexOf(p) !== 0) p = p.slice(0, -1);
    });
    return p;
  }

  function pathCandidates(partial) {
    var slash = partial.lastIndexOf('/');
    var base = slash === -1 ? '' : partial.slice(0, slash + 1);
    var stem = slash === -1 ? partial : partial.slice(slash + 1);
    var res = resolve(base || '.');
    if (!res || res.node.type !== 'dir') return [];
    return dirChildren(res.path[0] || '')
      .filter(function (k) { return k.name.indexOf(stem) === 0; })
      .map(function (k) { return base + k.name + (k.type === 'dir' ? '/' : ''); });
  }

  function complete() {
    var value = input.value;
    var parts = value.split(' ');
    var last = parts[parts.length - 1];
    var candidates;
    if (parts.length === 1) {
      candidates = Object.keys(COMMANDS)
        .filter(function (c) { return !COMMANDS[c].hidden && c.indexOf(last) === 0; })
        .map(function (c) { return c + ' '; });
    } else {
      var cmd = COMMANDS[parts[0]];
      if (cmd && cmd.args === 'game') {
        candidates = arcade ? arcade.list().map(function (g) { return g.name; }).filter(function (n) { return n.indexOf(last) === 0; }) : [];
      } else if (!cmd || cmd.args === 'cmd') {
        candidates = cmd ? Object.keys(COMMANDS).filter(function (c) { return !COMMANDS[c].hidden && c.indexOf(last) === 0; }) : [];
      } else {
        candidates = cmd.args ? pathCandidates(last) : [];
      }
    }
    if (!candidates.length) return;
    var prefix = candidates.length === 1 ? candidates[0] : commonPrefix(candidates);
    if (prefix.length > last.length) {
      parts[parts.length - 1] = prefix;
      input.value = parts.join(' ');
    } else if (candidates.length > 1) {
      echoCommand(value);
      print(candidates.map(function (c) { return c.trim(); }).join('   '), 'term-dim');
    }
  }

  /* ------------------------------------------------------------ input wiring */

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var line = input.value;
    input.value = '';
    histPos = history.length + 1;
    draft = '';
    execute(line);
    histPos = history.length;
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      if (!input.value) return; // let Tab move focus when there's nothing to complete
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault();
      if (histPos === history.length) draft = input.value;
      histPos = Math.max(0, histPos - 1);
      input.value = history[histPos];
    } else if (e.key === 'ArrowDown') {
      if (histPos >= history.length) return;
      e.preventDefault();
      histPos += 1;
      input.value = histPos === history.length ? draft : history[histPos];
    } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      output.textContent = '';
    } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      if (input.selectionStart !== input.selectionEnd) return; // allow normal copy
      e.preventDefault();
      echoCommand(input.value + '^C');
      input.value = '';
      histPos = history.length;
    } else if (e.key === 'Escape') {
      input.blur();
    }
  });

  // Clicking empty space in the hero window focuses the prompt (but never
  // hijacks clicks on links/buttons or text selection).
  heroBody.addEventListener('click', function (e) {
    if (e.target.closest('a, button, input, .light')) return;
    var sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;
    input.focus({ preventScroll: true });
  });

  // Backtick from anywhere focuses the terminal.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '`' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (arcade && arcade.isOpen()) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    e.preventDefault();
    // Defer so the backtick keystroke doesn't follow focus into the input.
    setTimeout(function () { focusTerm({ scroll: true }); }, 0);
  });

  // The dock's "term" icon opens the terminal instead of jumping to "#".
  var dockTerm = document.querySelector('.dock-icon.i-term');
  var dockLink = dockTerm && dockTerm.closest('a');
  if (dockLink) {
    dockLink.addEventListener('click', function (e) {
      e.preventDefault();
      focusTerm({ scroll: true });
    });
  }

  /* ------------------------------------------------------------ cheat code */

  // ↑ ↑ ↓ ↓ ← → ← → A B Enter, typed anywhere on the page.
  var CHEAT = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'a', 'b', 'enter'];
  var cheatPos = 0;
  var cheatSnapshot = null; // prompt contents before the code started
  var CRT_KEY = 'loreos:crt';

  function setCrt(on) {
    document.documentElement.classList.toggle('crt', on);
    try { window.localStorage.setItem(CRT_KEY, on ? '1' : '0'); } catch (e) { /* ignore */ }
  }

  function crtOn() { return document.documentElement.classList.contains('crt'); }

  try { if (window.localStorage.getItem(CRT_KEY) === '1') setCrt(true); } catch (e) { /* ignore */ }

  function toast(msg) {
    var old = document.querySelector('.lore-toast');
    if (old) old.remove();
    var t = el('div', 'lore-toast', msg);
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }

  var cheatActive = false;

  function cheatUnlocked() {
    var on = !cheatActive;
    cheatActive = on;
    setCrt(on);
    if (arcade) arcade.setCheat(on);
    if (on) {
      if (!prefersReducedMotion()) {
        document.documentElement.classList.remove('crt-boot');
        void document.documentElement.offsetWidth; // restart the animation
        document.documentElement.classList.add('crt-boot');
        setTimeout(function () { document.documentElement.classList.remove('crt-boot'); }, 1200);
      }
      toast('★ CHEAT CODE ACCEPTED — 30 LIVES ★');
      print('★ cheat code accepted. CRT mode engaged; breakout now starts with 30 lives.', 'term-cheat');
      print('enter the code again (or run `crt`) to switch back.', 'term-dim');
    } else {
      toast('CHEATS OFF');
      print('cheats disabled. CRT mode off.', 'term-dim');
    }
  }

  COMMANDS.crt = {
    hidden: true,
    run: function () {
      var on = !crtOn();
      setCrt(on);
      print('CRT mode ' + (on ? 'on' : 'off'), 'term-dim');
    }
  };

  // Capture phase so the code still registers while a game or the prompt
  // is handling the arrow keys.
  window.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    var key = String(e.key || '').toLowerCase();
    if (key === CHEAT[cheatPos]) {
      cheatPos += 1;
    } else if (key === 'arrowup' && cheatPos >= 2 && CHEAT[cheatPos] === 'arrowdown') {
      cheatPos = 2; // "↑ ↑ ↑ ↓ …" still counts
    } else {
      cheatPos = key === CHEAT[0] ? 1 : 0;
    }
    // Arrows recall history and A/B type into the prompt while the code is
    // entered, so remember what was there before the first ↑.
    if (cheatPos === 1) cheatSnapshot = input.value;
    if (cheatPos < CHEAT.length) return;
    cheatPos = 0;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (cheatSnapshot !== null) input.value = cheatSnapshot;
    cheatSnapshot = null;
    histPos = history.length;
    cheatUnlocked();
  }, true);

  renderPrompt(promptEl);
  print([
    'Welcome to loreOS. Type ',
    { text: 'help', cls: 'tk-cmd' },
    ' to look around, or try ',
    { text: 'ls', cls: 'tk-cmd' },
    ', ',
    { text: 'cd projects', cls: 'tk-cmd' },
    ', ',
    { text: 'neofetch', cls: 'tk-cmd' },
    ', ',
    { text: 'games', cls: 'tk-cmd' },
    '.'
  ], 'term-dim');
})();

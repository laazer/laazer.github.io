(function () {
  var root = document.getElementById('resume-root');
  var downloadBtn = document.getElementById('resume-download');
  var pdfContactName = '';
  var resumeProfile = null;
  var GITHUB_MARK_B64 = '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';

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showError(msg) {
    if (!root) return;
    root.innerHTML = '<p class="resume-error">' + escapeHtml(msg) + '</p>';
  }

  function getBaseUrl() {
    var href = window.location.href.replace(/[#?].*$/, '');
    return href.substring(0, href.lastIndexOf('/') + 1);
  }

  function projectHref(project) {
    if (!project || !project.url) return '#';
    if (project.type === 'external') return project.url;
    return getBaseUrl() + String(project.url).replace(/^\.\//, '');
  }

  function pdfProjectHref(project, websiteUrl) {
    if (!project || !project.url) {
      return '#';
    }
    if (project.type === 'external') {
      return String(project.url).trim();
    }
    var base = (websiteUrl || '').trim();
    if (!base) {
      return projectHref(project);
    }
    if (!/^https?:\/\//i.test(base)) {
      base = 'https://' + base;
    }
    base = base.replace(/\/?$/, '/');
    var path = String(project.url).replace(/^\.\//, '');
    try {
      return new URL(path, base).href;
    } catch (err) {
      return base + path;
    }
  }

  function contactWebsiteLabel(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return 'Website';
    }
  }

  function renderContact(contact) {
    if (!contact) return '';
    var bits = [];
    if (contact.email) {
      bits.push('<a href="mailto:' + escapeHtml(contact.email) + '">' + escapeHtml(contact.email) + '</a>');
    }
    if (contact.website) {
      var site = String(contact.website).trim();
      bits.push(
        '<a href="' +
          escapeHtml(site) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(contactWebsiteLabel(site)) +
          '</a>'
      );
    }
    if (contact.linkedIn) {
      bits.push('<a href="' + escapeHtml(contact.linkedIn) + '" target="_blank" rel="noopener noreferrer">LinkedIn</a>');
    }
    if (contact.github) {
      bits.push('<a href="' + escapeHtml(contact.github) + '" target="_blank" rel="noopener noreferrer">GitHub</a>');
    }
    if (bits.length === 0) return '';
    return '<div class="resume-contact">' + bits.join('') + '</div>';
  }

  function renderExperience(jobs) {
    if (!jobs || !jobs.length) return '';
    var html = '<section class="resume-experience-block">';
    html += '<h2 class="resume-section-title">Experience</h2>';
    jobs.forEach(function (job) {
      html += '<article class="resume-job">';
      html += '<div class="resume-job-header">';
      html += '<h3 class="resume-job-company">' + escapeHtml(job.company || '') + '</h3>';
      html += '<p class="resume-job-dates">' + escapeHtml(job.dateRange || '') + '</p>';
      html += '</div>';
      if (job.title) {
        html += '<p class="resume-job-title">' + escapeHtml(job.title) + '</p>';
      }
      if (job.location) {
        html += '<p class="resume-job-location">' + escapeHtml(job.location) + '</p>';
      }
      if (job.description) {
        html += '<p class="resume-job-desc">' + escapeHtml(job.description) + '</p>';
      }
      if (job.highlights && job.highlights.length) {
        html += '<ul>';
        job.highlights.forEach(function (h) {
          html += '<li>' + escapeHtml(h) + '</li>';
        });
        html += '</ul>';
      }
      html += '</article>';
    });
    html += '</section>';
    return html;
  }

  function renderEducation(rows) {
    if (!rows || !rows.length) return '';
    var html = '<h2 class="resume-section-title">Education</h2>';
    rows.forEach(function (row) {
      html += '<div class="resume-edu-item">';
      html += '<p class="resume-edu-school">' + escapeHtml(row.school || '') + '</p>';
      if (row.degree) {
        html += '<p class="resume-edu-degree">' + escapeHtml(row.degree) + '</p>';
      }
      if (row.dateRange) {
        html += '<p class="resume-edu-dates">' + escapeHtml(row.dateRange) + '</p>';
      }
      html += '</div>';
    });
    return html;
  }

  function renderProjects(projects) {
    if (!projects || !projects.length) return '';
    var html = '<h2 class="resume-section-title">Projects</h2>';
    projects.forEach(function (p) {
      var href = projectHref(p);
      var isExternal = p.type === 'external';
      var target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      html += '<div class="resume-project">';
      html += '<p class="resume-project-title"><a href="' + escapeHtml(href) + '"' + target + '>' + escapeHtml(p.title || 'Project') + '</a></p>';
      if (p.description) {
        html += '<p class="resume-project-desc">' + escapeHtml(p.description) + '</p>';
      }
      html += '</div>';
    });
    return html;
  }

  function render(data) {
    resumeProfile = data;
    var c = data.contact || {};
    pdfContactName = c.name || '';
    document.title = (c.name || 'Laazer') + ' — Résumé';

    var body = '';
    body += '<h1 class="resume-name">' + escapeHtml(c.name || 'Laazer') + '</h1>';
    if (c.title) {
      body += '<p class="resume-headline">' + escapeHtml(c.title) + '</p>';
    }
    if (c.location) {
      body += '<p class="resume-location">' + escapeHtml(c.location) + '</p>';
    }
    body += renderContact(c);
    body += renderExperience(data.experience);
    body += renderEducation(data.education);
    body += renderProjects(data.projects);

    root.innerHTML = '<div class="resume-inner">' + body + '</div>';
  }

  function load() {
    if (!root) return;

    var url = getBaseUrl() + 'data/profile.json';
    fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(render)
      .catch(function () {
        showError('Could not load résumé data. Please try again later.');
      });
  }

  function getJsPDFConstructor() {
    if (window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }
    if (typeof window.jsPDF === 'function') {
      return window.jsPDF;
    }
    return null;
  }

  function sanitizePdfFilename(name) {
    var base = String(name || 'Resume').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_').trim();
    if (!base) {
      base = 'Resume';
    }
    if (base.length > 80) {
      base = base.slice(0, 80);
    }
    return base + '_Resume.pdf';
  }

  function pdfSafeText(s) {
    if (s == null || s === '') {
      return '';
    }
    var str = String(s);
    try {
      str = str.replace(/\p{Extended_Pictographic}/gu, '');
    } catch (e) {
      /* ignore if Unicode properties unsupported */
    }
    str = str.replace(/\uFE00-\uFE0F/g, '');
    str = str.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064]/g, '');
    str = str.replace(/\uFEFF/g, '');
    if (typeof str.normalize === 'function') {
      try {
        str = str.normalize('NFC');
      } catch (e2) {
        /* ignore */
      }
    }
    return str.replace(/\s+/g, ' ').trim();
  }

  function pdfAsciiSafe(s) {
    var t = pdfSafeText(s);
    t = t.replace(/\u2013|\u2014|\u2212/g, '-');
    t = t.replace(/\u2018|\u2019|\u02BC/g, "'");
    t = t.replace(/\u201C|\u201D/g, '"');
    t = t.replace(/\u00A0/g, ' ');
    t = t.replace(/\u2026/g, '...');
    t = t.replace(/[^\x20-\x7E]/g, '');
    return t.replace(/\s+/g, ' ').trim();
  }

  function pdfDisplayHref(url) {
    if (!url) {
      return '';
    }
    try {
      var u = new URL(url);
      var host = u.hostname.replace(/^www\./, '');
      var path = u.pathname;
      if (!path || path === '/') {
        return host;
      }
      return host + path.replace(/\/$/, '');
    } catch (err) {
      return String(url);
    }
  }

  function writeTextPdf(JsPDF, data) {
    var pdf = new JsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' });
    if (typeof pdf.setCharSpace === 'function') {
      pdf.setCharSpace(0);
    }
    var pageW = pdf.internal.pageSize.getWidth();
    var pageH = pdf.internal.pageSize.getHeight();
    var margin = 0.5;
    var contentW = pageW - 2 * margin;
    var y = margin;

    var NAME_PT = 15;
    var META_PT = 9;
    var CONTACT_PT = 8;
    var URL_PT = 7.5;
    var BODY_PT = 8.5;
    var SECTION_PT = 9;
    var LH_MULT = 1.3;
    var BADGE_W = 0.092;
    var BADGE_H = 0.092;
    var GH_ICON = BADGE_W + 2 / 72;
    var GAP_AFTER_HEADER = 0.12;
    var GAP_SECTION_TOP = 0.07;
    var GAP_AFTER_RULE = 0.08;
    var GAP_JOB = 0.09;
    var GAP_PROJECT = 0.1;
    var GAP_CONTACT_ROW = 0.035;
    var INDENT_URL = 0.14;
    var INDENT_BULLET = 0.14;
    var BULLET_R = 0.018;

    function lineInc(pt) {
      return ((pt || BODY_PT) * LH_MULT) / 72;
    }

    function ensureSpace(curY, h) {
      if (curY + h > pageH - margin) {
        pdf.addPage();
        return margin;
      }
      return curY;
    }

    function gapLine(refY, inches) {
      var next = refY + inches;
      if (next > pageH - margin) {
        pdf.addPage();
        return margin + inches;
      }
      return next;
    }

    function writeLineAt(x, refY, text, pt, fontStyle) {
      var lh = lineInc(pt);
      var ny = ensureSpace(refY, lh);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', fontStyle || 'normal');
      pdf.setFontSize(pt || BODY_PT);
      pdf.text(pdfAsciiSafe(text), x, ny);
      return ny + lh;
    }

    function drawPlainLink(x, baselineY, label, url, maxW) {
      var safeLabel = pdfAsciiSafe(label);
      var fs = pdf.getFontSize() || CONTACT_PT;
      var lh = lineInc(fs);
      if (typeof pdf.setCharSpace === 'function') {
        pdf.setCharSpace(0);
      }
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'italic');
      pdf.text(safeLabel, x, baselineY);
      var tw = pdf.getTextWidth(safeLabel);
      var linkW = Math.min(tw, maxW != null ? maxW : contentW - (x - margin));
      var h = lh * 0.92;
      var ulY = baselineY + Math.max(0.014, fs / 72 * 0.18);
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.002);
      pdf.line(x, ulY, x + linkW, ulY);
      pdf.link(x, baselineY - h * 0.85, linkW, h, { url: url });
      pdf.setFont('helvetica', 'normal');
    }

    function writeWrappedAt(x, refY, wMax, text, pt, fontStyle, indentExtra) {
      if (!text) {
        return refY;
      }
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', fontStyle || 'normal');
      pdf.setFontSize(pt || BODY_PT);
      var ind = indentExtra || 0;
      var lines = pdf.splitTextToSize(pdfAsciiSafe(text), wMax - ind);
      var lh = lineInc(pt);
      var cy = refY;
      for (var i = 0; i < lines.length; i++) {
        cy = ensureSpace(cy, lh);
        pdf.text(lines[i], x + ind, cy);
        cy += lh;
      }
      return cy;
    }

    function writeBulletParagraph(x, refY, wMax, paragraph, pt) {
      if (!paragraph) {
        return refY;
      }
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(pt || BODY_PT);
      var textStart = x + INDENT_BULLET + 0.04;
      var wrapW = wMax - (textStart - x);
      var lines = pdf.splitTextToSize(pdfAsciiSafe(paragraph), wrapW);
      var lh = lineInc(pt);
      var cy = refY;
      for (var i = 0; i < lines.length; i++) {
        cy = ensureSpace(cy, lh);
        if (i === 0) {
          pdf.setFillColor(26, 26, 26);
          pdf.circle(x + INDENT_BULLET * 0.35, cy - lh * 0.32, BULLET_R, 'F');
        }
        pdf.text(lines[i], textStart, cy);
        cy += lh;
      }
      return cy;
    }

    function drawBadgeRgb(x, baselineY, rgb) {
      var top = baselineY - BADGE_H * 0.82;
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pdf.rect(x, top, BADGE_W, BADGE_H, 'F');
    }

    function badgeInnerLabel(x, baselineY, label, pt) {
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(pt);
      pdf.text(String(label), x, baselineY);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
    }

    function writeContactBadgeRow(baselineY, rgb, inner, innerPt, linkLabel, url) {
      var lh = lineInc(CONTACT_PT);
      var ny = ensureSpace(baselineY, lh);
      drawBadgeRgb(margin, ny, rgb);
      if (inner) {
        badgeInnerLabel(margin + BADGE_W * 0.2, ny, inner, innerPt || 7.5);
      }
      var textX = margin + BADGE_W + 0.055;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(CONTACT_PT);
      if (url) {
        drawPlainLink(textX, ny, linkLabel, url, contentW - (textX - margin));
      } else {
        pdf.text(pdfAsciiSafe(linkLabel), textX, ny);
      }
      return ny + lh;
    }

    function writeGithubContactRow(baselineY, linkLabel, url) {
      var lh = lineInc(CONTACT_PT);
      var ny = ensureSpace(baselineY, lh);
      var imgTop = ny - GH_ICON * 0.82;
      try {
        pdf.addImage(GITHUB_MARK_B64, 'PNG', margin, imgTop, GH_ICON, GH_ICON);
      } catch (imgErr) {
        var topFb = ny - GH_ICON * 0.82;
        pdf.setFillColor(36, 41, 47);
        pdf.rect(margin, topFb, GH_ICON, GH_ICON, 'F');
        badgeInnerLabel(margin + GH_ICON * 0.2, ny, 'G', 8);
      }
      var textX = margin + GH_ICON + 0.055;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(CONTACT_PT);
      drawPlainLink(textX, ny, linkLabel, url, contentW - (textX - margin));
      return ny + lh;
    }

    function sectionRule(refY) {
      var cy = gapLine(refY, GAP_SECTION_TOP);
      pdf.setDrawColor(190, 190, 190);
      pdf.setLineWidth(0.004);
      pdf.line(margin, cy, margin + contentW, cy);
      return cy + GAP_AFTER_RULE;
    }

    function sectionHeading(refY, title) {
      var cy = sectionRule(refY);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(SECTION_PT);
      cy = ensureSpace(cy, lineInc(SECTION_PT));
      pdf.text(title, margin, cy);
      return cy + lineInc(SECTION_PT) * 1.05 + 0.03;
    }

    var c = data.contact || {};
    y = writeLineAt(margin, y, pdfSafeText(c.name || 'Resume'), NAME_PT, 'bold');
    var meta = [];
    if (c.title) {
      meta.push(pdfSafeText(c.title));
    }
    if (c.location) {
      meta.push(pdfSafeText(c.location));
    }
    if (meta.length) {
      y = writeLineAt(margin, y, meta.map(pdfAsciiSafe).filter(Boolean).join(' | '), META_PT, 'normal');
    }

    y = gapLine(y, 0.06);
    var contactFirst = true;
    if (c.email) {
      if (!contactFirst) {
        y = gapLine(y, GAP_CONTACT_ROW);
      }
      contactFirst = false;
      y = writeContactBadgeRow(y, [74, 85, 104], '@', 8, c.email, 'mailto:' + c.email);
    }
    if (c.website) {
      if (!contactFirst) {
        y = gapLine(y, GAP_CONTACT_ROW);
      }
      contactFirst = false;
      var site = String(c.website).trim();
      y = writeContactBadgeRow(y, [5, 122, 85], 'W', 7.5, pdfDisplayHref(site), site);
    }
    if (c.linkedIn) {
      if (!contactFirst) {
        y = gapLine(y, GAP_CONTACT_ROW);
      }
      contactFirst = false;
      var liUrl = String(c.linkedIn).trim();
      y = writeContactBadgeRow(y, [10, 102, 194], 'in', 7, pdfDisplayHref(liUrl), liUrl);
    }
    if (c.github) {
      if (!contactFirst) {
        y = gapLine(y, GAP_CONTACT_ROW);
      }
      contactFirst = false;
      var ghUrl = String(c.github).trim();
      y = writeGithubContactRow(y, pdfDisplayHref(ghUrl), ghUrl);
    }

    y = gapLine(y, GAP_AFTER_HEADER);

    y = sectionHeading(y, 'EXPERIENCE');
    var jobs = (data.experience || []).slice(0, 3);
    for (var j = 0; j < jobs.length; j++) {
      var job = jobs[j];
      y = gapLine(y, j === 0 ? 0.05 : GAP_JOB);
      var lhHead = lineInc(BODY_PT);
      y = ensureSpace(y, lhHead);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(BODY_PT);
      var comp = pdfAsciiSafe(job.company || '');
      pdf.text(comp, margin, y);
      if (job.dateRange) {
        var dr = pdfAsciiSafe(job.dateRange);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(BODY_PT);
        var dateW = pdf.getTextWidth(dr);
        pdf.text(dr, margin + contentW - dateW, y);
        pdf.setFont('helvetica', 'bold');
      }
      y += lhHead;

      var titleLoc = [job.title, job.location].filter(Boolean).join(' | ');
      if (titleLoc) {
        y = writeWrappedAt(margin, y, contentW, titleLoc, CONTACT_PT, 'bold', 0);
      }
      if (job.description) {
        y = writeWrappedAt(margin, y, contentW, job.description, BODY_PT, 'normal', 0);
      }
      if (job.highlights && job.highlights.length) {
        y = gapLine(y, 0.025);
        for (var h = 0; h < job.highlights.length; h++) {
          y = writeBulletParagraph(margin, y, contentW, job.highlights[h], BODY_PT);
          y = gapLine(y, 0.04);
        }
      }
    }

    if (data.education && data.education.length) {
      y = sectionHeading(y, 'EDUCATION');
      for (var e = 0; e < data.education.length; e++) {
        var row = data.education[e];
        if (row.school) {
          y = writeWrappedAt(margin, y, contentW, row.school, BODY_PT, 'bold', 0);
        }
        var eduLine = [row.degree, row.dateRange].filter(Boolean).join(' | ');
        if (eduLine) {
          y = writeWrappedAt(margin, y, contentW, eduLine, CONTACT_PT, 'normal', 0);
        }
        y = gapLine(y, 0.065);
      }
    }

    if (data.projects && data.projects.length) {
      y = sectionHeading(y, 'PROJECTS');
      for (var p = 0; p < data.projects.length; p++) {
        var proj = data.projects[p];
        var href = pdfProjectHref(proj, c.website);
        var title = pdfSafeText(proj.title || 'Project');
        y = writeWrappedAt(margin, y, contentW, title, BODY_PT, 'bold', 0);
        y = gapLine(y, 0.03);
        if (href && href !== '#') {
          var disp = pdfDisplayHref(href);
          var lhU = lineInc(URL_PT);
          y = ensureSpace(y, lhU);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(URL_PT);
          drawPlainLink(margin + INDENT_URL, y, disp, href, contentW - INDENT_URL);
          y += lhU;
        }
        if (proj.description) {
          y = gapLine(y, 0.035);
          y = writeWrappedAt(margin, y, contentW, proj.description, CONTACT_PT, 'normal', INDENT_URL);
        }
        y = gapLine(y, GAP_PROJECT);
      }
    }

    return pdf;
  }

  function downloadResumePdf() {
    if (!resumeProfile) {
      alert('Résumé data is not loaded yet. Please wait and try again.');
      return;
    }
    var JsPDF = getJsPDFConstructor();
    if (!JsPDF) {
      alert('jsPDF did not load. Check your network and try again.');
      return;
    }

    var filename = sanitizePdfFilename(pdfContactName);
    var label = downloadBtn ? downloadBtn.textContent : '';

    if (downloadBtn) {
      downloadBtn.disabled = true;
      downloadBtn.setAttribute('aria-busy', 'true');
      downloadBtn.textContent = 'Generating…';
    }

    try {
      var pdf = writeTextPdf(JsPDF, resumeProfile);
      pdf.save(filename);
    } catch (err) {
      console.error('resume PDF:', err);
      alert('Could not generate the PDF. Try again or use another browser.');
    } finally {
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.removeAttribute('aria-busy');
        downloadBtn.textContent = label || 'Download PDF';
      }
    }
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadResumePdf);
  }

  load();
})();

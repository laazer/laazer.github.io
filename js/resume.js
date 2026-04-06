(function () {
  var root = document.getElementById('resume-root');
  var downloadBtn = document.getElementById('resume-download');
  var pdfContactName = '';

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

  function fixPdfClone(doc) {
    var card = doc.querySelector('.resume-pdf-export-card');
    if (!card) {
      return;
    }
    card.style.backdropFilter = 'none';
    card.style.webkitBackdropFilter = 'none';
    card.style.boxShadow = 'none';
    var names = card.querySelectorAll('.resume-name');
    for (var i = 0; i < names.length; i++) {
      names[i].style.background = 'none';
      names[i].style.webkitBackgroundClip = 'border-box';
      names[i].style.backgroundClip = 'border-box';
      names[i].style.webkitTextFillColor = '#000000';
      names[i].style.color = '#000000';
    }
  }

  function downloadResumePdf() {
    var inner = document.querySelector('.resume-inner');
    if (!inner) {
      return;
    }
    if (typeof html2canvas !== 'function') {
      alert('html2canvas did not load. Check your network and try again.');
      return;
    }
    var JsPDF = getJsPDFConstructor();
    if (!JsPDF) {
      alert('jsPDF did not load. Check your network and try again.');
      return;
    }

    var wrap = document.createElement('div');
    wrap.className = 'resume-pdf-export-host';
    var card = document.createElement('div');
    card.className = 'resume-document resume-pdf-export-card';
    var clone = inner.cloneNode(true);
    var jobs = clone.querySelectorAll('.resume-experience-block article.resume-job');
    for (var j = 3; j < jobs.length; j++) {
      if (jobs[j].parentNode) {
        jobs[j].parentNode.removeChild(jobs[j]);
      }
    }
    card.appendChild(clone);
    wrap.appendChild(card);
    document.body.appendChild(wrap);

    var filename = sanitizePdfFilename(pdfContactName);
    var label = downloadBtn ? downloadBtn.textContent : '';

    if (downloadBtn) {
      downloadBtn.disabled = true;
      downloadBtn.setAttribute('aria-busy', 'true');
      downloadBtn.textContent = 'Generating…';
    }

    html2canvas(card, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: fixPdfClone
    })
      .then(function (canvas) {
        var pageW = 8.5;
        var pageH = 11;
        var margin = 0.2;
        var maxW = pageW - 2 * margin;
        var maxH = pageH - 2 * margin;
        var imgW = canvas.width;
        var imgH = canvas.height;
        var ratio = imgW / imgH;
        var boxRatio = maxW / maxH;
        var drawW;
        var drawH;
        if (ratio > boxRatio) {
          drawW = maxW;
          drawH = maxW / ratio;
        } else {
          drawH = maxH;
          drawW = maxH * ratio;
        }
        var x = margin + (maxW - drawW) / 2;
        var y = margin + (maxH - drawH) / 2;
        var imgData = canvas.toDataURL('image/png');
        var pdf = new JsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' });
        pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);
        pdf.save(filename);
      })
      .catch(function (err) {
        console.error('resume PDF:', err);
        alert('Could not generate the PDF. Try again or use another browser.');
      })
      .finally(function () {
        if (wrap.parentNode) {
          wrap.parentNode.removeChild(wrap);
        }
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.removeAttribute('aria-busy');
          downloadBtn.textContent = label || 'Download PDF';
        }
      });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadResumePdf);
  }

  load();
})();

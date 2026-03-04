(function () {
  var root = document.getElementById('experience-root');
  if (!root) return;

  var PER_PAGE = 3;
  var allJobs = [];
  var currentPage = 1;
  var showAll = false;

  function showError(msg) {
    root.innerHTML = '<p class="experience-error">' + escapeHtml(msg) + '</p>';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function cardHtml(job) {
    var html = '<article class="experience-card glass">';
    html += '<header class="experience-card-header">';
    html += '<h3 class="experience-company">' + escapeHtml(job.company) + '</h3>';
    html += '<p class="experience-title">' + escapeHtml(job.title) + '</p>';
    html += '<p class="experience-meta">';
    html += escapeHtml(job.dateRange);
    if (job.location) {
      html += ' · ' + escapeHtml(job.location);
    }
    html += '</p>';
    html += '</header>';
    if (job.description) {
      html += '<p class="experience-description">' + escapeHtml(job.description) + '</p>';
    }
    if (job.highlights && job.highlights.length > 0) {
      html += '<ul class="experience-highlights">';
      job.highlights.forEach(function (h) {
        html += '<li>' + escapeHtml(h) + '</li>';
      });
      html += '</ul>';
    }
    html += '</article>';
    return html;
  }

  function renderCards(jobs) {
    var html = '';
    jobs.forEach(function (job) {
      html += cardHtml(job);
    });
    return html;
  }

  function totalPages() {
    return Math.max(1, Math.ceil(allJobs.length / PER_PAGE));
  }

  function renderPagination() {
    var total = totalPages();
    var prevDisabled = currentPage <= 1 ? ' disabled' : '';
    var nextDisabled = currentPage >= total ? ' disabled' : '';
    var html = '<div class="experience-pagination">';
    html += '<button type="button" class="experience-pagination-btn experience-pagination-prev" aria-label="Previous page"' + prevDisabled + '>Previous</button>';
    html += '<span class="experience-pagination-info">Page <span class="experience-page-num">' + currentPage + '</span> of ' + total + '</span>';
    html += '<button type="button" class="experience-pagination-btn experience-pagination-next" aria-label="Next page"' + nextDisabled + '>Next</button>';
    html += '<button type="button" class="experience-pagination-btn experience-pagination-expand">Show all</button>';
    html += '</div>';
    return html;
  }

  function render() {
    var cardsHtml;
    var paginationHtml = '';
    if (showAll) {
      cardsHtml = renderCards(allJobs);
      paginationHtml = '<div class="experience-pagination">';
      paginationHtml += '<button type="button" class="experience-pagination-btn experience-pagination-collapse">Show 3 per page</button>';
      paginationHtml += '</div>';
    } else {
      var start = (currentPage - 1) * PER_PAGE;
      var slice = allJobs.slice(start, start + PER_PAGE);
      cardsHtml = renderCards(slice);
      paginationHtml = renderPagination();
    }
    root.innerHTML = '<div class="experience-list">' + cardsHtml + '</div>' + paginationHtml;
    bindPagination();
  }

  function bindPagination() {
    var prev = root.querySelector('.experience-pagination-prev');
    var next = root.querySelector('.experience-pagination-next');
    var expand = root.querySelector('.experience-pagination-expand');
    var collapse = root.querySelector('.experience-pagination-collapse');
    if (prev) prev.addEventListener('click', function () { setPage(currentPage - 1); });
    if (next) next.addEventListener('click', function () { setPage(currentPage + 1); });
    if (expand) expand.addEventListener('click', function () { setShowAll(true); });
    if (collapse) collapse.addEventListener('click', function () { setShowAll(false); });
  }

  function setPage(page) {
    var total = totalPages();
    if (page < 1) page = 1;
    if (page > total) page = total;
    currentPage = page;
    render();
  }

  function setShowAll(all) {
    showAll = all;
    render();
  }

  function renderExperience(data) {
    if (!data.experience || !Array.isArray(data.experience)) {
      showError('Unable to load experience.');
      return;
    }
    allJobs = data.experience;
    currentPage = 1;
    showAll = false;
    render();

    if (data.contact) {
      var contactSection = document.querySelector('.contact-info');
      if (contactSection && data.contact.linkedIn) {
        var link = contactSection.querySelector('a[href*="linkedin"]');
        if (link) link.setAttribute('href', data.contact.linkedIn);
      }
    }
  }

  function loadProfile() {
    var href = window.location.href.replace(/[#?].*$/, '');
    var base = href.substring(0, href.lastIndexOf('/') + 1);
    var url = base + 'data/profile.json';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(renderExperience)
      .catch(function (err) {
        console.warn('Profile fetch failed, using inline fallback:', err);
        var el = document.getElementById('profile-data');
        if (el && el.textContent) {
          try {
            renderExperience(JSON.parse(el.textContent));
          } catch (e) {
            console.error('Profile parse error:', e);
            showError('Unable to load experience.');
          }
        } else {
          showError('Unable to load experience.');
        }
      });
  }

  loadProfile();
})();

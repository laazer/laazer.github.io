(function () {
  var root = document.getElementById('projects-root');
  if (!root) return;

  var PER_PAGE = 3;
  var allProjects = [];
  var currentPage = 1;
  var showAll = false;

  function showError(msg) {
    root.innerHTML = '<p class="projects-error">' + escapeHtml(msg) + '</p>';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function cardHtml(project) {
    var isExternal = project.type === 'external';
    var target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    var html = '<a href="' + escapeHtml(project.url || '#') + '" class="project-card glass"' + target + '>';
    html += '<h3>' + escapeHtml(project.title) + '</h3>';
    html += '<p>' + escapeHtml(project.description) + '</p>';
    html += '</a>';
    return html;
  }

  function renderCards(projects) {
    var html = '';
    projects.forEach(function (project) {
      html += cardHtml(project);
    });
    return html;
  }

  function totalPages() {
    return Math.max(1, Math.ceil(allProjects.length / PER_PAGE));
  }

  function renderPagination() {
    var total = totalPages();
    var prevDisabled = currentPage <= 1 ? ' disabled' : '';
    var nextDisabled = currentPage >= total ? ' disabled' : '';
    var html = '<div class="projects-pagination">';
    html += '<button type="button" class="projects-pagination-btn projects-pagination-prev" aria-label="Previous page"' + prevDisabled + '>Previous</button>';
    html += '<span class="projects-pagination-info">Page <span class="projects-page-num">' + currentPage + '</span> of ' + total + '</span>';
    html += '<button type="button" class="projects-pagination-btn projects-pagination-next" aria-label="Next page"' + nextDisabled + '>Next</button>';
    html += '<button type="button" class="projects-pagination-btn projects-pagination-expand">Show all</button>';
    html += '</div>';
    return html;
  }

  function render() {
    var cardsHtml;
    var paginationHtml = '';
    if (showAll) {
      cardsHtml = renderCards(allProjects);
      paginationHtml = '<div class="projects-pagination">';
      paginationHtml += '<button type="button" class="projects-pagination-btn projects-pagination-collapse">Show ' + PER_PAGE + ' per page</button>';
      paginationHtml += '</div>';
    } else {
      var start = (currentPage - 1) * PER_PAGE;
      var slice = allProjects.slice(start, start + PER_PAGE);
      cardsHtml = renderCards(slice);
      paginationHtml = renderPagination();
    }
    root.innerHTML = '<div class="projects-list">' + cardsHtml + '</div>' + paginationHtml;
    bindPagination();
  }

  function bindPagination() {
    var prev = root.querySelector('.projects-pagination-prev');
    var next = root.querySelector('.projects-pagination-next');
    var expand = root.querySelector('.projects-pagination-expand');
    var collapse = root.querySelector('.projects-pagination-collapse');
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

  function renderProjects(data) {
    if (!data.projects || !Array.isArray(data.projects)) {
      root.innerHTML = '<p class="projects-empty">No projects yet.</p>';
      return;
    }
    allProjects = data.projects;
    currentPage = 1;
    showAll = false;
    render();
  }

  function loadProjects() {
    var shared = window['__profileData'];
    if (shared && Array.isArray(shared.projects)) {
      renderProjects(shared);
      return;
    }

    var href = window.location.href.replace(/[#?].*$/, '');
    var base = href.substring(0, href.lastIndexOf('/') + 1);
    var url = base + 'data/profile.json';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(function (data) {
        try { window['__profileData'] = data; } catch (e) {}
        renderProjects(data);
      })
      .catch(function (err) {
        console.warn('Projects fetch failed, using inline fallback:', err);
        var el = document.getElementById('profile-data');
        if (el && el.textContent) {
          try {
            renderProjects(JSON.parse(el.textContent));
          } catch (e) {
            console.error('Profile parse error:', e);
            showError('Unable to load projects.');
          }
        } else {
          showError('Unable to load projects.');
        }
      });
  }

  loadProjects();
})();

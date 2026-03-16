(function () {
  var root = document.getElementById('blogs-root');
  if (!root) return;

  var PER_PAGE = 3;
  var allBlogs = [];
  var currentPage = 1;
  var showAll = false;
  var reversed = false;

  var previewCache = {};

  function showError(msg) {
    root.innerHTML = '<p class="blogs-error">' + escapeHtml(msg) + '</p>';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getBlogTypeIcon(type) {
    var icons = {
      'medium': '📝',
      'linkedin': '💼',
      'local': '📄'
    };
    return icons[type] || '📚';
  }

  function getBlogTypeLabel(type) {
    var labels = {
      'medium': 'Medium',
      'linkedin': 'LinkedIn Article',
      'local': 'Blog Post'
    };
    return labels[type] || type;
  }

  function extractFirstParagraph(html) {
    var cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    var pMatch = cleaned.match(/<p[^>]*>([^<]+(?:<(?!\/p>)[^<]*)*)<\/p>/i);
    if (pMatch && pMatch[1]) {
      var text = pMatch[1].replace(/<[^>]+>/g, '').trim();
      if (text.length > 20) {
        return text.substring(0, 300) + (text.length > 300 ? '...' : '');
      }
    }

    var textMatch = cleaned.replace(/<[^>]+>/g, '').trim();
    if (textMatch.length > 20) {
      return textMatch.substring(0, 300) + (textMatch.length > 300 ? '...' : '');
    }

    return 'Read this article for more insights.';
  }

  function fetchPreview(blog) {
    if (blog.preview) {
      return Promise.resolve(blog.preview);
    }

    if (previewCache[blog.url]) {
      return Promise.resolve(previewCache[blog.url]);
    }

    if (blog.type === 'local') {
      return fetch(blog.url)
        .then(function (res) {
          return res.ok ? res.text() : Promise.reject('Failed to load');
        })
        .then(function (content) {
          var preview = content.split('\n').find(function (line) {
            return (line.trim().length > 20 && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('<img') && !line.startsWith('['));
          }) || 'Read this blog post.';
          previewCache[blog.url] = preview.substring(0, 300) + '...';
          return previewCache[blog.url];
        })
        .catch(function () {
          return 'Read this blog post.';
        });
    }

    return fetch(blog.url)
      .then(function (res) {
        return res.ok ? res.text() : Promise.reject('Failed to load');
      })
      .then(function (html) {
        var preview = extractFirstParagraph(html);
        previewCache[blog.url] = preview;
        return preview;
      })
      .catch(function () {
        return 'Read this article to learn more.';
      });
  }

  function blogCardHtml(blog, preview) {
    var html = '<article class="blog-card glass">';
    html += '<div class="blog-card-header">';
    html += '<div class="blog-type-badge">' + escapeHtml(getBlogTypeIcon(blog.type)) + ' ' + escapeHtml(getBlogTypeLabel(blog.type)) + '</div>';
    if (blog.date) {
      html += '<span class="blog-date">' + escapeHtml(blog.date) + '</span>';
    }
    html += '</div>';
    html += '<h3 class="blog-title">' + escapeHtml(blog.title) + '</h3>';
    html += '<p class="blog-preview">' + escapeHtml(preview) + '</p>';

    var linkTarget = blog.type === 'local' ? '' : ' target="_blank" rel="noopener noreferrer"';
    var href;
    if (blog.type === 'local') {
      href = 'blog.html?post=' + encodeURIComponent(blog.url);
    } else {
      href = blog.url || '#';
    }
    html += '<a href="' + escapeHtml(href) + '"' + linkTarget + ' class="blog-read-more">Read More →</a>';

    html += '</article>';
    return html;
  }

  function orderedBlogs() {
    return reversed ? allBlogs.slice().reverse() : allBlogs;
  }

  function totalPages() {
    return Math.max(1, Math.ceil(allBlogs.length / PER_PAGE));
  }

  function renderPagination() {
    var total = totalPages();
    var prevDisabled = currentPage <= 1 ? ' disabled' : '';
    var nextDisabled = currentPage >= total ? ' disabled' : '';
    var reverseLabel = reversed ? '↑ Oldest first' : '↓ Newest first';
    var html = '<div class="blogs-pagination">';
    html += '<button type="button" class="blogs-pagination-btn blogs-pagination-prev" aria-label="Previous page"' + prevDisabled + '>Previous</button>';
    html += '<span class="blogs-pagination-info">Page <span class="blogs-page-num">' + currentPage + '</span> of ' + total + '</span>';
    html += '<button type="button" class="blogs-pagination-btn blogs-pagination-next" aria-label="Next page"' + nextDisabled + '>Next</button>';
    html += '<button type="button" class="blogs-pagination-btn blogs-pagination-expand">Show all</button>';
    html += '<button type="button" class="blogs-pagination-btn blogs-pagination-reverse">' + reverseLabel + '</button>';
    html += '</div>';
    return html;
  }

  function render() {
    var ordered = orderedBlogs();
    var blogsToShow;
    var paginationHtml = '';
    var reverseLabel = reversed ? '↑ Oldest first' : '↓ Newest first';
    if (showAll) {
      blogsToShow = ordered;
      paginationHtml = '<div class="blogs-pagination">';
      paginationHtml += '<button type="button" class="blogs-pagination-btn blogs-pagination-collapse">Show ' + PER_PAGE + ' per page</button>';
      paginationHtml += '<button type="button" class="blogs-pagination-btn blogs-pagination-reverse">' + reverseLabel + '</button>';
      paginationHtml += '</div>';
    } else {
      var start = (currentPage - 1) * PER_PAGE;
      blogsToShow = ordered.slice(start, start + PER_PAGE);
      paginationHtml = renderPagination();
    }

    root.innerHTML = '<div class="blogs-list"></div>' + paginationHtml;
    var blogsList = root.querySelector('.blogs-list');
    bindPagination();

    Promise.all(blogsToShow.map(function (blog) {
      return fetchPreview(blog).then(function (preview) {
        return blogCardHtml(blog, preview);
      });
    })).then(function (cards) {
      blogsList.innerHTML = cards.join('');
    });
  }

  function bindPagination() {
    var prev = root.querySelector('.blogs-pagination-prev');
    var next = root.querySelector('.blogs-pagination-next');
    var expand = root.querySelector('.blogs-pagination-expand');
    var collapse = root.querySelector('.blogs-pagination-collapse');
    var reverse = root.querySelector('.blogs-pagination-reverse');
    if (prev) prev.addEventListener('click', function () { setPage(currentPage - 1); });
    if (next) next.addEventListener('click', function () { setPage(currentPage + 1); });
    if (expand) expand.addEventListener('click', function () { setShowAll(true); });
    if (collapse) collapse.addEventListener('click', function () { setShowAll(false); });
    if (reverse) reverse.addEventListener('click', function () { toggleReverse(); });
  }

  function toggleReverse() {
    reversed = !reversed;
    currentPage = 1;
    render();
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

  function renderBlogs(blogs) {
    if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
      root.innerHTML = '<p class="blogs-empty">No blog posts yet.</p>';
      return;
    }
    allBlogs = blogs;
    currentPage = 1;
    showAll = false;
    reversed = false;
    render();
  }

  function loadBlogs() {
    var shared = window['__profileData'];
    if (shared && Array.isArray(shared.blogs)) {
      renderBlogs(shared.blogs);
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
        renderBlogs(data.blogs);
      })
      .catch(function (err) {
        console.warn('Blog fetch failed, using inline fallback:', err);
        var el = document.getElementById('profile-data');
        if (el && el.textContent) {
          try {
            var data = JSON.parse(el.textContent);
            try { window['__profileData'] = data; } catch (e2) {}
            renderBlogs(data.blogs);
          } catch (e) {
            console.error('Profile parse error:', e);
            showError('Unable to load blog posts.');
          }
        } else {
          showError('Unable to load blog posts.');
        }
      });
  }

  loadBlogs();
})();

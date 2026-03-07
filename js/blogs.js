(function () {
  var root = document.getElementById('blogs-root');
  if (!root) return;

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
    // Remove script and style tags
    var cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Find first paragraph or meaningful text
    var pMatch = cleaned.match(/<p[^>]*>([^<]+(?:<(?!\/p>)[^<]*)*)<\/p>/i);
    if (pMatch && pMatch[1]) {
      var text = pMatch[1].replace(/<[^>]+>/g, '').trim();
      if (text.length > 20) {
        return text.substring(0, 300) + (text.length > 300 ? '...' : '');
      }
    }
    
    // Fallback: find any text content
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

    // For local files
    if (blog.type === 'local') {
      return fetch(blog.url)
        .then(function (res) {
          return res.ok ? res.text() : Promise.reject('Failed to load');
        })
        .then(function (content) {
          var preview = content.split('\n').find(function (line) {
            return line.trim().length > 20 && !line.startsWith('#');
          }) || 'Read this blog post.';
          previewCache[blog.url] = preview.substring(0, 300);
          return previewCache[blog.url];
        })
        .catch(function () {
          return 'Read this blog post.';
        });
    }

    // For web articles (Medium, LinkedIn, etc)
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
    var href = blog.url || '#';
    html += '<a href="' + escapeHtml(href) + '"' + linkTarget + ' class="blog-read-more">Read More →</a>';
    
    html += '</article>';
    return html;
  }

  function renderBlogs(blogs) {
    if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
      root.innerHTML = '<p class="blogs-empty">No blog posts yet.</p>';
      return;
    }

    root.innerHTML = '<div class="blogs-list"></div>';
    var blogsList = root.querySelector('.blogs-list');

    blogs.forEach(function (blog) {
      fetchPreview(blog).then(function (preview) {
        blogsList.innerHTML += blogCardHtml(blog, preview);
      });
    });
  }

  function loadBlogs() {
    var href = window.location.href.replace(/[#?].*$/, '');
    var base = href.substring(0, href.lastIndexOf('/') + 1);
    var url = base + 'data/profile.json';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(function (data) {
        renderBlogs(data.blogs);
      })
      .catch(function (err) {
        console.warn('Blog fetch failed, using inline fallback:', err);
        var el = document.getElementById('profile-data');
        if (el && el.textContent) {
          try {
            var data = JSON.parse(el.textContent);
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


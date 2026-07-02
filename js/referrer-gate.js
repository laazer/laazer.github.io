/**
 * Utility for gating personal details to jbrandt.dev access only.
 *
 * When NOT accessed via jbrandt.dev, the site shows the "Laazer" persona:
 * work history stays visible, but the real name, personal contact links,
 * and specific employer names are redacted. Projects, blogs, and education
 * are unchanged.
 */

window.ReferrerGate = (function () {
  function isJbrandtAccess() {
    if (/jbrandt\.dev/.test(window.location.hostname)) {
      return true;
    }
    // Explicit brand=jbrandt query param override (used for previews/testing).
    var brand = new URLSearchParams(window.location.search).get('brand');
    return brand === 'jbrandt';
  }

  // Employer names mapped to a neutral field/industry descriptor. Ordered most
  // specific first so that, e.g., "Amazon Robotics" and "Amazon.com" are matched
  // before the bare "Amazon". Used for both heading labels and inline prose.
  var BRAND_FIELDS = [
    ['Northeastern University College of Computer and Information Sciences', 'University'],
    ['Amazon Robotics', 'ECommerce Robotics'],
    ['Amazon.com', 'an ECommerce marketplace'],
    ['Amazon', 'ECommerce'],
    ['True Fit Corporation', 'Retail Technology'],
    ['True Fit', 'Retail Technology'],
    ['Eze Software Group', 'Trading Software'],
    ['EverCompliant Ltd', 'Cybersecurity'],
    ['EverCompliant', 'Cybersecurity'],
    ['Klaviyo', 'Marketing Automation'],
    ['Perch', 'ECommerce'],
    ['Chewy', 'ECommerce']
  ];

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Replace any employer-name mentions with a neutral field descriptor.
  function scrubText(text) {
    if (!text) return text;
    var out = String(text);
    BRAND_FIELDS.forEach(function (pair) {
      out = out.replace(new RegExp(escapeRegExp(pair[0]), 'gi'), pair[1]);
    });
    return out;
  }

  // True if the text names any employer (used to drop employer-specific blogs).
  function referencesEmployer(text) {
    if (!text) return false;
    var str = String(text);
    return BRAND_FIELDS.some(function (pair) {
      return new RegExp(escapeRegExp(pair[0]), 'i').test(str);
    });
  }

  function filterBlogs(blogs) {
    if (!Array.isArray(blogs)) return blogs;
    return blogs.filter(function (blog) {
      return !referencesEmployer(blog && blog.title) && !referencesEmployer(blog && blog.url);
    });
  }

  /**
   * Filter profile data for non-jbrandt.dev visitors. Returns the original data
   * unchanged for jbrandt.dev access.
   */
  function filterProfileData(data) {
    if (!data || isJbrandtAccess()) {
      return data;
    }

    var experience = Array.isArray(data.experience)
      ? data.experience.map(function (job) {
          return {
            company: job.company ? scrubText(job.company) : 'Confidential Employer',
            title: job.title,
            dateRange: job.dateRange,
            location: job.location || null,
            description: scrubText(job.description),
            highlights: Array.isArray(job.highlights)
              ? job.highlights.map(scrubText)
              : job.highlights
          };
        })
      : data.experience;

    var contact = data.contact
      ? {
          name: null, // hide real name; consumers fall back to the "Laazer" persona
          title: data.contact.title || null,
          location: data.contact.location || null,
          website: null, // hide jbrandt.dev (would reveal identity)
          email: null, // hide personal email
          linkedIn: null, // hide personal LinkedIn
          github: data.contact.github || null
        }
      : data.contact;

    return {
      contact: contact,
      experience: experience,
      education: data.education,
      projects: data.projects,
      blogs: filterBlogs(data.blogs)
    };
  }

  return {
    isJbrandtAccess: isJbrandtAccess,
    filterProfileData: filterProfileData,
    filterBlogs: filterBlogs
  };
})();

(function () {
  var isJbrandt = /jbrandt\.dev/.test(window.location.hostname) ||
    new URLSearchParams(window.location.search).get('brand') === 'jbrandt';

  if (isJbrandt) {
    // Show full branding when accessed via jbrandt.dev
    document.title = 'Jacob Brandt - Software Developer';
    var brand = document.querySelector('.navbar-brand');
    if (brand) brand.textContent = 'Jacob Brandt';
    var heroImg = document.querySelector('.hero-avatar');
    if (heroImg) { heroImg.src = 'images/profile/jake_gravitar.jpg'; heroImg.alt = 'Jacob Brandt'; }
    var heroH1 = document.querySelector('.hero .section-content h1');
    if (heroH1) heroH1.textContent = 'Jacob Brandt';
    var footerCopy = document.querySelector('footer > p');
    if (footerCopy) footerCopy.innerHTML = '© 2024 Jacob Brandt. All rights reserved.';
  } else {
    // Hide personal LinkedIn links when NOT on jbrandt.dev
    var linkedInLinks = document.querySelectorAll('a[href*="linkedin.com/in/brandtjacob"]');
    linkedInLinks.forEach(function (link) {
      link.style.display = 'none';
    });

    // Hide the Contact section entirely (it only exposes the personal
    // LinkedIn), along with its nav link and dock shortcut.
    var contactSection = document.getElementById('contact');
    if (contactSection) contactSection.style.display = 'none';

    document.querySelectorAll('a[href="#contact"], a[href$="#contact"]').forEach(function (link) {
      var item = link.closest('.navbar-item') || link.closest('.dock-item') || link;
      item.style.display = 'none';
    });
  }
})();

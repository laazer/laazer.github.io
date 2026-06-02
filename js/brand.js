(function () {
  var isJbrandt = /jbrandt\.dev/.test(window.location.hostname) ||
    new URLSearchParams(window.location.search).get('brand') === 'jbrandt';

  if (!isJbrandt) return;

  document.title = 'Jacob Brandt - Software Developer';
  var brand = document.querySelector('.navbar-brand');
  if (brand) brand.textContent = 'Jacob Brandt';
  var heroImg = document.querySelector('.hero-avatar');
  if (heroImg) { heroImg.src = 'images/profile/jake_gravitar.jpg'; heroImg.alt = 'Jacob Brandt'; }
  var heroH1 = document.querySelector('.hero .section-content h1');
  if (heroH1) heroH1.textContent = 'Jacob Brandt';
  var footerCopy = document.querySelector('footer > p');
  if (footerCopy) footerCopy.innerHTML = '© 2024 Jacob Brandt. All rights reserved.';
})();

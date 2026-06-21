/* nav.js — Navegación accesible compartida
   - aria-current="page" automático según URL
   - Menú hamburguesa para móvil con keyboard support
*/
(function () {
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.site-header');
  if (!nav || !header) return;

  nav.id = 'main-nav';

  // ── aria-current ──
  const page = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // ── Hamburger button ──
  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'main-nav');
  btn.setAttribute('aria-label', 'Abrir menú');
  btn.innerHTML =
    '<span class="nav-toggle-bar"></span>' +
    '<span class="nav-toggle-bar"></span>' +
    '<span class="nav-toggle-bar"></span>';
  header.insertBefore(btn, nav);

  function open() {
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar menú');
    header.classList.add('nav-open');
    // focus first link
    var first = nav.querySelector('a');
    if (first) first.focus();
  }

  function close() {
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
    header.classList.remove('nav-open');
    btn.focus();
  }

  btn.addEventListener('click', function () {
    header.classList.contains('nav-open') ? close() : open();
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) close();
  });

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) close();
  });

  // Close after navigation on mobile
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.innerWidth < 640) close();
    });
  });
})();

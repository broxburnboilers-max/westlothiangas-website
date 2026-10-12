/* West Lothian Gas — shared header / menu / footer behaviour */
(function () {
  var items = document.querySelectorAll('.wlg-nav__item.has-menu');
  function closeAll(except) {
    items.forEach(function (it) {
      if (it !== except) {
        it.classList.remove('is-open');
        var b = it.querySelector('.wlg-nav__link');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  }
  items.forEach(function (it) {
    var btn = it.querySelector('.wlg-nav__link');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !it.classList.contains('is-open');
      closeAll(it);
      it.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.wlg-nav__item')) closeAll();
  });

  var drawer = document.getElementById('wlgDrawer');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  document.querySelectorAll('[data-wlg-open]').forEach(function (b) {
    b.addEventListener('click', function () { setDrawer(true); });
  });
  document.querySelectorAll('[data-wlg-close]').forEach(function (b) {
    b.addEventListener('click', function () { setDrawer(false); });
  });
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer || e.target.closest('a')) setDrawer(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); setDrawer(false); }
  });

  var yr = document.querySelectorAll('[data-wlg-year]');
  yr.forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

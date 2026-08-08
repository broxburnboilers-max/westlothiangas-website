(function () {
  'use strict';

  var PAGE_URL = 'https://westlothiangas.com/landlords';
  var PAGE_TITLE = 'West Lothian Gas — Landlord & Letting Agent Partner Page';
  var SHARE_TEXT = 'Take a look at West Lothian Gas — 5.0★ on Google and a Landlord Cover Plan that includes the annual gas safety certificate, boiler service and breakdown cover.';

  /* ---------- Theme toggle ---------- */
  (function themeToggle() {
    var root = document.documentElement;
    var toggle = document.querySelector('[data-theme-toggle]');
    var mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', mode);
    updateIcon(mode);

    if (toggle) {
      toggle.addEventListener('click', function () {
        mode = mode === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', mode);
        updateIcon(mode);
      });
    }

    function updateIcon(m) {
      if (!toggle) return;
      toggle.setAttribute('aria-label', 'Switch to ' + (m === 'dark' ? 'light' : 'dark') + ' mode');
      toggle.innerHTML =
        m === 'dark'
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  })();

  /* ---------- Header call dropdown ---------- */
  (function callDropdown() {
    var wrap = document.querySelector('[data-call-dropdown]');
    var toggle = document.querySelector('[data-call-toggle]');
    if (!wrap || !toggle) return;

    function close() {
      wrap.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function open() {
      wrap.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.contains('is-open') ? close() : open();
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  })();

  /* ---------- Sticky header hide-on-scroll ---------- */
  (function headerScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var lastY = window.scrollY;
    window.addEventListener(
      'scroll',
      function () {
        var y = window.scrollY;
        header.classList.toggle('header--scrolled', y > 8);
        if (y > lastY && y > 160) {
          header.classList.add('header--hidden');
        } else {
          header.classList.remove('header--hidden');
        }
        lastY = y;
      },
      { passive: true }
    );
  })();

  /* ---------- Mobile nav drawer ---------- */
  (function mobileNav() {
    var drawer = document.getElementById('mobileNav');
    var openBtn = document.querySelector('[data-nav-open]');
    var closeBtn = document.querySelector('[data-nav-close]');
    if (!drawer) return;
    function open() {
      drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav-close-link]'), function (a) {
      a.addEventListener('click', close);
    });
  })();

  /* ---------- Scroll reveal ---------- */
  (function revealOnScroll() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || !items.length) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px 80px 0px' }
    );
    Array.prototype.forEach.call(items, function (el) {
      io.observe(el);
    });
  })();

  /* ---------- FAQ accordion ---------- */
  (function faq() {
    var items = document.querySelectorAll('[data-faq]');
    Array.prototype.forEach.call(items, function (item) {
      var btn = item.querySelector('.faq-item__q');
      var panel = item.querySelector('.faq-item__a');
      var inner = item.querySelector('.faq-item__a-inner');
      btn.addEventListener('click', function () {
        var isOpen = item.getAttribute('data-open') === 'true';
        // close all
        Array.prototype.forEach.call(items, function (other) {
          other.setAttribute('data-open', 'false');
          other.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-item__a').style.maxHeight = null;
        });
        if (!isOpen) {
          item.setAttribute('data-open', 'true');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = inner.scrollHeight + 24 + 'px';
        }
      });
    });
  })();

  /* ---------- Share: native, WhatsApp, email, copy link ---------- */
  (function share() {
    var whatsappLink = document.querySelector('[data-share-whatsapp]');
    var emailLink = document.querySelector('[data-share-email]');
    var nativeBtn = document.querySelector('[data-share-native]');
    var copyBtn = document.querySelector('[data-copy-link]');
    var urlInput = document.getElementById('shareUrl');
    var toast = document.getElementById('shareToast');

    if (whatsappLink) {
      whatsappLink.href = 'https://wa.me/?text=' + encodeURIComponent(SHARE_TEXT + ' ' + PAGE_URL);
    }
    if (emailLink) {
      emailLink.href =
        'mailto:?subject=' +
        encodeURIComponent('West Lothian Gas — Landlord Cover Plan') +
        '&body=' +
        encodeURIComponent(SHARE_TEXT + '\n\n' + PAGE_URL);
    }
    if (nativeBtn) {
      nativeBtn.addEventListener('click', function () {
        if (navigator.share) {
          navigator.share({ title: PAGE_TITLE, text: SHARE_TEXT, url: PAGE_URL }).catch(function () {});
        } else {
          copyToClipboard(PAGE_URL);
          flashToast('Link copied — paste it anywhere');
        }
      });
    }
    if (copyBtn && urlInput) {
      copyBtn.addEventListener('click', function () {
        copyToClipboard(urlInput.value);
        flashToast('Link copied');
      });
    }

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
    }

    function fallbackCopy(text) {
      var tmp = document.createElement('textarea');
      tmp.value = text;
      tmp.style.position = 'fixed';
      tmp.style.opacity = '0';
      document.body.appendChild(tmp);
      tmp.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      document.body.removeChild(tmp);
    }

    function flashToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('visible');
      clearTimeout(toast._t);
      toast._t = setTimeout(function () {
        toast.classList.remove('visible');
      }, 2200);
    }
  })();
})();

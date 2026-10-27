/* West Lothian Gas: Google tag (GA4 + Google Ads), loaded after the page so it doesn't slow it down.
   One tag for the whole site. Do not add Tag Manager or other gtag snippets to pages. */
(function () {
  var w = window, d = document;
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag !== 'function') { w.gtag = function () { w.dataLayer.push(arguments); }; }
  var gtag = w.gtag;

  gtag('js', new Date());
  gtag('config', 'G-9HD08NFJB8');
  gtag('config', 'AW-18085944113');
  // Website call conversion: Google swaps this number for a forwarding number for ad visitors.
  gtag('config', 'AW-18085944113/8jqcCLre0MscELG2hrBD', { phone_conversion_number: '07961 768920' });

  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-9HD08NFJB8';
    d.head.appendChild(s);
  }
  // Load at once on the thank-you page, otherwise on first interaction or after 3 seconds.
  if (/\/quote-thanks/.test(location.pathname) || d.documentElement.hasAttribute('data-track-now')) {
    load();
  } else {
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
      w.addEventListener(ev, load, { once: true, passive: true });
    });
    w.addEventListener('load', function () { setTimeout(load, 3000); });
  }

  // Quote form sent (quote-thanks page)
  if (/\/quote-thanks/.test(location.pathname)) {
    gtag('event', 'generate_lead', { form_name: 'quote' });
    gtag('event', 'conversion', { send_to: 'AW-18085944113/t3yYCPLE_asdELG2hrBD', value: 50.0, currency: 'GBP' });
  }

  // Phone and WhatsApp clicks
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    try {
      if (href.indexOf('tel:') === 0) {
        gtag('event', 'phone_click', { phone_number: href.slice(4), link_text: (a.textContent || '').trim().slice(0, 60) });
      } else if (/wa\.me\//.test(href)) {
        gtag('event', 'whatsapp_click', { link_text: (a.textContent || '').trim().slice(0, 60) });
      }
    } catch (err) { /* never block the click */ }
    load();
  }, true);
})();

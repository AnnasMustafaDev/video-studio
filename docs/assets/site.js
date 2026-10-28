// Video Studio docs site: theme toggle, mobile menu, copy buttons, card filter, in-page TOC. No dependencies.
(function () {
  var root = document.documentElement;
  var doc = document;

  /* Theme: light by default, dark only when the visitor chooses it. */
  try {
    var saved = localStorage.getItem('vs-theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {}

  var toggle = doc.getElementById('theme-toggle');
  function syncToggle() {
    if (!toggle) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    toggle.textContent = dark ? 'Light' : 'Dark';
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0e1013' : '#ffffff');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('vs-theme', next); } catch (e) {}
      syncToggle();
    });
    syncToggle();
  }

  /* Skip link and main landmark id */
  var main = doc.querySelector('main');
  if (main) {
    if (!main.id) main.id = 'main';
    main.setAttribute('tabindex', '-1');
    var skip = doc.createElement('a');
    skip.className = 'skip';
    skip.href = '#' + main.id;
    skip.textContent = 'Skip to content';
    doc.body.insertBefore(skip, doc.body.firstChild);
  }

  /* Mobile menu: a button is added to the header; CSS shows it below 1180px */
  var header = doc.querySelector('header.site');
  var nav = header && header.querySelector('nav.main');
  if (header && nav) {
    var wrap = header.querySelector('.wrap');
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'btn menu-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<span class="bars" aria-hidden="true"></span><span>Menu</span>';
    if (!nav.id) nav.id = 'site-nav';
    btn.setAttribute('aria-controls', nav.id);
    wrap.appendChild(btn);
    var setOpen = function (open) {
      header.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    btn.addEventListener('click', function () { setOpen(!header.classList.contains('open')); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('open')) { setOpen(false); btn.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  }

  /* Copy buttons on every <pre> */
  doc.querySelectorAll('pre').forEach(function (pre) {
    if (pre.hasAttribute('data-nocopy') || pre.querySelector('.copy')) return;
    var b = doc.createElement('button');
    b.type = 'button';
    b.className = 'copy';
    b.textContent = 'Copy';
    b.setAttribute('aria-label', 'Copy code to clipboard');
    b.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = (code ? code.innerText : pre.innerText).replace(/\s+$/, '');
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1400); };
      var fallback = function () {
        var ta = doc.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        doc.body.appendChild(ta); ta.select();
        try { doc.execCommand('copy'); done(); } catch (e) {}
        doc.body.removeChild(ta);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
    pre.appendChild(b);
  });

  /* Card filter: <input data-filter-input> filters [data-filter-text]; optional [data-filter-count] */
  var input = doc.querySelector('[data-filter-input]');
  if (input) {
    var items = doc.querySelectorAll('[data-filter-text]');
    var count = doc.querySelector('[data-filter-count]');
    var apply = function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (el) {
        var hit = !q || el.getAttribute('data-filter-text').toLowerCase().indexOf(q) !== -1;
        el.classList.toggle('hidden', !hit);
        if (hit) shown++;
      });
      if (count) count.textContent = shown + ' of ' + items.length;
    };
    input.addEventListener('input', apply);
    apply();
  }

  /* In-page table of contents.
     <nav class="doc-toc" data-auto aria-label="On this page"></nav> next to <div class="prose">:
     built from the h2 and h3 of the .prose element. A pre-filled .doc-toc is only given scroll-spy. */
  var toc = doc.querySelector('.doc-toc');
  var prose = doc.querySelector('.doc .prose, .doc .doc-main');
  if (toc && prose) {
    var slug = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section'; };
    var heads = Array.prototype.slice.call(prose.querySelectorAll('h2, h3')).filter(function (h) {
      return !h.closest('.card, .day, .flow, .gloss, .brief, details, .callout, .stat, .hero, figure');
    });
    var used = {};
    heads.forEach(function (h) {
      if (!h.id) {
        var id = slug(h.textContent), n = 2, base = id;
        while (used[id] || doc.getElementById(id)) id = base + '-' + n++;
        h.id = id;
      }
      used[h.id] = true;
      if (!h.querySelector('.anchor')) {
        var a = doc.createElement('a');
        a.className = 'anchor'; a.href = '#' + h.id; a.setAttribute('aria-label', 'Link to this section'); a.textContent = '#';
        h.appendChild(a);
      }
    });
    if (toc.hasAttribute('data-auto') && !toc.querySelector('a')) {
      if (heads.length < 3) { toc.classList.add('hidden'); }
      else {
        var html = '<p class="toc-title">On this page</p><ul>';
        heads.forEach(function (h) {
          var t = h.cloneNode(true);
          var an = t.querySelector('.anchor'); if (an) an.remove();
          html += '<li class="' + (h.tagName === 'H3' ? 'l3' : 'l2') + '"><a href="#' + h.id + '"></a></li>';
        });
        toc.innerHTML = html + '</ul>';
        toc.querySelectorAll('a').forEach(function (a, i) {
          var t = heads[i].cloneNode(true);
          var an = t.querySelector('.anchor'); if (an) an.remove();
          a.textContent = t.textContent.trim();
        });
      }
    }
    var links = toc.querySelectorAll('a[href^="#"]');
    if (links.length && 'IntersectionObserver' in window) {
      var map = {};
      links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
      var visible = [];
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var i = visible.indexOf(en.target);
          if (en.isIntersecting && i < 0) visible.push(en.target);
          if (!en.isIntersecting && i >= 0) visible.splice(i, 1);
        });
        if (!visible.length) return;
        visible.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
        var cur = map[visible[0].id];
        links.forEach(function (a) { a.classList.toggle('active', a === cur); });
      }, { rootMargin: '-80px 0px -65% 0px' });
      heads.forEach(function (h) { if (map[h.id]) io.observe(h); });
    }
  }
})();

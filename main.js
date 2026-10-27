/* Jhon De Floretto portfolio — interactions */
(function () {
  var html = document.documentElement;
  var cv = document.getElementById('cv');
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var busy = false;

  /* ---------- start sequence (splash, arrival transition) ---------- */
  function split() {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.setAttribute('aria-label', words.join(' '));
      el.innerHTML = words.map(function (w, i) {
        return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
      }).join('');
    });
  }
  function start() {
    var sp = document.getElementById('splash');
    if (sp && !html.classList.contains('nosplash')) {
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        sp.classList.add('go');
        setTimeout(function () { sp.style.display = 'none'; html.classList.add('ready'); }, 700);
      };
      setTimeout(finish, 3000);
      sp.addEventListener('click', finish);
    } else {
      html.classList.add('ready');
    }
  }
  split();
  if (html.classList.contains('arriving')) {
    history.replaceState(null, '', location.pathname + location.search);
    cv.className = 'on up';
    html.classList.remove('arriving');
    void cv.offsetWidth;
    setTimeout(function () {
      cv.className = 'on out';
      setTimeout(function () { cv.className = ''; }, 800);
      start();
    }, 150);
  } else {
    start();
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) { cv.className = ''; busy = false; } });

  /* ---------- leave page with transition ---------- */
  function leave(url) {
    if (busy) return;
    busy = true;
    cv.className = 'on';
    void cv.offsetWidth;
    cv.classList.add('up');
    setTimeout(function () { location.href = url + '#t'; }, 720);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var h = a.getAttribute('href');
    if (h === '#contact') {
      e.preventDefault();
      document.querySelector('footer').scrollIntoView({ behavior: 'smooth' });
    } else if (/^[\w-]+\.html$/.test(h)) {
      e.preventDefault();
      var here = location.pathname.split('/').pop() || 'index.html';
      if (h !== here) leave(h);
    }
  });

  /* ---------- menu indicator ---------- */
  var nav = document.querySelector('nav');
  if (nav) {
    var ind = document.createElement('i');
    ind.className = 'ind';
    nav.insertBefore(ind, nav.firstChild);
    var links = nav.querySelectorAll('a');
    var active = nav.querySelector('a.on');
    var place = function (el, hov) {
      if (!el) return;
      ind.style.left = el.offsetLeft + 'px';
      ind.style.width = el.offsetWidth + 'px';
      ind.classList.toggle('hov', !!hov && el !== active);
    };
    var home = function () { place(active, false); };
    links.forEach(function (a) {
      a.addEventListener('pointerenter', function () { place(a, true); });
      a.addEventListener('focus', function () { place(a, true); });
    });
    nav.addEventListener('pointerleave', home);
    window.addEventListener('resize', home);
    setTimeout(home, 60);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(home);
    if (active) nav.scrollLeft = active.offsetLeft - 40;
  }

  /* ---------- scroll: progress bar + reveal + counters ---------- */
  var prog = document.getElementById('prog');
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 1300, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var rv = document.querySelectorAll('.rv, [data-count]');
  document.querySelectorAll('.rv').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('rv'); });
    el.style.setProperty('--d', (sibs.indexOf(el) % 6) * 0.09 + 's');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        if (el.classList.contains('rv')) {
          el.classList.add('in');
          setTimeout(function () { el.classList.add('done'); }, 1100);
        }
        if (el.dataset.count) count(el);
      });
    }, { threshold: 0.15 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); if (el.dataset.count) el.textContent = el.dataset.count; });
  }

  /* ---------- 3D tilt + glare, photo wobble ---------- */
  document.querySelectorAll('.tilt').forEach(function (el) {
    var isFrame = el.classList.contains('frame'), max = isFrame ? 16 : 8;
    function reset() { el.classList.remove('live'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' && !isFrame) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('live');
      el.style.setProperty('--ry', ((x - 0.5) * max) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * max) + 'deg');
      el.style.setProperty('--gx', (x * 100) + '%');
      el.style.setProperty('--gy', (y * 100) + '%');
    });
    el.addEventListener('pointerleave', reset);
    el.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch') reset(); });
    if (isFrame) {
      el.addEventListener('pointerdown', function () { el.classList.remove('wob'); void el.offsetWidth; el.classList.add('wob'); });
      el.addEventListener('animationend', function () { el.classList.remove('wob'); });
    }
  });

  /* ---------- magnet + ripple on buttons and menu ---------- */
  document.querySelectorAll('.btn,.cta,.links a,.more a,.view,nav a').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = el.getBoundingClientRect();
      el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    el.addEventListener('pointerdown', function (e) {
      var r = el.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2, d = document.createElement('span');
      d.className = 'rp';
      d.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
      el.appendChild(d);
      setTimeout(function () { d.remove(); }, 650);
    });
  });

  /* ---------- lightbox for project and experience images ---------- */
  var lb = document.createElement('div');
  lb.id = 'lb';
  lb.innerHTML = '<div><img alt=""><p></p></div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p');
  document.querySelectorAll('[data-lightbox]').forEach(function (b) {
    b.addEventListener('click', function () {
      lbImg.src = b.dataset.lightbox; lbImg.alt = b.dataset.cap || ''; lbCap.textContent = b.dataset.cap || '';
      lb.classList.add('show');
    });
  });
  lb.addEventListener('click', function () { lb.classList.remove('show'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('show'); });

  /* ---------- bubble-wand cursor + soap bubble burst + background parallax ---------- */
  var calm = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var bub = null, wand = null, bx = 0, by = 0, tx = 0, ty = 0, rot = 0, sc = 1, scT = 1;
  var WAND = '<svg viewBox="0 0 48 64" aria-hidden="true">' +
    '<defs><linearGradient id="wf" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#ff8ccf" stop-opacity=".5"/><stop offset=".35" stop-color="#8fd3ff" stop-opacity=".4"/>' +
    '<stop offset=".7" stop-color="#b4ffa8" stop-opacity=".4"/><stop offset="1" stop-color="#ffe083" stop-opacity=".5"/></linearGradient></defs>' +
    '<path d="M27 27L42 58" stroke="#2D767F" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
    '<circle cx="42" cy="58" r="3.6" fill="#1E6261"/>' +
    '<circle cx="18" cy="18" r="13" fill="url(#wf)" stroke="#1E6261" stroke-width="3.5"/>' +
    '<ellipse cx="13" cy="12.5" rx="4" ry="2.2" transform="rotate(-35 13 12.5)" fill="#fff" opacity=".85"/></svg>';
  if (fine) {
    bub = document.createElement('div');
    bub.id = 'bub';
    bub.innerHTML = WAND;
    wand = bub.firstChild;
    document.body.appendChild(bub);
    (function loop() {
      var lag = tx - bx;
      bx += lag * 0.3; by += (ty - by) * 0.3;
      rot += (Math.max(-26, Math.min(26, lag * 0.7)) - rot) * 0.2;
      sc += (scT - sc) * 0.25;
      bub.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
      wand.style.transform = 'rotate(' + rot + 'deg) scale(' + sc + ')';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseleave', function () { bub.classList.remove('on'); });
    document.addEventListener('mouseenter', function () { bub.classList.add('on'); });
  }
  function burst(x, y) {
    if (calm) return;
    var n = 14;
    for (var k = 0; k < n; k++) {
      var s = 9 + Math.random() * 20,
          a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5,
          dist = 40 + Math.random() * 75,
          h = Math.floor(Math.random() * 360),
          el = document.createElement('span');
      el.className = 'pop';
      el.style.width = el.style.height = s + 'px';
      el.style.left = (x - s / 2) + 'px';
      el.style.top = (y - s / 2) + 'px';
      el.style.setProperty('--dx', (Math.cos(a) * dist) + 'px');
      el.style.setProperty('--dy', (Math.sin(a) * dist - 10) + 'px');
      el.style.setProperty('--dl', (Math.random() * 0.2) + 's');
      el.style.setProperty('--h', h);
      el.style.setProperty('--h2', (h + 120) % 360);
      el.style.setProperty('--r', Math.floor(Math.random() * 360) + 'deg');
      document.body.appendChild(el);
      (function (e) { setTimeout(function () { e.remove(); }, 1100); })(el);
    }
  }
  window.addEventListener('pointerdown', function (e) {
    burst(e.clientX, e.clientY);
    if (bub) scT = 0.88;
  });
  window.addEventListener('pointerup', function () { scT = bub && bub.classList.contains('big') ? 1.15 : 1; });
  window.addEventListener('pointermove', function (e) {
    html.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5) * 2);
    html.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5) * 2);
    if (bub) {
      if (!bub.classList.contains('on')) { bx = tx = e.clientX; by = ty = e.clientY; }
      tx = e.clientX; ty = e.clientY; bub.classList.add('on');
      var over = !!(e.target.closest && e.target.closest('a,button,.tilt,.pic'));
      bub.classList.toggle('big', over);
      if (e.buttons === 0) scT = over ? 1.15 : 1;
    }
  });
})();

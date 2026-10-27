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
  document.querySelectorAll('.btn,.cta,.links a,.more a,nav a').forEach(function (el) {
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

  /* ---------- cursor ring + background parallax ---------- */
  var ring = null, rx = 0, ry = 0, tx = 0, ty = 0;
  if (fine) {
    ring = document.createElement('div');
    ring.id = 'ring';
    document.body.appendChild(ring);
    (function loop() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
  }
  window.addEventListener('pointermove', function (e) {
    html.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5) * 2);
    html.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5) * 2);
    if (ring) {
      tx = e.clientX; ty = e.clientY; ring.classList.add('on');
      var over = e.target.closest && e.target.closest('a,button,.tilt,.pic');
      ring.classList.toggle('big', !!over);
    }
  });
})();

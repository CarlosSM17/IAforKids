/* Exploradores de la IA — utilidades comunes, progreso y motores de actividades reutilizables */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reducido = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mezclar(arr, semilla) {
    const a = arr.slice();
    let s = semilla || Math.floor(Math.random() * 1e9);
    const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ---------- Chispa, la mascota (diseño original) ---------- */
  function chispa(expr) {
    expr = expr || 'feliz';
    let ojos = '<circle cx="48" cy="52" r="6" fill="#5ce1e6"/><circle cx="72" cy="52" r="6" fill="#5ce1e6"/>';
    let boca = '<path d="M47 63 Q60 72 73 63" stroke="#5ce1e6" stroke-width="4" fill="none" stroke-linecap="round"/>';
    if (expr === 'pensando') {
      ojos = '<circle cx="48" cy="50" r="6" fill="#5ce1e6"/><path d="M66 52 h12" stroke="#5ce1e6" stroke-width="4" stroke-linecap="round"/>';
      boca = '<path d="M50 65 h18" stroke="#5ce1e6" stroke-width="4" stroke-linecap="round"/>';
    } else if (expr === 'sorpresa') {
      ojos = '<circle cx="48" cy="51" r="7" fill="#5ce1e6"/><circle cx="72" cy="51" r="7" fill="#5ce1e6"/>';
      boca = '<circle cx="60" cy="65" r="5" fill="none" stroke="#5ce1e6" stroke-width="4"/>';
    } else if (expr === 'triste') {
      boca = '<path d="M48 68 Q60 60 72 68" stroke="#5ce1e6" stroke-width="4" fill="none" stroke-linecap="round"/>';
    }
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chispa, el robot guía">' +
      '<line x1="60" y1="24" x2="60" y2="10" stroke="#18213d" stroke-width="4"/>' +
      '<path d="M60 0 L63.5 6.5 L70 8 L63.5 10 L60 17 L56.5 10 L50 8 L56.5 6.5 Z" fill="#ffc93c" stroke="#18213d" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect x="7" y="44" width="13" height="24" rx="6" fill="#ff6a3d" stroke="#18213d" stroke-width="4"/>' +
      '<rect x="100" y="44" width="13" height="24" rx="6" fill="#ff6a3d" stroke="#18213d" stroke-width="4"/>' +
      '<rect x="17" y="22" width="86" height="66" rx="24" fill="#eaf2ff" stroke="#18213d" stroke-width="4"/>' +
      '<rect x="29" y="33" width="62" height="44" rx="15" fill="#18213d"/>' + ojos + boca +
      '<circle cx="36" cy="70" r="3" fill="#ff8fa3" opacity=".8"/><circle cx="84" cy="70" r="3" fill="#ff8fa3" opacity=".8"/>' +
      '<rect x="37" y="90" width="46" height="26" rx="11" fill="#ff6a3d" stroke="#18213d" stroke-width="4"/>' +
      '<path d="M62 95 L54 104 H60 L57 112 L66 101 H60 Z" fill="#ffc93c"/>' +
      '</svg>';
  }

  /* ---------- Sonido (opcional, se activa con un clic) ---------- */
  const Sonido = {
    on: true, ctx: null,
    asegurar() {
      if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
      if (this.ctx && this.ctx.state === 'suspended') { this.ctx.resume().catch(() => {}); }
    },
    tono(f, d, tipo, vol) {
      if (!this.on || !this.ctx) return;
      try {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = tipo || 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(vol || 0.08, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + d);
        o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + d);
      } catch (e) { /* sin sonido */ }
    },
    bien() { this.tono(660, .15, 'triangle'); setTimeout(() => this.tono(990, .25, 'triangle'), 120); },
    mal() { this.tono(220, .3, 'sawtooth', .05); },
    tic() { this.tono(880, .05, 'square', .03); },
    fin() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tono(f, .22, 'triangle'), i * 130)); }
  };

  /* ---------- Confeti ---------- */
  function confeti() {
    if (reducido()) return;
    const c = document.createElement('canvas');
    c.className = 'confeti'; c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    const g = c.getContext('2d');
    const colores = ['#ff6a3d', '#ffc93c', '#0f8a7e', '#1f5fd6', '#b5179e', '#26890c'];
    const p = Array.from({ length: 120 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4,
      r: Math.random() * 6 + 4, c: colores[Math.floor(Math.random() * colores.length)], a: Math.random() * 6, va: (Math.random() - .5) * .3
    }));
    let t = 0;
    (function cuadro() {
      g.clearRect(0, 0, c.width, c.height);
      p.forEach((q) => { q.vy += .45; q.x += q.vx; q.y += q.vy; q.a += q.va; g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.fillStyle = q.c; g.fillRect(-q.r / 2, -q.r / 4, q.r, q.r / 2); g.restore(); });
      if (++t < 110) requestAnimationFrame(cuadro); else c.remove();
    })();
  }

  /* ---------- Progreso y estrellas ---------- */
  const ACTIVIDADES = {
    'u1-ia': { u: 1, max: 1 }, 'u1-entrena': { u: 1, max: 1 }, 'u1-manzanas': { u: 1, max: 1 }, 'u1-detective': { u: 1, max: 1 }, 'u1-kahoot': { u: 1, max: 2 },
    'u2-prompt': { u: 2, max: 1 }, 'u2-mejor': { u: 2, max: 1 }, 'u2-ayuda': { u: 2, max: 1 }, 'u2-kahoot': { u: 2, max: 2 },
    'u3-ruido': { u: 3, max: 1 }, 'u3-estudio': { u: 3, max: 1 }, 'u3-detective': { u: 3, max: 1 }, 'u3-respeto': { u: 3, max: 1 }, 'u3-kahoot': { u: 3, max: 2 },
    'u4-algoritmo': { u: 4, max: 1 }, 'u4-logica': { u: 4, max: 1 }, 'u4-laberinto': { u: 4, max: 5 }, 'u4-python': { u: 4, max: 6 }, 'u4-kahoot': { u: 4, max: 2 },
    'u5-criatura': { u: 5, max: 1 }, 'u5-verifica': { u: 5, max: 1 }, 'u5-semaforo': { u: 5, max: 1 }, 'u5-pacto': { u: 5, max: 1 }, 'u5-kahoot': { u: 5, max: 2 },
    'final-kahoot': { u: 6, max: 2 }
  };
  const CLAVE = 'exploradoresIA.v1';
  const Progreso = {
    datos: { est: {}, marcas: {} },
    cargar() {
      try { const t = localStorage.getItem(CLAVE); if (t) { const d = JSON.parse(t); this.datos.est = d.est || {}; this.datos.marcas = d.marcas || {}; } } catch (e) { /* sin almacenamiento */ }
    },
    guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(this.datos)); } catch (e) { /* sin almacenamiento */ } },
    estrellas(id) { return this.datos.est[id] || 0; },
    ganar(id, n) {
      const max = (ACTIVIDADES[id] || { max: 1 }).max;
      n = Math.min(n == null ? 1 : n, max);
      const antes = this.estrellas(id);
      if (n > antes) { this.datos.est[id] = n; this.guardar(); this.pintar(); if (n > antes) aviso('+' + (n - antes) + ' ⭐ ¡Ganaste ' + (n - antes === 1 ? 'una estrella' : (n - antes) + ' estrellas') + '!'); return true; }
      return false;
    },
    marcar(grupo, clave) {
      const g = this.datos.marcas[grupo] = this.datos.marcas[grupo] || [];
      if (!g.includes(clave)) { g.push(clave); this.guardar(); }
      return g.length;
    },
    marcas(grupo) { return this.datos.marcas[grupo] || []; },
    total() { return Object.keys(ACTIVIDADES).reduce((s, k) => s + this.estrellas(k), 0); },
    maximo() { return Object.values(ACTIVIDADES).reduce((s, a) => s + a.max, 0); },
    deUnidad(u) {
      let t = 0, m = 0;
      Object.entries(ACTIVIDADES).forEach(([k, a]) => { if (a.u === u) { t += this.estrellas(k); m += a.max; } });
      return { t, m };
    },
    unidadesCompletas() { let n = 0; for (let u = 1; u <= 5; u++) { const p = this.deUnidad(u); if (p.t >= Math.ceil(p.m * 0.6)) n++; } return n; },
    reiniciar() { this.datos = { est: {}, marcas: {} }; this.guardar(); this.pintar(); },
    pintar() {
      const t = $('#total-estrellas'); if (t) t.textContent = this.total();
      const m = $('#max-estrellas'); if (m) m.textContent = this.maximo();
      $$('[data-estado]').forEach((el) => {
        const id = el.dataset.estado, a = ACTIVIDADES[id]; if (!a) return;
        const e = this.estrellas(id);
        el.textContent = (e > 0 ? '★ ' : '☆ ') + e + ' / ' + a.max;
        el.classList.toggle('ganada', e > 0);
      });
      $$('[data-prog-unidad]').forEach((el) => {
        const u = +el.dataset.progUnidad, p = this.deUnidad(u);
        const i = $('i', el); if (i) i.style.width = (p.m ? (100 * p.t / p.m) : 0) + '%';
        const tx = el.parentElement && $('.prog-txt', el.parentElement); if (tx) tx.textContent = p.t + ' de ' + p.m + ' estrellas';
      });
      document.dispatchEvent(new CustomEvent('progreso'));
    }
  };

  /* Aviso flotante breve */
  let avisoTimer = null;
  function aviso(txt) {
    let a = $('#aviso-flotante');
    if (!a) {
      a = document.createElement('div'); a.id = 'aviso-flotante'; a.setAttribute('role', 'status');
      a.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#18213d;color:#fff;padding:12px 20px;border-radius:999px;font-weight:800;z-index:120;box-shadow:0 8px 24px rgba(0,0,0,.25);transition:opacity .3s;';
      document.body.appendChild(a);
    }
    a.textContent = txt; a.style.opacity = '1';
    clearTimeout(avisoTimer); avisoTimer = setTimeout(() => { a.style.opacity = '0'; }, 2600);
  }

  /* ---------- Motor: Clasificador de tarjetas ---------- */
  function Clasificador(root, cfg) {
    const items = cfg.mezclar === false ? cfg.items.slice() : mezclar(cfg.items);
    let i = 0, aciertos = 0; const res = [];
    function puntos() {
      return '<div class="progreso-puntos" aria-hidden="true">' + items.map((_, k) => '<i class="' + (k < res.length ? (res[k] ? 'ok' : 'mal') : (k === i ? 'act' : '')) + '"></i>').join('') + '</div>';
    }
    function pintar() {
      if (i >= items.length) return final();
      const it = items[i];
      root.innerHTML = '<div class="clasif">' + puntos() +
        '<div class="clasif-tarjeta"><div class="em" aria-hidden="true">' + it.em + '</div><b>' + esc(it.txt) + '</b>' +
        (it.sub ? '<span class="aviso-sim">' + esc(it.sub) + '</span>' : '') + '</div>' +
        '<div class="clasif-botes">' + cfg.botes.map((b) => '<button class="bote ' + (b.clase || '') + '" data-b="' + b.id + '"><span class="em" aria-hidden="true">' + b.em + '</span>' + esc(b.txt) + '</button>').join('') + '</div>' +
        '<div class="zona-retro"></div></div>';
      $$('.bote', root).forEach((btn) => btn.addEventListener('click', () => elegir(btn.dataset.b)));
    }
    function elegir(b) {
      const it = items[i]; const ok = b === it.bote;
      res.push(ok); if (ok) aciertos++;
      ok ? Sonido.bien() : Sonido.mal();
      $$('.bote', root).forEach((btn) => { btn.disabled = true; if (btn.dataset.b === it.bote) btn.style.borderColor = 'var(--ok)'; if (btn.dataset.b === b && !ok) btn.style.borderColor = 'var(--mal)'; });
      const correcto = cfg.botes.find((x) => x.id === it.bote);
      $('.zona-retro', root).innerHTML = '<div class="retro ' + (ok ? 'ok' : 'mal') + '"><span class="ico">' + (ok ? '✔' : '✖') + '</span><div><b>' +
        (ok ? '¡Muy bien!' : 'Respuesta: ' + esc(correcto.txt)) + '</b><p>' + esc(it.por) + '</p></div></div>' +
        '<div class="fila" style="margin-top:10px;justify-content:flex-end"><button class="btn sig">' + (i + 1 < items.length ? 'Siguiente' : 'Ver resultado') + ' →</button></div>';
      $('.sig', root).addEventListener('click', () => { i++; pintar(); });
      $('.sig', root).focus({ preventScroll: true });
    }
    function final() {
      const n = items.length, meta = Math.ceil(n * 0.6), gano = aciertos >= meta;
      if (gano) { Progreso.ganar(cfg.id, 1); confeti(); Sonido.fin(); }
      root.innerHTML = '<div class="resumen-final">' + puntos() + '<div class="grande">' + aciertos + ' / ' + n + '</div><p>' +
        (gano ? (cfg.mensajeFinal || '¡Excelente trabajo, explorador!') : 'Necesitas ' + meta + ' aciertos para ganar la estrella. ¡Inténtalo otra vez!') +
        '</p><button class="btn sec otra">Jugar otra vez</button></div>';
      $('.otra', root).addEventListener('click', () => Clasificador(root, cfg));
    }
    pintar();
  }

  /* ---------- Motor: Mini quiz con situaciones ---------- */
  function MiniQuiz(root, cfg) {
    let i = 0, aciertos = 0; const res = [];
    const ps = cfg.preguntas;
    function puntos() {
      return '<div class="progreso-puntos" aria-hidden="true">' + ps.map((_, k) => '<i class="' + (k < res.length ? (res[k] ? 'ok' : 'mal') : (k === i ? 'act' : '')) + '"></i>').join('') + '</div>';
    }
    function pintar() {
      if (i >= ps.length) return final();
      const p = ps[i];
      root.innerHTML = '<div class="mq">' + puntos() +
        '<div class="mq-escena"><span class="em" aria-hidden="true">' + p.em + '</span><div><p><b>' + esc(p.escena) + '</b></p>' + (p.pregunta ? '<p style="margin-top:6px">' + esc(p.pregunta) + '</p>' : '') + '</div></div>' +
        '<div class="mq-ops">' + p.ops.map((o, k) => '<button class="mq-op" data-k="' + k + '">' + esc(o) + '</button>').join('') + '</div><div class="zona-retro"></div></div>';
      $$('.mq-op', root).forEach((b) => b.addEventListener('click', () => elegir(+b.dataset.k)));
    }
    function elegir(k) {
      const p = ps[i], ok = k === p.c;
      res.push(ok); if (ok) aciertos++;
      ok ? Sonido.bien() : Sonido.mal();
      $$('.mq-op', root).forEach((b) => { b.disabled = true; const kk = +b.dataset.k; if (kk === p.c) b.classList.add('ok'); else if (kk === k) b.classList.add('mal'); });
      $('.zona-retro', root).innerHTML = '<div class="retro ' + (ok ? 'ok' : 'mal') + '"><span class="ico">' + (ok ? '✔' : '✖') + '</span><div><b>' + (ok ? '¡Correcto!' : 'Casi…') + '</b><p>' + esc(p.por) + '</p></div></div>' +
        '<div class="fila" style="margin-top:10px;justify-content:flex-end"><button class="btn sig">' + (i + 1 < ps.length ? 'Siguiente' : 'Ver resultado') + ' →</button></div>';
      $('.sig', root).addEventListener('click', () => { i++; pintar(); });
    }
    function final() {
      const n = ps.length, meta = Math.ceil(n * 0.6), gano = aciertos >= meta;
      if (gano) { Progreso.ganar(cfg.id, 1); confeti(); Sonido.fin(); }
      root.innerHTML = '<div class="resumen-final">' + puntos() + '<div class="grande">' + aciertos + ' / ' + n + '</div><p>' +
        (gano ? (cfg.mensajeFinal || '¡Gran trabajo de detective!') : 'Necesitas ' + meta + ' aciertos para ganar la estrella. ¡Vuelve a intentarlo!') +
        '</p><button class="btn sec otra">Jugar otra vez</button></div>';
      $('.otra', root).addEventListener('click', () => MiniQuiz(root, cfg));
    }
    pintar();
  }

  /* ---------- Pizarra para dibujar (táctil y ratón) ---------- */
  function Pizarra(canvas, opts) {
    opts = opts || {};
    const g = canvas.getContext('2d', { willReadFrequently: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.width = (opts.ancho || 260) * dpr, H = canvas.height = (opts.alto || 260) * dpr;
    g.lineCap = 'round'; g.lineJoin = 'round';
    let dibujando = false, ultimo = null, tinta = false;
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); dibujando = true; ultimo = pos(e); punto(ultimo); });
    canvas.addEventListener('pointermove', (e) => { if (!dibujando) return; const p = pos(e); g.strokeStyle = opts.color || '#18213d'; g.lineWidth = (opts.grosor || 14) * dpr; g.beginPath(); g.moveTo(ultimo.x, ultimo.y); g.lineTo(p.x, p.y); g.stroke(); ultimo = p; tinta = true; });
    const fin = () => { if (dibujando) { dibujando = false; opts.alSoltar && opts.alSoltar(); } };
    canvas.addEventListener('pointerup', fin); canvas.addEventListener('pointercancel', fin); canvas.addEventListener('pointerleave', fin);
    function punto(p) { g.fillStyle = opts.color || '#18213d'; g.beginPath(); g.arc(p.x, p.y, (opts.grosor || 14) * dpr / 2, 0, Math.PI * 2); g.fill(); tinta = true; }
    return {
      canvas, ctx: g, dpr,
      limpiar() { g.clearRect(0, 0, W, H); tinta = false; },
      vacio() { return !tinta; },
      setColor(c) { opts.color = c; },
      marcarTinta() { tinta = true; },
      vector(n) { return vectorDe(canvas, (opts.grosor || 14) * dpr, n); }
    };
  }

  /* Recorta el dibujo de un lienzo, lo centra y lo reduce a n×n valores entre 0 y 1 */
  function vectorDe(canvas, margen, n) {
    n = n || 16;
    const W = canvas.width, H = canvas.height;
    const d = canvas.getContext('2d').getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { if (d[(y * W + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    if (x1 < 0) return null;
    const lado = Math.max(x1 - x0, y1 - y0) + 2 * margen;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const off = document.createElement('canvas'); off.width = off.height = n;
    const og = off.getContext('2d', { willReadFrequently: true });
    og.fillStyle = '#fff'; og.fillRect(0, 0, n, n);
    og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high';
    og.drawImage(canvas, cx - lado / 2, cy - lado / 2, lado, lado, 0, 0, n, n);
    const od = og.getImageData(0, 0, n, n).data, v = new Float32Array(n * n);
    for (let k = 0; k < n * n; k++) v[k] = 1 - (od[k * 4] + od[k * 4 + 1] + od[k * 4 + 2]) / 765;
    return v;
  }

  /* Cargar un script externo una sola vez */
  const cargados = {};
  function cargarScript(src) {
    if (cargados[src]) return cargados[src];
    cargados[src] = new Promise((ok, mal) => {
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = () => ok(); s.onerror = () => { delete cargados[src]; s.remove(); mal(new Error('No se pudo cargar ' + src)); };
      document.head.appendChild(s);
    });
    return cargados[src];
  }

  /* Copiar al portapapeles con respaldo manual */
  function copiar(texto, respaldo) {
    const manual = () => { if (respaldo) { respaldo.hidden = false; respaldo.value = texto; respaldo.focus(); respaldo.select(); } };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(texto).then(() => { aviso('Copiado. Ahora pégalo en la plantilla.'); return true; }).catch(() => { manual(); return false; });
      }
    } catch (e) { /* sigue al respaldo */ }
    manual(); return Promise.resolve(false);
  }

  window.IA = { $, $$, esc, mezclar, chispa, Sonido, confeti, Progreso, ACTIVIDADES, aviso, Clasificador, MiniQuiz, Pizarra, vectorDe, cargarScript, copiar, reducido };
})();

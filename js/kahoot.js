/* Motor de quiz estilo Kahoot: tiempo, puntos por rapidez, rachas, modo individual y modo equipos */
(function () {
  'use strict';
  const { $, $$, esc, Sonido, confeti, Progreso, copiar, chispa } = window.IA;

  const FORMAS = [
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L30 28 H2 Z" fill="#fff"/></svg>',
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 L30 16 L16 30 L2 16 Z" fill="#fff"/></svg>',
    '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#fff"/></svg>',
    '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="24" height="24" rx="2" fill="#fff"/></svg>'
  ];
  const NOMBRE_FORMA = ['triángulo rojo', 'rombo azul', 'círculo amarillo', 'cuadro verde'];
  const NOMBRES_EQ = ['Equipo Rayo', 'Equipo Cometa', 'Equipo Volcán', 'Equipo Ajolote'];
  const CIRC = 2 * Math.PI * 36;

  function Kahoot(root, quiz) {
    const actId = quiz.id === 'final' ? 'final-kahoot' : quiz.id + '-kahoot';
    const qs = quiz.preguntas, n = qs.length;
    root.style.setProperty('--kc', quiz.color);
    let modo = 'solo', nEq = 2;
    const nombres = NOMBRES_EQ.slice();
    let idx = 0, puntos = 0, racha = 0, aciertos = 0, reloj = null, inicio = 0, activa = false, ultimoSeg = 99;
    let puntosEq = [], respEq = [], historial = [];

    function lobby() {
      parar();
      root.innerHTML = '<div class="kh kh-lobby">' +
        '<div class="kh-marca">' + FORMAS[0].replace('<svg', '<svg width="14" height="14"') + ' Quiz estilo Kahoot</div>' +
        '<h3>' + esc(quiz.titulo) + '</h3>' +
        '<p>' + n + ' preguntas · mientras más rápido respondas bien, más puntos ganas</p>' +
        '<div class="kh-modos" role="radiogroup" aria-label="Modo de juego">' +
        '<button class="kh-modo' + (modo === 'solo' ? ' activo' : '') + '" data-modo="solo" role="radio" aria-checked="' + (modo === 'solo') + '"><span>Jugar solo</span><small>Un jugador en este dispositivo</small></button>' +
        '<button class="kh-modo' + (modo === 'equipos' ? ' activo' : '') + '" data-modo="equipos" role="radio" aria-checked="' + (modo === 'equipos') + '"><span>Equipos en el salón</span><small>Se proyecta; el maestro marca qué eligió cada equipo</small></button>' +
        '</div>' +
        '<div class="kh-equipos"' + (modo === 'equipos' ? '' : ' hidden') + '>' +
        '<div class="fila" style="justify-content:center">Equipos: ' + [2, 3, 4].map((k) => '<button class="kh-btn sec kh-neq" data-n="' + k + '" aria-pressed="' + (k === nEq) + '" style="' + (k === nEq ? 'background:#fff;color:#241a4a' : '') + '">' + k + '</button>').join('') + '</div>' +
        '<div class="fila" style="justify-content:center">' + nombres.slice(0, nEq).map((nm, k) => '<input type="text" id="' + quiz.id + '-eq-' + k + '" aria-label="Nombre del equipo ' + (k + 1) + '" value="' + esc(nm) + '" maxlength="18" data-k="' + k + '">').join('') + '</div>' +
        '</div>' +
        '<div class="fila" style="justify-content:center">' +
        '<button class="kh-btn kh-empezar">¡Comenzar!</button>' +
        '<button class="kh-btn sec kh-pantalla">Pantalla completa</button>' +
        '<button class="kh-btn sec kh-sonido" aria-pressed="' + Sonido.on + '">Sonido: ' + (Sonido.on ? 'sí' : 'no') + '</button>' +
        '</div>' +
        '<details class="kh-ayuda"><summary style="cursor:pointer;font-weight:800">Para el maestro: jugar este quiz en Kahoot.com</summary>' +
        '<p style="margin-top:8px">En Kahoot.com crea un kahoot, elige <b>Agregar pregunta → Importar hoja de cálculo</b> y sube el archivo .xlsx de esta unidad que acompaña al curso. ' +
        'Si prefieres la plantilla oficial de Kahoot, copia las preguntas con este botón y pégalas en la celda <b>B9</b>.</p>' +
        '<div class="fila" style="justify-content:center;margin-top:8px"><button class="kh-btn sec kh-copiar">Copiar preguntas para la plantilla</button></div>' +
        '<textarea class="kh-copia" hidden readonly aria-label="Preguntas en formato de tabla"></textarea></details>' +
        '</div>';
      $$('.kh-modo', root).forEach((b) => b.addEventListener('click', () => { modo = b.dataset.modo; lobby(); }));
      $$('.kh-neq', root).forEach((b) => b.addEventListener('click', () => { leerNombres(); nEq = +b.dataset.n; lobby(); }));
      $('.kh-empezar', root).addEventListener('click', () => { leerNombres(); Sonido.asegurar(); empezar(); });
      $('.kh-pantalla', root).addEventListener('click', pantallaCompleta);
      $('.kh-sonido', root).addEventListener('click', () => { Sonido.on = !Sonido.on; lobby(); });
      $('.kh-copiar', root).addEventListener('click', () => {
        const tsv = qs.map((p) => [p.q].concat(p.a).concat([p.t, p.c + 1]).join('\t')).join('\n');
        copiar(tsv, $('.kh-copia', root));
      });
    }
    function leerNombres() { $$('.kh-equipos input', root).forEach((i) => { nombres[+i.dataset.k] = i.value.trim() || NOMBRES_EQ[+i.dataset.k]; }); }

    function pantallaCompleta() {
      const d = document;
      try {
        if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
        const f = root.requestFullscreen || root.webkitRequestFullscreen;
        if (f) { const r = f.call(root); if (r && r.catch) r.catch(() => IA.aviso('Este navegador no permite pantalla completa aquí.')); }
        else IA.aviso('Este navegador no permite pantalla completa aquí.');
      } catch (e) { IA.aviso('Este navegador no permite pantalla completa aquí.'); }
    }

    function empezar() {
      idx = 0; puntos = 0; racha = 0; aciertos = 0; historial = [];
      puntosEq = new Array(nEq).fill(0);
      pregunta();
    }

    function pregunta() {
      const p = qs[idx];
      respEq = new Array(nEq).fill(-1);
      const ops = p.a.map((a, k) => (modo === 'solo'
        ? '<button class="kh-op o' + k + '" data-k="' + k + '" aria-label="' + NOMBRE_FORMA[k] + ': ' + esc(a) + '">'
        : '<div class="kh-op o' + k + '" data-k="' + k + '" style="cursor:default">') +
        FORMAS[k] + '<span>' + esc(a) + '</span>' + (modo === 'solo' ? '</button>' : '</div>')).join('');
      const panel = modo === 'equipos' ? '<div class="kh-equipos-panel"><h4>¿Qué eligió cada equipo?</h4>' +
        nombres.slice(0, nEq).map((nm, e) => '<div class="kh-eq-fila"><b title="' + esc(nm) + '">' + esc(nm) + '</b>' +
          [0, 1, 2, 3].map((k) => '<button class="kh-eq-btn o' + k + '" data-e="' + e + '" data-k="' + k + '" aria-label="' + esc(nm) + ' eligió ' + NOMBRE_FORMA[k] + '">' + FORMAS[k] + '</button>').join('') + '</div>').join('') +
        '<div class="kh-pie"><button class="kh-btn kh-revelar">Revelar respuesta</button></div></div>' : '';
      root.innerHTML = '<div class="kh">' +
        '<div class="kh-top"><span class="pill">Pregunta ' + (idx + 1) + ' de ' + n + '</span><span class="pill">' + (modo === 'solo' ? '<span class="pts">' + puntos.toLocaleString('es-MX') + '</span> pts' + (racha >= 2 ? ' <span class="racha">· racha ' + racha + '</span>' : '') : 'Modo equipos') + '</span></div>' +
        '<div class="kh-pregunta">' + esc(p.q) + '</div>' +
        '<div class="kh-medio"><div class="kh-reloj" aria-label="Tiempo restante"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="36" stroke="rgba(255,255,255,.2)" stroke-width="8" fill="none"/>' +
        '<circle class="arco" cx="42" cy="42" r="36" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="' + CIRC.toFixed(1) + '" stroke-dashoffset="0"/></svg><span class="seg">' + p.t + '</span></div></div>' +
        '<div class="kh-ops">' + ops + '</div>' + panel + '<div class="kh-zona"></div></div>';
      if (modo === 'solo') $$('.kh-op', root).forEach((b) => b.addEventListener('click', () => responder(+b.dataset.k)));
      else {
        $$('.kh-eq-btn', root).forEach((b) => b.addEventListener('click', () => {
          const e = +b.dataset.e; respEq[e] = +b.dataset.k;
          $$('.kh-eq-btn[data-e="' + e + '"]', root).forEach((x) => x.classList.toggle('sel', x === b));
        }));
        $('.kh-revelar', root).addEventListener('click', revelarEquipos);
      }
      inicio = performance.now(); activa = true; ultimoSeg = 99;
      parar(); reloj = setInterval(tic, 100);
    }

    function tic() {
      if (!document.body.contains(root)) { parar(); return; }
      const p = qs[idx], trans = (performance.now() - inicio) / 1000, resta = Math.max(0, p.t - trans);
      const arco = $('.arco', root), seg = $('.seg', root);
      if (arco) { arco.setAttribute('stroke-dashoffset', (CIRC * (1 - resta / p.t)).toFixed(1)); arco.setAttribute('stroke', resta <= 5 ? '#ffc93c' : '#fff'); }
      const s = Math.ceil(resta);
      if (seg) seg.textContent = s;
      if (s !== ultimoSeg) { if (s <= 5 && s > 0) Sonido.tic(); ultimoSeg = s; }
      if (resta <= 0) { parar(); if (modo === 'solo') responder(-1); else revelarEquipos(); }
    }
    function parar() { if (reloj) { clearInterval(reloj); reloj = null; } }

    function responder(k) {
      if (!activa) return; activa = false; parar();
      const p = qs[idx], trans = Math.min((performance.now() - inicio) / 1000, p.t);
      const ok = k === p.c;
      let gan = 0, bono = 0;
      if (ok) { racha++; aciertos++; gan = Math.round(1000 * (1 - (trans / p.t) / 2)); bono = racha >= 2 ? Math.min((racha - 1) * 100, 500) : 0; puntos += gan + bono; Sonido.bien(); }
      else { racha = 0; Sonido.mal(); }
      historial.push({ p, k, ok });
      $$('.kh-op', root).forEach((b) => {
        const kk = +b.dataset.k; b.disabled = true;
        if (kk === p.c) { b.classList.add('correcta'); b.insertAdjacentHTML('beforeend', '<span class="marca" aria-hidden="true">✔</span>'); }
        else b.classList.add('atenuada');
        if (kk === k) b.classList.add('elegida');
      });
      const ptsEl = $('.pts', root); if (ptsEl) ptsEl.textContent = puntos.toLocaleString('es-MX');
      const tipo = k === -1 ? 'tiempo' : ok ? 'ok' : 'mal';
      const titulo = k === -1 ? '¡Se acabó el tiempo!' : ok ? '¡Correcto!' : '¡Uy! No era esa';
      $('.kh-zona', root).innerHTML = '<div class="kh-res ' + tipo + '" role="status"><div class="grande">' + titulo + (ok ? ' +' + (gan + bono) : '') + '</div>' +
        (ok && bono ? '<p class="racha">Racha de ' + racha + ' respuestas: +' + bono + ' de bono</p>' : '') +
        (!ok ? '<p>La respuesta correcta era: <b>' + esc(p.a[p.c]) + '</b></p>' : '') +
        '<p><b>¿Por qué?</b> ' + esc(p.por) + '</p></div>' +
        '<div class="kh-pie"><button class="kh-btn kh-sig">' + (idx + 1 < n ? 'Siguiente' : 'Ver mis resultados') + ' →</button></div>';
      const sig = $('.kh-sig', root); sig.addEventListener('click', siguiente); sig.focus({ preventScroll: true });
    }

    function revelarEquipos() {
      if (!activa) return; activa = false; parar();
      const p = qs[idx];
      const acertaron = [];
      respEq.forEach((r, e) => { if (r === p.c) { puntosEq[e] += 1000; acertaron.push(nombres[e]); } });
      acertaron.length ? Sonido.bien() : Sonido.mal();
      $$('.kh-op', root).forEach((b) => { const kk = +b.dataset.k; if (kk === p.c) { b.classList.add('correcta'); b.insertAdjacentHTML('beforeend', '<span class="marca" aria-hidden="true">✔</span>'); } else b.classList.add('atenuada'); });
      $$('.kh-eq-btn', root).forEach((b) => { b.disabled = true; });
      const rev = $('.kh-revelar', root); if (rev) rev.remove();
      $('.kh-zona', root).innerHTML = '<div class="kh-res ' + (acertaron.length ? 'ok' : 'mal') + '" role="status"><div class="grande">' +
        (acertaron.length ? 'Acertaron: ' + acertaron.map(esc).join(', ') : 'Ningún equipo acertó') + '</div>' +
        '<p>Respuesta correcta: <b>' + esc(p.a[p.c]) + '</b></p><p><b>¿Por qué?</b> ' + esc(p.por) + '</p></div>' +
        '<div class="kh-pie"><button class="kh-btn kh-marc">Ver marcador →</button></div>';
      $('.kh-marc', root).addEventListener('click', marcador);
    }

    function ranking() { return nombres.slice(0, nEq).map((nm, e) => ({ nm, p: puntosEq[e] })).sort((a, b) => b.p - a.p); }

    function marcador() {
      const r = ranking(), max = Math.max(1000, r[0].p);
      root.innerHTML = '<div class="kh"><div class="kh-top"><span class="pill">Marcador</span><span class="pill">Pregunta ' + (idx + 1) + ' de ' + n + '</span></div>' +
        '<div class="kh-tabla">' + r.map((x, i) => '<div class="fila-pt"><span>' + (i + 1) + '°</span><span>' + esc(x.nm) +
          '<span style="display:block;height:8px;border-radius:9px;background:rgba(255,255,255,.15);margin-top:6px"><i style="display:block;height:100%;border-radius:9px;background:#ffc93c;width:' + (100 * x.p / max) + '%"></i></span></span><span>' + x.p.toLocaleString('es-MX') + '</span></div>').join('') + '</div>' +
        '<div class="kh-pie"><button class="kh-btn kh-sig">' + (idx + 1 < n ? 'Siguiente pregunta' : 'Ver podio') + ' →</button></div></div>';
      $('.kh-sig', root).addEventListener('click', siguiente);
    }

    function siguiente() { idx++; if (idx < n) pregunta(); else final(); }

    function final() {
      parar(); Sonido.fin(); confeti();
      if (modo === 'solo') {
        const pct = aciertos / n;
        Progreso.ganar(actId, pct >= 0.75 ? 2 : 1);
        const msg = pct === 1 ? '¡Perfecto! Eres un experto en IA.' : pct >= 0.75 ? '¡Excelente! Ganaste las dos estrellas.' : pct >= 0.5 ? '¡Bien hecho! Repasa las que fallaste y vuelve a jugar.' : 'Sigue explorando: repasa la unidad y juega otra vez.';
        root.innerHTML = '<div class="kh kh-final">' +
          '<div style="width:110px">' + chispa(pct >= 0.5 ? 'feliz' : 'pensando') + '</div>' +
          '<div class="kh-marca">Resultado final</div><div class="grande">' + puntos.toLocaleString('es-MX') + ' pts</div>' +
          '<p style="font-weight:800;font-size:1.2rem">' + aciertos + ' de ' + n + ' respuestas correctas</p><p>' + msg + '</p>' +
          '<div class="fila" style="justify-content:center"><button class="kh-btn kh-otra">Jugar otra vez</button><button class="kh-btn sec kh-rep">Repasar respuestas</button><button class="kh-btn sec kh-menu">Cambiar modo</button></div>' +
          '<div class="kh-repaso" hidden>' + historial.map((h, i) => '<div><b>' + (h.ok ? '✔ ' : '✖ ') + (i + 1) + '. ' + esc(h.p.q) + '</b>Respuesta: ' + esc(h.p.a[h.p.c]) + (h.ok ? '' : (h.k >= 0 ? ' · Elegiste: ' + esc(h.p.a[h.k]) : ' · Sin respuesta')) + '</div>').join('') + '</div></div>';
        $('.kh-rep', root).addEventListener('click', () => { const r = $('.kh-repaso', root); r.hidden = !r.hidden; });
      } else {
        Progreso.ganar(actId, 1);
        const r = ranking();
        const lugar = (x, cls, pos) => x ? '<div class="lugar ' + cls + '"><b>' + esc(x.nm) + '</b><span>' + x.p.toLocaleString('es-MX') + ' pts</span><div class="bloque-p">' + pos + '</div></div>' : '';
        root.innerHTML = '<div class="kh kh-final"><div class="kh-marca">Podio</div><h3 style="font-size:2rem">¡Felicidades, ' + esc(r[0].nm) + '!</h3>' +
          '<div class="kh-podio">' + lugar(r[1], 'l2', '2') + lugar(r[0], 'l1', '1') + lugar(r[2], 'l3', '3') + '</div>' +
          (r[3] ? '<p>4° lugar: ' + esc(r[3].nm) + ' · ' + r[3].p.toLocaleString('es-MX') + ' pts</p>' : '') +
          '<div class="fila" style="justify-content:center"><button class="kh-btn kh-otra">Jugar otra vez</button><button class="kh-btn sec kh-menu">Cambiar modo</button></div></div>';
      }
      $('.kh-otra', root).addEventListener('click', empezar);
      $('.kh-menu', root).addEventListener('click', lobby);
    }

    /* Teclas 1–4 en modo individual */
    document.addEventListener('keydown', (e) => {
      if (!activa || modo !== 'solo' || !root.offsetParent) return;
      if (/^[1-4]$/.test(e.key) && !(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) { responder(+e.key - 1); }
    });

    lobby();
  }

  window.IA.iniciarKahoots = function () {
    $$('[data-kahoot]').forEach((el) => {
      const q = window.KAHOOTS && window.KAHOOTS[el.dataset.kahoot];
      if (q) Kahoot(el, q);
    });
  };
})();

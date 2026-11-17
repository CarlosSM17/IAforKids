/* Unidad 4 · Pensamiento computacional y programación */
(function () {
  'use strict';
  const { $, $$, esc, mezclar, Clasificador, Progreso, Sonido, confeti, aviso, cargarScript, reducido } = window.IA;

  /* ---------- 4.1 Ordena el algoritmo ---------- */
  function algoritmo() {
    const root = $('#act-algoritmo'); if (!root) return;
    const RONDAS = [
      { titulo: 'Plantar una semilla', pasos: [['🕳️', 'Hacer un hoyo en la tierra'], ['🌰', 'Poner la semilla en el hoyo'], ['🤲', 'Cubrir la semilla con tierra'], ['💧', 'Regar con agua'], ['☀️', 'Dejar la maceta donde le dé el sol']] },
      { titulo: 'Lavarse las manos', pasos: [['🚰', 'Abrir la llave del agua'], ['💦', 'Mojarse las manos'], ['🧼', 'Ponerse jabón'], ['👐', 'Tallar las manos 20 segundos'], ['🌊', 'Enjuagar el jabón'], ['🧻', 'Secarse con una toalla']] }
    ];
    let r = 0, elegidos = [], orden = [];
    function nuevaRonda() { elegidos = []; orden = mezclar(RONDAS[r].pasos.map((_, i) => i), 11 + r * 7); pintar(); }
    function pintar(revisado) {
      const R = RONDAS[r];
      root.innerHTML = '<p class="act-instr">Ronda ' + (r + 1) + ' de ' + RONDAS.length + ': <b>' + R.titulo + '</b>. Toca los pasos en el orden correcto para armar el algoritmo.</p>' +
        '<div class="ordenar"><div class="col-pasos"><h4>Pasos revueltos</h4>' +
        orden.map((i) => '<button class="paso-btn" data-i="' + i + '"' + (elegidos.includes(i) ? ' disabled' : '') + '><span class="em" aria-hidden="true">' + R.pasos[i][0] + '</span>' + esc(R.pasos[i][1]) + '</button>').join('') +
        '</div><div class="col-pasos"><h4>Tu algoritmo</h4><ol class="algo-lista">' +
        elegidos.map((i, k) => '<li class="' + (revisado ? (i === k ? 'ok' : 'mal') : '') + '">' + esc(R.pasos[i][1]) + '</li>').join('') + '</ol>' +
        '<div class="fila"><button class="btn chico revisar"' + (elegidos.length < R.pasos.length ? ' disabled' : '') + '>Revisar</button><button class="btn sec chico deshacer"' + (elegidos.length ? '' : ' disabled') + '>Quitar el último</button></div>' +
        '<div class="zona-retro"></div></div></div>';
      $$('.paso-btn', root).forEach((b) => b.addEventListener('click', () => { elegidos.push(+b.dataset.i); pintar(); }));
      $('.deshacer', root).addEventListener('click', () => { elegidos.pop(); pintar(); });
      $('.revisar', root).addEventListener('click', revisar);
    }
    function revisar() {
      const ok = elegidos.every((i, k) => i === k);
      pintar(true);
      const z = $('.zona-retro', root);
      if (ok) {
        Sonido.bien();
        const ultima = r + 1 >= RONDAS.length;
        z.innerHTML = '<div class="retro ok"><span class="ico">✔</span><div><b>¡Algoritmo correcto!</b><p>' + (ultima ? 'Las computadoras siguen los pasos exactamente en el orden que les damos. Por eso el orden importa.' : '¿Te imaginas ponerte jabón después de secarte? Vamos con otro.') + '</p></div></div>' +
          '<div class="fila" style="margin-top:8px">' + (ultima ? '<button class="btn sec chico otra">Jugar otra vez</button>' : '<button class="btn chico sig">Siguiente ronda →</button>') + '</div>';
        if (ultima) { Progreso.ganar('u4-algoritmo', 1); confeti(); $('.otra', root).addEventListener('click', () => { r = 0; nuevaRonda(); }); }
        else $('.sig', root).addEventListener('click', () => { r++; nuevaRonda(); });
      } else {
        Sonido.mal();
        z.innerHTML = '<div class="retro mal"><span class="ico">✖</span><div><b>Algunos pasos están fuera de lugar</b><p>Los marcados en rojo no van ahí. Piensa: ¿qué tiene que pasar primero?</p></div></div>' +
          '<div class="fila" style="margin-top:8px"><button class="btn sec chico reint">Intentar de nuevo</button></div>';
        $('.reint', root).addEventListener('click', () => { elegidos = []; pintar(); });
      }
    }
    nuevaRonda();
  }

  /* ---------- 4.1 Condiciones lógicas ---------- */
  function logica() {
    const root = $('#act-logica'); if (!root) return;
    Clasificador(root, {
      id: 'u4-logica', mezclar: false,
      botes: [{ id: 'si', em: '✅', txt: 'VERDADERO: sí cumple', clase: 'verde' }, { id: 'no', em: '❌', txt: 'FALSO: no cumple', clase: 'rojo' }],
      items: [
        { em: '🍌', txt: 'Plátano', sub: 'Condición: SI es una fruta', bote: 'si', por: 'El plátano es una fruta: la condición es verdadera.' },
        { em: '🥕', txt: 'Zanahoria', sub: 'Condición: SI es una fruta', bote: 'no', por: 'La zanahoria es una verdura: la condición es falsa.' },
        { em: '🐟', txt: 'Pez', sub: 'Condición: SI es un animal Y vive en el agua', bote: 'si', por: 'Cumple las dos partes. Con «Y» se necesitan las dos.' },
        { em: '🐈', txt: 'Gato', sub: 'Condición: SI es un animal Y vive en el agua', bote: 'no', por: 'Es animal, pero no vive en el agua. Con «Y», si falla una parte, todo es falso.' },
        { em: '🚤', txt: 'Lancha', sub: 'Condición: SI es un animal Y vive en el agua', bote: 'no', por: 'Está en el agua, pero no es un animal.' },
        { em: '🍋', txt: 'Limón', sub: 'Condición: SI es amarillo O es redondo', bote: 'si', por: 'Es amarillo. Con «O» basta con que se cumpla una parte.' },
        { em: '⚽', txt: 'Balón', sub: 'Condición: SI es amarillo O es redondo', bote: 'si', por: 'No es amarillo, pero sí es redondo. Con «O» con una basta.' },
        { em: '📘', txt: 'Libro azul', sub: 'Condición: SI es amarillo O es redondo', bote: 'no', por: 'No es amarillo ni redondo: ninguna parte se cumple.' }
      ],
      mensajeFinal: '¡Piensas como computadora! Ya entiendes SI, Y y O.'
    });
  }

  /* ---------- 4.2 Laberinto de bloques ---------- */
  const NIVELES = [
    { nombre: 'Línea recta', mapa: ['......', '......', 'S...G.', '......', '......', '......'], dir: 1, max: null, bloques: ['avanzar', 'izq', 'der'], pista: 'Chispa mira hacia la derecha. ¿Cuántas veces debe avanzar?' },
    { nombre: 'Da la vuelta', mapa: ['......', '...G..', '.##.#.', '.##.#.', 'S.....', '......'], dir: 1, max: null, bloques: ['avanzar', 'izq', 'der'], pista: 'Avanza hasta quedar justo debajo de la batería y luego gira.' },
    { nombre: 'Zigzag', mapa: ['......', '......', '..#G..', '.#..#.', '...#..', 'S.#...'], dir: 1, max: null, bloques: ['avanzar', 'izq', 'der'], pista: 'Avanza, gira, avanza, gira… ¿Ves el patrón?' },
    { nombre: 'Usa repetir', mapa: ['......', '######', 'S....G', '######', '......', '......'], dir: 1, max: 2, bloques: ['avanzar', 'izq', 'der', 'rep'], pista: 'Pon un bloque «repetir» y dentro un «avanzar». ¿Cuántas veces?' },
    { nombre: 'Escalera', mapa: ['.....G', '......', '.....#', '....##', '...###', 'S.####'], dir: 1, max: 5, bloques: ['avanzar', 'izq', 'der', 'rep'], pista: 'Un escalón es: avanzar, girar a la izquierda, avanzar, girar a la derecha. ¡Repítelo!' }
  ];
  const ETQ = { avanzar: '⬆ avanzar', izq: '↺ girar a la izquierda', der: '↻ girar a la derecha', rep: '🔁 repetir' };
  const PY = { avanzar: 'avanzar()', izq: 'girar_izquierda()', der: 'girar_derecha()' };
  const BATERIA = '<svg viewBox="0 0 40 40" aria-label="Batería"><rect x="8" y="8" width="24" height="28" rx="4" fill="#26a65b" stroke="#18213d" stroke-width="3"/><rect x="15" y="3" width="10" height="6" rx="2" fill="#18213d"/><path d="M21 13 L14 23 H20 L18 31 L26 20 H20 Z" fill="#ffd23f"/></svg>';
  const ROBOT = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 1 L26 9 H14 Z" fill="#ffc93c" stroke="#18213d" stroke-width="2" stroke-linejoin="round"/><rect x="7" y="10" width="26" height="26" rx="9" fill="#eaf2ff" stroke="#18213d" stroke-width="3"/><rect x="11" y="14" width="18" height="12" rx="4" fill="#18213d"/><circle cx="16" cy="20" r="2.4" fill="#5ce1e6"/><circle cx="24" cy="20" r="2.4" fill="#5ce1e6"/><rect x="2" y="18" width="5" height="10" rx="2" fill="#ff6a3d" stroke="#18213d" stroke-width="2"/><rect x="33" y="18" width="5" height="10" rx="2" fill="#ff6a3d" stroke="#18213d" stroke-width="2"/></svg>';

  function laberinto() {
    const root = $('#act-laberinto'); if (!root) return;
    let nivel = 0, prog = [], objetivo = null, corriendo = false, temporizador = null;
    let robot = { x: 0, y: 0, d: 1 }, giro = 0;
    root.innerHTML = '<div class="fila" style="justify-content:space-between"><div class="niveles" role="group" aria-label="Niveles"></div><b class="nombre-nivel"></b></div>' +
      '<div class="laberinto"><div style="display:grid;gap:10px;justify-items:center"><div class="tablero" aria-label="Tablero del laberinto"></div><p class="aviso-sim pista-nivel" style="max-width:420px"></p></div>' +
      '<div style="display:grid;gap:12px;align-content:start">' +
      '<div><b style="font-size:.9rem">Bloques (toca para agregar)</b><div class="paleta" style="margin-top:6px"></div></div>' +
      '<div class="fila" style="justify-content:space-between"><b style="font-size:.9rem">Tu programa</b><span class="contador-bloques"></span></div>' +
      '<div class="programa" aria-live="polite"></div>' +
      '<div class="fila"><button class="btn ejecutar">▶ Ejecutar</button><button class="btn sec chico salir-rep" hidden>Salir del repetir</button><button class="btn sec chico borrar-todo">Borrar todo</button></div>' +
      '<div class="zona-retro"></div>' +
      '<div><b style="font-size:.9rem">Así se ve tu programa en Python</b><div class="python-vista" aria-label="Programa en Python"></div></div>' +
      '</div></div>';
    const tab = $('.tablero', root);

    function cargar(n) {
      parar(); nivel = n; prog = []; objetivo = null;
      const L = NIVELES[n];
      tab.innerHTML = '';
      L.mapa.forEach((fila, y) => fila.split('').forEach((c, x) => {
        const d = document.createElement('div'); d.className = 'celda' + (c === '#' ? ' roca' : '') + (c === 'G' ? ' meta' : '');
        d.dataset.x = x; d.dataset.y = y; if (c === 'G') d.innerHTML = BATERIA;
        tab.appendChild(d);
      }));
      const r = document.createElement('div'); r.className = 'robot'; r.innerHTML = ROBOT; tab.appendChild(r);
      reiniciarRobot();
      $('.nombre-nivel', root).textContent = 'Nivel ' + (n + 1) + ': ' + L.nombre + (L.max ? ' · máximo ' + L.max + ' bloques' : '');
      $('.pista-nivel', root).textContent = 'Pista: ' + L.pista;
      $('.paleta', root).innerHTML = L.bloques.map((b) => '<button class="bloque ' + (b === 'avanzar' ? 'mov' : b === 'rep' ? 'rep' : 'giro') + '" data-b="' + b + '">' + ETQ[b] + '</button>').join('');
      $$('.paleta .bloque', root).forEach((b) => b.addEventListener('click', () => agregar(b.dataset.b)));
      $('.zona-retro', root).innerHTML = '';
      pintarNiveles(); pintarPrograma();
    }
    function inicio() { const L = NIVELES[nivel]; for (let y = 0; y < 6; y++) { const x = L.mapa[y].indexOf('S'); if (x >= 0) return { x, y }; } return { x: 0, y: 0 }; }
    function celda(x, y) { return $('.celda[data-x="' + x + '"][data-y="' + y + '"]', tab); }
    function reiniciarRobot() {
      const s = inicio(); robot = { x: s.x, y: s.y, d: NIVELES[nivel].dir }; giro = robot.d * 90;
      $$('.celda.pisada', tab).forEach((c) => c.classList.remove('pisada'));
      colocar(true);
    }
    function colocar(sinAnim) {
      const r = $('.robot', tab), c = celda(robot.x, robot.y); if (!r || !c) return;
      if (sinAnim) r.style.transition = 'none';
      r.style.width = c.offsetWidth + 'px'; r.style.height = c.offsetHeight + 'px';
      r.style.transform = 'translate(' + c.offsetLeft + 'px,' + c.offsetTop + 'px)';
      $('svg', r).style.transform = 'rotate(' + giro + 'deg)';
      if (sinAnim) { void r.offsetWidth; r.style.transition = ''; }
    }
    window.addEventListener('resize', () => colocar(true));
    document.addEventListener('vista', () => setTimeout(() => colocar(true), 30));

    function pintarNiveles() {
      const hechos = Progreso.marcas('lab');
      $('.niveles', root).innerHTML = NIVELES.map((L, i) => '<button class="' + (i === nivel ? 'activo ' : '') + (hechos.includes(i) ? 'hecho' : '') + '" data-n="' + i + '" aria-label="Nivel ' + (i + 1) + (hechos.includes(i) ? ', completado' : '') + '">' + (i + 1) + '</button>').join('');
      $$('.niveles button', root).forEach((b) => b.addEventListener('click', () => cargar(+b.dataset.n)));
    }
    function contar(lista) { return lista.reduce((s, b) => s + 1 + (b.t === 'rep' ? contar(b.hijos) : 0), 0); }
    function agregar(t) {
      if (corriendo) return;
      const nodo = t === 'rep' ? { t: 'rep', n: 3, hijos: [] } : { t };
      (objetivo ? objetivo.hijos : prog).push(nodo);
      if (t === 'rep') objetivo = nodo;
      Sonido.asegurar(); Sonido.tic();
      pintarPrograma();
    }
    function quitar(lista, nodo) {
      const i = lista.indexOf(nodo); if (i >= 0) { lista.splice(i, 1); return true; }
      return lista.some((b) => b.t === 'rep' && quitar(b.hijos, nodo));
    }
    const elementos = new Map();
    function pintarPrograma() {
      elementos.clear();
      const cont = $('.programa', root); cont.innerHTML = '';
      cont.classList.toggle('objetivo-act', !objetivo);
      if (!prog.length) cont.innerHTML = '<span class="aviso-sim">Toca los bloques de arriba para armar tu programa.</span>';
      const dibujar = (lista, dest) => lista.forEach((b) => {
        if (b.t === 'rep') {
          const el = document.createElement('div'); el.className = 'rep-blq';
          el.innerHTML = '<div class="rep-cab">🔁 repetir <button class="menos" aria-label="Menos veces">−</button><span class="veces">' + b.n + '</span><button class="mas" aria-label="Más veces">+</button> veces <button class="x" aria-label="Quitar bloque">✕</button></div>';
          const cuerpo = document.createElement('div'); cuerpo.className = 'rep-cuerpo' + (objetivo === b ? ' objetivo' : '');
          cuerpo.title = 'Toca para agregar bloques aquí dentro';
          if (!b.hijos.length) cuerpo.innerHTML = '<span class="vacio">' + (objetivo === b ? 'Los bloques nuevos entrarán aquí' : 'Toca aquí para meter bloques') + '</span>';
          dibujar(b.hijos, cuerpo);
          cuerpo.addEventListener('click', (e) => { if (e.target === cuerpo || e.target.classList.contains('vacio')) { objetivo = b; pintarPrograma(); } });
          el.appendChild(cuerpo); dest.appendChild(el); elementos.set(b, el);
          $('.menos', el).addEventListener('click', () => { if (corriendo) return; b.n = Math.max(2, b.n - 1); pintarPrograma(); });
          $('.mas', el).addEventListener('click', () => { if (corriendo) return; b.n = Math.min(9, b.n + 1); pintarPrograma(); });
          $('.rep-cab .x', el).addEventListener('click', () => { if (corriendo) return; quitar(prog, b); if (objetivo === b) objetivo = null; pintarPrograma(); });
        } else {
          const el = document.createElement('div'); el.className = 'pb ' + (b.t === 'avanzar' ? 'mov' : 'giro');
          el.innerHTML = ETQ[b.t] + ' <button class="x" aria-label="Quitar bloque">✕</button>';
          $('.x', el).addEventListener('click', () => { if (corriendo) return; quitar(prog, b); pintarPrograma(); });
          dest.appendChild(el); elementos.set(b, el);
        }
      });
      dibujar(prog, cont);
      $('.salir-rep', root).hidden = !objetivo;
      const L = NIVELES[nivel], n = contar(prog);
      const cb = $('.contador-bloques', root);
      cb.textContent = n + ' bloque' + (n === 1 ? '' : 's') + (L.max ? ' / máx. ' + L.max : '');
      cb.classList.toggle('excede', !!(L.max && n > L.max));
      $('.python-vista', root).innerHTML = python(prog, '') || '<span style="opacity:.6"># Aquí aparecerá tu código</span>';
    }
    function python(lista, ind) {
      return lista.map((b) => b.t === 'rep'
        ? ind + '<span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(<span class="nm">' + b.n + '</span>):\n' + (b.hijos.length ? python(b.hijos, ind + '    ') : ind + '    <span class="kw">pass</span>\n')
        : ind + '<span class="fn">' + PY[b.t].replace('()', '') + '</span>()\n').join('');
    }
    function* pasos(lista) { for (const b of lista) { if (b.t === 'rep') { for (let k = 0; k < b.n; k++) { yield { b: b, rep: true }; yield* pasos(b.hijos); } } else yield { b }; } }
    function parar() { clearTimeout(temporizador); corriendo = false; $$('.ejecutando', root).forEach((e) => e.classList.remove('ejecutando')); const btn = $('.ejecutar', root); if (btn) btn.disabled = false; }
    function ejecutar() {
      if (corriendo) return;
      if (!prog.length) { aviso('Agrega bloques a tu programa primero'); return; }
      Sonido.asegurar();
      reiniciarRobot(); corriendo = true; $('.ejecutar', root).disabled = true;
      $('.zona-retro', root).innerHTML = '';
      const it = pasos(prog), L = NIVELES[nivel], vel = reducido() ? 120 : 430;
      const mensaje = (tipo, html) => { $('.zona-retro', root).innerHTML = '<div class="retro ' + tipo + '"><span class="ico">' + (tipo === 'ok' ? '🏆' : tipo === 'mal' ? '💥' : '🤔') + '</span><p>' + html + '</p></div>'; };
      const paso = () => {
        $$('.ejecutando', root).forEach((e) => e.classList.remove('ejecutando'));
        const sig = it.next();
        if (sig.done) { parar(); mensaje('info', 'Chispa terminó el programa, pero no llegó a la batería. Revisa tus bloques y vuelve a intentarlo.'); Sonido.mal(); return; }
        const s = sig.value;
        const el = elementos.get(s.b); if (el) el.classList.add('ejecutando');
        if (s.rep) { temporizador = setTimeout(paso, vel / 3); return; }
        if (s.b.t === 'izq') { robot.d = (robot.d + 3) % 4; giro -= 90; Sonido.tic(); }
        else if (s.b.t === 'der') { robot.d = (robot.d + 1) % 4; giro += 90; Sonido.tic(); }
        else {
          const dx = [0, 1, 0, -1][robot.d], dy = [-1, 0, 1, 0][robot.d];
          const nx = robot.x + dx, ny = robot.y + dy;
          if (nx < 0 || ny < 0 || nx > 5 || ny > 5 || L.mapa[ny][nx] === '#') {
            parar(); const r = $('.robot', tab); r.classList.remove('choque'); void r.offsetWidth; r.classList.add('choque');
            mensaje('mal', '¡Ups! Chispa ' + (nx < 0 || ny < 0 || nx > 5 || ny > 5 ? 'se iba a salir del tablero' : 'chocó con una roca') + '. Revisa en qué paso se equivocó.'); Sonido.mal(); return;
          }
          celda(robot.x, robot.y).classList.add('pisada');
          robot.x = nx; robot.y = ny; Sonido.tic();
        }
        colocar(false);
        if (L.mapa[robot.y][robot.x] === 'G') {
          parar();
          const n = contar(prog);
          if (L.max && n > L.max) { mensaje('info', '¡Llegaste! Pero usaste ' + n + ' bloques y el reto es usar máximo ' + L.max + '. Prueba con el bloque «repetir».'); return; }
          const total = Progreso.marcar('lab', nivel); Progreso.ganar('u4-laberinto', total);
          Sonido.fin(); confeti();
          mensaje('ok', '¡Chispa llegó a la batería con ' + n + ' bloques!' + (nivel + 1 < NIVELES.length ? ' <button class="btn chico sig-nivel" style="margin-left:6px">Siguiente nivel →</button>' : ' ¡Completaste todos los niveles, programador!'));
          const sb = $('.sig-nivel', root); if (sb) sb.addEventListener('click', () => cargar(nivel + 1));
          pintarNiveles(); return;
        }
        temporizador = setTimeout(paso, vel);
      };
      temporizador = setTimeout(paso, 200);
    }
    $('.ejecutar', root).addEventListener('click', ejecutar);
    $('.borrar-todo', root).addEventListener('click', () => { parar(); prog = []; objetivo = null; reiniciarRobot(); pintarPrograma(); $('.zona-retro', root).innerHTML = ''; });
    $('.salir-rep', root).addEventListener('click', () => { objetivo = null; pintarPrograma(); });
    cargar(0);
  }

  /* ---------- 4.3 Editor de Python (Skulpt) ---------- */
  const RETOS = [
    { t: 'Hola, mundo', explica: '<p><code>print()</code> muestra un mensaje en la pantalla. El texto va entre comillas.</p><p><b>Reto:</b> cambia el mensaje para presentarte con tu nombre y tu comida favorita.</p>',
      cod: 'print("¡Hola! Soy Chispa 🤖")\nprint("Me encanta aprender cosas nuevas")\n', pista: 'Cambia lo que está entre comillas, por ejemplo: print("¡Hola! Soy Ana")',
      ok: (s, c, ini) => s.trim().length > 0 && c.trim() !== ini.trim(), meta: 'Cambia el mensaje y ejecútalo.' },
    { t: 'Variables', explica: '<p>Una <b>variable</b> es como una caja con etiqueta que guarda un dato. <code>nombre = "Ana"</code> guarda el texto Ana en la caja «nombre».</p><p><b>Reto:</b> pon tu nombre y tu edad en las variables.</p>',
      cod: 'nombre = "Ana"\nedad = 10\n\nprint("Me llamo", nombre)\nprint("Tengo", edad, "años")\nprint("El próximo año tendré", edad + 1)\n', pista: 'Cambia "Ana" por tu nombre (con comillas) y 10 por tu edad (sin comillas, porque es un número).',
      ok: (s, c, ini) => c.trim() !== ini.trim() && s.includes('Me llamo'), meta: 'Cambia los datos y ejecútalo.' },
    { t: 'Python calculadora', explica: '<p>Python hace cuentas: <code>+</code> suma, <code>-</code> resta, <code>*</code> multiplica y <code>/</code> divide.</p><p><b>Reto:</b> ¿cuántos minutos tiene un día? Agrega una línea que calcule 24 × 60.</p>',
      cod: 'print(7 + 5)\nprint(8 * 6)\nprint(20 - 9)\nprint(15 / 3)\n', pista: 'Agrega la línea: print(24 * 60)',
      ok: (s) => /\b1440\b/.test(s), meta: 'Haz que aparezca el resultado 1440.' },
    { t: 'Decisiones (if)', explica: '<p><code>if</code> significa «si». Si la condición es verdadera, se hace lo que está debajo (con espacios al inicio). Si no, se hace lo que está en <code>else</code>.</p><p><b>Reto:</b> cambia la temperatura a 15 y vuelve a ejecutar.</p>',
      cod: 'temperatura = 30\n\nif temperatura > 25:\n    print("¡Hace calor! Toma agua 💧")\nelse:\n    print("Está fresco, lleva un suéter 🧥")\n', pista: 'Cambia el 30 por 15 en la primera línea.',
      ok: (s) => s.includes('fresco'), meta: 'Logra que aparezca el mensaje del suéter.' },
    { t: 'Bucles (for)', explica: '<p><code>for i in range(1, 6):</code> repite lo de abajo 5 veces; <code>i</code> va tomando los valores 1, 2, 3, 4 y 5. ¡Es el bloque «repetir» del laberinto!</p><p><b>Reto:</b> haz una pirámide de 8 pisos y cambia la estrella por otro emoji.</p>',
      cod: 'for i in range(1, 6):\n    print("⭐" * i)\n', pista: 'Cambia range(1, 6) por range(1, 9). Puedes cambiar "⭐" por "🌮".',
      ok: (s) => s.trim().split('\n').length >= 8, meta: 'Haz que salgan al menos 8 líneas.' },
    { t: 'Mi bot de reglas', explica: '<p>Este bot usa <code>input()</code> para leer lo que escribes y <code>if/elif/else</code> para responder. Ojo: <b>no es IA</b>, solo sigue las reglas que tú le escribes. Una IA, en cambio, aprende sus reglas a partir de datos.</p><p><b>Reto:</b> agrega una regla nueva con <code>elif</code>, por ejemplo para «¿cómo estás?».</p>',
      cod: 'mensaje = input("Escríbele algo a tu bot: ")\nmensaje = mensaje.lower()\n\nif mensaje == "hola":\n    print("¡Hola! Soy tu bot 🤖")\nelif mensaje == "adiós":\n    print("¡Hasta luego! 👋")\nelse:\n    print("No entiendo… solo sé lo que me programaron.")\n',
      pista: 'Antes del else agrega:\nelif mensaje == "¿cómo estás?":\n    print("¡Muy bien, gracias!")',
      ok: (s, c) => (c.match(/\belif\b/g) || []).length >= 2, meta: 'Agrega un segundo elif y ejecútalo.' }
  ];
  const SK_CDN = ['https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js', 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js'];
  function cargarPython() {
    if (window.Sk && window.Sk.builtinFiles) return Promise.resolve();
    const carga = (lista) => cargarScript(lista[0]).then(() => cargarScript(lista[1]));
    return carga(SK_CDN);
  }
  function traducirError(e) {
    const t = String(e && e.toString ? e.toString() : e);
    const linea = (t.match(/on line (\d+)/) || [])[1];
    const donde = linea ? ' (línea ' + linea + ')' : '';
    if (/TimeLimitError/.test(t)) return 'El programa tardó demasiado. ¿Hay un bucle que nunca termina?';
    if (/IndentationError/.test(t)) return 'Revisa los espacios al inicio de las líneas' + donde + '. Lo que va dentro de un if o un for lleva 4 espacios.';
    if (/SyntaxError/.test(t)) return 'Hay un error de escritura' + donde + '. Revisa comillas, paréntesis y los dos puntos (:) al final de if, else y for.';
    if (/NameError/.test(t)) { const n = (t.match(/name '([^']+)'/) || [])[1]; return 'Python no conoce el nombre «' + (n || '?') + '»' + donde + '. ¿Lo escribiste bien? Si es texto, ponlo entre comillas.'; }
    if (/TypeError/.test(t)) return 'Estás mezclando tipos de datos' + donde + ', por ejemplo texto con números.';
    if (/ZeroDivisionError/.test(t)) return 'No se puede dividir entre cero' + donde + '.';
    return 'Ocurrió un error' + donde + '.';
  }
  function python() {
    const root = $('#act-python'); if (!root) return;
    let r = 0; const codigos = RETOS.map((x) => x.cod);
    root.innerHTML = '<div class="py"><div class="retos-tabs" role="tablist" aria-label="Retos de Python"></div>' +
      '<div class="py-grid"><div style="display:grid;gap:10px">' +
      '<label for="py-editor" class="aviso-sim">Editor: escribe tu código aquí</label><textarea id="py-editor" class="codigo" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>' +
      '<div class="fila"><button class="btn correr">▶ Ejecutar</button><button class="btn sec chico restaurar">Restaurar código</button></div>' +
      '<div><div class="consola" aria-live="polite" aria-label="Salida del programa"><span class="sis">La salida de tu programa aparecerá aquí.</span></div><div class="consola-entrada" hidden><input type="text" id="py-entrada" aria-label="Respuesta para el programa"><button class="btn chico enviar">Enviar</button></div></div>' +
      '</div><div class="py-explica"></div></div></div>';
    const ed = $('#py-editor'), con = $('.consola', root);
    function tabs() {
      const hechos = Progreso.marcas('py');
      $('.retos-tabs', root).innerHTML = RETOS.map((x, i) => '<button role="tab" aria-selected="' + (i === r) + '" class="' + (i === r ? 'activo ' : '') + (hechos.includes(i) ? 'hecho' : '') + '" data-i="' + i + '">' + (i + 1) + '. ' + esc(x.t) + '</button>').join('');
      $$('.retos-tabs button', root).forEach((b) => b.addEventListener('click', () => { codigos[r] = ed.value; r = +b.dataset.i; mostrar(); }));
    }
    function mostrar() {
      const R = RETOS[r];
      ed.value = codigos[r];
      $('.py-explica', root).innerHTML = '<h4 style="font-size:1.2rem">' + (r + 1) + '. ' + esc(R.t) + '</h4>' + R.explica +
        '<div class="retro info"><span class="ico">🎯</span><p><b>Meta para ganar la estrella:</b> ' + esc(R.meta) + '</p></div>' +
        '<details class="pista"><summary>Ver pista</summary><pre>' + esc(R.pista) + '</pre></details>';
      con.innerHTML = '<span class="sis">La salida de tu programa aparecerá aquí.</span>';
      tabs();
    }
    function salida(t, cls) { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = t; con.appendChild(s); }
    function pedir() {
      return new Promise((ok) => {
        const caja = $('.consola-entrada', root), inp = $('#py-entrada');
        caja.hidden = false; inp.value = ''; inp.focus();
        const listo = () => { caja.hidden = true; inp.removeEventListener('keydown', tecla); $('.enviar', root).removeEventListener('click', listo); salida(inp.value + '\n', 'sis'); if (window.Sk) window.Sk.execStart = new Date(); ok(inp.value); };
        const tecla = (e) => { if (e.key === 'Enter') { e.preventDefault(); listo(); } };
        inp.addEventListener('keydown', tecla); $('.enviar', root).addEventListener('click', listo);
      });
    }
    let ejecutando = false;
    function correr() {
      if (ejecutando) return; ejecutando = true;
      const btn = $('.correr', root); btn.disabled = true; btn.textContent = 'Cargando Python…';
      con.innerHTML = '';
      cargarPython().then(() => {
        btn.textContent = 'Ejecutando…';
        let texto = '';
        const Sk = window.Sk;
        Sk.configure({
          output: (t) => { texto += t; salida(t); },
          read: (x) => { if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) throw new Error("File not found: '" + x + "'"); return Sk.builtinFiles.files[x]; },
          __future__: Sk.python3, execLimit: 6000, yieldLimit: 100,
          inputfun: () => pedir(), inputfunTakesPrompt: false
        });
        const codigo = ed.value;
        return Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, codigo, true)).then(() => {
          if (!texto) salida('(El programa terminó sin mostrar nada. Usa print() para ver resultados.)\n', 'sis');
          const R = RETOS[r];
          if (R.ok(texto, codigo, R.cod)) {
            const n = Progreso.marcar('py', r);
            if (Progreso.ganar('u4-python', n)) { Sonido.fin(); confeti(); }
            salida('\n✔ ¡Reto cumplido!\n', 'sis'); tabs();
          }
        }).catch((e) => { salida('\n' + traducirError(e) + '\n', 'err'); salida('Detalle: ' + String(e) + '\n', 'sis'); });
      }).catch(() => {
        salida('No se pudo cargar Python. Revisa tu conexión a internet y vuelve a intentar.\n', 'err');
      }).finally(() => { ejecutando = false; btn.disabled = false; btn.textContent = '▶ Ejecutar'; $('.consola-entrada', root).hidden = true; });
    }
    ed.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText('    ', s, ed.selectionEnd, 'end'); }
      else if (e.key === 'Enter') {
        const s = ed.selectionStart, antes = ed.value.slice(0, s), linea = antes.split('\n').pop();
        let sangria = (linea.match(/^\s*/) || [''])[0]; if (/:\s*$/.test(linea)) sangria += '    ';
        if (sangria) { e.preventDefault(); ed.setRangeText('\n' + sangria, s, ed.selectionEnd, 'end'); }
      }
    });
    ed.addEventListener('input', () => { codigos[r] = ed.value; });
    $('.correr', root).addEventListener('click', correr);
    $('.restaurar', root).addEventListener('click', () => { codigos[r] = RETOS[r].cod; mostrar(); });
    mostrar();
  }

  window.IA.u4 = function () { algoritmo(); logica(); laberinto(); python(); };
})();

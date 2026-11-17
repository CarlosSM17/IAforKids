/* Unidad 1 · Fundamentos de IA */
(function () {
  'use strict';
  const { $, $$, esc, chispa, Clasificador, MiniQuiz, Pizarra, vectorDe, Progreso, Sonido, confeti, aviso } = window.IA;

  /* ---------- 1.1 ¿IA o no IA? ---------- */
  function iaONoIA() {
    const root = $('#act-ia'); if (!root) return;
    Clasificador(root, {
      id: 'u1-ia',
      botes: [{ id: 'si', em: '🤖', txt: 'Usa IA', clase: 'verde' }, { id: 'no', em: '⚙️', txt: 'No usa IA', clase: 'rojo' }],
      items: [
        { em: '🗣️', txt: 'Un asistente de voz que entiende lo que le pides', bote: 'si', por: 'Aprendió de millones de grabaciones de voz a reconocer palabras.' },
        { em: '🧮', txt: 'Una calculadora que suma 25 + 17', bote: 'no', por: 'Sigue reglas matemáticas fijas que alguien programó. No aprende.' },
        { em: '📺', txt: 'Una app que te recomienda videos que te pueden gustar', bote: 'si', por: 'Aprende de lo que ves tú y millones de personas para adivinar qué te gustará.' },
        { em: '💡', txt: 'Una lámpara con apagador', bote: 'no', por: 'Solo prende y apaga. No toma decisiones ni aprende.' },
        { em: '🌐', txt: 'Un traductor que convierte tu voz a otro idioma', bote: 'si', por: 'Aprendió de muchísimos textos traducidos a relacionar palabras de dos idiomas.' },
        { em: '🚦', txt: 'Un semáforo que cambia de color cada 60 segundos', bote: 'no', por: 'Sigue un temporizador fijo. Algunos semáforos «inteligentes» sí usan IA para medir el tráfico.' },
        { em: '📸', txt: 'Una cámara que encuentra las caras para enfocarlas', bote: 'si', por: 'Aprendió con muchas fotos cómo se ve una cara.' },
        { em: '⏰', txt: 'Un despertador que suena a las 7:00', bote: 'no', por: 'Hace siempre lo mismo a la hora que tú elegiste.' },
        { em: '📧', txt: 'Un correo que separa los mensajes basura (spam)', bote: 'si', por: 'Aprendió de miles de correos que las personas marcaron como basura.' },
        { em: '🍿', txt: 'Un horno de microondas que calienta 30 segundos', bote: 'no', por: 'Solo cuenta el tiempo que le indicas.' }
      ],
      mensajeFinal: '¡Ya sabes distinguir cuándo hay IA! La clave: ¿aprende de datos o solo sigue reglas fijas?'
    });
  }

  /* ---------- 1.2 Entrena a Chispa (clasificador de dibujos, vecinos más cercanos) ---------- */
  function entrena() {
    const root = $('#act-entrena'); if (!root) return;
    root.innerHTML =
      '<div class="entrena">' +
      '<div class="lienzo-caja">' +
      '<canvas class="lienzo" aria-label="Área para dibujar con el dedo o el ratón"></canvas>' +
      '<div class="fila" style="justify-content:center">' +
      '<button class="btn chico g-a" style="--c:#e8552d">Guardar en <span class="na">A</span></button>' +
      '<button class="btn chico g-b" style="--c:#1f5fd6">Guardar en <span class="nb">B</span></button>' +
      '</div>' +
      '<div class="fila" style="justify-content:center">' +
      '<button class="btn chico predecir" style="--c:#18213d">¿Qué es, Chispa?</button>' +
      '<button class="btn sec chico borrar">Borrar dibujo</button>' +
      '</div></div>' +
      '<div style="display:grid;gap:14px">' +
      '<ol class="act-instr" style="margin:0;padding-left:20px;display:grid;gap:4px">' +
      '<li><b>Enseña:</b> dibuja y guarda al menos 3 ejemplos tuyos en cada grupo.</li>' +
      '<li><b>Prueba:</b> dibuja algo nuevo y presiona «¿Qué es, Chispa?».</li>' +
      '<li><b>Experimenta:</b> dibuja algo que nunca le enseñaste, como una estrella. ¿Qué responde?</li></ol>' +
      '<div class="clases">' +
      '<div class="clase a"><label class="aviso-sim" for="clase-a">Grupo A</label><input id="clase-a" type="text" value="Círculo" maxlength="16"><span class="cuenta ca"></span><div class="galeria ga"></div></div>' +
      '<div class="clase b"><label class="aviso-sim" for="clase-b">Grupo B</label><input id="clase-b" type="text" value="Equis" maxlength="16"><span class="cuenta cb"></span><div class="galeria gb"></div></div>' +
      '</div>' +
      '<div class="fila"><button class="btn sec chico quitar">Quitar ejemplos de muestra</button><span class="aviso-sim">Los ejemplos con borde punteado son de muestra. Si cambias los nombres de los grupos, quítalos.</span></div>' +
      '<div class="con-chispa"><div class="cara">' + chispa('pensando') + '</div><div class="burbuja salida">Dibuja en el cuadro y pregúntame qué es. Ya tengo algunos ejemplos de muestra.</div></div>' +
      '<div class="prediccion" aria-live="polite"></div>' +
      '</div></div>';

    const pz = Pizarra($('.lienzo', root), { ancho: 260, alto: 260, grosor: 14 });
    const ejemplos = []; // {g:'a'|'b', v, muestra, thumb}
    let pruebas = 0;

    function miniatura(src) {
      const c = document.createElement('canvas'); c.width = c.height = 88;
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 88, 88); g.drawImage(src, 0, 0, 88, 88);
      return c;
    }
    function agregar(grupo, canvas, margen, muestra) {
      const v = vectorDe(canvas, margen, 16); if (!v) return false;
      const t = miniatura(canvas); if (muestra) t.classList.add('muestra');
      t.setAttribute('aria-hidden', 'true');
      ejemplos.push({ g: grupo, v, muestra, t });
      pintarGalerias(); return true;
    }
    function pintarGalerias() {
      ['a', 'b'].forEach((g) => {
        const gal = $('.g' + g, root); gal.innerHTML = '';
        const mios = ejemplos.filter((e) => e.g === g);
        mios.forEach((e) => gal.appendChild(e.t));
        const propios = mios.filter((e) => !e.muestra).length;
        $('.c' + g, root).textContent = mios.length + ' ejemplos (' + propios + ' tuyos)';
      });
      $('.na', root).textContent = $('#clase-a').value || 'A';
      $('.nb', root).textContent = $('#clase-b').value || 'B';
      revisarEstrella();
    }
    function revisarEstrella() {
      const a = ejemplos.filter((e) => e.g === 'a' && !e.muestra).length, b = ejemplos.filter((e) => e.g === 'b' && !e.muestra).length;
      if (a >= 3 && b >= 3 && pruebas >= 1) Progreso.ganar('u1-entrena', 1);
    }
    /* Ejemplos de muestra dibujados por código */
    function muestras() {
      const c = document.createElement('canvas'); c.width = c.height = 260; const g = c.getContext('2d', { willReadFrequently: true });
      g.lineCap = 'round'; g.lineWidth = 14; g.strokeStyle = '#18213d';
      const r = (a, b) => a + Math.random() * (b - a);
      for (let k = 0; k < 3; k++) {
        g.clearRect(0, 0, 260, 260); g.beginPath();
        g.ellipse(r(110, 150), r(110, 150), r(55, 90), r(55, 90), r(0, 1), 0, Math.PI * 2); g.stroke();
        agregar('a', c, 14, true);
        g.clearRect(0, 0, 260, 260); g.beginPath();
        const x0 = r(40, 70), y0 = r(40, 70), x1 = r(190, 220), y1 = r(190, 220);
        g.moveTo(x0, y0); g.lineTo(x1, y1); g.moveTo(x1 + r(-10, 10), y0 + r(-10, 10)); g.lineTo(x0 + r(-10, 10), y1 + r(-10, 10)); g.stroke();
        agregar('b', c, 14, true);
      }
    }
    function predecir() {
      const v = pz.vector(16);
      const salida = $('.salida', root), pred = $('.prediccion', root), cara = $('.cara', root);
      if (!v) { salida.textContent = 'Primero dibuja algo en el cuadro.'; return; }
      const na = ejemplos.filter((e) => e.g === 'a').length, nb = ejemplos.filter((e) => e.g === 'b').length;
      if (!na || !nb) { salida.textContent = 'Necesito ejemplos de los dos grupos para poder aprender.'; cara.innerHTML = chispa('triste'); return; }
      const dist = ejemplos.map((e) => { let s = 0; for (let i = 0; i < v.length; i++) { const d = v[i] - e.v[i]; s += d * d; } return { g: e.g, d: Math.sqrt(s) }; }).sort((x, y) => x.d - y.d);
      const k = Math.min(5, dist.length), votos = { a: 0, b: 0 };
      for (let i = 0; i < k; i++) votos[dist[i].g] += 1 / (dist[i].d + 0.5);
      const tot = votos.a + votos.b, pa = votos.a / tot, pb = votos.b / tot;
      const gana = pa >= pb ? 'a' : 'b', conf = Math.round(Math.max(pa, pb) * 100);
      const nombre = gana === 'a' ? ($('#clase-a').value || 'A') : ($('#clase-b').value || 'B');
      pruebas++; revisarEstrella();
      Sonido.asegurar(); Sonido.tic();
      cara.innerHTML = chispa(conf >= 70 ? 'feliz' : 'pensando');
      salida.innerHTML = conf >= 70
        ? 'Creo que es <b>' + esc(nombre) + '</b>. Estoy ' + conf + '% seguro.'
        : 'Mmm… tal vez sea <b>' + esc(nombre) + '</b>, pero solo estoy ' + conf + '% seguro. ¿Me enseñas más ejemplos?';
      pred.innerHTML = [['a', '#e8552d', pa], ['b', '#1f5fd6', pb]].map(([g, col, p]) =>
        '<div class="barra-conf"><span>' + esc(g === 'a' ? ($('#clase-a').value || 'A') : ($('#clase-b').value || 'B')) + '</span><span class="pista"><i style="width:' + Math.round(p * 100) + '%;background:' + col + '"></i></span><span>' + Math.round(p * 100) + '%</span></div>').join('') +
        '<p class="aviso-sim">Chispa compara tu dibujo con los ' + k + ' ejemplos más parecidos que ha visto. Solo conoce estos dos grupos, así que siempre elige uno de ellos, aunque dibujes otra cosa.</p>';
    }

    $('.g-a', root).addEventListener('click', () => { if (pz.vacio()) return aviso('Dibuja algo primero'); agregar('a', pz.canvas, 14 * pz.dpr, false); pz.limpiar(); });
    $('.g-b', root).addEventListener('click', () => { if (pz.vacio()) return aviso('Dibuja algo primero'); agregar('b', pz.canvas, 14 * pz.dpr, false); pz.limpiar(); });
    $('.borrar', root).addEventListener('click', () => pz.limpiar());
    $('.predecir', root).addEventListener('click', predecir);
    $('.quitar', root).addEventListener('click', () => { for (let i = ejemplos.length - 1; i >= 0; i--) if (ejemplos[i].muestra) ejemplos.splice(i, 1); pintarGalerias(); });
    ['#clase-a', '#clase-b'].forEach((s) => $(s).addEventListener('input', pintarGalerias));
    muestras();
  }

  /* ---------- 1.3 Chispa y las manzanas (sesgo en los datos) ---------- */
  function manzanas() {
    const root = $('#act-manzanas'); if (!root) return;
    const SETS = {
      a: { nombre: 'Grupo A: solo manzanas rojas', frutas: '🍎🍎🍎🍎🍎', regla: 'Si es ROJO y REDONDO → es manzana', nota: '5 fotos, todas iguales' },
      b: { nombre: 'Grupo B: manzanas variadas y otras frutas', frutas: '🍎🍏🍎🍏 · 🍅🍒', regla: 'Si tiene FORMA de manzana (de cualquier color) → es manzana', nota: 'Manzanas rojas y verdes, y ejemplos de lo que NO es manzana' }
    };
    const PRUEBAS = [
      { em: '🍎', nom: 'Manzana roja', real: true, a: true, b: true },
      { em: '🍏', nom: 'Manzana verde', real: true, a: false, b: true },
      { em: '🍅', nom: 'Tomate', real: false, a: true, b: false },
      { em: '🍒', nom: 'Cerezas', real: false, a: true, b: false },
      { em: '🍋', nom: 'Limón', real: false, a: false, b: false },
      { em: '🍐', nom: 'Pera', real: false, a: false, b: false }
    ];
    let set = 'a';
    const probadas = { a: new Set(), b: new Set() };
    function pintar() {
      root.innerHTML = '<div class="sets">' + Object.entries(SETS).map(([k, s]) =>
        '<button class="set' + (k === set ? ' activo' : '') + '" data-s="' + k + '" aria-pressed="' + (k === set) + '"><b>' + s.nombre + '</b><span class="frutas" aria-hidden="true">' + s.frutas + '</span><small>' + s.nota + '</small></button>').join('') + '</div>' +
        '<div class="regla">Lo que Chispa aprendió: ' + SETS[set].regla + '</div>' +
        '<p class="act-instr"><b>Ahora pon a prueba a Chispa.</b> Toca cada fruta para ver qué responde.</p>' +
        '<div class="prueba-frutas">' + PRUEBAS.map((p, i) => '<button class="fruta" data-i="' + i + '"><span class="em" aria-hidden="true">' + p.em + '</span>' + p.nom + '<span class="r"></span></button>').join('') + '</div>' +
        '<div class="zona-retro"></div>';
      $$('.set', root).forEach((b) => b.addEventListener('click', () => { set = b.dataset.s; pintar(); }));
      $$('.fruta', root).forEach((b) => b.addEventListener('click', () => probar(+b.dataset.i, b)));
      probadas[set].forEach((i) => mostrar(i, $('.fruta[data-i="' + i + '"]', root)));
      resumen();
    }
    function mostrar(i, b) {
      const p = PRUEBAS[i], dice = p[set], ok = dice === p.real;
      b.classList.add(ok ? 'ok' : 'mal');
      $('.r', b).innerHTML = '<br>Chispa: «' + (dice ? 'Es manzana' : 'No es manzana') + '» ' + (ok ? '✔' : '✖');
    }
    function probar(i, b) {
      probadas[set].add(i); mostrar(i, b);
      const p = PRUEBAS[i]; (p[set] === p.real) ? Sonido.bien() : Sonido.mal();
      resumen();
    }
    function resumen() {
      const z = $('.zona-retro', root);
      const n = probadas[set].size;
      if (!n) { z.innerHTML = ''; return; }
      const bien = [...probadas[set]].filter((i) => PRUEBAS[i][set] === PRUEBAS[i].real).length;
      let txt = 'Con el ' + (set === 'a' ? 'grupo A' : 'grupo B') + ', Chispa acertó ' + bien + ' de ' + n + '.';
      if (set === 'a' && bien < n) txt += ' Como solo vio manzanas rojas, cree que todo lo rojo y redondo es manzana, y no reconoce las verdes. Eso es un <b>sesgo</b>: los datos estaban incompletos.';
      if (set === 'b') txt += ' Con ejemplos variados (y ejemplos de lo que NO es manzana), Chispa aprende mucho mejor.';
      if (probadas.a.size >= 3 && probadas.b.size >= 3) { txt += ' <b>Conclusión:</b> la IA aprende lo que le enseñan sus datos; si los datos están incompletos, se equivoca.'; Progreso.ganar('u1-manzanas', 1); }
      else if (set === 'a' && n >= 3) txt += ' Ahora elige el grupo B y prueba otra vez.';
      z.innerHTML = '<div class="retro info"><span class="ico">💡</span><p>' + txt + '</p></div>';
    }
    pintar();
  }

  /* ---------- 1.3 Detective de errores ---------- */
  function detective() {
    const root = $('#act-detective'); if (!root) return;
    const OPS = ['Tuvo pocos datos', 'Sus datos estaban incompletos (sesgo)', 'Es una situación nueva para ella', 'Inventó la respuesta (alucinación)'];
    MiniQuiz(root, {
      id: 'u1-detective',
      preguntas: [
        { em: '🐕', escena: 'Una app para reconocer perros solo se entrenó con fotos de perros grandes. Ve un chihuahua y dice que es un gato.', pregunta: '¿Por qué se equivocó?', ops: OPS, c: 1, por: 'Le faltaron ejemplos de perros pequeños. Sus datos no representaban a todos los perros.' },
        { em: '💬', escena: 'Un chatbot dice muy seguro que los ajolotes viven en el desierto del Sahara.', pregunta: '¿Qué pasó?', ops: OPS, c: 3, por: 'Los chatbots predicen palabras que «suenan bien». A veces inventan datos falsos con mucha seguridad.' },
        { em: '🧹', escena: 'Un robot aspiradora aprendió a limpiar en una casa sin escaleras. En una casa nueva se cae por la escalera.', pregunta: '¿Por qué falló?', ops: OPS, c: 2, por: 'Nunca había visto escaleras. Las situaciones nuevas confunden a la IA.' },
        { em: '✏️', escena: 'Le enseñaste a Chispa solo 1 dibujo de círculo y 1 de equis. Se equivoca muchísimo.', pregunta: '¿Cuál es el problema?', ops: OPS, c: 0, por: 'Con tan pocos ejemplos no puede encontrar un patrón confiable.' },
        { em: '🎤', escena: 'Un asistente de voz entiende bien a los adultos, pero casi nunca entiende a los niños.', pregunta: '¿Qué crees que pasó?', ops: OPS, c: 1, por: 'Probablemente aprendió casi solo con voces de adultos. Sus datos dejaron fuera a los niños.' },
        { em: '🗺️', escena: 'Un mapa con IA aprendió el tráfico de días normales. El día del desfile manda a todos por calles cerradas.', pregunta: '¿Por qué se equivocó?', ops: OPS, c: 2, por: 'Un desfile es algo distinto a lo que vio al aprender. Por eso siempre conviene revisar.' }
      ],
      mensajeFinal: '¡Eres un gran detective! Ya sabes por qué la IA se equivoca.'
    });
  }

  window.IA.u1 = function () { iaONoIA(); entrena(); manzanas(); detective(); };
})();

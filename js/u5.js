/* Unidad 5 · Ética y pensamiento crítico */
(function () {
  'use strict';
  const { $, $$, esc, chispa, Clasificador, Pizarra, Progreso, Sonido, confeti, aviso } = window.IA;

  /* ---------- 5.1 Mi criatura inventada ---------- */
  function criatura() {
    const root = $('#act-criatura'); if (!root) return;
    const COLORES = ['#18213d', '#e8552d', '#1f5fd6', '#0f8a7e', '#c26a00', '#b5179e'];
    root.innerHTML = '<div class="criatura"><div style="display:grid;gap:10px">' +
      '<div class="campo"><label for="cr-nombre">Nombre de tu criatura</label><input type="text" id="cr-nombre" maxlength="24" placeholder="Por ejemplo: Glupi"></div>' +
      '<div class="campo"><label for="cr-vive">¿Dónde vive?</label><input type="text" id="cr-vive" maxlength="50" placeholder="En las nubes de chocolate"></div>' +
      '<div class="campo"><label for="cr-come">¿Qué come?</label><input type="text" id="cr-come" maxlength="50" placeholder="Arcoíris y calcetines perdidos"></div>' +
      '<div class="campo"><label for="cr-poder">Superpoder</label><input type="text" id="cr-poder" maxlength="60" placeholder="Se vuelve invisible cuando estornuda"></div>' +
      '<b style="font-size:.9rem">Dibújala</b>' +
      '<div class="fila colores" role="group" aria-label="Colores">' + COLORES.map((c, i) => '<button class="btn chico" data-c="' + c + '" aria-label="Color ' + (i + 1) + '" style="--c:' + c + ';width:40px;padding:0">' + (i === 0 ? '✓' : '') + '</button>').join('') + '</div>' +
      '<canvas class="lienzo" aria-label="Área para dibujar tu criatura"></canvas>' +
      '<div class="fila"><button class="btn sec chico borrar">Borrar dibujo</button><button class="btn crear">Crear mi ficha</button></div></div>' +
      '<div style="display:grid;gap:12px;align-content:start"><div class="ficha" aria-live="polite"></div>' +
      '<div class="con-chispa"><div>' + chispa('feliz') + '</div><div class="burbuja">Esta criatura nunca había existido. Una IA mezcla cosas que ya vio; tú puedes inventar algo totalmente nuevo.</div></div></div></div>';
    const pz = Pizarra($('.lienzo', root), { ancho: 260, alto: 260, grosor: 7 });
    $$('.colores button', root).forEach((b) => b.addEventListener('click', () => { pz.setColor(b.dataset.c); $$('.colores button', root).forEach((x) => { x.textContent = x === b ? '✓' : ''; }); }));
    $('.borrar', root).addEventListener('click', () => pz.limpiar());
    function ficha(final) {
      const v = (id) => ($('#cr-' + id).value || '').trim();
      const img = !pz.vacio() ? '<img alt="Dibujo de tu criatura" src="' + pz.canvas.toDataURL('image/png') + '">' : '<p class="aviso-sim" style="text-align:center">Tu dibujo aparecerá aquí</p>';
      $('.ficha', root).innerHTML = '<span class="aviso-sim">Ficha de criatura · Inventada por mí</span><h4>' + esc(v('nombre') || '¿Cómo se llama?') + '</h4>' + img +
        '<p><b>Vive:</b> ' + esc(v('vive') || '…') + '</p><p><b>Come:</b> ' + esc(v('come') || '…') + '</p><p><b>Superpoder:</b> ' + esc(v('poder') || '…') + '</p>';
      if (final) {
        const llenos = ['vive', 'come', 'poder'].filter((k) => v(k)).length;
        if (!v('nombre') || pz.vacio() || llenos < 2) { aviso('Ponle nombre, dibújala y completa al menos dos datos'); return; }
        if (Progreso.ganar('u5-criatura', 1)) { confeti(); Sonido.asegurar(); Sonido.fin(); }
      }
    }
    ['nombre', 'vive', 'come', 'poder'].forEach((k) => $('#cr-' + k).addEventListener('input', () => ficha(false)));
    $('.crear', root).addEventListener('click', () => ficha(true));
    ficha(false);
  }

  /* ---------- 5.2 Caza la alucinación ---------- */
  function verifica() {
    const root = $('#act-verifica'); if (!root) return;
    const RONDAS = [
      { tema: 'El ajolote', preg: '¿Qué es un ajolote?',
        enc: 'El ajolote (Ambystoma mexicanum) es un anfibio que solo vive de forma natural en los canales y lagos de Xochimilco, en la Ciudad de México. Es famoso porque puede regenerar partes de su cuerpo, como las patas. Hoy está en peligro crítico de extinción.',
        af: [['El ajolote es un anfibio.', true], ['En la naturaleza vive en Xochimilco, en la Ciudad de México.', true], ['Puede regenerar partes de su cuerpo, como sus patas.', true], ['Es muy común y vive en los desiertos de todo el mundo.', false]],
        por: 'La enciclopedia dice que solo vive en Xochimilco y que está en peligro de extinción. La IA lo inventó.' },
      { tema: 'El sistema solar', preg: 'Cuéntame datos del sistema solar.',
        enc: 'El Sol es una estrella. Júpiter es el planeta más grande del sistema solar. La Luna no produce luz propia: brilla porque refleja la luz del Sol. La Tierra tarda alrededor de 365 días en dar una vuelta completa al Sol.',
        af: [['El Sol es una estrella.', true], ['Júpiter es el planeta más grande del sistema solar.', true], ['La Luna brilla porque produce su propia luz.', false], ['La Tierra tarda cerca de un año en dar la vuelta al Sol.', true]],
        por: 'La Luna no tiene luz propia: refleja la luz del Sol.' },
      { tema: 'Tesoros de México', preg: 'Dame datos curiosos de México.',
        enc: 'El maíz se domesticó hace miles de años en lo que hoy es México, a partir de una planta silvestre llamada teocintle. Cada año, millones de mariposas monarca viajan desde Canadá y Estados Unidos para pasar el invierno en los bosques de Michoacán y el Estado de México. El chocolate se elabora con las semillas del cacao.',
        af: [['El maíz se originó en Europa.', false], ['Las mariposas monarca pasan el invierno en bosques de Michoacán y el Estado de México.', true], ['El chocolate se hace con semillas de cacao.', true], ['El maíz viene de una planta silvestre llamada teocintle.', true]],
        por: 'El maíz se domesticó en lo que hoy es México, no en Europa.' }
    ];
    let r = 0, intentos = 0;
    function pintar() {
      const R = RONDAS[r];
      root.innerHTML = '<p class="act-instr">Ronda ' + (r + 1) + ' de ' + RONDAS.length + '. La IA respondió con cuatro datos, pero <b>uno es falso</b>. Compara con la enciclopedia y toca el dato falso.</p>' +
        '<div class="verifica"><div class="resp-ia"><div class="quien">Pregunta: «' + esc(R.preg) + '»</div><div class="quien"><span style="width:30px;display:inline-block">' + chispa('feliz') + '</span> Respuesta de un chatbot:</div>' +
        R.af.map((a, i) => '<button class="afirm" data-i="' + i + '">' + esc(a[0]) + '</button>').join('') + '</div>' +
        '<div class="enciclopedia"><h4>📚 Enciclopedia escolar: ' + esc(R.tema) + '</h4><p>' + esc(R.enc) + '</p><p class="aviso-sim">Fuente confiable para esta actividad.</p></div></div><div class="zona-retro"></div>';
      $$('.afirm', root).forEach((b) => b.addEventListener('click', () => elegir(+b.dataset.i, b)));
    }
    function elegir(i, b) {
      const R = RONDAS[r]; intentos++;
      if (!R.af[i][1]) {
        Sonido.asegurar(); Sonido.bien(); b.classList.add('ok');
        $$('.afirm', root).forEach((x) => { x.disabled = true; });
        const ultima = r + 1 >= RONDAS.length;
        $('.zona-retro', root).innerHTML = '<div class="retro ok"><span class="ico">🕵️</span><div><b>¡Encontraste la alucinación!</b><p>' + esc(R.por) + '</p></div></div>' +
          '<div class="fila" style="margin-top:8px;justify-content:flex-end"><button class="btn sig">' + (ultima ? 'Terminar' : 'Siguiente ronda →') + '</button></div>';
        $('.sig', root).addEventListener('click', () => {
          if (!ultima) { r++; pintar(); return; }
          Progreso.ganar('u5-verifica', 1); confeti(); Sonido.fin();
          root.innerHTML = '<div class="resumen-final"><div class="grande">3 / 3</div><p>¡Detectaste todas las alucinaciones! Recuerda: la IA puede sonar muy segura y aun así equivocarse. <b>Siempre verifica.</b></p><button class="btn sec otra">Jugar otra vez</button></div>';
          $('.otra', root).addEventListener('click', () => { r = 0; intentos = 0; pintar(); });
        });
      } else {
        Sonido.asegurar(); Sonido.mal(); b.classList.add('verdad'); b.disabled = true;
        $('.zona-retro', root).innerHTML = '<div class="retro info"><span class="ico">📚</span><p>Ese dato sí coincide con la enciclopedia. ¡Sigue buscando el falso!</p></div>';
      }
    }
    pintar();
  }

  /* ---------- 5.3 Semáforo de la IA ---------- */
  function semaforo() {
    const root = $('#act-semaforo'); if (!root) return;
    Clasificador(root, {
      id: 'u5-semaforo',
      botes: [{ id: 'v', em: '🟢', txt: 'Adelante', clase: 'verde' }, { id: 'a', em: '🟡', txt: 'Con cuidado: pregunta o verifica', clase: 'amarillo' }, { id: 'r', em: '🔴', txt: 'Alto: no lo hagas', clase: 'rojo' }],
      items: [
        { em: '🌿', txt: 'Pedirle a la IA que te explique la fotosíntesis con un ejemplo', bote: 'v', por: 'Usarla para entender mejor un tema es un gran uso.' },
        { em: '🏠', txt: 'Escribir tu nombre completo, dirección y escuela en un chatbot', bote: 'r', por: 'Son datos privados. Nunca los compartas.' },
        { em: '📋', txt: 'Copiar la respuesta de la IA y entregarla como tu tarea', bote: 'r', por: 'No aprendes y no es honesto.' },
        { em: '😜', txt: 'Hacer una imagen chistosa de un compañero sin su permiso', bote: 'r', por: 'Puede lastimar a alguien. Respeta a las personas.' },
        { em: '📲', txt: 'Probar una app de IA nueva que encontraste en internet', bote: 'a', por: 'Primero pregúntale a un adulto si es segura y adecuada para tu edad.' },
        { em: '🔎', txt: 'Usar en tu exposición un dato curioso que te dio la IA', bote: 'a', por: 'Puede ser útil, pero verifícalo antes en una fuente confiable.' },
        { em: '✍️', txt: 'Pedirle ideas para tu cuento y luego escribirlo con tus palabras', bote: 'v', por: 'Te inspira y la creación sigue siendo tuya.' },
        { em: '🏷️', txt: 'Decir «hice esta imagen con ayuda de IA» al presentarla', bote: 'v', por: '¡Eso es ser honesto!' }
      ],
      mensajeFinal: '¡Sabes cuándo avanzar, cuándo tener cuidado y cuándo parar!'
    });
  }

  /* ---------- 5.3 Pacto y licencia ---------- */
  function pacto() {
    const root = $('#act-pacto'); if (!root) return;
    const PROMESAS = [
      'Uso la IA como asistente: yo pienso y yo decido.',
      'Verifico la información importante en fuentes confiables.',
      'Cuido mis datos: no comparto mi nombre completo, dirección, teléfono ni contraseñas.',
      'Soy honesto: digo cuándo usé IA en mis trabajos.',
      'Respeto a los demás: no uso su cara, su voz ni su trabajo sin permiso.',
      'Mi imaginación va primero: creo mis propias ideas.'
    ];
    root.innerHTML = '<div class="pacto">' + PROMESAS.map((p, i) => '<label for="pa-' + i + '"><input type="checkbox" id="pa-' + i + '"><span>' + esc(p) + '</span></label>').join('') +
      '<div class="fila"><div class="campo" style="flex:1 1 220px"><label for="pa-nombre">Tu nombre (solo el primero)</label><input type="text" id="pa-nombre" maxlength="20" placeholder="Escribe tu nombre"></div>' +
      '<button class="btn generar" style="align-self:end">Obtener mi licencia</button></div>' +
      '<div class="licencia-zona"></div></div>';
    function licencia() {
      const marcadas = $$('input[type="checkbox"]', root).filter((c) => c.checked).length;
      const nombre = ($('#pa-nombre').value || '').trim();
      if (marcadas < PROMESAS.length) { aviso('Marca las ' + PROMESAS.length + ' promesas para obtener tu licencia'); return; }
      if (!nombre) { aviso('Escribe tu nombre'); $('#pa-nombre').focus(); return; }
      Progreso.ganar('u5-pacto', 1);
      const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
      $('.licencia-zona', root).innerHTML = '<div class="licencia"><div>' + chispa('feliz') + '</div><div><div class="tipo">Licencia oficial del curso</div><h4>Explorador de la IA</h4>' +
        '<p style="font-size:1.4rem;font-weight:800;margin-top:4px">' + esc(nombre) + '</p>' +
        '<p>Se compromete a usar la inteligencia artificial con responsabilidad, honestidad y mucha imaginación.</p>' +
        '<div class="datos"><span>' + fecha + '</span><span>★ ' + Progreso.total() + ' estrellas</span><span>' + Progreso.unidadesCompletas() + ' de 5 unidades completas</span></div></div></div>' +
        '<p class="aviso-sim">Toma una captura de pantalla para guardar tu licencia o enséñasela a tu maestro.</p>';
      confeti(); Sonido.asegurar(); Sonido.fin();
    }
    $('.generar', root).addEventListener('click', licencia);
  }

  window.IA.u5 = function () { criatura(); verifica(); semaforo(); pacto(); };
})();

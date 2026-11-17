/* Unidad 2 · La IA en la escuela */
(function () {
  'use strict';
  const { $, $$, esc, Clasificador, MiniQuiz, Progreso, Sonido, confeti, copiar } = window.IA;

  /* ---------- 2.2 Constructor de prompts ---------- */
  function constructor() {
    const root = $('#act-prompt'); if (!root) return;
    const PARTES = [
      { id: 'rol', nombre: '¿Quién quieres que sea?', color: '#ffb4a2', ops: ['', 'Actúa como un maestro paciente.', 'Actúa como un científico divertido.', 'Actúa como un guía de museo.'], tip: 'Dale un papel (rol): «Actúa como un maestro paciente».' },
      { id: 'tarea', nombre: '¿Qué quieres que haga?', color: '#ffd166', ops: ['', 'Explícame', 'Hazme 3 preguntas para practicar sobre', 'Dame un resumen corto sobre', 'Dame 5 ideas para un proyecto sobre'], tip: 'Di qué quieres: explicar, resumir, darte preguntas o ideas.' },
      { id: 'tema', nombre: '¿Sobre qué tema?', color: '#9be7c4', libre: true, tip: 'Escribe un tema claro: «los volcanes», «las fracciones»…' },
      { id: 'nivel', nombre: '¿Para quién es?', color: '#a0c4ff', ops: ['', 'para un niño de 10 años', 'con palabras sencillas', 'como si fuera un cuento'], tip: 'Di para quién es, así la IA usa palabras que entiendes.' },
      { id: 'formato', nombre: '¿Cómo lo quieres?', color: '#d0b3ff', ops: ['', 'en 3 puntos cortos', 'con un ejemplo de la vida diaria', 'en forma de tabla', 'y termina con una pregunta para mí'], tip: 'Pide un formato: puntos, tabla, un ejemplo…' }
    ];
    const NOMBRE_OP = (o) => o === '' ? '— (vacío) —' : o;
    root.innerHTML = '<div class="constructor"><div style="display:grid;gap:12px">' + PARTES.map((p) =>
      '<div class="campo"><label for="pp-' + p.id + '"><span class="dot" style="background:' + p.color + '"></span>' + p.nombre + '</label>' +
      (p.libre ? '<input type="text" id="pp-' + p.id + '" value="los volcanes" maxlength="60">'
        : '<select id="pp-' + p.id + '">' + p.ops.map((o) => '<option value="' + esc(o) + '">' + esc(NOMBRE_OP(o)) + '</option>').join('') + '</select>') +
      '</div>').join('') + '</div>' +
      '<div style="display:grid;gap:12px;align-content:start">' +
      '<b>Tu instrucción para la IA:</b><div class="prompt-final" aria-live="polite"></div>' +
      '<div class="fila"><div class="medidor" aria-label="Calidad del prompt"></div><b class="nota-p"></b></div>' +
      '<div class="consejos"></div>' +
      '<div class="fila"><button class="btn sec chico copiar-p">Copiar instrucción</button><textarea class="kh-copia" hidden readonly aria-label="Instrucción para copiar"></textarea></div>' +
      '</div></div>';
    function texto() {
      const v = {}; PARTES.forEach((p) => { v[p.id] = ($('#pp-' + p.id).value || '').trim(); });
      const seg = [];
      if (v.rol) seg.push({ t: v.rol, c: PARTES[0].color });
      let frase = '';
      if (v.tarea) seg.push({ t: v.tarea, c: PARTES[1].color });
      if (v.tema) seg.push({ t: v.tema, c: PARTES[2].color });
      if (v.nivel) seg.push({ t: v.nivel, c: PARTES[3].color });
      if (v.formato) seg.push({ t: v.formato, c: PARTES[4].color });
      frase = seg.map((s) => s.t).join(' ');
      return { v, seg, frase };
    }
    function pintar() {
      const { v, seg, frase } = texto();
      const llenos = PARTES.filter((p) => v[p.id]).length;
      $('.prompt-final', root).innerHTML = seg.length ? seg.map((s) => '<span class="p-parte" style="background:' + s.c + ';color:#18213d">' + esc(s.t) + '</span>').join(' ') + (/[.?!]$/.test(frase) ? '' : '.') : '<span style="opacity:.6">Elige las partes de tu instrucción…</span>';
      $('.medidor', root).innerHTML = PARTES.map((_, i) => '<span class="' + (i < llenos ? 'on' : '') + '" aria-hidden="true">⭐</span>').join('');
      const notas = ['Muy débil', 'Muy débil', 'Puede mejorar', 'Va bien', 'Muy buena', '¡Instrucción de experto!'];
      $('.nota-p', root).textContent = llenos + '/5 · ' + notas[llenos];
      const faltan = PARTES.filter((p) => !v[p.id]);
      $('.consejos', root).innerHTML = faltan.length
        ? '<div class="retro info"><span class="ico">💡</span><div><b>Para mejorarla:</b><p>' + faltan.slice(0, 2).map((p) => esc(p.tip)).join(' ') + '</p></div></div>'
        : '<div class="retro ok"><span class="ico">✔</span><div><b>¡Lista!</b><p>Tiene rol, tarea, tema, para quién es y formato. Con una instrucción así, la IA entiende mucho mejor lo que necesitas.</p></div></div>';
      if (llenos === 5) { if (Progreso.ganar('u2-prompt', 1)) { confeti(); Sonido.asegurar(); Sonido.fin(); } }
    }
    PARTES.forEach((p) => { const el = $('#pp-' + p.id); el.addEventListener(p.libre ? 'input' : 'change', pintar); });
    $('.copiar-p', root).addEventListener('click', () => copiar(texto().frase, $('.kh-copia', root)));
    pintar();
  }

  /* ---------- 2.2 ¿Cuál instrucción es mejor? ---------- */
  function mejor() {
    const root = $('#act-mejor'); if (!root) return;
    MiniQuiz(root, {
      id: 'u2-mejor',
      preguntas: [
        { em: '🌱', escena: 'Quieres entender la fotosíntesis.', pregunta: '¿Qué instrucción es mejor?', ops: ['«fotosíntesis»', '«Explícame la fotosíntesis con palabras sencillas y un ejemplo de mi jardín»', '«dime todo»', '«Haz mi tarea de fotosíntesis»'], c: 1, por: 'Dice qué quieres (explicar), el tema, para quién (palabras sencillas) y cómo (con un ejemplo).' },
        { em: '✖️', escena: 'Quieres practicar las tablas de multiplicar para tu examen.', pregunta: '¿Qué instrucción te ayuda a aprender?', ops: ['«Dame las respuestas del examen»', '«multiplicaciones»', '«Hazme 5 multiplicaciones de práctica y dime si mis respuestas están bien»', '«¿Cuánto es todo?»'], c: 2, por: 'Así practicas tú y la IA te da retroalimentación. ¡Tú haces el trabajo!' },
        { em: '🚀', escena: 'Necesitas ideas para escribir un cuento sobre el espacio.', pregunta: '¿Qué instrucción es mejor?', ops: ['«Escribe mi cuento y ponle mi nombre»', '«Dame 3 ideas de personajes para un cuento del espacio; yo lo escribiré»', '«cuento»', '«Escribe algo muy largo»'], c: 1, por: 'Pides inspiración, pero la historia la escribes tú. Tu imaginación es la estrella.' },
        { em: '🇬🇧', escena: 'Leíste un párrafo en inglés y no lo entiendes.', pregunta: '¿Qué instrucción es mejor?', ops: ['«inglés»', '«Haz mi tarea de inglés»', '«Dime mi calificación»', '«Tradúceme este párrafo al español y explícame 3 palabras nuevas»'], c: 3, por: 'Entiendes el texto y además aprendes vocabulario nuevo.' }
      ],
      mensajeFinal: '¡Sabes pedir ayuda de forma inteligente!'
    });
  }

  /* ---------- 2.3 ¿Ayuda o no está bien? ---------- */
  function ayuda() {
    const root = $('#act-ayuda'); if (!root) return;
    Clasificador(root, {
      id: 'u2-ayuda',
      botes: [{ id: 'si', em: '✅', txt: 'Me ayuda a aprender', clase: 'verde' }, { id: 'no', em: '⛔', txt: 'No está bien (trampa o riesgo)', clase: 'rojo' }],
      items: [
        { em: '🍕', txt: 'Pedirle que me explique las fracciones con ejemplos', bote: 'si', por: 'Te ayuda a entender. Después tú resuelves los ejercicios.' },
        { em: '📋', txt: 'Copiar la respuesta de la IA y entregarla como mi tarea', bote: 'no', por: 'Eso es hacer trampa: no aprendes y no es tu trabajo.' },
        { em: '❓', txt: 'Pedirle que me haga preguntas para repasar antes del examen', bote: 'si', por: 'Practicar con preguntas es una excelente forma de estudiar.' },
        { em: '🏠', txt: 'Escribir mi dirección y mi teléfono en un chatbot', bote: 'no', por: 'Tus datos personales son privados. Nunca los compartas.' },
        { em: '🎙️', txt: 'Usar el dictado por voz para escribir mis ideas', bote: 'si', por: 'El dictado te ayuda a escribir más rápido; las ideas siguen siendo tuyas.' },
        { em: '📖', txt: 'Pedirle que escriba mi cuento completo', bote: 'no', por: 'Si la IA escribe todo, no practicas ni usas tu imaginación.' },
        { em: '🔤', txt: 'Pedirle que señale mis faltas de ortografía y corregirlas yo', bote: 'si', por: 'Tú corriges y así aprendes a escribir mejor.' },
        { em: '🖼️', txt: 'Entregar un dibujo hecho por IA diciendo que lo hice a mano', bote: 'no', por: 'Hay que ser honestos: si usaste IA, dilo.' },
        { em: '💡', txt: 'Pedir ideas para mi proyecto y elegir las que me gusten', bote: 'si', por: 'Tú decides qué ideas usar y cómo mejorarlas.' },
        { em: '📱', txt: 'Abrir una cuenta en una app de IA sin permiso de mis papás', bote: 'no', por: 'Muchas apps piden una edad mínima. Siempre pide permiso a un adulto.' }
      ],
      mensajeFinal: '¡Sabes usar la IA como una herramienta para aprender!'
    });
  }

  window.IA.u2 = function () { constructor(); mejor(); ayuda(); };
})();

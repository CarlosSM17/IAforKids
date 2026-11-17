/* Unidad 3 · Imágenes y multimedia con IA */
(function () {
  'use strict';
  const { $, $$, esc, MiniQuiz, Progreso, Sonido, confeti, aviso } = window.IA;
  const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  /* ---------- Dibujos objetivo para «Del ruido a la imagen» ---------- */
  const OBJETIVOS = {
    sol: { txt: 'Un sol sobre montañas nevadas', dibujar(g, W, H) {
      const cielo = g.createLinearGradient(0, 0, 0, H); cielo.addColorStop(0, '#5fb8ff'); cielo.addColorStop(1, '#fff2c4');
      g.fillStyle = cielo; g.fillRect(0, 0, W, H);
      g.fillStyle = '#ffcf33'; g.beginPath(); g.arc(W * .74, H * .26, H * .14, 0, 7); g.fill();
      g.fillStyle = '#56607d'; g.beginPath(); g.moveTo(0, H * .85); g.lineTo(W * .28, H * .32); g.lineTo(W * .55, H * .85); g.fill();
      g.fillStyle = '#3d4663'; g.beginPath(); g.moveTo(W * .3, H * .9); g.lineTo(W * .62, H * .42); g.lineTo(W, H * .9); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(W * .28, H * .32); g.lineTo(W * .22, H * .45); g.lineTo(W * .34, H * .45); g.fill();
      g.beginPath(); g.moveTo(W * .62, H * .42); g.lineTo(W * .56, H * .53); g.lineTo(W * .68, H * .53); g.fill();
      g.fillStyle = '#5bb75b'; g.fillRect(0, H * .82, W, H * .18);
    } },
    casa: { txt: 'Una casa con un árbol', dibujar(g, W, H) {
      g.fillStyle = '#8fd0ff'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#6cc46c'; g.fillRect(0, H * .7, W, H * .3);
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(W * .2, H * .18, 34, 12, 0, 0, 7); g.fill();
      g.fillStyle = '#f2a65a'; g.fillRect(W * .42, H * .42, W * .3, H * .32);
      g.fillStyle = '#c84c3a'; g.beginPath(); g.moveTo(W * .38, H * .43); g.lineTo(W * .57, H * .2); g.lineTo(W * .76, H * .43); g.fill();
      g.fillStyle = '#7a4a1d'; g.fillRect(W * .54, H * .56, W * .07, H * .18);
      g.fillStyle = '#cfe9ff'; g.fillRect(W * .46, H * .5, W * .06, H * .08);
      g.fillStyle = '#8b5a2b'; g.fillRect(W * .16, H * .48, W * .04, H * .26);
      g.fillStyle = '#2f8f3a'; g.beginPath(); g.arc(W * .18, H * .42, H * .15, 0, 7); g.fill();
    } },
    barco: { txt: 'Un barco en el mar al atardecer', dibujar(g, W, H) {
      const cielo = g.createLinearGradient(0, 0, 0, H * .6); cielo.addColorStop(0, '#6a3d9a'); cielo.addColorStop(.5, '#ff6f61'); cielo.addColorStop(1, '#ffc46b');
      g.fillStyle = cielo; g.fillRect(0, 0, W, H * .6);
      g.fillStyle = '#ffe28a'; g.beginPath(); g.arc(W * .5, H * .6, H * .14, Math.PI, 0); g.fill();
      const mar = g.createLinearGradient(0, H * .6, 0, H); mar.addColorStop(0, '#2b5f9e'); mar.addColorStop(1, '#13325c');
      g.fillStyle = mar; g.fillRect(0, H * .6, W, H * .4);
      g.strokeStyle = 'rgba(255,220,150,.6)'; g.lineWidth = 3;
      for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(W * .35 - i * 8, H * (.66 + i * .06)); g.lineTo(W * .65 + i * 8, H * (.66 + i * .06)); g.stroke(); }
      g.fillStyle = '#5a3418'; g.beginPath(); g.moveTo(W * .2, H * .68); g.lineTo(W * .42, H * .68); g.lineTo(W * .38, H * .76); g.lineTo(W * .24, H * .76); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(W * .31, H * .67); g.lineTo(W * .31, H * .38); g.lineTo(W * .4, H * .64); g.fill();
    } }
  };

  function ruido() {
    const root = $('#act-ruido'); if (!root) return;
    const W = 320, H = 220;
    root.innerHTML = '<div class="ruido"><canvas width="' + W + '" height="' + H + '" aria-label="Imagen que aparece poco a poco desde el ruido"></canvas>' +
      '<div style="display:grid;gap:12px">' +
      '<div class="campo"><label for="ruido-desc">Prompt (lo que le pides a la IA)</label><select id="ruido-desc">' +
      Object.entries(OBJETIVOS).map(([k, o]) => '<option value="' + k + '">' + esc(o.txt) + '</option>').join('') + '</select></div>' +
      '<label for="ruido-paso" class="paso-txt">Paso 0 de 10</label>' +
      '<input type="range" id="ruido-paso" min="0" max="10" step="1" value="0">' +
      '<div class="fila"><button class="btn play">Generar paso a paso</button><button class="btn sec chico nuevo">Nuevo ruido</button></div>' +
      '<div class="retro info"><span class="ico">🎨</span><p class="explica-paso"></p></div></div></div>';
    const cv = $('canvas', root), g = cv.getContext('2d');
    const obj = document.createElement('canvas'); obj.width = W; obj.height = H; const og = obj.getContext('2d');
    const chico = document.createElement('canvas'), cg = chico.getContext('2d');
    const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tg = tmp.getContext('2d', { willReadFrequently: true });
    let ruidoDatos;
    function nuevoRuido() {
      ruidoDatos = new Uint8ClampedArray(W * H * 4);
      for (let i = 0; i < W * H; i++) { const b = Math.random() * 255; ruidoDatos[i * 4] = b * .7 + Math.random() * 76; ruidoDatos[i * 4 + 1] = b * .7 + Math.random() * 76; ruidoDatos[i * 4 + 2] = b * .7 + Math.random() * 76; ruidoDatos[i * 4 + 3] = 255; }
    }
    function preparar() { og.clearRect(0, 0, W, H); OBJETIVOS[$('#ruido-desc').value].dibujar(og, W, H); }
    function pintar(s) {
      const t = s / 10, a = Math.pow(t, 0.85);
      const r = Math.max(5, Math.round(W * Math.pow(t, 1.7)));
      chico.width = r; chico.height = Math.max(3, Math.round(r * H / W));
      cg.imageSmoothingEnabled = true; cg.drawImage(obj, 0, 0, chico.width, chico.height);
      tg.imageSmoothingEnabled = true; tg.clearRect(0, 0, W, H); tg.drawImage(chico, 0, 0, W, H);
      const im = tg.getImageData(0, 0, W, H), d = im.data;
      for (let i = 0; i < d.length; i += 4) { d[i] = d[i] * a + ruidoDatos[i] * (1 - a); d[i + 1] = d[i + 1] * a + ruidoDatos[i + 1] * (1 - a); d[i + 2] = d[i + 2] * a + ruidoDatos[i + 2] * (1 - a); }
      g.putImageData(im, 0, 0);
      $('.paso-txt', root).textContent = 'Paso ' + s + ' de 10';
      const desc = OBJETIVOS[$('#ruido-desc').value].txt.toLowerCase();
      $('.explica-paso', root).textContent =
        s === 0 ? 'La IA empieza con puro ruido, como la estática de una tele vieja. Todavía no hay ninguna imagen.'
        : s <= 3 ? 'La IA compara el ruido con lo que aprendió sobre «' + desc + '» y quita un poco de ruido. Aparecen manchas de color.'
        : s <= 6 ? 'Ya se distinguen las formas grandes: el cielo, el suelo y los objetos principales.'
        : s <= 9 ? 'Ahora afina los detalles: bordes, sombras y colores.'
        : '¡Listo! Es una imagen nueva: no es una copia de una foto. La IA la fue «descubriendo» dentro del ruido, paso a paso.';
      if (s === 10) Progreso.ganar('u3-ruido', 1);
    }
    let anim = null;
    const rango = $('#ruido-paso');
    rango.addEventListener('input', () => { clearInterval(anim); pintar(+rango.value); });
    $('#ruido-desc').addEventListener('change', () => { preparar(); pintar(+rango.value); });
    $('.nuevo', root).addEventListener('click', () => { nuevoRuido(); pintar(+rango.value); });
    $('.play', root).addEventListener('click', () => {
      clearInterval(anim); let s = 0; rango.value = 0; pintar(0);
      anim = setInterval(() => { s++; rango.value = s; pintar(s); if (s >= 10) clearInterval(anim); }, IA.reducido() ? 60 : 550);
    });
    nuevoRuido(); preparar(); pintar(0);
  }

  /* ---------- 3.2 Estudio de imagen (simulación) ---------- */
  function estudio() {
    const root = $('#act-estudio'); if (!root) return;
    const OP = {
      sujeto: [['un gato', '🐱'], ['un robot', '🤖'], ['un dragón', '🐉'], ['un dinosaurio', '🦖'], ['una tortuga', '🐢']],
      accion: [['leyendo un libro'], ['saltando'], ['durmiendo'], ['bailando']],
      lugar: [['en el espacio', 'espacio'], ['en la playa', 'playa'], ['en un bosque', 'bosque'], ['en la ciudad', 'ciudad'], ['bajo el mar', 'mar']],
      detalle: [['de noche'], ['de día'], ['al atardecer'], ['con nieve'], ['con muchos colores']],
      estilo: [['caricatura', 'e-caricatura'], ['acuarela', 'e-acuarela'], ['pixel art', 'e-pixel'], ['foto antigua', 'e-antigua']]
    };
    const ETQ = { sujeto: 'Sujeto (¿quién?)', accion: 'Acción (¿qué hace?)', lugar: 'Lugar (¿dónde?)', detalle: 'Detalles (¿cuándo? ¿cómo?)', estilo: 'Estilo' };
    root.innerHTML = '<div class="estudio"><div style="display:grid;gap:10px">' +
      Object.keys(OP).map((k) => '<div class="campo"><label for="est-' + k + '">' + ETQ[k] + '</label><select id="est-' + k + '">' +
        OP[k].map((o, i) => '<option value="' + i + '">' + esc(o[0]) + '</option>').join('') + '</select></div>').join('') +
      '<button class="btn sorpresa" style="justify-self:start">Combinación sorpresa</button></div>' +
      '<div style="display:grid;gap:10px"><canvas width="480" height="320" aria-label="Imagen de la simulación"></canvas>' +
      '<div class="prompt-img" aria-live="polite"></div>' +
      '<p class="aviso-sim">Simulación hecha con dibujos sencillos: muestra cómo cada parte del prompt cambia el resultado. Una IA real crearía una imagen distinta cada vez.</p></div></div>';
    const cv = $('canvas', root), g = cv.getContext('2d');
    const W = 480, H = 320;
    const vistos = new Set();
    const sel = (k) => OP[k][+$('#est-' + k).value];

    function emoji(ctx, e, x, y, s, rot) {
      ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot);
      ctx.font = s + 'px ' + EMOJI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, 0, 0); ctx.restore();
    }
    function semilla(n) { let s = n; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

    function escena(ctx, w, h) {
      const k = (w / W);
      const lugar = sel('lugar')[1], det = sel('detalle')[0], accion = sel('accion')[0], suj = sel('sujeto')[1];
      const noche = det === 'de noche', tarde = det === 'al atardecer';
      const rnd = semilla(7);
      let cielo = { espacio: ['#0b1033', '#2a1f5c'], playa: ['#6cc8ff', '#d9f4ff'], bosque: ['#8fd8ff', '#e6f8ff'], ciudad: ['#86c3ff', '#e3f2ff'], mar: ['#0a4f91', '#3fb3e8'] }[lugar];
      if (tarde && lugar !== 'espacio' && lugar !== 'mar') cielo = ['#ff6f61', '#ffc46b'];
      if (noche && lugar !== 'espacio') cielo = lugar === 'mar' ? ['#04203f', '#0b3b66'] : ['#0b1640', '#2b3a75'];
      const gr = ctx.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, cielo[0]); gr.addColorStop(1, cielo[1]);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      const piso = h * .72;
      if (noche || lugar === 'espacio') { ctx.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { ctx.globalAlpha = .4 + rnd() * .6; ctx.fillRect(rnd() * w, rnd() * piso, 2 * k, 2 * k); } ctx.globalAlpha = 1; }
      if (lugar === 'playa') {
        if (!noche) { ctx.fillStyle = tarde ? '#ffe28a' : '#ffd23f'; ctx.beginPath(); ctx.arc(w * .82, h * .2, 30 * k, 0, 7); ctx.fill(); }
        ctx.fillStyle = noche ? '#123a66' : '#2fa4d9'; ctx.fillRect(0, h * .55, w, h * .17);
        ctx.fillStyle = noche ? '#a8936a' : '#f3d9a4'; ctx.fillRect(0, piso, w, h - piso);
        emoji(ctx, '🌴', w * .12, h * .55, 90 * k); emoji(ctx, '🐚', w * .85, h * .9, 28 * k);
      } else if (lugar === 'espacio') {
        emoji(ctx, '🪐', w * .8, h * .2, 70 * k); emoji(ctx, '🌍', w * .15, h * .18, 40 * k);
        ctx.fillStyle = '#b9b6c9'; ctx.beginPath(); ctx.ellipse(w / 2, h * 1.15, w * .8, h * .45, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#9a96ad'; [[.2, .86, 18], [.7, .9, 26], [.45, .95, 12]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(w * x, h * y, r * k * 1.6, r * k * .5, 0, 0, 7); ctx.fill(); });
      } else if (lugar === 'bosque') {
        ctx.fillStyle = noche ? '#1f4d2a' : '#4caf50'; ctx.fillRect(0, piso, w, h - piso);
        for (let i = 0; i < 7; i++) { const x = (i + .5) * w / 7, s = 60 + (i % 3) * 18; ctx.fillStyle = noche ? '#123d22' : ['#2e7d32', '#1b5e20', '#388e3c'][i % 3]; ctx.beginPath(); ctx.moveTo(x, piso - s * 1.6 * k); ctx.lineTo(x - s * .55 * k, piso + 4); ctx.lineTo(x + s * .55 * k, piso + 4); ctx.fill(); }
        emoji(ctx, '🍄', w * .85, h * .86, 32 * k);
      } else if (lugar === 'ciudad') {
        ctx.fillStyle = '#7d8696'; ctx.fillRect(0, piso, w, h - piso);
        ctx.strokeStyle = '#f5f5f5'; ctx.lineWidth = 4 * k; ctx.setLineDash([18 * k, 14 * k]); ctx.beginPath(); ctx.moveTo(0, h * .86); ctx.lineTo(w, h * .86); ctx.stroke(); ctx.setLineDash([]);
        const cols = ['#5c6bc0', '#8d6e63', '#26a69a', '#ef5350', '#7e57c2', '#42a5f5'];
        for (let i = 0; i < 6; i++) { const bw = w / 6 - 6 * k, bh = (90 + (i * 37) % 80) * k, x = i * w / 6 + 3 * k; ctx.fillStyle = cols[i]; ctx.fillRect(x, piso - bh, bw, bh);
          ctx.fillStyle = noche ? '#ffe082' : 'rgba(255,255,255,.55)';
          for (let yy = piso - bh + 10 * k; yy < piso - 14 * k; yy += 20 * k) for (let xx = x + 8 * k; xx < x + bw - 10 * k; xx += 18 * k) ctx.fillRect(xx, yy, 8 * k, 10 * k); }
      } else if (lugar === 'mar') {
        ctx.fillStyle = noche ? '#7a6a45' : '#e6cf8f'; ctx.fillRect(0, h * .82, w, h * .18);
        ctx.strokeStyle = '#2e9d5b'; ctx.lineWidth = 7 * k; ctx.lineCap = 'round';
        [.08, .16, .9].forEach((x) => { ctx.beginPath(); ctx.moveTo(w * x, h * .86); for (let i = 1; i <= 6; i++) ctx.lineTo(w * x + (i % 2 ? 10 : -10) * k, h * .86 - i * 22 * k); ctx.stroke(); });
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2 * k;
        for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h * .7, (4 + rnd() * 8) * k, 0, 7); ctx.stroke(); }
        emoji(ctx, '🐠', w * .78, h * .3, 40 * k); emoji(ctx, '🐟', w * .25, h * .22, 30 * k);
      }
      if (noche && lugar !== 'espacio' && lugar !== 'mar') emoji(ctx, '🌙', w * .85, h * .16, 44 * k);
      if (det === 'con nieve') {
        ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(0, piso, w, h - piso);
        ctx.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, (1.5 + rnd() * 3) * k, 0, 7); ctx.fill(); }
      }
      if (det === 'con muchos colores') {
        const arco = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];
        ctx.lineWidth = 9 * k; arco.forEach((c, i) => { ctx.strokeStyle = c; ctx.globalAlpha = .75; ctx.beginPath(); ctx.arc(w * .5, h * .78, (210 - i * 10) * k, Math.PI, 0); ctx.stroke(); });
        ctx.globalAlpha = 1;
        for (let i = 0; i < 40; i++) { ctx.fillStyle = arco[i % 6]; ctx.fillRect(rnd() * w, rnd() * h, 6 * k, 6 * k); }
      }
      if (tarde && (lugar === 'espacio' || lugar === 'mar')) { ctx.fillStyle = 'rgba(255,120,60,.25)'; ctx.fillRect(0, 0, w, h); }
      /* sujeto y acción */
      let x = w * .48, y = h * .64, rot = 0;
      const s = 120 * k;
      if (accion === 'saltando') { y -= 60 * k; ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x, h * .86, 40 * k, 8 * k, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 4 * k; [-24, 0, 24].forEach((dx) => { ctx.beginPath(); ctx.moveTo(x + dx * k, y + 70 * k); ctx.lineTo(x + dx * k, y + 95 * k); ctx.stroke(); }); }
      if (accion === 'durmiendo') { rot = -Math.PI / 2; y += 18 * k; }
      if (accion === 'bailando') rot = .28;
      emoji(ctx, suj, x, y, s, rot);
      if (accion === 'durmiendo') { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#18213d'; ctx.lineWidth = 3 * k; ctx.font = '800 ' + (30 * k) + 'px "Baloo 2", sans-serif'; [['Z', 60, -60], ['z', 85, -88], ['z', 104, -110]].forEach(([t, dx, dy]) => { ctx.strokeText(t, x + dx * k, y + dy * k); ctx.fillText(t, x + dx * k, y + dy * k); }); }
      if (accion === 'leyendo un libro') emoji(ctx, '📖', x + 22 * k, y + 40 * k, 62 * k, -.12);
      if (accion === 'bailando') { emoji(ctx, '🎵', x - 85 * k, y - 50 * k, 36 * k); emoji(ctx, '🎶', x + 90 * k, y - 70 * k, 36 * k); }
    }

    function pintar(usuario) {
      const est = sel('estilo');
      cv.className = est[1];
      if (est[1] === 'e-pixel') {
        const p = document.createElement('canvas'); p.width = 96; p.height = 64; escena(p.getContext('2d'), 96, 64);
        g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H); g.drawImage(p, 0, 0, W, H); g.imageSmoothingEnabled = true;
      } else {
        escena(g, W, H);
        if (est[1] === 'e-acuarela') { const r = semilla(3); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,' + (.08 + r() * .12) + ')'; g.beginPath(); g.arc(r() * W, r() * H, 20 + r() * 50, 0, 7); g.fill(); } }
        if (est[1] === 'e-antigua') { const v = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .65); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,20,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H); }
        if (est[1] === 'e-caricatura') { g.strokeStyle = '#18213d'; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); }
      }
      const suj = sel('sujeto')[0];
      const texto = suj.charAt(0).toUpperCase() + suj.slice(1) + ' ' + sel('accion')[0] + ' ' + sel('lugar')[0] + ', ' + sel('detalle')[0] + ', estilo ' + est[0] + '.';
      $('.prompt-img', root).innerHTML = '<span class="aviso-sim">Prompt:</span><br>«' + esc(texto) + '»';
      if (usuario) { vistos.add(texto); if (vistos.size >= 3) Progreso.ganar('u3-estudio', 1); }
    }
    Object.keys(OP).forEach((k) => $('#est-' + k).addEventListener('change', () => pintar(true)));
    $('.sorpresa', root).addEventListener('click', () => { Object.keys(OP).forEach((k) => { $('#est-' + k).value = Math.floor(Math.random() * OP[k].length); }); pintar(true); });
    pintar(false);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => pintar(false));
  }

  /* ---------- 3.3 Detective de imágenes: encuentra los 5 errores ---------- */
  function detective() {
    const root = $('#act-detective-img'); if (!root) return;
    const ERRORES = [
      { id: 'mano', nom: 'Una mano con 6 dedos', por: 'Las IA de imágenes a menudo dibujan manos con dedos de más o de menos.', pista: 'Mira con atención las manos de la persona.' },
      { id: 'letrero', nom: 'Un letrero con letras revueltas', por: 'Dice «ESCEULA». Las letras dentro de imágenes de IA suelen salir mal escritas.', pista: 'Lee con cuidado lo que dice en la escuela.' },
      { id: 'sombra', nom: 'Una sombra al revés', por: 'El sol está a la izquierda, así que las sombras deben caer a la derecha. La del árbol apunta hacia el sol.', pista: 'Fíjate de qué lado está el sol y hacia dónde van las sombras.' },
      { id: 'reloj', nom: 'Un reloj con el número 13', por: 'Los relojes solo llegan al 12. Los objetos con reglas (relojes, teclados) suelen salir con errores.', pista: 'Revisa los números del reloj.' },
      { id: 'patas', nom: 'Un perro con 5 patas', por: 'A veces la IA agrega o quita partes del cuerpo sin darse cuenta.', pista: 'Cuenta las patas de los animales.' }
    ];
    const encontrados = new Set();
    root.innerHTML = '<div class="detective"><div class="escena-svg">' + SVG_ESCENA + '</div>' +
      '<div style="display:grid;gap:12px"><b class="cuenta-err" aria-live="polite"></b><ul class="hallazgos"></ul>' +
      '<div class="fila"><button class="btn sec chico pista-btn">Dame una pista</button><button class="btn sec chico reiniciar">Volver a empezar</button></div><div class="msg-pista"></div></div></div>';
    const svg = $('svg', root);
    function lista() {
      $('.cuenta-err', root).textContent = 'Encontraste ' + encontrados.size + ' de ' + ERRORES.length + ' errores';
      $('.hallazgos', root).innerHTML = ERRORES.map((e, i) => encontrados.has(e.id)
        ? '<li class="encontrado"><span>✔</span><div><b>' + esc(e.nom) + '</b><br>' + esc(e.por) + '</div></li>'
        : '<li><span>' + (i + 1) + '</span><div>???</div></li>').join('');
    }
    function marcar(id) {
      const z = $('.zona[data-z="' + id + '"]', svg); if (!z) return;
      const b = z.getBBox(); const ns = 'http://www.w3.org/2000/svg';
      const el = document.createElementNS(ns, 'ellipse');
      el.setAttribute('cx', b.x + b.width / 2); el.setAttribute('cy', b.y + b.height / 2); el.setAttribute('rx', b.width / 2 + 4); el.setAttribute('ry', b.height / 2 + 4);
      el.setAttribute('fill', 'none'); el.setAttribute('stroke', '#d6204e'); el.setAttribute('stroke-width', '4'); el.setAttribute('stroke-dasharray', '8 5');
      $('.marcas', svg).appendChild(el);
    }
    svg.addEventListener('click', (ev) => {
      const z = ev.target.closest && ev.target.closest('.zona');
      if (!z) { Sonido.asegurar(); Sonido.tic(); $('.msg-pista', root).innerHTML = '<div class="retro info"><span class="ico">🔎</span><p>Ahí todo se ve bien. ¡Sigue buscando!</p></div>'; return; }
      const id = z.dataset.z; if (encontrados.has(id)) return;
      encontrados.add(id); marcar(id); Sonido.asegurar(); Sonido.bien(); lista();
      $('.msg-pista', root).innerHTML = '';
      if (encontrados.size === ERRORES.length) { Progreso.ganar('u3-detective', 1); confeti(); Sonido.fin(); $('.msg-pista', root).innerHTML = '<div class="retro ok"><span class="ico">🏆</span><p>¡Los encontraste todos! Cuando veas una imagen sospechosa, busca estas pistas.</p></div>'; }
    });
    $('.pista-btn', root).addEventListener('click', () => {
      const f = ERRORES.find((e) => !encontrados.has(e.id));
      $('.msg-pista', root).innerHTML = f ? '<div class="retro info"><span class="ico">💡</span><p>' + esc(f.pista) + '</p></div>' : '';
    });
    $('.reiniciar', root).addEventListener('click', () => { encontrados.clear(); $('.marcas', svg).innerHTML = ''; lista(); $('.msg-pista', root).innerHTML = ''; });
    lista();
  }

  const SVG_ESCENA = '<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Escena de un parque frente a una escuela, con cinco errores escondidos">' +
    '<rect width="600" height="272" fill="#bfe3ff"/><rect y="268" width="600" height="112" fill="#8fd37a"/>' +
    '<g fill="#fff" opacity=".9"><ellipse cx="200" cy="62" rx="40" ry="15"/><ellipse cx="228" cy="52" rx="28" ry="15"/><ellipse cx="470" cy="40" rx="36" ry="12"/><ellipse cx="495" cy="34" rx="22" ry="11"/></g>' +
    '<g stroke="#ffc21a" stroke-width="5" stroke-linecap="round"><line x1="60" y1="10" x2="60" y2="18"/><line x1="60" y1="102" x2="60" y2="110"/><line x1="10" y1="60" x2="18" y2="60"/><line x1="102" y1="60" x2="110" y2="60"/><line x1="25" y1="25" x2="31" y2="31"/><line x1="89" y1="89" x2="95" y2="95"/><line x1="95" y1="25" x2="89" y2="31"/><line x1="25" y1="95" x2="31" y2="89"/></g>' +
    '<circle cx="60" cy="60" r="32" fill="#ffd23f"/>' +
    /* escuela */
    '<rect x="320" y="120" width="200" height="150" fill="#f4a259" stroke="#7a4a1d" stroke-width="3"/>' +
    '<polygon points="308,123 420,70 532,123" fill="#c8553d" stroke="#7a4a1d" stroke-width="3" stroke-linejoin="round"/>' +
    '<rect x="345" y="132" width="150" height="32" rx="4" fill="#fff" stroke="#7a4a1d" stroke-width="2"/>' +
    '<text x="420" y="155" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="20" fill="#18213d" letter-spacing="2">ESCEULA</text>' +
    '<rect x="336" y="180" width="40" height="34" fill="#cfe9ff" stroke="#7a4a1d" stroke-width="2"/><line x1="356" y1="180" x2="356" y2="214" stroke="#7a4a1d" stroke-width="2"/>' +
    '<rect x="398" y="205" width="44" height="65" fill="#7a4a1d"/><circle cx="433" cy="240" r="3" fill="#ffd23f"/>' +
    '<circle cx="482" cy="196" r="25" fill="#fff" stroke="#18213d" stroke-width="3"/>' +
    '<g font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="10" fill="#18213d" text-anchor="middle"><text x="482" y="183">13</text><text x="499" y="200">3</text><text x="482" y="216">6</text><text x="465" y="200">9</text></g>' +
    '<line x1="482" y1="196" x2="482" y2="186" stroke="#18213d" stroke-width="3" stroke-linecap="round"/><line x1="482" y1="196" x2="491" y2="199" stroke="#18213d" stroke-width="2.5" stroke-linecap="round"/>' +
    /* sombras: niño y perro bien (a la derecha); árbol mal (hacia el sol) */
    '<ellipse cx="262" cy="292" rx="32" ry="6" fill="#000" opacity=".18"/>' +
    '<ellipse cx="66" cy="292" rx="50" ry="7" fill="#000" opacity=".2"/>' +
    '<ellipse cx="448" cy="352" rx="46" ry="6" fill="#000" opacity=".18"/>' +
    /* árbol */
    '<rect x="110" y="200" width="18" height="92" fill="#8b5a2b"/>' +
    '<circle cx="119" cy="176" r="42" fill="#3f9b3f"/><circle cx="88" cy="200" r="26" fill="#3f9b3f"/><circle cx="150" cy="200" r="26" fill="#3f9b3f"/><circle cx="105" cy="160" r="10" fill="#57b857"/>' +
    /* niño saludando */
    '<g stroke="#18213d" stroke-width="5" stroke-linecap="round"><line x1="231" y1="262" x2="225" y2="290"/><line x1="241" y1="262" x2="247" y2="290"/></g>' +
    '<rect x="223" y="212" width="26" height="52" rx="9" fill="#1f5fd6"/>' +
    '<line x1="226" y1="222" x2="211" y2="252" stroke="#f2c29b" stroke-width="6" stroke-linecap="round"/>' +
    '<line x1="246" y1="221" x2="266" y2="190" stroke="#f2c29b" stroke-width="6" stroke-linecap="round"/>' +
    '<g stroke="#e0a77c" stroke-width="4" stroke-linecap="round"><line x1="270" y1="183" x2="258" y2="176"/><line x1="270" y1="183" x2="262" y2="169"/><line x1="270" y1="183" x2="268" y2="166"/><line x1="270" y1="183" x2="275" y2="166"/><line x1="270" y1="183" x2="281" y2="170"/><line x1="270" y1="183" x2="285" y2="177"/></g>' +
    '<circle cx="270" cy="184" r="7" fill="#f2c29b"/>' +
    '<circle cx="236" cy="197" r="15" fill="#f2c29b"/><path d="M221 193 Q236 176 251 193 Q244 186 236 187 Q228 186 221 193Z" fill="#3b2a1a"/>' +
    '<circle cx="231" cy="198" r="2" fill="#18213d"/><circle cx="241" cy="198" r="2" fill="#18213d"/><path d="M230 204 Q236 209 242 204" stroke="#18213d" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    /* perro con 5 patas */
    '<g fill="#c58b4e"><rect x="398" y="322" width="7" height="26" rx="3"/><rect x="413" y="322" width="7" height="26" rx="3"/><rect x="428" y="322" width="7" height="26" rx="3"/><rect x="446" y="322" width="7" height="26" rx="3"/><rect x="460" y="322" width="7" height="26" rx="3"/></g>' +
    '<ellipse cx="432" cy="318" rx="42" ry="16" fill="#c58b4e"/>' +
    '<path d="M391 312 Q376 296 382 288" stroke="#c58b4e" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<circle cx="478" cy="302" r="15" fill="#c58b4e"/><ellipse cx="472" cy="294" rx="6" ry="11" fill="#8a5a2b" transform="rotate(-20 472 294)"/>' +
    '<circle cx="483" cy="299" r="2.2" fill="#18213d"/><circle cx="492" cy="305" r="3" fill="#18213d"/>' +
    /* zonas para tocar (invisibles) */
    '<g fill="transparent" pointer-events="all" style="cursor:pointer">' +
    '<circle class="zona" data-z="mano" cx="271" cy="177" r="24"/>' +
    '<rect class="zona" data-z="letrero" x="342" y="129" width="156" height="38"/>' +
    '<ellipse class="zona" data-z="sombra" cx="64" cy="292" rx="58" ry="16"/>' +
    '<circle class="zona" data-z="reloj" cx="482" cy="196" r="29"/>' +
    '<rect class="zona" data-z="patas" x="390" y="318" width="84" height="34"/>' +
    '</g><g class="marcas" pointer-events="none"></g></svg>';

  /* ---------- 3.3 Respeto y honestidad con multimedia ---------- */
  function respeto() {
    const root = $('#act-respeto'); if (!root) return;
    MiniQuiz(root, {
      id: 'u3-respeto',
      preguntas: [
        { em: '🎙️', escena: 'Un amigo quiere usar una app para copiar la voz de la maestra y hacer que «diga» cosas chistosas.', pregunta: '¿Qué opinas?', ops: ['Está bien si es broma', 'No: es la voz de otra persona y no dio permiso', 'Solo si lo comparte en secreto', 'Sí, las voces son de todos'], c: 1, por: 'La voz y la cara de cada persona le pertenecen. Imitarlas sin permiso puede lastimar y engañar.' },
        { em: '🖼️', escena: 'Hiciste la portada de tu exposición con una herramienta de IA.', pregunta: '¿Qué haces?', ops: ['Digo que la dibujé yo', 'No digo nada', 'Escribo: «imagen creada con ayuda de IA»', 'Le pongo la firma de un artista famoso'], c: 2, por: 'Decir cómo hiciste tu trabajo es honesto y justo con quienes dibujan a mano.' },
        { em: '📹', escena: 'Ves un video donde una persona famosa dice algo muy raro y escandaloso.', pregunta: '¿Qué haces?', ops: ['Lo comparto rápido con todos', 'Pienso que podría ser un deepfake y lo verifico', 'Lo creo porque es un video', 'Le agrego cosas y lo reenvío'], c: 1, por: 'Hoy la IA puede imitar caras y voces. Antes de creer o compartir, verifica en fuentes confiables.' },
        { em: '🎨', escena: 'Tu compañera dibujó a mano un personaje increíble.', pregunta: '¿Qué piensas?', ops: ['La IA lo haría mejor, su dibujo no importa', 'Lo copio con IA y digo que es mío', 'Valoro su trabajo: la creatividad humana es única', 'Me burlo de su dibujo'], c: 2, por: 'Las ideas y el esfuerzo de las personas valen mucho. La IA no reemplaza la imaginación humana.' },
        { em: '🎵', escena: 'Necesitas música para el video de tu proyecto escolar.', pregunta: '¿Qué opción es responsable?', ops: ['Usar música libre o creada con IA, y decirlo en los créditos', 'Copiar una canción famosa sin permiso', 'Grabar la canción de un artista y decir que es tuya', 'No importa, nadie se da cuenta'], c: 0, por: 'Respetar el trabajo de los artistas y dar créditos es parte de crear con responsabilidad.' }
      ],
      mensajeFinal: '¡Creas con respeto y honestidad!'
    });
  }

  window.IA.u3 = function () { ruido(); estudio(); detective(); respeto(); };
})();

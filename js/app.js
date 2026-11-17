/* Exploradores de la IA — navegación entre vistas e inicio */
(function () {
  'use strict';
  const { $, $$, chispa, Progreso } = window.IA;
  const VISTAS = ['inicio', 'unidad-1', 'unidad-2', 'unidad-3', 'unidad-4', 'unidad-5', 'final', 'docente'];

  function mostrar() {
    let v = (location.hash || '').replace('#', '');
    if (!VISTAS.includes(v)) v = 'inicio';
    $$('.vista').forEach((s) => s.classList.toggle('activa', s.id === 'v-' + v));
    $$('.nav a').forEach((a) => { const act = a.getAttribute('href') === '#' + v; a.classList.toggle('activa', act); if (act) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const a = $('.nav a.activa'); if (a && a.scrollIntoView) { try { a.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { /* nada */ } }
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent('vista', { detail: v }));
  }

  function iniciar() {
    Progreso.cargar();
    /* Mascota en los lugares marcados */
    $$('[data-chispa]').forEach((el) => { el.innerHTML = chispa(el.dataset.chispa || 'feliz'); });
    /* Tarjetas que se voltean */
    $$('.volteo').forEach((b) => b.addEventListener('click', () => { b.classList.toggle('girada'); b.setAttribute('aria-pressed', b.classList.contains('girada')); }));
    /* Subnavegación dentro de cada unidad */
    $$('[data-ir]').forEach((b) => b.addEventListener('click', () => { const t = document.getElementById(b.dataset.ir); if (t) t.scrollIntoView({ behavior: IA.reducido() ? 'auto' : 'smooth', block: 'start' }); }));
    /* Reiniciar progreso con confirmación dentro de la página */
    const rb = $('#reiniciar'); if (rb) rb.addEventListener('click', () => {
      if (rb.dataset.confirmar === '1') { Progreso.reiniciar(); rb.dataset.confirmar = ''; rb.textContent = 'Reiniciar mis estrellas'; IA.aviso('Progreso reiniciado'); return; }
      rb.dataset.confirmar = '1'; rb.textContent = '¿Seguro? Toca otra vez para borrar';
      setTimeout(() => { rb.dataset.confirmar = ''; rb.textContent = 'Reiniciar mis estrellas'; }, 4000);
    });
    const actividades = ['u1', 'u2', 'u3', 'u4', 'u5'];
    actividades.forEach((u) => { try { IA[u] && IA[u](); } catch (e) { console.error('Error al iniciar ' + u, e); } });
    try { IA.iniciarKahoots(); } catch (e) { console.error('Error al iniciar quizzes', e); }
    Progreso.pintar();
    window.addEventListener('hashchange', mostrar);
    mostrar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

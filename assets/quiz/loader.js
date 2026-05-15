/* ===================================================================
   assets/quiz/loader.js — v6.1.0 · Boot loader SIMPLE
   ===================================================================
   Simplificación radical (decisión Eduardo): el loader anterior tenía
   scanner + corners + label + migración FLIP del logo al HUD con un gap
   de 1.4s que causaba parpadeo + conflicto transition/keyframes.

   Ahora: fondo sólido + logo centrado · fade-in con scale sutil ·
   se mantiene un momento · fade-out limpio del contenedor completo.
   Una sola transición de opacity · cero keyframes competidores · cero
   migración · cero gap visible. Imposible que parpadee.
   =================================================================== */
(function(){
  'use strict';

  var FAST_PATH = sessionStorage.getItem('ibisne.booted') === '1';

  document.body.classList.add('is-booting');

  var loader = document.createElement('div');
  loader.className = 'boot-loader';
  loader.id = 'boot-loader';
  loader.innerHTML = '<div class="boot-logo" id="boot-logo">'
    + '<img src="brand/iBisne_blanco.png" alt="iBisne">'
    + '</div>';
  document.body.appendChild(loader);

  function done(removeDelay){
    loader.classList.add('is-done');           // CSS: opacity → 0 (una sola transición)
    document.body.classList.remove('is-booting');
    sessionStorage.setItem('ibisne.booted', '1');
    setTimeout(function(){ try { loader.remove(); } catch(_){} }, removeDelay);
  }

  if (FAST_PATH) {
    // Visitas siguientes · destello mínimo (no quemar al usuario)
    requestAnimationFrame(function(){
      setTimeout(function(){ done(220); }, 120);
    });
    return;
  }

  // Primera carga · logo entra (CSS bootLogoIn) · se mantiene · sale.
  // VISIBLE: 650ms · FADE-OUT: 360ms (transición CSS del .boot-loader)
  var VISIBLE = 650;

  function whenReady(cb){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cb);
    else cb();
  }

  whenReady(function(){
    // Esperamos a que el contenido esté pintado + el momento de marca,
    // luego fade-out. requestAnimationFrame garantiza un frame pintado.
    requestAnimationFrame(function(){
      setTimeout(function(){ done(420); }, VISIBLE);
    });
  });
})();

/* ===================================================================
   assets/quiz/loader.js — Boot loader: scanner + logo central que
   FÍSICAMENTE viaja hasta su posición en el HUD y se queda ahí.

   v3.3: animamos el <img> directamente con transform-origin: 0 0,
   no el contenedor flex, para que la geometría sea exacta (sin salto).
   =================================================================== */
(function(){
  'use strict';

  // Skip en navegaciones siguientes (no quemar al usuario con la animación)
  var FAST_PATH = sessionStorage.getItem('ibisne.booted') === '1';

  // Marcamos body: HUD oculto hasta que el boot logo llegue a su lugar
  document.body.classList.add('is-booting');

  var loader = document.createElement('div');
  loader.className = 'boot-loader';
  loader.id = 'boot-loader';
  loader.innerHTML = ''
    + '<div class="boot-scan" aria-hidden="true"></div>'
    + '<div class="boot-corners" aria-hidden="true">'
      + '<span></span><span></span><span></span><span></span>'
    + '</div>'
    + '<div class="boot-logo" id="boot-logo">'
      + '<img src="brand/iBisne_blanco.png" alt="iBisne">'
      + '<div class="label">INICIANDO<span class="blink">…</span></div>'
    + '</div>';
  document.body.appendChild(loader);

  if (FAST_PATH) {
    requestAnimationFrame(function(){
      loader.style.transition = 'opacity 0.18s ease';
      loader.classList.add('is-done');
      document.body.classList.remove('is-booting');
      setTimeout(function(){ loader.remove(); }, 220);
    });
    return;
  }

  var SCAN_DURATION = 1400;
  var CLEAR_DURATION = 240;
  var TRAVEL = 900;

  function whenReady(cb){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cb);
    else cb();
  }

  whenReady(function(){
    setTimeout(migrateLogoToHud, SCAN_DURATION);
  });

  function migrateLogoToHud(){
    var bootLogo = document.getElementById('boot-logo');
    var bootImg  = bootLogo && bootLogo.querySelector('img');
    var hudBrand = document.getElementById('hud-brand') || document.querySelector('.hud-brand');
    var hudImg   = hudBrand && hudBrand.querySelector('img.hud-logo');

    if (!bootLogo || !hudBrand || !hudImg || !bootImg) {
      document.body.classList.remove('is-booting');
      loader.classList.add('is-done');
      sessionStorage.setItem('ibisne.booted', '1');
      setTimeout(function(){ loader.remove(); }, 500);
      return;
    }

    // Fase 1: limpiar decorativos (scanner, corners, label) ANTES de la migración
    loader.classList.add('is-clearing');

    setTimeout(function(){
      // Pre-medición: el bootImg sigue en su posición original (la limpieza solo cambia opacidad)
      var fromRect = bootImg.getBoundingClientRect();
      var toRect   = hudImg.getBoundingClientRect();

      // FLIP con transform-origin: 0 0 · matemática exacta sin importar el contenedor
      // El img empieza en (fromRect.left, fromRect.top) con dimensiones (fromRect.width, fromRect.height).
      // Lo movemos al top-left de toRect y lo escalamos al ratio de tamaño.
      var dx = toRect.left - fromRect.left;
      var dy = toRect.top  - fromRect.top;
      var scale = toRect.width / fromRect.width;

      // Aplicar transform al IMG directamente (no al contenedor flex) — origin 0 0
      bootImg.style.transformOrigin = '0 0';
      bootImg.style.willChange = 'transform';
      // Forzar reflow antes de aplicar la transición para que el browser entienda el "from"
      bootImg.getBoundingClientRect();
      bootImg.style.transition = 'transform ' + TRAVEL + 'ms cubic-bezier(0.65, 0, 0.35, 1)';
      bootImg.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + scale + ')';

      // El background del loader se desvanece progresivamente durante el viaje
      loader.classList.add('is-migrating');

      // Handover: cuando el img llega a destino, mostramos el HUD y removemos el loader
      setTimeout(function(){
        // El HUD logo aparece exactamente donde quedó el bootImg → handover invisible
        document.body.classList.remove('is-booting');
        loader.classList.add('is-done');
        setTimeout(function(){
          loader.remove();
          sessionStorage.setItem('ibisne.booted', '1');
        }, 280);
      }, TRAVEL);
    }, CLEAR_DURATION);
  }
})();

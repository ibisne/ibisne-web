/* ===================================================================
   assets/quiz/loader.js — Boot loader: scanner + logo central que
   FÍSICAMENTE viaja hasta su posición en el HUD y se queda ahí.
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
    // Navegación interna: fade rápido sin animación cinematográfica
    requestAnimationFrame(function(){
      loader.style.transition = 'opacity 0.18s ease';
      loader.classList.add('is-done');
      document.body.classList.remove('is-booting');
      setTimeout(function(){ loader.remove(); }, 220);
    });
    return;
  }

  // Primera visita en esta sesión: animación completa
  var SCAN_DURATION = 1500;   // tiempo del scanner antes de iniciar migración
  var TRAVEL = 950;           // duración del viaje del logo (más largo = más visible)

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

    if (!bootLogo || !hudBrand || !hudImg) {
      // Sin destino: simple fade
      document.body.classList.remove('is-booting');
      loader.classList.add('is-done');
      sessionStorage.setItem('ibisne.booted', '1');
      setTimeout(function(){ loader.remove(); }, 500);
      return;
    }

    // Fade out de los elementos decorativos del scanner (corners, label, líneas)
    // ANTES de que arranque el viaje, para que el logo no compita visualmente.
    loader.classList.add('is-clearing');

    // Pequeña pausa para que se desvanezcan los decorativos antes del viaje
    setTimeout(function(){
      // FLIP: calcula delta exacto entre posición actual (centro) y posición destino (HUD)
      var fromRect = bootImg.getBoundingClientRect();
      var toRect   = hudImg.getBoundingClientRect();

      var dx = (toRect.left + toRect.width/2) - (fromRect.left + fromRect.width/2);
      var dy = (toRect.top  + toRect.height/2) - (fromRect.top + fromRect.height/2);
      var scale = toRect.width / fromRect.width;

      bootLogo.style.setProperty('--tx', dx + 'px');
      bootLogo.style.setProperty('--ty', dy + 'px');
      bootLogo.style.setProperty('--scale', scale);

      // El boot loader se vuelve transparente para que se vea el HUD detrás
      loader.classList.add('is-migrating');

      // En cuanto el logo llega: mostramos el HUD logo en el mismo lugar (handover invisible)
      // y removemos el boot loader.
      setTimeout(function(){
        document.body.classList.remove('is-booting'); // HUD aparece (instantáneo en CSS)
        // Tiny crossfade — boot logo desaparece, HUD logo ya está ahí
        loader.classList.add('is-done');
        setTimeout(function(){
          loader.remove();
          sessionStorage.setItem('ibisne.booted', '1');
        }, 280);
      }, TRAVEL);
    }, 220); // tiempo para que se aclaren los decorativos
  }
})();

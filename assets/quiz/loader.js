/* ===================================================================
   assets/quiz/loader.js — Boot loader con scanner + logo central
   que migra (FLIP) al HUD al terminar.
   =================================================================== */
(function(){
  'use strict';

  // Si ya cargó al menos una vez en esta sesión, saltar el boot loader.
  // Comporta: 1ra visita → animación completa. Siguientes navegaciones internas
  // del mismo navegador → entrada sin loader.
  var FAST_PATH = sessionStorage.getItem('ibisne.booted') === '1';

  // Marcamos body para que el HUD se oculte hasta terminar el boot.
  document.body.classList.add('is-booting');

  // Inyectar HTML del loader
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
    // Saltar animación en navegaciones siguientes — fade out rápido
    requestAnimationFrame(function(){
      loader.style.transition = 'opacity 0.2s ease';
      loader.classList.add('is-done');
      document.body.classList.remove('is-booting');
      setTimeout(function(){ loader.remove(); }, 250);
    });
    return;
  }

  // Primera visita: animación completa de scanner
  var DURATION = 1800;     // tiempo total visible (matches CSS scanSweep)
  var MIGRATION = 700;     // tiempo del FLIP

  // Espera a que el HUD esté en DOM (debería ya estar — el script carga al final)
  function whenReady(cb){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  }

  whenReady(function(){
    setTimeout(function(){
      migrateLogoToHud();
    }, DURATION);
  });

  function migrateLogoToHud(){
    var bootLogo = document.getElementById('boot-logo');
    var bootImg  = bootLogo && bootLogo.querySelector('img');
    var hudBrand = document.getElementById('hud-brand') || document.querySelector('.hud-brand');
    var hudImg   = hudBrand && hudBrand.querySelector('img.hud-logo');

    if (!bootLogo || !hudBrand || !hudImg) {
      // Fallback sin animación FLIP
      loader.classList.add('is-done');
      document.body.classList.remove('is-booting');
      sessionStorage.setItem('ibisne.booted', '1');
      setTimeout(function(){ loader.remove(); }, 500);
      return;
    }

    // FLIP: calcula delta entre posición actual (centro) y posición destino (HUD)
    var fromRect = bootImg.getBoundingClientRect();
    var toRect   = hudImg.getBoundingClientRect();

    var dx = (toRect.left + toRect.width/2) - (fromRect.left + fromRect.width/2);
    var dy = (toRect.top  + toRect.height/2) - (fromRect.top + fromRect.height/2);
    var scale = toRect.width / fromRect.width;

    bootLogo.style.setProperty('--tx', dx + 'px');
    bootLogo.style.setProperty('--ty', dy + 'px');
    bootLogo.style.setProperty('--scale', scale);

    // Activar migración (CSS hace el resto via transición)
    loader.classList.add('is-migrating');
    document.body.classList.remove('is-booting');

    setTimeout(function(){
      loader.classList.add('is-done');
      setTimeout(function(){
        loader.remove();
        sessionStorage.setItem('ibisne.booted', '1');
      }, 500);
    }, MIGRATION - 50);
  }
})();

/* ===================================================================
   assets/quiz/icons.js — Set de iconos SVG line→"modo gordito"
   line: stroke 1.6px · fill: mismo path con stroke 2.8px (más bold)
   Mantiene la silueta reconocible en ambos estados.
   =================================================================== */

window.IBISNE_ICONS = (function(){

  // helper: genera ambas variantes (line/fill) desde un único path body
  function variant(body, fillExtras){
    const lineSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
    const fillSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + body + (fillExtras || '') + '</svg>';
    return { line: lineSvg, fill: fillSvg };
  }

  const icons = {
    // ─── PRODUCTOS (Rama B) ────────────────────────────────────────
    biolink:   variant('<circle cx="12" cy="6" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="18" r="2.4"/>',
                       '<circle cx="12" cy="6" r="2.4" fill="currentColor"/><circle cx="12" cy="12" r="2.4" fill="currentColor"/><circle cx="12" cy="18" r="2.4" fill="currentColor"/>'),

    landing:   variant('<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><line x1="3.5" y1="8" x2="20.5" y2="8"/><line x1="7" y1="13" x2="17" y2="13"/><line x1="7" y1="16.5" x2="13" y2="16.5"/>'),

    leads:     variant('<path d="M3.5 4 L20.5 4 L14 13 L14 19.5 L10 17.5 L10 13 Z"/>'),

    sitio:     variant('<rect x="3.5" y="4" width="17" height="16" rx="1.5"/><line x1="3.5" y1="9" x2="20.5" y2="9"/><circle cx="6.5" cy="6.5" r="0.6" fill="currentColor"/><circle cx="9" cy="6.5" r="0.6" fill="currentColor"/><circle cx="11.5" cy="6.5" r="0.6" fill="currentColor"/>'),

    chatbot:   variant('<path d="M4 5 H20 a1 1 0 0 1 1 1 V15 a1 1 0 0 1 -1 1 H13 L9 20 V16 H4 a1 1 0 0 1 -1 -1 V6 a1 1 0 0 1 1 -1 Z"/><circle cx="9" cy="10.5" r="0.9" fill="currentColor"/><circle cx="15" cy="10.5" r="0.9" fill="currentColor"/>'),

    ecommerce: variant('<path d="M3 4 H6 L8 16 H20 L22 8 H8"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>'),

    app:       variant('<rect x="6.5" y="2.5" width="11" height="19" rx="2"/><line x1="10" y1="18" x2="14" y2="18"/>'),

    saas:      variant('<rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/>'),

    otro:      variant('<line x1="12" y1="4.5" x2="12" y2="19.5"/><line x1="4.5" y1="12" x2="19.5" y2="12"/>'),

    // ─── TIPO DE NEGOCIO (Rama A) ──────────────────────────────────
    dtc:       variant('<path d="M3 8 L12 4 L21 8 V18 L12 22 L3 18 Z"/><path d="M3 8 L12 12 L21 8"/><line x1="12" y1="12" x2="12" y2="22"/>'),

    saasbiz:   variant('<ellipse cx="12" cy="6" rx="7.5" ry="2.5"/><path d="M4.5 6 V12 a7.5 2.5 0 0 0 15 0 V6"/><path d="M4.5 12 V18 a7.5 2.5 0 0 0 15 0 V12"/>'),

    servicio:  variant('<rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M9 8 V5.5 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 V8"/><line x1="3" y1="13" x2="21" y2="13"/>'),

    marketplace: variant('<circle cx="6" cy="6" r="2.6"/><circle cx="18" cy="6" r="2.6"/><circle cx="12" cy="18" r="2.6"/><line x1="8" y1="8" x2="11" y2="16"/><line x1="16" y1="8" x2="13" y2="16"/><line x1="8.5" y1="6" x2="15.5" y2="6"/>'),

    educacion: variant('<path d="M3 7.5 L12 4 L21 7.5 L12 11 Z"/><path d="M6 9 V14 a6 2.5 0 0 0 12 0 V9"/><line x1="20.5" y1="7.5" x2="20.5" y2="12.5"/><circle cx="20.5" cy="13.5" r="1" fill="currentColor"/>'),

    // ─── PLATAFORMAS APP (iOS / Android) ────────────────────────────
    // iOS: manzana grande con mordida y hoja, clarísima
    ios: variant('<path d="M17 14 c0 -2 1.4 -3 2.2 -3.4 c-1 -1.5 -2.6 -1.7 -3.2 -1.7 c-1.4 -0.1 -2.7 0.8 -3.4 0.8 c-0.7 0 -1.8 -0.8 -3 -0.8 c-1.5 0 -3 0.9 -3.7 2.3 c-1.6 2.7 -0.4 6.8 1.1 9 c0.8 1.1 1.7 2.3 2.9 2.3 c1.1 0 1.6 -0.7 3 -0.7 c1.4 0 1.8 0.7 3 0.7 c1.2 0 2 -1.1 2.8 -2.2 c0.9 -1.3 1.3 -2.5 1.3 -2.6 c-0.1 0 -2.5 -1 -2.5 -3.7 Z"/><path d="M14.5 6.5 c0.7 -0.8 1.1 -2 1 -3 c-1 0 -2.1 0.6 -2.7 1.4 c-0.6 0.7 -1.1 1.9 -1 2.9 c1.1 0.1 2.1 -0.5 2.7 -1.3 Z"/>',
      '<path d="M17 14 c0 -2 1.4 -3 2.2 -3.4 c-1 -1.5 -2.6 -1.7 -3.2 -1.7 c-1.4 -0.1 -2.7 0.8 -3.4 0.8 c-0.7 0 -1.8 -0.8 -3 -0.8 c-1.5 0 -3 0.9 -3.7 2.3 c-1.6 2.7 -0.4 6.8 1.1 9 c0.8 1.1 1.7 2.3 2.9 2.3 c1.1 0 1.6 -0.7 3 -0.7 c1.4 0 1.8 0.7 3 0.7 c1.2 0 2 -1.1 2.8 -2.2 c0.9 -1.3 1.3 -2.5 1.3 -2.6 c-0.1 0 -2.5 -1 -2.5 -3.7 Z" fill="currentColor"/>'),

    // Android: bugdroid clásico (cabeza ovalada + antenas + ojos + cuerpo)
    android: variant('<path d="M5 12 a7 7 0 0 1 14 0 Z"/><circle cx="9" cy="9.5" r="0.7" fill="currentColor"/><circle cx="15" cy="9.5" r="0.7" fill="currentColor"/><line x1="7" y1="5" x2="8.5" y2="7.5"/><line x1="17" y1="5" x2="15.5" y2="7.5"/><rect x="6" y="13" width="12" height="6" rx="0.5"/><rect x="3" y="13" width="2" height="5" rx="1"/><rect x="19" y="13" width="2" height="5" rx="1"/><rect x="8" y="19" width="2" height="3" rx="1"/><rect x="14" y="19" width="2" height="3" rx="1"/>'),

    // Híbrida: dos teléfonos lado a lado con flecha de sincronización
    hybrid: variant('<rect x="2.5" y="4" width="8" height="16" rx="1.5"/><rect x="13.5" y="4" width="8" height="16" rx="1.5"/><line x1="4.5" y1="17.5" x2="8.5" y2="17.5"/><line x1="15.5" y1="17.5" x2="19.5" y2="17.5"/><polyline points="11 10 13 12 11 14"/><polyline points="13 10 11 12 13 14"/>'),

    // No-code: bloques con + central (Lego-style)
    nocode: variant('<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="17" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="17" r="1" fill="currentColor"/><circle cx="17" cy="17" r="1" fill="currentColor"/>'),

    // Grid limpio · trigger del panel mobile (resumen + redes + prefs)
    grid: variant('<rect x="3" y="3" width="8" height="8" rx="1.2"/><rect x="13" y="3" width="8" height="8" rx="1.2"/><rect x="3" y="13" width="8" height="8" rx="1.2"/><rect x="13" y="13" width="8" height="8" rx="1.2"/>'),

    // ─── UNIVERSALES y misc ─────────────────────────────────────────
    palette: variant('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="17" cy="13.5" r="1.2" fill="currentColor"/><path d="M12 21 a3 3 0 0 1 0 -6 a2 2 0 0 0 0 -4"/>'),

    clock: variant('<circle cx="12" cy="12" r="8"/><polyline points="12 7 12 12 15 14"/>'),

    wrench: variant('<path d="M14 6 a4 4 0 1 1 4 4 L11 17 L7 13 Z"/><line x1="9" y1="15" x2="5" y2="19"/><line x1="14" y1="6" x2="11" y2="9"/>'),

    star: variant('<polygon points="12 3 14.5 9.5 21 10 16 14.5 17.5 21 12 17.5 6.5 21 8 14.5 3 10 9.5 9.5"/>'),

    shield: variant('<path d="M12 3 L20 6 V12 a8 8 0 0 1 -8 8 a8 8 0 0 1 -8 -8 V6 Z"/>'),

    // ─── TIPOS FUNCIONALES DE APP ───────────────────────────────────
    info_app: variant('<rect x="4" y="4" width="16" height="16" rx="1.5"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="17" y2="13"/><line x1="7" y1="17" x2="13" y2="17"/>'),

    login: variant('<circle cx="12" cy="9" r="3.5"/><path d="M5 20 a7 7 0 0 1 14 0"/>'),

    serverapp: variant('<rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/><circle cx="7" cy="7" r="0.7" fill="currentColor"/><circle cx="7" cy="17" r="0.7" fill="currentColor"/><line x1="10" y1="7" x2="17" y2="7"/><line x1="10" y1="17" x2="17" y2="17"/>'),

    fintech: variant('<rect x="3" y="6" width="18" height="13" rx="1.5"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="6" y="13" width="5" height="2.5" rx="0.5"/><circle cx="17" cy="15" r="1.5" fill="currentColor"/>'),

    // ─── CLASIFICADOR ───────────────────────────────────────────────
    partnership: variant('<path d="M2 16 L7 8 L12 13 L17 8 L22 16"/><circle cx="7" cy="8" r="1.3"/><circle cx="17" cy="8" r="1.3"/><circle cx="12" cy="13" r="1.3"/>'),

    service:   variant('<rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M9 8 V5.5 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 V8"/><line x1="3" y1="13" x2="21" y2="13"/>'),

    explore:   variant('<circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="20.5" y2="20.5"/>'),

    // ─── HUD UI ICONS ───────────────────────────────────────────────
    instagram: { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.7" fill="currentColor"/></svg>' },
    linkedin:  { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="10" x2="7" y2="17"/><circle cx="7" cy="7" r="0.8" fill="currentColor"/><path d="M11 17 V10 M11 13 a3 3 0 0 1 6 0 V17"/></svg>' },
    x:         { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>' },
    whatsapp:  { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21 L4.5 16 A8 8 0 1 1 8 19.5 Z"/><path d="M9 9 q0 4 6 6"/></svg>' },
    sun:       { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="6.5" y2="6.5"/><line x1="17.5" y1="17.5" x2="19" y2="19"/><line x1="5" y1="19" x2="6.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="19" y2="5"/></svg>' },
    moon:      { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14 A8 8 0 1 1 10 4 a6 6 0 0 0 10 10 Z"/></svg>' },
    play:      { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 L19 12 L7 20 Z"/></svg>' },
    pause:     { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' },
    menu:      { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>' },
    close:     { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>' },
    arrow:     { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/></svg>' },
    chevron:   { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' },
    plus:      { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg>' },
    edit:      { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5 L19.5 9.5 L8 21 L3 21 L3 16 Z"/><line x1="13" y1="6" x2="18" y2="11"/></svg>' },
    minus:     { line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>' },
  };

  icons.get = function(id, v){
    v = v || 'line';
    const e = this[id];
    if (!e) return '';
    return e[v] || e.line || '';
  };
  icons.card = function(id){
    const e = this[id];
    if (!e) return '';
    return '<span class="line">' + (e.line || '') + '</span><span class="fill">' + (e.fill || e.line || '') + '</span>';
  };

  return icons;
})();

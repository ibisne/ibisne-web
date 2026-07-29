#!/usr/bin/env python3
"""
Generador estático del sitio iBisne (System D · Dossier oscuro).
Ensambla HTML estático desde plantillas + data. Salida 100% estática (Vercel).

Uso:  python build.py
Salida: home-dossier.html + /servicios /portafolio /inversion /por-que-ibisne
        /estudio /insights /contacto /legal (carpetas con index.html = URLs limpias).
No toca index.html (mantenimiento live) hasta el switch final.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CV = ROOT.parent / "ibisne-cv" / "cv-data.json"

# ---------------------------------------------------------------- sprite
SPRITE = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<symbol id="i-arw" viewBox="0 0 24 24"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></symbol>
<symbol id="i-arwr" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m2 12.5 9.17 4.17a2 2 0 0 0 1.66 0L22 12.5"/><path d="m2 17.5 9.17 4.17a2 2 0 0 0 1.66 0L22 17.5"/></symbol>
<symbol id="i-trend" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></symbol>
<symbol id="i-coins" viewBox="0 0 24 24"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></symbol>
<symbol id="i-cms" viewBox="0 0 24 24"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></symbol>
<symbol id="i-contrast" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-lang" viewBox="0 0 24 24"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></symbol>
<symbol id="i-gauge" viewBox="0 0 24 24"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></symbol>
<symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></symbol>
<symbol id="i-cpu" viewBox="0 0 24 24"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></symbol>
<symbol id="i-zap" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>
<symbol id="i-spark" viewBox="0 0 24 24"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></symbol>
<symbol id="i-cart" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></symbol>
<symbol id="i-monitor" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></symbol>
<symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
<symbol id="i-db" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></symbol>
<symbol id="i-cloud" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></symbol>
<symbol id="i-blocks" viewBox="0 0 24 24"><rect width="7" height="7" x="14" y="3" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
<symbol id="i-filter" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></symbol>
<symbol id="i-wa" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></symbol>
<symbol id="i-fb" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></symbol>
<symbol id="i-ig" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></symbol>
<symbol id="i-moon" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></symbol>
<symbol id="i-down" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></symbol>
<symbol id="i-apple" viewBox="0 0 24 24"><path d="M17.05 12.04c-.03-2.6 2.12-3.84 2.22-3.9-1.21-1.78-3.1-2.02-3.77-2.05-1.6-.16-3.13.94-3.94.94-.82 0-1.72-.92-2.84-.9-1.46.02-2.81.85-3.56 2.16-1.52 2.63-.39 6.53 1.09 8.67.72 1.05 1.58 2.22 2.71 2.18 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.68.7 2.83.68 1.17-.02 1.91-1.06 2.62-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.87-2.3-3.46zM14.9 4.6c.6-.73 1.01-1.75.9-2.76-.87.03-1.92.58-2.54 1.31-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.56-1.22z"/></symbol>
<symbol id="i-android" viewBox="0 0 24 24"><path d="M6 8.5v7.2a1 1 0 0 0 1 1h.9v2.6a1.15 1.15 0 0 0 2.3 0v-2.6h3.6v2.6a1.15 1.15 0 0 0 2.3 0v-2.6h.9a1 1 0 0 0 1-1V8.5H6zM3.6 8.5a1.15 1.15 0 0 0-1.15 1.15v4.6a1.15 1.15 0 0 0 2.3 0v-4.6A1.15 1.15 0 0 0 3.6 8.5zm16.8 0a1.15 1.15 0 0 0-1.15 1.15v4.6a1.15 1.15 0 0 0 2.3 0v-4.6A1.15 1.15 0 0 0 20.4 8.5zM15.5 3.4l1.1-1.1a.35.35 0 0 0-.5-.5l-1.24 1.25A5.6 5.6 0 0 0 12 2.4c-.86 0-1.68.2-2.4.55L8.36 1.7a.35.35 0 1 0-.5.5l1.1 1.1A4.7 4.7 0 0 0 6.3 7.5h11.4a4.7 4.7 0 0 0-2.2-4.1zM9.6 5.8a.72.72 0 1 1 0-1.44.72.72 0 0 1 0 1.44zm4.8 0a.72.72 0 1 1 0-1.44.72.72 0 0 1 0 1.44z"/></symbol>
<symbol id="i-windows" viewBox="0 0 24 24"><path d="M3 5.75 10.4 4.6v6.9H3zM11.35 4.45 21 3v8.5h-9.65zM3 12.5h7.4v6.9L3 18.25zM11.35 12.5H21V21l-9.65-1.45z"/></symbol>
</svg>"""

def ic(name):
    return f'<svg class="ic"><use href="#i-{name}"/></svg>'


# ---------------------------------------------------------------- layout helpers (v24)
def gcls(n, dense=False):
    """Clases de rejilla derivadas del conteo de items, para que nunca queden huecos.

    Elige c tal que n % c == 0. Si no existe, elige c tal que (n-1) % c == 0 y
    promueve el primer item a fila completa. Los grids densos (fichas tecnicas)
    admiten 4 columnas; las cards con parrafo no, porque la medida de linea baja
    a ~32 caracteres: esas van 2x2 en contenedor estrecho.
    """
    if dense and n % 4 == 0:
        d, feat_d = 4, False          # ficha tecnica: 4 columnas dan ~37 caracteres, legible
    elif not dense and n == 4:
        d, feat_d = 2, False          # card con parrafo: 4 columnas darian ~32, ilegible
    elif n % 3 == 0:
        d, feat_d = 3, False
    elif (n - 1) % 3 == 0:
        d, feat_d = 3, True           # 10, 31: el primero ocupa fila completa
    elif n % 2 == 0:
        d, feat_d = 2, False
    else:
        d, feat_d = 3, True
    feat_t = (n % 2 == 1 and n > 2)   # tablet son 2 columnas: si sobra uno, se destaca
    out = ["g", f"g-{d}"]
    if feat_d:
        out.append("g-feat-d")
    if feat_t:
        out.append("g-feat-t")
    if not dense and n == 4:
        out.append("g-narrow")        # 2x2: 56 caracteres por linea
    return " ".join(out)


BGS = ["01", "02", "03", "04", "05"]

def bg_url(key):
    """Elige uno de los fondos de forma estable a partir de una clave."""
    return f"/assets/bg/{BGS[sum(ord(c) for c in key) % len(BGS)]}.webp"

def bg_for(key):
    """Fondo del hero interior, estable por pagina y alternado entre paginas."""
    return f'<div class="bgimg" style="background-image:url({bg_url(key)})" aria-hidden="true"></div>'

def insight_card(slug, title, cat):
    """Card de insight. La portada usa un fondo generico a proposito: son PLACEHOLDER
    hasta que el disenador de Eduardo entregue las definitivas (v26)."""
    return (f'<a class="icard" href="/insights/{slug}/">'
            f'<div class="cover" style="background-image:url({bg_url(slug)})"><span>{cat}</span></div>'
            f'<div class="body"><div class="date">{cat}</div><h3>{title}</h3>'
            f'<div class="by">por el equipo iBisne</div></div></a>')

# ---------------------------------------------------------------- nav / base
NAV = [
    ("Capacidades", "/servicios/", "servicios"),
    ("Cómo trabajamos", "/como-trabajamos/", "como-trabajamos"),
    ("Portafolio", "/portafolio/", "portafolio"),
    ("Inversión", "/inversion/", "inversion"),
    ("Estudio", "/estudio/", "estudio"),
    ("Insights", "/insights/", "insights"),
]
HOME = "/"


TOPMSG = "Arquitectos de software. Construimos productos digitales de alto impacto."

def header(active=""):
    links = "".join(
        f'<a href="{u}"{" aria-current=\"page\"" if a==active else ""}>{n}</a>'
        for n, u, a in NAV
    )
    mob = "".join(f'<a href="{u}">{n}</a>' for n, u, a in NAV)
    return f"""<div class="topbar"><div class="wrap row">
    <div class="msg"><span class="dot"></span>{TOPMSG}</div>
    <div class="util">
      <div class="lang" role="group" aria-label="Idioma">
        <button aria-pressed="true" data-lang="es">ES</button>
        <button aria-pressed="false" data-lang="en">EN</button>
      </div>
      <button class="ubtn" data-pwa hidden><span class="pwaico">{ic('down')}</span><span>Instalar app</span></button>
    </div>
  </div></div>
  <header class="shead"><div class="wrap row">
    <a href="{HOME}" class="brand"><img class="logo" src="/brand/iBisne_blanco.png" alt="iBisne"></a>
    <nav class="nav-lk">{links}</nav>
    <div class="actions">
      <button class="iconbtn theme-toggle" aria-label="Cambiar tema"><svg class="ic"><use href="#i-moon"/></svg></button>
      <a href="/contacto/" class="btn btn-primary">Hablemos</a>
      <button class="hamb" id="hambBtn" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobnav">{ic('menu')}</button>
    </div>
  </div>
  </header>
  <div class="mmenu" id="mobnav" aria-hidden="true">
    <div class="mmenu-top">
      <a href="{HOME}" class="brand"><img class="logo" src="/brand/iBisne_blanco.png" alt="iBisne"></a>
      <button class="hamb" id="mmenuClose" aria-label="Cerrar menú">{ic('x')}</button>
    </div>
    <nav class="mmenu-links">{mob}</nav>
    <div class="mmenu-foot">
      <a href="/contacto/" class="btn btn-primary mmenu-cta">Hablemos {ic('arw')}</a>
      <div class="mmenu-tools">
        <button class="iconbtn theme-toggle" aria-label="Cambiar tema"><svg class="ic"><use href="#i-moon"/></svg></button>
        <div class="lang" role="group" aria-label="Idioma">
          <button aria-pressed="true" data-lang="es">ES</button>
          <button aria-pressed="false" data-lang="en">EN</button>
        </div>
        <button class="ubtn mmenu-install" data-pwa><span class="pwaico">{ic('down')}</span><span>Instalar app</span></button>
      </div>
      <div class="mmenu-social" aria-label="Redes y contacto">
        <a class="wa" href="https://wa.me/523329575274" target="_blank" rel="noopener" aria-label="WhatsApp">{ic('wa')}</a>
        <a href="mailto:proyectos@ibisne.com" aria-label="Correo">{ic('mail')}</a>
        <a href="https://www.facebook.com/ibisnecom" target="_blank" rel="noopener" aria-label="Facebook">{ic('fb')}</a>
        <a href="https://www.instagram.com/ibisnemx" target="_blank" rel="noopener" aria-label="Instagram">{ic('ig')}</a>
      </div>
    </div>
  </div>"""


FOOTER = f"""<footer class="foot"><div class="wrap">
  <div class="cols">
    <div>
      <img class="logo" src="/brand/iBisne_blanco.png" alt="iBisne">
      <p class="about">Tech Studio y arquitectos de software. Diseñamos, construimos y escalamos productos digitales de alto impacto desde Zapopan, Jalisco, con mira en toda Latinoamérica.</p>
    </div>
    <div><div class="gl">Qué hacemos</div><ul>
      <li><a href="/servicios/">Capacidades</a></li><li><a href="/como-trabajamos/">Cómo trabajamos</a></li>
      <li><a href="/portafolio/">Portafolio</a></li><li><a href="/inversion/">Inversión</a></li></ul></div>
    <div><div class="gl">La firma</div><ul>
      <li><a href="/estudio/">Estudio</a></li><li><a href="/por-que-ibisne/">Por qué iBisne</a></li>
      <li><a href="/insights/">Insights</a></li><li><a href="/contacto/">Contacto</a></li></ul></div>
    <div><div class="gl">Contacto</div><ul>
      <li><a href="mailto:proyectos@ibisne.com">proyectos@ibisne.com</a></li>
      <li><a href="/contacto/">Zapopan, Jalisco · MX</a></li>
      <li><a href="/legal/privacidad/">Privacidad</a></li><li><a href="/legal/terminos/">Términos</a></li>
      <li><a href="/legal/aviso-legal/">Aviso legal</a></li><li><a href="/legal/cookies/">Cookies</a></li></ul></div>
  </div>
  <div class="base"><span>© 2026 iBisne S.A.P.I. de C.V.</span><span>Construimos imperios digitales.</span></div>
</div></footer>
<div class="sdock" aria-label="Redes y contacto">
  <a class="wa" href="https://wa.me/523329575274" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp">{ic('wa')}</a>
  <a href="mailto:proyectos@ibisne.com" aria-label="Correo" title="proyectos@ibisne.com">{ic('mail')}</a>
  <a href="https://www.facebook.com/ibisnecom" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">{ic('fb')}</a>
  <a href="https://www.instagram.com/ibisnemx" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">{ic('ig')}</a>
</div>
<div class="pwa-modal" id="pwaModal" role="dialog" aria-modal="true" aria-labelledby="pwaTitle">
  <div class="card">
    <button class="x" id="pwaClose" aria-label="Cerrar">&times;</button>
    <div class="badge-ico" id="pwaModalIco">{ic('down')}</div>
    <h3 id="pwaTitle">Instala iBisne en tu dispositivo</h3>
    <p>Quédate cerca de lo que viene. Al instalar la app recibes primero nuestras novedades y no te pierdes nada de lo que estamos publicando y evaluando para participar.</p>
    <ul><li>Nuevos proyectos</li><li>Convocatorias</li><li>Torneos</li><li>Lanzamientos</li><li>Novedades</li></ul>
    <div class="ios" id="pwaIos">En iPhone o iPad: toca el botón <strong>Compartir</strong> y luego <strong>Añadir a pantalla de inicio</strong>.</div>
    <div class="acts">
      <button class="btn btn-primary" id="pwaGo">Instalar app {ic('down')}</button>
      <button class="btn btn-secondary" id="pwaLater">Ahora no</button>
    </div>
  </div>
</div>"""


LOADER = """<div id="loader"><canvas id="lcv"></canvas><div class="lwrap">
  <img class="llogo" src="/brand/iBisne_blanco.png" alt="iBisne">
  <div class="bits" id="lbits">01001001 01000010</div>
  <div class="qbar"><i></i></div>
  <div class="qlabel">Cargando</div>
</div></div>"""

GTAG = """<script async src="https://www.googletagmanager.com/gtag/js?id=G-XEW1TZEMNL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XEW1TZEMNL');
</script>"""

SCRIPTS = """<script>
(function(){
  var root=document.documentElement;
  // ---- Tema: varios toggles (header + menu movil) ----
  function setMode(m){ root.setAttribute('data-mode',m); try{localStorage.setItem('ib_mode',m);}catch(e){}
    var ref = m==='dark' ? '#i-moon' : '#i-sun';
    document.querySelectorAll('.theme-toggle').forEach(function(b){ b.innerHTML='<svg class="ic"><use href="'+ref+'"/></svg>'; }); }
  document.querySelectorAll('.theme-toggle').forEach(function(b){ b.addEventListener('click',function(){ setMode(root.getAttribute('data-mode')==='dark'?'light':'dark'); }); });
  setMode(root.getAttribute('data-mode')||'dark');
  // ---- Idioma (ES/EN, ambos grupos) ----
  document.querySelectorAll('.lang button').forEach(function(b){ b.addEventListener('click',function(){
    if(b.getAttribute('data-lang')==='en'){ alert('Versión en inglés, próximamente.'); } }); });
  // ---- Menu movil: overlay unico con todas las acciones ----
  var mm=document.getElementById('mobnav'), hb=document.getElementById('hambBtn'), mx=document.getElementById('mmenuClose');
  function openMenu(){ if(!mm)return; mm.classList.add('open'); mm.setAttribute('aria-hidden','false'); if(hb)hb.setAttribute('aria-expanded','true'); document.body.classList.add('menu-lock'); }
  function closeMenu(){ if(!mm)return; mm.classList.remove('open'); mm.setAttribute('aria-hidden','true'); if(hb)hb.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-lock'); }
  if(hb) hb.addEventListener('click',function(){ (mm&&mm.classList.contains('open'))?closeMenu():openMenu(); });
  if(mx) mx.addEventListener('click',closeMenu);
  if(mm) mm.querySelectorAll('.mmenu-links a').forEach(function(a){ a.addEventListener('click',closeMenu); });
  // ---- PWA: icono por plataforma + modal (varios disparadores) ----
  var deferred=null, pbs=document.querySelectorAll('[data-pwa]'), modal=document.getElementById('pwaModal');
  var ua=navigator.userAgent||'';
  var isIOS=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var isAndroid=/android/i.test(ua), isWin=/windows/i.test(ua), isMac=/macintosh/i.test(ua)&&!isIOS;
  var standalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
  var picoId=isIOS||isMac?'i-apple':(isAndroid?'i-android':(isWin?'i-windows':'i-down'));
  function icoSvg(id){ return '<svg class="ic ic-fill"><use href="#'+id+'"/></svg>'; }
  document.querySelectorAll('.pwaico').forEach(function(el){ el.innerHTML=icoSvg(picoId); });
  var mico=document.getElementById('pwaModalIco'); if(mico) mico.innerHTML=icoSvg(picoId);
  function showInstall(v){ pbs.forEach(function(b){ b.hidden=!v; }); }
  showInstall(!standalone);
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferred=e; showInstall(!standalone); });
  function openModal(){ if(!modal) return;
    var go=document.getElementById('pwaGo'), ios=document.getElementById('pwaIos');
    if(deferred){ if(go)go.style.display=''; if(ios)ios.style.display='none'; }
    else if(isIOS){ if(go)go.style.display='none'; if(ios){ios.style.display='block'; ios.innerHTML='En iPhone o iPad: toca <strong>Compartir</strong> y luego <strong>Anadir a pantalla de inicio</strong>.';} }
    else { if(go)go.style.display='none'; if(ios){ios.style.display='block'; ios.innerHTML='Para instalarla, abre el menu de tu navegador (Chrome o Edge) y elige <strong>Instalar app</strong>.';} }
    modal.classList.add('open');
  }
  function closeModal(){ if(modal) modal.classList.remove('open'); }
  pbs.forEach(function(b){ b.addEventListener('click',function(){ closeMenu(); openModal(); }); });
  var goB=document.getElementById('pwaGo');
  if(goB) goB.addEventListener('click',function(){ if(deferred){ deferred.prompt(); if(deferred.userChoice) deferred.userChoice.then(function(){ deferred=null; showInstall(false); closeModal(); }); } else { closeModal(); } });
  var laterB=document.getElementById('pwaLater'); if(laterB) laterB.addEventListener('click',closeModal);
  var closeB=document.getElementById('pwaClose'); if(closeB) closeB.addEventListener('click',closeModal);
  if(modal) modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closeModal(); closeMenu(); } });
  window.addEventListener('appinstalled',function(){ showInstall(false); closeMenu(); closeModal(); });
  // Loader: SOLO enhancement visual. El ocultado lo garantiza el CSS (@keyframes ldout a 2.4s).
  try{
    var L=document.getElementById('loader');
    if(!L || root.classList.contains('ldskip')){ if(L&&L.parentNode) L.parentNode.removeChild(L); return; }
    var bits=document.getElementById('lbits');
    var bi=setInterval(function(){ if(!bits) return; var s=''; for(var i=0;i<24;i++){ s+=(Math.random()<.5?'0':'1'); if(i%8===7)s+=' '; } bits.textContent=s.trim(); },70);
    var raf, cv=document.getElementById('lcv');
    if(cv && cv.getContext){ var cx=cv.getContext('2d'), W,H,pts;
      function rz(){ W=cv.width=cv.offsetWidth||window.innerWidth; H=cv.height=cv.offsetHeight||window.innerHeight; pts=[]; var n=Math.min(72,Math.floor(W*H/15000));
        for(var i=0;i<n;i++) pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45}); }
      rz(); window.addEventListener('resize',rz);
      function draw(){ cx.clearRect(0,0,W,H);
        for(var i=0;i<pts.length;i++){ var p=pts[i]; p.x+=p.vx; p.y+=p.vy;
          if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
          cx.fillStyle='rgba(200,203,212,.55)'; cx.fillRect(p.x,p.y,1.7,1.7);
          for(var j=i+1;j<pts.length;j++){ var q=pts[j],dx=p.x-q.x,dy=p.y-q.y,d=dx*dx+dy*dy;
            if(d<9500){ cx.strokeStyle='rgba(154,160,174,'+((1-d/9500)*.16).toFixed(3)+')'; cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(q.x,q.y); cx.stroke(); } } }
        raf=requestAnimationFrame(draw); }
      raf=requestAnimationFrame(draw);
    }
    function stop(){ clearInterval(bi); if(raf) cancelAnimationFrame(raf); if(L&&L.parentNode) L.parentNode.removeChild(L); }
    L.addEventListener('animationend',function(ev){ if(ev.animationName==='ldout') stop(); });
    setTimeout(stop, 4200); // respaldo si animationend no dispara
  }catch(e){ var l=document.getElementById('loader'); if(l){ l.style.opacity='0'; l.style.visibility='hidden'; l.style.pointerEvents='none'; } }
})();
</script>"""


def base(title, desc, body, active="", canonical="/"):
    return f"""<!doctype html>
<html lang="es" data-theme="d" data-mode="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#12151C">
<link rel="canonical" href="https://www.ibisne.com{canonical}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/assets/pwa/icon-192.png">
<link rel="apple-touch-icon" href="/assets/pwa/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:type" content="website"><meta property="og:image" content="/assets/og-default.png">
<script>(function(){{var h=document.documentElement;try{{var s=location.search;if(s.indexOf('noloader')>-1){{h.className+=' ldskip';}}else if(s.indexOf('loader')>-1){{h.className+=' ldhold';}}var m=new URLSearchParams(s).get('mode')||localStorage.getItem('ib_mode');if(m)h.setAttribute('data-mode',m);}}catch(e){{}}}})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site/dossier.css?v=30">
{GTAG}
</head>
<body>
{LOADER}
{SPRITE}
{header(active)}
{body}
{FOOTER}
{SCRIPTS}
</body>
</html>"""


def crumb(*parts):
    out = ['<a href="' + HOME + '">Inicio</a>']
    for label, url in parts[:-1]:
        out.append(f'<span class="sepp">/</span><a href="{url}">{label}</a>')
    out.append(f'<span class="sepp">/</span><span>{parts[-1]}</span>')
    return '<div class="crumb">' + "".join(out) + "</div>"


def contacto_band():
    return f"""<section class="sec"><div class="wrap"><div class="ctaband">
      <div><span class="eyebrow" style="color:var(--link)">Contacto</span>
        <h2 style="margin-top:.8rem;">¿Estás construyendo algo con potencial de liderar?</h2></div>
      <a href="/contacto/" class="btn btn-primary btn-lg">Hablemos {ic('arw')}</a>
    </div></div></section>"""


ESTANDAR = [
    ("cms", "CMS autoadministrable", "Edita textos, imágenes y contenido sin depender de nadie."),
    ("contrast", "Dark / White", "Modo claro y oscuro, cuidados ambos al detalle."),
    ("lang", "Multi-idioma", "Español e inglés listos desde el día uno."),
    ("phone", "PWA instalable", "Se instala como app en iOS y Android sobre la misma base."),
    ("gauge", "PageSpeed optimizado", "Las métricas de Google ajustadas para velocidad y SEO."),
    ("chart", "Analytics + SEO", "Alta en analítica y metadatos, para medir y crecer."),
]

def estandar_grid():
    its = "".join(f'<div class="it"><div class="ico">{ic(i)}</div><h3>{t}</h3><p>{d}</p></div>' for i, t, d in ESTANDAR)
    return f'<div class="std-grid {gcls(len(ESTANDAR), dense=True)}">{its}</div>'


# ---------------------------------------------------------------- data: dominios
# Tres dominios de ingeniería. Sustituyen al catálogo plano de 8 servicios (v21).
DOMINIOS = [
    dict(slug="producto", icon="layers", nombre="Producto y plataformas",
         tag="El software que opera el negocio",
         lede="SaaS multi-tenant, CRM, ERP, apps y plataformas internas. Los sistemas que sostienen la operación y hacen posible el crecimiento.",
         resuelve="Negocios cuyo techo lo pone su propia operación: hojas de cálculo, procesos manuales y datos que nunca cuadran.",
         sistemas=[
             ("cloud", "SaaS multi-tenant", "Producto en la nube con suscripción, métricas y arquitectura para servir a miles de cuentas."),
             ("users", "CRM", "El pipeline comercial completo: seguimiento, automatización y visibilidad de cada oportunidad."),
             ("db", "ERP", "Un sistema único de verdad para inventario, finanzas, roles y reportes."),
             ("phone", "Apps y PWA", "Producto instalable en iOS y Android sobre una sola base, sin doble desarrollo."),
         ],
         stack=["Next.js", "PostgreSQL", "Multi-tenant", "Stripe", "Roles y permisos", "Observabilidad"]),
    dict(slug="comercio", icon="cart", nombre="Comercio digital",
         tag="Donde el negocio encuentra su mercado",
         lede="Tiendas B2B y B2C, sitios institucionales y páginas de campaña. La superficie donde tu negocio se muestra, convence y cobra.",
         resuelve="Marcas que necesitan vender en línea sobre una base que aguante el volumen y crezca con el catálogo.",
         sistemas=[
             ("cart", "E-commerce", "Catálogo, checkout y operación pensados para el volumen, no para la demo."),
             ("monitor", "Sitios y plataformas", "Presencia institucional rápida y clara, lista para crecer con el negocio."),
             ("zap", "Páginas de campaña", "Superficies de captura para lanzamientos, con analítica desde el primer clic."),
             ("coins", "Pagos e integraciones", "Pasarelas, facturación y conexión con la operación que ya tienes."),
         ],
         stack=["Shopify", "Checkout propio", "Next.js", "CMS headless", "Pasarelas", "SEO"]),
    dict(slug="frontera", icon="cpu", nombre="IA y frontera",
         tag="Tecnología nueva, aplicada con criterio",
         lede="Agentes, automatización con modelos de lenguaje y aplicaciones on-chain. Lo que apenas se está definiendo, construido con seriedad de ingeniería.",
         resuelve="Equipos que quieren aplicar IA o blockchain donde de verdad mueve la aguja, y no donde solo suena bien.",
         sistemas=[
             ("spark", "Agentes de IA", "Sistemas que ejecutan trabajo real dentro de tu operación, con criterio y trazabilidad."),
             ("chart", "Datos y RAG", "Modelos que responden sobre tu propia información, con las fuentes a la vista."),
             ("blocks", "Web3 y contratos", "dApps, tokens y contratos inteligentes auditables, construidos como software serio."),
             ("cms", "Automatización", "Procesos que dejan de consumir horas humanas y empiezan a correr solos."),
         ],
         stack=["Python", "APIs de modelos", "RAG", "Solidity", "Smart contracts", "Indexers"]),
]

# ---------------------------------------------------------------- data: el Protocolo
# Las cuatro fases del Protocolo iBisne. Viven en /como-trabajamos/.
# v22: se eliminó la fase "Resguardo" (era el NDA). Pedir NDA como argumento de venta
# genera fricción y lee a proveedor defensivo; el acuerdo se maneja en el onboarding.
PROTOCOLO = [
    ("01", "Sesión cero",
     "Noventa minutos sobre tu negocio: mercado, números, ambición y el problema real que quieres resolver. Escuchamos como inversionistas, no como proveedores.",
     "Sin costo · 90 minutos"),
    ("02", "Lectura",
     "Analizamos tu proyecto como analizamos los nuestros: tesis, riesgos, unidad económica, arquitectura y alcance. Recibes el documento completo y es tuyo, contrates o no.",
     "Sin costo · 5 a 10 días"),
    ("03", "Sprint de Validación",
     "Construimos una versión funcional del núcleo de tu producto. No una presentación: software que se usa. Te lo mostramos en sesión, con la guía para operarlo y entenderlo por dentro. La titularidad se transfiere al cerrar el desarrollo.",
     "Se cotiza a la medida · se acredita íntegro · 2 a 4 semanas"),
    ("04", "Dos puertas",
     "Te mostramos lo construido y entregamos la cotización cerrada, con fecha y vigencia. Solo entonces, y solo si el análisis lo sostiene, ponemos sobre la mesa una propuesta de Smart Capital.",
     "Tu decisión · 1 sesión"),
]

# (icono, título corto para el home, afirmación completa, sustento)
# v22: el eje de confianza es técnico y ético, no contractual. Cero menciones a NDA,
# firmas o contratos: eso genera fricción y se maneja en el onboarding, no en la venta.
# Tampoco se promete propiedad sobre "ideas": en México no son objeto de PI (art. 14 LFDA).
# v30: la titularidad del código NO se transfiere antes del contrato. Se dice cuándo pasa
# (al cerrar el desarrollo), nunca con verbos de retención: el enunciado siempre avanza
# hacia el traspaso, o se lee como demo prestada. Ver CLAUDE.md, regla de negocio #2.
COMPROMISOS = [
    ("shield", "La discreción es estándar",
     "Lo que nos cuentas se queda en el equipo que construye.",
     "Accesos nominales, repositorios aislados y la información circulando solo entre quienes la necesitan para trabajar. Es la forma en que operamos desde el primer día."),
    ("cms", "El activo pasa a tu nombre",
     "El código y la plataforma pasan a tu nombre al cerrar el desarrollo.",
     "Repositorios, infraestructura y credenciales se migran a tus cuentas al arrancar el proyecto, con el inventario completo de lo que recibes. Los frameworks y componentes que ya existían antes de conocerte siguen siendo nuestros."),
    ("check", "La lectura es tuya",
     "El análisis se va contigo, trabajes con nosotros o no.",
     "Al cerrar la fase de lectura recibes el documento completo: tesis, riesgos, arquitectura y alcance. Sirve igual con nosotros que con cualquier equipo técnico serio."),
    ("coins", "El precio va primero",
     "El precio se fija antes de cualquier conversación de capital.",
     "La cotización se entrega cerrada, con fecha y 60 días de vigencia. Si después hay una conversación de capital, el número ya está puesto y se sostiene."),
]

# ---------------------------------------------------------------- data: insights
INSIGHTS = [
    ("como-disenamos-para-escalar", "Cómo diseñamos para escalar desde el día uno", "Producto"),
    ("el-estandar-que-todo-negocio-deberia-exigir", "El estándar que todo negocio digital debería exigir", "Estrategia"),
    ("cuando-invertir-en-lugar-de-construir", "Cuándo conviene invertir en lugar de solo construir", "Inversión"),
    ("de-la-idea-al-liderazgo", "De la idea al liderazgo: nuestra fundición digital", "Método"),
    ("skin-in-the-game", "Skin in the game: por qué compartimos el riesgo", "Filosofía"),
    ("el-filtro", "El filtro: cómo elegimos los proyectos que construimos", "Método"),
    ("tecnologia-propia-vs-terceros", "Tecnología propia frente a depender de terceros", "Ingeniería"),
    ("pwa-cms-dark-mode-incluidos", "PWA, CMS y dark mode: por qué van incluidos", "Producto"),
    ("ia-y-web3-con-criterio", "IA y Web3 con criterio: cuándo suman y cuándo son ruido", "Tecnología"),
    ("latinoamerica-mercado-digital", "Latinoamérica: el mercado digital que estamos construyendo", "Visión"),
]

VENTAJAS = [
    ("shield", "Compromiso con el resultado", "Nos medimos por lo que tu plataforma logra en producción, no por la entrega de una factura."),
    ("cpu", "Tecnología propia", "Somos dueños de la infraestructura, de punta a punta, sin cabos sueltos."),
    ("trend", "Escalabilidad por diseño", "Construimos para crecer: arquitectura sólida desde el día uno."),
    ("check", "El estándar incluido", "CMS, dark/white, idioma, PWA, PageSpeed y analytics: siempre."),
    ("zap", "Velocidad de fábrica", "Del concepto al lanzamiento sin fricción, como una digital foundry."),
    ("spark", "Selectividad premium", "Trabajamos con un número limitado de proyectos, elegidos por su potencial."),
]


# ---------------------------------------------------------------- projects
# Frente fijo del portafolio (mismo que el home): buque insignia + los de descanso con link.
FRONT = ["ibroker", "batauro", "otomi", "medical-mexicana", "dci", "digitalife"]
# Se mandan al final (por indicación de Eduardo), justo antes de Hotel Panamera.
BACK = ["vg", "farmacia-hdz", "sem"]

def order_projects(projs):
    # FRONT primero; luego descanso+link, Shopify+link, con link, arte, sin link,
    # BACK (al final) y Hotel Panamera de cierre. OJO: descanso SIN link no se prioriza.
    def key(p):
        s = p.get("slug")
        if s in FRONT:
            return (0, FRONT.index(s))
        if s == "hotel-panamera":
            return (9, 0)
        if s in BACK:
            return (8, BACK.index(s))
        has_url = bool(p.get("url", "").strip())
        is_shop = "shopify" in (p.get("tipo", "") + " " + p.get("vertical", "")).lower()
        if p.get("descanso") and has_url:
            return (1, 0)
        if is_shop and has_url:
            return (2, 0)
        if has_url:
            return (3, 0)
        if p.get("art"):
            return (4, 0)
        return (5, 0)
    return sorted(projs, key=key)  # estable: conserva orden original dentro del mismo grupo

def load_projects():
    data = json.loads(CV.read_text(encoding="utf-8"))
    # "ibisne" somos nosotros: no va en el portafolio.
    projs = [p for p in data["proyectos"] if p.get("slug") != "ibisne"]
    return order_projects(projs)

STACK_MAP = [
    ("shopify", ["Shopify", "Liquid", "Checkout", "Integraciones"]),
    ("checkout", ["Next.js", "Checkout propio", "Animaciones", "PWA"]),
    ("erp", ["Next.js", "PostgreSQL", "Reportería", "Roles"]),
    ("crm", ["Next.js", "PostgreSQL", "Automatización", "Dashboards"]),
    ("saas", ["Next.js", "Multi-tenant", "PostgreSQL", "Stripe"]),
    ("api", ["Python", "API REST", "Integraciones", "Datos"]),
    ("blockchain", ["Solidity", "Smart contracts", "Wallets", "dApp"]),
    ("cms", ["Next.js", "CMS headless", "React", "Vercel"]),
    ("landing", ["Next.js", "React", "Tailwind", "SEO"]),
    ("sitio", ["Next.js", "React", "CMS", "Vercel"]),
    ("app", ["PWA", "React", "APIs", "Push"]),
]

def stack_for(p):
    if p.get("stack"):
        return p["stack"]
    t = (p.get("tipo", "") + " " + p.get("vertical", "")).lower()
    for key, st in STACK_MAP:
        if key in t:
            return st
    return ["Next.js", "React", "Tailwind", "CMS", "Vercel"]

ESTADO_VERBO = {
    "LANZADO": "Hoy está en línea y operando.",
    "MVP": "Hoy funciona como MVP, listo para validarse y crecer.",
    "EN REVISIÓN": "Hoy está en revisión final antes de publicar.",
    "EN DESARROLLO": "Hoy está en desarrollo activo.",
    "PRÓXIMO LANZAMIENTO": "Hoy se prepara para su próximo lanzamiento.",
    "EN RENOVACIÓN": "Hoy está en renovación.",
}

def reto_for(p):
    if p.get("reto"):
        return p["reto"]
    return f"Llevar {p['nombre']} a una plataforma digital que estuviera a la altura de la marca y lista para escalar, no un sitio de paso."

def resultado_for(p):
    if p.get("resultado"):
        return p["resultado"]
    return ESTADO_VERBO.get(p["estado"], "Un producto sólido, listo para crecer.")

# Rótulo del bloque central segun el rol (por defecto "Lo que construimos")
def enfoque_lab(p):
    return p.get("enfoque_lab", "Lo que construimos")


ASSET = ROOT / "assets" / "portfolio"

def pf_card(p, href_prefix="/portafolio/"):
    # Prioriza la imagen de descanso visual sobre la captura del sitio.
    desc = p.get("descanso")
    if desc and (ASSET / f"{desc}.jpg").exists():
        visual = f'<div class="shot"><img src="/assets/portfolio/{desc}.jpg" alt="{p["nombre"]}" loading="lazy"></div>'
    elif (ASSET / f"{p['slug']}.png").exists():
        visual = f'<div class="shot"><img src="/assets/portfolio/{p["slug"]}.png" alt="{p["nombre"]}" loading="lazy"></div>'
    else:
        # Sin captura: fondo abstracto en vez de una caja gris vacia.
        bgn = BGS[sum(ord(c) for c in p["slug"]) % len(BGS)]
        visual = (f'<div class="ph ph-bg" style="background-image:url(/assets/bg/{bgn}.webp)">'
                  f'<span>{p["estado"].title()}</span></div>')
    return (f'<a class="pcard" href="{href_prefix}{p["slug"]}/">{visual}'
            f'<div class="meta"><div class="top"><span class="vert">{p.get("vertical","")}</span>'
            f'<span class="badge">{p["estado"].title()}</span></div><h3>{p["nombre"]}</h3></div></a>')


# ---------------------------------------------------------------- HOME
def build_home(projects):
    # v25 · el home separa por tipo de relación: arriba proyectos de cliente, abajo los
    # de venture capital. Los slugs de abajo se excluyen de arriba por código, para que
    # ningún proyecto pueda volver a salir dos veces si se editan estas listas.
    by = {x["slug"]: x for x in projects}
    VC_HOME = ("ibroker", "medical-mexicana", "dci", "sem", "breakit", "ifutbol")
    CLI_HOME = ("batauro", "otomi", "digitalife", "albercasopia", "unframe", "emergente")
    vc_feat = [by[s] for s in VC_HOME if s in by]
    cli_feat = [by[s] for s in CLI_HOME if s in by and s not in VC_HOME]
    cards = "".join(pf_card(p) for p in cli_feat)
    vc_cards = "".join(pf_card(p) for p in vc_feat)
    verbos = f"""<div class="verbos {gcls(3)}">
      <div class="verbo"><div class="ico">{ic('layers')}</div><h3>Creamos</h3><p>Productos digitales de punta a punta: e-commerce, plataformas, apps, CRM, ERP, SaaS, IA y Web3. Diseño, ingeniería y estrategia bajo un mismo techo.</p></div>
      <div class="verbo"><div class="ico">{ic('trend')}</div><h3>Escalamos</h3><p>Arquitectura pensada para crecer. Performance medible y seguridad de nivel empresarial. Construimos para durar, no para salir del paso.</p></div>
      <div class="verbo"><div class="ico">{ic('gauge')}</div><h3>Optimizamos</h3><p>Aterrizamos ideas complejas mediante auditorías de viabilidad, diseño de flujos de usuario y creación de MVPs ágiles para mitigar riesgos antes de un lanzamiento a gran escala.</p></div>
    </div>"""
    # Divisiones: pills limpios sin explicación (regla de negocio v23, ver MESSAGING.md).
    pills = f"""<div class="cta hero-pills">
      <a href="/servicios/" class="btn btn-secondary">{ic('cpu')} Tech Studio</a>
      <a href="/inversion/" class="btn btn-secondary">{ic('trend')} Smart Capital</a>
      <a href="/portafolio/" class="btn btn-secondary">{ic('blocks')} Venture Builder</a>
    </div>"""
    ventajas = "".join(f'<div class="adv"><div class="ico">{ic(i)}</div><h3>{t}</h3><p>{d}</p></div>' for i, t, d in VENTAJAS)
    doms = "".join(
        f'<a class="card" href="/servicios/{d["slug"]}/"><div class="ico">{ic(d["icon"])}</div>'
        f'<h3>{d["nombre"]}</h3><p>{d["lede"]}</p><span class="more">Ver el dominio {ic("arwr")}</span></a>'
        for d in DOMINIOS)
    pledges = "".join(f'<div class="adv"><div class="ico">{ic(i)}</div><h3>{corto}</h3><p>{sust}</p></div>'
                      for i, corto, _t, sust in COMPROMISOS)
    # v23: el home no exhibe contenido de inversión (regla de negocio, ver MESSAGING.md).
    # Los artículos de esa categoría siguen publicados y visibles en /insights/.
    ins_home = [x for x in INSIGHTS if x[2] != "Inversión" and x[0] != "skin-in-the-game"][:3]
    ins = "".join(insight_card(s, t, cat) for s, t, cat in ins_home)
    body = f"""
<section class="hero bg"><div class="wrap">
  <h1>Convertimos visiones en activos tecnológicos.</h1>
  <p class="lede">Diseñamos, desarrollamos y escalamos productos digitales de alto impacto. Somos los arquitectos tecnológicos que transforman tu visión en una plataforma robusta, segura y lista para liderar el mercado.</p>
  <div class="cta"><a href="/contacto/" class="btn btn-primary btn-lg">Hablemos {ic('arw')}</a><a href="/como-trabajamos/" class="btn btn-secondary btn-lg">Cómo trabajamos</a></div>
  <div class="proof"><div class="n">+15<small>Años de experiencia</small></div><div class="n">{len(projects)}<small>Proyectos en portafolio</small></div><div class="n">12+<small>Verticales de industria</small></div>
    <div class="tags"><span class="chip">Creamos</span><span class="chip">Escalamos</span><span class="chip">Optimizamos</span></div></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Qué hacemos</span><h2>Tecnología y escalabilidad de punta a punta.</h2>
  <p>Somos una fábrica de negocios digitales. Construimos la arquitectura de software de tu empresa con los más altos estándares tecnológicos de la industria.</p></div>
  {pills}
  {verbos}
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Qué construimos</span><h2>Sistemas que operan un negocio, no piezas sueltas.</h2>
  <p>Tres dominios de ingeniería. Elegimos el alcance por el potencial del negocio y por dónde está su cuello de botella real.</p></div>
  <div class="grid-3 {gcls(len(DOMINIOS))}">{doms}</div>
  <div class="sec-cta"><a href="/servicios/" class="btn btn-secondary">Ver capacidades {ic('arw')}</a></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Protocolo iBisne</span><h2>El equipo que te escucha es el que escribe el código.</h2>
  <p>Más de 15 años construyendo software. {len(projects)} proyectos en portafolio, 12 verticales. Cuatro reglas iguales para todos: discreción, titularidad clara, análisis que te llevas y precio cerrado desde el inicio.</p></div>
  <div class="why-grid {gcls(len(COMPROMISOS))}">{pledges}</div>
  <div class="sec-cta"><a href="/como-trabajamos/" class="btn btn-secondary">Ver el Protocolo {ic('arw')}</a></div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">El estándar iBisne</span><h2>Cada proyecto nace con lo esencial. Siempre incluido.</h2>
  <p>Lo que debería ser el estándar, lo damos por hecho. Cada plataforma llega lista para durar, escalar y competir.</p></div>
  {estandar_grid()}
  <div class="std-note">{ic('arw')} Seis estándares, <span class="free">incluidos siempre</span>, porque un proyecto se hace para liderar.</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Clientes</span><h2>Negocios que ya están en la cancha.</h2>
  <p>Una muestra de lo que construimos para nuestros clientes. El portafolio completo suma {len(projects)} proyectos en más de una docena de verticales.</p></div>
  <div class="pf-grid rail {gcls(len(cli_feat))}">{cards}</div>
  <div class="pf-more"><a href="/portafolio/" class="btn btn-secondary">Ver los {len(projects)} proyectos {ic('arw')}</a></div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Por qué iBisne</span><h2>La diferencia entre contratar un proveedor y contratar arquitectos.</h2>
  <p>No entregamos y desaparecemos. Nos involucramos en el resultado, con tecnología propia y criterio de negocio.</p></div>
  <div class="why-grid {gcls(len(VENTAJAS))}">{ventajas}</div>
  <div class="sec-cta"><a href="/por-que-ibisne/" class="btn btn-secondary">Conoce nuestras ventajas {ic('arw')}</a></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Venture Capital</span><h2>Proyectos que no soltamos al entregar.</h2>
  <p>Aquí no solo escribimos el código: seguimos dentro. Los construimos, los operamos y crecemos con ellos.</p></div>
  <div class="pf-grid rail {gcls(len(vc_feat))}">{vc_cards}</div>
  <div class="pf-more"><a href="/portafolio/" class="btn btn-secondary">Ver el portafolio completo {ic('arw')}</a></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Insights</span><h2>Perspectivas desde la trinchera.</h2>
  <p>Ideas, aprendizajes y notas de los proyectos que construimos.</p></div>
  <div class="ins-grid rail {gcls(len(ins_home))}">{ins}</div>
  <div class="sec-cta"><a href="/insights/" class="btn btn-secondary">Ver todos los insights {ic('arw')}</a></div>
</div></section>

{contacto_band()}
"""
    return base("iBisne — Convertimos visiones en activos tecnológicos",
                "Tech Studio y arquitectos de software. Diseñamos, desarrollamos y escalamos productos digitales de alto impacto: SaaS, CRM, ERP, apps, IA y Web3.",
                body, active="", canonical="/")


# ---------------------------------------------------------------- CAPACIDADES
def build_servicios_hub(projects):
    bloques = ""
    for d in DOMINIOS:
        sis = "".join(f'<div class="it"><div class="ico">{ic(i)}</div><h3>{t}</h3><p>{p}</p></div>'
                      for i, t, p in d["sistemas"])
        bloques += f"""
<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">{d["tag"]}</span><h2>{d["nombre"]}</h2><p>{d["lede"]}</p></div>
  <div class="std-grid {gcls(len(d["sistemas"]), dense=True)}">{sis}</div>
  <div class="sec-cta"><a href="/servicios/{d["slug"]}/" class="btn btn-secondary">Entrar a {d["nombre"]} {ic('arw')}</a></div>
</div></section>"""
    body = f"""
<section class="phero">{bg_for("capacidades")}<div class="wrap">
  {crumb("Capacidades")}
  <span class="eyebrow">Capacidades</span>
  <h1>Tres dominios de ingeniería, una sola casa.</h1>
  <p class="lede">Diseño, ingeniería, datos y estrategia bajo un mismo techo. Elegimos el alcance por el potencial del negocio y por dónde está su cuello de botella real.</p>
</div></section>
{bloques}
<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">El estándar iBisne</span><h2>Incluido en todo lo que construimos.</h2></div>
  {estandar_grid()}
</div></section>
{contacto_band()}
"""
    return base("Capacidades — iBisne",
                "Producto y plataformas, comercio digital, IA y frontera. Tres dominios de ingeniería para construir y escalar negocios digitales.",
                body, active="servicios", canonical="/servicios/")


DOMAIN_PROJECTS = {
    "producto": ["ibroker", "ipool", "ifutbol", "gocer", "otomi", "eleva"],
    "comercio": ["batauro", "medical-mexicana", "albercasopia", "vg", "farmacia-hdz", "hotel-panamera"],
    "frontera": ["sem", "semendomap", "breakit", "otomi"],
}


def build_dominio(d, projects):
    by = {p["slug"]: p for p in projects}
    mapped = [by[sl] for sl in DOMAIN_PROJECTS.get(d["slug"], []) if sl in by]
    sis = "".join(f'<div class="it"><div class="ico">{ic(i)}</div><h3>{t}</h3><p>{p}</p></div>'
                  for i, t, p in d["sistemas"])
    stack = "".join(f'<span class="chip">{x}</span>' for x in d["stack"])
    rel = "".join(pf_card(p) for p in mapped[:3]) or "".join(pf_card(p) for p in projects[:3])
    vis_p = next((p for p in mapped if (ASSET / f"{p['slug']}.png").exists()), None)
    if vis_p:
        visual = (f'<a class="studio-photo" href="/portafolio/{vis_p["slug"]}/" style="display:block">'
                  f'<img src="/assets/portfolio/{vis_p["slug"]}.png" alt="{vis_p["nombre"]}"></a>')
    else:
        visual = '<div class="ph-photo"><div class="lbl">Imagen del dominio</div><div class="sub">Próximamente.</div></div>'
    body = f"""
<section class="phero">{bg_for(d["slug"])}<div class="wrap">
  {crumb(("Capacidades", "/servicios/"), d["nombre"])}
  <span class="eyebrow">{d["tag"]}</span>
  <h1>{d["nombre"]}</h1>
  <p class="lede">{d["lede"]}</p>
  <div class="cta" style="margin-top:2rem"><a href="/contacto/" class="btn btn-primary">Hablemos {ic('arw')}</a><a href="/como-trabajamos/" class="btn btn-secondary">Cómo trabajamos</a></div>
</div></section>

<section class="sec"><div class="wrap"><div class="grid-2">
  <div><span class="eyebrow" style="color:var(--link)">Qué resolvemos</span>
    <h2 style="font-size:clamp(1.6rem,3.2vw,2.3rem);font-weight:400;letter-spacing:-.02em;margin-top:1rem;">{d["resuelve"]}</h2></div>
  {visual}
</div></div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Qué vive en este dominio</span><h2>Los sistemas que construimos aquí.</h2></div>
  <div class="std-grid {gcls(len(d["sistemas"]), dense=True)}">{sis}</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Protocolo iBisne</span><h2>Cómo empieza un proyecto.</h2>
  <p>Cuatro fases, un análisis que te llevas y un precio cerrado antes de cualquier conversación de capital.</p></div>
  <div class="sec-cta"><a href="/como-trabajamos/" class="btn btn-secondary">Ver las cuatro fases {ic('arw')}</a></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">El estándar incluido</span><h2>Nace listo para durar y escalar.</h2></div>
  {estandar_grid()}
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Stack tecnológico</span><h2>Con qué lo construimos.</h2></div>
  <div class="stack">{stack}</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Del portafolio</span><h2>Proyectos de este dominio.</h2></div>
  <div class="pf-grid rail {gcls(len(mapped[:3]) or 3)}">{rel}</div>
</div></section>
{contacto_band()}
"""
    return base(f"{d['nombre']} — iBisne", d["lede"], body, active="servicios", canonical=f"/servicios/{d['slug']}/")


# ---------------------------------------------------------------- CÓMO TRABAJAMOS
def build_como_trabajamos():
    fases = "".join(
        f'<div class="tl-item"><div class="no">{n}</div><div class="bd">'
        f'<h3>{t}</h3><p>{d}</p><div class="meta">{m}</div></div></div>'
        for n, t, d, m in PROTOCOLO)
    pledges = "".join(
        f'<div class="pledge"><div class="ico">{ic(i)}</div><div><h3>{t}</h3><p>{sust}</p></div></div>'
        for i, _c, t, sust in COMPROMISOS)
    body = f"""
<section class="phero">{bg_for("como-trabajamos")}<div class="wrap">
  {crumb("Cómo trabajamos")}
  <span class="eyebrow">Protocolo iBisne</span>
  <h1>Del primer día al producto funcionando.</h1>
  <p class="lede">Cuatro fases para llevar una visión de negocio a software que opera, con un producto funcional en tus manos antes de que decidas nada. Así trabajamos con todos, sin excepción.</p>
  <div class="cta" style="margin-top:2rem"><a href="/contacto/" class="btn btn-primary">Hablemos {ic('arw')}</a></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Las cuatro fases</span><h2>De la primera llamada al producto funcionando.</h2>
  <p>Cada fase tiene un entregable, una duración y un costo definidos desde el inicio. Sin sorpresas a la mitad.</p></div>
  <div class="fases-2col">
    <div class="tl">{fases}</div>
    <aside class="price-anchor compact">
      <span class="eyebrow" style="color:var(--link)">Sprint de Validación</span>
      <h3>Sales de la sesión con el producto funcionando enfrente.</h3>
      <p>Construimos el núcleo de tu producto y te lo mostramos en vivo: qué hace, cómo está armado por dentro y qué falta para llevarlo a producción.</p>
      <ul class="takeaways">
        <li>El núcleo funcionando, demostrado en sesión</li>
        <li>La guía para operarlo y leerlo por dentro</li>
        <li>El análisis de la fase anterior, que ya es tuyo</li>
      </ul>
      <details><summary>Cómo se cotiza</summary>
        <p>Se cotiza a la medida: un SaaS multi-tenant y una app no cuestan lo mismo. El importe se define con el alcance, se cobra al inicio y se acredita íntegro contra el desarrollo si decides continuar.</p></details>
      <div class="note">{ic('spark')} Aplica a productos de software. Sitios y tiendas se cotizan directo.</div>
    </aside>
  </div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Cómo operamos</span><h2>Cuatro reglas, iguales en cada proyecto.</h2>
  <p>Aplican desde la primera llamada y se sostienen hasta la entrega. Están publicadas para que sepas cómo trabajamos antes de trabajar con nosotros.</p></div>
  <div class="pledges">{pledges}</div>

  <div class="subsplit">
    <span class="eyebrow">La bifurcación</span>
    <h3>Dos puertas. Tú eliges.</h3>
    <div class="grid-2">
      <div class="adv"><div class="ico">{ic('layers')}</div><h3>Desarrollo</h3><p>Nos contratas, construimos, eres dueño de todo. Es la ruta por defecto y donde termina la mayoría de los proyectos.</p></div>
      <div class="adv"><div class="ico">{ic('coins')}</div><h3>Smart Capital</h3><p>En algunos casos el análisis muestra un proyecto que preferimos financiar en lugar de facturar. Entonces entramos con capital y equipo, y el riesgo también corre por nuestra cuenta.</p></div>
    </div>
    <div class="std-note" style="margin-top:var(--sp-6)">{ic('arw')} Ponemos Smart Capital sobre la mesa solo después de analizar el proyecto, cuando el estudio muestra cuatro cosas: <span class="free">demanda demostrada, unidad económica con margen, un mercado que aguante un negocio grande y un fundador que se queda a operarlo</span>. Es una tesis de inversión, no una promesa de entrada.</div>
    <div class="sec-cta"><a href="/inversion/" class="btn btn-secondary">Cómo invertimos {ic('arw')}</a></div>
  </div>
</div></section>

<section class="sec"><div class="wrap"><div class="ctaband">
  <div><span class="eyebrow" style="color:var(--link)">Empezar</span>
    <h2 style="margin-top:.8rem;">Cuéntanos el proyecto. Te decimos cómo se construye.</h2></div>
  <a href="/contacto/" class="btn btn-primary btn-lg">Hablemos {ic('arw')}</a>
</div></div></section>
"""
    return base("Cómo trabajamos — iBisne",
                "El Protocolo iBisne: cuatro fases, análisis que te llevas, un producto funcional demostrado en sesión y una cotización cerrada antes de cualquier conversación de capital.",
                body, active="como-trabajamos", canonical="/como-trabajamos/")


# ---------------------------------------------------------------- INVERSIÓN
def build_inversion():
    crit = [("trend", "Tracción", "Buscamos negocios con demanda real y clientes dispuestos a pagar."),
            ("chart", "Márgenes", "Unidad económica sana: potencial de rentabilidad, no vanidad."),
            ("layers", "Producto", "Madurez y diferenciación. Algo que merezca escalarse."),
            ("zap", "Mentalidad", "Fundadores dispuestos a ejecutar y a jugar en grande.")]
    cg = "".join(f'<div class="adv"><div class="ico">{ic(i)}</div><h3>{t}</h3><p>{d}</p></div>' for i, t, d in crit)
    body = f"""
<section class="phero">{bg_for("inversion")}<div class="wrap">
  {crumb("Inversión")}
  <span class="eyebrow">Inversión · Smart Capital</span>
  <h1>Cuando vemos el potencial, entramos con capital.</h1>
  <p class="lede">No todo es servicio. En los proyectos con futuro claro, co-construimos y financiamos: los llevamos del concepto al lanzamiento como propios, con criterio de inversionista.</p>
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Qué buscamos</span><h2>El potencial, antes que la promesa.</h2>
  <p>Elegimos con criterio. Cada proyecto en el que invertimos pasa por una lectura honesta de su realidad y su potencial.</p></div>
  <div class="why-grid {gcls(len(crit))}">{cg}</div>
</div></section>

<section class="sec"><div class="wrap"><div class="vent">
  <div class="head"><div><span class="eyebrow">Casos propios</span>
  <h2 style="margin-top:1rem;">Proyectos que financiamos para desarrollar y lanzar.</h2></div>
  <p>Skin in the game hecho tangible: negocios donde no solo construimos, también invertimos.</p></div>
  <div class="vent-grid">
    <div class="vcard"><div class="nm">iBroker</div><div class="ty">CRM inmobiliario · Lanzado</div><div class="fin">{ic('arw')} Financiado por iBisne</div></div>
    <div class="vcard"><div class="nm">iFutbol</div><div class="ty">SaaS deportivo · Próximo a lanzar</div><div class="fin">{ic('arw')} Financiado por iBisne</div></div>
    <div class="vcard"><div class="nm">iPool</div><div class="ty">SaaS de albercas · Próximo a lanzar</div><div class="fin">{ic('arw')} Financiado por iBisne</div></div>
  </div>
</div></div></section>
{contacto_band()}
"""
    return base("Inversión · Smart Capital — iBisne", "Co-construimos e invertimos en negocios digitales con potencial de liderar su categoría.", body, active="inversion", canonical="/inversion/")


# ---------------------------------------------------------------- POR QUÉ
def build_porque():
    adv = "".join(
        f'<div class="card"><div class="ico">{ic(i)}</div><h3>{t}</h3><p>{d}</p></div>'
        for i, t, d in VENTAJAS)
    body = f"""
<section class="phero">{bg_for("por-que-ibisne")}<div class="wrap">
  {crumb("Por qué iBisne")}
  <span class="eyebrow">Por qué iBisne</span>
  <h1>La diferencia entre contratar un proveedor y contratar arquitectos.</h1>
  <p class="lede">No entregamos y desaparecemos. Nos involucramos en el resultado, con tecnología propia, criterio de negocio y responsabilidad sobre lo que construimos.</p>
</div></section>
<section class="sec"><div class="wrap"><div class="grid-3 {gcls(len(VENTAJAS))}">{adv}</div></div></section>
{contacto_band()}
"""
    return base("Por qué iBisne", "Skin in the game, tecnología propia, escalabilidad por diseño y el estándar incluido.", body, active="", canonical="/por-que-ibisne/")


# ---------------------------------------------------------------- ESTUDIO
def build_estudio():
    valores = [("Ejecución sobre teoría", "Concebimos, construimos y entregamos ecosistemas completos, no reportes de esfuerzo."),
               ("Skin in the game", "Nuestro ingreso es consecuencia de la riqueza que ayudamos a generar."),
               ("Selectividad", "Reservamos tiempo y tecnología para proyectos con potencial real de liderazgo."),
               ("Honestidad operativa", "Decimos la verdad de los datos, con claridad y respeto."),
               ("Control total", "Gobernamos el sistema completo: tecnología, diseño y estrategia."),
               ("Crecimiento real", "Construimos sobre ventas, márgenes y valor sostenido, no sobre vanidad.")]
    vg = "".join(f'<div class="card"><h3 style="font-size:1.2rem">{t}</h3><p>{d}</p></div>' for t, d in valores)
    equipo = [
        ("Eddy", "Arquitecto de tecnologías", "eduardo@ibisne.com"),
        ("Lizette", "Key Account Manager", "proyectos@ibisne.com"),
        ("Axel", "QA", "qa@ibisne.com"),
        ("Memo", "Analista financiero e inversionista", "guillemor@ibisne.com"),
        ("Willy", "Representante de marca", "willy@ibisne.com"),
    ]
    team = "".join(
        f'<div class="tcard"><div class="mono">{n[0]}</div>'
        f'<div class="info"><div class="nm">{n}</div><div class="role">{r}</div>'
        f'<a class="mail" href="mailto:{e}">{e}</a></div></div>'
        for n, r, e in equipo)
    body = f"""
<section class="phero">{bg_for("estudio")}<div class="wrap">
  {crumb("Estudio")}
  <span class="eyebrow">El estudio</span>
  <h1>Un equipo obsesionado con lo que perdura.</h1>
  <p class="lede">Diseñadores, ingenieros y operadores con más de 15 años construyendo en el ecosistema digital latinoamericano. Detrás de cada proyecto hay personas que asumen el resultado como propio.</p>
</div></section>

<section class="sec"><div class="wrap"><div class="grid-2">
  <div><span class="eyebrow" style="color:var(--link)">Nuestra historia</span>
  <h2 style="font-size:clamp(1.6rem,3vw,2.2rem);font-weight:400;margin-top:1rem;letter-spacing:-.02em;">De estudio a venture builder.</h2>
  <p style="color:var(--muted);margin-top:1rem;">Empezamos diseñando y lanzando plataformas para terceros. Con los años entendimos que el reto no era técnico, sino de estrategia y ejecución. Evolucionamos: dejamos de entregar proyectos para empezar a construir negocios, y a invertir en los que tienen potencial de liderar.</p></div>
  <div class="studio-photo"><img src="/assets/equipo.jpg" alt="Equipo iBisne en el estudio"></div>
</div></div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">El Código iBisne</span><h2>Los principios que nos guían.</h2></div>
  <div class="grid-3 {gcls(len(valores))}">{vg}</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Equipo</span><h2>Las personas detrás de cada proyecto.</h2>
  <p>Un equipo pequeño y senior. Cada quien responde por su parte del resultado.</p></div>
  <div class="team-grid">{team}</div>
</div></section>
{contacto_band()}
"""
    return base("Estudio — iBisne", "Quiénes somos, nuestra historia y el Código iBisne.", body, active="estudio", canonical="/estudio/")


# ---------------------------------------------------------------- INSIGHTS
def build_insights_hub():
    cards = "".join(insight_card(s, t, cat) for s, t, cat in INSIGHTS)
    body = f"""
<section class="phero">{bg_for("insights")}<div class="wrap">
  {crumb("Insights")}
  <span class="eyebrow">Insights</span>
  <h1>Perspectivas desde la trinchera.</h1>
  <p class="lede">Ideas, aprendizajes y notas sobre cómo construimos, escalamos e invertimos en negocios digitales de alto impacto.</p>
</div></section>
<section class="sec"><div class="wrap"><div class="ins-grid rail {gcls(len(INSIGHTS))}">{cards}</div></div></section>
{contacto_band()}
"""
    return base("Insights — iBisne", "Perspectivas sobre construir, escalar e invertir en negocios digitales.", body, active="insights", canonical="/insights/")


def build_insight(slug, title, cat):
    # Contenido real por artículo en content/insights/<slug>.html (redactado, sin placeholders).
    article = (ROOT / "content" / "insights" / f"{slug}.html").read_text(encoding="utf-8").strip()
    body = f"""
<section class="phero">{bg_for(slug)}<div class="wrap" style="max-width:44rem">
  {crumb(("Insights", "/insights/"), cat)}
  <span class="eyebrow">{cat}</span>
  <h1 style="font-size:clamp(1.9rem,4vw,3rem)">{title}</h1>
  <p class="lede">por el equipo iBisne</p>
</div></section>
<section class="sec" style="border-top:0;padding-top:1rem;padding-bottom:0"><div class="wrap" style="max-width:44rem"><div class="ins-hero" style="background-image:url({bg_url(slug)})" role="img" aria-label="{title}"></div></div></section>
<section class="sec" style="border-top:0;padding-top:2rem"><div class="wrap"><div class="prose">
{article}
</div></div></section>
{contacto_band()}
"""
    return base(f"{title} — iBisne", f"{title}. Perspectiva de iBisne.", body, active="insights", canonical=f"/insights/{slug}/")


# ---------------------------------------------------------------- PORTAFOLIO
# Modelo de entrada segun el CRM (hoja "Modelo de entrada"). Mismo patron que
# DOMAIN_PROJECTS: vive aqui y no en cv-data.json, que es externo y alimenta el CV.
# Del CRM solo sale el par slug -> categoria. Nunca montos, contactos ni cap table.
MODELO_PROJECTS = {
    "inversion": ["ibroker", "rancho-contento", "piscinamx", "geneticas", "elixier",
                  "love-sex-and-more", "ipool", "ifutbol", "medical-mexicana", "sem",
                  "semendomap", "dci", "thcc", "eleva", "breakit"],
    "clientes": ["steelbeird", "neoterre", "gocer", "grupo-rmc", "sense", "vg",
                 "farmacia-hdz", "hotel-panamera", "manufaktura", "albercas-vip",
                 "emergente", "unframe", "batauro", "albercasopia", "digitalife", "otomi"],
    "incubadora": [],   # categoria oficial del CRM, sin proyectos por ahora
}
MODELO_LABEL = {"clientes": "Clientes", "inversion": "Inversión", "incubadora": "Incubadora"}

def modelo_of(slug):
    for m, slugs in MODELO_PROJECTS.items():
        if slug in slugs:
            return m
    return "clientes"


def build_portfolio_hub(projects):
    estados = []
    for p in projects:
        if p["estado"] not in estados:
            estados.append(p["estado"])
    fbtns = '<button aria-pressed="true" data-f="all">Todos</button>' + "".join(
        f'<button aria-pressed="false" data-f="{e}">{e.title()}</button>' for e in estados)
    usados = [m for m in ("clientes", "inversion", "incubadora")
              if any(modelo_of(p["slug"]) == m for p in projects)]
    mbtns = '<button aria-pressed="true" data-m="all">Todo el portafolio</button>' + "".join(
        f'<button aria-pressed="false" data-m="{m}">{MODELO_LABEL[m]}</button>' for m in usados)
    cards = "".join(
        f'<div class="pf-item" data-estado="{p["estado"]}" data-modelo="{modelo_of(p["slug"])}">{pf_card(p)}</div>'
        for p in projects)
    body = f"""
<section class="phero">{bg_for("portafolio")}<div class="wrap">
  {crumb("Portafolio")}
  <span class="eyebrow">Portafolio</span>
  <h1>{len(projects)} negocios digitales, en más de una docena de verticales.</h1>
  <p class="lede">Proyectos que construimos para clientes y proyectos en los que además pusimos capital. Filtra por tipo de relación o por estado.</p>
</div></section>
<section class="sec"><div class="wrap">
  <div class="filters ftabs" id="pf-modelo">{mbtns}</div>
  <div class="filters" id="pf-filters">{fbtns}</div>
  <div class="pf-count" id="pf-count" aria-live="polite"></div>
  <div class="pf-grid {gcls(len(projects))}" id="pf-grid">{cards}</div>
  <p class="pf-empty" id="pf-empty" hidden>No hay proyectos con esa combinación. Prueba con otro estado.</p>
</div></section>
{contacto_band()}
<script>
(function(){{
  var mb=document.querySelectorAll('#pf-modelo button'), eb=document.querySelectorAll('#pf-filters button'),
      items=document.querySelectorAll('.pf-item'), cnt=document.getElementById('pf-count'),
      empty=document.getElementById('pf-empty'), m='all', e='all';
  function apply(){{
    var n=0;
    items.forEach(function(it){{
      var ok=(m==='all'||it.getAttribute('data-modelo')===m)&&(e==='all'||it.getAttribute('data-estado')===e);
      it.style.display=ok?'':'none'; if(ok) n++;
    }});
    cnt.textContent=n+(n===1?' proyecto':' proyectos');
    empty.hidden=n>0;
  }}
  function wire(list,attr,set){{
    list.forEach(function(b){{ b.addEventListener('click',function(){{
      list.forEach(function(x){{x.setAttribute('aria-pressed','false');}}); b.setAttribute('aria-pressed','true');
      set(b.getAttribute(attr)); apply();
    }});}});
  }}
  wire(mb,'data-m',function(v){{m=v;}}); wire(eb,'data-f',function(v){{e=v;}});
  apply();
}})();
</script>
"""
    return base("Portafolio — iBisne", f"{len(projects)} negocios digitales que iBisne ha construido, operado e invertido.", body, active="portafolio", canonical="/portafolio/")


def build_project(p, projects):
    tags = f'<span class="chip">{p["tipo"]}</span><span class="chip">{p.get("vertical","")}</span><span class="badge">{p["estado"].title()}</span>'
    url = p.get("url", "").strip()
    live = f'<a href="{url}" class="btn btn-secondary" target="_blank" rel="noopener">Ver en vivo {ic("arw")}</a>' if url else ""
    img = ASSET / f"{p['slug']}.png"
    desc = p.get("descanso")
    has_desc = bool(desc) and (ASSET / f"{desc}.jpg").exists()
    has_shot = img.exists()
    # Lidera el descanso visual; si no hay, la captura del sitio; si no, un estado branded.
    if has_desc:
        hero = f'<div class="proj-hero"><img src="/assets/portfolio/{desc}.jpg" alt="{p["nombre"]}"></div>'
    elif has_shot:
        hero = f'<div class="proj-hero"><img src="/assets/portfolio/{p["slug"]}.png" alt="{p["nombre"]}"></div>'
    else:
        hero = (f'<div class="proj-hero" style="display:flex;flex-direction:column;gap:.5rem;align-items:center;justify-content:center;text-align:center;padding:2rem">'
                f'<span class="eyebrow" style="color:var(--link)">{p.get("vertical","")}</span>'
                f'<span style="font-family:var(--serif);font-size:1.5rem;color:var(--ink)">{p["estado"].title()}</span></div>')
    stack = "".join(f'<span class="chip">{x}</span>' for x in stack_for(p))
    # Banda secundaria: la captura del sitio en vivo (cuando ya lideramos con el descanso).
    mockup = ""
    if has_desc and has_shot:
        mockup = (f'<div class="proj-mockup"><img src="/assets/portfolio/{p["slug"]}.png" '
                  f'alt="{p["nombre"]} · en vivo" loading="lazy"><div class="cap">El sitio en vivo</div></div>')
    rel = [x for x in projects if x["slug"] != p["slug"] and x.get("vertical") == p.get("vertical")][:3]
    if len(rel) < 3:
        for x in projects:
            if x["slug"] != p["slug"] and x not in rel:
                rel.append(x)
            if len(rel) == 3:
                break
    relc = "".join(pf_card(x) for x in rel[:3])
    body = f"""
<section class="phero"><div class="wrap">
  {crumb(("Portafolio", "/portafolio/"), p["nombre"])}
  <span class="eyebrow">{p.get("vertical","")}</span>
  <h1>{p["nombre"]}</h1>
  <p class="lede">{p["resumen"]}</p>
  <div class="proj-tags">{tags}</div>
  <div class="cta" style="margin-top:1.6rem">{live}<a href="/contacto/" class="btn btn-primary">Hablemos {ic('arw')}</a></div>
</div></section>

<section class="sec" style="border-top:0;padding-top:1rem"><div class="wrap">{hero}
  <div class="rrr">
    <div class="blk"><div class="lab">El reto</div><h3>Lo que había que lograr</h3><p>{reto_for(p)}</p></div>
    <div class="blk"><div class="lab">{enfoque_lab(p)}</div><h3>Nuestro enfoque</h3><p>{p["resumen"]}</p></div>
    <div class="blk"><div class="lab">El resultado</div><h3>Lo que entregamos</h3><p>{resultado_for(p)}</p></div>
  </div>
  {mockup}
  <div style="margin-top:var(--sp-7)"><span class="eyebrow" style="color:var(--link)">{p.get("stack_lab","Stack tecnológico")}</span><div class="stack">{stack}</div></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Del portafolio</span><h2>Proyectos relacionados.</h2></div>
  <div class="pf-grid rail {gcls(3)}">{relc}</div>
</div></section>
{contacto_band()}
"""
    return base(f"{p['nombre']} — Portafolio iBisne", p["resumen"][:150], body, active="portafolio", canonical=f"/portafolio/{p['slug']}/")


# ---------------------------------------------------------------- CONTACTO
def build_contacto():
    body = f"""
<section class="phero">{bg_for("contacto")}<div class="wrap">
  {crumb("Contacto")}
  <span class="eyebrow">Contacto</span>
  <h1>Cuéntanos tu proyecto.</h1>
  <p class="lede">Si estás construyendo algo con potencial de liderar su categoría, hablemos. Nos sentamos del mismo lado de la mesa.</p>
</div></section>
<section class="sec" style="border-top:0"><div class="wrap"><div class="apply">
  <div><span class="eyebrow">Escríbenos</span>
    <h2 style="margin-top:1rem;">Del concepto al liderazgo.</h2>
    <p class="sub">Cuéntanos qué estás construyendo, en qué vertical y qué buscas escalar. Respondemos a los proyectos que encajan con lo que hacemos.</p>
    <p class="sub" style="font-size:.95rem;margin-top:1.4rem;">proyectos@ibisne.com<br>Zapopan, Jalisco · México</p>
  </div>
  <form class="form" id="applyForm" novalidate>
    <div class="two"><div class="field"><label for="nombre">Nombre</label><input class="input" id="nombre" name="nombre" autocomplete="name"></div>
    <div class="field"><label for="empresa">Empresa / proyecto</label><input class="input" id="empresa" name="empresa"></div></div>
    <div class="two"><div class="field"><label for="email">Email</label><input class="input" id="email" name="email" type="email" autocomplete="email"></div>
    <div class="field"><label for="telefono">Teléfono</label><input class="input" id="telefono" name="telefono" type="tel" autocomplete="tel"></div></div>
    <div class="field"><label for="mensaje">¿Qué estás construyendo?</label><textarea class="ta" id="mensaje" name="mensaje" placeholder="Vertical, tracción actual y qué buscas escalar."></textarea></div>
    <input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
    <button type="submit" class="btn btn-primary btn-lg">Hablemos {ic('arw')}</button>
    <div class="fine" id="formMsg">Respondemos a los proyectos que encajan con lo que construimos.</div>
  </form>
</div></div></section>
<script>
var f=document.getElementById('applyForm');
f.addEventListener('submit',function(e){{e.preventDefault();var m=document.getElementById('formMsg');
var d=Object.fromEntries(new FormData(f).entries());
if(!d.email&&!d.telefono){{m.textContent='Déjanos al menos un email o teléfono.';m.style.color='#E5766B';return;}}
if(d.website){{return;}} m.textContent='Enviando…';m.style.color='var(--muted)';
fetch('/api/lead',{{method:'POST',headers:{{'Content-Type':'application/json'}},body:JSON.stringify(Object.assign({{}},d,{{vertical:'contacto',locale:'es-MX'}}))}})
.then(function(r){{return r.json().catch(function(){{return{{}};}});}})
.then(function(){{f.reset();m.textContent='Recibido. Te contactamos muy pronto.';m.style.color='var(--ok)';}})
.catch(function(){{m.textContent='Escríbenos a proyectos@ibisne.com.';m.style.color='var(--muted)';}});}});
</script>
"""
    return base("Contacto — iBisne", "Cuéntanos tu proyecto. Del concepto al liderazgo de su categoría.", body, active="", canonical="/contacto/")


# ---------------------------------------------------------------- LEGAL
def build_404():
    body = """
<section class="phero">{bg_for("error404")}<div class="wrap" style="max-width:44rem">
  <span class="eyebrow">Error 404</span>
  <h1 style="font-size:clamp(2rem,5vw,3.2rem)">Esta página no existe.</h1>
  <p class="lede" style="margin-top:1.2rem">El enlace que seguiste no lleva a ningún lugar, o la página cambió de sitio. Volvamos a terreno firme.</p>
  <div class="cta" style="margin-top:2rem"><a class="btn btn-primary" href="/">Ir al inicio <svg class="ic"><use href="#i-arw"/></svg></a>
  <a class="btn btn-secondary" href="/portafolio/">Ver portafolio</a></div>
</div></section>
"""
    return base("Página no encontrada — iBisne", "La página que buscas no existe.", body, active="", canonical="/404")


def build_legal(slug, title, prose):
    body = f"""
<section class="phero">{bg_for(slug)}<div class="wrap" style="max-width:44rem">
  {crumb(("Legal", "/legal/privacidad/"), title)}
  <span class="eyebrow">Legal</span><h1 style="font-size:clamp(1.9rem,4vw,2.8rem)">{title}</h1>
</div></section>
<section class="sec" style="border-top:0;padding-top:0"><div class="wrap"><div class="prose">{prose}</div></div></section>
"""
    return base(f"{title} — iBisne", title, body, active="", canonical=f"/legal/{slug}/")


AVISO_LEGAL = """<p><strong>Marco general, no constituye asesoría jurídica.</strong> iBisne S.A.P.I. de C.V. valida estos textos con su asesor legal.</p>
<h2>Titular</h2><p>Este sitio es operado por iBisne S.A.P.I. de C.V., con domicilio en Zapopan, Jalisco, México. Contacto: proyectos@ibisne.com.</p>
<h2>Objeto</h2><p>El sitio tiene fines informativos sobre los servicios y actividad de iBisne. La información puede actualizarse sin previo aviso.</p>
<h2>Propiedad intelectual</h2><p>Las marcas, logotipos, textos, diseños y contenidos son propiedad de iBisne o de sus respectivos titulares y no pueden reproducirse sin autorización.</p>
<h2>Responsabilidad</h2><p>iBisne procura que la información sea correcta y esté actualizada, sin garantizar la ausencia de errores. Los enlaces a terceros no implican responsabilidad sobre sus contenidos.</p>
<h2>Legislación aplicable</h2><p>Este aviso se rige por la legislación mexicana aplicable.</p>"""

COOKIES = """<p><strong>Marco general, no constituye asesoría jurídica.</strong></p>
<h2>Qué son las cookies</h2><p>Las cookies son pequeños archivos que un sitio guarda en tu dispositivo para recordar información y mejorar la experiencia.</p>
<h2>Cómo las usamos</h2><ul><li><strong>Esenciales:</strong> necesarias para el funcionamiento del sitio.</li><li><strong>Analíticas:</strong> nos ayudan a entender el uso del sitio de forma agregada.</li></ul>
<h2>Tu control</h2><p>Puedes aceptar o rechazar las cookies no esenciales, y gestionarlas desde la configuración de tu navegador en cualquier momento.</p>
<h2>Contacto</h2><p>Para dudas sobre esta política, escríbenos a proyectos@ibisne.com.</p>"""

PRIVACIDAD = """<p><strong>Marco general, no constituye asesoría jurídica.</strong> iBisne valida estos textos con su asesor legal.</p>
<h2>Responsable</h2><p>iBisne S.A.P.I. de C.V., con domicilio en Zapopan, Jalisco, México, es responsable del tratamiento y protección de los datos personales que recibe a través de este sitio, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Contacto: proyectos@ibisne.com.</p>
<h2>Datos que recabamos</h2><p>Cuando nos escribes o completas el formulario de contacto: nombre, empresa, correo electrónico, teléfono o WhatsApp y el mensaje que nos envías. De forma automática, datos técnicos como dirección IP, navegador, sistema operativo y páginas visitadas, mediante cookies.</p>
<h2>Finalidad</h2><p>Atender tus solicitudes de contacto y preparar propuestas, dar seguimiento comercial, mejorar el sitio y su contenido, y cumplir obligaciones legales. No vendemos ni transferimos tus datos a terceros con fines comerciales sin tu consentimiento expreso.</p>
<h2>Derechos ARCO</h2><p>Puedes Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos. Para ejercerlos, escribe a proyectos@ibisne.com con asunto "Solicitud ARCO", tu nombre completo, un medio de contacto y una descripción de la solicitud.</p>
<h2>Cookies</h2><p>El sitio usa cookies esenciales y analíticas. Consulta la <a href="/legal/cookies/">Política de cookies</a> para más detalle.</p>
<h2>Cambios</h2><p>Este aviso puede actualizarse. La versión vigente es la publicada en este sitio.</p>"""

TERMINOS = """<p><strong>Marco general, no constituye asesoría jurídica.</strong> iBisne valida estos textos con su asesor legal.</p>
<h2>Aceptación</h2><p>El acceso y uso de este sitio implica la aceptación de estos términos. Si no estás de acuerdo, te pedimos no utilizarlo.</p>
<h2>Sobre iBisne</h2><p>iBisne es un venture builder: creamos, escalamos e invertimos en negocios digitales. La información del sitio es de carácter informativo; el alcance, los tiempos y el precio de cada proyecto se definen en una propuesta firmable por separado.</p>
<h2>Propuestas y precios</h2><p>Cualquier cifra o estimación compartida en el sitio o en conversaciones previas es indicativa. El alcance y precio finales se confirman en la propuesta. Los precios se expresan en pesos mexicanos (MXN) y el IVA se aplica adicional cuando así se indique.</p>
<h2>Propiedad intelectual</h2><p>Las marcas, logotipos, textos, diseños y contenidos del sitio son propiedad de iBisne o de sus respectivos titulares y no pueden reproducirse sin autorización.</p>
<h2>Enlaces y proyectos de terceros</h2><p>El sitio puede enlazar a proyectos y sitios de terceros. No somos responsables de sus contenidos ni de sus políticas.</p>
<h2>Responsabilidad</h2><p>Procuramos que la información sea correcta y esté actualizada, sin garantizar la ausencia de errores. El uso del sitio es bajo tu propia responsabilidad.</p>
<h2>Legislación aplicable</h2><p>Estos términos se rigen por la legislación mexicana aplicable.</p>"""


# ---------------------------------------------------------------- write / main
def write(path, html):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(html, encoding="utf-8")


def strip_dashes(html):
    # regla global: cero em/en dash. Reemplaza por coma o quita.
    return html.replace(" — ", ", ").replace("—", ",").replace(" – ", ", ").replace("–", "-")


def sitemap(urls):
    items = "".join(f"<url><loc>https://www.ibisne.com{u}</loc></url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{items}</urlset>'


def main():
    projects = load_projects()
    urls = ["/"]
    pages = {
        "index.html": build_home(projects),
        "404.html": build_404(),
        "servicios/index.html": build_servicios_hub(projects),
        "como-trabajamos/index.html": build_como_trabajamos(),
        "inversion/index.html": build_inversion(),
        "por-que-ibisne/index.html": build_porque(),
        "estudio/index.html": build_estudio(),
        "insights/index.html": build_insights_hub(),
        "portafolio/index.html": build_portfolio_hub(projects),
        "contacto/index.html": build_contacto(),
        "legal/privacidad/index.html": build_legal("privacidad", "Aviso de privacidad", PRIVACIDAD),
        "legal/terminos/index.html": build_legal("terminos", "Términos y condiciones", TERMINOS),
        "legal/aviso-legal/index.html": build_legal("aviso-legal", "Aviso legal", AVISO_LEGAL),
        "legal/cookies/index.html": build_legal("cookies", "Política de cookies", COOKIES),
    }
    for d in DOMINIOS:
        pages[f"servicios/{d['slug']}/index.html"] = build_dominio(d, projects)
        urls.append(f"/servicios/{d['slug']}/")
    for p in projects:
        pages[f"portafolio/{p['slug']}/index.html"] = build_project(p, projects)
        urls.append(f"/portafolio/{p['slug']}/")
    for slug, title, cat in INSIGHTS:
        pages[f"insights/{slug}/index.html"] = build_insight(slug, title, cat)
        urls.append(f"/insights/{slug}/")
    urls += ["/servicios/", "/como-trabajamos/", "/inversion/", "/portafolio/", "/estudio/", "/insights/",
             "/contacto/", "/por-que-ibisne/",
             "/legal/privacidad/", "/legal/terminos/", "/legal/aviso-legal/", "/legal/cookies/"]

    n = 0
    for path, html in pages.items():
        write(path, strip_dashes(html))
        n += 1
    write("sitemap.xml", sitemap(sorted(set(urls))))
    print(f"  OK: {n} páginas + sitemap.xml")
    print(f"  Dominios: {len(DOMINIOS)} · Proyectos: {len(projects)} · Insights: {len(INSIGHTS)}")


if __name__ == "__main__":
    main()


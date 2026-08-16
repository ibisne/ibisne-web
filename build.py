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
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></symbol>
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
      <p class="about">Tech Studio y arquitectos de software. Diseñamos, construimos y escalamos productos digitales de alto impacto desde Jalisco y Mérida, con mira en toda Latinoamérica.</p>
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
      <li><a href="/contacto/">Mérida, Yucatán · MX</a></li>
      <li><a href="/legal/terminos/">Términos</a></li><li><a href="/legal/privacidad/">Privacidad</a></li>
      <li><a href="/legal/cancelacion/">Cancelación</a></li><li><a href="/legal/cookies/">Cookies</a></li>
      <li><a href="/legal/aviso-legal/">Aviso legal</a></li></ul></div>
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

# v31 · Analytics SOLO con consentimiento. Antes se cargaba en las 58 páginas sin
# condición, lo que hacía del banner mera decoración. Ahora el script se inyecta desde
# JS cuando ib_consent === 'all' (al aceptar, o en visitas posteriores si ya aceptó).
GTAG = """<script>
(function(){
  var ID='G-XEW1TZEMNL';
  window.ibLoadGA=function(){
    if(window.__gaLoaded) return; window.__gaLoaded=true;
    var s=document.createElement('script'); s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+ID;
    document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments);};
    gtag('js', new Date()); gtag('config', ID);
  };
  try{ if(localStorage.getItem('ib_consent')==='all') window.ibLoadGA(); }catch(e){}
})();
</script>"""

# Banner de consentimiento. Dos botones: aceptar todo (analíticas + confirma lectura de
# los legales) o solo esenciales. Los propios T&C de iBisne prevén la aceptación al
# continuar navegando, así que el aviso lo hace explícito en lugar de tácito.
CONSENT = """<div class="consent" id="consent" hidden>
  <div class="consent-in">
    <p>Usamos cookies para entender cómo se usa el sitio y mejorarlo. Al aceptar, confirmas que leíste nuestros
      <a href="/legal/terminos/">Términos y Condiciones</a> y la
      <a href="/legal/privacidad/">Política de privacidad</a>.
      Detalle en <a href="/legal/cookies/">cookies</a>.</p>
    <div class="consent-acts">
      <button class="btn btn-primary" id="cAll">Aceptar</button>
      <button class="btn btn-secondary" id="cMin">Solo esenciales</button>
    </div>
  </div>
</div>
<script>
(function(){
  var box=document.getElementById('consent'); if(!box) return;
  var v=null; try{ v=localStorage.getItem('ib_consent'); }catch(e){}
  if(!v) box.hidden=false;
  function set(val){
    try{ localStorage.setItem('ib_consent', val); }catch(e){}
    box.hidden=true;
    if(val==='all' && window.ibLoadGA) window.ibLoadGA();
  }
  document.getElementById('cAll').addEventListener('click', function(){ set('all'); });
  document.getElementById('cMin').addEventListener('click', function(){ set('essential'); });
})();
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
  // Si la pagina trae diccionario propio marca data-i18n-ready en <html> y manda ella:
  // sin esta guarda, el aviso de "proximamente" saldria encima de una pagina ya traducida.
  if(!root.hasAttribute('data-i18n-ready')){
    document.querySelectorAll('.lang button').forEach(function(b){ b.addEventListener('click',function(){
      if(b.getAttribute('data-lang')==='en'){ alert('Versión en inglés, próximamente.'); } }); });
  }
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


def base(title, desc, body, active="", canonical="/", noindex=False):
    # noindex="follow": la pagina sale de los buscadores pero sus enlaces internos
    # siguen contando, para no cortarle autoridad a las paginas que si se publican.
    robots = '\n<meta name="robots" content="noindex, follow">' if noindex else ""
    return f"""<!doctype html>
<html lang="es" data-theme="d" data-mode="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#12151C">{robots}
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
<link rel="stylesheet" href="/assets/site/dossier.css?v=43">
{GTAG}
</head>
<body>
{LOADER}
{SPRITE}
{header(active)}
{body}
{FOOTER}
{CONSENT}
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

# v33 · portafolio curado. Estos salen de TODOS los listados (home, dominios, hub) y
# del sitemap, pero su ficha se sigue generando con <meta robots="noindex, follow">:
# nada se borra, ningun enlace compartido se rompe y salen de Google igual.
# Revertir un proyecto = borrar su linea de aqui y reconstruir.
OCULTOS = ("ifutbol", "gocer", "grupo-rmc", "sense", "steelbeird", "unframe",
           "neoterre", "breakit", "piscinamx", "elixier", "love-sex-and-more",
           "manufaktura", "ipool", "eleva", "vg", "farmacia-hdz", "hotel-panamera")


def visibles(projs):
    return [p for p in projs if p.get("slug") not in OCULTOS]

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


def shot_for(slug):
    """Ruta de la captura del proyecto, o None.

    .webp primero (material nuevo, ~10x mas ligero) y .png despues, que es lo que
    trae el material historico. Vive en un solo sitio a proposito: cuando esta
    cascada estaba duplicada en pf_card y en build_project, se extendio solo una
    y la card de THCC se quedo con el fondo abstracto teniendo foto real.
    """
    for ext in ("webp", "png"):
        if (ASSET / f"{slug}.{ext}").exists():
            return f"/assets/portfolio/{slug}.{ext}"
    return None


def pf_card(p, href_prefix="/portafolio/"):
    # Prioriza la imagen de descanso visual sobre la captura del sitio.
    desc = p.get("descanso")
    shot = shot_for(p["slug"])
    if desc and (ASSET / f"{desc}.jpg").exists():
        visual = f'<div class="shot"><img src="/assets/portfolio/{desc}.jpg" alt="{p["nombre"]}" loading="lazy"></div>'
    elif shot:
        visual = f'<div class="shot"><img src="{shot}" alt="{p["nombre"]}" loading="lazy"></div>'
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
    # v33 · seis y seis para que gcls(6) de 3 columnas exactas. Al curar el portafolio
    # salieron breakit e ifutbol de arriba y unframe de abajo; entran thcc y semendomap,
    # y albercas-vip, que acaba de lanzar.
    VC_HOME = ("ibroker", "medical-mexicana", "dci", "sem", "thcc", "semendomap")
    CLI_HOME = ("batauro", "otomi", "digitalife", "albercasopia", "albercas-vip", "emergente")
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
  <div class="tags"><span class="chip">Creamos</span><span class="chip">Escalamos</span><span class="chip">Optimizamos</span></div>
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
  <p>Una muestra de lo que construimos para nuestros clientes. El portafolio completo suma {len(projects)} proyectos en una docena de verticales.</p></div>
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


# v33 · repoblado tras curar el portafolio. OJO: build_dominio cae a un fallback
# silencioso (los 3 primeros del portafolio global) si un dominio se queda sin
# proyectos mapeados, asi que cada lista debe conservar >=3 slugs visibles.
DOMAIN_PROJECTS = {
    "producto": ["ibroker", "sem", "emergente"],
    "comercio": ["thcc", "albercas-vip", "batauro", "medical-mexicana", "albercasopia"],
    "frontera": ["sem", "semendomap", "otomi"],
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
# v37 · 4 columnas fijas en el equipo, NO gcls(). Excepcion deliberada a la regla 6 de
# CLAUDE.md, pedida por Eduardo, con el mismo patron que PF_COLS en el hub. gcls(9)
# daria 3 columnas (3x3 exacto); con 4 la ultima fila queda con una sola ficha y ese
# hueco esta aceptado a proposito. Si el equipo llega a 8 o 12, cierra exacto.
# Tablet y movil no se tocan: .g baja a 2 columnas en <=900px y .team-grid.g fija 2
# en <=640px, que es la decision de la v35.
TEAM_COLS = "g g-4"


def build_estudio():
    valores = [("Ejecución sobre teoría", "Concebimos, construimos y entregamos ecosistemas completos, no reportes de esfuerzo."),
               ("Skin in the game", "Nuestro ingreso es consecuencia de la riqueza que ayudamos a generar."),
               ("Selectividad", "Reservamos tiempo y tecnología para proyectos con potencial real de liderazgo."),
               ("Honestidad operativa", "Decimos la verdad de los datos, con claridad y respeto."),
               ("Control total", "Gobernamos el sistema completo: tecnología, diseño y estrategia."),
               ("Crecimiento real", "Construimos sobre ventas, márgenes y valor sostenido, no sobre vanidad.")]
    vg = "".join(f'<div class="card"><h3 style="font-size:1.2rem">{t}</h3><p>{d}</p></div>' for t, d in valores)
    # v38 · nueve personas en (icono, nombre, cargo, disciplina, sede, correo).
    #
    # El icono viene del sprite del sitio y apunta a la FUNCION, no a la persona: dos
    # gerentes comerciales comparten "trend" a proposito, porque hacen lo mismo desde
    # ciudades distintas. Sustituye al monograma cuadrado de la v37, que ocupaba una
    # caja de 272x272 para mostrar dos letras.
    #
    # Formato de nombre: "Nombre + inicial del apellido", uniforme y sin titulos.
    #
    # Orden pensado para la rejilla de 4 columnas (4+4+1): comercial e inversion arriba,
    # ejecucion en medio, y Legal solo en la ultima fila por ser la funcion mas autonoma.
    #
    # La sede es lo que vuelve concreta la afirmacion de dos oficinas: Willy y Guillermo
    # operan desde Merida, los otros siete desde Zapopan.
    #
    # Sin telefono en la ficha: el conmutador es dato de la empresa y vive en /contacto/,
    # no repetido nueve veces. Los WhatsApp personales de las firmas nunca se publican.
    equipo = [
        ("trend",  "Eduardo C.", "Gerente Comercial",
         "Comercial", "Jalisco","eduardo@ibisne.com"),
        ("trend",  "Willy V.", "Gerente Comercial",
         "Comercial", "Mérida", "willy.vergara@ibisne.com"),
        ("coins",  "Guillermo V.", "Gerente de Inversión",
         "Inversión", "Mérida", "guillermo.vergara@ibisne.com"),
        ("cpu",    "Brissa L.", "Ing. Senior · Forward Deployed Engineer",
         "Ingeniería", "Jalisco","proyectos@ibisne.com"),
        ("blocks", "Josue Q.", "Programador Senior Fullstack",
         "Ingeniería", "Jalisco","fullstack@ibisne.com"),
        ("check",  "Axel O.", "QA",
         "Calidad", "Jalisco","shopify@ibisne.com"),
        ("spark",  "Joshua P.", "Vibe Coding Jr.",
         "Diseño", "Jalisco","creativos@ibisne.com"),
        ("users",  "Melanie C.", "Key Account Manager",
         "Cuentas", "Jalisco","kam@ibisne.com"),
        ("shield", "David G.", "Director Legal",
         "Legal", "Jalisco","legal@ibisne.com"),
    ]
    # v39 · la sede sale de la linea de disciplina y pasa a ser un pill con pin, en la
    # misma fila que el icono. Antes decia "Ingenieria · Zapopan" y sumaba palabras a un
    # eyebrow que ya era largo; ahora se lee de un vistazo y aprovecha el hueco que
    # dejaba el icono a su derecha, sin sumar altura a la ficha.
    team = "".join(
        f'<div class="tcard">'
        f'<div class="thead"><div class="ico">{ic(i)}</div>'
        f'<span class="sede">{ic("pin")}{sede}</span></div>'
        f'<div class="disc">{disc}</div><div class="nm">{n}</div>'
        f'<div class="role">{r}</div>'
        f'<a class="mail" href="mailto:{e}">{e}</a></div>'
        for i, n, r, disc, sede, e in equipo)
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
  <p>Nueve personas entre las oficinas de Jalisco y Mérida. Cada quien responde por su parte del resultado y contesta su propio correo.</p></div>
  <div class="team-grid {TEAM_COLS}">{team}</div>
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


# v33 · 3 columnas fijas en el hub, NO gcls(). Excepcion deliberada a la regla 6 de
# CLAUDE.md, pedida por Eduardo. Ademas gcls() nunca fue exacto aqui: este hub filtra
# del lado del cliente, asi que el conteo visible cambia con cada tab y derivar las
# columnas del total inicial daba una cifra que dejaba de ser cierta al primer clic.
# Con 14 proyectos la ultima fila queda con 2 de 3; con 12, 15 o 18 cierra exacta.
# Tablet y movil no se tocan: .g baja a 2 columnas en <=900px y a 1 en <=640px.
PF_COLS = "g g-3"


def build_portfolio_hub(projects):
    estados = []
    for p in projects:
        if p["estado"] not in estados:
            estados.append(p["estado"])
    # v36 · con menos de 3 estados el filtro no separa nada util: al curar el
    # portafolio quedaron "Lanzado" (13) y "Mvp" (1), y una pestaña que devuelve un
    # solo proyecto es ruido. Se oculta solo y reaparece si vuelve a haber variedad;
    # no se borra codigo. El JS tolera que #pf-filters no exista: querySelectorAll
    # devuelve lista vacia, wire() no hace nada y el estado se queda en "all".
    filtro_estado = len(estados) >= 3
    fbtns = '<button aria-pressed="true" data-f="all">Todos</button>' + "".join(
        f'<button aria-pressed="false" data-f="{e}">{e.title()}</button>' for e in estados)
    fbar = f'<div class="filters" id="pf-filters">{fbtns}</div>' if filtro_estado else ""
    lede_filtro = ("Filtra por tipo de relación o por estado." if filtro_estado
                   else "Filtra por tipo de relación.")
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
  <h1>{len(projects)} negocios digitales, en una docena de verticales.</h1>
  <p class="lede">Proyectos que construimos para clientes y proyectos en los que además pusimos capital. {lede_filtro}</p>
</div></section>
<section class="sec"><div class="wrap">
  <div class="filters ftabs" id="pf-modelo">{mbtns}</div>
  {fbar}
  <div class="pf-count" id="pf-count" aria-live="polite"></div>
  <div class="pf-grid {PF_COLS}" id="pf-grid">{cards}</div>
  <p class="pf-empty" id="pf-empty" hidden>No hay proyectos con esa combinación. Prueba con otra.</p>
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


# ---------------------------------------------------------------- casos de estudio (v33)
# Datos de presentacion del sitio, NO del CV: por eso viven aqui (dentro del repo y
# versionados) y no en cv-data.json, que esta fuera del repo y alimenta el curriculum.
# Los proyectos sin entrada aqui rinden la ficha clasica, sin tocar nada.
#
# bloques: ("shot", archivo, pie) imagen a ancho completo
#          ("phones", [(archivo, pie), ...]) capturas de movil, ancho contenido
#          ("tiles",  [(archivo, pie), ...]) rejilla, columnas via gcls()
CASO = {
    "albercas-vip": {
        "enfoque": "Diez colecciones RENOLIT con más de treinta y cinco acabados, cada uno con su "
                   "garantía, convertidas en un catálogo que se recorre en minutos. Alrededor: cotizador "
                   "con respuesta en 48 horas, instalación como app desde el propio navegador, selector "
                   "de idioma y moneda, modo oscuro y un asistente que contesta la primera pregunta a "
                   "cualquier hora.",
        "notas": [
            ("phone", "Primero el teléfono",
             "El acabado se elige a pie de obra, con el cliente enseñando opciones en la mano. Por eso "
             "la decisión de diseño empezó por la pantalla chica: menú de una mano, contacto por "
             "WhatsApp a un toque y cotizador que se completa sin zoom."),
            ("blocks", "Se instala como app",
             "PWA instalable desde el navegador, sin pasar por App Store ni Play Store. El vendedor "
             "abre el catálogo en obra aunque la señal esté floja, y AlbercasVIP no paga comisión de "
             "tienda ni espera aprobación para publicar un cambio."),
            ("layers", "Catálogo técnico navegable",
             "ALKORPLAN 2000 y 3000, CERAMICS, TOUCH y XTREME, cada línea con sus años de garantía y "
             "su uso recomendado. La ficha técnica dejó de ser un PDF adjunto y pasó a ser el "
             "argumento de venta."),
        ],
        "bloques": [
            ("shot", "albercas-vip-01.webp",
             "Portada · selector de idioma y moneda, instalación como app y modo oscuro conviven en la misma barra"),
            ("cols", [
                ("albercas-vip-m1.webp", "Portada en móvil"),
                ("albercas-vip-m2.webp", "Menú: WhatsApp, teléfono, idioma, moneda y tema"),
            ]),
            ("tiles", [
                ("albercas-vip-a1.webp", "Alberca interior con muro de roca"),
                ("albercas-vip-a2.webp", "Infinity en azotea, iluminación nocturna"),
                ("albercas-vip-a3.webp", "Residencial con spa elevado y terraza"),
            ]),
        ],
    },
    "thcc": {
        "enfoque": "Una tienda que ordena varias marcas bajo un mismo catálogo, con verificación de edad "
                   "antes de comprar, carrito, buscador y filtros, contenido editorial y tres idiomas. "
                   "Encima, un asistente conversacional que responde en lenguaje natural y devuelve "
                   "tarjetas de producto comparables dentro del mismo chat.",
        "notas": [
            ("cart", "Varias marcas, un solo catálogo",
             "Alienworks, GODS Beard Cult, High Tide y Medical Mexicanna comparten estructura de ficha, "
             "taxonomía y buscador. Cada marca conserva su identidad visual sin romper la navegación "
             "ni obligar al comprador a reaprender la tienda."),
            ("shield", "La norma, dentro del producto",
             "Verificación de edad antes del checkout y fichas construidas para mostrar contenido neto, "
             "piezas y el etiquetado que la regulación mexicana exige. El cumplimiento se resolvió en la "
             "arquitectura del catálogo, no como aviso pegado al final."),
            ("spark", "Un asistente que sí vende",
             "Pregúntale por el producto más caro y el más barato y responde con tarjetas comparables, "
             "sugerencias intermedias y accesos directos a sabores y presentaciones. Convierte una duda "
             "vaga en dos productos concretos sin salir del chat."),
        ],
        "bloques": [
            ("shot", "thcc-01.webp",
             "High Tide · bebida carbonatada de 355 ml en tres perfiles de sabor"),
            ("cols", [
                ("thcc-m2.webp", "Portada en móvil"),
                ("thcc-m1.webp", "El asistente devuelve tarjetas de producto comparables"),
            ]),
            ("shot", "thcc-02.webp",
             "Línea de gomitas GODS Beard Cult, fotografiada para catálogo"),
            # Cuadradas y verticales van separadas: mezclarlas en una misma fila
            # deja huecos bajo las de menor altura.
            ("tiles", [
                ("thcc-p1.webp", "Alienworks · Cherry Fuel"),
                ("thcc-p2.webp", "GODS · Cherry Gushers"),
            ]),
            ("cols", [
                ("thcc-p3.webp", "High Tide · los tres sabores"),
                ("thcc-p4.webp", "Alienworks · la línea completa"),
            ]),
        ],
    },
}

CASOS_DIR = ASSET / "casos"


def enfoque_for(p):
    # Sin caso propio, el bloque repite el resumen (comportamiento historico).
    return CASO.get(p["slug"], {}).get("enfoque") or p["resumen"]


def caso_html(p):
    """Bloque de caso de estudio. Cadena vacia si el proyecto no tiene material."""
    c = CASO.get(p["slug"])
    if not c:
        return ""

    def img(archivo, pie, lazy=True):
        # Falla ruidoso: una imagen declarada y ausente deja un hueco que nadie nota
        # hasta que el cliente abre la ficha. Preferimos romper el build.
        if not (CASOS_DIR / archivo).exists():
            raise FileNotFoundError(
                f"CASO[{p['slug']}] declara assets/portfolio/casos/{archivo} y no existe. "
                f"Corre: python tools/optimize-shots.py")
        lz = ' loading="lazy"' if lazy else ""
        return (f'<img src="/assets/portfolio/casos/{archivo}" alt="{p["nombre"]} · {pie}"{lz}>'
                f'<div class="cap">{pie}</div>')

    notas = "".join(
        f'<div class="nota"><div class="ico">{ic(i)}</div><h3>{t}</h3><p>{d}</p></div>'
        for i, t, d in c["notas"])

    piezas = []
    for kind, *rest in c["bloques"]:
        if kind == "shot":
            archivo, pie = rest
            piezas.append(f'<figure class="case-shot">{img(archivo, pie)}</figure>')
        elif kind == "cols":
            items = "".join(f'<figure class="case-col">{img(a, pie)}</figure>' for a, pie in rest[0])
            piezas.append(f'<div class="case-cols rail">{items}</div>')
        elif kind == "tiles":
            # dense=True: son imagenes con pie de una linea, no cards con parrafo.
            items = "".join(f'<figure class="case-tile">{img(a, pie)}</figure>' for a, pie in rest[0])
            piezas.append(f'<div class="case-tiles rail {gcls(len(rest[0]), dense=True)}">{items}</div>')

    return f"""
<section class="sec sec-alt"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">El caso</span><h2>Cómo se ve por dentro.</h2></div>
  <div class="case-notes {gcls(len(c['notas']))}">{notas}</div>
  <div class="case-media">{"".join(piezas)}</div>
</div></section>
"""


def build_project(p, projects):
    tags = f'<span class="chip">{p["tipo"]}</span><span class="chip">{p.get("vertical","")}</span><span class="badge">{p["estado"].title()}</span>'
    url = p.get("url", "").strip()
    live = f'<a href="{url}" class="btn btn-secondary" target="_blank" rel="noopener">Ver en vivo {ic("arw")}</a>' if url else ""
    desc = p.get("descanso")
    has_desc = bool(desc) and (ASSET / f"{desc}.jpg").exists()
    shot = shot_for(p["slug"])
    # Lidera el descanso visual; si no hay, la captura del sitio; si no, un estado branded.
    if has_desc:
        hero = f'<div class="proj-hero"><img src="/assets/portfolio/{desc}.jpg" alt="{p["nombre"]}"></div>'
    elif shot:
        hero = f'<div class="proj-hero"><img src="{shot}" alt="{p["nombre"]}"></div>'
    else:
        hero = (f'<div class="proj-hero" style="display:flex;flex-direction:column;gap:.5rem;align-items:center;justify-content:center;text-align:center;padding:2rem">'
                f'<span class="eyebrow" style="color:var(--link)">{p.get("vertical","")}</span>'
                f'<span style="font-family:var(--serif);font-size:1.5rem;color:var(--ink)">{p["estado"].title()}</span></div>')
    stack = "".join(f'<span class="chip">{x}</span>' for x in stack_for(p))
    # Banda secundaria: la captura del sitio en vivo (cuando ya lideramos con el descanso).
    # Se suprime si el proyecto tiene caso de estudio: ahi la imagen ya va con contexto.
    mockup = ""
    if has_desc and shot and p["slug"] not in CASO:
        mockup = (f'<div class="proj-mockup"><img src="{shot}" '
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
    <div class="blk"><div class="lab">{enfoque_lab(p)}</div><h3>Nuestro enfoque</h3><p>{enfoque_for(p)}</p></div>
    <div class="blk"><div class="lab">El resultado</div><h3>Lo que entregamos</h3><p>{resultado_for(p)}</p></div>
  </div>
  {mockup}
  <div style="margin-top:var(--sp-7)"><span class="eyebrow" style="color:var(--link)">{p.get("stack_lab","Stack tecnológico")}</span><div class="stack">{stack}</div></div>
</div></section>
{caso_html(p)}
<section class="sec"><div class="wrap">
  <div class="sec-h"><span class="eyebrow">Del portafolio</span><h2>Proyectos relacionados.</h2></div>
  <div class="pf-grid rail {gcls(3)}">{relc}</div>
</div></section>
{contacto_band()}
"""
    return base(f"{p['nombre']} — Portafolio iBisne", p["resumen"][:150], body,
                active="portafolio", canonical=f"/portafolio/{p['slug']}/",
                noindex=p["slug"] in OCULTOS)


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
    <p class="sub" style="font-size:.95rem;margin-top:1.4rem;">proyectos@ibisne.com<br>Oficina · +52 33 2957 5274<br>Zapopan, Jalisco · Mérida, Yucatán</p>
    <a class="btn btn-secondary" href="/empecemos/" style="margin-top:1.6rem">Me interesa, quiero empezar {ic('arw')}</a>
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


# ---------------------------------------------------------------- BRIEF /empecemos/
# Quiz de reactivacion para clientes con MVP y cotizacion ya entregados.
# Bienvenida + 6 pasos + cierre. No usa .phero a proposito: esa clase se fuerza
# a 100dvh en movil y empujaba el formulario bajo el pliegue.
PROMO_FECHA = "31 de agosto de 2026"

# Los 6 incluidos sin costo de las cotizaciones. Todos los iconos ya existen
# en el SPRITE del sitio: no hace falta agregar ninguno.
INCLUIDOS = [
    ("lang", "Idioma ES / EN"),
    ("phone", "PWA instalable"),
    ("contrast", "Dark / White"),
    ("gauge", "PageSpeed, las 4 métricas"),
    ("chart", "Alta en Google Analytics"),
    ("cms", "CMS autoadministrable"),
]

# Icono y rotulo de cada paso en el stepper.
PASOS = [
    ("users", "Contacto"),
    ("monitor", "Sitio web"),
    ("ig", "Presencia"),
    ("zap", "Tiempos"),
    ("coins", "Inversión"),
    ("check", "Revisar"),
]

# El JS va como constante aparte (string normal, no f-string) para no doblar llaves.
EMPECEMOS_JS = r"""
<script>
(function(){
  var form = document.getElementById('briefForm');
  if (!form) return;
  var wel = document.getElementById('qwelcome');
  var pasos = [].slice.call(form.querySelectorAll('.qstep'));
  var chips = [].slice.call(document.querySelectorAll('.qs'));
  var num = document.getElementById('qbNum');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var btnSend = document.getElementById('btnSend');
  var msg = document.getElementById('qMsg');
  var i = 0;
  var visto = [true, false, false, false, false, false];   // por donde ya paso
  var errorEn1 = false;

  var ETIQUETAS = {
    nombre:'Nombre', empresa:'Proyecto o negocio', email:'Correo', telefono:'Teléfono',
    tiene_sitio:'¿Tiene sitio?', dominio:'Dominio', correos_corp:'Correos corporativos',
    en_redes:'¿En redes?', redes:'Redes sociales', google_ficha:'Ficha en Google',
    urgencia:'Urgencia', fecha_lanzamiento:'Lanzamiento tentativo', inversion:'Inversión estimada'
  };
  // Que campos "cuentan" para dar por respondido cada paso.
  var CAMPOS_PASO = [
    ['nombre','empresa','email','telefono'],
    ['tiene_sitio','dominio','correos_corp'],
    ['en_redes','redes','google_ficha'],
    ['urgencia','fecha_lanzamiento'],
    ['inversion'],
    []
  ];

  function ajustarConsent(){
    var c = document.getElementById('consent');
    document.body.classList.toggle('has-consent', !!(c && !c.hidden));
  }
  ajustarConsent(); setTimeout(ajustarConsent, 400);
  document.addEventListener('click', function(e){
    if (e.target && (e.target.id === 'cAll' || e.target.id === 'cMin')) setTimeout(ajustarConsent, 60);
  });

  function datos(){
    var d = {};
    ['nombre','empresa','email','telefono','dominio','fecha_lanzamiento','website'].forEach(function(k){
      var el = form.querySelector('[name="' + k + '"]');
      if (el && el.value.trim()) d[k] = el.value.trim();
    });
    ['tiene_sitio','correos_corp','en_redes','google_ficha','urgencia','inversion'].forEach(function(k){
      var el = form.querySelector('[name="' + k + '"]:checked');
      if (el) d[k] = el.value;
    });
    var r = [].slice.call(form.querySelectorAll('[name="redes"]:checked')).map(function(el){ return el.value; });
    if (r.length) d.redes = r.join(', ');
    return d;
  }

  function aviso(txt, malo){ msg.textContent = txt || ''; msg.style.color = malo ? 'var(--error)' : 'var(--muted)'; }
  function foco(sel){ var el = form.querySelector(sel); if (el) try { el.focus({preventScroll:true}); } catch(e){} }

  // Telefono mexicano: 10 digitos reales.
  function telValido(v){
    var d = (v || '').replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('52') === 0) d = d.slice(2);
    if (d.length === 11 && d.indexOf('1') === 0) d = d.slice(1);
    if (d.length !== 10) return false;
    if (/^(\d)\1{9}$/.test(d)) return false;
    return true;
  }
  function mailValido(v){ return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v || ''); }

  function respondido(n){
    var d = datos();
    return CAMPOS_PASO[n].some(function(k){ return !!d[k]; });
  }

  // Cinco estados: pendiente (sin clase), visitado-vacio, completado, actual y error.
  function pintarChips(){
    chips.forEach(function(ch, n){
      ch.className = 'qs';
      if (n === 0 && errorEn1) ch.classList.add('is-error');
      else if (respondido(n)) ch.classList.add('is-done');
      else if (visto[n] && n !== i) ch.classList.add('is-empty');
      if (n === i) ch.classList.add('is-now');
      var alcanzable = visto[n];
      ch.classList.toggle('can-go', alcanzable && n !== i);
      ch.setAttribute('aria-current', n === i ? 'step' : 'false');
      if (!alcanzable) ch.setAttribute('aria-disabled', 'true');
      else ch.removeAttribute('aria-disabled');
    });
  }

  function pintar(){
    pasos.forEach(function(p, n){ p.hidden = (n !== i); });
    visto[i] = true;
    num.textContent = 'Paso ' + (i + 1) + ' de ' + pasos.length;
    btnPrev.hidden = (i === 0);
    var ultimo = (i === pasos.length - 1);
    btnNext.hidden = ultimo;
    btnSend.hidden = !ultimo;
    aviso('');
    if (ultimo) resumir();
    pintarChips();
  }

  function valido(){
    if (i !== 0) return true;
    var d = datos();
    var falla = null;
    if (!d.nombre) falla = ['Dinos cómo te llamas.', '[name="nombre"]'];
    else if (!d.empresa) falla = ['Falta el nombre del proyecto o negocio.', '[name="empresa"]'];
    else if (!mailValido(d.email)) falla = ['Escribe un correo válido.', '[name="email"]'];
    else if (!telValido(d.telefono)) falla = ['El teléfono debe llevar 10 dígitos.', '[name="telefono"]'];
    errorEn1 = !!falla;
    pintarChips();
    if (falla) { aviso(falla[0], 1); foco(falla[1]); return false; }
    return true;
  }

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }

  function resumir(){
    var d = datos(), filas = '';
    Object.keys(ETIQUETAS).forEach(function(k){
      if (d[k]) filas += '<div class="row"><span class="k">' + ETIQUETAS[k] +
                         '</span><span class="v">' + esc(d[k]) + '</span></div>';
    });
    document.getElementById('sumBox').innerHTML = filas;
  }

  // ---- Progressive disclosure: solo se muestra lo que aplica ----
  function condicionales(){
    var d = datos();
    // Dominio: el label cambia segun tenga sitio o no.
    var wrapDom = document.getElementById('condDominio');
    var lbDom = document.getElementById('lbDominio');
    var inDom = document.getElementById('dominio');
    if (d.tiene_sitio) {
      wrapDom.hidden = false;
      if (d.tiene_sitio === 'Sí') {
        lbDom.textContent = '¿Cuál es tu dominio?';
        inDom.placeholder = 'tudominio.com';
      } else {
        lbDom.textContent = '¿Qué dominio te gustaría tener?';
        inDom.placeholder = 'elquequieras.com · si aún no lo decides, déjalo vacío';
      }
    } else { wrapDom.hidden = true; }

    // Redes: las casillas solo salen si dijo que si.
    document.getElementById('condRedes').hidden = (d.en_redes !== 'Sí');

    // Fecha: no se le pide a quien sigue pensandolo.
    var pideFecha = d.urgencia && d.urgencia !== 'Lo sigo pensando';
    document.getElementById('condFecha').hidden = !pideFecha;
  }
  form.addEventListener('change', function(){ condicionales(); pintarChips(); });
  form.addEventListener('input', function(){ pintarChips(); });

  // ---- navegacion ----
  document.getElementById('btnStart').addEventListener('click', function(){
    wel.hidden = true; form.hidden = false; condicionales(); pintar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  btnNext.addEventListener('click', function(){ if (valido() && i < pasos.length - 1) { i++; pintar(); } });
  btnPrev.addEventListener('click', function(){ if (i > 0) { i--; pintar(); } });
  chips.forEach(function(ch, n){
    ch.addEventListener('click', function(){
      if (!visto[n] || n === i) return;              // solo hacia pasos ya vistos
      if (n > 0 && !valido()) return;                // sin contacto valido no se avanza
      i = n; pintar();
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var d = datos();
    if (d.website) return;                            // honeypot
    if (!document.getElementById('acepto').checked) {
      aviso('Marca la casilla de privacidad para continuar.', 1); return;
    }
    btnSend.disabled = true;
    aviso('Enviando…');
    var payload = Object.assign({}, d, { origen: 'empecemos', vertical: 'reactivacion', locale: 'es-MX' });
    delete payload.website;

    fetch('/api/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r){
      var httpOk = r.ok;
      return r.json().catch(function(){ return {}; }).then(function(j){ return { httpOk: httpOk, body: j }; });
    })
    // Solo se declara exito con ok:true explicito. Un 404, un 500 o una respuesta
    // que no sea JSON dejan body={} y se colarian como envio correcto.
    .then(function(res){
      var enviado = res.httpOk && res.body && res.body.ok === true && res.body.noop !== true;
      listo(payload, !enviado);
    })
    .catch(function(){ listo(payload, true); });
  });

  function listo(payload, degradado){
    document.getElementById('sumPrint').innerHTML = document.getElementById('sumBox').innerHTML;
    form.hidden = true;
    document.getElementById('briefDone').hidden = false;
    if (degradado) {
      var lineas = [];
      Object.keys(ETIQUETAS).forEach(function(k){
        if (payload[k]) lineas.push(ETIQUETAS[k] + ': ' + payload[k]);
      });
      var href = 'mailto:proyectos@ibisne.com'
        + '?subject=' + encodeURIComponent('Brief de proyecto · ' + (payload.nombre || ''))
        + '&body=' + encodeURIComponent(lineas.join('\n'));
      document.getElementById('mailFallback').setAttribute('href', href);
      document.getElementById('avisoEnvio').hidden = false;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('btnPdf').addEventListener('click', function(){ window.print(); });
})();
</script>
"""


def _wins():
    return "\n        ".join(
        f'<div class="win">{ic(icono)}<span>{texto}</span></div>' for icono, texto in INCLUIDOS
    )


def _stepper():
    return "\n      ".join(
        f'<button type="button" class="qs" data-n="{n}" title="{rotulo}" aria-label="{rotulo}">{ic(icono)}</button>'
        for n, (icono, rotulo) in enumerate(PASOS)
    )


def _qside(titulo, sub):
    """Columna de contexto. Sin numeral ni icono: ambos viven en el stepper."""
    return f'<div class="qside"><h3>{titulo}</h3><p>{sub}</p></div>'


def build_empecemos():
    body = f"""
<section class="quiz"><div class="wrap" style="max-width:58rem">

  <!-- ══════ BIENVENIDA ══════ -->
  <div class="qwel" id="qwelcome">
    <span class="eyebrow">Para ti, que ya viste tu MVP</span>
    <h1>Llevemos tu MVP a su versión final.</h1>
    <p class="lede">Tu proyecto nos causó tal impresión que con gusto construimos tu MVP. Esperamos que te haya gustado lo suficiente como para terminar lo que empezamos.</p>

    <p class="gift">Si cierras antes del <b>{PROMO_FECHA}</b>, estas seis cosas van incluidas sin costo:</p>
    <div class="wins">
        {_wins()}
    </div>

    <div class="promo">
      <span class="pct">5%</span>
      <span class="ptxt">Y sumamos un <b>5% extra de descuento</b> sobre la última cotización que preparamos para ti. Se aplica encima de las condiciones que ya tienes.</span>
    </div>

    <p class="lede" style="margin-bottom:1.4rem">Llena este formato y lancemos juntos. Toma menos de dos minutos.</p>
    <button type="button" class="btn btn-primary btn-lg" id="btnStart">Empecemos {ic('arw')}</button>
  </div>

  <!-- ══════ QUIZ ══════ -->
  <form class="form" id="briefForm" novalidate hidden>

    <div class="qsteps" id="qSteps">
      {_stepper()}
    </div>
    <div class="qsnum" id="qbNum">Paso 1 de 6</div>

    <div class="qbody">

      <!-- 1 · CONTACTO -->
      <div class="qstep">
        <div class="qcard">
          {_qside('¿Con quién hablamos?', 'Con esto te damos seguimiento y te mandamos los avances.')}
          <div class="qmain">
            <div class="fgrid">
              <div class="fgroup"><label for="nombre">Nombre</label>
                <input class="input" id="nombre" name="nombre" autocomplete="name" placeholder="Tu nombre"></div>
              <div class="fgroup"><label for="empresa">Proyecto o negocio</label>
                <input class="input" id="empresa" name="empresa" autocomplete="organization" placeholder="Cómo se llama"></div>
            </div>
            <div class="fgrid" style="margin-top:.9rem">
              <div class="fgroup"><label for="email">Correo</label>
                <input class="input" id="email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="tucorreo@dominio.com"></div>
              <div class="fgroup"><label for="telefono">WhatsApp, 10 dígitos</label>
                <input class="input" id="telefono" name="telefono" type="tel" autocomplete="tel" inputmode="tel" maxlength="17" placeholder="33 1234 5678"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2 · SITIO WEB -->
      <div class="qstep" hidden>
        <div class="qcard">
          {_qside('Tu sitio web', 'Dónde va a vivir el proyecto cuando salga a producción.')}
          <div class="qmain">
            <div class="fgroup"><span class="lb">¿Ya tienes sitio web?</span>
              <div class="opts two-up">
                <label class="opt"><input type="radio" name="tiene_sitio" value="Sí"><span>Sí, ya tengo</span></label>
                <label class="opt"><input type="radio" name="tiene_sitio" value="No"><span>Todavía no</span></label>
              </div>
            </div>
            <div class="fgroup cond" id="condDominio" hidden>
              <label for="dominio" id="lbDominio">¿Cuál es tu dominio?</label>
              <input class="input" id="dominio" name="dominio" inputmode="url" placeholder="tudominio.com">
            </div>
            <div class="fgroup"><span class="lb">¿Necesitas correos corporativos?</span>
              <div class="opts">
                <label class="opt"><input type="radio" name="correos_corp" value="Sí, los necesito"><span>Sí, los necesito</span></label>
                <label class="opt"><input type="radio" name="correos_corp" value="Ya tengo"><span>Ya tengo</span></label>
                <label class="opt"><input type="radio" name="correos_corp" value="No estoy seguro"><span>No estoy seguro</span></label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3 · PRESENCIA -->
      <div class="qstep" hidden>
        <div class="qcard">
          {_qside('Dónde te encuentran', 'Para conectar el sitio con lo que ya tienes andando.')}
          <div class="qmain">
            <div class="fgroup"><span class="lb">¿Tu negocio está en redes sociales?</span>
              <div class="opts two-up">
                <label class="opt"><input type="radio" name="en_redes" value="Sí"><span>Sí</span></label>
                <label class="opt"><input type="radio" name="en_redes" value="Todavía no"><span>Todavía no</span></label>
              </div>
            </div>
            <div class="fgroup cond" id="condRedes" hidden><span class="lb">¿En cuáles?</span>
              <div class="opts two-up">
                <label class="opt"><input type="checkbox" name="redes" value="Instagram"><span>Instagram</span></label>
                <label class="opt"><input type="checkbox" name="redes" value="Facebook"><span>Facebook</span></label>
                <label class="opt"><input type="checkbox" name="redes" value="TikTok"><span>TikTok</span></label>
                <label class="opt"><input type="checkbox" name="redes" value="LinkedIn"><span>LinkedIn</span></label>
              </div>
            </div>
            <div class="fgroup"><span class="lb">¿Apareces en Google con tu ficha de negocio?</span>
              <div class="opts">
                <label class="opt"><input type="radio" name="google_ficha" value="Sí, ya aparezco"><span>Sí, ya aparezco</span></label>
                <label class="opt"><input type="radio" name="google_ficha" value="No"><span>No</span></label>
                <label class="opt"><input type="radio" name="google_ficha" value="No estoy seguro"><span>No estoy seguro</span></label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 · TIEMPOS -->
      <div class="qstep" hidden>
        <div class="qcard">
          {_qside('Tus tiempos', 'Con esto organizamos el arranque y reservamos el equipo.')}
          <div class="qmain">
            <div class="fgroup"><span class="lb">¿Qué tan urgente es?</span>
              <div class="opts">
                <label class="opt"><input type="radio" name="urgencia" value="Urgente, ya quiero arrancar"><span>Urgente, ya quiero arrancar</span></label>
                <label class="opt"><input type="radio" name="urgencia" value="Me puedo esperar"><span>Me puedo esperar</span></label>
                <label class="opt"><input type="radio" name="urgencia" value="Lo sigo pensando"><span>Lo sigo pensando</span></label>
              </div>
            </div>
            <div class="fgroup cond" id="condFecha" hidden>
              <label for="fecha_lanzamiento">¿Para cuándo te gustaría lanzar?</label>
              <input class="input" id="fecha_lanzamiento" name="fecha_lanzamiento" type="date">
            </div>
          </div>
        </div>
      </div>

      <!-- 5 · INVERSION -->
      <div class="qstep" hidden>
        <div class="qcard">
          {_qside('Tu inversión', 'Nos ayuda a proponerte el alcance que sí te cuadra.')}
          <div class="qmain">
            <div class="fgroup"><span class="lb">¿Qué inversión tienes contemplada?</span>
              <div class="opts">
                <label class="opt"><input type="radio" name="inversion" value="Hasta $15,000"><span>Hasta $15,000</span></label>
                <label class="opt"><input type="radio" name="inversion" value="$15,000 a $35,000"><span>$15,000 a $35,000</span></label>
                <label class="opt"><input type="radio" name="inversion" value="$35,000 a $75,000"><span>$35,000 a $75,000</span></label>
                <label class="opt"><input type="radio" name="inversion" value="Más de $75,000"><span>Más de $75,000</span></label>
                <label class="opt"><input type="radio" name="inversion" value="Prefiero definirlo juntos"><span>Prefiero definirlo juntos</span></label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6 · RESUMEN -->
      <div class="qstep" hidden>
        <div class="qcard">
          {_qside('Revisa y envía', 'Esto es lo que nos llega. Puedes volver atrás a corregir.')}
          <div class="qmain">
            <div class="summary" id="sumBox"></div>
            <div class="consent-field">
              <input type="checkbox" id="acepto">
              <label for="acepto">Autorizo a iBisne a usar estos datos para dar seguimiento a mi proyecto, conforme al <a href="/legal/privacidad/">Aviso de privacidad</a>.</label>
            </div>
          </div>
        </div>
      </div>

    </div>

    <input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">

    <div class="qnav">
      <button type="button" class="btn btn-secondary" id="btnPrev" hidden>Atrás</button>
      <button type="button" class="btn btn-primary grow" id="btnNext">Continuar {ic('arw')}</button>
      <button type="submit" class="btn btn-primary grow" id="btnSend" hidden>Enviar {ic('arw')}</button>
    </div>
    <div class="qmsg" id="qMsg"></div>
  </form>

  <!-- ══════ CIERRE ══════ -->
  <div class="done" id="briefDone" hidden>
    <div class="mark">{ic('check')}</div>
    <h3>Listo, ya lo tenemos.</h3>
    <p>Gracias por tomarte el tiempo. Revisamos tu información y te contactamos para afinar los detalles y cerrar el arranque.</p>
    <p style="margin-top:.9rem"><b style="color:var(--ink)">Tu 5% extra sigue en pie</b> si cierras antes del {PROMO_FECHA}.</p>

    <div class="acts">
      <button type="button" class="btn btn-secondary" id="btnPdf">Descargar mi resumen en PDF</button>
      <a class="btn btn-ghost" href="{HOME}">Volver al inicio</a>
    </div>

    <div class="warnbox" id="avisoEnvio" hidden>
      <p><b>Un detalle:</b> no pudimos confirmar la entrega automática de tus datos. Para que nada se pierda, mándanoslos con un clic: ya van escritos en el correo.</p>
      <a class="btn btn-primary" id="mailFallback" href="mailto:proyectos@ibisne.com">Enviar por correo</a>
    </div>

    <div class="prt" style="margin-top:2rem;text-align:left">
      <div style="font-size:.72rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#888;margin-bottom:.5rem">iBisne · Brief de proyecto</div>
      <div class="summary" id="sumPrint"></div>
      <div style="font-size:.75rem;color:#888;margin-top:1rem">proyectos@ibisne.com · ibisne.com · 5% extra vigente hasta el {PROMO_FECHA}</div>
    </div>
  </div>

</div></section>
{EMPECEMOS_JS}
"""
    return base("Empecemos — iBisne", "Llevemos tu MVP a su versión final.",
                body, active="", canonical="/empecemos/", noindex=True)


# ================================================================================
# PROMO · LANDING PAGES  ·  /promos/landing-pages/
# ================================================================================
# Pieza de venta en frio: se manda por link a un prospecto, no se navega desde el
# sitio. Por eso sale con noindex, NO entra al sitemap y NO se agrega al NAV.
# Publicar "5.000 MXN" abierto al buscador contradice el posicionamiento de tech
# studio que sostienen /inversion/ y /portafolio/. El link si se puede compartir.
#
# No choca con la regla "sin precio fijo" del CLAUDE.md: esa aplica al Sprint de
# Validacion de producto. El propio documento dice que sitios y tiendas se cotizan
# directo, y una landing page es exactamente eso.
#
# ⚠️ PENDIENTE DE EDUARDO · pegar los links de cobro en PAGOS y los datos en SPEI.
#    Mientras esten vacios NO se dibuja el boton: el CTA cae al formulario de
#    reserva. Nunca se manda a nadie a un checkout roto.

PROMO_VENCE = "31 de agosto de 2026"
PROMO_VENCE_ISO = "2026-08-31T23:59:59-06:00"
WA_NUM = "523329575274"

# Links de cobro hospedados. Cero captura de tarjeta en el sitio: sin alcance PCI
# y sin tocar la CSP (son <a href>, no formularios ni scripts de terceros).
PAGOS = {
    "lanzamiento": {
        "contado": {"mercadopago": "", "paypal": "", "stripe": ""},
        "msi":     {"mercadopago": "", "paypal": "", "stripe": ""},
    },
    "captacion": {
        "contado": {"mercadopago": "", "paypal": "", "stripe": ""},
        "msi":     {"mercadopago": "", "paypal": "", "stripe": ""},
    },
    "cinetica": {
        "contado": {"mercadopago": "", "paypal": "", "stripe": ""},
        "msi":     {"mercadopago": "", "paypal": "", "stripe": ""},
    },
}

# Transferencia SPEI. Sin link: son datos bancarios. Si CLABE viene vacia, el
# bloque entero no se dibuja.
SPEI = {"banco": "", "beneficiario": "", "clabe": "", "concepto": "Landing iBisne"}

METODOS = [
    ("mercadopago", "Mercado Pago", "cart"),
    ("paypal", "PayPal", "coins"),
    ("stripe", "Stripe", "blocks"),
]

PLAZOS = [3, 6, 12]          # meses sin intereses ofrecidos
PLAZO_DEF = 12               # el que sale preseleccionado: la mensualidad mas baja
DESC_CONTADO = 0.10          # 10% por pago en una sola exhibicion

PLANES = [
    {
        "slug": "lanzamiento", "precio": 5000, "dias": 5, "destacado": False,
        "nombre": ("Lanzamiento", "Launch"),
        "tag": ("Landing simple", "Simple landing"),
        "para": ("Para validar una oferta rápido y tener presencia seria esta semana.",
                 "To validate an offer fast and look serious this week."),
        "hereda": None,
        "incluye": [
            ("Diseño a medida, hero más cuatro bloques", "Custom design, hero plus four blocks"),
            ("Diseñada en móvil primero, de arriba a abajo", "Designed mobile first, top to bottom"),
            ("Modo claro y modo oscuro", "Light and dark mode"),
            ("Formulario de contacto directo a tu correo", "Contact form straight to your inbox"),
            ("Botón de WhatsApp con mensaje ya escrito", "WhatsApp button with the message pre written"),
            ("Tu dominio conectado y certificado SSL", "Your domain connected, SSL certificate"),
            ("Carga optimizada, Core Web Vitals en verde", "Optimized load, Core Web Vitals in green"),
            ("Entrega en 5 días hábiles", "Delivered in 5 business days"),
        ],
    },
    {
        "slug": "captacion", "precio": 10000, "dias": 10, "destacado": True,
        "nombre": ("Captación", "Capture"),
        "tag": ("Landing robusta para leads", "Lead driven landing"),
        "para": ("Para que la página trabaje: cada visita entra a tu pipeline con nombre y teléfono.",
                 "So the page works: every visit enters your pipeline with a name and a phone."),
        "hereda": ("Todo lo de Lanzamiento, más:", "Everything in Launch, plus:"),
        "incluye": [
            ("Estructura de conversión completa, de ocho a diez bloques", "Full conversion structure, eight to ten blocks"),
            ("Los leads llegan a tu correo y a Slack al instante", "Leads reach your inbox and Slack instantly"),
            ("Formulario por pasos, con validación", "Step by step form, with validation"),
            ("Prueba social: testimonios y casos reales", "Social proof: testimonials and real cases"),
            ("Bloque de preguntas que resuelve objeciones", "FAQ block that answers objections"),
            ("Google Analytics 4 con eventos de conversión", "Google Analytics 4 with conversion events"),
            ("Pixel de Meta y etiqueta de Google Ads", "Meta pixel and Google Ads tag"),
            ("SEO técnico y tarjetas para redes", "Technical SEO and social cards"),
            ("Bilingüe, español e inglés", "Bilingual, Spanish and English"),
            ("Entrega en 10 días hábiles", "Delivered in 10 business days"),
        ],
    },
    {
        "slug": "cinetica", "precio": 15000, "dias": 15, "destacado": False,
        "nombre": ("Cinética", "Kinetic"),
        "tag": ("Landing animada de punta a punta", "Fully animated landing"),
        "para": ("Para cuando la página tiene que dejar huella al primer scroll. Esta que estás leyendo es de este nivel.",
                 "For when the page has to land on the first scroll. The one you are reading is this tier."),
        "hereda": ("Todo lo de Captación, más:", "Everything in Capture, plus:"),
        "incluye": [
            ("Animación ligada al scroll en cada sección", "Scroll linked animation in every section"),
            ("Transiciones de vista entre estados", "View transitions between states"),
            ("Micro interacciones en todo lo accionable", "Micro interactions on everything clickable"),
            ("Movimiento nativo del navegador, cero librerías, cero peso extra", "Native browser motion, zero libraries, zero extra weight"),
            ("Instalable como app, con su icono en el teléfono", "Installable as an app, with its icon on the phone"),
            ("Accesibilidad AA y respeto a reducir movimiento", "AA accessibility, honors reduced motion"),
            ("Sesión de estrategia de mensaje, 60 minutos", "Message strategy session, 60 minutes"),
            ("Dos rondas de ajuste después de entregar", "Two rounds of adjustments after delivery"),
            ("Entrega en 15 días hábiles", "Delivered in 15 business days"),
        ],
    },
]

PROMO_FAQ = [
    (("¿Y si el diseño no me convence?", "What if I do not like the design?"),
     ("Antes de la mitad del plazo ves el primer avance visual. Si la dirección no es la que buscabas, se ajusta sin costo y seguimos.",
      "You see the first visual draft before the halfway mark. If the direction is off, we adjust at no cost and keep going.")),
    (("¿El dominio y el hosting entran?", "Are domain and hosting included?"),
     ("Conectamos el dominio que ya tengas y el primer año de hospedaje va incluido. Si aún no tienes dominio, lo conseguimos al costo.",
      "We connect the domain you already own and the first year of hosting is included. No domain yet, we get it at cost.")),
    (("¿Puedo pagar a meses?", "Can I pay monthly?"),
     ("Sí. Meses sin intereses a 3, 6 o 12 con tarjetas Visa y Mastercard participantes. Pagando en una sola exhibición son 10% menos.",
      "Yes. Interest free at 3, 6 or 12 months with participating Visa and Mastercard. Paying in full is 10% less.")),
    (("¿Cuándo empiezan?", "When do you start?"),
     ("El mismo día que confirmamos el pago. El plazo de entrega corre en días hábiles desde ahí.",
      "The same day payment clears. The delivery window runs in business days from there.")),
    (("¿La página queda a mi nombre?", "Do I own the page?"),
     ("Sí. Al liquidar, el código y la plataforma quedan a tu nombre, con todos los accesos en tus manos.",
      "Yes. On final payment, the code and the platform go under your name, with every access in your hands.")),
    (("¿Qué necesitan de mí?", "What do you need from me?"),
     ("Tu logo y una idea de lo que quieres decir. Si no tienes textos, los escribimos nosotros.",
      "Your logo and an idea of what you want to say. No copy yet, we write it.")),
    (("¿Emiten factura?", "Do you invoice?"),
     ("Sí, factura fiscal con IVA desglosado. Los precios de esta página no lo incluyen.",
      "Yes, tax invoice with VAT itemized. The prices on this page do not include it.")),
]

PROMO_PASOS = [
    (("Eliges nivel", "Pick a tier"), ("Aquí mismo, en dos taps.", "Right here, in two taps."), "cart"),
    (("Confirmas pago", "Confirm payment"), ("Tarjeta, PayPal o transferencia SPEI.", "Card, PayPal or SPEI transfer."), "coins"),
    (("Nos das el material", "Send the material"), ("Logo, textos y ejemplos. Diez minutos.", "Logo, copy and examples. Ten minutes."), "cms"),
    (("Sale en línea", "It goes live"), ("Con tu dominio, midiendo desde el día uno.", "On your domain, measuring from day one."), "zap"),
]

# Textos sueltos de la pagina. Clave -> (es, en). El HTML sale en espanol y lleva
# data-i18n; el diccionario ingles viaja como JSON y el toggle intercambia.
PT = {
    "kicker":   ("Promoción vigente", "Live offer"),
    "h1":       ("Landing pages que cobran lo que valen.",
                 "Landing pages that earn their price."),
    "lede":     ("Tres niveles, precio cerrado y fecha de entrega por escrito. Diseñadas para móvil primero, instalables como app y listas en español e inglés.",
                 "Three tiers, closed price and a delivery date in writing. Mobile first, installable as an app, ready in Spanish and English."),
    "cta1":     ("Ver precios", "See pricing"),
    "cta2":     ("Hablar por WhatsApp", "Chat on WhatsApp"),
    "vence":    ("Estos precios se sostienen hasta el", "These prices hold until"),
    "t1":       ("31 proyectos entregados", "31 projects delivered"),
    "t2":       ("Zapopan y Mérida", "Zapopan and Mérida"),
    "t3":       ("Entrega desde 5 días", "Delivery from 5 days"),
    "pr_eye":   ("Precios", "Pricing"),
    "pr_h2":    ("Elige cómo quieres pagar y qué tan lejos quieres llegar.",
                 "Choose how you pay and how far you want to go."),
    "pr_p":     ("El precio no cambia después. Lo que ves es lo que se factura.",
                 "The price does not move later. What you see is what gets invoiced."),
    "sw_lab":   ("Forma de pago", "Payment method"),
    "sw_one":   ("Una sola exhibición", "Single payment"),
    "sw_msi":   ("Meses sin intereses", "Interest free months"),
    # Version en minuscula: se concatena despues del numero de meses ("12 meses sin
    # intereses"). Con la clave de arriba salia una mayuscula a media frase.
    "msi_low":  ("meses sin intereses", "months interest free"),
    "titulo":   ("Landing pages desde $5,000 MXN, iBisne",
                 "Landing pages from $5,000 MXN, iBisne"),
    "sw_save":  ("ahorras 10%", "save 10%"),
    "plazo":    ("Plazo", "Term"),
    "cards":    ("Visa y Mastercard participantes", "Participating Visa and Mastercard"),
    "reco":     ("El que más se contrata", "Most chosen"),
    "antes":    ("antes", "before"),
    "pay_now":  ("Pagar ahora", "Pay now"),
    "reserve":  ("Apartar mi lugar", "Reserve my slot"),
    "ask":      ("Preguntar antes", "Ask first"),
    "pay_h":    ("Cómo quieres pagarlo", "How you want to pay it"),
    "spei_h":   ("Transferencia SPEI", "SPEI transfer"),
    "spei_c":   ("Copiar CLABE", "Copy CLABE"),
    "spei_ok":  ("Copiada", "Copied"),
    "demo_eye": ("Nivel Cinética", "Kinetic tier"),
    "demo_h2":  ("Esto no se explica. Se ve.", "This is not explained. It is seen."),
    "demo_p":   ("Cada bloque de esta página reacciona a tu scroll, sin una sola librería de animación cargada. Peso extra: cero kilobytes.",
                 "Every block on this page reacts to your scroll, without a single animation library loaded. Extra weight: zero kilobytes."),
    "demo_1":   ("Entra con el scroll", "Enters on scroll"),
    "demo_2":   ("Responde al dedo", "Responds to touch"),
    "demo_3":   ("Se apaga si molesta", "Backs off if unwanted"),
    "demo_n":   ("Si tu sistema pide menos movimiento, la página lo obedece sin perder nada de información.",
                 "If your system asks for less motion, the page obeys without losing any information."),
    "pf_eye":   ("Trabajo entregado", "Delivered work"),
    "pf_h2":    ("No es la primera vez que hacemos esto.", "This is not our first one."),
    "pf_p":     ("Una muestra del portafolio. Cada ficha abre el caso completo.",
                 "A sample of the portfolio. Each card opens the full case."),
    "pf_all":   ("Ver el portafolio completo", "See the full portfolio"),
    "ps_eye":   ("Cómo corre", "How it runs"),
    "ps_h2":    ("Cuatro pasos y estás en línea.", "Four steps and you are live."),
    "faq_eye":  ("Antes de que preguntes", "Before you ask"),
    "faq_h2":   ("Las siete dudas de siempre.", "The usual seven questions."),
    "fm_eye":   ("Arranquemos", "Let us start"),
    "fm_h2":    ("Dime cuál quieres y lo dejamos amarrado.", "Tell me which one and we lock it in."),
    "fm_p":     ("Un minuto de tu tiempo. Te contesto el mismo día.",
                 "One minute of your time. Same day reply."),
    "f_name":   ("Tu nombre", "Your name"),
    "f_wa":     ("WhatsApp, 10 dígitos", "WhatsApp, 10 digits"),
    "f_mail":   ("Correo", "Email"),
    "f_biz":    ("Tu negocio o proyecto", "Your business or project"),
    "f_plan":   ("Nivel que te interesa", "Tier you want"),
    "f_msg":    ("Qué quieres lograr, en una línea", "What you want to achieve, in one line"),
    "f_send":   ("Enviar y apartar", "Send and reserve"),
    "f_ok_h":   ("Listo, ya lo tenemos.", "Got it."),
    "f_ok_p":   ("Te contactamos hoy mismo para amarrar el arranque. Si tienes prisa, escríbenos por WhatsApp y vamos directo.",
                 "We contact you today to lock the start. In a hurry, message us on WhatsApp and we go straight there."),
    "f_err":    ("No pudimos enviarlo. Escríbenos por WhatsApp y lo resolvemos en un minuto.",
                 "We could not send it. Message us on WhatsApp and we solve it in a minute."),
    "f_priv":   ("Autorizo a iBisne a contactarme sobre este proyecto, conforme al",
                 "I authorize iBisne to contact me about this project, under the"),
    "f_privl":  ("aviso de privacidad", "privacy notice"),
    "guar_h":   ("Lo que sostiene el precio", "What holds the price up"),
    "g1":       ("Precio cerrado, sin sorpresas al final", "Closed price, no surprises at the end"),
    "g2":       ("Fecha de entrega por escrito", "Delivery date in writing"),
    "g3":       ("Al liquidar, el código queda a tu nombre", "On final payment, the code is yours"),
    "g4":       ("Factura fiscal con IVA desglosado", "Tax invoice with VAT itemized"),
    "fine":     ("Precios en pesos mexicanos, más IVA. Los meses sin intereses aplican con tarjetas de crédito participantes de Visa y Mastercard, sujeto a la aprobación de tu banco. El descuento de 10% aplica únicamente al pago en una sola exhibición.",
                 "Prices in Mexican pesos, plus VAT. Interest free months apply with participating Visa and Mastercard credit cards, subject to your bank's approval. The 10% discount applies only to the single payment option."),
    "ab_cta":   ("Quiero la mía", "I want mine"),
    "wa_msg":   ("Hola, vi la promoción de landing pages y me interesa el nivel",
                 "Hi, I saw the landing page offer and I am interested in the tier"),
}


def pt(k, lang=0):
    return PT[k][lang]


def money(n):
    return f"{n:,.0f}"


def money2(n):
    return f"{n:,.2f}"


def wa_link(plan_nombre):
    msg = f"{pt('wa_msg')} {plan_nombre}."
    return f"https://wa.me/{WA_NUM}?text=" + msg.replace(" ", "%20").replace(",", "%2C")


def promo_pay_links(slug):
    """Botones de cobro que SI existen. Sin links configurados devuelve cadena vacia
    y la card cae al CTA de reserva: nunca se manda a nadie a un checkout roto."""
    out = []
    for modo in ("contado", "msi"):
        for key, label, icon in METODOS:
            url = PAGOS.get(slug, {}).get(modo, {}).get(key, "")
            if not url:
                continue
            out.append(
                f'<a class="lp-pay" href="{url}" target="_blank" rel="noopener nofollow" '
                f'data-modo="{modo}" data-metodo="{key}" data-plan="{slug}">'
                f'{ic(icon)}<span>{label}</span></a>')
    return "".join(out)


def promo_spei():
    if not SPEI.get("clabe"):
        return ""
    return f"""<div class="lp-spei">
      <div class="lp-spei-h">{ic('db')}<span data-i18n="spei_h">{pt('spei_h')}</span></div>
      <dl>
        <div><dt>Banco</dt><dd>{SPEI['banco']}</dd></div>
        <div><dt>Beneficiario</dt><dd>{SPEI['beneficiario']}</dd></div>
        <div><dt>CLABE</dt><dd><code id="lpClabe">{SPEI['clabe']}</code></dd></div>
        <div><dt>Concepto</dt><dd>{SPEI['concepto']}</dd></div>
      </dl>
      <button type="button" class="btn btn-secondary" id="lpCopy" data-i18n="spei_c">{pt('spei_c')}</button>
    </div>"""


def promo_card(p):
    base_price = p["precio"]
    contado = round(base_price * (1 - DESC_CONTADO))
    lista = "".join(
        f'<li>{ic("check")}<span data-i18n="inc_{p["slug"]}_{i}">{es}</span></li>'
        for i, (es, en) in enumerate(p["incluye"]))
    hereda = ""
    if p["hereda"]:
        hereda = f'<p class="lp-her" data-i18n="her_{p["slug"]}">{p["hereda"][0]}</p>'
    pays = promo_pay_links(p["slug"])
    if pays:
        cta = (f'<button type="button" class="btn btn-primary btn-lg grow lp-open" '
               f'data-plan="{p["slug"]}" data-i18n="pay_now">{pt("pay_now")}</button>')
    else:
        cta = (f'<a class="btn btn-primary btn-lg grow lp-pick" href="#reservar" '
               f'data-plan="{p["slug"]}" data-i18n="reserve">{pt("reserve")}</a>')
    return f"""<article class="lp-card{' is-reco' if p['destacado'] else ''}" data-plan="{p['slug']}" data-base="{base_price}">
      {'<span class="lp-reco" data-i18n="reco">' + pt('reco') + '</span>' if p['destacado'] else ''}
      <div class="lp-card-h">
        <span class="lp-tag" data-i18n="tag_{p['slug']}">{p['tag'][0]}</span>
        <h3 data-i18n="nom_{p['slug']}">{p['nombre'][0]}</h3>
        <p class="lp-para" data-i18n="para_{p['slug']}">{p['para'][0]}</p>
      </div>
      <div class="lp-price">
        <span class="lp-was"><s>${money(base_price)}</s></span>
        <span class="lp-now">${money(contado)}</span>
        <span class="lp-per">MXN</span>
      </div>
      <p class="lp-sub">{pt('sw_one')}</p>
      {cta}
      <a class="lp-alt" href="{wa_link(p['nombre'][0])}" target="_blank" rel="noopener" data-i18n="ask">{pt('ask')}</a>
      {hereda}
      <ul class="lp-inc">{lista}</ul>
    </article>"""


def build_promos(projects):
    planes = "".join(promo_card(p) for p in PLANES)
    plazos = "".join(
        f'<option value="{m}"{" selected" if m == PLAZO_DEF else ""}>{m}</option>'
        for m in PLAZOS)
    pasos = "".join(
        f'<div class="lp-step"><span class="n">{i + 1}</span><div class="ico">{ic(icon)}</div>'
        f'<h4 data-i18n="paso_{i}">{tt[0]}</h4><p data-i18n="pasod_{i}">{dd[0]}</p></div>'
        for i, ((tt), (dd), icon) in enumerate(PROMO_PASOS))
    faq = "".join(
        f'<details name="lpfaq" class="lp-faq">'
        f'<summary><span data-i18n="faq_q{i}">{q[0]}</span>{ic("down")}</summary>'
        f'<p data-i18n="faq_a{i}">{a[0]}</p></details>'
        for i, (q, a) in enumerate(PROMO_FAQ))
    proof = "".join(pf_card(p) for p in projects[:6])
    opciones = "".join(
        f'<option value="{p["slug"]}">{p["nombre"][0]} · ${money(p["precio"])}</option>'
        for p in PLANES)
    metodos_all = "".join(promo_pay_links(p["slug"]) for p in PLANES)
    pay_sheet = ""
    if metodos_all or SPEI.get("clabe"):
        pay_sheet = f"""<div class="lp-sheet" id="lpSheet" aria-hidden="true">
      <div class="lp-sheet-in" role="dialog" aria-modal="true" aria-labelledby="lpSheetH">
        <button type="button" class="lp-sheet-x" id="lpSheetX" aria-label="Cerrar">{ic('x')}</button>
        <h3 id="lpSheetH" data-i18n="pay_h">{pt('pay_h')}</h3>
        <div class="lp-sheet-sum" id="lpSheetSum"></div>
        <div class="lp-pays" id="lpPays">{metodos_all}</div>
        {promo_spei()}
      </div>
    </div>"""

    body = f"""
<div class="lp">

  <!-- ══════ HERO ══════ -->
  <section class="lp-hero">
    <div class="bgimg" style="background-image:url({bg_url('promos')})" aria-hidden="true"></div>
    <div class="wrap">
      <span class="lp-kick"><span class="dot"></span><span data-i18n="kicker">{pt('kicker')}</span></span>
      <h1 data-i18n="h1">{pt('h1')}</h1>
      <p class="lede" data-i18n="lede">{pt('lede')}</p>
      <div class="lp-acts">
        <a class="btn btn-primary btn-lg" href="#precios" data-i18n="cta1">{pt('cta1')}</a>
        <a class="btn btn-secondary btn-lg" href="{wa_link('')}" target="_blank" rel="noopener" data-i18n="cta2">{pt('cta2')}</a>
      </div>
      <div class="lp-count" id="lpCount" data-until="{PROMO_VENCE_ISO}">
        <span data-i18n="vence">{pt('vence')}</span> <b>{PROMO_VENCE}</b><span class="lp-clock" id="lpClock"></span>
      </div>
      <ul class="lp-trust">
        <li>{ic('layers')}<span data-i18n="t1">{pt('t1')}</span></li>
        <li>{ic('pin')}<span data-i18n="t2">{pt('t2')}</span></li>
        <li>{ic('zap')}<span data-i18n="t3">{pt('t3')}</span></li>
      </ul>
    </div>
  </section>

  <!-- ══════ PRECIOS ══════ -->
  <section class="sec" id="precios">
    <div class="wrap">
      <div class="sec-h">
        <span class="eyebrow" data-i18n="pr_eye">{pt('pr_eye')}</span>
        <h2 data-i18n="pr_h2">{pt('pr_h2')}</h2>
        <p data-i18n="pr_p">{pt('pr_p')}</p>
      </div>

      <div class="lp-switch" role="radiogroup" aria-label="{pt('sw_lab')}">
        <label class="lp-sw">
          <input type="radio" name="lpmodo" value="contado" checked>
          <span><b data-i18n="sw_one">{pt('sw_one')}</b><em data-i18n="sw_save">{pt('sw_save')}</em></span>
        </label>
        <label class="lp-sw">
          <input type="radio" name="lpmodo" value="msi">
          <span><b data-i18n="sw_msi">{pt('sw_msi')}</b><em data-i18n="cards">{pt('cards')}</em></span>
        </label>
      </div>

      <div class="lp-plazo" id="lpPlazoBox" hidden>
        <label for="lpPlazo" data-i18n="plazo">{pt('plazo')}</label>
        <select id="lpPlazo" class="input">{plazos}</select>
        <span data-i18n="cards">{pt('cards')}</span>
      </div>

      <div class="lp-plans {gcls(3)}">{planes}</div>

      <p class="lp-fine" data-i18n="fine">{pt('fine')}</p>
    </div>
  </section>

  <!-- ══════ DEMO DE MOVIMIENTO ══════ -->
  <section class="sec sec-alt lp-demo">
    <div class="wrap">
      <div class="sec-h">
        <span class="eyebrow" data-i18n="demo_eye">{pt('demo_eye')}</span>
        <h2 data-i18n="demo_h2">{pt('demo_h2')}</h2>
        <p data-i18n="demo_p">{pt('demo_p')}</p>
      </div>
      <div class="lp-motion">
        <div class="lp-mtile"><span class="lp-mnum" data-count="60">0</span><b data-i18n="demo_1">{pt('demo_1')}</b></div>
        <div class="lp-mtile"><span class="lp-mnum" data-count="100">0</span><b data-i18n="demo_2">{pt('demo_2')}</b></div>
        <div class="lp-mtile"><span class="lp-mnum" data-count="0">0</span><b data-i18n="demo_3">{pt('demo_3')}</b></div>
      </div>
      <p class="lp-note">{ic('shield')}<span data-i18n="demo_n">{pt('demo_n')}</span></p>
    </div>
  </section>

  <!-- ══════ PRUEBA ══════ -->
  <section class="sec">
    <div class="wrap">
      <div class="sec-h">
        <span class="eyebrow" data-i18n="pf_eye">{pt('pf_eye')}</span>
        <h2 data-i18n="pf_h2">{pt('pf_h2')}</h2>
        <p data-i18n="pf_p">{pt('pf_p')}</p>
      </div>
      <div class="pf-grid rail {gcls(6)}">{proof}</div>
      <div class="sec-cta"><a class="btn btn-secondary" href="/portafolio/" data-i18n="pf_all">{pt('pf_all')}</a></div>
    </div>
  </section>

  <!-- ══════ PROCESO ══════ -->
  <section class="sec sec-alt">
    <div class="wrap">
      <div class="sec-h">
        <span class="eyebrow" data-i18n="ps_eye">{pt('ps_eye')}</span>
        <h2 data-i18n="ps_h2">{pt('ps_h2')}</h2>
      </div>
      <div class="lp-steps">{pasos}</div>
    </div>
  </section>

  <!-- ══════ FAQ ══════ -->
  <section class="sec">
    <div class="wrap">
      <div class="sec-h">
        <span class="eyebrow" data-i18n="faq_eye">{pt('faq_eye')}</span>
        <h2 data-i18n="faq_h2">{pt('faq_h2')}</h2>
      </div>
      <div class="lp-faqs">{faq}</div>
    </div>
  </section>

  <!-- ══════ RESERVA ══════ -->
  <section class="sec sec-alt" id="reservar">
    <div class="wrap">
      <div class="lp-form-grid">
        <div class="sec-h" style="margin-bottom:0">
          <span class="eyebrow" data-i18n="fm_eye">{pt('fm_eye')}</span>
          <h2 data-i18n="fm_h2">{pt('fm_h2')}</h2>
          <p data-i18n="fm_p">{pt('fm_p')}</p>
          <ul class="lp-guar">
            <li>{ic('check')}<span data-i18n="g1">{pt('g1')}</span></li>
            <li>{ic('check')}<span data-i18n="g2">{pt('g2')}</span></li>
            <li>{ic('check')}<span data-i18n="g3">{pt('g3')}</span></li>
            <li>{ic('check')}<span data-i18n="g4">{pt('g4')}</span></li>
          </ul>
        </div>

        <form class="lp-form" id="lpForm" novalidate data-wa="{wa_link('')}">
          <div class="fgroup"><label for="lpNombre" data-i18n="f_name">{pt('f_name')}</label>
            <input class="input" id="lpNombre" name="nombre" autocomplete="name" required></div>
          <div class="fgroup"><label for="lpTel" data-i18n="f_wa">{pt('f_wa')}</label>
            <input class="input" id="lpTel" name="telefono" type="tel" inputmode="tel" autocomplete="tel" maxlength="17" required></div>
          <div class="fgroup"><label for="lpMail" data-i18n="f_mail">{pt('f_mail')}</label>
            <input class="input" id="lpMail" name="email" type="email" inputmode="email" autocomplete="email"></div>
          <div class="fgroup"><label for="lpEmp" data-i18n="f_biz">{pt('f_biz')}</label>
            <input class="input" id="lpEmp" name="empresa" autocomplete="organization"></div>
          <div class="fgroup"><label for="lpPlan" data-i18n="f_plan">{pt('f_plan')}</label>
            <select class="input" id="lpPlan" name="plan">{opciones}</select></div>
          <div class="fgroup"><label for="lpMsg" data-i18n="f_msg">{pt('f_msg')}</label>
            <input class="input" id="lpMsg" name="mensaje"></div>
          <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">
          <label class="lp-priv"><input type="checkbox" id="lpOk" required>
            <span><span data-i18n="f_priv">{pt('f_priv')}</span> <a href="/legal/privacidad/" data-i18n="f_privl">{pt('f_privl')}</a>.</span></label>
          <button type="submit" class="btn btn-primary btn-lg" id="lpSend" data-i18n="f_send">{pt('f_send')}</button>
          <p class="lp-msg" id="lpMsgBox" role="status"></p>
        </form>

        <div class="lp-done" id="lpDone" hidden>
          <div class="mark">{ic('check')}</div>
          <h3 data-i18n="f_ok_h">{pt('f_ok_h')}</h3>
          <p data-i18n="f_ok_p">{pt('f_ok_p')}</p>
          <a class="btn btn-primary" href="{wa_link('')}" target="_blank" rel="noopener" data-i18n="cta2">{pt('cta2')}</a>
        </div>
      </div>
    </div>
  </section>

  {pay_sheet}

  <div class="lp-abar" aria-label="Acciones">
    <a class="lp-abar-wa" href="{wa_link('')}" target="_blank" rel="noopener" aria-label="WhatsApp">{ic('wa')}</a>
    <a class="btn btn-primary grow" href="#precios" data-i18n="ab_cta">{pt('ab_cta')}</a>
  </div>

</div>
{promo_js()}
"""
    return base("Landing pages desde $5,000 MXN — iBisne",
                "Tres niveles de landing page con precio cerrado, entrega por escrito y pago a meses sin intereses. Diseño first mobile, bilingüe e instalable como app.",
                body, active="", canonical="/promos/landing-pages/", noindex=True)


# JS de la promo. Va como constante plana (no f-string) para no tener que duplicar
# cada llave del codigo. Los tres marcadores __ES__ / __EN__ / __DESC__ los sustituye
# promo_js() con los diccionarios y el descuento reales.
PROMO_JS = """
(function(){
  var root=document.documentElement;
  var DICT={es:__ES__, en:__EN__};
  var D=__DESC__;
  var lang='es';

  // La pagina se declara autosuficiente en idioma: sin esto, el listener global de
  // SCRIPTS dispararia el aviso de "version en ingles proximamente" encima de una
  // pagina que si esta traducida.
  root.setAttribute('data-i18n-ready','');

  function T(k){ return (DICT[lang] && DICT[lang][k]) || (DICT.es[k] || ''); }
  function fmt(n,d){ return n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}); }
  function ev(name,params){ try{ if(window.gtag) window.gtag('event',name,params||{}); }catch(e){} }

  // ---------- idioma ----------
  function setLang(L){
    lang = (L==='en') ? 'en' : 'es';
    root.setAttribute('lang', lang==='en' ? 'en' : 'es');
    document.title=DICT[lang].titulo||document.title;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var v=DICT[lang][el.getAttribute('data-i18n')];
      if(typeof v==='string') el.innerHTML=v;
    });
    document.querySelectorAll('.lang button').forEach(function(b){
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang')===lang));
    });
    try{ localStorage.setItem('ib_lang', lang); }catch(e){}
    price();
    clock();
  }
  document.querySelectorAll('.lang button').forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopImmediatePropagation();
      setLang(b.getAttribute('data-lang'));
      ev('lang_switch',{lang:b.getAttribute('data-lang')});
    });
  });

  // ---------- precios ----------
  var modoIn=document.querySelectorAll('input[name=lpmodo]');
  var plazoBox=document.getElementById('lpPlazoBox');
  var plazoSel=document.getElementById('lpPlazo');
  function modo(){ var c=document.querySelector('input[name=lpmodo]:checked'); return c?c.value:'contado'; }
  function price(){
    var m=modo(), pl=plazoSel?parseInt(plazoSel.value,10):12;
    if(plazoBox) plazoBox.hidden=(m!=='msi');
    document.querySelectorAll('.lp-card').forEach(function(c){
      var base=parseInt(c.getAttribute('data-base'),10);
      var was=c.querySelector('.lp-was'), now=c.querySelector('.lp-now');
      var per=c.querySelector('.lp-per'), sub=c.querySelector('.lp-sub');
      if(m==='contado'){
        was.hidden=false; was.innerHTML='<s>$'+fmt(base,0)+'</s>';
        now.textContent='$'+fmt(Math.round(base*(1-D)),0);
        per.textContent='MXN';
        sub.textContent=T('sw_one');
      } else {
        was.hidden=true;
        now.textContent='$'+fmt(base/pl,2);
        per.textContent='MXN /'+(lang==='en'?'mo':'mes');
        sub.textContent=pl+' '+T('msi_low')+' · total $'+fmt(base,0);
      }
    });
    document.querySelectorAll('.lp-pay').forEach(function(a){
      a.hidden=(a.getAttribute('data-modo')!==m);
    });
  }
  modoIn.forEach(function(r){ r.addEventListener('change',function(){ price(); ev('select_payment_mode',{mode:modo()}); }); });
  if(plazoSel) plazoSel.addEventListener('change',function(){ price(); ev('select_term',{months:plazoSel.value}); });
  price();

  // ---------- cuenta regresiva ----------
  var cbox=document.getElementById('lpCount'), clockEl=document.getElementById('lpClock');
  function clock(){
    if(!cbox||!clockEl) return;
    var end=new Date(cbox.getAttribute('data-until')).getTime();
    var left=end-Date.now();
    if(isNaN(end)||left<=0){ clockEl.textContent=''; return; }
    var d=Math.floor(left/86400000), h=Math.floor(left/3600000)%24;
    clockEl.textContent=' · '+d+(lang==='en'?'d ':'d ')+h+'h';
  }
  clock(); setInterval(clock,60000);

  // ---------- eleccion de nivel ----------
  var planSel=document.getElementById('lpPlan');
  document.querySelectorAll('.lp-pick').forEach(function(a){
    a.addEventListener('click',function(){
      var p=a.getAttribute('data-plan');
      if(planSel) planSel.value=p;
      ev('select_plan',{plan:p, mode:modo()});
    });
  });

  // ---------- hoja de pago ----------
  var sheet=document.getElementById('lpSheet');
  var sheetSum=document.getElementById('lpSheetSum');
  function openSheet(planSlug){
    if(!sheet) return;
    document.querySelectorAll('.lp-pay').forEach(function(a){
      a.hidden=!(a.getAttribute('data-plan')===planSlug && a.getAttribute('data-modo')===modo());
    });
    var card=document.querySelector('.lp-card[data-plan="'+planSlug+'"]');
    if(card && sheetSum){
      sheetSum.innerHTML='<b>'+card.querySelector('h3').textContent+'</b><span>'+
        card.querySelector('.lp-now').textContent+' '+card.querySelector('.lp-per').textContent+'</span>';
    }
    sheet.classList.add('open'); sheet.setAttribute('aria-hidden','false');
    document.body.classList.add('menu-lock');
    ev('begin_checkout',{plan:planSlug, mode:modo()});
  }
  function closeSheet(){
    if(!sheet) return;
    sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true');
    document.body.classList.remove('menu-lock');
    price();
  }
  document.querySelectorAll('.lp-open').forEach(function(b){
    b.addEventListener('click',function(){ openSheet(b.getAttribute('data-plan')); });
  });
  var sx=document.getElementById('lpSheetX'); if(sx) sx.addEventListener('click',closeSheet);
  if(sheet) sheet.addEventListener('click',function(e){ if(e.target===sheet) closeSheet(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeSheet(); });
  document.querySelectorAll('.lp-pay').forEach(function(a){
    a.addEventListener('click',function(){
      ev('add_payment_info',{plan:a.getAttribute('data-plan'), method:a.getAttribute('data-metodo'), mode:a.getAttribute('data-modo')});
    });
  });

  // ---------- SPEI ----------
  var cp=document.getElementById('lpCopy'), cl=document.getElementById('lpClabe');
  if(cp&&cl) cp.addEventListener('click',function(){
    var txt=cl.textContent.replace(/\\s/g,'');
    var done=function(){ cp.textContent=T('spei_ok'); setTimeout(function(){ cp.textContent=T('spei_c'); },2000); };
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done,function(){}); }
    else { var t=document.createElement('textarea'); t.value=txt; document.body.appendChild(t); t.select();
           try{ document.execCommand('copy'); done(); }catch(e){} document.body.removeChild(t); }
    ev('copy_clabe',{});
  });

  // ---------- movimiento ----------
  var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SD=window.CSS&&CSS.supports&&CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  // Sin scroll driven animations (Firefox) el efecto se recrea con IntersectionObserver.
  // Con soporte nativo NO se toca nada: el CSS es mas fluido que cualquier JS.
  if(!SD && !RM && 'IntersectionObserver' in window){
    var rv=document.querySelectorAll('.lp .sec-h, .lp-card, .lp-step, .lp-faq, .lp-mtile, .lp .pcard, .lp-form, .lp-guar');
    rv.forEach(function(el){ el.classList.add('rv'); });
    var io=new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{rootMargin:'0px 0px -8% 0px', threshold:.08});
    rv.forEach(function(el){ io.observe(el); });
  }
  // Contadores del bloque de demostracion
  if(!RM && 'IntersectionObserver' in window){
    var nio=new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(!e.isIntersecting) return;
        var el=e.target, to=parseInt(el.getAttribute('data-count'),10)||0, t0=null;
        function step(ts){ if(!t0) t0=ts; var k=Math.min((ts-t0)/900,1);
          el.textContent=Math.round(to*(1-Math.pow(1-k,3)));
          if(k<1) requestAnimationFrame(step); }
        requestAnimationFrame(step); nio.unobserve(el);
      });
    },{threshold:.5});
    document.querySelectorAll('.lp-mnum').forEach(function(el){ nio.observe(el); });
  }

  // ---------- formulario ----------
  var form=document.getElementById('lpForm'), done=document.getElementById('lpDone');
  var box=document.getElementById('lpMsgBox'), send=document.getElementById('lpSend');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    var d={}; new FormData(form).forEach(function(v,k){ d[k]=v; });
    if(d.website) return;
    if(!d.nombre || !(d.telefono||d.email)){ box.textContent=lang==='en'?'Name and a way to reach you, please.':'Falta tu nombre y un medio de contacto.'; return; }
    if(!document.getElementById('lpOk').checked){ box.textContent=lang==='en'?'Please accept the privacy notice.':'Falta autorizar el aviso de privacidad.'; return; }
    var slug=d.plan||'';
    var card=document.querySelector('.lp-card[data-plan="'+slug+'"]');
    var basep=card?parseInt(card.getAttribute('data-base'),10):0;
    var m=modo(), pl=plazoSel?plazoSel.value:'';
    d.origen='promo-landing-pages';
    d.vertical='landing page';
    d.subtipo=card?card.querySelector('h3').textContent:slug;
    d.modalidad = (m==='contado')
      ? (lang==='en'?'Single payment, 10% off':'Una exhibición, 10% de descuento')
      : (pl+(lang==='en'?' months interest free':' meses sin intereses'));
    d.total = m==='contado' ? String(Math.round(basep*(1-D))) : String(basep);
    d.currency='MXN';
    d.locale = lang==='en' ? 'en-US' : 'es-MX';
    send.disabled=true; box.textContent='';
    ev('generate_lead',{plan:slug, mode:m, value:parseInt(d.total,10)||0, currency:'MXN'});
    fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
      .then(function(r){ if(!r.ok) throw new Error('bad'); return r.json(); })
      .then(function(){ form.hidden=true; if(done) done.hidden=false; })
      .catch(function(){
        // El lead no se pierde por un fallo de red: el aviso trae el enlace ya
        // escrito, no solo la instruccion de escribir.
        send.disabled=false;
        box.innerHTML=T('f_err')+' <a href="'+form.getAttribute('data-wa')+
          '" target="_blank" rel="noopener">WhatsApp</a>';
      });
  });

  // ---------- arranque ----------
  // Prioridad: ?lang= gana sobre lo guardado. Es una pagina que se manda por link:
  // si compartes la version en ingles, tiene que abrir en ingles aunque el visitante
  // haya elegido espanol en otra visita.
  var saved=null; try{ saved=localStorage.getItem('ib_lang'); }catch(e){}
  var url=new URLSearchParams(location.search).get('lang');
  var nav=(navigator.language||'').toLowerCase().indexOf('es')===0 ? 'es' : 'en';
  setLang(url || saved || nav);
})();
"""


def promo_dict(i):
    """Diccionario completo de un idioma (0 es, 1 en): textos sueltos + los que
    viven dentro de PLANES, PROMO_FAQ y PROMO_PASOS. El JS necesita AMBOS: el
    precio y el plazo se reescriben en vivo y tienen que poder volver a espanol."""
    d = {k: v[i] for k, v in PT.items()}
    for p in PLANES:
        d[f"nom_{p['slug']}"] = p["nombre"][i]
        d[f"tag_{p['slug']}"] = p["tag"][i]
        d[f"para_{p['slug']}"] = p["para"][i]
        if p["hereda"]:
            d[f"her_{p['slug']}"] = p["hereda"][i]
        for j, par in enumerate(p["incluye"]):
            d[f"inc_{p['slug']}_{j}"] = par[i]
    for j, (q, a) in enumerate(PROMO_FAQ):
        d[f"faq_q{j}"] = q[i]
        d[f"faq_a{j}"] = a[i]
    for j, (tt, dd, _icon) in enumerate(PROMO_PASOS):
        d[f"paso_{j}"] = tt[i]
        d[f"pasod_{j}"] = dd[i]
    return d


def promo_js():
    return ("<script>\n" + PROMO_JS
            .replace("__ES__", json.dumps(promo_dict(0), ensure_ascii=False))
            .replace("__EN__", json.dumps(promo_dict(1), ensure_ascii=False))
            .replace("__DESC__", str(DESC_CONTADO)) + "\n</script>")


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


def legal_body(slug):
    """Lee el cuerpo del documento legal desde content/legal/, igual que los insights.
    Los textos son de Eduardo (portados de sus .docx en v31) y suman ~38k caracteres:
    como constantes de Python volverían este archivo inmanejable."""
    p = ROOT / "content" / "legal" / f"{slug}.html"
    return p.read_text(encoding="utf-8") if p.exists() else ""


LEGAL_NOTA = ('<p class="legal-nota"><strong>Este documento no constituye asesoría jurídica.</strong> '
              'iBisne S.A.S. de C.V. lo valida con su asesor legal. Última actualización: julio 2026.</p>')

def build_legal(slug, title, prose):
    body = f"""
<section class="phero">{bg_for(slug)}<div class="wrap" style="max-width:44rem">
  {crumb(("Legal", "/legal/terminos/"), title)}
  <span class="eyebrow">Legal</span><h1 style="font-size:clamp(1.9rem,4vw,2.8rem)">{title}</h1>
</div></section>
<section class="sec" style="border-top:0;padding-top:0"><div class="wrap"><div class="prose">{LEGAL_NOTA}{prose}</div></div></section>
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
    # v33 · dos listas. `todos` conserva los 31 para seguir generando cada ficha;
    # `projects` es la seleccion publicada y alimenta home, dominios, hub y sitemap.
    todos = load_projects()
    projects = visibles(todos)
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
        "empecemos/index.html": build_empecemos(),
        # Pieza de venta en frio. A proposito fuera de `urls`: no entra al sitemap
        # y sale con noindex. Se comparte por link, no se encuentra buscando.
        "promos/landing-pages/index.html": build_promos(projects),
        "legal/privacidad/index.html": build_legal("privacidad", "Política de privacidad", legal_body("privacidad")),
        "legal/terminos/index.html": build_legal("terminos", "Términos y condiciones", legal_body("terminos")),
        "legal/cancelacion/index.html": build_legal("cancelacion", "Política de cancelación", legal_body("cancelacion")),
        "legal/aviso-legal/index.html": build_legal("aviso-legal", "Aviso legal", AVISO_LEGAL),
        "legal/cookies/index.html": build_legal("cookies", "Política de cookies", COOKIES),
    }
    for d in DOMINIOS:
        pages[f"servicios/{d['slug']}/index.html"] = build_dominio(d, projects)
        urls.append(f"/servicios/{d['slug']}/")
    for p in todos:
        # La ficha de un oculto se regenera igual (con noindex), pero no entra al sitemap
        # y sus "relacionados" apuntan solo a proyectos publicados.
        pages[f"portafolio/{p['slug']}/index.html"] = build_project(p, projects)
        if p["slug"] not in OCULTOS:
            urls.append(f"/portafolio/{p['slug']}/")
    for slug, title, cat in INSIGHTS:
        pages[f"insights/{slug}/index.html"] = build_insight(slug, title, cat)
        urls.append(f"/insights/{slug}/")
    urls += ["/servicios/", "/como-trabajamos/", "/inversion/", "/portafolio/", "/estudio/", "/insights/",
             "/contacto/", "/por-que-ibisne/",
             "/legal/terminos/", "/legal/privacidad/", "/legal/cancelacion/",
             "/legal/aviso-legal/", "/legal/cookies/"]

    n = 0
    for path, html in pages.items():
        write(path, strip_dashes(html))
        n += 1
    write("sitemap.xml", sitemap(sorted(set(urls))))
    print(f"  OK: {n} páginas + sitemap.xml")
    print(f"  Dominios: {len(DOMINIOS)} · Proyectos: {len(projects)} publicados "
          f"({len(todos) - len(projects)} ocultos con noindex) · Insights: {len(INSIGHTS)}")


if __name__ == "__main__":
    main()


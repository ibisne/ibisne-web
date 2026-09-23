#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Puerta de calidad del sitio. Se corre DESPUES de build.py y ANTES de publicar.

build.py solo comprueba que las 62 paginas se escriben. No sabe si el HTML que
emite tiene estilos, si alguien metio un style= inline, o si un texto salio sin
acentos. Este script revisa lo que el build da por hecho:

  1. clases usadas en el HTML que no tienen ni una regla en dossier.css
  2. atributos style= inline (el CSS vive solo en dossier.css)
  3. em dash en texto visible
  4. palabras en espanol escritas sin acento
  5. enlaces internos que no llevan a ninguna pagina ni archivo
  6. grid-template-columns escrito a mano sobre contenedores que ya traen .g
  7. imagenes sin alt y sin width/height
  8. el ?v= del CSS, para que un cambio de estilos no quede cacheado

Uso:  python verificar.py            (falla con codigo 1 si hay algo bloqueante)
      python verificar.py --todo     (incluye la deuda previa ya conocida)
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).parent
CSS = ROOT / "assets/site/dossier.css"

# Clases sin regla propia que ya estaban antes de v55: se estilan por su otra
# clase o por el elemento. No son regresiones; se listan con --todo.
DEUDA_PREVIA = {"brand", "pwaico", "lp-card-h", "lp-pick", "lp-sec-agent", "lp-step-b"}

# style= inline que es funcional y va a proposito en el HTML, no decoracion:
# el sprite SVG oculto y las portadas, cuya URL cambia por proyecto.
INLINE_PERMITIDO = ("position:absolute", "background-image:url(")

# El sitio arrastra estilos inline desde antes de v55 (margin-top, color y
# max-width sueltos, sobre todo). Sacarlos a clases es un refactor aparte, asi
# que aqui no se bloquea por la deuda: se bloquea si CRECE. La base es la
# cuenta de v54, que es lo que hoy esta publicado.
INLINE_BASE = 466

PALABRAS_CON_TILDE = (
    "implementacion operacion informacion aplicacion validacion cotizacion produccion "
    "integracion automatizacion migracion gestion decision vision mision sesion version "
    "diseno disenos disenamos disenados reduccion adaptacion medicion facturacion rediseno "
    "aqui asi segun tambien mas dia dias estandar tecnologia categoria garantia analisis "
    "rapido proximo ultimo unico numero numeros credito metodo metodos metodologias agiles "
    "pagina paginas linea articulo economico logica practica electronico organico ademas "
    "despues quiza sintesis mexico renovacion investigacion facil incluyo"
).split()

fallos = []
avisos = []


def paginas():
    return sorted(p for p in ROOT.rglob("*.html") if "node_modules" not in str(p))


def rel(p):
    return str(p.relative_to(ROOT)).replace("\\", "/")


def texto_visible(html):
    t = re.sub(r"(?s)<(script|style|svg)\b.*?</\1>", " ", html)
    t = re.sub(r"(?s)<!--.*?-->", " ", t)
    return re.sub(r"<[^>]+>", "\n", t)


def revisar(todo=False):
    css = CSS.read_text(encoding="utf-8")
    css_clases = set(re.findall(r"\.([a-zA-Z][\w-]*)", css))

    usadas, inline, guiones, tildes, rotos, sin_alt, sin_dim = {}, [], [], [], [], [], []
    rutas = set()
    for f in paginas():
        r = str(f.parent.relative_to(ROOT)).replace("\\", "/").strip(".")
        rutas.add("/" + (r + "/" if r and r != "." else ""))

    for f in paginas():
        html = f.read_text(encoding="utf-8", errors="ignore")
        nombre = rel(f)

        for grupo in re.findall(r'class="([^"]+)"', html):
            for c in grupo.split():
                usadas.setdefault(c, set()).add(nombre)

        for m in re.findall(r'style="([^"]*)"', html):
            if not any(ok in m for ok in INLINE_PERMITIDO):
                inline.append((nombre, m[:60]))

        visible = texto_visible(html)
        if "—" in visible:
            guiones.append(nombre)
        for w in PALABRAS_CON_TILDE:
            for m in re.finditer(r"(?<![\wÀ-ſ])" + w + r"(?![\wÀ-ſ])", visible, re.I):
                ctx = re.sub(r"\s+", " ", visible[max(0, m.start() - 45):m.end() + 45]).strip()
                tildes.append((nombre, w, ctx))

        for h in set(re.findall(r'href="(/[^"#?]*)"', html)):
            if re.search(r"\.(png|jpg|jpeg|webp|svg|css|js|xml|ico|webmanifest|pdf)$", h):
                if not (ROOT / h.lstrip("/")).exists():
                    rotos.append((nombre, h, "archivo no existe"))
            else:
                destino = h if h.endswith("/") else h + "/"
                if destino not in rutas:
                    rotos.append((nombre, h, "ruta sin pagina"))

        for tag in re.findall(r"<img\b[^>]*>", html):
            if 'alt="' not in tag:
                sin_alt.append((nombre, tag[:70]))
            elif "width=" not in tag or "height=" not in tag:
                sin_dim.append((nombre, tag[:70]))

    huerfanas = {c: v for c, v in usadas.items() if c not in css_clases}
    nuevas = {c: v for c, v in huerfanas.items() if c not in DEUDA_PREVIA}

    if nuevas:
        fallos.append("%d clase(s) en el HTML sin ninguna regla en dossier.css" % len(nuevas))
        for c, v in sorted(nuevas.items(), key=lambda kv: -len(kv[1])):
            print("   .%-18s en %3d pagina(s)   ej: %s" % (c, len(v), sorted(v)[0]))
    if todo and DEUDA_PREVIA & set(huerfanas):
        print("   (deuda previa, sin regla propia: %s)" % ", ".join(sorted(DEUDA_PREVIA & set(huerfanas))))

    if len(inline) > INLINE_BASE:
        fallos.append("los style= inline subieron a %d (la base publicada es %d): saca a clases los %d nuevos"
                      % (len(inline), INLINE_BASE, len(inline) - INLINE_BASE))
        for n, m in inline[:10]:
            print("   %-34s style=\"%s\"" % (n, m))
    elif inline:
        avisos.append("%d style= inline heredados (base %d): deuda pendiente de sacar a clases"
                      % (len(inline), INLINE_BASE))

    if guiones:
        fallos.append("em dash en texto visible de %d pagina(s): %s" % (len(guiones), ", ".join(guiones[:4])))

    if tildes:
        fallos.append("%d palabra(s) sin acento en texto visible" % len(tildes))
        for n, w, c in tildes[:10]:
            print("   %-34s %-16s %s" % (n, w, c[:80]))

    if rotos:
        fallos.append("%d enlace(s) interno(s) rotos" % len(rotos))
        for n, h, por in rotos[:10]:
            print("   %-34s -> %-30s %s" % (n, h, por))

    manual = re.findall(r"([.#][\w-]+)[^{}]*\{[^{}]*grid-template-columns", css)
    sospechosas = [s for s in manual if s.startswith(".g-") or s == ".g"]
    if sospechosas:
        avisos.append("grid-template-columns escrito a mano sobre %s (las columnas las decide gcls())"
                      % ", ".join(sorted(set(sospechosas))[:5]))

    if sin_alt:
        fallos.append("%d <img> sin alt" % len(sin_alt))
        for n, t in sin_alt[:5]:
            print("   %-34s %s" % (n, t))
    if sin_dim:
        avisos.append("%d <img> con alt pero sin width/height (provoca salto de layout)" % len(sin_dim))

    versiones = set(re.findall(r"dossier\.css\?v=(\d+)", (ROOT / "index.html").read_text(encoding="utf-8")))
    print()
    print("paginas: %d | clases distintas en HTML: %d | css: %d bytes | ?v=%s"
          % (len(paginas()), len(usadas), CSS.stat().st_size, ",".join(versiones) or "SIN VERSION"))
    if not versiones:
        fallos.append("el CSS se sirve sin ?v=: un cambio de estilos queda cacheado en los navegadores")


def main():
    revisar("--todo" in sys.argv)
    print()
    for a in avisos:
        print("  aviso: %s" % a)
    if fallos:
        print()
        for f in fallos:
            print("  FALLA: %s" % f)
        print("\n%d problema(s) bloquean la publicacion." % len(fallos))
        return 1
    print("  Todo en orden: el sitio se puede publicar.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

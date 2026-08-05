"""Optimiza el material fotografico de los casos de estudio del portafolio.

Origen : C:\\Users\\ibisn\\OneDrive\\Desktop\\Material  (18.4 MB, JPG/PNG sin optimizar)
Destino: assets/portfolio/casos/  (WebP, con presupuesto de peso por tipo de pieza)

El sitio no tiene optimizacion de imagenes en el pipeline (es estatico y vercel.json
cachea /assets/ solo 60s), asi que el peso se controla aqui, en el build. Cada tipo de
pieza tiene su presupuesto y la calidad baja en escalon hasta cumplirlo.

Uso:  python tools/optimize-shots.py
"""

from pathlib import Path
from PIL import Image

SRC = Path(r"C:\Users\ibisn\OneDrive\Desktop\Material")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "portfolio" / "casos"
HERO = ROOT / "assets" / "portfolio"

# lado_mayor: el lado largo se reduce a este valor. kb: presupuesto duro.
PERFIL = {
    "wide":   {"lado_mayor": 1600, "kb": 180},   # captura desktop 16:9
    "square": {"lado_mayor":  900, "kb": 140},   # fotografia de producto 1:1
    "tall":   {"lado_mayor": 1200, "kb": 160},   # fotografia de producto vertical
    "phone":  {"lado_mayor": 1100, "kb": 120},   # captura de movil (el origen ya es chico)
    "hero":   {"lado_mayor": 1600, "kb": 200},   # portada de la ficha
}

# (ruta relativa al origen, perfil, nombre destino)
#
# EXCLUIDA a proposito: "THCC\Diseño fotografia para ecommerce 3.jpg". El sello
# NOM-051 de esa lata esta deformado ("AZDCARES", "SECRETATTA DE SALDO" en vez de
# "EXCESO AZUCARES / SECRETARIA DE SALUD"). Publicar el sello sanitario obligatorio
# mal renderizado es un riesgo de cumplimiento para el cliente. Las otras 6 fotos
# de producto lo traen correcto.
PIEZAS = [
    # --- AlbercasVIP -------------------------------------------------------
    # 01 = unica captura de sitio. a1-a3 = fotografia de alberca (descanso visual).
    (r"Albercasvip\Cumplimos reglas page speed.png", "wide",  "albercas-vip-01.webp"),
    (r"Albercasvip\Contenido rellenos 1.jpg",        "wide",  "albercas-vip-a1.webp"),
    (r"Albercasvip\Contenido relleno 2.jpg",         "wide",  "albercas-vip-a2.webp"),
    (r"Albercasvip\Contenido relleno 3.jpg",         "wide",  "albercas-vip-a3.webp"),
    (r"Albercasvip\Mobile\First Mobile.jpeg",        "phone", "albercas-vip-m1.webp"),
    (r"Albercasvip\Mobile\PWA.jpeg",                 "phone", "albercas-vip-m2.webp"),
    # --- THCC --------------------------------------------------------------
    # 01-02 = fotografia de producto apaisada. p1-p4 = fichas de catalogo.
    (r"THCC\Nueva portada.jpg",                        "wide",   "thcc-01.webp"),
    (r"THCC\Descanso visual.jpg",                      "wide",   "thcc-02.webp"),
    (r"THCC\Diseño fotografia para ecommerce.jpg",     "square", "thcc-p1.webp"),
    (r"THCC\Diseño fotografia para ecommerce 2.jpg",   "square", "thcc-p2.webp"),
    (r"THCC\Diseño fotografia para ecommerce 4.jpg",   "tall",   "thcc-p3.webp"),
    (r"THCC\Diseño fotografia para ecommerce 5.jpg",   "tall",   "thcc-p4.webp"),
    (r"THCC\Captura mobile\Chatbot.jpeg",              "phone",  "thcc-m1.webp"),
    (r"THCC\Captura mobile\FirstMobile.jpeg",          "phone",  "thcc-m2.webp"),
]

# THCC es uno de los 4 proyectos sin ninguna imagen: se le genera el hero de la ficha.
HEROES = [(r"THCC\Nueva portada.jpg", "hero", "thcc.webp")]


def convertir(origen: Path, perfil: str, destino: Path) -> tuple[int, int, int, int]:
    """Devuelve (ancho, alto, kb, calidad_final)."""
    cfg = PERFIL[perfil]
    im = Image.open(origen)
    if im.mode in ("RGBA", "P", "LA"):
        fondo = Image.new("RGB", im.size, (255, 255, 255))
        im = im.convert("RGBA")
        fondo.paste(im, mask=im.split()[-1])
        im = fondo
    else:
        im = im.convert("RGB")

    lado = max(im.size)
    if lado > cfg["lado_mayor"]:
        f = cfg["lado_mayor"] / lado
        im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)

    destino.parent.mkdir(parents=True, exist_ok=True)
    # Baja la calidad en escalon hasta entrar en presupuesto.
    for q in (86, 82, 78, 74, 70, 66, 62):
        im.save(destino, "WEBP", quality=q, method=6)
        if destino.stat().st_size <= cfg["kb"] * 1024:
            return im.width, im.height, round(destino.stat().st_size / 1024), q
    return im.width, im.height, round(destino.stat().st_size / 1024), 62


def main():
    faltantes = [p for p, _, _ in PIEZAS + HEROES if not (SRC / p).exists()]
    if faltantes:
        print("  FALTAN ARCHIVOS EN EL ORIGEN:")
        for f in faltantes:
            print(f"    {f}")
        return

    total_src = total_out = 0
    print(f"  {'destino':<26} {'dim':>11} {'origen':>9} {'salida':>8}  q   presupuesto")
    print("  " + "-" * 76)

    for rel, perfil, nombre in PIEZAS:
        origen = SRC / rel
        destino = OUT / nombre
        src_kb = round(origen.stat().st_size / 1024)
        w, h, kb, q = convertir(origen, perfil, destino)
        total_src += src_kb
        total_out += kb
        ok = "ok" if kb <= PERFIL[perfil]["kb"] else "EXCEDE"
        print(f"  {nombre:<26} {f'{w}x{h}':>11} {src_kb:>7}KB {kb:>6}KB {q:>3}  {ok}")

    for rel, perfil, nombre in HEROES:
        origen = SRC / rel
        destino = HERO / nombre
        src_kb = round(origen.stat().st_size / 1024)
        w, h, kb, q = convertir(origen, perfil, destino)
        total_out += kb
        ok = "ok" if kb <= PERFIL[perfil]["kb"] else "EXCEDE"
        print(f"  {nombre:<26} {f'{w}x{h}':>11} {src_kb:>7}KB {kb:>6}KB {q:>3}  {ok} (hero)")

    print("  " + "-" * 76)
    print(f"  origen {total_src/1024:.1f} MB  ->  salida {total_out/1024:.2f} MB"
          f"  ({100 - total_out/total_src*100:.0f}% menos)")


if __name__ == "__main__":
    main()

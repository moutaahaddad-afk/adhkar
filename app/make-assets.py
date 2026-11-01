#!/usr/bin/env python3
"""Génère les ressources Android (icônes + splash + icône de notification)
à partir de l'icône officielle du site : ../icon-512.png

Usage : python make-assets.py
Sortie : android/app/src/main/res/... (mipmap-*, drawable-*, values)
"""
import math
import os
from PIL import Image, ImageDraw

APP_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_DIR = os.path.dirname(APP_DIR)
RES = os.path.join(APP_DIR, "android", "app", "src", "main", "res")
SRC = os.path.join(SITE_DIR, "icon-512.png")

BG = (3, 20, 13, 255)          # --bg0 de l'application (#03140d)
GOLD = (255, 255, 255, 255)    # icône de statut : blanc pur (masque Android)

DENSITIES = {                  # launcher : 48dp ; foreground adaptatif : 108dp
    "mdpi": (48, 108),
    "hdpi": (72, 162),
    "xhdpi": (96, 216),
    "xxhdpi": (144, 324),
    "xxxhdpi": (192, 432),
}

SPLASH = {                     # (portrait, paysage)
    "drawable-port-mdpi": (320, 480),
    "drawable-port-hdpi": (480, 800),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (960, 1600),
    "drawable-port-xxxhdpi": (1280, 1920),
    "drawable-land-mdpi": (480, 320),
    "drawable-land-hdpi": (800, 480),
    "drawable-land-xhdpi": (1280, 720),
    "drawable-land-xxhdpi": (1600, 960),
    "drawable-land-xxxhdpi": (1920, 1280),
    "drawable": (480, 320),
}


def rounded_mask(size, radius_ratio=0.22):
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size * 4 - 1, size * 4 - 1),
        radius=int(size * 4 * radius_ratio),
        fill=255,
    )
    return mask.resize((size, size), Image.LANCZOS)


def circle_mask(size):
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    return mask.resize((size, size), Image.LANCZOS)


def star8(size, color=GOLD):
    """Étoile à 8 branches (motif de l'application) — icône de notification."""
    s = 8
    W = size * s
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = cy = W / 2.0
    outer = W * 0.46
    inner = outer * 0.42
    pts = []
    for i in range(16):
        r = outer if i % 2 == 0 else inner
        a = math.pi * 2 * i / 16 - math.pi / 2
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d.polygon(pts, fill=color)
    return img.resize((size, size), Image.LANCZOS)


def main():
    src = Image.open(SRC).convert("RGBA")
    print("source :", SRC, src.size)

    # ---- icônes de lancement -------------------------------------------
    for dens, (launcher, fg) in DENSITIES.items():
        out = os.path.join(RES, "mipmap-" + dens)
        os.makedirs(out, exist_ok=True)

        sq = src.resize((launcher, launcher), Image.LANCZOS)
        sq.putalpha(rounded_mask(launcher))
        sq.save(os.path.join(out, "ic_launcher.png"))

        rd = src.resize((launcher, launcher), Image.LANCZOS)
        rd.putalpha(circle_mask(launcher))
        rd.save(os.path.join(out, "ic_launcher_round.png"))

        # couche avant de l'icône adaptative : plein cadre (le lanceur découpe)
        src.resize((fg, fg), Image.LANCZOS).save(
            os.path.join(out, "ic_launcher_foreground.png")
        )
        print("mipmap-%-7s launcher=%dpx foreground=%dpx" % (dens, launcher, fg))

    # ---- splashes -------------------------------------------------------
    for folder, (w, h) in SPLASH.items():
        out = os.path.join(RES, folder)
        os.makedirs(out, exist_ok=True)
        canvas = Image.new("RGB", (w, h), BG[:3])
        side = int(min(w, h) * 0.34)
        art = src.resize((side, side), Image.LANCZOS)
        art.putalpha(rounded_mask(side, 0.22))
        canvas.paste(art, ((w - side) // 2, (h - side) // 2), art)
        canvas.save(os.path.join(out, "splash.png"), optimize=True)
    print("splash :", len(SPLASH), "variantes")

    # ---- icône de notification (monochrome, masque blanc) ---------------
    for dens, (launcher, _fg) in DENSITIES.items():
        stat = max(24, launcher // 2)          # 24dp
        d = os.path.join(RES, "drawable-" + dens)
        os.makedirs(d, exist_ok=True)
        star8(stat * 4).resize((stat, stat), Image.LANCZOS).save(
            os.path.join(d, "ic_stat_adhkar.png")
        )
    print("ic_stat_adhkar :", sorted(DENSITIES))

    # ---- couleur de fond de l'icône adaptative -------------------------
    values = os.path.join(RES, "values", "ic_launcher_background.xml")
    with open(values, "w", encoding="utf-8") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            "<resources>\n"
            '    <color name="ic_launcher_background">#03140d</color>\n'
            "</resources>\n"
        )
    print("values/ic_launcher_background.xml -> #03140d")


if __name__ == "__main__":
    main()

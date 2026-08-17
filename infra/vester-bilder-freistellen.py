"""Freistellen der Vester-Illustrationen.

Zwei Eigenheiten der erzeugten Bilder muessen abgefangen werden:
  1. Ein Teil der Bilder hat duenne schwarze Rahmenlinien am Rand — ein
     Artefakt des Bildmodells. Die werden vorher weggeschnitten.
  2. Weisse Flaechen koennen von Strichen eingeschlossen sein und sind dann
     vom Bildrand aus nicht erreichbar. Sie werden ueber den Farbabgleich
     mit dem Rand nachtraeglich dazugenommen.
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import pathlib

SRC = pathlib.Path("/mnt/user-data/uploads/Lerntypen Test")
OUT = pathlib.Path("public/img/vester")
OUT.mkdir(parents=True, exist_ok=True)


def rahmen_wegschneiden(a):
    """Findet duenne, fast schwarze Linien nahe am Bildrand und schneidet innen ab."""
    H, W, _ = a.shape
    d = a[:, :, :3].min(axis=2) < 80
    rand_h, rand_w = int(H * 0.06), int(W * 0.06)   # nur die aeusseren 6 % pruefen

    oben, unten, links, rechts = 0, H, 0, W
    for y in range(rand_h):
        if d[y].mean() > 0.45: oben = y + 1
    for y in range(H - 1, H - rand_h, -1):
        if d[y].mean() > 0.45: unten = y
    for x in range(rand_w):
        if d[:, x].mean() > 0.25: links = x + 1
    for x in range(W - 1, W - rand_w, -1):
        if d[:, x].mean() > 0.25: rechts = x

    if (oben, unten, links, rechts) != (0, H, 0, W):
        print(f"    Rahmen entfernt: oben {oben}, unten {H-unten}, links {links}, rechts {W-rechts} Pixel")
    return a[oben:unten, links:rechts]


def freistellen(pfad):
    a = np.array(Image.open(pfad).convert("RGBA"))
    a = rahmen_wegschneiden(a)
    rgb = a[:, :, :3].astype(np.float32)

    hell = (rgb.min(axis=2) > 238) & (rgb.max(axis=2) - rgb.min(axis=2) < 16)
    lab, n = ndimage.label(hell)

    rand = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    rand.discard(0)
    bg = np.isin(lab, list(rand))
    ref = rgb[bg].mean(axis=0)

    sizes = ndimage.sum(hell, lab, range(1, n + 1))
    for i in range(n):
        idx = i + 1
        if idx in rand or sizes[i] < 1500:
            continue
        if np.abs(rgb[lab == idx].mean(axis=0) - ref).max() < 3.0:
            bg |= lab == idx

    alpha = np.where(bg, 0, 255).astype(np.float32)
    a[:, :, 3] = np.clip(ndimage.gaussian_filter(alpha, sigma=0.6), 0, 255).astype(np.uint8)
    return Image.fromarray(a, "RGBA"), bg.mean()


for name in ["visuell", "auditiv", "haptisch", "intellektuell"]:
    print(f"{name}:")
    im, anteil = freistellen(SRC / f"{name}.png.png")
    im = im.crop(im.getbbox())
    for suffix, breite in [("", 900), ("@1x", 450)]:
        h = round(im.height * breite / im.width)
        im.resize((breite, h), Image.LANCZOS).save(
            OUT / f"{name}{suffix}.webp", "WEBP", quality=86, method=6
        )
    print(f"    Hintergrund {anteil:.1%} entfernt, Ergebnis {im.size}")

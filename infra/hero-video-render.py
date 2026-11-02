#!/usr/bin/env python3
# Erzeugt den bewegten Hero-Hintergrund von octastudy.com.
#
# Aufruf (beide Fassungen) aus dem Projektordner:
#
#   MODUS=hell   python3 infra/hero-video-render.py
#   ffmpeg -f rawvideo -pix_fmt rgb24 -s 1280x720 -r 24 -i roh.rgb \
#     -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -pix_fmt yuv420p -an \
#     public/video/hero-hell.webm
#   ffmpeg -f rawvideo -pix_fmt rgb24 -s 1280x720 -r 24 -i roh.rgb \
#     -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart \
#     -an public/video/hero-hell.mp4
#   ffmpeg -f rawvideo -pix_fmt rgb24 -s 1280x720 -r 24 -i roh.rgb \
#     -frames:v 1 -vf scale=640:-1 -q:v 6 public/video/poster-hell.jpg
#
# Dasselbe noch einmal mit MODUS=dunkel und -dunkel in den Dateinamen.
# roh.rgb ist eine Zwischendatei von rund 1 GB und gehoert nicht ins Repo.
#
# Faustregeln, falls du daran drehst: Die Staerke-Werte in BLOBS sind
# absichtlich niedrig. Bei hoeheren Werten faellt der Kontrast des Lead-
# Textes unter die Barrierefreiheitsgrenze — das war bei 0.42 statt 0.20
# gemessen der Fall. Nach jeder Aenderung den Kontrast ueber der gebauten
# Seite nachmessen, nicht schaetzen.
#
# Der Grundton GRUND muss zu --bg in der Startseite passen (derzeit
# #faf8f3). Stimmt er nicht, sitzt im Hero ein farblich abweichendes
# Rechteck auf der Seite.
"""Weiche, driftende Farbfelder in den Markenfarben — nahtlose Schleife.

Gerechnet wird in winziger Aufloesung (160x90) und danach bikubisch
hochskaliert. Das ist nicht nur schnell, es ist auch der Grund, warum die
Verlaeufe weich sind: Bei voller Aufloesung gerechnete Radialverlaeufe
zeigen sichtbare Kreisraender, der Hochskalierer glaettet sie weg.

Alle Bewegungen laufen ueber sin/cos mit der Periode der Gesamtdauer,
deshalb schliesst die Schleife nahtlos. Zum Schluss etwas Rauschen, sonst
zeigt ein 8-Bit-Video bei so weichen Verlaeufen deutliche Streifen.
"""
import numpy as np, os
from PIL import Image

W, H, FPS, SEK = 1280, 720, 24, 16
LW, LH = 160, 90
N = FPS * SEK
HELL = os.environ.get('MODUS', 'hell') == 'hell'

GRUND = np.array([250, 248, 243] if HELL else [21, 16, 42], float)  # muss zu --bg passen
#        Farbe              Start        Radius  Staerke
BLOBS = [([108,  73, 158], (0.20, 0.45), 0.85, 0.20),
         ([ 23, 185, 141], (0.78, 0.26), 0.70, 0.13),
         ([245, 165,  36], (0.52, 0.88), 0.62, 0.085),
         ([137,  92, 196], (0.92, 0.70), 0.78, 0.15)]
if not HELL:
    BLOBS = [(c, p, r, s * 1.35) for c, p, r, s in BLOBS]

yy, xx = np.mgrid[0:LH, 0:LW].astype(np.float64)
xx /= LW; yy /= LH
ar = LW / LH

os.makedirs('frames', exist_ok=True)
rng = np.random.default_rng(7)
roh = open('roh.rgb', 'wb')
for f in range(N):
    t = 2 * np.pi * f / N
    klein = np.repeat(np.repeat(GRUND.reshape(1, 1, 3), LH, 0), LW, 1)
    for i, (farbe, (px, py), rad, staerke) in enumerate(BLOBS):
        ph = t + i * 1.6
        cx = px + 0.085 * np.sin(ph) + 0.04 * np.sin(2 * ph + 1.1)
        cy = py + 0.070 * np.cos(ph * 0.8 + 0.4)
        r = rad * (1 + 0.12 * np.sin(ph * 0.6 + i))
        d2 = (((xx - cx) * ar) ** 2 + (yy - cy) ** 2) / (r * r)
        maske = np.exp(-2.4 * d2)          # Gauss statt harter Kante
        klein += maske[..., None] * (np.array(farbe, float) - GRUND) * staerke
    gross = np.asarray(
        Image.fromarray(np.clip(klein, 0, 255).astype(np.uint8))
        .resize((W, H), Image.BICUBIC), float)
    gross += rng.normal(0, 1.3, (H, W, 1))     # Dither gegen Streifen
    np.clip(gross, 0, 255, out=gross)
    roh.write(gross.astype(np.uint8).tobytes())
    if f % 96 == 0: print(f, end=' ', flush=True)
roh.close()
print('fertig', N, 'Bilder')

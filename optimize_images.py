#!/usr/bin/env python3
"""Create display-sized WebP versions of the heavy site images."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent / "assets"
OUT = ROOT / "opt"
OUT.mkdir(exist_ok=True)

# (source filename, output stem, max longest side, webp quality)
JOBS = [
    ("Engineer checking a boiler.jpg", "engineer-checking-boiler", 1000, 76),
    ("Sign of legally registered gas safe engineers 600x335.jpg", "gas-safe-sign-600", 600, 78),
    ("Sign of legally registered gas safe engineers 1600x1600.jpg", "gas-safe-sign-800", 800, 76),
    ("Engineer showing Gas Safe ID card.jpg", "engineer-gas-safe-id", 900, 76),
    ("Gas hob burner.jpg", "gas-hob-burner", 800, 76),
    ("boiler-installs-icon.png", "icon-boiler-installs", 128, 80),
    ("boiler-repairs-icon.png", "icon-boiler-repairs", 128, 80),
    ("boiler-servicing-icon.png", "icon-boiler-servicing", 128, 80),
    ("gas-safe-cert.png", "icon-gas-safe-cert", 128, 80),
    ("hob-installs.png", "icon-hob-installs", 128, 80),
    ("heating-repairs-icon.png", "icon-heating-repairs", 128, 80),
    ("gallery-engineer-portrait.jpg", "gallery-engineer-portrait", 900, 74),
    ("gallery-customer-handshake.jpg", "gallery-customer-handshake", 900, 74),
    ("gallery-boiler-closeup.jpg", "gallery-boiler-closeup", 900, 74),
    ("gallery-attic-work.jpg", "gallery-attic-work", 900, 74),
    ("gallery-servicing-indoor.jpg", "gallery-servicing-indoor", 900, 74),
    ("FullLogo_Transparent_NoBuffer.jpg", "logo-wlg", 480, 80),
    ("brain-tumour-research-color.png", "sponsor-btr-color", 400, 80),
    ("brain-tumour-research-white.png", "sponsor-btr-white", 400, 80),
    ("hope-dragons-yfc-crest.png", "sponsor-hope-dragons", 240, 80),
]


def convert(src_name, stem, max_side, quality):
    src = ROOT / src_name
    dest = OUT / f"{stem}.webp"
    im = Image.open(src)
    if im.mode in ("P", "LA"):
        im = im.convert("RGBA")
    elif im.mode == "CMYK":
        im = im.convert("RGB")
    w, h = im.size
    longest = max(w, h)
    if longest > max_side:
        scale = max_side / longest
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    save_kwargs = {"quality": quality, "method": 6}
    if im.mode == "RGBA":
        save_kwargs["lossless"] = False
    im.save(dest, "WEBP", **save_kwargs)
    before = src.stat().st_size
    after = dest.stat().st_size
    print(f"{src_name:62} {w}x{h} {before/1024:7.0f}KB  ->  {dest.name:32} {im.size[0]}x{im.size[1]} {after/1024:6.1f}KB  ({100*after/before:.1f}%)")
    return before, after


total_before = total_after = 0
for job in JOBS:
    b, a = convert(*job)
    total_before += b
    total_after += a

print(f"\nTOTAL referenced images: {total_before/1024/1024:.2f}MB -> {total_after/1024/1024:.2f}MB  saved {(total_before-total_after)/1024/1024:.2f}MB")

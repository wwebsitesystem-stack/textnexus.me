#!/usr/bin/env python3
"""Build christmas.css from thanksgiving.css.

The harvest pack carries the full seasonal layout: shell tokens, sidebar,
HUD, boot screen, gate, cards and the boot particle layer. Christmas needs the
same structure with a winter palette, so we copy it, re-scope it to
data-season="christmas", remap the colours, and append the snow-only rules.
Keeping the transform in one place means layout fixes to the harvest pack can
be re-derived instead of hand-copied.
"""

import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "thanksgiving.css"
OUT = ROOT / "christmas.css"

# Autumn -> winter. Longest keys first so partial prefixes never win.
COLOUR_MAP = {
    "rgba(232, 177, 92, 0.18)": "rgba(214, 231, 255, 0.16)",
    "rgba(232, 177, 92, 0.34)": "rgba(214, 231, 255, 0.30)",
    "rgba(232, 177, 92, 0.23)": "rgba(214, 231, 255, 0.20)",
    "rgba(232, 177, 92, 0.22)": "rgba(214, 231, 255, 0.20)",
    "rgba(232, 177, 92, 0.24)": "rgba(214, 231, 255, 0.22)",
    "rgba(232, 177, 92, 0.16)": "rgba(214, 231, 255, 0.14)",
    "rgba(232, 177, 92, 0.12)": "rgba(214, 231, 255, 0.10)",
    "rgba(232, 177, 92, 0.10)": "rgba(214, 231, 255, 0.09)",
    "rgba(232, 177, 92, 0.08)": "rgba(214, 231, 255, 0.08)",
    "rgba(232, 177, 92, 0.035)": "rgba(214, 231, 255, 0.04)",
    "rgba(232, 177, 92, 0.05)": "rgba(214, 231, 255, 0.05)",
    "rgba(217, 122, 63, 0.22)": "rgba(200, 69, 58, 0.16)",
    "rgba(217, 122, 63, 0.20)": "rgba(200, 69, 58, 0.14)",
    "rgba(217, 122, 63, 0.16)": "rgba(200, 69, 58, 0.12)",
    "rgba(217, 122, 63, 0.13)": "rgba(200, 69, 58, 0.10)",
    "rgba(217, 122, 63, 0.12)": "rgba(200, 69, 58, 0.10)",
    "rgba(217, 122, 63, 0.10)": "rgba(200, 69, 58, 0.09)",
    "rgba(217, 122, 63, 0.08)": "rgba(200, 69, 58, 0.07)",
    "rgba(217, 122, 63, 0.06)": "rgba(200, 69, 58, 0.06)",
    "rgba(217, 122, 63, 0.05)": "rgba(200, 69, 58, 0.05)",
    "rgba(217, 122, 63, 0.035)": "rgba(47, 122, 95, 0.05)",
    "rgba(217, 122, 63, 0.02)": "rgba(47, 122, 95, 0.03)",
    "rgba(166, 64, 60, 0.13)": "rgba(47, 122, 95, 0.11)",
    "rgba(166, 64, 60, 0.12)": "rgba(47, 122, 95, 0.10)",
    "rgba(166, 64, 60, 0.10)": "rgba(47, 122, 95, 0.09)",
    "rgba(166, 64, 60, 0.08)": "rgba(47, 122, 95, 0.08)",
    "rgba(166, 64, 60, 0.05)": "rgba(47, 122, 95, 0.05)",
    "rgba(38, 21, 12, 0.97)": "rgba(13, 21, 36, 0.97)",
    "rgba(38, 21, 12, 0.96)": "rgba(13, 21, 36, 0.96)",
    "rgba(38, 21, 12, 0.94)": "rgba(13, 21, 36, 0.94)",
    "rgba(38, 21, 12, 0.92)": "rgba(13, 21, 36, 0.92)",
    "rgba(38, 21, 12, 0.90)": "rgba(13, 21, 36, 0.90)",
    "rgba(38, 21, 12, 0.78)": "rgba(13, 21, 36, 0.80)",
    "rgba(38, 21, 12, 0.72)": "rgba(13, 21, 36, 0.74)",
    "rgba(24, 13, 8, 0.97)": "rgba(7, 12, 23, 0.97)",
    "rgba(24, 13, 8, 0.96)": "rgba(7, 12, 23, 0.96)",
    "rgba(24, 13, 8, 0.94)": "rgba(7, 12, 23, 0.94)",
    "rgba(24, 13, 8, 0.92)": "rgba(7, 12, 23, 0.92)",
    "rgba(24, 13, 8, 0.82)": "rgba(7, 12, 23, 0.82)",
    "rgba(24, 13, 8, 0.78)": "rgba(7, 12, 23, 0.78)",
    "rgba(15, 8, 4, 0.55)": "rgba(5, 9, 18, 0.55)",
    "rgba(28, 16, 10, 0.82)": "rgba(13, 21, 36, 0.82)",
    "rgba(232, 177, 92, 0.45)": "rgba(214, 231, 255, 0.40)",
    "rgba(232, 177, 92, 0.7)": "rgba(214, 231, 255, 0.65)",
    "rgba(255, 244, 229, 0.26)": "rgba(255, 255, 255, 0.55)",
    "rgba(255, 244, 229, 0.55)": "rgba(238, 244, 255, 0.6)",
    "rgba(248, 234, 216, 0.55)": "rgba(238, 244, 255, 0.6)",
    "rgba(255, 255, 255, 0.3)": "rgba(255, 255, 255, 0.32)",
    "rgba(255, 255, 255, 0.26)": "rgba(255, 255, 255, 0.3)",
    "rgba(255, 255, 255, 0.22)": "rgba(255, 255, 255, 0.26)",
    "rgba(255, 255, 255, 0.2)": "rgba(255, 255, 255, 0.24)",
    "rgba(255, 255, 255, 0.12)": "rgba(255, 255, 255, 0.14)",
    "rgba(255, 255, 255, 0.08)": "rgba(255, 255, 255, 0.10)",
    "rgba(255, 255, 255, 0.06)": "rgba(255, 255, 255, 0.08)",
    "rgba(255, 255, 255, 0.05)": "rgba(255, 255, 255, 0.07)",
    "rgba(255, 255, 255, 0.04)": "rgba(255, 255, 255, 0.06)",
    "rgba(255, 255, 255, 0.03)": "rgba(255, 255, 255, 0.05)",
    "rgba(0, 0, 0, 0.32)": "rgba(0, 0, 0, 0.36)",
    # Solids, longest first.
    "#f3c77e": "#f7dcac",
    "#ffd49a": "#ffe8bd",
    "#fff4e5": "#f2f7ff",
    "#f1dfc9": "#dbe6f7",
    "#f8ead8": "#eef4ff",
    "#e6d2ba": "#d3e0f4",
    "#c4ad94": "#9fb3cf",
    "#927b63": "#74889f",
    "#f09a58": "#e2564a",
    "#d97a3f": "#c8453a",
    "#e8b15c": "#f0d08a",
    "#a6403c": "#2f7a5f",
    "#8b9a6b": "#7fa8c9",
    "#f08a7c": "#ff9d8c",
    "#2b160b": "#101c30",
    "#2a160e": "#101a2c",
    "#26150c": "#131e30",
    "#1c100a": "#0d1524",
    "#120a06": "#070c17",
    "#3b2417": "#20324c",
    "#0d0704": "#070c17",
    "#211008": "#08101d",
    "#000000": "#000000",
}


def build() -> None:
    css = SRC.read_text()

    head, rest = css.split("*/", 1)
    head = head.replace("THANKSGIVING / HARVEST EDITION", "CHRISTMAS / WINTER EDITION")
    head = head.replace(
        "Scoped to html[data-season=\"thanksgiving\"] so the theme can\n   be removed or swapped without touching the base design.",
        "Scoped to html[data-season=\"christmas\"]. Generated from\n   thanksgiving.css by artifacts/christmas-theme/gen.py so both seasons\n   keep the same component coverage.",
    )
    css = head + "*/" + rest

    css = css.replace('[data-season="thanksgiving"]', '[data-season="christmas"]')
    css = css.replace("--tg-pumpkin: #d97a3f;", "--tg-pumpkin: #c8453a;")

    for old, new in sorted(COLOUR_MAP.items(), key=lambda kv: -len(kv[0])):
        css = css.replace(old, new)

    css += """
/* =========================================================
   CHRISTMAS EXTRAS
   The boot layer keeps its geometry and timing; only the
   particles change from leaves to snow.
   ========================================================= */

html[data-season="christmas"] #boot-screen .boot-leaf {
  width: var(--leaf-size, 9px);
  height: var(--leaf-size, 9px);
  border-radius: 50%;
  background: radial-gradient(circle at 34% 30%, #ffffff, #dbe9ff 52%, #9fc0e8);
  box-shadow: 0 0 12px rgba(214, 232, 255, 0.55);
  filter: none;
}

html[data-season="christmas"] #boot-screen .boot-leaf:nth-child(odd) {
  background: radial-gradient(circle at 34% 30%, #ffffff, #eaf2ff 55%, #b9d2ee);
}

html[data-season="christmas"] .tg-season-pill,
html[data-season="christmas"] .tg-kicker {
  color: var(--tg-amber);
}

/* A quiet red-and-pine ribbon on the overview hero. */
html[data-season="christmas"] .tg-hero::after {
  content: "";
  position: absolute;
  top: 18px;
  right: 18px;
  width: 46px;
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, #c8453a 0 46%, #f0d08a 46% 54%, #2f7a5f 54% 100%);
  opacity: 0.75;
  pointer-events: none;
}
"""

    OUT.write_text(css)
    print(f"wrote {OUT.name}: {len(css)} bytes")
    print("season packs:", css.count('[data-season="christmas"]'), "scopes")


if __name__ == "__main__":
    build()

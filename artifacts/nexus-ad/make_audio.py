#!/usr/bin/env python3
"""Original warm, minimal soundtrack for the Nexus official promo.

Everything is synthesized locally: no samples, no third-party music, no
licensing dependencies. 48 kHz stereo, 47.5 seconds, -14 LUFS-ish delivery.
"""

from __future__ import annotations

import math
import wave
from pathlib import Path

import numpy as np

SR = 48_000
DUR = 47.5
N = int(SR * DUR)
T = np.arange(N, dtype=np.float64) / SR
RNG = np.random.default_rng(20261107)

LEFT = np.zeros(N, dtype=np.float64)
RIGHT = np.zeros(N, dtype=np.float64)


def midi(note: float) -> float:
    return 440.0 * (2.0 ** ((note - 69.0) / 12.0))


def smooth(x: np.ndarray | float) -> np.ndarray | float:
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def add(sig: np.ndarray, start: float, gain: float = 1.0, pan: float = 0.0) -> None:
    i = int(round(start * SR))
    if i >= N:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    j = min(N, i + len(sig))
    if j <= i:
        return
    sig = sig[: j - i]
    ang = (np.clip(pan, -1.0, 1.0) + 1.0) * math.pi / 4.0
    LEFT[i:j] += sig * gain * math.cos(ang)
    RIGHT[i:j] += sig * gain * math.sin(ang)


# ---------------------------------------------------------------------------
# Air and low drone
# ---------------------------------------------------------------------------
air = RNG.standard_normal(N)
air = np.diff(air, prepend=0.0) * 0.18
air_env = smooth(T / 4.0) * smooth((DUR - T) / 5.0)
add(air * air_env, 0.0, 0.020, -0.1)
add(np.roll(air, 13) * air_env, 0.0, 0.015, 0.18)

drone_env = smooth(T / 4.0) * smooth((DUR - T) / 4.0)
drone = (
    np.sin(2 * np.pi * midi(38) * T)
    + 0.35 * np.sin(2 * np.pi * midi(45) * T + 0.3)
    + 0.16 * np.sin(2 * np.pi * midi(50) * T + 1.1)
)
drone *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.055 * T)
add(drone * drone_env, 0.0, 0.036, 0.0)

# ---------------------------------------------------------------------------
# Chord bed: Dm9 -> Bbmaj7 -> Fmaj9 -> Cadd9 -> Gm7 -> Dm9 -> Bbmaj7 -> Dm9
# Segments are six seconds, with overlapping fades so the harmony breathes.
# ---------------------------------------------------------------------------
chords = [
    (0.0, [50, 53, 57, 60, 64]),   # Dm9
    (6.0, [46, 50, 53, 57]),       # Bbmaj7
    (12.0, [41, 45, 48, 52, 55]),  # Fmaj9
    (18.0, [48, 52, 55, 62]),      # Cadd9
    (24.0, [43, 46, 50, 53]),      # Gm7
    (30.0, [50, 53, 57, 60]),      # Dm9
    (36.0, [46, 50, 53, 57]),      # Bbmaj7
    (42.0, [38, 50, 57, 60, 64]),  # Dm9 resolve
]

for seg_index, (start, notes) in enumerate(chords):
    length = 7.25 if seg_index < len(chords) - 1 else 5.5
    n = int(length * SR)
    lt = np.arange(n) / SR
    attack = 1.15
    release = 1.8
    env = smooth(lt / attack) * smooth((length - lt) / release)
    pad = np.zeros(n)
    for idx, note in enumerate(notes):
        amp = 1.0 / (1.0 + idx * 0.28)
        for detune in (-0.0017, 0.0017):
            f = midi(note) * (1.0 + detune)
            phase = RNG.uniform(0, 2 * np.pi)
            voice = (
                np.sin(2 * np.pi * f * lt + phase)
                + 0.24 * np.sin(2 * np.pi * 2 * f * lt + phase * 0.7 + 0.4)
                + 0.08 * np.sin(2 * np.pi * 3 * f * lt + 1.3)
            )
            pad += voice * amp * 0.5
    pad /= max(1, len(notes))
    pad *= env * (0.82 + 0.18 * np.sin(2 * np.pi * 0.08 * lt + seg_index))
    add(pad, start, 0.145, -0.10)
    add(np.roll(pad, 211), start, 0.135, 0.13)

# ---------------------------------------------------------------------------
# Pulse section: soft kick, brushed hats, bass and a sparse pluck motif
# ---------------------------------------------------------------------------
BEAT = 60.0 / 90.0
EIGHTH = BEAT / 2.0

kick_times = np.arange(4.0, 42.0, BEAT * 2)
for k, start in enumerate(kick_times):
    n = int(0.46 * SR)
    lt = np.arange(n) / SR
    env = np.exp(-lt * 12.0) * (1.0 - np.exp(-lt * 180.0))
    f = 46.0 + 82.0 * np.exp(-lt * 28.0)
    body = np.sin(2 * np.pi * f * lt + 0.25 * np.sin(2 * np.pi * 2.2 * f * lt))
    click = RNG.standard_normal(n) * np.exp(-lt * 150.0) * 0.06
    gain = 0.095 if start < 36.0 else 0.115
    add((body + click) * env, start, gain, 0.0)

# Little pickup fills at major beats.
for start in [22.0, 27.333, 38.667, 40.667]:
    n = int(0.5 * SR)
    lt = np.arange(n) / SR
    env = np.exp(-lt * 18.0)
    snap = RNG.standard_normal(n)
    snap = np.diff(snap, prepend=0.0) * 0.22
    snap += 0.20 * np.sin(2 * np.pi * 185 * lt + 0.2)
    add(snap * env, start, 0.040, 0.10)

for start in np.arange(8.0, 36.0, EIGHTH):
    n = int(0.075 * SR)
    lt = np.arange(n) / SR
    hatch = RNG.standard_normal(n)
    hatch = np.diff(hatch, prepend=0.0)
    env = np.exp(-lt * 65.0)
    add(hatch * env, start, 0.020, 0.32 if int(start / EIGHTH) % 2 else -0.22)

bass_roots = [38, 34, 41, 36, 31, 38, 34, 38]
for i, root in enumerate(bass_roots):
    start = i * 6.0
    end = min(DUR, start + 6.0)
    for b in np.arange(start + 0.15, end - 0.4, BEAT * 2.0):
        n = int(0.55 * SR)
        lt = np.arange(n) / SR
        env = (1.0 - np.exp(-lt * 90.0)) * np.exp(-lt * 4.4)
        f = midi(root - 12)
        sig = np.sin(2 * np.pi * f * lt) + 0.12 * np.sin(2 * np.pi * 2 * f * lt)
        add(sig * env, b, 0.105, -0.05)

pentatonic = [62, 65, 67, 69, 72, 74]
p_idx = 0
for start in np.arange(4.0, 36.5, EIGHTH):
    if RNG.random() < 0.32:
        continue
    note = pentatonic[(p_idx + (1 if RNG.random() < 0.28 else 0)) % len(pentatonic)]
    p_idx += 1
    n = int(0.8 * SR)
    lt = np.arange(n) / SR
    env = (1.0 - np.exp(-lt * 120.0)) * np.exp(-lt * 8.0)
    f = midi(note)
    sig = np.sin(2 * np.pi * f * lt + 0.35 * np.sin(2 * np.pi * 2.01 * f * lt))
    sig += 0.18 * np.sin(2 * np.pi * 4.03 * f * lt)
    pan = 0.35 * math.sin(p_idx * 1.7)
    add(sig * env, start, 0.034, pan)
    # Simple tape-ish echo.
    add(sig * env, start + 0.27, 0.012, -pan)
    add(sig * env, start + 0.54, 0.005, pan)

# ---------------------------------------------------------------------------
# Transitions: whooshes at each scene cut, a riser, and low impacts
# ---------------------------------------------------------------------------
for cut in [4.0, 9.0, 14.0, 20.0, 25.0, 30.0, 36.0, 42.0]:
    length = 0.92
    n = int(length * SR)
    lt = np.arange(n) / SR
    env = np.sin(np.pi * (lt / length)) ** 1.7
    noise = RNG.standard_normal(n)
    noise = np.diff(noise, prepend=0.0)
    sweep = np.sin(2 * np.pi * (280.0 + 1500.0 * (lt / length) ** 1.5) * lt)
    sig = (noise * 0.35 + sweep * 0.12) * env
    add(sig, cut - 0.53, 0.055, -0.2 + 0.4 * ((cut / 7) % 1))
    add(np.roll(sig, 97), cut - 0.53, 0.035, 0.25)

# Riser into the "Nexus is changing" statement.
n = int(2.3 * SR)
lt = np.arange(n) / SR
env = (lt / lt[-1]) ** 2.6
riser = RNG.standard_normal(n)
riser = np.diff(riser, prepend=0.0)
riser += 0.22 * np.sin(2 * np.pi * (180 + 900 * (lt / lt[-1]) ** 2) * lt)
add(riser * env, 27.7, 0.045, 0.0)

# Sub impacts on the major statements.
for start, gain in [(30.0, 0.20), (36.0, 0.18), (42.0, 0.22)]:
    n = int(1.7 * SR)
    lt = np.arange(n) / SR
    env = (1.0 - np.exp(-lt * 120.0)) * np.exp(-lt * 2.2)
    boom = np.sin(2 * np.pi * (47.0 + 32.0 * np.exp(-lt * 18.0)) * lt)
    add(boom * env, start, gain, 0.0)
    n2 = int(0.38 * SR)
    lt2 = np.arange(n2) / SR
    hit = RNG.standard_normal(n2) * np.exp(-lt2 * 22.0)
    add(hit, start, 0.035, 0.0)

# Closing bells / resolve.
for note, offset, gain in [(74, 0.0, 0.052), (77, 0.18, 0.040), (81, 0.39, 0.032), (86, 0.62, 0.018)]:
    n = int(3.8 * SR)
    lt = np.arange(n) / SR
    env = (1.0 - np.exp(-lt * 80.0)) * np.exp(-lt * 1.9)
    f = midi(note)
    sig = (
        np.sin(2 * np.pi * f * lt)
        + 0.36 * np.sin(2 * np.pi * 2.01 * f * lt)
        + 0.12 * np.sin(2 * np.pi * 3.99 * f * lt)
    )
    add(sig * env, 42.0 + offset, gain, -0.25 + 0.16 * offset)

# ---------------------------------------------------------------------------
# Master finish
# ---------------------------------------------------------------------------
master_env = smooth(T / 0.35) * smooth((DUR - T) / 2.1)
LEFT *= master_env
RIGHT *= master_env

# Gentle glow, then peak-normalise without hard clipping.
LEFT = np.tanh(LEFT * 1.25)
RIGHT = np.tanh(RIGHT * 1.25)
peak = max(float(np.max(np.abs(LEFT))), float(np.max(np.abs(RIGHT))), 1e-9)
LEFT *= 0.89 / peak
RIGHT *= 0.89 / peak

stereo = np.stack([LEFT, RIGHT], axis=1)
pcm = np.clip(stereo * 32767.0, -32768, 32767).astype("<i2")

out = Path(__file__).resolve().parent / "assets" / "nexus-ad-score.wav"
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "wb") as fh:
    fh.setnchannels(2)
    fh.setsampwidth(2)
    fh.setframerate(SR)
    fh.writeframes(pcm.tobytes())

print(f"wrote {out} ({DUR:.1f}s, {out.stat().st_size / 1_000_000:.1f} MB)")
print(f"peak={peak:.3f} rms={np.sqrt(np.mean(stereo ** 2)):.4f}")

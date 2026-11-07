#!/usr/bin/env node
/**
 * Nexus // official promo film.
 *
 * A fully local motion-graphics render: canvas at 1920x1080, 24 fps, with a
 * separately synthesized score. No stock footage, no third-party assets beyond
 * the site's own screenshots and open-source typefaces.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, 'assets');
const requireTool = createRequire(path.join(HERE, 'tools', 'package.json'));
const { createCanvas, GlobalFonts, loadImage } = requireTool('@napi-rs/canvas');
const ffmpeg = requireTool('ffmpeg-static');

const W = 1920;
const H = 1080;
const FPS = 24;
const DURATION = 47.5;
const TOTAL_FRAMES = Math.round(DURATION * FPS);

const C = {
  ink: '#080504',
  panel: '#110a07',
  cream: '#fff4e5',
  warm: '#e8b15c',
  copper: '#d97a3f',
  sage: '#a3ad88',
  muted: '#c4ad94',
  dim: '#8c7562',
  line: 'rgba(232,177,92,0.19)',
  lineSoft: 'rgba(232,177,92,0.10)',
  green: '#8fbf9b',
};

for (const [file, alias] of [
  ['InstrumentSerif-Regular.ttf', 'Instrument'],
  ['InstrumentSerif-Italic.ttf', 'InstrumentItalic'],
  ['Barlow-Regular.ttf', 'Barlow'],
  ['Barlow-Medium.ttf', 'BarlowMedium'],
  ['Barlow-SemiBold.ttf', 'BarlowSemi'],
  ['Barlow-Bold.ttf', 'BarlowBold'],
  ['Barlow-ExtraBold.ttf', 'BarlowX'],
]) {
  if (!GlobalFonts.registerFromPath(path.join(ASSETS, 'fonts', file), alias)) {
    console.warn(`font registration failed: ${file}`);
  }
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
const easeOutExpo = (t) => {
  t = clamp(t);
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
};
const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInCubic = (t) => Math.pow(clamp(t), 3);

function font(size, family = 'Barlow', weight = 400) {
  return `${weight} ${size}px ${family}`;
}

function rrect(x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function line(x1, y1, x2, y2, color = C.line, width = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function tracked(text, x, y, opts = {}) {
  const {
    size = 20,
    family = 'BarlowSemi',
    weight = 600,
    color = C.cream,
    spacing = 4,
    align = 'left',
    alpha = 1,
  } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = font(size, family, weight);
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, chars.length - 1);
  let cursor = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  for (let i = 0; i < chars.length; i += 1) {
    ctx.fillText(chars[i], cursor, y);
    cursor += widths[i] + spacing;
  }
  ctx.restore();
  return total;
}

function label(text, x, y, opts = {}) {
  const { size = 19, color = C.warm, alpha = 1, family = 'BarlowSemi', spacing = 4.2 } = opts;
  return tracked(text, x, y, { size, color, alpha, family, spacing });
}

function paragraph(text, x, y, maxWidth, opts = {}) {
  const {
    size = 30,
    lineHeight = 1.56,
    color = C.muted,
    alpha = 1,
    family = 'Barlow',
    start = 0.32,
    u = 0,
    align = 'left',
  } = opts;
  ctx.save();
  const baseAlpha = ctx.globalAlpha;
  ctx.font = font(size, family, 400);
  ctx.textAlign = align;
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  ctx.fillStyle = color;
  lines.forEach((ln, i) => {
    const p = easeOutCubic(clamp((u - start - i * 0.06) / 0.7));
    ctx.globalAlpha = baseAlpha * alpha * p;
    ctx.fillText(ln, x, y + i * size * lineHeight);
  });
  ctx.restore();
  return lines.length * size * lineHeight;
}

function kicker(text, x, y, alpha = 1, color = C.warm) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const grow = easeOutCubic(alpha);
  line(x, y - 7, x + 52 * grow, y - 7, color, 2);
  tracked(text, x + 70, y, { size: 18, spacing: 4.4, color, alpha: 1, family: 'BarlowSemi' });
  ctx.restore();
}

function serifHeadline(lines, x, y, opts = {}) {
  const { size = 114, align = 'left', u = 0, start = 0.16, lineGap = 0.9 } = opts;
  lines.forEach((item, i) => {
    const lineObj = typeof item === 'string' ? { text: item } : item;
    const p = easeOutExpo(clamp((u - start - i * 0.13) / 0.8));
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.translate(0, 28 * (1 - p));
    ctx.fillStyle = lineObj.color || C.cream;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    ctx.font = font(size, lineObj.italic ? 'InstrumentItalic' : 'Instrument', 400);
    if (lineObj.glow) {
      ctx.shadowColor = lineObj.color || C.warm;
      ctx.shadowBlur = 32;
    }
    ctx.fillText(lineObj.text, x, y + i * size * lineGap);
    ctx.restore();
  });
}

function pill(x, y, w, h, text, opts = {}) {
  const {
    fill = C.warm,
    fg = C.ink,
    border = 'rgba(255,244,229,0.05)',
    alpha = 1,
    size = 22,
    arrow = true,
    family = 'BarlowSemi',
    tracking = 0.4,
  } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 8;
  rrect(x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = fg;
  ctx.font = font(size, family, 600);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(text).width;
  const startX = arrow ? x + h * 0.65 : x + (w - textW) / 2;
  ctx.fillText(text, startX, y + h / 2 + 1);
  if (arrow) {
    const ax = x + w - h * 0.72;
    const ay = y + h / 2;
    ctx.strokeStyle = fg;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(ax - 17, ay);
    ctx.lineTo(ax + 5, ay);
    ctx.moveTo(ax - 2, ay - 7);
    ctx.lineTo(ax + 5, ay);
    ctx.lineTo(ax - 2, ay + 7);
    ctx.stroke();
  }
  ctx.restore();
}

function iconBubble(x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  rrect(x + 1, y + 2, s - 2, s - 9, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.25, y + s - 7);
  ctx.lineTo(x + s * 0.19, y + s + 1);
  ctx.lineTo(x + s * 0.39, y + s - 7);
  ctx.stroke();
  ctx.restore();
}

function iconSpark(x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + s * 0.5, y + 2);
  ctx.lineTo(x + s * 0.58, y + s * 0.42);
  ctx.lineTo(x + s - 2, y + s * 0.5);
  ctx.lineTo(x + s * 0.58, y + s * 0.58);
  ctx.lineTo(x + s * 0.5, y + s - 2);
  ctx.lineTo(x + s * 0.42, y + s * 0.58);
  ctx.lineTo(x + 2, y + s * 0.5);
  ctx.lineTo(x + s * 0.42, y + s * 0.42);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + s * 0.5, y + s * 0.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function iconLink(x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + s * 0.44, y + s * 0.56);
  ctx.lineTo(x + s * 0.62, y + s * 0.38);
  ctx.moveTo(x + s * 0.30, y + s * 0.42);
  ctx.lineTo(x + s * 0.21, y + s * 0.51);
  ctx.arc(x + s * 0.34, y + s * 0.66, s * 0.23, Math.PI * 1.2, Math.PI * 0.1);
  ctx.moveTo(x + s * 0.70, y + s * 0.58);
  ctx.lineTo(x + s * 0.79, y + s * 0.49);
  ctx.arc(x + s * 0.66, y + s * 0.34, s * 0.23, Math.PI * 0.2, Math.PI * 1.1);
  ctx.stroke();
  ctx.restore();
}

function iconGame(x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  rrect(x + 2, y + s * 0.28, s - 4, s * 0.52, s * 0.20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.28, y + s * 0.5);
  ctx.lineTo(x + s * 0.45, y + s * 0.5);
  ctx.moveTo(x + s * 0.365, y + s * 0.42);
  ctx.lineTo(x + s * 0.365, y + s * 0.58);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + s * 0.66, y + s * 0.49, 2, 0, Math.PI * 2);
  ctx.arc(x + s * 0.75, y + s * 0.58, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function iconFile(x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 2);
  ctx.lineTo(x + s * 0.62, y + 2);
  ctx.lineTo(x + s - 4, y + s * 0.32);
  ctx.lineTo(x + s - 4, y + s - 3);
  ctx.lineTo(x + 5, y + s - 3);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.62, y + 2);
  ctx.lineTo(x + s * 0.62, y + s * 0.32);
  ctx.lineTo(x + s - 4, y + s * 0.32);
  ctx.moveTo(x + s * 0.24, y + s * 0.55);
  ctx.lineTo(x + s * 0.65, y + s * 0.55);
  ctx.moveTo(x + s * 0.24, y + s * 0.72);
  ctx.lineTo(x + s * 0.52, y + s * 0.72);
  ctx.stroke();
  ctx.restore();
}

function iconCheck(x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.arc(x + s / 2, y + s / 2, s / 2 - 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.28, y + s * 0.52);
  ctx.lineTo(x + s * 0.45, y + s * 0.68);
  ctx.lineTo(x + s * 0.74, y + s * 0.34);
  ctx.stroke();
  ctx.restore();
}

function drawMark(cx, cy, size, progress = 1, alpha = 1, color = C.warm) {
  const p = easeOutExpo(progress);
  const radius = size * 0.5;
  const nodes = [
    [0, -0.54],
    [0.54, 0],
    [0, 0.54],
    [-0.54, 0],
  ];
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = 'rgba(232,177,92,0.22)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.8;
  for (const [nx, ny] of nodes) {
    const x = cx + nx * radius * p;
    const y = cy + ny * radius * p;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, size * 0.042, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.092, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,244,229,0.42)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
const noiseCanvas = createCanvas(960, 540);
{
  const nctx = noiseCanvas.getContext('2d');
  const img = nctx.createImageData(960, 540);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 4 + Math.floor(Math.random() * 14);
  }
  nctx.putImageData(img, 0, 0);
}

const particles = Array.from({ length: 44 }, (_, i) => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: 1 + Math.random() * 2.8,
  speed: 4 + Math.random() * 10,
  drift: 12 + Math.random() * 26,
  phase: Math.random() * Math.PI * 2,
  kind: i % 7 === 0 ? 'leaf' : 'dot',
  color: i % 5 === 0 ? C.sage : i % 3 === 0 ? C.copper : C.warm,
}));

function drawBackdrop(t) {
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, W, H);

  let g = ctx.createRadialGradient(W * 0.74, H * 0.30, 0, W * 0.74, H * 0.30, 760);
  g.addColorStop(0, 'rgba(144, 70, 35, 0.24)');
  g.addColorStop(0.48, 'rgba(87, 42, 23, 0.13)');
  g.addColorStop(1, 'rgba(8, 5, 4, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  g = ctx.createRadialGradient(W * 0.13, H * 0.88, 0, W * 0.13, H * 0.88, 620);
  g.addColorStop(0, 'rgba(93, 82, 50, 0.13)');
  g.addColorStop(1, 'rgba(8, 5, 4, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, 'rgba(255, 211, 160, 0.018)');
  g.addColorStop(0.5, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(36, 17, 10, 0.12)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.strokeStyle = C.warm;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(W * 0.79, H * 0.48, 280 + i * 92, -Math.PI * 0.88, Math.PI * 0.18);
    ctx.stroke();
  }
  ctx.restore();

  // Sparse drifting dust / leaf motes.
  for (const p of particles) {
    const y = ((p.y - t * p.speed) % (H + 100) + H + 100) % (H + 100) - 50;
    const x = p.x + Math.sin(t * 0.23 + p.phase) * p.drift;
    ctx.save();
    ctx.globalAlpha = 0.11 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.7 + p.phase));
    ctx.fillStyle = p.color;
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.16 + p.phase) * 0.8);
    ctx.beginPath();
    if (p.kind === 'leaf') {
      ctx.ellipse(0, 0, p.r * 2.2, p.r * 0.8, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.drawImage(noiseCanvas, 0, 0, W, H);
  ctx.restore();

  g = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, W * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(232,177,92,0.08)';
  ctx.lineWidth = 1;
  for (let y = H - 152; y < H - 40; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawTopChrome(t) {
  const appear = smooth((t - 4.2) / 0.7);
  const leave = 1 - smooth((t - 41.2) / 0.8);
  const a = Math.min(appear, leave);
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  drawMark(68, 56, 22, 1, 0.96, C.warm);
  tracked('NEXUS', 90, 63, { size: 15, spacing: 3.1, color: C.cream, family: 'BarlowSemi' });
  tracked('A NEW CHAPTER', 185, 63, { size: 12, spacing: 3.5, color: C.dim, family: 'BarlowSemi' });
  tracked('TEXTNEXUS.ME / 2026', W - 72, 63, {
    size: 12,
    spacing: 3.0,
    color: C.dim,
    family: 'BarlowSemi',
    align: 'right',
  });
  line(72, 84, W - 72, 84, 'rgba(232,177,92,0.12)', 1);
  ctx.restore();
}

function drawFinalFade(t) {
  const start = DURATION - 0.75;
  const p = smooth((t - start) / 0.75);
  if (p <= 0) return;
  ctx.fillStyle = `rgba(0,0,0,${p})`;
  ctx.fillRect(0, 0, W, H);
}

function drawProgress(t) {
  const a = 0.45 * (1 - smooth((t - DURATION + 1.2) / 1.2));
  if (a <= 0.01) return;
  const w = W * clamp(t / DURATION);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, `rgba(232,177,92,${a * 0.25})`);
  g.addColorStop(0.75, `rgba(232,177,92,${a})`);
  g.addColorStop(1, `rgba(255,244,229,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, H - 3, w, 3);
}

function sceneAlpha(t, start, end) {
  const inA = smooth((t - start) / 0.5);
  const outA = 1 - smooth((t - (end - 0.5)) / 0.5);
  return Math.min(inA, outA);
}

function drawScene(t, start, end, fn) {
  const a = sceneAlpha(t, start, end);
  if (a <= 0.005) return;
  ctx.save();
  ctx.globalAlpha = a;
  fn(t - start, t);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Chrome and UI surfaces
// ---------------------------------------------------------------------------
function drawWindowShell(x, y, w, h, title, url, status = 'LIVE') {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.62)';
  ctx.shadowBlur = 62;
  ctx.shadowOffsetY = 26;
  rrect(x, y, w, h, 28);
  ctx.fillStyle = 'rgba(15, 9, 6, 0.96)';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(232,177,92,0.24)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.save();
  rrect(x, y, w, h, 28);
  ctx.clip();
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, 'rgba(255,244,229,0.055)');
  g.addColorStop(0.65, 'rgba(255,244,229,0.008)');
  g.addColorStop(1, 'rgba(232,177,92,0.03)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, 54);
  ctx.restore();

  ctx.fillStyle = 'rgba(255,244,229,0.30)';
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(x + 24 + i * 14, y + 27, 3.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = font(15, 'BarlowMedium', 500);
  ctx.fillStyle = 'rgba(255,244,229,0.76)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, x + 82, y + 27);

  const pillW = Math.min(w * 0.42, 360);
  const px = x + w - pillW - 92;
  rrect(px, y + 14, pillW, 27, 7);
  ctx.fillStyle = 'rgba(0,0,0,0.24)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,244,229,0.09)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = font(12, 'BarlowMedium', 500);
  ctx.fillStyle = 'rgba(255,244,229,0.40)';
  ctx.textAlign = 'center';
  ctx.fillText(url, px + pillW / 2, y + 28);

  rrect(x + w - 72, y + 17, 48, 21, 5);
  ctx.fillStyle = 'rgba(143,191,155,0.10)';
  ctx.fill();
  ctx.fillStyle = C.green;
  ctx.beginPath();
  ctx.arc(x + w - 58, y + 27.5, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = font(10, 'BarlowSemi', 600);
  ctx.textAlign = 'left';
  ctx.fillText(status, x + w - 50, y + 28);

  line(x, y + 54, x + w, y + 54, 'rgba(232,177,92,0.15)', 1);
  ctx.restore();
}

function drawShotWindow(img, x, y, w, h, title, url) {
  drawWindowShell(x, y, w, h, title, url, 'LIVE');
  const top = y + 55;
  const contentH = h - 55;
  ctx.save();
  rrect(x + 1, top, w - 2, contentH - 1, 0);
  ctx.clip();
  const scale = (w - 2) / img.width;
  const dh = img.height * scale;
  ctx.drawImage(img, x + 1, top, w - 2, dh);
  const fade = ctx.createLinearGradient(0, y + h - 140, 0, y + h);
  fade.addColorStop(0, 'rgba(12,7,5,0)');
  fade.addColorStop(1, 'rgba(12,7,5,0.82)');
  ctx.fillStyle = fade;
  ctx.fillRect(x + 1, y + h - 140, w - 2, 139);
  ctx.restore();
  ctx.save();
  rrect(x, y, w, h, 28);
  ctx.strokeStyle = 'rgba(232,177,92,0.24)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------
function sceneIntro(u) {
  const ringP = easeOutExpo(clamp(u / 1.2));
  ctx.save();
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 520);
  g.addColorStop(0, 'rgba(217,122,63,0.13)');
  g.addColorStop(0.6, 'rgba(217,122,63,0.04)');
  g.addColorStop(1, 'rgba(217,122,63,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(232,177,92,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(W / 2, 374, 255, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringP);
  ctx.stroke();
  ctx.restore();

  drawMark(W / 2, 374, 152, ringP, 1, C.warm);
  const titleP = easeOutExpo(clamp((u - 0.7) / 0.9));
  tracked('NEXUS', W / 2, 566, {
    size: 52,
    spacing: 21,
    color: C.cream,
    align: 'center',
    alpha: titleP,
    family: 'BarlowMedium',
  });
  const subP = easeOutExpo(clamp((u - 1.35) / 0.9));
  ctx.save();
  ctx.globalAlpha *= subP;
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'center';
  ctx.font = font(54, 'InstrumentItalic', 400);
  ctx.fillText('A warmer workspace.', W / 2, 650);
  ctx.restore();

  const footP = smooth((u - 2.1) / 0.8);
  line(W / 2 - 110, 720, W / 2 + 110, 720, 'rgba(232,177,92,0.24)', 1);
  tracked('TEXTNEXUS  //  EDITION X', W / 2, 752, {
    size: 14,
    spacing: 4.4,
    color: C.dim,
    align: 'center',
    alpha: footP,
    family: 'BarlowSemi',
  });
  tracked('THANKSGIVING 2026', W / 2, 816, {
    size: 11,
    spacing: 5,
    color: 'rgba(196,173,148,0.45)',
    align: 'center',
    alpha: footP,
    family: 'BarlowSemi',
  });
}

function sceneOne(u) {
  kicker('THE PLAN', 140, 304);
  serifHeadline(
    [
      { text: 'One place.' },
      { text: 'Less chaos.', italic: true, color: C.warm },
    ],
    140,
    438,
    { size: 116, u }
  );
  paragraph(
    'Chat, create, share, and take a break—without losing the thread. Nexus is being rebuilt as one connected workspace.',
    140,
    665,
    650,
    { u, start: 0.5, size: 29 }
  );
  tracked('CHAT   /   CREATE   /   SHARE   /   PLAY', 140, 844, {
    size: 14,
    spacing: 4.6,
    color: 'rgba(196,173,148,0.54)',
    alpha: smooth((u - 1.0) / 0.8),
    family: 'BarlowSemi',
  });

  const x = 960;
  const y = 188;
  const w = 800;
  const h = 684;
  drawWindowShell(x, y, w, h, 'Nexus OS', 'textnexus.me', 'ONLINE');
  ctx.save();
  ctx.font = font(35, 'Instrument', 400);
  ctx.fillStyle = C.cream;
  ctx.fillText('Your workspace, at a glance.', x + 38, y + 110);
  ctx.font = font(14, 'BarlowMedium', 500);
  ctx.fillStyle = C.dim;
  ctx.fillText('THANKSGIVING EDITION  ·  ONE CONNECTED FLOW', x + 38, y + 139);
  ctx.restore();

  const cards = [
    { title: 'Global Chat', text: 'Real-time conversation', tag: 'LIVE ROOM', icon: 'chat', color: C.warm },
    { title: 'AI Creator', text: 'A prompt to a starting point', tag: 'CREATE', icon: 'spark', color: C.copper },
    { title: 'GhostLink', text: 'A clean handoff for files', tag: 'SHARE', icon: 'link', color: C.sage },
    { title: 'Games table', text: 'A good reason to take five', tag: 'BREATHE', icon: 'game', color: '#c98b68' },
  ];
  const cw = 350;
  const ch = 205;
  const gx = 26;
  const gy = 22;
  const ox = x + 38;
  const oy = y + 166;
  cards.forEach((card, i) => {
    const p = easeOutExpo(clamp((u - 0.75 - i * 0.13) / 0.75));
    if (p <= 0) return;
    const cx = ox + (i % 2) * (cw + gx);
    const cy = oy + Math.floor(i / 2) * (ch + gy) + 20 * (1 - p);
    ctx.save();
    ctx.globalAlpha *= p;
    rrect(cx, cy, cw, ch, 16);
    const g = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
    g.addColorStop(0, 'rgba(255,244,229,0.055)');
    g.addColorStop(1, 'rgba(255,244,229,0.018)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,177,92,0.13)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 44, cy + 46, 21, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232,177,92,0.08)';
    ctx.fill();
    if (card.icon === 'chat') iconBubble(cx + 34, cy + 36, 20, card.color);
    if (card.icon === 'spark') iconSpark(cx + 34, cy + 36, 20, card.color);
    if (card.icon === 'link') iconLink(cx + 34, cy + 36, 20, card.color);
    if (card.icon === 'game') iconGame(cx + 34, cy + 36, 20, card.color);
    ctx.font = font(20, 'BarlowSemi', 600);
    ctx.fillStyle = C.cream;
    ctx.fillText(card.title, cx + 78, cy + 48);
    ctx.font = font(14, 'Barlow', 400);
    ctx.fillStyle = C.muted;
    ctx.fillText(card.text, cx + 78, cy + 73);
    tracked(card.tag, cx + 24, cy + ch - 26, {
      size: 10,
      spacing: 2.8,
      color: 'rgba(232,177,92,0.67)',
      family: 'BarlowSemi',
    });
    ctx.strokeStyle = 'rgba(232,177,92,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + cw - 49, cy + ch - 30);
    ctx.lineTo(cx + cw - 27, cy + ch - 30);
    ctx.moveTo(cx + cw - 34, cy + ch - 37);
    ctx.lineTo(cx + cw - 27, cy + ch - 30);
    ctx.lineTo(cx + cw - 34, cy + ch - 23);
    ctx.stroke();
    ctx.restore();
  });

  ctx.save();
  ctx.globalAlpha *= smooth((u - 1.7) / 0.7);
  line(x + 38, y + h - 62, x + w - 38, y + h - 62, 'rgba(232,177,92,0.13)', 1);
  ctx.fillStyle = C.green;
  ctx.beginPath();
  ctx.arc(x + 48, y + h - 36, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = font(13, 'BarlowMedium', 500);
  ctx.fillStyle = C.dim;
  ctx.fillText('All modules in one workspace', x + 62, y + h - 31);
  tracked('THE PLAN', x + w - 38, y + h - 31, {
    size: 11,
    spacing: 3.2,
    color: 'rgba(232,177,92,0.58)',
    align: 'right',
    family: 'BarlowSemi',
  });
  ctx.restore();
}

function drawChatDemo(x, y, w, h, u) {
  drawWindowShell(x, y, w, h, 'TextNexus / Global Chat', 'textnexus.me/TextNexus.html', 'LIVE');
  const top = y + 55;
  ctx.save();
  rrect(x + 1, top, w - 2, h - 56, 0);
  ctx.clip();

  ctx.fillStyle = 'rgba(255,244,229,0.022)';
  ctx.fillRect(x + 1, top, 152, h - 56);
  line(x + 153, top, x + 153, y + h - 1, 'rgba(232,177,92,0.11)', 1);

  drawMark(x + 31, top + 33, 22, 1, 0.95, C.warm);
  tracked('NEXUS', x + 48, top + 38, {
    size: 11,
    spacing: 2.5,
    color: C.cream,
    family: 'BarlowSemi',
  });
  tracked('WORKSPACE', x + 18, top + 63, {
    size: 8,
    spacing: 2.4,
    color: C.dim,
    family: 'BarlowSemi',
  });

  const channels = [
    { name: 'GLOBAL CHAT', active: true },
    { name: 'UPDATES', active: false },
    { name: 'GHOSTLINK', active: false },
    { name: 'GAMES TABLE', active: false },
  ];
  let cy = top + 100;
  channels.forEach((channel, i) => {
    const p = smooth((u - 0.35 - i * 0.09) / 0.5);
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha *= p;
    if (channel.active) {
      rrect(x + 12, cy, 126, 33, 8);
      ctx.fillStyle = 'rgba(232,177,92,0.10)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(232,177,92,0.18)';
      ctx.stroke();
      ctx.fillStyle = C.warm;
      ctx.fillRect(x + 12, cy + 8, 2, 17);
    }
    ctx.font = font(10, 'BarlowSemi', 600);
    ctx.fillStyle = channel.active ? C.cream : 'rgba(196,173,148,0.48)';
    ctx.fillText(channel.name, x + 25, cy + 21);
    ctx.restore();
    cy += 42;
  });

  ctx.save();
  line(x + 18, y + h - 86, x + 138, y + h - 86, 'rgba(232,177,92,0.11)', 1);
  ctx.beginPath();
  ctx.arc(x + 30, y + h - 55, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = C.green;
  ctx.fill();
  ctx.font = font(10, 'BarlowSemi', 600);
  ctx.fillStyle = C.muted;
  ctx.fillText('LIVE ROOM', x + 42, y + h - 51);
  ctx.font = font(11, 'Barlow', 400);
  ctx.fillStyle = C.dim;
  ctx.fillText('You are online', x + 18, y + h - 27);
  ctx.restore();

  const mx = x + 176;
  const mw = w - 200;
  tracked('GLOBAL CHAT', mx, top + 37, {
    size: 16,
    spacing: 3.0,
    color: C.cream,
    family: 'BarlowSemi',
  });
  ctx.font = font(11, 'Barlow', 400);
  ctx.fillStyle = C.dim;
  ctx.fillText('Open to everyone in the workspace', mx, top + 57);
  line(mx, top + 76, mx + mw, top + 76, 'rgba(232,177,92,0.11)', 1);
  ctx.save();
  ctx.beginPath();
  ctx.arc(mx + mw - 9, top + 38, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = C.green;
  ctx.fill();
  tracked('LIVE', mx + mw, top + 42, {
    size: 9,
    spacing: 2,
    color: C.green,
    align: 'right',
    family: 'BarlowSemi',
  });
  ctx.restore();

  const messages = [
    {
      name: 'MAYA',
      initial: 'M',
      color: C.copper,
      text: 'The harvest build is live.',
      time: 'now',
      mine: false,
    },
    {
      name: 'DEV',
      initial: 'D',
      color: C.sage,
      text: 'GhostLink is so clean now.',
      time: 'now',
      mine: false,
    },
    {
      name: 'MAYA',
      initial: 'M',
      color: C.copper,
      text: 'Pulled up the games table. Five-minute break?',
      time: 'now',
      mine: false,
    },
    {
      name: 'YOU',
      initial: 'Y',
      color: C.warm,
      text: 'On it. Back in ten.',
      time: 'now',
      mine: true,
    },
  ];

  let my = top + 98;
  messages.forEach((message, i) => {
    const p = easeOutExpo(clamp((u - 0.7 - i * 0.22) / 0.6));
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.translate(0, 12 * (1 - p));

    ctx.font = font(15, 'Barlow', 400);
    const lines = [];
    let current = '';
    for (const word of message.text.split(' ')) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > 268 && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    const bubbleW = 300;
    const bubbleH = 45 + lines.length * 20;
    const bubbleX = message.mine ? mx + mw - bubbleW : mx + 42;
    if (!message.mine) {
      ctx.beginPath();
      ctx.arc(mx + 16, my + 17, 15, 0, Math.PI * 2);
      ctx.fillStyle = message.color;
      ctx.fill();
      ctx.font = font(11, 'BarlowBold', 700);
      ctx.fillStyle = C.ink;
      ctx.textAlign = 'center';
      ctx.fillText(message.initial, mx + 16, my + 21);
      ctx.textAlign = 'left';
    }
    rrect(bubbleX, my, bubbleW, bubbleH, 13);
    ctx.fillStyle = message.mine ? 'rgba(232,177,92,0.15)' : 'rgba(255,244,229,0.045)';
    ctx.fill();
    ctx.strokeStyle = message.mine ? 'rgba(232,177,92,0.28)' : 'rgba(232,177,92,0.10)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = font(9, 'BarlowSemi', 600);
    ctx.fillStyle = message.mine ? C.warm : message.color;
    ctx.fillText(message.name, bubbleX + 14, my + 18);
    ctx.font = font(9, 'Barlow', 400);
    ctx.fillStyle = 'rgba(196,173,148,0.38)';
    ctx.textAlign = 'right';
    ctx.fillText(message.time, bubbleX + bubbleW - 14, my + 18);
    ctx.textAlign = 'left';
    ctx.font = font(15, 'Barlow', 400);
    ctx.fillStyle = C.cream;
    lines.forEach((ln, j) => ctx.fillText(ln, bubbleX + 14, my + 41 + j * 20));
    ctx.restore();
    my += bubbleH + 16;
  });

  const inputY = y + h - 105;
  rrect(mx, inputY, mw, 54, 12);
  ctx.fillStyle = 'rgba(255,244,229,0.035)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,177,92,0.14)';
  ctx.stroke();
  ctx.font = font(14, 'Barlow', 400);
  ctx.fillStyle = 'rgba(196,173,148,0.43)';
  ctx.fillText('Message the room…', mx + 16, inputY + 33);
  rrect(mx + mw - 45, inputY + 12, 30, 30, 9);
  ctx.fillStyle = 'rgba(232,177,92,0.80)';
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(mx + mw - 34, inputY + 27);
  ctx.lineTo(mx + mw - 24, inputY + 27);
  ctx.moveTo(mx + mw - 28, inputY + 21);
  ctx.lineTo(mx + mw - 22, inputY + 27);
  ctx.lineTo(mx + mw - 28, inputY + 33);
  ctx.stroke();
  ctx.restore();
}

function sceneTwo(u) {
  kicker('REAL-TIME CHAT', 140, 304);
  serifHeadline(
    [
      { text: 'Stay in the' },
      { text: 'conversation.', italic: true, color: C.warm },
    ],
    140,
    438,
    { size: 112, u }
  );
  paragraph(
    'A real-time room that lives in your browser. No installs. No extra tab. Just the people and the thread you came for.',
    140,
    665,
    650,
    { u, start: 0.5, size: 29 }
  );
  const chipY = 816;
  ['GROUP CHAT', 'PRESENCE', 'NO INSTALLS'].forEach((s, i) => {
    const p = smooth((u - 1.1 - i * 0.1) / 0.6);
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha *= p;
    rrect(140 + i * 166, chipY, 150, 34, 17);
    ctx.fillStyle = 'rgba(255,244,229,0.035)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,177,92,0.14)';
    ctx.stroke();
    tracked(s, 215 + i * 166, chipY + 22, {
      size: 10,
      spacing: 2.6,
      color: C.dim,
      align: 'center',
      family: 'BarlowSemi',
    });
    ctx.restore();
  });

  drawChatDemo(1080, 150, 640, 820, u);
}

function sceneThree(u) {
  kicker('NEXUS AI CREATOR', 140, 304);
  serifHeadline(
    [
      { text: 'Describe it.' },
      { text: 'Make it real.', italic: true, color: C.warm },
    ],
    140,
    438,
    { size: 112, u }
  );
  paragraph(
    'Start with a sentence. Nexus helps shape the structure, sections, and style of your next site—then hands you the controls.',
    140,
    665,
    650,
    { u, start: 0.5, size: 29 }
  );
  tracked('FROM PROMPT  /  PREVIEW  /  YOURS', 140, 848, {
    size: 13,
    spacing: 3.9,
    color: 'rgba(196,173,148,0.50)',
    alpha: smooth((u - 1.0) / 0.8),
    family: 'BarlowSemi',
  });

  const x = 930;
  const y = 152;
  const w = 830;
  const h = 776;
  drawWindowShell(x, y, w, h, 'AI Creator Studio', 'textnexus.me/creator', 'DRAFT');
  const px = x + 34;
  const py = y + 94;
  const pw = 338;
  const ph = 548;
  ctx.save();
  rrect(px, py, pw, ph, 16);
  ctx.fillStyle = 'rgba(255,244,229,0.035)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,177,92,0.13)';
  ctx.stroke();
  tracked('PROMPT', px + 22, py + 36, {
    size: 10,
    spacing: 3,
    color: C.warm,
    family: 'BarlowSemi',
  });
  ctx.font = font(22, 'Barlow', 400);
  ctx.fillStyle = C.cream;
  const prompt = 'Build a warm landing page for our community workspace.';
  const typed = prompt.slice(0, Math.floor(clamp((u - 1.0) / 1.9) * prompt.length));
  const words = typed.split(' ');
  let line = '';
  let ly = py + 84;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > pw - 46) {
      ctx.fillText(line, px + 22, ly);
      ly += 33;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, px + 22, ly);
  if (u < 3.2 || Math.floor(u * 2) % 2 === 0) {
    const tw = line ? ctx.measureText(line).width : 0;
    ctx.fillStyle = C.warm;
    ctx.fillRect(px + 22 + tw + 2, ly - 19, 2, 23);
  }

  const chipP = (idx) => smooth((u - 2.4 - idx * 0.12) / 0.5);
  ['STRUCTURE', 'SECTIONS', 'STYLE'].forEach((s, i) => {
    const p = chipP(i);
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha *= p;
    const cw = 94;
    const cx = px + 22 + i * 101;
    const cy = py + 376;
    rrect(cx, cy, cw, 28, 6);
    ctx.fillStyle = 'rgba(232,177,92,0.07)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,177,92,0.16)';
    ctx.stroke();
    tracked(s, cx + cw / 2, cy + 19, {
      size: 8,
      spacing: 1.8,
      color: C.muted,
      align: 'center',
      family: 'BarlowSemi',
    });
    ctx.restore();
  });

  const gp = smooth((u - 2.75) / 0.5);
  if (gp > 0) {
    ctx.save();
    ctx.globalAlpha *= gp;
    pill(px + 22, py + ph - 80, pw - 44, 50, 'Generate', {
      fill: C.warm,
      fg: C.ink,
      size: 18,
      alpha: 1,
    });
    ctx.restore();
  }

  // Preview pane.
  const vx = x + 398;
  const vy = y + 94;
  const vw = 398;
  const vh = 548;
  ctx.save();
  rrect(vx, vy, vw, vh, 16);
  ctx.fillStyle = 'rgba(8,5,4,0.60)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,177,92,0.13)';
  ctx.stroke();
  ctx.restore();

  const vp = smooth((u - 2.9) / 0.8);
  if (vp > 0) {
    ctx.save();
    ctx.globalAlpha *= vp;
    ctx.translate(0, 16 * (1 - vp));
    rrect(vx + 16, vy + 16, vw - 32, vh - 32, 11);
    ctx.fillStyle = '#f9ecda';
    ctx.fill();
    const innerX = vx + 16;
    const innerY = vy + 16;
    const innerW = vw - 32;
    ctx.fillStyle = '#2a160d';
    ctx.fillRect(innerX, innerY, innerW, 31);
    ctx.fillStyle = 'rgba(255,244,229,0.55)';
    ctx.font = font(10, 'BarlowSemi', 600);
    ctx.fillText('NEXUS / PREVIEW', innerX + 12, innerY + 20);
    ctx.fillStyle = '#f9ecda';
    ctx.fillRect(innerX + 16, innerY + 58, innerW - 32, 1);
    ctx.font = font(28, 'Instrument', 400);
    ctx.fillStyle = '#2a160d';
    ctx.fillText('A place to gather.', innerX + 18, innerY + 104);
    ctx.font = font(11, 'Barlow', 400);
    ctx.fillStyle = '#7d5a42';
    ctx.fillText('A warmer home for the people who build here.', innerX + 18, innerY + 128);
    rrect(innerX + 18, innerY + 151, 94, 28, 14);
    ctx.fillStyle = '#c66f38';
    ctx.fill();
    ctx.fillStyle = '#fff4e5';
    ctx.font = font(10, 'BarlowSemi', 600);
    ctx.fillText('Step inside', innerX + 31, innerY + 169);
    for (let i = 0; i < 3; i += 1) {
      rrect(innerX + 18 + i * (innerW - 48) / 3 + i * 6, innerY + 211, (innerW - 60) / 3, 76, 8);
      ctx.fillStyle = i === 1 ? '#e6c59e' : '#efdcc5';
      ctx.fill();
      ctx.fillStyle = '#b47b52';
      ctx.fillRect(innerX + 28 + i * (innerW - 48) / 3 + i * 6, innerY + 230, 22, 3);
      ctx.fillStyle = '#7d5a42';
      ctx.fillRect(innerX + 28 + i * (innerW - 48) / 3 + i * 6, innerY + 243, 44, 2);
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalAlpha *= 0.55;
    ctx.setLineDash([5, 7]);
    ctx.strokeStyle = 'rgba(232,177,92,0.24)';
    rrect(vx + 34, vy + 58, vw - 68, vh - 116, 12);
    ctx.stroke();
    ctx.setLineDash([]);
    tracked('WAITING FOR A PROMPT', vx + vw / 2, vy + vh / 2, {
      size: 10,
      spacing: 2.7,
      color: 'rgba(196,173,148,0.48)',
      align: 'center',
      family: 'BarlowSemi',
    });
    ctx.restore();
  }

  const statusP = smooth((u - 2.15) / 0.5);
  if (statusP > 0) {
    ctx.save();
    ctx.globalAlpha *= statusP;
    const status = u < 3.35 ? 'Drafting structure…' : 'Ready to refine';
    ctx.font = font(12, 'BarlowMedium', 500);
    ctx.fillStyle = u < 3.5 ? C.warm : C.green;
    ctx.textAlign = 'right';
    ctx.fillText(status, x + w - 38, y + h - 30);
    ctx.restore();
  }
}

function sceneFour(u) {
  kicker('GHOSTLINK', 140, 304);
  serifHeadline(
    [
      { text: 'Send it.' },
      { text: 'Keep the flow.', italic: true, color: C.warm },
    ],
    140,
    438,
    { size: 112, u }
  );
  paragraph(
    'Share files through a clean, direct link—without turning the room into a file manager. Send the thing. Get back to the work.',
    140,
    665,
    650,
    { u, start: 0.5, size: 29 }
  );
  const ap = smooth((u - 1.7) / 0.7);
  if (ap > 0) {
    ctx.save();
    ctx.globalAlpha *= ap;
    line(820, 806, 988, 806, 'rgba(232,177,92,0.30)', 1.2);
    ctx.fillStyle = C.warm;
    ctx.beginPath();
    ctx.arc(988, 806, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const x = 1020;
  const y = 250;
  const w = 720;
  const h = 580;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 52;
  ctx.shadowOffsetY = 20;
  rrect(x, y, w, h, 24);
  ctx.fillStyle = 'rgba(18, 11, 8, 0.96)';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(232,177,92,0.22)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  tracked('GHOSTLINK  //  SECURE DROP', x + 34, y + 44, {
    size: 11,
    spacing: 2.8,
    color: C.warm,
    family: 'BarlowSemi',
  });
  rrect(x + w - 112, y + 24, 78, 26, 13);
  ctx.fillStyle = 'rgba(143,191,155,0.10)';
  ctx.fill();
  ctx.fillStyle = C.green;
  ctx.beginPath();
  ctx.arc(x + w - 96, y + 37, 3, 0, Math.PI * 2);
  ctx.fill();
  tracked('READY', x + w - 86, y + 42, {
    size: 9,
    spacing: 2,
    color: C.green,
    family: 'BarlowSemi',
  });
  ctx.restore();

  const fx = x + 38;
  const fy = y + 82;
  const fw = w - 76;
  ctx.save();
  rrect(fx, fy, fw, 142, 14);
  ctx.fillStyle = 'rgba(255,244,229,0.035)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,177,92,0.12)';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(fx + 54, fy + 56, 27, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(217,122,63,0.10)';
  ctx.fill();
  iconFile(fx + 41, fy + 41, 27, C.warm);
  ctx.font = font(22, 'BarlowSemi', 600);
  ctx.fillStyle = C.cream;
  ctx.fillText('thanksgiving-menu.pdf', fx + 96, fy + 48);
  ctx.font = font(13, 'Barlow', 400);
  ctx.fillStyle = C.dim;
  ctx.fillText('PDF  ·  2.4 MB  ·  ready to send', fx + 96, fy + 74);
  rrect(fx + fw - 116, fy + 28, 84, 28, 14);
  ctx.fillStyle = 'rgba(255,244,229,0.06)';
  ctx.fill();
  tracked('REMOVE', fx + fw - 74, fy + 47, {
    size: 8,
    spacing: 1.6,
    color: C.dim,
    align: 'center',
    family: 'BarlowSemi',
  });
  ctx.restore();

  const progress = smooth((u - 0.7) / 1.7);
  ctx.save();
  rrect(fx, fy + 174, fw, 6, 3);
  ctx.fillStyle = 'rgba(255,244,229,0.08)';
  ctx.fill();
  rrect(fx, fy + 174, fw * progress, 6, 3);
  const g = ctx.createLinearGradient(fx, 0, fx + fw, 0);
  g.addColorStop(0, C.copper);
  g.addColorStop(1, C.warm);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();

  const ready = smooth((u - 1.9) / 0.5);
  if (ready > 0) {
    ctx.save();
    ctx.globalAlpha *= ready;
    rrect(x + 38, y + 300, w - 76, 128, 14);
    ctx.fillStyle = 'rgba(255,244,229,0.035)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,177,92,0.14)';
    ctx.stroke();
    tracked('YOUR LINK', x + 58, y + 330, {
      size: 9,
      spacing: 2.8,
      color: C.dim,
      family: 'BarlowSemi',
    });
    ctx.font = font(21, 'BarlowMedium', 500);
    ctx.fillStyle = C.cream;
    ctx.fillText('textnexus.me/g/nexus-9f2a', x + 58, y + 374);
    ctx.beginPath();
    ctx.moveTo(x + w - 148, y + 338);
    ctx.lineTo(x + w - 148, y + 394);
    ctx.strokeStyle = 'rgba(232,177,92,0.14)';
    ctx.stroke();
    const copied = u > 3.8;
    tracked(copied ? 'COPIED' : 'COPY', x + w - 93, y + 373, {
      size: 10,
      spacing: 2.4,
      color: copied ? C.green : C.warm,
      align: 'center',
      family: 'BarlowSemi',
    });
    if (copied) {
      iconCheck(x + w - 112, y + 351, 17, C.green);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha *= smooth((u - 3.4) / 0.6);
  line(x + 38, y + h - 84, x + w - 38, y + h - 84, 'rgba(232,177,92,0.13)', 1);
  ctx.font = font(14, 'BarlowMedium', 500);
  ctx.fillStyle = C.dim;
  ctx.fillText('A clean handoff, built into the workspace.', x + 38, y + h - 48);
  drawMark(x + w - 54, y + h - 51, 26, 1, 0.82, C.warm);
  ctx.restore();
}

function sceneFive(u) {
  kicker('THE NEXUS GAMES TABLE', 140, 304);
  serifHeadline(
    [
      { text: 'Take a breath.' },
      { text: 'Good company.', italic: true, color: C.warm },
    ],
    140,
    438,
    { size: 108, u }
  );
  paragraph(
    'A hand-picked directory of browser games from CrazyGames and Hooda Math. The games stay with their makers; the doorway lives here.',
    140,
    665,
    650,
    { u, start: 0.5, size: 28 }
  );
  const noteP = smooth((u - 1.35) / 0.7);
  if (noteP > 0) {
    ctx.save();
    ctx.globalAlpha *= noteP;
    rrect(140, 830, 358, 44, 22);
    ctx.fillStyle = 'rgba(255,244,229,0.035)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,177,92,0.14)';
    ctx.stroke();
    tracked('A DIRECTORY, NOT A COPY', 319, 857, {
      size: 10,
      spacing: 2.6,
      color: C.muted,
      align: 'center',
      family: 'BarlowSemi',
    });
    ctx.restore();
  }

  const wx = 1090;
  const wy = 150;
  const ww = 630;
  const wh = 800;
  drawShotWindow(gamesShot, wx, wy, ww, wh, 'The games table', 'textnexus.me/games');

}

function sceneSix(u) {
  const p = smooth((u - 0.7) / 1.0);
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.strokeStyle = 'rgba(232,177,92,0.08)';
  ctx.lineWidth = 2;
  ctx.font = font(280, 'BarlowX', 800);
  ctx.fillStyle = 'rgba(232,177,92,0.025)';
  ctx.fillText('CHANGE', 880, 790);
  ctx.restore();

  kicker('BUILDING IN PUBLIC  //  2026', 140, 304);
  serifHeadline(
    [
      { text: 'Nexus is' },
      { text: 'changing.', italic: true, color: C.warm, glow: true },
    ],
    140,
    438,
    { size: 126, u }
  );
  paragraph(
    'The harvest redesign is live. New tools, a new rhythm, and a lot more on the bench. We are building the next Nexus in the open—and we want you in the room.',
    140,
    690,
    650,
    { u, start: 0.5, size: 28 }
  );

  const cards = [
    {
      tag: 'NOW LIVE',
      title: 'Harvest redesign',
      text: 'A warmer, simpler workspace.',
      color: C.green,
      status: 'LIVE',
    },
    {
      tag: 'IN THE WORKSHOP',
      title: 'New tools',
      text: 'Creator, sharing, games, feedback.',
      color: C.warm,
      status: 'SHIPPING',
    },
    {
      tag: 'YOUR MOVE',
      title: 'The next release',
      text: 'Shaped by the people using it.',
      color: C.copper,
      status: 'OPEN',
    },
  ];
  cards.forEach((card, i) => {
    const ap = easeOutExpo(clamp((u - 0.9 - i * 0.16) / 0.8));
    if (ap <= 0) return;
    const x = 1030;
    const y = 214 + i * 172;
    ctx.save();
    ctx.globalAlpha *= ap;
    ctx.translate(28 * (1 - ap), 0);
    rrect(x, y, 740, 148, 18);
    const g = ctx.createLinearGradient(x, y, x + 740, y + 148);
    g.addColorStop(0, 'rgba(255,244,229,0.055)');
    g.addColorStop(1, 'rgba(255,244,229,0.018)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,177,92,0.15)';
    ctx.stroke();
    ctx.font = font(12, 'BarlowSemi', 600);
    ctx.fillStyle = card.color;
    ctx.fillText(card.tag, x + 30, y + 38);
    ctx.font = font(29, 'BarlowMedium', 500);
    ctx.fillStyle = C.cream;
    ctx.fillText(card.title, x + 30, y + 78);
    ctx.font = font(15, 'Barlow', 400);
    ctx.fillStyle = C.muted;
    ctx.fillText(card.text, x + 30, y + 108);
    ctx.font = font(11, 'BarlowSemi', 600);
    ctx.fillStyle = 'rgba(196,173,148,0.58)';
    ctx.textAlign = 'right';
    ctx.fillText(card.status, x + 710, y + 38);
    ctx.strokeStyle = 'rgba(232,177,92,0.16)';
    ctx.beginPath();
    ctx.moveTo(x + 660, y + 58);
    ctx.lineTo(x + 710, y + 58);
    ctx.stroke();
    ctx.restore();
  });

  // Moving ticker of real changes.
  const ty = H - 102;
  ctx.save();
  ctx.fillStyle = 'rgba(7,4,3,0.68)';
  ctx.fillRect(0, ty, W, 58);
  line(0, ty, W, ty, 'rgba(232,177,92,0.16)', 1);
  const ticker = 'HARVEST REDESIGN   ·   RESIZABLE WORKSPACE   ·   GAMES TABLE   ·   YOUTUBE RAIL   ·   FEEDBACK LOOP   ·   BUILT IN PUBLIC   ·   ';
  ctx.font = font(13, 'BarlowSemi', 600);
  const tw = ctx.measureText(ticker).width;
  const offset = ((u * 58) % tw) - tw;
  ctx.fillStyle = 'rgba(232,177,92,0.64)';
  ctx.textAlign = 'left';
  for (let i = 0; i < 3; i += 1) ctx.fillText(ticker, offset + i * tw, ty + 36);
  ctx.restore();
}

function sceneSeven(u) {
  kicker('THE NEXT VERSION IS YOURS', 140, 304);
  serifHeadline(
    [
      { text: 'Help us build' },
      { text: "what's next.", italic: true, color: C.warm },
    ],
    140,
    438,
    { size: 106, u }
  );
  paragraph(
    'Tell us what feels rough, what is missing, and what you want Nexus to become. Real feedback goes straight to the team.',
    140,
    665,
    650,
    { u, start: 0.5, size: 28 }
  );

  const prompts = ['USABILITY', 'INTEGRATIONS', 'INNOVATION', 'DESIGN'];
  prompts.forEach((s, i) => {
    const p = smooth((u - 1.0 - i * 0.09) / 0.6);
    if (p <= 0) return;
    const x = 140 + (i % 2) * 234;
    const y = 764 + Math.floor(i / 2) * 52;
    ctx.save();
    ctx.globalAlpha *= p;
    rrect(x, y, 218, 38, 8);
    ctx.fillStyle = 'rgba(255,244,229,0.035)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,177,92,0.13)';
    ctx.stroke();
    iconCheck(x + 12, y + 10, 18, C.warm);
    tracked(s, x + 42, y + 25, {
      size: 9,
      spacing: 2.2,
      color: C.muted,
      family: 'BarlowSemi',
    });
    ctx.restore();
  });

  const cp = smooth((u - 1.85) / 0.65);
  if (cp > 0) {
    ctx.save();
    ctx.globalAlpha *= cp;
    rrect(140, 890, 438, 62, 31);
    ctx.fillStyle = C.warm;
    ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = font(18, 'BarlowSemi', 600);
    ctx.fillText('textnexus.me/feedback', 180, 928);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(500, 921);
    ctx.lineTo(534, 921);
    ctx.moveTo(525, 912);
    ctx.lineTo(534, 921);
    ctx.lineTo(525, 930);
    ctx.stroke();
    ctx.restore();
  }

  const wx = 1180;
  const wy = 150;
  const ww = 544;
  const wh = 800;
  drawShotWindow(feedbackShot, wx, wy, ww, wh, 'Send feedback', 'textnexus.me/feedback');

}

function sceneEnd(u) {
  const p = easeOutExpo(clamp(u / 1.0));
  drawMark(W / 2, 252, 132, p, 1, C.warm);
  tracked('NEXUS', W / 2, 382, {
    size: 48,
    spacing: 17,
    color: C.cream,
    align: 'center',
    alpha: smooth((u - 0.35) / 0.7),
    family: 'BarlowMedium',
  });
  tracked('//  HARVEST 2026', W / 2, 416, {
    size: 11,
    spacing: 4.0,
    color: C.dim,
    align: 'center',
    alpha: smooth((u - 0.55) / 0.7),
    family: 'BarlowSemi',
  });
  serifHeadline([{ text: 'Come build with us.' }], W / 2, 566, {
    size: 108,
    align: 'center',
    u,
    start: 0.7,
  });
  paragraph('Explore the workspace. Tell us what is next.', W / 2, 625, 760, {
    u,
    start: 1.0,
    size: 27,
    color: C.muted,
    family: 'Barlow',
    align: 'center',
  });

  const ctaP = smooth((u - 1.25) / 0.7);
  if (ctaP > 0) {
    ctx.save();
    ctx.globalAlpha *= ctaP;
    pill(W / 2 - 228, 706, 456, 74, 'textnexus.me', {
      fill: C.cream,
      fg: C.ink,
      size: 25,
      alpha: 1,
    });
    ctx.restore();
  }
  tracked('EXPLORE  ·  BREAK THINGS  ·  TELL US WHAT IS NEXT', W / 2, 844, {
    size: 11,
    spacing: 3.6,
    color: 'rgba(196,173,148,0.50)',
    align: 'center',
    alpha: smooth((u - 1.7) / 0.7),
    family: 'BarlowSemi',
  });
  line(W / 2 - 335, 922, W / 2 + 335, 922, 'rgba(232,177,92,0.17)', 1);
  tracked('OFFICIAL FILM  //  THANKSGIVING 2026', W / 2, 960, {
    size: 11,
    spacing: 3.3,
    color: C.dim,
    align: 'center',
    alpha: smooth((u - 2.0) / 0.7),
    family: 'BarlowSemi',
  });
  tracked('YOUTUBE  /  @NEXUSOFFICIAL-F7I', W / 2, 990, {
    size: 9,
    spacing: 3.0,
    color: 'rgba(196,173,148,0.36)',
    align: 'center',
    alpha: smooth((u - 2.2) / 0.7),
    family: 'BarlowSemi',
  });
}

// ---------------------------------------------------------------------------
// Load screenshots
// ---------------------------------------------------------------------------
const shotPath = (name) => path.join(ASSETS, name);
const loadLocal = (file) => loadImage(fs.readFileSync(file));
const [homeShot, chatShot, gamesShot, feedbackShot] = await Promise.all([
  loadLocal(shotPath('live-index.png')),
  loadLocal(shotPath('thanksgiving-chat.png')),
  loadLocal(shotPath('thanksgiving-games.png')),
  loadLocal(shotPath('thanksgiving-feedback.png')),
]);

function drawFrame(t) {
  drawBackdrop(t);
  drawScene(t, 0.0, 4.0, sceneIntro);
  drawScene(t, 4.0, 9.0, sceneOne);
  drawScene(t, 9.0, 14.0, sceneTwo);
  drawScene(t, 14.0, 20.0, sceneThree);
  drawScene(t, 20.0, 25.0, sceneFour);
  drawScene(t, 25.0, 30.0, sceneFive);
  drawScene(t, 30.0, 36.0, sceneSix);
  drawScene(t, 36.0, 42.0, sceneSeven);
  drawScene(t, 42.0, 47.5, sceneEnd);
  drawTopChrome(t);
  drawProgress(t);
  drawFinalFade(t);
}

// ---------------------------------------------------------------------------
// Stills + contact sheet
// ---------------------------------------------------------------------------
const STILL_TIMES = [2.2, 6.5, 11.5, 18.4, 23.2, 27.5, 33.5, 39.2, 45.2];

async function renderStills() {
  const dir = path.join(HERE, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  STILL_TIMES.forEach((t, i) => {
    drawFrame(t);
    const file = path.join(dir, `still-${String(i + 1).padStart(2, '0')}-${t.toFixed(1)}s.png`);
    fs.writeFileSync(file, canvas.toBuffer('image/png'));
    files.push({ file, t });
    console.log(`still ${i + 1}/${STILL_TIMES.length}: ${t.toFixed(1)}s`);
  });

  const sheet = createCanvas(W, H);
  const sctx = sheet.getContext('2d');
  sctx.fillStyle = '#080504';
  sctx.fillRect(0, 0, W, H);
  for (let i = 0; i < files.length; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const tw = 640;
    const th = 360;
    const tx = col * tw;
    const ty = row * th;
    const img = await loadLocal(files[i].file);
    sctx.drawImage(img, tx, ty, tw, th);
    sctx.fillStyle = 'rgba(0,0,0,0.58)';
    sctx.fillRect(tx + 14, ty + th - 40, 105, 26);
    sctx.font = '600 13px BarlowSemi';
    sctx.fillStyle = '#e8b15c';
    sctx.fillText(`${files[i].t.toFixed(1)}s`, tx + 24, ty + th - 22);
  }
  const sheetPath = path.join(HERE, 'contact-sheet.png');
  fs.writeFileSync(sheetPath, sheet.toBuffer('image/png'));
  console.log(`contact sheet: ${sheetPath}`);
}

// ---------------------------------------------------------------------------
// Thumbnail
// ---------------------------------------------------------------------------
async function renderThumbnail() {
  const tw = 1280;
  const th = 720;
  const tcanvas = createCanvas(tw, th);
  // Draw a standalone thumbnail on its own canvas.
  const tc = tcanvas.getContext('2d');
  tc.fillStyle = '#080504';
  tc.fillRect(0, 0, tw, th);
  const g = tc.createRadialGradient(1030, 180, 0, 1030, 180, 620);
  g.addColorStop(0, 'rgba(182,92,44,0.35)');
  g.addColorStop(1, 'rgba(8,5,4,0)');
  tc.fillStyle = g;
  tc.fillRect(0, 0, tw, th);
  const g2 = tc.createLinearGradient(0, 0, tw, th);
  g2.addColorStop(0, 'rgba(255,244,229,0.04)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  tc.fillStyle = g2;
  tc.fillRect(0, 0, tw, th);
  tc.strokeStyle = 'rgba(232,177,92,0.10)';
  for (let i = 0; i < 4; i += 1) {
    tc.beginPath();
    tc.arc(1035, 320, 150 + i * 54, -Math.PI * 0.9, Math.PI * 0.2);
    tc.stroke();
  }
  tc.fillStyle = 'rgba(0,0,0,0.45)';
  tc.fillRect(0, th - 14, tw, 14);

  // Mark, drawn directly at thumbnail scale.
  const cx = 1035;
  const cy = 225;
  const size = 190;
  const radius = size * 0.5;
  tc.strokeStyle = 'rgba(232,177,92,0.24)';
  tc.lineWidth = 1.4;
  tc.beginPath();
  tc.arc(cx, cy, radius * 1.24, 0, Math.PI * 2);
  tc.stroke();
  tc.strokeStyle = '#e8b15c';
  tc.fillStyle = '#e8b15c';
  tc.lineWidth = 2;
  for (const [nx, ny] of [
    [0, -0.54],
    [0.54, 0],
    [0, 0.54],
    [-0.54, 0],
  ]) {
    tc.beginPath();
    tc.moveTo(cx, cy);
    tc.lineTo(cx + nx * radius, cy + ny * radius);
    tc.stroke();
    tc.beginPath();
    tc.arc(cx + nx * radius, cy + ny * radius, size * 0.042, 0, Math.PI * 2);
    tc.fill();
  }
  tc.shadowColor = '#e8b15c';
  tc.shadowBlur = 30;
  tc.beginPath();
  tc.arc(cx, cy, size * 0.092, 0, Math.PI * 2);
  tc.fill();
  tc.shadowBlur = 0;

  tc.font = '600 17px BarlowSemi';
  tc.fillStyle = '#e8b15c';
  tc.fillText('NEXUS  //  A NEW CHAPTER', 74, 112);
  tc.font = '400 104px Instrument';
  tc.fillStyle = '#fff4e5';
  tc.fillText('Nexus is', 70, 258);
  tc.font = '400 112px InstrumentItalic';
  tc.fillStyle = '#e8b15c';
  tc.fillText('changing.', 70, 374);
  tc.font = '500 27px BarlowMedium';
  tc.fillStyle = '#c4ad94';
  tc.fillText("We're rebuilding the workspace in public.", 74, 449);
  tc.font = '600 22px BarlowSemi';
  tc.fillStyle = '#fff4e5';
  tc.fillText('HELP BUILD WHAT IS NEXT', 74, 555);
  tc.fillStyle = '#e8b15c';
  tc.fillRect(74, 577, 64, 3);
  tc.font = '600 28px BarlowSemi';
  tc.fillStyle = '#fff4e5';
  tc.fillText('textnexus.me', 74, 650);
  tc.font = '500 14px BarlowMedium';
  tc.fillStyle = '#8c7562';
  tc.fillText('OFFICIAL FILM  /  THANKSGIVING 2026', 74, 684);

  const file = path.join(HERE, 'nexus-ad-thumbnail.png');
  fs.writeFileSync(file, tcanvas.toBuffer('image/png'));
  console.log(`thumbnail: ${file}`);
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------
function runFfmpeg(args) {
  const proc = spawn(ffmpeg, args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let stderr = '';
  proc.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
    if (stderr.length > 12000) stderr = stderr.slice(-12000);
  });
  return { proc, getStderr: () => stderr };
}

async function renderVideo() {
  const silent = path.join(HERE, 'nexus-ad-silent.mp4');
  const final = path.join(HERE, 'nexus-ad.mp4');
  const args = [
    '-y',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${W}x${H}`,
    '-r',
    String(FPS),
    '-i',
    '-',
    '-an',
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-level',
    '4.2',
    '-preset',
    'medium',
    '-crf',
    '19',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    silent,
  ];
  const { proc, getStderr } = runFfmpeg(args);
  const started = Date.now();
  for (let f = 0; f < TOTAL_FRAMES; f += 1) {
    const t = f / FPS;
    drawFrame(t);
    const data = ctx.getImageData(0, 0, W, H).data;
    const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    if (!proc.stdin.write(buf)) {
      await once(proc.stdin, 'drain');
    }
    if (f % 120 === 0) {
      const sec = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`frame ${f}/${TOTAL_FRAMES}  (${t.toFixed(1)}s)  ${sec}s elapsed`);
    }
  }
  proc.stdin.end();
  const [code] = await once(proc, 'close');
  if (code !== 0) {
    throw new Error(`video encode failed (${code}):\n${getStderr()}`);
  }

  const score = path.join(ASSETS, 'nexus-ad-score.wav');
  const muxArgs = [
    '-y',
    '-i',
    silent,
    '-i',
    score,
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-ar',
    '48000',
    '-af',
    'loudnorm=I=-16:TP=-1.2:LRA=7',
    '-shortest',
    '-movflags',
    '+faststart',
    '-metadata',
    'title=Nexus | A Warmer Workspace',
    '-metadata',
    'artist=TextNexus',
    '-metadata',
    'comment=Official Nexus film. Built in public.',
    final,
  ];
  const mux = runFfmpeg(muxArgs);
  mux.proc.stdin.end();
  const [muxCode] = await once(mux.proc, 'close');
  if (muxCode !== 0) {
    throw new Error(`audio mux failed (${muxCode}):\n${mux.getStderr()}`);
  }
  console.log(`final: ${final}`);
}

const mode = process.env.MODE || 'stills';
if (mode === 'stills') {
  await renderStills();
  await renderThumbnail();
} else if (mode === 'video') {
  await renderVideo();
} else if (mode === 'thumbnail') {
  await renderThumbnail();
} else {
  throw new Error(`unknown MODE: ${mode}`);
}

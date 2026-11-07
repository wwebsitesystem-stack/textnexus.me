#!/usr/bin/env node
/**
 * Nexus // new staff announcement.
 * 30 seconds, 1920x1080, 24 fps. Rendered locally with canvas, encoded with
 * the existing ffmpeg-static install, and scored with the Nexus ad music.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AD = path.resolve(HERE, '../nexus-ad');
const ASSETS = path.join(AD, 'assets');
const requireTool = createRequire(path.join(AD, 'tools', 'package.json'));
const { createCanvas, GlobalFonts } = requireTool('@napi-rs/canvas');
const ffmpeg = requireTool('ffmpeg-static');

const W = 1920;
const H = 1080;
const FPS = 24;
const DURATION = 36;
const TOTAL_FRAMES = Math.round(DURATION * FPS);
const FADE = 0.55;

const C = {
  ink: '#080504',
  panel: '#110a07',
  cream: '#fff4e5',
  warm: '#e8b15c',
  copper: '#d97a3f',
  sage: '#a3ad88',
  muted: '#c4ad94',
  dim: '#8c7562',
  line: 'rgba(232,177,92,0.20)',
  lineSoft: 'rgba(232,177,92,0.11)',
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
  GlobalFonts.registerFromPath(path.join(ASSETS, 'fonts', file), alias);
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeOutExpo = (t) => {
  t = clamp(t);
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

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

function line(x1, y1, x2, y2, color = C.line, width = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function kicker(text, x, y, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  line(x, y - 7, x + 52 * alpha, y - 7, C.warm, 2);
  tracked(text, x + 70, y, { size: 18, spacing: 4.4, color: C.warm });
  ctx.restore();
}

function paragraph(text, x, y, maxWidth, opts = {}) {
  const { size = 30, lineHeight = 1.56, color = C.muted, alpha = 1, family = 'Barlow' } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = font(size, family, 400);
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
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
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * size * lineHeight));
  ctx.restore();
}

function fitFont(text, maxWidth, startSize, family, weight = 400, minSize = 52) {
  let size = startSize;
  do {
    ctx.font = font(size, family, weight);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > minSize);
  return size;
}

function drawMark(cx, cy, size, progress = 1, alpha = 1) {
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
  ctx.strokeStyle = 'rgba(232,177,92,0.24)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
  ctx.stroke();

  ctx.strokeStyle = C.warm;
  ctx.fillStyle = C.warm;
  ctx.lineWidth = 1.9;
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
  ctx.shadowColor = C.warm;
  ctx.shadowBlur = 30;
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

function drawEnvelope(x, y, s, color = C.warm) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  rrect(x, y, s, s * 0.72, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 3);
  ctx.lineTo(x + s / 2, y + s * 0.42);
  ctx.lineTo(x + s - 2, y + 3);
  ctx.stroke();
  ctx.restore();
}

// Sparse warm dust and leaf motes, matching the Nexus launch film.
const particles = Array.from({ length: 46 }, (_, i) => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: 1 + Math.random() * 2.5,
  speed: 4 + Math.random() * 9,
  drift: 12 + Math.random() * 24,
  phase: Math.random() * Math.PI * 2,
  leaf: i % 7 === 0,
  color: i % 5 === 0 ? C.sage : i % 3 === 0 ? C.copper : C.warm,
}));

function drawBackdrop(t) {
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, W, H);

  let g = ctx.createRadialGradient(W * 0.78, H * 0.26, 0, W * 0.78, H * 0.26, 760);
  g.addColorStop(0, 'rgba(144, 70, 35, 0.25)');
  g.addColorStop(0.48, 'rgba(87, 42, 23, 0.13)');
  g.addColorStop(1, 'rgba(8, 5, 4, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  g = ctx.createRadialGradient(W * 0.08, H * 0.86, 0, W * 0.08, H * 0.86, 620);
  g.addColorStop(0, 'rgba(93, 82, 50, 0.14)');
  g.addColorStop(1, 'rgba(8, 5, 4, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = C.warm;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(W * 0.79, H * 0.48, 290 + i * 94, -Math.PI * 0.9, Math.PI * 0.16);
    ctx.stroke();
  }
  ctx.restore();

  for (const p of particles) {
    const y = ((p.y - t * p.speed) % (H + 100) + H + 100) % (H + 100) - 50;
    const x = p.x + Math.sin(t * 0.23 + p.phase) * p.drift;
    ctx.save();
    ctx.globalAlpha = 0.08 + 0.11 * (0.5 + 0.5 * Math.sin(t * 0.7 + p.phase));
    ctx.fillStyle = p.color;
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.16 + p.phase) * 0.8);
    ctx.beginPath();
    if (p.leaf) ctx.ellipse(0, 0, p.r * 2.2, p.r * 0.8, 0, 0, Math.PI * 2);
    else ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, 'rgba(255, 211, 160, 0.018)');
  g.addColorStop(0.55, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(36, 17, 10, 0.14)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawChrome(alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawMark(86, 76, 42, 1, 0.95);
  tracked('NEXUS', 126, 85, { size: 20, spacing: 4.5, color: C.cream });
  tracked('NEW STAFF / 2026', 126, 108, { size: 12, spacing: 3.2, color: C.dim });
  tracked('TEXTNEXUS.ME', W - 86, 85, {
    size: 16,
    spacing: 3.4,
    color: C.warm,
    align: 'right',
  });
  line(86, 134, W - 86, 134, C.lineSoft, 1, 0.9);
  line(86, H - 62, W - 86, H - 62, C.lineSoft, 1, 0.9);
  tracked('TEXTNEXUS // PEOPLE', 86, H - 34, { size: 12, spacing: 3, color: C.dim });
  tracked('A NEW CHAPTER', W - 86, H - 34, {
    size: 12,
    spacing: 3,
    color: C.dim,
    align: 'right',
  });
  ctx.restore();
}

function drawIntro(t, alpha) {
  const p = easeOutExpo(clamp(t / 0.9));
  const slide = 26 * (1 - p);
  ctx.save();
  ctx.globalAlpha *= alpha;
  kicker('NEXUS // PEOPLE', 140, 314, alpha);
  ctx.translate(0, slide);
  ctx.fillStyle = C.cream;
  ctx.font = font(112, 'Instrument', 400);
  ctx.fillText('The next chapter', 136, 448);
  ctx.fillStyle = C.warm;
  ctx.font = font(120, 'InstrumentItalic', 400);
  ctx.fillText('is people.', 136, 566);
  paragraph('Meet the new team shaping what comes next at TextNexus.', 140, 650, 720, {
    size: 28,
    color: C.muted,
    alpha,
  });
  ctx.restore();

  drawMark(1485, 508, 350, clamp(t / 1.2), alpha);
  tracked('BUILT BY', 1485, 774, {
    size: 14,
    spacing: 4,
    color: C.dim,
    align: 'center',
    alpha,
  });
  tracked('PEOPLE', 1485, 806, {
    size: 18,
    spacing: 5.5,
    color: C.warm,
    align: 'center',
    alpha,
  });
}

const team = [
  {
    n: '01',
    name: 'Brody Williams',
    role: 'OWNER & FOUNDER',
    email: 'owner@textnexus.me',
    initials: 'BW',
    tag: 'LEADERSHIP',
  },
  {
    n: '02',
    name: 'Brayden Keppel',
    role: 'CO-OWNER',
    email: 'brayden.co.owner@textnexus.me',
    initials: 'BK',
    tag: 'OWNERSHIP',
  },
  {
    n: '03',
    name: 'Andrew Giambetti',
    role: 'OFFICIAL SOCIAL MEDIA CO.',
    email: 'andrew.socialmediaco@textnexus.me',
    initials: 'AG',
    tag: 'SOCIAL',
  },
  {
    n: '04',
    name: 'Owen Lee',
    role: 'PARTNERSHIPS \u00b7 LOFIN.DEV',
    email: 'support@lofin.dev',
    initials: 'OL',
    tag: 'PARTNERSHIP',
  },
];

function drawProfile(person, index, t, alpha) {
  const reveal = easeOutCubic(clamp(t / 0.65));
  const x = 110;
  const y = 210;
  const w = 1700;
  const h = 660;
  ctx.save();
  ctx.globalAlpha *= alpha;

  rrect(x, y, w, h, 28);
  ctx.fillStyle = 'rgba(17, 10, 7, 0.76)';
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  const glow = ctx.createRadialGradient(1430, 520, 20, 1430, 520, 430);
  glow.addColorStop(0, 'rgba(232,177,92,0.13)');
  glow.addColorStop(1, 'rgba(232,177,92,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);

  line(x + 64, y + 82, x + 160, y + 82, C.warm, 2, 0.8);
  tracked(`NEW STAFF  /  ${person.n} OF ${String(team.length).padStart(2, '0')}`, x + 64, y + 70, {
    size: 14,
    spacing: 3.5,
    color: C.dim,
    alpha,
  });
  tracked(person.tag, x + w - 64, y + 70, {
    size: 13,
    spacing: 4,
    color: C.warm,
    align: 'right',
    alpha,
  });

  ctx.save();
  ctx.translate(0, 24 * (1 - reveal));
  ctx.globalAlpha *= reveal;
  ctx.fillStyle = C.cream;
  const size = fitFont(person.name, 870, 103, 'Instrument', 400, 72);
  ctx.font = font(size, 'Instrument', 400);
  ctx.fillText(person.name, x + 62, y + 272);

  tracked(person.role, x + 66, y + 344, {
    size: 24,
    spacing: 4.3,
    color: C.warm,
    alpha: reveal,
  });

  ctx.strokeStyle = C.lineSoft;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 66, y + 397);
  ctx.lineTo(x + 922, y + 397);
  ctx.stroke();

  drawEnvelope(x + 66, y + 467, 28, C.warm);
  ctx.fillStyle = C.cream;
  ctx.font = font(32, 'BarlowMedium', 500);
  ctx.fillText(person.email, x + 112, y + 492);

  tracked('TEXTNEXUS.ME', x + 66, y + 572, {
    size: 15,
    spacing: 3.8,
    color: C.dim,
    alpha: reveal,
  });
  ctx.restore();

  // Monogram card.
  const cx = 1432;
  const cy = 516;
  const radius = 180 * (0.86 + 0.14 * reveal);
  const ring = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  ring.addColorStop(0, 'rgba(232,177,92,0.74)');
  ring.addColorStop(0.5, 'rgba(217,122,63,0.36)');
  ring.addColorStop(1, 'rgba(163,173,136,0.52)');
  ctx.save();
  ctx.globalAlpha *= alpha * reveal;
  ctx.strokeStyle = ring;
  ctx.lineWidth = 2;
  for (let i = 0; i < 2; i += 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius + i * 18, -Math.PI * 0.92, Math.PI * 0.92);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(8,5,4,0.72)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.warm;
  ctx.font = font(144, 'Instrument', 400);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(person.initials, cx, cy + 4);
  ctx.restore();

  ctx.restore();
}

function drawClosing(t, alpha) {
  const reveal = easeOutCubic(clamp(t / 0.8));
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawMark(W / 2, 250, 205, clamp(t / 1.1), 0.95);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.cream;
  ctx.font = font(95, 'Instrument', 400);
  ctx.fillText('Meet the team.', W / 2, 470);
  ctx.fillStyle = C.warm;
  ctx.font = font(108, 'InstrumentItalic', 400);
  ctx.fillText('Welcome to Nexus.', W / 2, 585);
  ctx.fillStyle = C.muted;
  ctx.font = font(28, 'Barlow', 400);
  ctx.fillText('The people building what comes next.', W / 2, 650);

  ctx.globalAlpha = alpha * reveal;
  ctx.fillStyle = C.cream;
  ctx.font = font(42, 'BarlowSemi', 600);
  ctx.fillText('textnexus.me', W / 2, 782);
  tracked('OFFICIAL SITE', W / 2, 824, {
    size: 13,
    spacing: 4.5,
    color: C.warm,
    align: 'center',
    alpha,
  });
  ctx.restore();
}

const scenes = [
  { start: 0, end: 4.5, draw: drawIntro },
  { start: 4.5, end: 10.5, draw: (t, a) => drawProfile(team[0], 0, t, a) },
  { start: 10.5, end: 16.5, draw: (t, a) => drawProfile(team[1], 1, t, a) },
  { start: 16.5, end: 22.5, draw: (t, a) => drawProfile(team[2], 2, t, a) },
  { start: 22.5, end: 28.5, draw: (t, a) => drawProfile(team[3], 3, t, a) },
  { start: 28.5, end: 36, draw: drawClosing },
];

function drawFrame(t) {
  drawBackdrop(t);
  drawChrome();
  for (const scene of scenes) {
    if (t < scene.start - FADE || t > scene.end + FADE) continue;
    const fadeIn = smooth((t - (scene.start - FADE)) / FADE);
    const fadeOut = smooth(((scene.end + FADE) - t) / FADE);
    const alpha = Math.min(fadeIn, fadeOut);
    if (alpha <= 0) continue;
    ctx.save();
    scene.draw(t - scene.start, alpha);
    ctx.restore();
  }
  if (t < 0.35) {
    ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.35})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (t > DURATION - 0.75) {
    ctx.fillStyle = `rgba(0,0,0,${smooth((t - (DURATION - 0.75)) / 0.75)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function renderStills() {
  const dir = path.join(HERE, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, t] of [
    ['01-intro', 2.1],
    ['02-brody', 7.1],
    ['03-brayden', 13.1],
    ['04-andrew', 19.1],
    ['05-owen', 25.1],
    ['06-closing', 33.1],
  ]) {
    drawFrame(t);
    const file = path.join(dir, `${name}.png`);
    fs.writeFileSync(file, canvas.toBuffer('image/png'));
    console.log(`still: ${file}`);
  }
  drawThumbnail();
}

function drawThumbnail() {
  const tw = 1280;
  const th = 720;
  const tc = createCanvas(tw, th);
  const tctx = tc.getContext('2d');
  tctx.fillStyle = C.ink;
  tctx.fillRect(0, 0, tw, th);
  let g = tctx.createRadialGradient(1010, 120, 0, 1010, 120, 680);
  g.addColorStop(0, 'rgba(160, 81, 39, 0.34)');
  g.addColorStop(1, 'rgba(8,5,4,0)');
  tctx.fillStyle = g;
  tctx.fillRect(0, 0, tw, th);
  g = tctx.createLinearGradient(0, 0, tw, th);
  g.addColorStop(0, 'rgba(255,244,229,0.04)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  tctx.fillStyle = g;
  tctx.fillRect(0, 0, tw, th);

  tctx.strokeStyle = 'rgba(232,177,92,0.12)';
  for (let i = 0; i < 4; i += 1) {
    tctx.beginPath();
    tctx.arc(1020, 300, 150 + i * 55, -Math.PI * 0.9, Math.PI * 0.2);
    tctx.stroke();
  }

  tctx.fillStyle = C.warm;
  tctx.font = '600 16px BarlowSemi';
  tctx.fillText('NEXUS  //  NEW STAFF  /  2026', 64, 92);
  tctx.fillStyle = C.cream;
  tctx.font = '400 104px Instrument';
  tctx.fillText('Meet the', 60, 238);
  tctx.fillStyle = C.warm;
  tctx.font = '400 112px InstrumentItalic';
  tctx.fillText('new team.', 60, 352);
  tctx.fillStyle = C.muted;
  tctx.font = '400 26px Barlow';
  tctx.fillText('The people building what comes next.', 64, 422);
  tctx.fillStyle = C.cream;
  tctx.font = '600 24px BarlowSemi';
  tctx.fillText('BRODY  ·  BRAYDEN  ·  ANDREW  ·  OWEN', 64, 530);
  tctx.fillStyle = C.warm;
  tctx.fillRect(64, 552, 64, 3);
  tctx.fillStyle = C.cream;
  tctx.font = '600 27px BarlowSemi';
  tctx.fillText('textnexus.me', 64, 626);
  tctx.fillStyle = C.dim;
  tctx.font = '500 14px BarlowMedium';
  tctx.fillText('OFFICIAL TEAM ANNOUNCEMENT', 64, 660);

  // Nexus mark.
  const cx = 1010;
  const cy = 350;
  const size = 205;
  const radius = size * 0.5;
  tctx.strokeStyle = 'rgba(232,177,92,0.23)';
  tctx.lineWidth = 1.3;
  tctx.beginPath();
  tctx.arc(cx, cy, radius * 1.24, 0, Math.PI * 2);
  tctx.stroke();
  tctx.strokeStyle = C.warm;
  tctx.fillStyle = C.warm;
  tctx.lineWidth = 2;
  for (const [nx, ny] of [[0, -0.54], [0.54, 0], [0, 0.54], [-0.54, 0]]) {
    tctx.beginPath();
    tctx.moveTo(cx, cy);
    tctx.lineTo(cx + nx * radius, cy + ny * radius);
    tctx.stroke();
    tctx.beginPath();
    tctx.arc(cx + nx * radius, cy + ny * radius, size * 0.042, 0, Math.PI * 2);
    tctx.fill();
  }
  tctx.shadowColor = C.warm;
  tctx.shadowBlur = 30;
  tctx.beginPath();
  tctx.arc(cx, cy, size * 0.092, 0, Math.PI * 2);
  tctx.fill();
  tctx.shadowBlur = 0;

  const file = path.join(HERE, 'staff-thumbnail.png');
  fs.writeFileSync(file, tc.toBuffer('image/png'));
  console.log(`thumbnail: ${file}`);
}

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
  const silent = path.join(HERE, 'staff-silent.mp4');
  const final = path.join(HERE, 'nexus-new-staff.mp4');
  const args = [
    '-y',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    '-s', `${W}x${H}`,
    '-r', String(FPS),
    '-i', '-',
    '-an',
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-level', '4.2',
    '-preset', 'medium',
    '-crf', '19',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    silent,
  ];
  const { proc, getStderr } = runFfmpeg(args);
  const started = Date.now();
  for (let f = 0; f < TOTAL_FRAMES; f += 1) {
    const t = f / FPS;
    drawFrame(t);
    const data = ctx.getImageData(0, 0, W, H).data;
    const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    if (!proc.stdin.write(buf)) await once(proc.stdin, 'drain');
    if (f % 120 === 0) {
      const sec = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`frame ${f}/${TOTAL_FRAMES} (${t.toFixed(1)}s) ${sec}s elapsed`);
    }
  }
  proc.stdin.end();
  const [code] = await once(proc, 'close');
  if (code !== 0) throw new Error(`video encode failed (${code}):\n${getStderr()}`);

  const score = path.join(ASSETS, 'nexus-ad-score.wav');
  const muxArgs = [
    '-y',
    '-i', silent,
    '-i', score,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-af', 'afade=t=out:st=34.8:d=1.2,loudnorm=I=-16:TP=-1.2:LRA=7',
    '-shortest',
    '-movflags', '+faststart',
    '-metadata', 'title=Nexus | Meet the New Team',
    '-metadata', 'artist=TextNexus',
    '-metadata', 'comment=New staff announcement for TextNexus.',
    final,
  ];
  const mux = runFfmpeg(muxArgs);
  mux.proc.stdin.end();
  const [muxCode] = await once(mux.proc, 'close');
  if (muxCode !== 0) throw new Error(`audio mux failed (${muxCode}):\n${mux.getStderr()}`);
  console.log(`final: ${final}`);
}

const mode = process.env.MODE || 'stills';
if (mode === 'stills') {
  renderStills();
} else if (mode === 'video') {
  await renderVideo();
} else if (mode === 'all') {
  renderStills();
  await renderVideo();
} else {
  throw new Error(`unknown MODE: ${mode}`);
}

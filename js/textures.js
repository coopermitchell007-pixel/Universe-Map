// ============================================================
// Procedural textures & sprites — no image downloads required.
// Earth/Moon get upgraded to real photo textures from a CDN if
// the network allows; everything else is generated on canvas.
// ============================================================
import * as THREE from 'three';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function rand(seedObj) {
  // tiny deterministic PRNG so textures look the same every load
  seedObj.s = (seedObj.s * 16807) % 2147483647;
  return (seedObj.s - 1) / 2147483646;
}

// ---------- planet surface ----------
export function planetTexture(cfg, seed = 7) {
  const [c, ctx] = makeCanvas(512, 256);
  const sd = { s: seed * 1000 + 1 };
  const bands = cfg.bands || ['#888', '#777'];

  // horizontal bands with wavy edges
  const n = bands.length * 4;
  for (let i = 0; i < n; i++) {
    const y0 = (i / n) * 256;
    ctx.fillStyle = bands[i % bands.length];
    ctx.beginPath();
    ctx.moveTo(0, y0);
    for (let x = 0; x <= 512; x += 16) {
      ctx.lineTo(x, y0 + Math.sin(x * 0.02 + i * 2.3 + seed) * 6 + (rand(sd) - 0.5) * 4);
    }
    ctx.lineTo(512, 256); ctx.lineTo(0, 256);
    ctx.closePath(); ctx.fill();
  }

  // speckle noise
  for (let i = 0; i < 4000; i++) {
    const a = rand(sd) * 0.1;
    ctx.fillStyle = rand(sd) > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(rand(sd) * 512, rand(sd) * 256, 2, 2);
  }

  if (cfg.craters) {
    for (let i = 0; i < 90; i++) {
      const x = rand(sd) * 512, y = rand(sd) * 256, r = 1 + rand(sd) * 7;
      ctx.fillStyle = `rgba(0,0,0,${0.1 + rand(sd) * 0.18})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.06 + rand(sd) * 0.1})`;
      ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.55, 0, Math.PI * 2); ctx.fill();
    }
  }

  if (cfg.swirl) {
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 25; i++) {
      ctx.strokeStyle = rand(sd) > 0.5 ? '#fff' : '#cca';
      ctx.lineWidth = 2 + rand(sd) * 5;
      ctx.beginPath();
      const y = rand(sd) * 256;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + (rand(sd) - 0.5) * 60, 340, y + (rand(sd) - 0.5) * 60, 512, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  if (cfg.spot) {
    const sx = 360, sy = 150;
    const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, 26);
    g.addColorStop(0, cfg.spotColor || '#b5482e');
    g.addColorStop(0.7, cfg.spotColor ? cfg.spotColor : '#c86040');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.save(); ctx.translate(sx, sy); ctx.scale(1.6, 1); ctx.translate(-sx, -sy);
    ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  if (cfg.heart) { // Pluto's Tombaugh Regio
    ctx.fillStyle = 'rgba(245,235,220,0.85)';
    ctx.save(); ctx.translate(250, 130); ctx.scale(1.2, 1);
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-22, -12, -44, 6, 0, 34);
    ctx.bezierCurveTo(44, 6, 22, -12, 0, 12);
    ctx.fill(); ctx.restore();
  }

  if (cfg.caps) { // polar ice caps
    const g1 = ctx.createLinearGradient(0, 0, 0, 26);
    g1.addColorStop(0, 'rgba(255,255,255,0.95)'); g1.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, 512, 26);
    const g2 = ctx.createLinearGradient(0, 256, 0, 230);
    g2.addColorStop(0, 'rgba(255,255,255,0.95)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 230, 512, 26);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- Earth fallback (used until/if the photo texture loads) ----------
export function earthTexture() {
  const [c, ctx] = makeCanvas(1024, 512);
  const sd = { s: 4242 };
  ctx.fillStyle = '#123a7a'; ctx.fillRect(0, 0, 1024, 512);
  // ocean shading
  for (let i = 0; i < 18; i++) {
    const g = ctx.createRadialGradient(rand(sd) * 1024, rand(sd) * 512, 10, rand(sd) * 1024, rand(sd) * 512, 200);
    g.addColorStop(0, 'rgba(30,90,160,0.4)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
  }
  // continents: clustered blobs
  const blob = (cx, cy, r, col) => {
    for (let i = 0; i < 26; i++) {
      const a = rand(sd) * Math.PI * 2, d = rand(sd) * r;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, r * (0.2 + rand(sd) * 0.35), 0, Math.PI * 2);
      ctx.fill();
    }
  };
  // rough continent positions on an equirect map
  blob(250, 170, 60, '#3e7a3a'); // N America
  blob(330, 330, 50, '#4a8a40'); // S America
  blob(520, 200, 45, '#7a8a4a'); // Europe
  blob(560, 300, 70, '#a8923f'); // Africa
  blob(720, 190, 90, '#5a7a3e'); // Asia
  blob(840, 360, 45, '#a8862f'); // Australia
  // ice caps
  ctx.fillStyle = 'rgba(240,248,255,0.95)';
  ctx.fillRect(0, 0, 1024, 26); ctx.fillRect(0, 480, 1024, 32);
  // clouds
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + rand(sd) * 0.12})`;
    const x = rand(sd) * 1024, y = rand(sd) * 512;
    ctx.beginPath(); ctx.ellipse(x, y, 14 + rand(sd) * 40, 4 + rand(sd) * 8, 0, 0, Math.PI * 2); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function sunTexture() {
  const [c, ctx] = makeCanvas(512, 256);
  const sd = { s: 99 };
  ctx.fillStyle = '#ffcc33'; ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 900; i++) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 4 + rand(sd) * 14);
    g.addColorStop(0, rand(sd) > 0.5 ? 'rgba(255,240,180,0.35)' : 'rgba(230,120,30,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.translate(rand(sd) * 512, rand(sd) * 256);
    ctx.fillStyle = g; ctx.fillRect(-20, -20, 40, 40); ctx.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function ringTexture() {
  const [c, ctx] = makeCanvas(256, 16);
  const sd = { s: 55 };
  for (let x = 0; x < 256; x++) {
    const a = 0.15 + rand(sd) * 0.65 * (0.4 + 0.6 * Math.sin(x * 0.12));
    const tone = 190 + Math.floor(rand(sd) * 50);
    ctx.fillStyle = `rgba(${tone},${tone - 20},${tone - 50},${Math.max(0, a)})`;
    ctx.fillRect(x, 0, 1, 16);
  }
  // Cassini division
  ctx.clearRect(170, 0, 14, 16);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function cmbTexture() {
  const [c, ctx] = makeCanvas(512, 256);
  const sd = { s: 1965 };
  ctx.fillStyle = '#1a0d05'; ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 2600; i++) {
    const hot = rand(sd) > 0.5;
    ctx.fillStyle = hot
      ? `rgba(${200 + rand(sd) * 55 | 0},${90 + rand(sd) * 60 | 0},20,${0.06 + rand(sd) * 0.12})`
      : `rgba(40,60,${140 + rand(sd) * 80 | 0},${0.06 + rand(sd) * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(rand(sd) * 512, rand(sd) * 256, 3 + rand(sd) * 14, 3 + rand(sd) * 10, rand(sd) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- cinematic background nebula ----------
// A wide, colourful deep-space gradient with soft nebula clouds, wrapped
// on the inside of a huge sphere so the void is never flat black.
export function spaceBackdropTexture() {
  const W = 2048, H = 1024;
  const [c, ctx] = makeCanvas(W, H);
  const sd = { s: 31337 };
  // base vertical gradient: indigo at the poles, near-black at the equator
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#0a0a26');
  base.addColorStop(0.5, '#05030f');
  base.addColorStop(1, '#0a0420');
  ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
  // coloured nebula blooms
  const palette = ['#3a1d6e', '#13405e', '#5e1f4a', '#1d5e54', '#27306e', '#5e3a1d'];
  for (let i = 0; i < 26; i++) {
    const x = rand(sd) * W, y = rand(sd) * H, r = 120 + rand(sd) * 360;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const col = palette[rand(sd) * palette.length | 0];
    g.addColorStop(0, col + 'cc');
    g.addColorStop(0.5, col + '44');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // a dusting of distant stars baked in
  for (let i = 0; i < 1400; i++) {
    const a = 0.2 + rand(sd) * 0.7;
    ctx.fillStyle = rand(sd) > 0.85 ? `rgba(255,220,180,${a})` : `rgba(220,235,255,${a})`;
    ctx.fillRect(rand(sd) * W, rand(sd) * H, rand(sd) > 0.9 ? 2 : 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

// ---------- astronaut "you are here" sprite ----------
// A tiny cartoon spaceman drawn on canvas, used as the player avatar
// in the scene and stamped onto postcards.
export function spacemanTexture() {
  const S = 256;
  const [c, ctx] = makeCanvas(S, S);
  const cx = S / 2;
  ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // backpack
  ctx.fillStyle = '#c8d2e0';
  rrect(ctx, cx - 30, 96, 60, 70, 14); ctx.fill();
  // limbs
  ctx.strokeStyle = '#eef2f8'; ctx.lineWidth = 22;
  line(ctx, cx - 22, 118, cx - 52, 150); // left arm
  line(ctx, cx + 22, 118, cx + 52, 150); // right arm
  line(ctx, cx - 14, 168, cx - 22, 214); // left leg
  line(ctx, cx + 14, 168, cx + 22, 214); // right leg
  // boots & gloves
  ctx.strokeStyle = '#9fb0c4'; ctx.lineWidth = 22;
  line(ctx, cx - 52, 150, cx - 56, 156);
  line(ctx, cx + 52, 150, cx + 56, 156);
  line(ctx, cx - 22, 210, cx - 24, 218);
  line(ctx, cx + 22, 210, cx + 24, 218);
  // torso
  ctx.fillStyle = '#f4f7fc';
  rrect(ctx, cx - 26, 108, 52, 66, 18); ctx.fill();
  // chest control panel
  ctx.fillStyle = '#2a4a9a'; rrect(ctx, cx - 12, 126, 24, 18, 4); ctx.fill();
  ctx.fillStyle = '#7aff9a'; ctx.fillRect(cx - 8, 130, 6, 4);
  ctx.fillStyle = '#ffd76a'; ctx.fillRect(cx + 2, 130, 6, 4);
  // helmet
  ctx.fillStyle = '#eef2f8';
  ctx.beginPath(); ctx.arc(cx, 74, 42, 0, Math.PI * 2); ctx.fill();
  // visor
  const vg = ctx.createLinearGradient(cx - 30, 50, cx + 30, 96);
  vg.addColorStop(0, '#1b2b4a'); vg.addColorStop(0.5, '#3a6ea5'); vg.addColorStop(1, '#0c1428');
  ctx.fillStyle = vg;
  ctx.beginPath(); ctx.ellipse(cx, 76, 30, 26, 0, 0, Math.PI * 2); ctx.fill();
  // visor glint
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.ellipse(cx - 10, 68, 8, 12, -0.5, 0, Math.PI * 2); ctx.fill();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;

  function rrect(x, y0, w, h, r) { const o = ctx; o.beginPath(); o.moveTo(x + r, y0); o.arcTo(x + w, y0, x + w, y0 + h, r); o.arcTo(x + w, y0 + h, x, y0 + h, r); o.arcTo(x, y0 + h, x, y0, r); o.arcTo(x, y0, x + w, y0, r); o.closePath(); }
  function line(o, x0, y0, x1, y1) { o.beginPath(); o.moveTo(x0, y0); o.lineTo(x1, y1); o.stroke(); }
}

// ---------- sprites ----------
export function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const [c, ctx] = makeCanvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.45)'));
  g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function circleTexture(color = '#ffffff') {
  const [c, ctx] = makeCanvas(32, 32);
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 15);
  g.addColorStop(0, color); g.addColorStop(0.55, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(16, 16, 15, 0, Math.PI * 2); ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function makeLabel(text, { color = '#ffffff', size = 1, sub = '' } = {}) {
  const font = 'bold 44px "Helvetica Neue", Arial, sans-serif';
  const subFont = '26px "Helvetica Neue", Arial, sans-serif';
  const [m, mctx] = makeCanvas(2, 2);
  mctx.font = font;
  const w = Math.max(mctx.measureText(text).width, sub ? (mctx.font = subFont, mctx.measureText(sub).width) : 0);
  const cw = Math.ceil(w) + 40, ch = sub ? 110 : 70;
  const [c, ctx] = makeCanvas(cw, ch);
  ctx.font = font;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillText(text, cw / 2, sub ? 34 : ch / 2);
  if (sub) {
    ctx.font = subFont;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(sub, cw / 2, 80);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.renderOrder = 999;
  sp.scale.set((cw / ch) * size, size, 1);
  return sp;
}

// ---------- circuit board (Tech Map substrate) ----------
// A dense, tileable PCB texture: FR4 solder-mask, etched copper traces,
// gold plated pads & vias, and white silkscreen. Components are real 3D
// meshes placed on top of this in tech.js — the texture supplies the
// fine detail (fan-out traces, ground pours) too small to model.
export function circuitBoardTexture(seed = 7) {
  const S = 1024;
  const [c, ctx] = makeCanvas(S, S);
  const sd = { s: seed * 7919 + 1 };

  // solder-mask base with a subtle vignette so the board reads as a surface
  ctx.fillStyle = '#06140d';
  ctx.fillRect(0, 0, S, S);
  const vg = ctx.createRadialGradient(S / 2, S / 2, S * 0.1, S / 2, S / 2, S * 0.72);
  vg.addColorStop(0, 'rgba(20,70,44,0.55)');
  vg.addColorStop(1, 'rgba(2,12,7,0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, S, S);

  // faint ground-pour hatch
  ctx.strokeStyle = 'rgba(40,120,80,0.06)';
  ctx.lineWidth = 1;
  for (let x = -S; x < S; x += 9) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + S, S); ctx.stroke();
  }

  // copper trace helper — etched lines with a bright highlight edge
  const grid = 32;
  function trace(x0, y0, x1, y1) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(186,138,58,0.85)';   // copper under green mask
    ctx.lineWidth = 2 + (rand(sd) * 2 | 0);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,210,120,0.25)';  // top highlight
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  function pad(x, y, r) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    g.addColorStop(0, '#ffe9a8'); g.addColorStop(0.6, '#d8a23c'); g.addColorStop(1, '#7a5a1e');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a120a'; // drilled hole / via
    ctx.beginPath(); ctx.arc(x, y, r * 0.4, 0, Math.PI * 2); ctx.fill();
  }

  // Manhattan-routed traces snapping to a grid, sprouting pads at the ends
  for (let i = 0; i < 240; i++) {
    let x = (Math.floor(rand(sd) * (S / grid)) + 0.5) * grid;
    let y = (Math.floor(rand(sd) * (S / grid)) + 0.5) * grid;
    pad(x, y, 3 + rand(sd) * 2);
    const segs = 1 + (rand(sd) * 3 | 0);
    for (let s = 0; s < segs; s++) {
      const horiz = rand(sd) > 0.5;
      const len = (1 + (rand(sd) * 4 | 0)) * grid * (rand(sd) > 0.5 ? 1 : -1);
      const nx = horiz ? x + len : x;
      const ny = horiz ? y : y + len;
      trace(x, y, nx, ny);
      x = Math.max(8, Math.min(S - 8, nx));
      y = Math.max(8, Math.min(S - 8, ny));
    }
    if (rand(sd) > 0.45) pad(x, y, 3 + rand(sd) * 3);
  }

  // scattered vias
  for (let i = 0; i < 160; i++) pad(rand(sd) * S, rand(sd) * S, 2 + rand(sd) * 1.5);

  // white silkscreen reference marks (R12, C4, little boxes)
  ctx.fillStyle = 'rgba(220,235,225,0.5)';
  ctx.font = '13px "Helvetica Neue", Arial, sans-serif';
  const refs = ['R', 'C', 'U', 'Q', 'D', 'L', 'J', 'TP'];
  for (let i = 0; i < 90; i++) {
    const x = rand(sd) * S, y = rand(sd) * S;
    if (rand(sd) > 0.5) {
      ctx.fillText(refs[rand(sd) * refs.length | 0] + (rand(sd) * 99 | 0), x, y);
    } else {
      ctx.strokeStyle = 'rgba(220,235,225,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, 8 + rand(sd) * 22, 6 + rand(sd) * 12);
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// A small canvas texture for an IC chip's top face: matte black package,
// bevelled edge, pin-1 dot, and an engraved label.
export function chipTexture(label = '', sub = '', accent = '#ffb070') {
  const W = 256, H = 256;
  const [c, ctx] = makeCanvas(W, H);
  // package body with a soft sheen
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#22262c'); g.addColorStop(0.5, '#15181d'); g.addColorStop(1, '#0c0e12');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // bevel
  ctx.strokeStyle = 'rgba(120,140,160,0.25)'; ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  // pin-1 dot
  ctx.fillStyle = 'rgba(180,190,200,0.5)';
  ctx.beginPath(); ctx.arc(34, 34, 9, 0, Math.PI * 2); ctx.fill();
  // engraved label
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = accent;
  ctx.font = 'bold 30px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(label, W / 2, H / 2 - (sub ? 14 : 0));
  if (sub) {
    ctx.fillStyle = 'rgba(190,205,220,0.65)';
    ctx.font = '17px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(sub, W / 2, H / 2 + 24);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- galaxy point clouds ----------
const COL_CORE = new THREE.Color(0xffe6b0);
const COL_ARM = new THREE.Color(0x9db8ff);
const COL_PINK = new THREE.Color(0xff9bd0);

export function spiralGalaxyGeometry({ count = 24000, radius = 100, arms = 4, twist = 2.6, thickness = 0.06 } = {}) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const isBulge = Math.random() < 0.22;
    let x, y, z, mix;
    if (isBulge) {
      const r = Math.pow(Math.random(), 2) * radius * 0.22;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(ph) * Math.cos(th);
      z = r * Math.sin(ph) * Math.sin(th);
      y = r * Math.cos(ph) * 0.6;
      mix = 0;
    } else {
      const r = (0.18 + 0.82 * Math.pow(Math.random(), 0.6)) * radius;
      const arm = Math.floor(Math.random() * arms);
      const spread = 0.28 * (r / radius) + 0.06;
      const ang = (arm / arms) * Math.PI * 2 + (r / radius) * twist + (Math.random() - 0.5) * spread * Math.PI;
      x = Math.cos(ang) * r + (Math.random() - 0.5) * radius * 0.04;
      z = Math.sin(ang) * r + (Math.random() - 0.5) * radius * 0.04;
      const fall = 1 - r / radius;
      y = (Math.random() - 0.5) * 2 * radius * thickness * (0.3 + fall);
      mix = Math.min(1, r / (radius * 0.75));
    }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    tmp.copy(COL_CORE).lerp(COL_ARM, mix);
    if (mix > 0.4 && Math.random() < 0.045) tmp.copy(COL_PINK); // HII regions
    const b = 0.6 + Math.random() * 0.4;
    col[i * 3] = tmp.r * b; col[i * 3 + 1] = tmp.g * b; col[i * 3 + 2] = tmp.b * b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export function blobGalaxyGeometry({ count = 3000, radius = 5, flat = 0.6, color = 0xffe2b8, irregular = false } = {}) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const base = new THREE.Color(color);
  const clumps = [];
  if (irregular) {
    for (let i = 0; i < 5; i++) {
      clumps.push(new THREE.Vector3(
        (Math.random() - 0.5) * radius, (Math.random() - 0.5) * radius * flat, (Math.random() - 0.5) * radius));
    }
  }
  for (let i = 0; i < count; i++) {
    let v;
    if (irregular && Math.random() < 0.5) {
      const ccl = clumps[Math.floor(Math.random() * clumps.length)];
      v = new THREE.Vector3(
        ccl.x + (Math.random() - 0.5) * radius * 0.5,
        ccl.y + (Math.random() - 0.5) * radius * 0.5 * flat,
        ccl.z + (Math.random() - 0.5) * radius * 0.5);
    } else {
      const r = Math.pow(Math.random(), 1.6) * radius;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      v = new THREE.Vector3(
        r * Math.sin(ph) * Math.cos(th),
        r * Math.cos(ph) * flat,
        r * Math.sin(ph) * Math.sin(th));
    }
    pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    const b = 0.5 + Math.random() * 0.5;
    col[i * 3] = base.r * b; col[i * 3 + 1] = base.g * b; col[i * 3 + 2] = base.b * b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

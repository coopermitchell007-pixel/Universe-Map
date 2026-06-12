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

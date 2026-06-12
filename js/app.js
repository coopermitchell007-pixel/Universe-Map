// ============================================================
// Interactive Universe Map
// Six nested scales: Earth → Solar System → Milky Way →
// Local Group → Observable Universe → Multiverse.
// Scroll past the edge of each level to travel to the next.
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as DATA from './data.js';
import * as TEX from './textures.js';

// ---------------- renderer / scene / camera ----------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x01020a);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(0, 14, 40);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
raycaster.params.Points = { threshold: 1.2 };
raycaster.params.Sprite = {};

// ---------------- UI helpers ----------------
const $ = id => document.getElementById(id);
const panel = $('panel'), panelContent = $('panel-content');
const tooltip = $('tooltip'), toast = $('toast'), scalebar = $('scalebar');
const fadeEl = $('fade'), crumbsEl = $('crumbs');
let openInfoId = null;

function showInfo(info) {
  openInfoId = info.id || null;
  let html = `<h2>${info.name}</h2>`;
  if (info.subtitle) html += `<div class="sub">${info.subtitle}</div>`;
  if (info.stats && info.stats.length) {
    html += '<table>' + info.stats.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('') + '</table>';
  }
  if (info.desc) html += `<p>${info.desc}</p>`;
  panelContent.innerHTML = html;
  panel.classList.add('open');
}
function closePanel() { panel.classList.remove('open'); openInfoId = null; }
$('panel-close').addEventListener('click', closePanel);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closePanel(); clearFocus();
    const news = document.getElementById('news');
    if (news) news.classList.remove('open');
  }
});

let toastTimer = null;
function showToast(title, sub) {
  toast.innerHTML = `<b>${title}</b>${sub ? `<span>${sub}</span>` : ''}`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function showMultiversePanel() {
  const mv = DATA.MULTIVERSE;
  let html = `<h2>${mv.title}</h2><p>${mv.intro}</p>`;
  for (const c of mv.concepts) {
    html += `<h3>${c.name}</h3><div class="sub">${c.subtitle}</div><p>${c.desc}</p>`;
  }
  html += `<p class="dim">Tip: the bubbles around you are clickable too.</p>`;
  panelContent.innerHTML = html;
  panel.classList.add('open');
  openInfoId = 'multiverse';
}

// distance formatting for the scale bar
const KM_PER_AU = 1.496e8, KM_PER_LY = 9.461e12;
function formatDistance(km) {
  if (km < 1e6) return `${Math.round(km).toLocaleString()} km`;
  if (km < KM_PER_AU * 0.5) return `${(km / 1e6).toFixed(1)} million km`;
  if (km < KM_PER_LY * 0.05) return `${(km / KM_PER_AU).toFixed(1)} AU`;
  const ly = km / KM_PER_LY;
  if (ly < 1e5) return `${Math.round(ly).toLocaleString()} light-years`;
  if (ly < 1e9) return `${(ly / 1e6).toFixed(1)} million light-years`;
  return `${(ly / 1e9).toFixed(1)} billion light-years`;
}

// ---------------- shared assets ----------------
const texLoader = new THREE.TextureLoader();
texLoader.setCrossOrigin('anonymous');
const glowTex = TEX.glowTexture('rgba(255,255,255,1)');
const warmGlowTex = TEX.glowTexture('rgba(255,220,150,1)');
const dotTex = TEX.circleTexture('#ffffff');

function tryPhotoTexture(url, material) {
  texLoader.load(url, t => {
    t.colorSpace = THREE.SRGBColorSpace;
    material.map = t;
    material.needsUpdate = true;
  }, undefined, () => { /* keep procedural fallback */ });
}

// background starfield (visible at every level)
(function starfield() {
  const N = 9000;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(6000 + Math.random() * 2000);
    pos.set([v.x, v.y, v.z], i * 3);
    const b = 0.35 + Math.random() * 0.65;
    const warm = Math.random() < 0.25;
    col.set(warm ? [b, b * 0.85, b * 0.7] : [b * 0.85, b * 0.9, b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
  const pts = new THREE.Points(g, m);
  pts.userData.noPick = true;
  scene.add(pts);
})();

// ---------------- level framework ----------------
// Each level: { group, pickables[], minDist, maxDist, defaultDist, animate(dt,t), onEnter() }
const levels = [];
let current = 0;
let transitioning = false;

function registerLevel(def) {
  def.group.visible = false;
  scene.add(def.group);
  levels.push(def);
}

function gotoLevel(i, zoomingOut = true) {
  if (i < 0 || i >= levels.length || i === current && levels[current].group.visible) return;
  transitioning = true;
  closePanel(); clearFocus();
  tooltip.style.display = 'none';
  fadeEl.classList.add('on');
  setTimeout(() => {
    levels[current].group.visible = false;
    current = i;
    const L = levels[current];
    L.group.visible = true;
    controls.minDistance = L.minDist;
    controls.maxDistance = L.maxDist;
    const d = zoomingOut ? (L.enterDist || L.minDist * 1.6) : L.maxDist * 0.8;
    camera.position.copy(new THREE.Vector3(0.4, 0.45, 1).normalize().multiplyScalar(d));
    controls.target.set(0, 0, 0);
    controls.update();
    const meta = DATA.LEVEL_META[i];
    showToast(meta.name, meta.tagline);
    updateCrumbs();
    if (L.onEnter) L.onEnter();
    setTimeout(() => { fadeEl.classList.remove('on'); transitioning = false; }, 80);
  }, 360);
}

// breadcrumbs
function updateCrumbs() {
  crumbsEl.innerHTML = '';
  DATA.LEVEL_META.forEach((m, i) => {
    const b = document.createElement('button');
    b.textContent = m.name;
    if (i === current) b.classList.add('active');
    b.addEventListener('click', () => { if (!transitioning && i !== current) gotoLevel(i, i > current); });
    crumbsEl.appendChild(b);
  });
}

// scroll past the boundary of a level to change levels
let edgeAccum = 0, edgeDir = 0;
renderer.domElement.addEventListener('wheel', e => {
  if (transitioning) return;
  const d = camera.position.distanceTo(controls.target);
  const atMax = d > controls.maxDistance * 0.96;
  const atMin = d < controls.minDistance * 1.04;
  let dir = 0;
  if (e.deltaY > 0 && atMax && current < levels.length - 1) dir = 1;
  else if (e.deltaY < 0 && atMin && current > 0 && !focusObj) dir = -1;
  if (dir === 0) { edgeAccum = 0; return; }
  if (dir !== edgeDir) { edgeDir = dir; edgeAccum = 0; }
  edgeAccum += Math.abs(e.deltaY);
  if (edgeAccum > 220) {
    edgeAccum = 0;
    gotoLevel(current + dir, dir > 0);
  }
}, { passive: true });

// +/- buttons (also crosses levels, useful on trackpads/touch)
function dolly(factor) {
  if (transitioning) return;
  const d = camera.position.distanceTo(controls.target) * factor;
  if (d > controls.maxDistance && current < levels.length - 1) { gotoLevel(current + 1, true); return; }
  if (d < controls.minDistance && current > 0) { gotoLevel(current - 1, false); return; }
  const dd = THREE.MathUtils.clamp(d, controls.minDistance, controls.maxDistance);
  camera.position.sub(controls.target).setLength(dd).add(controls.target);
}
$('zoom-in').addEventListener('click', () => dolly(0.55));
$('zoom-out').addEventListener('click', () => dolly(1.8));

// ---------------- picking, hover, focus ----------------
let focusObj = null, focusDist = null;
function setFocus(obj, dist) { focusObj = obj; focusDist = dist; }
function clearFocus() { focusObj = null; focusDist = null; }

function pick(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  const m = new THREE.Vector2(
    ((ev.clientX - r.left) / r.width) * 2 - 1,
    -((ev.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(m, camera);
  // click tolerance for point clouds scales with how far out we are
  raycaster.params.Points.threshold = THREE.MathUtils.clamp(
    camera.position.distanceTo(controls.target) * 0.012, 0.3, 9);
  const hits = raycaster.intersectObjects(levels[current].pickables, true);
  // small named markers (stars, exoplanets, satellites) win over big
  // background clouds like the galaxy disc that they sit inside of
  let best = null;
  for (const h of hits) {
    let o = h.object;
    while (o && !o.userData.info && !o.userData.pointInfos) o = o.parent;
    if (!o) continue;
    const prio = o.userData.pickPriority || 0;
    let res = null;
    if (o.userData.pointInfos && h.index !== undefined) {
      res = { info: o.userData.pointInfos(h.index), object: o, hit: h, prio };
    } else if (o.userData.info) {
      res = { info: o.userData.info, object: o.userData.focusTarget || o, hit: h, prio };
    }
    if (res && res.info && (!best || res.prio > best.prio)) best = res;
  }
  return best;
}

let downPos = null;
renderer.domElement.addEventListener('pointerdown', e => { downPos = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]);
  downPos = null;
  if (moved > 6 || transitioning) return;
  const res = pick(e);
  if (res) {
    showInfo(res.info);
    if (res.object && res.object.userData.focusable) {
      setFocus(res.object, res.object.userData.focusDist || null);
    }
  }
});

let hoverTimer = 0;
renderer.domElement.addEventListener('pointermove', e => {
  const now = performance.now();
  if (now - hoverTimer < 60) return;
  hoverTimer = now;
  if (transitioning) { tooltip.style.display = 'none'; return; }
  const res = pick(e);
  if (res && res.info && res.info.name) {
    tooltip.textContent = res.info.name;
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top = (e.clientY + 10) + 'px';
    renderer.domElement.style.cursor = 'pointer';
  } else {
    tooltip.style.display = 'none';
    renderer.domElement.style.cursor = 'grab';
  }
});

// ============================================================
// LEVEL 0 — EARTH  (1 unit = 637.1 km, Earth radius = 10)
// ============================================================
const EARTH_R = 10;
function latLonToVec3(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta));
}

const earthLevel = (() => {
  const group = new THREE.Group();
  const pickables = [];

  group.add(new THREE.AmbientLight(0x445066, 1.2));
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
  sunLight.position.set(80, 30, 60);
  group.add(sunLight);

  // earth + everything pinned to its surface rotates together
  const earthFixed = new THREE.Group();
  group.add(earthFixed);

  const earthMat = new THREE.MeshStandardMaterial({ map: TEX.earthTexture(), roughness: 1 });
  tryPhotoTexture('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_atmos_2048.jpg', earthMat);
  const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R, 64, 48), earthMat);
  earthMesh.userData.info = DATA.PLANETS.find(p => p.id === 'earth');
  earthFixed.add(earthMesh);
  pickables.push(earthMesh);

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R * 1.04, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x4d8fe8, transparent: true, opacity: 0.13, side: THREE.BackSide }));
  group.add(atmo);

  // ---- live satellites (CelesTrak TLEs + SGP4) ----
  const MAX_SATS = 400;
  let satPos = new Float32Array(0);
  let satIndexMap = new Int32Array(0); // draw index -> sats[] index
  const satGeom = new THREE.BufferGeometry();
  satGeom.setAttribute('position', new THREE.BufferAttribute(satPos, 3));
  satGeom.setDrawRange(0, 0);
  function allocSatBuffers() {
    // size the buffer exactly to the loaded list, so no dead (0,0,0)
    // points exist to swallow raycasts
    satPos = new Float32Array(sats.length * 3);
    satIndexMap = new Int32Array(sats.length);
    satGeom.setAttribute('position', new THREE.BufferAttribute(satPos, 3));
    satGeom.setDrawRange(0, 0);
    // fixed generous bounds (covers GEO) so picking works every frame
    satGeom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 120);
  }
  const satPoints = new THREE.Points(satGeom, new THREE.PointsMaterial({
    map: dotTex, color: 0xaee4ff, size: 8, sizeAttenuation: false,
    transparent: true, depthWrite: false }));
  satPoints.frustumCulled = false;
  satPoints.userData.pickPriority = 2;
  earthFixed.add(satPoints);
  pickables.push(satPoints);

  let sats = [];          // { name, satrec | sim:{...}, lat, lon, alt, vel }
  let satsAreSimulated = false;

  satPoints.userData.pointInfos = (idx) => {
    const s = sats[satIndexMap[idx]];
    if (!s) return null;
    const cls = DATA.classifySat(s.name);
    const live = !satsAreSimulated;
    const orbit = s.alt > 33000 ? 'Geostationary region (GEO)'
      : s.alt > 2000 ? 'Medium Earth orbit (MEO)' : 'Low Earth orbit (LEO)';
    const stats = [
      ['What it is', cls.type],
      ['Orbit', orbit + (s.incDeg != null ? ` · inclined ${s.incDeg.toFixed(1)}°` : '')],
    ];
    if (s.norad) stats.push(['NORAD catalog #', String(s.norad)]);
    if (s.launchYear) stats.push(['Launched', `${s.launchYear} (designation ${s.intl})`]);
    if (s.revsPerDay) stats.push(['Orbital period', `${Math.round(1440 / s.revsPerDay)} min — ${s.revsPerDay.toFixed(1)} orbits per day`]);
    stats.push(
      ['Altitude right now', Math.round(s.alt).toLocaleString() + ' km'],
      ['Above (lat, lon)', `${s.lat.toFixed(2)}°, ${s.lon.toFixed(2)}°`],
      ['Speed', s.vel ? s.vel.toFixed(2) + ' km/s' : '—']);
    return {
      id: 'sat-' + (s.norad || s.name),
      name: s.name + (live ? '' : ' (simulated)'),
      subtitle: live ? '● Tracked live · ' + cls.type : 'Demo orbit — live TLE feed unavailable',
      stats,
      desc: cls.desc + (live ? ' Its position on this map is recomputed several times a second with the SGP4 model from its latest public CelesTrak orbital elements — the same data ground stations use to point antennas.' : ''),
    };
  };

  function makeSimSats() {
    satsAreSimulated = true;
    sats = [];
    const names = ['STARLINK', 'COSMOS', 'NOAA', 'GPS IIF', 'GLOBALSTAR', 'IRIDIUM', 'SENTINEL', 'TERRA', 'LANDSAT', 'GOES'];
    for (let i = 0; i < 140; i++) {
      const leo = Math.random() < 0.8;
      sats.push({
        name: `${names[i % names.length]}-${100 + i}`,
        sim: {
          alt: leo ? 400 + Math.random() * 1200 : 20000 + Math.random() * 16000,
          inc: Math.random() * Math.PI * 0.9,
          raan: Math.random() * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
        },
        lat: 0, lon: 0, alt: 0, vel: leo ? 7.6 : 3.9,
      });
    }
    allocSatBuffers();
  }

  async function loadSatellites() {
    if (!window.satellite) { makeSimSats(); return; }
    try {
      const res = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle', { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('http ' + res.status);
      const lines = (await res.text()).split('\n').map(l => l.trimEnd()).filter(Boolean);
      const out = [];
      for (let i = 0; i + 2 < lines.length + 1 && out.length < MAX_SATS; i += 3) {
        const l1 = lines[i + 1], l2 = lines[i + 2];
        if (!l1 || !l2) break;
        const rec = window.satellite.twoline2satrec(l1, l2);
        if (rec.error !== 0) continue;
        // identity & orbit facts straight from the TLE fields
        const intl = l1.substring(9, 17).trim();
        const yy = parseInt(intl.slice(0, 2), 10);
        out.push({
          name: lines[i].trim(), satrec: rec,
          norad: parseInt(l1.substring(2, 7), 10) || null,
          intl: intl || null,
          launchYear: Number.isFinite(yy) ? (yy >= 57 ? 1900 + yy : 2000 + yy) : null,
          incDeg: parseFloat(l2.substring(8, 16)),
          revsPerDay: parseFloat(l2.substring(52, 63)),
          lat: 0, lon: 0, alt: 0, vel: 0,
        });
      }
      if (out.length < 5) throw new Error('too few sats parsed');
      sats = out;
      satsAreSimulated = false;
      allocSatBuffers();
      showToast('Live satellite data loaded', `${sats.length} satellites tracked in real time`);
    } catch (err) {
      console.warn('CelesTrak unavailable, using simulated satellites:', err);
      makeSimSats();
    }
  }
  loadSatellites();

  let lastSatUpdate = 0;
  function updateSatellites(now) {
    if (!sats.length || now - lastSatUpdate < 200) return;
    lastSatUpdate = now;
    const date = new Date();
    let n = 0;
    if (!satsAreSimulated && window.satellite) {
      const gmst = window.satellite.gstime(date);
      for (let si = 0; si < sats.length; si++) {
        const s = sats[si];
        const pv = window.satellite.propagate(s.satrec, date);
        if (!pv || !pv.position) continue;
        const geo = window.satellite.eciToGeodetic(pv.position, gmst);
        s.lat = THREE.MathUtils.radToDeg(geo.latitude);
        s.lon = THREE.MathUtils.radToDeg(geo.longitude);
        s.alt = geo.height;
        if (pv.velocity) s.vel = Math.hypot(pv.velocity.x, pv.velocity.y, pv.velocity.z);
        const v = latLonToVec3(s.lat, s.lon, EARTH_R * (6371 + s.alt) / 6371);
        satPos[n * 3] = v.x; satPos[n * 3 + 1] = v.y; satPos[n * 3 + 2] = v.z;
        satIndexMap[n] = si;
        n++;
      }
    } else {
      const t = date.getTime() / 1000;
      for (let si = 0; si < sats.length; si++) {
        const s = sats[si];
        const { alt, inc, raan, phase } = s.sim;
        const period = 5400 * Math.pow((6371 + alt) / 6791, 1.5);
        const a = phase + (t / period) * Math.PI * 2;
        // circular inclined orbit
        const x = Math.cos(a), y = Math.sin(a) * Math.sin(inc), zz = Math.sin(a) * Math.cos(inc);
        const xr = x * Math.cos(raan) - zz * Math.sin(raan);
        const zr = x * Math.sin(raan) + zz * Math.cos(raan);
        s.lat = THREE.MathUtils.radToDeg(Math.asin(y));
        s.lon = THREE.MathUtils.radToDeg(Math.atan2(zr, xr)) - (t / 86400) * 360 % 360;
        s.alt = alt;
        const v = latLonToVec3(s.lat, s.lon, EARTH_R * (6371 + alt) / 6371);
        satPos[n * 3] = v.x; satPos[n * 3 + 1] = v.y; satPos[n * 3 + 2] = v.z;
        satIndexMap[n] = si;
        n++;
      }
    }
    satGeom.setDrawRange(0, n);
    satGeom.attributes.position.needsUpdate = true;
  }

  // ---- ISS (live via wheretheiss.at) ----
  const iss = new THREE.Group();
  const issBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.4, roughness: 0.5 }));
  issBody.rotation.z = Math.PI / 2;
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x2a4a9a, metalness: 0.3, roughness: 0.4, side: THREE.DoubleSide });
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.35), panelMat); p1.position.y = 0.32;
  const p2 = p1.clone(); p2.position.y = -0.32;
  const issGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmGlowTex, transparent: true, opacity: 0.9, depthWrite: false }));
  issGlow.scale.setScalar(2.2);
  const issLabel = TEX.makeLabel('ISS  ● LIVE', { color: '#ffd76a', size: 1.6 });
  issLabel.position.y = 1.6;
  iss.add(issBody, p1, p2, issGlow, issLabel);
  iss.userData.info = DATA.ISS_INFO;
  iss.userData.pickPriority = 3;
  iss.userData.focusable = true;
  iss.userData.focusDist = 6;
  iss.visible = false;
  earthFixed.add(iss);
  pickables.push(iss);

  let issData = null, issTarget = new THREE.Vector3();
  async function pollISS() {
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('http ' + res.status);
      issData = await res.json();
      issTarget.copy(latLonToVec3(issData.latitude, issData.longitude, EARTH_R * (6371 + issData.altitude) / 6371));
      if (!iss.visible) { iss.position.copy(issTarget); iss.visible = true; }
      // refresh the open panel with live numbers
      DATA.ISS_INFO.stats = [
        ['Latitude', issData.latitude.toFixed(2) + '°'],
        ['Longitude', issData.longitude.toFixed(2) + '°'],
        ['Altitude', issData.altitude.toFixed(1) + ' km'],
        ['Speed', Math.round(issData.velocity).toLocaleString() + ' km/h'],
        ['Over', issData.visibility === 'daylight' ? 'Daylight side of Earth' : 'Night side of Earth'],
        ['Crew', 'Usually 7'], ['Continuously inhabited since', '2 November 2000'],
      ];
      if (openInfoId === 'iss') showInfo(DATA.ISS_INFO);
    } catch (err) {
      // fall back: if we track ISS via TLE, place it from there
      const tle = sats.find(s => s.name && s.name.includes('ISS'));
      if (tle) {
        issTarget.copy(latLonToVec3(tle.lat, tle.lon, EARTH_R * (6371 + tle.alt) / 6371));
        iss.visible = true;
      }
    }
  }
  pollISS();
  setInterval(pollISS, 5000);

  // ---- Moon (real distance: ~60 Earth radii) ----
  const moonData = DATA.PLANETS.find(p => p.id === 'earth').moons[0];
  const moonMat = new THREE.MeshStandardMaterial({ map: TEX.planetTexture({ bands: ['#b8b4ab', '#a09c93', '#c8c4bb'], craters: true }, 3), roughness: 1 });
  tryPhotoTexture('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/moon_1024.jpg', moonMat);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(2.7, 32, 24), moonMat);
  moon.userData.info = moonData;
  moon.userData.focusable = true; moon.userData.focusDist = 9;
  group.add(moon);
  pickables.push(moon);
  const moonLabel = TEX.makeLabel('Moon', { size: 8 });
  moonLabel.position.y = 7; moon.add(moonLabel);
  const moonOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(600, 0.3, 8, 200),
    new THREE.MeshBasicMaterial({ color: 0x8899bb, transparent: true, opacity: 0.18 }));
  moonOrbit.rotation.x = Math.PI / 2;
  moonOrbit.userData.noPick = true;
  group.add(moonOrbit);

  // GEO ring marker
  const geoR = EARTH_R * (6371 + 35786) / 6371;
  const geoRing = new THREE.Mesh(
    new THREE.TorusGeometry(geoR, 0.12, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0x66ddff, transparent: true, opacity: 0.12 }));
  geoRing.rotation.x = Math.PI / 2;
  group.add(geoRing);

  function animate(dt, t) {
    earthFixed.rotation.y += dt * (Math.PI * 2 / 600); // gentle visible rotation
    updateSatellites(performance.now());
    if (iss.visible) iss.position.lerp(issTarget, Math.min(1, dt * 1.5));
    const ma = t * 0.02;
    moon.position.set(Math.cos(ma) * 600, 0, Math.sin(ma) * 600);
    moon.rotation.y = -ma;
  }

  return { group, pickables, minDist: 13, maxDist: 1500, animate,
    onEnter() { showToast('Earth', 'Live ISS & satellite positions — click them'); } };
})();
registerLevel(earthLevel);

// ============================================================
// LEVEL 1 — SOLAR SYSTEM (stylised distances, real periods)
// ============================================================
const solarLevel = (() => {
  const group = new THREE.Group();
  const pickables = [];

  group.add(new THREE.AmbientLight(0x404050, 0.7));
  const sunLight = new THREE.PointLight(0xfff2d8, 3, 0, 0);
  group.add(sunLight);

  // sun
  const sun = new THREE.Mesh(new THREE.SphereGeometry(8, 48, 32),
    new THREE.MeshBasicMaterial({ map: TEX.sunTexture() }));
  sun.userData.info = DATA.SUN;
  group.add(sun); pickables.push(sun);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmGlowTex, transparent: true, opacity: 0.95, depthWrite: false }));
  sunGlow.scale.setScalar(42); sunGlow.userData.noPick = true;
  group.add(sunGlow);
  const sunLabel = TEX.makeLabel('Sun', { color: '#ffe9a8', size: 6 });
  sunLabel.position.y = 13; group.add(sunLabel);

  const planetNodes = [];
  let simDays = Math.random() * 10000; // current simulation time in days
  const speedSlider = $('speed');

  for (const p of DATA.PLANETS) {
    const L = p.layout;
    const holder = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({
      map: p.tex.earth ? TEX.earthTexture() : TEX.planetTexture(p.tex, p.id.length * 13),
      roughness: 1 });
    if (p.tex.earth) tryPhotoTexture('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_atmos_2048.jpg', mat);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(L.size, 40, 28), mat);
    mesh.userData.info = p;
    mesh.userData.focusable = true;
    mesh.userData.focusDist = L.size * 5 + (p.moons.length ? p.moons.length * 1.5 : 0);
    holder.add(mesh);
    pickables.push(mesh);

    const label = TEX.makeLabel(p.name, { size: THREE.MathUtils.clamp(1.4 + L.size * 0.5, 1.7, 4) });
    label.position.y = L.size + 2.2;
    holder.add(label);

    if (L.ring) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(L.size * 1.35, L.size * 2.3, 80),
        new THREE.MeshBasicMaterial({ map: TEX.ringTexture(), side: THREE.DoubleSide, transparent: true, opacity: 0.9 }));
      ring.rotation.x = Math.PI / 2 - 0.35;
      ring.userData.noPick = true;
      holder.add(ring);
    }

    // moons
    const moonNodes = [];
    p.moons.forEach((m, mi) => {
      const mr = L.size * 1.7 + mi * Math.max(1.1, L.size * 0.45);
      const mm = new THREE.Mesh(new THREE.SphereGeometry(m.size, 20, 14),
        new THREE.MeshStandardMaterial({
          map: TEX.planetTexture({ bands: ['#' + new THREE.Color(m.color).getHexString(), '#888'], craters: m.craters }, mi + p.id.length),
          roughness: 1 }));
      mm.userData.info = m;
      mm.userData.focusable = true; mm.userData.focusDist = Math.max(2.5, m.size * 8);
      holder.add(mm);
      pickables.push(mm);
      moonNodes.push({ mesh: mm, r: mr, period: m.periodDays, phase: Math.random() * Math.PI * 2 });
      const morb = new THREE.Mesh(new THREE.TorusGeometry(mr, 0.02, 6, 64),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 }));
      morb.rotation.x = Math.PI / 2; morb.userData.noPick = true;
      holder.add(morb);
    });

    // orbit line
    const pivot = new THREE.Group();
    if (L.inclination) pivot.rotation.x = L.inclination * 0.5;
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(L.dist, 0.08, 6, 256),
      new THREE.MeshBasicMaterial({ color: 0x5a6a8a, transparent: true, opacity: 0.3 }));
    orbit.rotation.x = Math.PI / 2; orbit.userData.noPick = true;
    pivot.add(orbit);
    pivot.add(holder);
    group.add(pivot);

    planetNodes.push({ p, holder, mesh, moonNodes, phase: Math.random() * Math.PI * 2 });
  }

  // asteroid + Kuiper belts
  function belt(rMin, rMax, count, color, opacity, ySpread, info) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rMin + Math.random() * (rMax - rMin);
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * ySpread;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({
      map: dotTex, color, size: 3, sizeAttenuation: false, transparent: true, opacity, depthWrite: false }));
    pts.userData.info = info;
    group.add(pts);
    pickables.push(pts);
    return pts;
  }
  const astBelt = belt(74, 86, 2600, 0x9a8a78, 0.55, 2.5, DATA.BELTS.asteroid);
  const kuiper = belt(208, 248, 3500, 0x7a88a8, 0.4, 6, DATA.BELTS.kuiper);
  astBelt.userData.pointInfos = () => DATA.BELTS.asteroid;
  kuiper.userData.pointInfos = () => DATA.BELTS.kuiper;

  // every catalogued moon: a swarm of small clickable dots per planet,
  // loaded from the bundled NASA dataset (data/moons.json)
  (async () => {
    try {
      const res = await fetch('data/moons.json');
      const catalog = await res.json();
      const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const node of planetNodes) {
        const detailed = new Set(node.p.moons.map(m => norm(m.id)));
        const list = (catalog[node.p.id] || []).filter(m => !detailed.has(norm(m.n)));
        if (!list.length) continue;
        const L = node.p.layout;
        const baseR = L.size * 1.7 + node.p.moons.length * Math.max(1.1, L.size * 0.45) + 0.8;
        const pos = new Float32Array(list.length * 3);
        for (let i = 0; i < list.length; i++) {
          const r = baseR + i * 0.22;
          const a = i * 2.39996; // golden-angle spacing
          const y = Math.sin(i * 12.9898) * (0.2 + i * 0.03);
          pos[i * 3] = Math.cos(a) * r;
          pos[i * 3 + 1] = y;
          pos[i * 3 + 2] = Math.sin(a) * r;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const pts = new THREE.Points(g, new THREE.PointsMaterial({
          map: dotTex, color: 0xcfd8e8, size: 4, sizeAttenuation: false,
          transparent: true, opacity: 0.85, depthWrite: false }));
        pts.userData.pickPriority = 1;
        pts.userData.pointInfos = (idx) => {
          const m = list[idx];
          return {
            id: 'sm-' + node.p.id + '-' + idx,
            name: m.n, subtitle: 'Moon of ' + node.p.name,
            stats: [
              ['Diameter', m.r ? `≈ ${Math.round(m.r * 2).toLocaleString()} km` : 'Unknown'],
              ['Density', m.den ? m.den + ' g/cm³' : 'Unknown'],
              ['Albedo (reflectivity)', m.alb != null ? String(m.alb) : 'Unknown'],
              ['Apparent magnitude', m.mag != null ? String(m.mag) : 'Unknown'],
            ],
            desc: m.r && m.r < 30
              ? `One of ${node.p.name}'s catalogued moons — a small irregular body, most likely a captured asteroid or a fragment from an ancient collision, far too small for its own gravity to pull it into a sphere.`
              : `One of ${node.p.name}'s catalogued moons, large enough to be a significant member of its family. (Physical data: NASA.)`,
          };
        };
        node.holder.add(pts);
        node.swarm = pts;
        pickables.push(pts);
      }
    } catch (e) { console.warn('moons.json unavailable:', e); }
  })();

  function animate(dt) {
    const daysPerSec = parseFloat(speedSlider.value);
    simDays += dt * daysPerSec;
    sun.rotation.y += dt * 0.04;
    for (const n of planetNodes) {
      const a = n.phase + (simDays / n.p.layout.periodDays) * Math.PI * 2;
      const ecc = n.p.layout.eccentric || 0;
      const r = n.p.layout.dist * (1 + ecc * Math.cos(a));
      n.holder.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      n.mesh.rotation.y += dt * 0.3;
      for (const mn of n.moonNodes) {
        const ma = mn.phase + (simDays / mn.period) * Math.PI * 2;
        mn.mesh.position.set(Math.cos(ma) * mn.r, 0, Math.sin(ma) * mn.r);
      }
      if (n.swarm) n.swarm.rotation.y += dt * daysPerSec * 0.012;
    }
    astBelt.rotation.y += dt * 0.01;
    kuiper.rotation.y += dt * 0.004;
  }

  return { group, pickables, minDist: 9, maxDist: 700, enterDist: 150, animate,
    onEnter() { $('speed-wrap').classList.add('show'); } };
})();
registerLevel(solarLevel);

// ============================================================
// LEVEL 2 — MILKY WAY
// ============================================================
const galaxyLevel = (() => {
  const group = new THREE.Group();
  const pickables = [];
  const spin = new THREE.Group();
  group.add(spin);

  const R = 200;
  const galGeom = TEX.spiralGalaxyGeometry({ count: 48000, radius: R, arms: 4, twist: 2.4, thickness: 0.05 });
  const gal = new THREE.Points(galGeom, new THREE.PointsMaterial({
    map: dotTex, size: 1.6, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
  gal.userData.info = DATA.GALAXIES[0];
  spin.add(gal);
  pickables.push(gal);
  gal.userData.pointInfos = () => DATA.GALAXIES[0];

  // central glow + Sgr A*
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmGlowTex, transparent: true, opacity: 0.95, depthWrite: false }));
  coreGlow.scale.setScalar(70); coreGlow.userData.noPick = true;
  spin.add(coreGlow);

  const sgr = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000 }));
  sgr.userData.info = DATA.SGR_A;
  spin.add(sgr); pickables.push(sgr);
  const sgrLabel = TEX.makeLabel('Sagittarius A*', { color: '#ffb480', size: 9, sub: 'supermassive black hole' });
  sgrLabel.position.y = 16; spin.add(sgrLabel);

  // "you are here" sun marker
  const sunMark = new THREE.Group();
  sunMark.position.set(R * 0.53, 1.5, R * 0.18);
  const mk = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glowTexture('rgba(120,220,255,1)'), transparent: true, depthWrite: false }));
  mk.scale.setScalar(10);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(6, 0.35, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0x7adcff, transparent: true, opacity: 0.8 }));
  ring.rotation.x = Math.PI / 2;
  const youLabel = TEX.makeLabel('You are here — the Sun', { color: '#7adcff', size: 7, sub: 'Orion Arm' });
  youLabel.position.y = 11;
  sunMark.add(mk, ring, youLabel);
  sunMark.userData.info = DATA.SUN_MARKER;
  sunMark.userData.pickPriority = 3;
  spin.add(sunMark); pickables.push(sunMark);
  sgr.userData.pickPriority = 3;

  // --- notable real stars around the Sun (distances log-compressed) ---
  const starDist = ly => 2.5 + Math.log10(Math.max(ly, 1.5)) * 6.5;
  DATA.STARS.forEach((st, i) => {
    const node = new THREE.Group();
    const a = i * 2.39996;                                  // golden-angle spread
    const yy = (((i * 0.618034) % 1) - 0.5) * 0.9;          // mild disc flattening
    const dir = new THREE.Vector3(Math.cos(a), yy, Math.sin(a)).normalize();
    node.position.copy(sunMark.position).addScaledVector(dir, starDist(st.ly));
    const col = new THREE.Color(st.c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture(`rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},1)`),
      transparent: true, depthWrite: false }));
    sp.scale.setScalar(st.s);
    node.add(sp);
    if (st.label) {
      const lb = TEX.makeLabel(st.name, { size: 1.5, color: '#dce8ff' });
      lb.position.y = st.s * 0.7 + 1;
      node.add(lb);
    }
    node.userData.info = {
      id: 'star-' + i, name: st.name, subtitle: st.type,
      stats: [
        ['Distance from the Sun', st.ly.toLocaleString() + ' light-years'],
        ['Spectral type', st.type],
        ['Known planets', st.pl || 'None confirmed yet'],
      ],
      desc: st.desc,
    };
    node.userData.focusable = true;
    node.userData.focusDist = 14;
    node.userData.pickPriority = 2;
    spin.add(node);
    pickables.push(node);
  });

  // --- every confirmed exoplanet (bundled NASA Exoplanet Archive catalog) ---
  (async () => {
    try {
      const res = await fetch('data/exoplanets.json');
      const rows = await res.json();
      const pos = new Float32Array(rows.length * 3);
      const v = new THREE.Vector3();
      for (let i = 0; i < rows.length; i++) {
        const r0 = rows[i];
        const ra = (r0.ra || 0) * Math.PI / 180;
        const dec = (r0.dec || 0) * Math.PI / 180;
        const ly = r0.sy_dist ? r0.sy_dist * 3.262 : 800;
        v.set(Math.cos(dec) * Math.cos(ra), Math.sin(dec), Math.cos(dec) * Math.sin(ra))
          .multiplyScalar(starDist(ly));
        pos[i * 3] = sunMark.position.x + v.x;
        pos[i * 3 + 1] = sunMark.position.y + v.y;
        pos[i * 3 + 2] = sunMark.position.z + v.z;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({
        map: dotTex, color: 0x8affc8, size: 3.5, sizeAttenuation: false,
        transparent: true, opacity: 0.75, depthWrite: false }));
      pts.userData.pickPriority = 1;
      pts.userData.pointInfos = (idx) => {
        const r0 = rows[idx];
        return {
          id: 'exo-' + idx, name: r0.pl_name,
          subtitle: 'Confirmed exoplanet — orbits ' + r0.hostname,
          stats: [
            ['Distance', r0.sy_dist ? Math.round(r0.sy_dist * 3.262).toLocaleString() + ' light-years' : 'Unknown'],
            ['Radius', r0.pl_rade ? r0.pl_rade + ' × Earth' : 'Unknown'],
            ['Mass', r0.pl_bmasse ? r0.pl_bmasse + ' × Earth' : 'Unknown'],
            ['Year (orbital period)', r0.pl_orbper ? (r0.pl_orbper < 1 ? (r0.pl_orbper * 24).toFixed(1) + ' hours' : r0.pl_orbper.toFixed(1) + ' days') : 'Unknown'],
            ['Discovered', (r0.disc_year || '?') + ' · ' + (r0.discoverymethod || 'method unknown')],
          ],
          desc: `A real, confirmed planet orbiting the star ${r0.hostname} — one of ${rows.length.toLocaleString()} in NASA's Exoplanet Archive, every single one of which is plotted (in its true direction from the Sun) on this map.`,
        };
      };
      spin.add(pts);
      pickables.push(pts);
      if (current === 2) showToast(`${rows.length.toLocaleString()} exoplanets plotted`, 'Every confirmed planet beyond the Solar System — find them near the Sun marker');
    } catch (e) { console.warn('exoplanets.json unavailable:', e); }
  })();

  // halo globular clusters
  for (let i = 0; i < 16; i++) {
    const gc = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.5, depthWrite: false }));
    gc.scale.setScalar(4 + Math.random() * 5);
    const v = new THREE.Vector3().randomDirection().multiplyScalar(R * (0.5 + Math.random() * 0.7));
    gc.position.copy(v);
    gc.userData.noPick = true;
    spin.add(gc);
  }

  let pulse = 0;
  function animate(dt, t) {
    spin.rotation.y += dt * 0.008;
    pulse += dt;
    ring.scale.setScalar(1 + Math.sin(pulse * 2.5) * 0.25);
  }

  return { group, pickables, minDist: 14, maxDist: 900, enterDist: 340, animate,
    onEnter() { showToast('The Milky Way', 'Zoom into the “You are here” marker — every known star system & exoplanet awaits'); } };
})();
registerLevel(galaxyLevel);

// ============================================================
// LEVEL 3 — LOCAL GROUP
// ============================================================
const localLevel = (() => {
  const group = new THREE.Group();
  const pickables = [];
  const spin = new THREE.Group();
  group.add(spin);

  for (const g of DATA.GALAXIES) {
    const lg = g.lg;
    const node = new THREE.Group();
    node.position.set(...lg.pos);

    let geom, size;
    if (lg.kind === 'spiral') {
      geom = TEX.spiralGalaxyGeometry({ count: 7000, radius: lg.size, arms: g.id === 'milkyway' ? 4 : 2, twist: 2.8, thickness: 0.05 });
    } else if (lg.kind === 'elliptical') {
      geom = TEX.blobGalaxyGeometry({ count: 2200, radius: lg.size, flat: 0.7, color: 0xffe2b8 });
    } else {
      geom = TEX.blobGalaxyGeometry({ count: 2600, radius: lg.size, flat: 0.5, color: lg.kind === 'dwarf' ? 0xd8c8e8 : 0xaac8ff, irregular: true });
    }
    const pts = new THREE.Points(geom, new THREE.PointsMaterial({
      map: dotTex, size: lg.kind === 'spiral' ? 0.55 : 0.45, vertexColors: true,
      transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
    if (lg.tilt) pts.rotation.set(lg.tilt, 0.4, 0.2);
    node.add(pts);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmGlowTex, transparent: true, opacity: 0.55, depthWrite: false }));
    glow.scale.setScalar(lg.size * 0.9);
    glow.userData.noPick = true;
    node.add(glow);

    const label = TEX.makeLabel(g.name.replace(/ \(.*\)/, ''), {
      size: 6.5, color: g.id === 'milkyway' ? '#7adcff' : '#ffffff' });
    label.position.y = lg.size * 0.7 + 4;
    node.add(label);

    node.userData.info = g;
    node.userData.focusable = true;
    node.userData.focusDist = lg.size * 4;
    spin.add(node);
    pickables.push(node);
  }

  // faint intergalactic backdrop, clickable as "the Local Group"
  const dust = new THREE.Points(
    TEX.blobGalaxyGeometry({ count: 1500, radius: 170, flat: 0.7, color: 0x445577 }),
    new THREE.PointsMaterial({ map: dotTex, size: 0.8, vertexColors: true, transparent: true, opacity: 0.25, depthWrite: false }));
  dust.userData.info = DATA.LOCAL_GROUP_INFO;
  dust.userData.pointInfos = () => DATA.LOCAL_GROUP_INFO;
  spin.add(dust);
  pickables.push(dust);

  function animate(dt) { spin.rotation.y += dt * 0.005; }
  return { group, pickables, minDist: 40, maxDist: 1000, enterDist: 280, animate };
})();
registerLevel(localLevel);

// ============================================================
// LEVEL 4 — OBSERVABLE UNIVERSE (cosmic web)
// ============================================================
const universeLevel = (() => {
  const group = new THREE.Group();
  const pickables = [];
  const spin = new THREE.Group();
  group.add(spin);

  // cosmic web: nodes + filaments
  const NODES = 110, R = 300;
  const nodes = [];
  for (let i = 0; i < NODES; i++) {
    nodes.push(new THREE.Vector3().randomDirection().multiplyScalar(Math.pow(Math.random(), 0.55) * R));
  }
  const webPts = [];
  const addGalaxy = (v, jitter) => {
    webPts.push(
      v.x + (Math.random() - 0.5) * jitter,
      v.y + (Math.random() - 0.5) * jitter,
      v.z + (Math.random() - 0.5) * jitter);
  };
  // clusters at nodes
  for (const n of nodes) {
    const c = 60 + Math.floor(Math.random() * 120);
    for (let i = 0; i < c; i++) addGalaxy(n, 18);
  }
  // filaments to ~3 nearest neighbours
  for (let i = 0; i < NODES; i++) {
    const dists = nodes.map((n, j) => [n.distanceTo(nodes[i]), j]).sort((a, b) => a[0] - b[0]);
    for (let k = 1; k <= 3; k++) {
      const j = dists[k][1];
      if (j < i) continue;
      const a = nodes[i], b = nodes[j];
      const steps = Math.floor(a.distanceTo(b) / 2.2);
      for (let s = 0; s < steps; s++) {
        const v = a.clone().lerp(b, (s + Math.random()) / steps);
        addGalaxy(v, 7);
      }
    }
  }
  const webArr = new Float32Array(webPts);
  const webGeom = new THREE.BufferGeometry();
  webGeom.setAttribute('position', new THREE.BufferAttribute(webArr, 3));
  const webCol = new Float32Array(webArr.length);
  for (let i = 0; i < webArr.length; i += 3) {
    const t = Math.random();
    webCol[i] = 0.7 + t * 0.3; webCol[i + 1] = 0.65 + t * 0.25; webCol[i + 2] = 0.55 + Math.random() * 0.45;
  }
  webGeom.setAttribute('color', new THREE.BufferAttribute(webCol, 3));
  const web = new THREE.Points(webGeom, new THREE.PointsMaterial({
    map: dotTex, size: 1.1, vertexColors: true, transparent: true, opacity: 0.8,
    depthWrite: false, blending: THREE.AdditiveBlending }));
  web.userData.info = DATA.OBSERVABLE_INFO;
  web.userData.pointInfos = () => DATA.OBSERVABLE_INFO;
  spin.add(web);
  pickables.push(web);

  // named landmarks pinned to web nodes
  const shuffled = [...nodes].sort(() => Math.random() - 0.5);
  DATA.UNIVERSE_LANDMARKS.forEach((lm, i) => {
    const v = shuffled[i % shuffled.length];
    const node = new THREE.Group();
    node.position.copy(v);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture('rgba(150,200,255,1)'), transparent: true, opacity: 0.85, depthWrite: false }));
    glow.scale.setScalar(16);
    const label = TEX.makeLabel(lm.name, { size: 11, color: '#cfe2ff' });
    label.position.y = 14;
    node.add(glow, label);
    node.userData.info = lm;
    node.userData.focusable = true;
    node.userData.focusDist = 70;
    spin.add(node);
    pickables.push(node);
  });

  // CMB shell — the edge of the visible universe
  const cmb = new THREE.Mesh(
    new THREE.SphereGeometry(420, 48, 32),
    new THREE.MeshBasicMaterial({ map: TEX.cmbTexture(), side: THREE.BackSide, transparent: true, opacity: 0.5 }));
  cmb.userData.info = DATA.CMB_INFO;
  group.add(cmb);
  pickables.push(cmb);

  function animate(dt) { spin.rotation.y += dt * 0.004; }
  return { group, pickables, minDist: 60, maxDist: 1300, enterDist: 400, animate,
    onEnter() { showToast('The Observable Universe', 'Keep zooming out to leave it…'); } };
})();
registerLevel(universeLevel);

// ============================================================
// LEVEL 5 — MULTIVERSE
// ============================================================
const multiLevel = (() => {
  const group = new THREE.Group();
  const pickables = [];
  const bubbles = [];

  function bubble(pos, radius, hue, info, ours = false) {
    const node = new THREE.Group();
    node.position.copy(pos);
    const color = new THREE.Color().setHSL(hue, 0.7, ours ? 0.7 : 0.6);
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: ours ? 0.22 : 0.13, side: THREE.DoubleSide }));
    node.add(shell);
    const inner = new THREE.Points(
      TEX.blobGalaxyGeometry({ count: ours ? 900 : 350, radius: radius * 0.75, flat: 1, color: color.getHex() }),
      new THREE.PointsMaterial({ map: dotTex, size: radius * 0.04, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    node.add(inner);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture(`rgba(${color.r * 255 | 0},${color.g * 255 | 0},${color.b * 255 | 0},1)`),
      transparent: true, opacity: 0.5, depthWrite: false }));
    glow.scale.setScalar(radius * 2.6);
    glow.userData.noPick = true;
    node.add(glow);
    if (ours) {
      const label = TEX.makeLabel('Our Universe', { color: '#ffd76a', size: radius * 0.5, sub: '93 billion light-years — everything you just zoomed through' });
      label.position.y = radius * 1.25;
      node.add(label);
    }
    node.userData.info = info;
    node.userData.focusable = true;
    node.userData.focusDist = radius * 4;
    group.add(node);
    pickables.push(node);
    bubbles.push({ node, drift: new THREE.Vector3().randomDirection().multiplyScalar(0.3 + Math.random() * 0.6), phase: Math.random() * 10 });
    return node;
  }

  // our universe at centre
  bubble(new THREE.Vector3(0, 0, 0), 26, 0.12, {
    id: 'ouruniverse', name: 'Our Universe', subtitle: 'One bubble among many?',
    stats: DATA.OBSERVABLE_INFO.stats,
    desc: `Everything on every previous level of this map — every galaxy, star, planet and person — is contained in this one bubble. In the eternal-inflation picture it is a single pocket universe that nucleated 13.8 billion years ago. Click the other bubbles to explore the theories about what they might be.`,
  }, true);

  // other universes, each teaching a multiverse concept
  const concepts = DATA.MULTIVERSE.concepts;
  for (let i = 0; i < 34; i++) {
    const dir = new THREE.Vector3().randomDirection();
    const dist = 90 + Math.pow(Math.random(), 0.7) * 520;
    const c = concepts[i % concepts.length];
    bubble(dir.multiplyScalar(dist), 8 + Math.random() * 22, Math.random(), {
      ...c, name: c.name, subtitle: 'Another universe? — ' + c.subtitle,
    });
  }

  function animate(dt, t) {
    for (const b of bubbles) {
      b.node.position.addScaledVector(b.drift, Math.sin(t * 0.15 + b.phase) * dt * 0.6);
    }
  }

  return { group, pickables, minDist: 45, maxDist: 1600, enterDist: 260, animate,
    onEnter() {
      showToast('Beyond the Observable Universe', 'You have left everything we can ever see');
      setTimeout(showMultiversePanel, 900);
    } };
})();
registerLevel(multiLevel);

// ---------------- main loop ----------------
let scaleTimer = 0;
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;

  const L = levels[current];
  if (L.animate && L.group.visible) L.animate(dt, t);

  // follow a focused object (e.g. an orbiting planet)
  if (focusObj) {
    const target = new THREE.Vector3();
    focusObj.getWorldPosition(target);
    const prev = controls.target.clone();
    controls.target.lerp(target, Math.min(1, dt * 4));
    camera.position.add(controls.target.clone().sub(prev));
    if (focusDist) {
      const d = camera.position.distanceTo(controls.target);
      const nd = THREE.MathUtils.lerp(d, focusDist, Math.min(1, dt * 2.5));
      camera.position.sub(controls.target).setLength(nd).add(controls.target);
    }
  }

  controls.update();

  // scale bar
  scaleTimer += dt;
  if (scaleTimer > 0.25) {
    scaleTimer = 0;
    const meta = DATA.LEVEL_META[current];
    if (meta.kmPerUnit > 0) {
      const d = camera.position.distanceTo(controls.target);
      scalebar.textContent = `Field of view ≈ ${formatDistance(d * meta.kmPerUnit * 1.2)}`;
    } else {
      scalebar.textContent = 'Beyond the observable universe — scale unknowable';
    }
  }

  renderer.render(scene, camera);
}

// double-click empty space to release focus
renderer.domElement.addEventListener('dblclick', e => { if (!pick(e)) { clearFocus(); controls.target.set(0, 0, 0); } });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------- space news (Spaceflight News API) ----------------
const newsEl = $('news'), newsList = $('news-list'), newsBtn = $('news-btn');
let newsQuery = '', newsLoadedAt = 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  const d = Math.round(s / 86400);
  return d === 1 ? 'yesterday' : d < 30 ? d + ' days ago' : new Date(iso).toLocaleDateString();
}

async function loadNews(force = false) {
  const fresh = Date.now() - newsLoadedAt < 10 * 60 * 1000 && newsList.dataset.q === newsQuery;
  if (!force && fresh && newsList.children.length) return;
  newsList.innerHTML = '<div class="news-loading">Fetching the latest from orbit…</div>';
  try {
    const url = 'https://api.spaceflightnewsapi.net/v4/articles/?limit=25'
      + (newsQuery ? '&search=' + encodeURIComponent(newsQuery) : '');
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error('http ' + res.status);
    const data = await res.json();
    newsLoadedAt = Date.now();
    newsList.dataset.q = newsQuery;
    newsList.innerHTML = '';
    for (const a of data.results) {
      const card = document.createElement('a');
      card.className = 'news-card';
      card.href = a.url; card.target = '_blank'; card.rel = 'noopener';
      const summary = (a.summary || '').slice(0, 180);
      card.innerHTML =
        (a.image_url ? `<img loading="lazy" src="${esc(a.image_url)}" alt="">` : '') +
        `<div class="news-body">
          <h3>${esc(a.title)}</h3>
          <div class="news-meta">${esc(a.news_site)} · ${timeAgo(a.published_at)}</div>
          <p>${esc(summary)}${(a.summary || '').length > 180 ? '…' : ''}</p>
        </div>`;
      const img = card.querySelector('img');
      if (img) img.addEventListener('error', () => img.remove());
      newsList.appendChild(card);
    }
    if (!data.results.length) newsList.innerHTML = '<div class="news-loading">No articles found for this filter.</div>';
  } catch (e) {
    newsList.innerHTML = '<div class="news-loading">Couldn’t reach the news feed — check your connection and try again.</div>';
  }
}

newsBtn.addEventListener('click', () => {
  newsEl.classList.toggle('open');
  if (newsEl.classList.contains('open')) loadNews();
});
$('news-close').addEventListener('click', () => newsEl.classList.remove('open'));
document.querySelectorAll('#news-chips .chip').forEach(ch => {
  ch.addEventListener('click', () => {
    document.querySelectorAll('#news-chips .chip').forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    newsQuery = ch.dataset.q;
    loadNews(true);
  });
});
// keep the feed fresh while it's open
setInterval(() => { if (newsEl.classList.contains('open')) loadNews(true); }, 10 * 60 * 1000);

// ---------------- boot ----------------
updateCrumbs();
levels[0].group.visible = true;
controls.minDistance = levels[0].minDist;
controls.maxDistance = levels[0].maxDist;
camera.position.set(12, 10, 26);
controls.update();
document.getElementById('loading').classList.add('done');
showToast('Earth', 'Scroll to zoom out — all the way past the universe');
tick();

// the orbit-speed slider only applies to the solar system level
setInterval(() => {
  $('speed-wrap').classList.toggle('show', current === 1 && !transitioning);
}, 300);

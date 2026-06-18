// ============================================================
// Interactive Universe Map
// Five nested scales: Earth → Solar System → Milky Way →
// Local Group → Observable Universe.
// Scroll past the edge of each level to travel to the next.
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as DATA from './data.js';
import * as TEX from './textures.js';
import * as EXTRAS from './extras.js';
import { initFlight } from './flight.js';
import { initSearch } from './search.js';
import { initSound } from './sound.js';
import { initTimeline } from './timeline.js';
import { initPostcard } from './postcard.js';
import { initVideos } from './videos.js';
import { initGames } from './games.js';
import { initPostFX } from './postfx.js';
import { initUI } from './ui.js';
import { initTour } from './tour.js';

// module handles wired up at boot (guarded — events can fire early)
let techApi = null, flightApi = null, soundApi = null, searchApi = null;
let videosApi = null, gamesApi = null, timelineApi = null, postfxApi = null;

// "stand on the surface" mode (solar-system level)
const surfaceViews = {};   // info.id -> { mesh, radius, lookAt() }
let surfaceMode = false, surfaceSaved = null;

// search entries can be registered before the search UI boots
let searchQueue = [];
function addSearchEntry(e) {
  if (searchApi) searchApi.add(e);
  else if (searchQueue) searchQueue.push(e);
}

// ---------------- renderer / scene / camera ----------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03020c);

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
let openInfoId = null, lastInfo = null;
let autoSpin = false;

// ---- distance intelligence: light age + travel times, parsed from
// whatever distance the info panel already states ----
const C_KMS = 299792;
function fmtYears(y) {
  if (y < 1) return Math.round(y * 365.25).toLocaleString() + ' days';
  if (y < 1e4) return (y < 100 ? y.toFixed(1) : Math.round(y).toLocaleString()) + ' years';
  if (y < 1e6) return Math.round(y / 1000).toLocaleString() + ' thousand years';
  if (y < 1e9) return (y / 1e6).toFixed(1) + ' million years';
  if (y < 1e12) return (y / 1e9).toFixed(1) + ' billion years';
  return (y / 1e12).toFixed(1) + ' trillion years';
}
function fmtHours(h) {
  if (h < 2) return Math.round(h * 60) + ' minutes';
  if (h < 72) return h.toFixed(1) + ' hours';
  return fmtYears(h / 8766);
}
function infoDistanceKm(info) {
  if (info.ly) return info.ly * KM_PER_LY;
  if (info.km) return info.km;
  const rows = (info.stats || []).filter(([k]) => /distance|away|how far/i.test(k));
  const texts = [...rows.map(([, v]) => String(v)), String(info.subtitle || '')];
  for (const s of texts) {
    let m = s.match(/([\d,.]+)\s*(million|billion|thousand)?\s*light-years/i);
    if (m) {
      const mult = { million: 1e6, billion: 1e9, thousand: 1e3 }[(m[2] || '').toLowerCase()] || 1;
      return parseFloat(m[1].replace(/,/g, '')) * mult * KM_PER_LY;
    }
    m = s.match(/([\d,.]+)\s*AU\b/i);
    if (m) return parseFloat(m[1].replace(/,/g, '')) * KM_PER_AU;
    m = s.match(/([\d,.]+)\s*(million|billion)?\s*km/i);
    if (m) {
      const mult = { million: 1e6, billion: 1e9 }[(m[2] || '').toLowerCase()] || 1;
      return parseFloat(m[1].replace(/,/g, '')) * mult;
    }
  }
  return null;
}
function travelHtml(info) {
  const km = infoDistanceKm(info);
  if (!km || km < 1e5) return '';
  const lightH = km / C_KMS / 3600;
  const ly = km / KM_PER_LY;
  let html = `<div class="travel-head">🚀 Getting there from Earth (≈)</div><table>`;
  if (ly >= 0.001) {
    html += `<tr><td>The light you're seeing left it</td><td>${fmtYears(ly)} ago</td></tr>`;
  } else {
    html += `<tr><td>Light travel time</td><td>${fmtHours(lightH)}</td></tr>`;
  }
  html += `<tr><td>By car (100 km/h)</td><td>${fmtYears(km / 100 / 8766)}</td></tr>`;
  html += `<tr><td>By jet airliner (900 km/h)</td><td>${fmtYears(km / 900 / 8766)}</td></tr>`;
  html += `<tr><td>Fastest probe ever launched (58,500 km/h)</td><td>${fmtYears(km / 58500 / 8766)}</td></tr>`;
  html += `<tr><td>At the speed of light</td><td>${ly >= 0.001 ? fmtYears(ly) : fmtHours(lightH)}</td></tr></table>`;
  return html;
}

function showInfo(info) {
  openInfoId = info.id || null;
  lastInfo = info;
  let html = `<h2>${info.name}</h2>`;
  if (info.subtitle) html += `<div class="sub">${info.subtitle}</div>`;
  if (info.stats && info.stats.length) {
    html += '<table>' + info.stats.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('') + '</table>';
  }
  if (info.desc) html += `<p>${info.desc}</p>`;
  html += travelHtml(info);
  panelContent.innerHTML = html;
  // "stand on the surface" for solar-system worlds
  if (info.id && surfaceViews[info.id] && current === 1 && !surfaceMode) {
    const b = document.createElement('button');
    b.className = 'panel-act';
    b.textContent = '🧑‍🚀 Stand on the surface';
    b.addEventListener('click', () => enterSurface(info.id));
    panelContent.appendChild(b);
  }
  panel.classList.add('open');
  if (info.name && !techApi?.active()) {
    history.replaceState(null, '', '#o/' + encodeURIComponent(info.name));
  }
}
function closePanel() { panel.classList.remove('open'); openInfoId = null; }
$('panel-close').addEventListener('click', closePanel);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closePanel(); clearFocus();
    document.querySelectorAll('.drawer.open').forEach(closeDrawerEl);
    if (surfaceMode) exitSurface();
    if (timelineApi) timelineApi.close();
  }
});

// drawers are mutually exclusive on the left edge
function closeDrawerEl(d) {
  d.classList.remove('open');
  if (d.id === 'games' && gamesApi) gamesApi.stop();
  if (d.id === 'videos' && videosApi) videosApi.stopAll();
}
function openDrawer(el) {
  document.querySelectorAll('.drawer.open').forEach(d => { if (d !== el) closeDrawerEl(d); });
  el.classList.add('open');
}
document.querySelectorAll('.drawer-close').forEach(b =>
  b.addEventListener('click', () => closeDrawerEl(b.closest('.drawer'))));

let toastTimer = null;
function showToast(title, sub) {
  toast.innerHTML = `<b>${title}</b>${sub ? `<span>${sub}</span>` : ''}`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
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

// colourful nebula backdrop so deep space is never flat black
(function backdrop() {
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(9500, 32, 24),
    new THREE.MeshBasicMaterial({
      map: TEX.spaceBackdropTexture(), side: THREE.BackSide,
      transparent: true, opacity: 0.7, depthWrite: false }));
  dome.userData.noPick = true;
  dome.frustumCulled = false;
  scene.add(dome);
})();

scene.add(camera); // so camera-attached children render

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

function gotoLevel(i, zoomingOut = true, after = null) {
  if (i < 0 || i >= levels.length || i === current && levels[current].group.visible) return;
  transitioning = true;
  if (surfaceMode) exitSurface(true);
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
    if (soundApi) soundApi.setLevel(i);
    if (L.onEnter) L.onEnter();
    setTimeout(() => {
      fadeEl.classList.remove('on');
      transitioning = false;
      if (after) after();
    }, 80);
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
  if (transitioning || (techApi && techApi.active()) || (flightApi && flightApi.active()) || surfaceMode) return;
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
  if (transitioning || (techApi && techApi.active()) || (flightApi && flightApi.active())) return;
  const d = camera.position.distanceTo(controls.target) * factor;
  if (d > controls.maxDistance && current < levels.length - 1) { gotoLevel(current + 1, true); return; }
  if (d < controls.minDistance && current > 0) { gotoLevel(current - 1, false); return; }
  const dd = THREE.MathUtils.clamp(d, controls.minDistance, controls.maxDistance);
  camera.position.sub(controls.target).setLength(dd).add(controls.target);
}
$('zoom-in').addEventListener('click', () => dolly(0.55));
$('zoom-out').addEventListener('click', () => dolly(1.8));

// ---------------- About panel ----------------
function showAbout() {
  panelContent.innerHTML = `
    <h2>About</h2>
    <div class="sub">The maker &amp; the project</div>
    <p><b style="color:#fff">Universe Map</b> is an interactive, real-data journey from your back garden out to the edge of the observable universe — live satellites, every catalogued moon, every confirmed exoplanet, the cosmic web, and a cinematic tour through it all.</p>
    <h3>Made by Cooper Mitchell</h3>
    <p>I build interactive maps of the cosmos and the Earth — blending real astronomical &amp; live data with Three.js, WebGL and a lot of curiosity. Everything here is hand-built and free to explore.</p>
    <table>
      <tr><td>Built with</td><td>Three.js · WebGL · live orbital &amp; astronomical data</td></tr>
      <tr><td>Data</td><td>Real catalogues — satellites, exoplanets, galaxies &amp; more</td></tr>
      <tr><td>GitHub</td><td><a href="https://github.com/coopermitchell007-pixel" target="_blank" rel="noopener" style="color:#7adcff">@coopermitchell007-pixel ↗</a></td></tr>
    </table>
    <h3>My other projects</h3>
    <p><a href="https://disaster-map-roan.vercel.app/" target="_blank" rel="noopener" style="color:#7adcff">🌍 Disaster Map ↗</a><br>
    <span class="dim">A live map of real-time natural disasters on Earth.</span></p>
    <p class="dim">Thanks for exploring — drag, scroll and click anything.</p>`;
  panel.classList.add('open');
  openInfoId = 'about';
}
$('about-btn').addEventListener('click', showAbout);

// ---------------- "Other projects" dropdown ----------------
const projectsDd = $('projects-dd');
$('projects-btn').addEventListener('click', e => {
  e.stopPropagation();
  projectsDd.classList.toggle('open');
});
document.addEventListener('click', () => projectsDd.classList.remove('open'));

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
  const activePickables = (techApi && techApi.active()) ? techApi.pickables : levels[current].pickables;
  const hits = raycaster.intersectObjects(activePickables, true);
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
  if (moved > 6 || transitioning || (flightApi && flightApi.active())) return;
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

// ---------------- "stand on the surface" (solar system) ----------------
const surfaceExitBtn = $('surface-exit');
function enterSurface(id) {
  const sv = surfaceViews[id];
  if (!sv || surfaceMode) return;
  surfaceMode = true; // freezes solar-system orbital motion
  surfaceSaved = {
    pos: camera.position.clone(), target: controls.target.clone(),
    min: controls.minDistance, fov: camera.fov,
  };
  const meshW = sv.mesh.getWorldPosition(new THREE.Vector3());
  const lookW = sv.lookAt
    ? sv.lookAt.getWorldPosition(new THREE.Vector3())
    : new THREE.Vector3(0, 0, 0); // the Sun sits at the origin
  // stand on the hemisphere facing the spectacle, tilted so it hangs in the sky
  const toLook = lookW.clone().sub(meshW).normalize();
  const side = new THREE.Vector3().crossVectors(toLook, new THREE.Vector3(0, 1, 0)).normalize();
  if (side.lengthSq() < 0.01) side.set(1, 0, 0);
  const standDir = toLook.clone().applyAxisAngle(side, 0.45).normalize();
  camera.position.copy(meshW).addScaledVector(standDir, sv.radius * 1.12);
  controls.target.copy(lookW);
  controls.minDistance = 0.01;
  camera.fov = 70;
  camera.updateProjectionMatrix();
  controls.update();
  surfaceExitBtn.classList.add('on');
  closePanel();
  showToast('Standing on ' + (sv.name || id), 'Look up. Drag to gaze around — Esc to lift off');
}
function exitSurface(silent = false) {
  if (!surfaceMode) return;
  surfaceMode = false;
  surfaceExitBtn.classList.remove('on');
  if (surfaceSaved) {
    camera.position.copy(surfaceSaved.pos);
    controls.target.copy(surfaceSaved.target);
    controls.minDistance = surfaceSaved.min;
    camera.fov = surfaceSaved.fov;
    camera.updateProjectionMatrix();
    controls.update();
  }
  if (!silent) showToast('Back in orbit', '');
}
surfaceExitBtn.addEventListener('click', () => exitSurface());

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

  group.add(new THREE.AmbientLight(0x445066, 0.55));

  // earth + everything pinned to its surface rotates together
  const earthFixed = new THREE.Group();
  group.add(earthFixed);

  // real day/night terminator: the sun light rides inside the rotating
  // earth frame, positioned over the actual subsolar point right now
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
  earthFixed.add(sunLight);
  function updateSubsolar() {
    const now = new Date();
    const start = Date.UTC(now.getUTCFullYear(), 0, 0);
    const doy = (now.getTime() - start) / 86400000;
    const decl = 23.44 * Math.sin(2 * Math.PI * (doy - 81) / 365.24);
    const utcH = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    let lon = (12 - utcH) * 15;
    if (lon > 180) lon -= 360; if (lon < -180) lon += 360;
    sunLight.position.copy(latLonToVec3(decl, lon, 300));
  }
  updateSubsolar();
  setInterval(updateSubsolar, 60000);

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
  const MAX_SATS = 20000;
  let satPos = new Float32Array(0);
  let satCol = new Float32Array(0);
  let satIndexMap = new Int32Array(0); // draw index -> sats[] index
  const satGeom = new THREE.BufferGeometry();
  satGeom.setAttribute('position', new THREE.BufferAttribute(satPos, 3));
  satGeom.setDrawRange(0, 0);
  function allocSatBuffers() {
    // size the buffer exactly to the loaded list, so no dead (0,0,0)
    // points exist to swallow raycasts
    satPos = new Float32Array(sats.length * 3);
    satCol = new Float32Array(sats.length * 3);
    satIndexMap = new Int32Array(sats.length);
    satGeom.setAttribute('position', new THREE.BufferAttribute(satPos, 3));
    satGeom.setAttribute('color', new THREE.BufferAttribute(satCol, 3));
    satGeom.setDrawRange(0, 0);
    // fixed generous bounds (covers GEO) so picking works every frame
    satGeom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 120);
    primeSatellites();   // give every satellite a real position immediately
  }
  // colour by orbit class: LEO cyan, MEO gold, GEO orange, debris red
  const SAT_COLORS = [[0.55, 0.85, 1], [1, 0.85, 0.45], [1, 0.62, 0.42], [1, 0.45, 0.45]];
  function satClass(s) {
    if (/\bDEB\b/i.test(s.name)) return 3;
    return s.alt > 33000 ? 2 : s.alt > 2000 ? 1 : 0;
  }
  const satPoints = new THREE.Points(satGeom, new THREE.PointsMaterial({
    map: dotTex, vertexColors: true, size: 6, sizeAttenuation: false,
    transparent: true, depthWrite: false }));
  satPoints.frustumCulled = false;
  satPoints.userData.pickPriority = 2;
  earthFixed.add(satPoints);
  pickables.push(satPoints);

  let sats = [];          // { name, satrec | sim:{...}, lat, lon, alt, vel }
  let satsAreSimulated = false;

  satPoints.userData.pointInfos = (idx) => satInfoFor(sats[satIndexMap[idx]]);
  function satInfoFor(s) {
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
  }

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
    showToast('Showing a demo satellite set', "CelesTrak's live feed was unreachable (often a rate limit) — reload in a minute for the full ~15,800");
  }

  async function loadSatellites() {
    if (!window.satellite) { makeSimSats(); return; }
    // Cache the (large) TLE payload so refreshes don't re-hit CelesTrak — repeated
    // requests are the usual reason the live feed gets rate-limited to a fallback.
    const CACHE_KEY = 'umap_active_tle_v2', TTL = 6 * 3600 * 1000;
    let text = null;
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) { const o = JSON.parse(c); if (o && o.text && Date.now() - o.ts < TTL) text = o.text; }
    } catch (e) {}
    if (!text) {
      // Same-origin proxy first (no CORS, edge-cached); direct CelesTrak as a
      // backup in case the function isn't available.
      const sources = ['/api/satellites', 'https://celestrak.org/gp/query?GROUP=active&FORMAT=tle'];
      for (const src of sources) {
        try {
          const res = await fetch(src, { signal: AbortSignal.timeout(25000) });
          if (!res.ok) continue;
          const t = await res.text();
          if (t && t.length > 1000 && !t.includes('<html')) { text = t; break; }
        } catch (e) { /* try next source */ }
      }
      if (!text) { console.warn('CelesTrak unavailable, using simulated satellites'); makeSimSats(); return; }
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), text })); } catch (e) {}
    }
    try {
      const lines = text.split('\n').map(l => l.trimEnd()).filter(Boolean);
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
      showToast(`${sats.length.toLocaleString()} satellites tracked live`, 'Real CelesTrak orbits, coloured by altitude — LEO · MEO · GEO');
      // every tracked satellite becomes searchable
      for (const s of sats) {
        addSearchEntry({
          name: s.name, sub: DATA.classifySat(s.name).type, level: 0, dist: 9,
          getWorldPos: () => earthFixed.localToWorld(
            latLonToVec3(s.lat, s.lon, EARTH_R * (6371 + s.alt) / 6371)),
          info: () => satInfoFor(s),
        });
      }
    } catch (err) {
      console.warn('Satellite data unusable, using simulated set:', err);
      makeSimSats();
    }
  }
  loadSatellites();

  let lastSatUpdate = 0, satCursor = 0;
  const SAT_CHUNK = 2000;   // satellites re-propagated per update tick

  // Propagate one satellite into its fixed slot (si) in the buffers.
  // With ~11k live satellites we can't propagate them all every frame, so each
  // keeps a stable slot and we refresh a rolling chunk per tick (round-robin).
  function propagateOne(si, date, gmst, tsec) {
    const s = sats[si];
    let v = null;
    if (!satsAreSimulated && s.satrec && window.satellite) {
      const pv = window.satellite.propagate(s.satrec, date);
      if (pv && pv.position) {
        const geo = window.satellite.eciToGeodetic(pv.position, gmst);
        s.lat = THREE.MathUtils.radToDeg(geo.latitude);
        s.lon = THREE.MathUtils.radToDeg(geo.longitude);
        s.alt = geo.height;
        if (pv.velocity) s.vel = Math.hypot(pv.velocity.x, pv.velocity.y, pv.velocity.z);
        v = latLonToVec3(s.lat, s.lon, EARTH_R * (6371 + s.alt) / 6371);
      }
    } else if (s.sim) {
      const { alt, inc, raan, phase } = s.sim;
      const period = 5400 * Math.pow((6371 + alt) / 6791, 1.5);
      const a = phase + (tsec / period) * Math.PI * 2;
      const x = Math.cos(a), y = Math.sin(a) * Math.sin(inc), zz = Math.sin(a) * Math.cos(inc);
      const xr = x * Math.cos(raan) - zz * Math.sin(raan);
      const zr = x * Math.sin(raan) + zz * Math.cos(raan);
      s.lat = THREE.MathUtils.radToDeg(Math.asin(y));
      s.lon = THREE.MathUtils.radToDeg(Math.atan2(zr, xr)) - (tsec / 86400) * 360 % 360;
      s.alt = alt;
      v = latLonToVec3(s.lat, s.lon, EARTH_R * (6371 + alt) / 6371);
    }
    if (v) {
      satPos[si * 3] = v.x; satPos[si * 3 + 1] = v.y; satPos[si * 3 + 2] = v.z;
      const col = SAT_COLORS[satClass(s)];
      satCol[si * 3] = col[0]; satCol[si * 3 + 1] = col[1]; satCol[si * 3 + 2] = col[2];
    }
    satIndexMap[si] = si;
  }

  // One full pass so every satellite has a real position before it's drawn.
  function primeSatellites() {
    if (!sats.length) return;
    const date = new Date();
    const gmst = (!satsAreSimulated && window.satellite) ? window.satellite.gstime(date) : 0;
    const tsec = date.getTime() / 1000;
    for (let si = 0; si < sats.length; si++) propagateOne(si, date, gmst, tsec);
    satGeom.setDrawRange(0, sats.length);
    satGeom.attributes.position.needsUpdate = true;
    if (satGeom.attributes.color) satGeom.attributes.color.needsUpdate = true;
  }

  function updateSatellites(now) {
    if (!sats.length || now - lastSatUpdate < 120) return;
    lastSatUpdate = now;
    const date = new Date();
    const gmst = (!satsAreSimulated && window.satellite) ? window.satellite.gstime(date) : 0;
    const tsec = date.getTime() / 1000;
    const chunk = Math.min(sats.length, SAT_CHUNK);
    for (let k = 0; k < chunk; k++) propagateOne((satCursor + k) % sats.length, date, gmst, tsec);
    satCursor = (satCursor + chunk) % sats.length;
    satGeom.setDrawRange(0, sats.length);
    satGeom.attributes.position.needsUpdate = true;
    if (satGeom.attributes.color) satGeom.attributes.color.needsUpdate = true;
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

  // today's real close-approach asteroids (NASA NeoWs)
  const neoUpd = EXTRAS.addNEOs({
    group, pickables,
    registerSearch: e => addSearchEntry({ ...e, level: 0 }),
    onLoaded: n => showToast(`${n} asteroids passing Earth today`, 'Real close approaches from NASA — the grey/red dots out beyond the satellites'),
  });

  function animate(dt, t) {
    earthFixed.rotation.y += dt * (Math.PI * 2 / 600); // gentle visible rotation
    updateSatellites(performance.now());
    if (iss.visible) iss.position.lerp(issTarget, Math.min(1, dt * 1.5));
    const ma = t * 0.02;
    moon.position.set(Math.cos(ma) * 600, 0, Math.sin(ma) * 600);
    moon.rotation.y = -ma;
    neoUpd.update(dt);
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
    surfaceViews[p.id] = { mesh, radius: L.size, lookAt: null, name: p.name }; // lookAt set below

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
      surfaceViews[m.id] = { mesh: mm, radius: m.size, lookAt: mesh, name: m.name };
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

    // standing on a planet, the best thing in the sky is its biggest moon
    if (moonNodes.length) surfaceViews[p.id].lookAt = moonNodes[moonNodes.length - 1].mesh;

    planetNodes.push({ p, holder, mesh, moonNodes, phase: Math.random() * Math.PI * 2 });
  }

  // ---- the rovers working on Mars right now ----
  {
    const marsNode = planetNodes.find(n => n.p.id === 'mars');
    const ROVERS = [
      {
        name: 'Perseverance', lat: 18.44, lon: 77.45,
        sub: 'NASA rover — Jezero Crater',
        stats: [['Landed', '18 February 2021 — the "seven minutes of terror"'], ['Location', 'Jezero Crater, an ancient river delta'], ['Mission', 'Searching for signs of ancient microbial life'], ['Samples', 'Sealed tubes cached for a future return mission'], ['Sidekick', 'Carried Ingenuity — the first aircraft to fly on another world (72 flights)']],
        desc: `A nuclear-powered, car-sized field geologist exploring a dried-up river delta where water once flowed for millions of years. Perseverance drills rock cores and seals them in tubes for a future mission to fly home — the first round-trip cargo from another planet. It also carried Ingenuity, the little helicopter that was supposed to fly five times and managed seventy-two.`,
      },
      {
        name: 'Curiosity', lat: -4.59, lon: 137.44,
        sub: 'NASA rover — Gale Crater',
        stats: [['Landed', '6 August 2012'], ['Location', 'Gale Crater, climbing Mount Sharp'], ['Distance driven', '30+ km over a decade'], ['Key discovery', 'Gale was once a habitable lake'], ['Power', 'Plutonium — no dust storms can stop it']],
        desc: `Operating for over a decade and still climbing. Curiosity proved that Gale Crater held a long-lived freshwater lake with all the chemical ingredients of life. Every Martian day it beams home its findings, and once a year on its landing anniversary it hums "Happy Birthday" to itself with its sample-analysis vibrator — the loneliest birthday song in the Solar System.`,
      },
    ];
    for (const rv of ROVERS) {
      const marker = new THREE.Group();
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd76a }));
      const rg = new THREE.Sprite(new THREE.SpriteMaterial({
        map: TEX.glowTexture('rgba(255,215,106,1)'), transparent: true, depthWrite: false }));
      rg.scale.setScalar(0.8);
      rg.userData.noPick = true;
      const rl = TEX.makeLabel(rv.name, { size: 0.7, color: '#ffd76a' });
      rl.position.y = 0.6;
      marker.add(pin, rg, rl);
      marker.position.copy(latLonToVec3(rv.lat, rv.lon, marsNode.p.layout.size * 1.03));
      marker.userData.info = {
        id: 'rover-' + rv.name.toLowerCase(), name: rv.name + ' (rover)',
        subtitle: rv.sub, stats: rv.stats, desc: rv.desc,
      };
      marker.userData.pickPriority = 3;
      marker.userData.focusable = true;
      marker.userData.focusDist = 4;
      marsNode.mesh.add(marker);
      pickables.push(marker);
    }
  }

  // deep-space probes & comets
  const probesUpd = EXTRAS.addProbes({
    group, pickables,
    refreshIfOpen: inf => { if (openInfoId === inf.id) showInfo(inf); },
    registerSearch: e => addSearchEntry({ ...e, level: 1 }),
  });
  const cometsUpd = EXTRAS.addComets({
    group, pickables,
    getDaysPerSec: () => parseFloat(speedSlider.value) || 0.5,
    registerSearch: e => addSearchEntry({ ...e, level: 1 }),
  });

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
        // each catalogued moon is searchable
        list.forEach((m, idx) => addSearchEntry({
          name: m.n, sub: 'Moon of ' + node.p.name, level: 1, dist: 6,
          getWorldPos: () => pts.localToWorld(new THREE.Vector3(
            pos[idx * 3], pos[idx * 3 + 1], pos[idx * 3 + 2])),
          info: () => pts.userData.pointInfos(idx),
        }));
      }
    } catch (e) { console.warn('moons.json unavailable:', e); }
  })();

  function animate(dt) {
    if (surfaceMode) return; // the world stands still while you stand on it
    probesUpd.update(dt);
    cometsUpd.update(dt);
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
  const lensUpd = EXTRAS.addLensingRing({ parent: spin }); // photon ring + hot accretion disc
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
    // green halo = this star has known habitable-zone planets
    if (st.pl && /habitable/i.test(st.pl)) {
      const hz = new THREE.Mesh(
        new THREE.TorusGeometry(st.s * 0.75 + 1, 0.09, 8, 48),
        new THREE.MeshBasicMaterial({ color: 0x7aff9a, transparent: true, opacity: 0.55 }));
      hz.rotation.x = Math.PI / 2;
      hz.userData.noPick = true;
      node.add(hz);
      node.userData.info.stats = [...node.userData.info.stats,
        ['Green ring', 'Marks known habitable-zone planets']];
    }
    spin.add(node);
    pickables.push(node);
  });

  // famous nebulae & pulsars around the neighbourhood
  EXTRAS.addNebulae({
    spin, pickables, sunPos: sunMark.position, starDist,
    registerSearch: e => addSearchEntry({ ...e, level: 2 }),
  });
  const pulsarUpd = EXTRAS.addPulsars({
    spin, pickables, sunPos: sunMark.position, starDist,
    registerSearch: e => addSearchEntry({ ...e, level: 2 }),
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
      // every confirmed exoplanet is searchable by name
      for (let i = 0; i < rows.length; i++) {
        const idx = i;
        addSearchEntry({
          name: rows[idx].pl_name, sub: 'Exoplanet — orbits ' + rows[idx].hostname, level: 2, dist: 7,
          getWorldPos: () => pts.localToWorld(new THREE.Vector3(
            pos[idx * 3], pos[idx * 3 + 1], pos[idx * 3 + 2])),
          info: () => pts.userData.pointInfos(idx),
        });
      }
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
    pulsarUpd.update(dt);
    lensUpd.update(dt);
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

  // the most violent events ever recorded, rippling outward
  const eventsUpd = EXTRAS.addCosmicEvents({
    spin, pickables,
    positions: [shuffled[10 % shuffled.length], shuffled[12 % shuffled.length], shuffled[14 % shuffled.length]],
    registerSearch: e => addSearchEntry({ ...e, level: 4 }),
  });

  // CMB shell — the edge of the visible universe
  const cmb = new THREE.Mesh(
    new THREE.SphereGeometry(420, 48, 32),
    new THREE.MeshBasicMaterial({ map: TEX.cmbTexture(), side: THREE.BackSide, transparent: true, opacity: 0.5 }));
  cmb.userData.info = DATA.CMB_INFO;
  group.add(cmb);
  pickables.push(cmb);

  function animate(dt) { spin.rotation.y += dt * 0.004; eventsUpd.update(dt); }
  return { group, pickables, minDist: 60, maxDist: 1300, enterDist: 400, animate,
    onEnter() { showToast('The Observable Universe', 'Keep zooming out to leave it…'); } };
})();
registerLevel(universeLevel);

// ---------------- main loop ----------------
let scaleTimer = 0;
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;

  const L = levels[current];
  if (L.animate && L.group.visible) L.animate(dt, t);
  if (techApi) techApi.update(dt);

  if (flightApi && flightApi.active()) {
    // flight mode owns the camera — OrbitControls must not touch it
    flightApi.update(dt);
  } else {
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
    // cinematic auto-spin (settings toggle) — slow orbit when idle-ish
    if (autoSpin && !focusObj && !surfaceMode && !transitioning &&
        !(techApi && techApi.active()) && !(tourApi && tourApi.active())) {
      const off = camera.position.clone().sub(controls.target);
      off.applyAxisAngle(new THREE.Vector3(0, 1, 0), dt * 0.12);
      camera.position.copy(controls.target).add(off);
    }
    controls.update();
  }

  // scale bar
  scaleTimer += dt;
  if (scaleTimer > 0.25) {
    scaleTimer = 0;
    if (techApi && techApi.active()) {
      scalebar.textContent = "⚡ Tech Map — humanity's next machines";
    } else {
      const meta = DATA.LEVEL_META[current];
      if (meta.kmPerUnit > 0) {
        const d = camera.position.distanceTo(controls.target);
        scalebar.textContent = `Field of view ≈ ${formatDistance(d * meta.kmPerUnit * 1.2)}`;
      } else {
        scalebar.textContent = 'Beyond the observable universe — scale unknowable';
      }
    }
  }

  if (postfxApi) postfxApi.render(); else renderer.render(scene, camera);
}

// double-click empty space to release focus
renderer.domElement.addEventListener('dblclick', e => { if (!pick(e)) { clearFocus(); controls.target.set(0, 0, 0); } });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (postfxApi) postfxApi.setSize(window.innerWidth, window.innerHeight);
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
  if (newsEl.classList.contains('open')) { newsEl.classList.remove('open'); return; }
  openDrawer(newsEl);
  loadNews();
});
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

// ---------------- search: index everything & navigate ----------------
function navigateTo(e) {
  if (e.action) { e.action(); return; } // custom destinations (tech map nodes)
  if (techApi && techApi.active()) techApi.exit();
  if (flightApi && flightApi.active()) flightApi.exit();
  if (surfaceMode) exitSurface(true);
  const go = () => {
    const info = typeof e.info === 'function' ? e.info() : (e.info || (e.obj && e.obj.userData.info));
    const p = e.getWorldPos ? e.getWorldPos() : null;
    if (p) {
      clearFocus();
      controls.target.copy(p);
      const d = THREE.MathUtils.clamp(
        e.dist || controls.minDistance * 3, controls.minDistance, controls.maxDistance);
      const dir = camera.position.clone().sub(p);
      if (dir.lengthSq() < 0.001) dir.set(0.4, 0.3, 1);
      dir.normalize();
      camera.position.copy(p).addScaledVector(dir, d);
      controls.update();
      if (e.obj && e.obj.userData.focusable) setFocus(e.obj, e.obj.userData.focusDist || d);
    }
    if (info) showInfo(info);
  };
  if (current !== e.level) gotoLevel(e.level, e.level > current, go);
  else go();
}

// walk every level for named objects (point clouds register their own entries)
(function buildStaticIndex() {
  const seen = new Set();
  levels.forEach((L, li) => {
    L.group.traverse(o => {
      const info = o.userData && o.userData.info;
      if (!info || !info.name) return;
      const key = info.id || info.name;
      if (seen.has(key)) return;
      seen.add(key);
      addSearchEntry({
        name: info.name, sub: info.subtitle || '', level: li, obj: o,
        getWorldPos: () => o.getWorldPosition(new THREE.Vector3()),
        dist: o.userData.focusDist || null,
        info,
      });
    });
  });
  DATA.LEVEL_META.forEach((m, i) => addSearchEntry({
    name: m.name, sub: m.tagline, level: i, getWorldPos: null, info: null }));
})();

searchApi = initSearch({
  input: $('search'),
  resultsEl: $('search-results'),
  navigate: navigateTo,
});
searchQueue.forEach(e => searchApi.add(e));
searchQueue = null;

// named, individually-placed objects in the current level make good
// flight targets (planets, moons, the ISS, stars, probes…). Big point
// clouds and decorative sprites are skipped.
function collectFlightTargets() {
  const out = [];
  const seen = new Set();
  for (const o of levels[current].pickables) {
    const info = o.userData && o.userData.info;
    if (!info || !info.name || o.isPoints) continue;
    if (seen.has(info.name)) continue;
    seen.add(info.name);
    out.push({ name: info.name, getPos: () => o.getWorldPosition(new THREE.Vector3()) });
  }
  return out;
}

// ---------------- flight / sound / timeline / postcard ----------------
flightApi = initFlight({
  camera, controls, renderer,
  getLevelBounds: () => ({ minDist: controls.minDistance, maxDist: controls.maxDistance }),
  getLevelMeta: () => DATA.LEVEL_META[current],
  getTargets: collectFlightTargets,
  // solid planets/moons you can physically land on (solar-system level only)
  getLandables: () => current === 1
    ? Object.values(surfaceViews).map(sv => ({
        name: sv.name,
        radius: sv.radius,
        getPos: () => sv.mesh.getWorldPosition(new THREE.Vector3()),
      }))
    : [],
  crossLevel: dir => {
    const ni = current + dir;
    if (ni < 0 || ni >= levels.length || transitioning || (techApi && techApi.active())) return false;
    gotoLevel(ni, dir > 0);
    return true;
  },
  showToast,
});

soundApi = initSound($('sound-btn'));

timelineApi = initTimeline({
  panel: $('timeline'), slider: $('tl-slider'), card: $('tl-card'),
  btn: $('timeline-btn'), closeBtn: $('tl-close'),
});

initPostcard({
  btn: $('postcard-btn'), renderer, scene, camera,
  render: () => { if (postfxApi) postfxApi.render(); else renderer.render(scene, camera); },
  getCaption: () => ({
    title: (lastInfo && lastInfo.name) ||
      (techApi.active() ? 'The Tech Map' : DATA.LEVEL_META[current].name),
    sub: (lastInfo && lastInfo.subtitle) || DATA.LEVEL_META[current].tagline,
  }),
  showToast,
});

// ---------------- videos & games drawers ----------------
videosApi = initVideos({ drawer: $('videos'), listEl: $('videos-list'), openDrawer });
$('videos-btn').addEventListener('click', () => {
  if ($('videos').classList.contains('open')) closeDrawerEl($('videos'));
  else videosApi.open(techApi.active() ? 'tech' : undefined);
});

gamesApi = initGames({
  drawer: $('games'), chipsEl: $('games-chips'), stageEl: $('game-stage'),
  infoEl: $('game-info'), scoreEl: $('game-score'), openDrawer,
});
$('games-btn').addEventListener('click', () => {
  if ($('games').classList.contains('open')) closeDrawerEl($('games'));
  else gamesApi.open();
});

// ---------------- tech map (removed) ----------------
// The Tech Map view was retired. techApi is kept as an inert, always-inactive
// stub so the rest of the app's `techApi.*` calls remain safe no-ops.
techApi = { active: () => false, update() {}, exit() {}, enter() {}, toggle() {}, pickables: [] };

// ---------------- boot ----------------
updateCrumbs();
levels[0].group.visible = true;
controls.minDistance = levels[0].minDist;
controls.maxDistance = levels[0].maxDist;
camera.position.set(12, 10, 26);
controls.update();
// ---------------- guided tour, settings, help, bookmarks ----------------
// These are all optional polish — if any of them throws (or a CDN module
// is unavailable) the core map must still boot, so they're wrapped.
let tourApi = null;
try {
  postfxApi = initPostFX({ renderer, scene, camera });
  tourApi = initTour({ gotoLevel, camera, controls, showToast });
  initUI({
    postfx: postfxApi,
    startTour: () => tourApi && tourApi.start(),
    showToast,
    getView: () => ({
      level: current, label: DATA.LEVEL_META[current].name,
      pos: camera.position.toArray(), target: controls.target.toArray(),
    }),
    setView: v => {
      if (techApi.active()) techApi.exit();
      if (flightApi.active()) flightApi.exit();
      const apply = () => {
        clearFocus();
        camera.position.fromArray(v.pos);
        controls.target.fromArray(v.target);
        controls.update();
      };
      if (current !== v.level) gotoLevel(v.level, v.level > current, apply); else apply();
    },
    onAutoSpin: on => { autoSpin = on; },
    onRandom: () => {
      const e = searchApi && searchApi.random();
      if (e) navigateTo(e); else showToast('Nothing to fly to yet', 'Give the data a moment to load');
    },
  });
} catch (e) {
  console.warn('Optional UI subsystem failed to start (map still runs):', e);
}

// keyboard shortcuts: number keys jump scales, P/M for postcard & sound
window.addEventListener('keydown', e => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (document.body.classList.contains('flight') || (techApi && techApi.active())) return;
  if (e.code >= 'Digit1' && e.code <= 'Digit5') {
    const i = parseInt(e.code.slice(5), 10) - 1;
    if (i !== current && !transitioning) gotoLevel(i, i > current);
  } else if (e.code === 'KeyP') $('postcard-btn').click();
  else if (e.code === 'KeyM') $('sound-btn').click();
});

document.getElementById('loading').classList.add('done');
showToast('Earth', 'Scroll to zoom out — all the way to the edge of the universe');
tick();

// deep-link: #o/<object name> jumps straight to that object once data has loaded
setTimeout(() => {
  const m = location.hash.match(/^#o\/(.+)$/);
  if (m && searchApi) {
    const e = searchApi.findExact(decodeURIComponent(m[1]));
    if (e) navigateTo(e);
  }
}, 2400);

// level-dependent HUD elements
setInterval(() => {
  const techOn = techApi && techApi.active();
  $('speed-wrap').classList.toggle('show', current === 1 && !transitioning && !techOn && !surfaceMode);
  $('satlegend').classList.toggle('show', current === 0 && !transitioning && !techOn);
}, 300);

// ============================================================
// Flight mode — pick a ship and free-fly through every level.
// Pointer-lock mouse look + WASD/RF, Shift to boost, wheel to
// trim throttle. Crossing a level boundary flies you into the
// next scale, just like scrolling does.
// ============================================================
import * as THREE from 'three';

const SHIPS = [
  {
    id: 'shuttle', name: 'Orbital Shuttle', icon: '🛰', mult: 0.45, drag: 3.2, hue: '#9fd0ff',
    blurb: 'Steady and forgiving. Perfect for sightseeing around Earth and the ISS.',
  },
  {
    id: 'falcon', name: 'Falcon Courier', icon: '🚀', mult: 1.4, drag: 2.4, hue: '#ffd76a',
    blurb: 'A quick interplanetary hop-ship. Comfortable cruising between planets.',
  },
  {
    id: 'ion', name: 'Ion Clipper', icon: '☄️', mult: 4.5, drag: 1.1, hue: '#7aff9a',
    blurb: 'Huge speed, long glide — it drifts like it has no brakes, because it barely does.',
  },
  {
    id: 'warp', name: 'Warp Skiff', icon: '🌀', mult: 14, drag: 2.8, hue: '#d8a8ff',
    blurb: 'Physics-insulting speed for crossing galaxies. Hold Shift and hold on.',
  },
];

const KM_PER_AU = 1.496e8, KM_PER_LY = 9.461e12;
function fmtSpeed(kmPerSec) {
  const c = 299792;
  if (kmPerSec < 20000) return Math.round(kmPerSec).toLocaleString() + ' km/s';
  if (kmPerSec < c * 10) return (kmPerSec / c).toFixed(1) + ' × light speed';
  if (kmPerSec < KM_PER_AU * 50) return (kmPerSec / KM_PER_AU).toFixed(1) + ' AU/s';
  if (kmPerSec < KM_PER_LY * 1e4) return (kmPerSec / KM_PER_LY).toFixed(1) + ' ly/s';
  return (kmPerSec / KM_PER_LY / 1e6).toFixed(1) + ' million ly/s';
}

export function initFlight(ctx) {
  const { camera, controls, renderer, getLevelBounds, getLevelMeta, crossLevel, showToast } = ctx;
  const hud = document.getElementById('flight-hud');
  const cross = document.getElementById('crosshair');
  const selectEl = document.getElementById('ship-select');
  const btn = document.getElementById('flight-btn');

  let active = false, ship = SHIPS[0], throttle = 1;
  const vel = new THREE.Vector3();
  const keys = {};
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');

  // ship cards
  const grid = selectEl.querySelector('#ship-grid');
  SHIPS.forEach(s => {
    const card = document.createElement('button');
    card.className = 'ship-card';
    card.style.setProperty('--hue', s.hue);
    card.innerHTML = `<div class="ship-icon">${s.icon}</div><h3>${s.name}</h3>
      <div class="ship-speed">${'▮'.repeat(Math.min(5, Math.ceil(Math.log2(s.mult * 3))))}${'▯'.repeat(Math.max(0, 5 - Math.ceil(Math.log2(s.mult * 3))))} speed</div>
      <p>${s.blurb}</p>`;
    card.addEventListener('click', () => { ship = s; selectEl.classList.remove('open'); engage(); });
    grid.appendChild(card);
  });
  selectEl.querySelector('#ship-cancel').addEventListener('click', () => selectEl.classList.remove('open'));

  function engage() {
    active = true;
    vel.set(0, 0, 0);
    throttle = 1;
    euler.setFromQuaternion(camera.quaternion);
    euler.z = 0;
    camera.quaternion.setFromEuler(euler);
    controls.enabled = false;
    // pointer lock can be refused (iframes, headless, some browsers) —
    // drag-to-look still works without it
    try {
      const p = renderer.domElement.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* fall back to drag-look */ }
    hud.classList.add('on');
    hud.style.setProperty('--hue', ship.hue);
    cross.classList.add('on');
    document.body.classList.add('flight');
    showToast('Flight mode — ' + ship.name, 'WASD to fly · R/F up & down · Shift boost · scroll = throttle · Esc to exit');
  }

  function disengage() {
    if (!active) return;
    active = false;
    controls.enabled = true;
    controls.target.copy(camera.position).addScaledVector(
      new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion),
      Math.max(camera.position.length() * 0.4, controls.minDistance * 2));
    hud.classList.remove('on');
    cross.classList.remove('on');
    document.body.classList.remove('flight');
    if (document.pointerLockElement) document.exitPointerLock();
  }

  btn.addEventListener('click', () => {
    if (active) { disengage(); return; }
    selectEl.classList.toggle('open');
  });

  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement && active) disengage();
  });

  let dragLook = false;
  renderer.domElement.addEventListener('pointerdown', () => { dragLook = true; });
  window.addEventListener('pointerup', () => { dragLook = false; });
  document.addEventListener('mousemove', e => {
    if (!active) return;
    if (!document.pointerLockElement && !dragLook) return; // no lock → drag to look
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= e.movementX * 0.0021;
    euler.x -= e.movementY * 0.0021;
    euler.x = Math.max(-1.55, Math.min(1.55, euler.x));
    euler.z = 0;
    camera.quaternion.setFromEuler(euler);
  });

  window.addEventListener('keydown', e => {
    if (!active) return;
    if (e.code === 'Escape') { disengage(); return; }
    keys[e.code] = true;
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  renderer.domElement.addEventListener('wheel', e => {
    if (!active) return;
    throttle = THREE.MathUtils.clamp(throttle * (e.deltaY > 0 ? 0.88 : 1.14), 0.15, 6);
  }, { passive: true });

  const fwd = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  let hudTimer = 0, edgeCooldown = 0;

  function update(dt) {
    if (!active) return;
    const { minDist, maxDist } = getLevelBounds();
    const base = (maxDist - minDist) * 0.06 * ship.mult * throttle;
    const boost = keys.ShiftLeft || keys.ShiftRight ? 3.5 : 1;
    fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const acc = base * 3.2 * boost;
    if (keys.KeyW || keys.ArrowUp) vel.addScaledVector(fwd, acc * dt);
    if (keys.KeyS || keys.ArrowDown) vel.addScaledVector(fwd, -acc * dt);
    if (keys.KeyA || keys.ArrowLeft) vel.addScaledVector(right, -acc * dt);
    if (keys.KeyD || keys.ArrowRight) vel.addScaledVector(right, acc * dt);
    if (keys.KeyR || keys.Space) vel.addScaledVector(up, acc * dt);
    if (keys.KeyF) vel.addScaledVector(up, -acc * dt);
    const vmax = base * boost;
    if (vel.length() > vmax) vel.setLength(vmax);
    vel.multiplyScalar(Math.max(0, 1 - ship.drag * dt));
    camera.position.addScaledVector(vel, dt);

    // crossing the edge of the level flies you to the next scale
    edgeCooldown -= dt;
    const r = camera.position.length();
    if (edgeCooldown <= 0) {
      if (r > maxDist * 0.99) { if (crossLevel(1)) { vel.multiplyScalar(0.2); edgeCooldown = 1.5; } }
      else if (r < minDist * 1.02) { if (crossLevel(-1)) { vel.multiplyScalar(0.2); edgeCooldown = 1.5; } }
    }

    hudTimer += dt;
    if (hudTimer > 0.15) {
      hudTimer = 0;
      const meta = getLevelMeta();
      const kmps = vel.length() * (meta.kmPerUnit || 0);
      hud.innerHTML = `<b>${ship.icon} ${ship.name}</b>
        <span>${meta.kmPerUnit ? fmtSpeed(kmps) : 'speed unknowable'}</span>
        <span class="dim">throttle ${(throttle * 100 | 0)}% · ${meta.name} · Esc to exit</span>`;
    }
  }

  return { update, active: () => active, exit: disengage };
}

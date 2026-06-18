// ============================================================
// Flight mode — a real cockpit with Newtonian 6-DOF physics.
//
// Mouse steers (pitch + yaw). W/S throttle, A/D roll, Q/E lateral
// strafe, R/F vertical strafe, Shift afterburner (burns fuel),
// X cuts the engines / full brake, Z toggles inertial dampeners.
// With dampeners ON it flies like an atmospheric craft (auto-
// levelling rates, velocity bleeds toward your nose). OFF, it's
// pure momentum — you drift and tumble like a real spacecraft.
//
// The cockpit overlay shows an attitude indicator (artificial
// horizon), throttle, speedometer (km/s → Mach → %c), G-meter,
// heading tape, fuel, nearest-body scanner, target lock with a
// hold-to-fly autopilot, prograde/retrograde markers and warning
// lamps. Crossing a level edge flies you into the next scale.
// ============================================================
import * as THREE from 'three';

const SHIPS = [
  {
    id: 'shuttle', name: 'Orbital Shuttle', icon: '🛰', hue: '#9fd0ff',
    accel: 0.5, turn: 1.5, vmax: 0.06, ab: 2.2, damp: 2.6, fuel: 9,
    blurb: 'Forgiving and stable. Strong dampeners, gentle handling — ideal for learning to fly and sightseeing around Earth.',
  },
  {
    id: 'falcon', name: 'Falcon Courier', icon: '🚀', hue: '#ffd76a',
    accel: 1.1, turn: 2.1, vmax: 0.14, ab: 3, damp: 2.0, fuel: 11,
    blurb: 'A balanced interplanetary hot-rod. Quick to turn, quick to stop, deep afterburner tank.',
  },
  {
    id: 'ion', name: 'Ion Clipper', icon: '☄️', hue: '#7aff9a',
    accel: 2.4, turn: 1.4, vmax: 0.4, ab: 3.5, damp: 0.7, fuel: 14,
    blurb: 'Enormous top speed, weak dampeners, long glide. Drifts like it has no brakes — because it nearly doesn\'t. For pilots.',
  },
  {
    id: 'warp', name: 'Warp Skiff', icon: '🌀', hue: '#d8a8ff',
    accel: 6, turn: 2.4, vmax: 1.3, ab: 4, damp: 1.6, fuel: 20,
    blurb: 'Physics-insulting thrust for crossing galaxies. Hold the afterburner and watch the stars turn to streaks.',
  },
];

const KM_PER_AU = 1.496e8, KM_PER_LY = 9.461e12, C_KMS = 299792;
function fmtSpeed(kmPerSec) {
  if (kmPerSec < 0.01) return (kmPerSec * 1000).toFixed(0) + ' m/s';
  if (kmPerSec < 20000) return kmPerSec.toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' km/s';
  if (kmPerSec < C_KMS * 10) return (kmPerSec / C_KMS).toFixed(2) + ' c';
  if (kmPerSec < KM_PER_AU * 50) return (kmPerSec / KM_PER_AU).toFixed(1) + ' AU/s';
  if (kmPerSec < KM_PER_LY * 1e4) return (kmPerSec / KM_PER_LY).toFixed(1) + ' ly/s';
  return (kmPerSec / KM_PER_LY / 1e6).toFixed(1) + ' Mly/s';
}

export function initFlight(ctx) {
  const {
    camera, controls, renderer, getLevelBounds, getLevelMeta,
    crossLevel, showToast, getTargets, getLandables,
  } = ctx;
  const selectEl = document.getElementById('ship-select');
  const btn = document.getElementById('flight-btn');
  const cockpit = document.getElementById('cockpit');
  buildCockpit(cockpit);

  const el = id => cockpit.querySelector(id);
  const adiBall = el('#adi-ball'), thrFill = el('#thr-fill'), fuelFill = el('#fuel-fill');
  const spdVal = el('#spd-val'), spdSub = el('#spd-sub'), gVal = el('#g-val');
  const hdgTape = el('#hdg-tape'), hdgVal = el('#hdg-val');
  const tgtName = el('#tgt-name'), tgtDist = el('#tgt-dist'), shipName = el('#cp-ship');
  const lampProx = el('#lamp-prox'), lampFuel = el('#lamp-fuel'), lampDamp = el('#lamp-damp'),
        lampAb = el('#lamp-ab'), lampAuto = el('#lamp-auto');
  const proMark = el('#pro-mark'), retMark = el('#ret-mark'), tgtMark = el('#tgt-mark');
  const altVal = el('#alt-val');

  let active = false, ship = SHIPS[0], throttle = 0;
  const vel = new THREE.Vector3();
  const prevVel = new THREE.Vector3();
  let pitchRate = 0, yawRate = 0, rollRate = 0;
  let dampeners = true, afterburner = false, fuel = ship.fuel, autopilot = false;
  let target = null, targetList = [], targetIdx = -1;
  let mouseDX = 0, mouseDY = 0, shake = 0, gMeter = 0;
  let landed = null, nearAlt = null, landCooldown = 0;   // physical touchdown state
  const landNormal = new THREE.Vector3();
  const keys = {};

  // ---- ship selection cards ----
  const grid = selectEl.querySelector('#ship-grid');
  grid.innerHTML = '';
  SHIPS.forEach(s => {
    const card = document.createElement('button');
    card.className = 'ship-card';
    card.style.setProperty('--hue', s.hue);
    const bars = Math.min(5, Math.max(1, Math.round(Math.log2(s.vmax * 40 + 1))));
    card.innerHTML = `<div class="ship-icon">${s.icon}</div><h3>${s.name}</h3>
      <div class="ship-speed">${'▮'.repeat(bars)}${'▯'.repeat(5 - bars)} speed</div>
      <p>${s.blurb}</p>`;
    card.addEventListener('click', () => { ship = s; fuel = s.fuel; selectEl.classList.remove('open'); engage(); });
    grid.appendChild(card);
  });
  selectEl.querySelector('#ship-cancel').addEventListener('click', () => selectEl.classList.remove('open'));

  // ---- engage / disengage ----
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  function engage() {
    active = true;
    vel.set(0, 0, 0); prevVel.set(0, 0, 0);
    landed = null; landCooldown = 0;
    pitchRate = yawRate = rollRate = 0;
    throttle = 0; afterburner = false; autopilot = false;
    euler.setFromQuaternion(camera.quaternion); euler.z = 0;
    camera.quaternion.setFromEuler(euler);
    controls.enabled = false;
    try { const p = renderer.domElement.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
    cockpit.classList.add('on');
    cockpit.style.setProperty('--hue', ship.hue);
    shipName.textContent = ship.icon + ' ' + ship.name;
    document.body.classList.add('flight');
    refreshTargets();
    showToast('Flight — ' + ship.name, 'Mouse steer · W/S throttle · A/D roll · Q/E/R/F strafe · Shift boost · Z dampeners · X brake');
  }

  function disengage() {
    if (!active) return;
    active = false; autopilot = false; landed = null;
    controls.enabled = true;
    controls.target.copy(camera.position).addScaledVector(
      new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion),
      Math.max(camera.position.length() * 0.4, controls.minDistance * 2));
    cockpit.classList.remove('on', 'warp', 'shaking');
    document.body.classList.remove('flight');
    if (document.pointerLockElement) document.exitPointerLock();
  }

  btn.addEventListener('click', () => { if (active) disengage(); else selectEl.classList.toggle('open'); });
  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement && active && !dragLook) { /* keep flying with drag-look */ }
  });

  // ---- look input (pointer lock OR drag) ----
  let dragLook = false;
  renderer.domElement.addEventListener('pointerdown', () => { if (active) dragLook = true; });
  window.addEventListener('pointerup', () => { dragLook = false; });
  document.addEventListener('mousemove', e => {
    if (!active) return;
    if (!document.pointerLockElement && !dragLook) return;
    mouseDX += e.movementX; mouseDY += e.movementY;
  });

  window.addEventListener('keydown', e => {
    if (!active) return;
    if (e.code === 'Escape') { disengage(); return; }
    if (e.code === 'KeyZ') { dampeners = !dampeners; flash(lampDamp, dampeners); showToast(dampeners ? 'Inertial dampeners ON' : 'Inertial dampeners OFF', dampeners ? 'Auto-levelling · velocity bleeds to your heading' : 'Pure Newtonian drift — you keep your momentum'); }
    if (e.code === 'KeyX') { throttle = 0; if (dampeners) vel.multiplyScalar(0.05); }
    if (e.code === 'Tab') { e.preventDefault(); cycleTarget(); }
    if (e.code === 'KeyG') { autopilot = target ? !autopilot : false; flash(lampAuto, autopilot); if (autopilot) showToast('Autopilot engaged', 'Flying to ' + (target ? target.name : '—')); }
    keys[e.code] = true;
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  renderer.domElement.addEventListener('wheel', e => {
    if (!active) return;
    throttle = THREE.MathUtils.clamp(throttle + (e.deltaY > 0 ? -0.08 : 0.08), 0, 1);
  }, { passive: true });

  // ---- targets / autopilot ----
  function refreshTargets() { targetList = (getTargets ? getTargets() : []) || []; }
  function cycleTarget() {
    refreshTargets();
    if (!targetList.length) { showToast('No targets in range', ''); return; }
    // sort by distance, step through nearest first
    const sorted = targetList
      .map(t => ({ t, d: camera.position.distanceTo(t.getPos()) }))
      .sort((a, b) => a.d - b.d);
    targetIdx = (targetIdx + 1) % sorted.length;
    target = sorted[targetIdx].t;
    showToast('🎯 Target: ' + target.name, 'Press G to autopilot · Tab for next');
  }

  function flash(lamp, on) { lamp.classList.toggle('on', !!on); }

  // ---- physics integration ----
  const fwd = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();
  const dq = new THREE.Quaternion(), de = new THREE.Euler(0, 0, 0, 'XYZ');
  const worldUp = new THREE.Vector3(0, 1, 0);
  let edgeCooldown = 0, hudTimer = 0;

  function update(dt) {
    if (!active) return;
    const { minDist, maxDist } = getLevelBounds();
    const unit = (maxDist - minDist);
    const baseAccel = unit * 0.05 * ship.accel;
    const vmax = unit * ship.vmax * (afterburner ? ship.ab : 1);

    // throttle hold via W/S
    if (keys.KeyW || keys.ArrowUp) throttle = Math.min(1, throttle + dt * 0.8);
    if (keys.KeyS || keys.ArrowDown) throttle = Math.max(0, throttle - dt * 0.8);

    // afterburner (Shift / Space) — needs fuel
    const wantAB = (keys.ShiftLeft || keys.ShiftRight || keys.Space) && fuel > 0;
    afterburner = wantAB;
    if (afterburner) { fuel = Math.max(0, fuel - dt); }
    else fuel = Math.min(ship.fuel, fuel + dt * 0.4);
    flash(lampAb, afterburner);
    flash(lampFuel, fuel < ship.fuel * 0.2);

    camera.getWorldDirection(fwd);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);

    // ---- rotation ----
    const turn = ship.turn;
    if (autopilot && target) {
      autoFly(dt, baseAccel);
    } else {
      const sens = 0.00035 * turn * 4;
      yawRate += -mouseDX * sens;
      pitchRate += -mouseDY * sens;
      mouseDX = mouseDY = 0;
      // arrow / key steering as an alternative to the mouse
      if (keys.KeyA) rollRate += turn * 1.4 * dt;
      if (keys.KeyD) rollRate -= turn * 1.4 * dt;
    }
    // dampeners auto-level the rotation rates
    if (dampeners && !autopilot) {
      const k = Math.min(1, dt * 6);
      pitchRate *= (1 - k); yawRate *= (1 - k); rollRate *= (1 - k);
    }
    // clamp rates
    const rmax = turn * 1.6;
    pitchRate = THREE.MathUtils.clamp(pitchRate, -rmax, rmax);
    yawRate = THREE.MathUtils.clamp(yawRate, -rmax, rmax);
    rollRate = THREE.MathUtils.clamp(rollRate, -rmax, rmax);
    de.set(pitchRate * dt, yawRate * dt, rollRate * dt, 'XYZ');
    dq.setFromEuler(de);
    camera.quaternion.multiply(dq);

    // ---- translation ----
    const accel = baseAccel * (afterburner ? ship.ab : 1);
    if (!autopilot) {
      if (throttle > 0) vel.addScaledVector(fwd, accel * throttle * dt);
      if (keys.KeyQ) vel.addScaledVector(right, -accel * 0.6 * dt);
      if (keys.KeyE) vel.addScaledVector(right, accel * 0.6 * dt);
      if (keys.KeyR) vel.addScaledVector(up, accel * 0.6 * dt);
      if (keys.KeyF) vel.addScaledVector(up, -accel * 0.6 * dt);
    }

    // inertial dampeners: bleed sideways/residual velocity toward the nose,
    // and bring the ship to rest when there's no throttle
    if (dampeners) {
      const along = fwd.clone().multiplyScalar(vel.dot(fwd));
      const lateral = vel.clone().sub(along);
      vel.addScaledVector(lateral, -Math.min(1, dt * ship.damp));
      if (throttle < 0.02 && !afterburner) vel.addScaledVector(vel, -Math.min(1, dt * ship.damp * 0.5));
    }

    if (vel.length() > vmax) vel.setLength(vmax);
    _prevPos.copy(camera.position);
    camera.position.addScaledVector(vel, dt);

    // ---- physical landing on planet surfaces ----
    handleLanding(dt, unit, vmax, getLevelMeta());

    // ---- G-meter & shake ----
    const dv = vel.clone().sub(prevVel).length() / Math.max(dt, 1e-4);
    prevVel.copy(vel);
    gMeter += (Math.min(9, dv / (baseAccel + 1e-6) * 1.2) - gMeter) * Math.min(1, dt * 5);
    if (afterburner) shake = Math.min(1, shake + dt * 2); else shake = Math.max(0, shake - dt * 3);
    cockpit.classList.toggle('shaking', shake > 0.3);

    // ---- level crossing ----
    edgeCooldown -= dt;
    const r = camera.position.length();
    if (edgeCooldown <= 0) {
      if (r > maxDist * 0.99) { if (crossLevel(1)) { vel.multiplyScalar(0.2); edgeCooldown = 1.5; refreshTargets(); } }
      else if (r < minDist * 1.02) { if (crossLevel(-1)) { vel.multiplyScalar(0.2); edgeCooldown = 1.5; refreshTargets(); } }
    }

    updateHUD(dt);
  }

  // ---- physical touchdown: treat each planet/moon as a solid sphere ----
  // Uses a *swept* segment-vs-sphere test between last frame's position and
  // this frame's, so even a small, fast planet can't be tunnelled through.
  const _prevPos = new THREE.Vector3();
  const _seg = new THREE.Vector3(), _f = new THREE.Vector3(), _hit = new THREE.Vector3();
  const REST = 0.14;   // parked height above surface (must exceed the 1.08 shell)
  function handleLanding(dt, unit, vmax, meta) {
    nearAlt = null;
    const bodies = (getLandables ? getLandables() : []) || [];
    if (!bodies.length) { landed = null; return; }

    // already parked → ride along the body; lift off on any climb input
    if (landed) {
      const c = landed.getPos();
      camera.position.copy(c).addScaledVector(landNormal, landed.radius * (1 + REST));
      vel.set(0, 0, 0);
      if (throttle > 0.05 || keys.KeyR || afterburner || keys.Space || keys.KeyW) {
        const name = landed.name; landed = null;
        landCooldown = 1.2;                                // grace period to clear the surface
        vel.copy(landNormal).multiplyScalar(unit * 0.05);  // firm push straight up
        showToast('Lift-off from ' + name, 'Climbing away — point your nose where you want to go');
      } else {
        nearAlt = { name: landed.name, alt: 0, km: 0, landed: true };
      }
      return;
    }

    // just lifted off — don't let the surface grab us again while we climb clear
    if (landCooldown > 0) { landCooldown -= dt; return; }

    _seg.copy(camera.position).sub(_prevPos);        // movement this frame
    const segLen2 = _seg.lengthSq();

    let bestT = Infinity, best = null, bestC = null;
    let nearName = null, nearSurf = Infinity;
    for (const b of bodies) {
      const c = b.getPos();
      const surf = camera.position.distanceTo(c) - b.radius;     // for altimeter
      if (surf < nearSurf) { nearSurf = surf; nearName = b.name; }

      // thin shell just above the real surface — only an actual fly-into
      // the planet collides (the swept test still catches fast pass-throughs)
      const detectR = b.radius * 1.08;
      _f.copy(_prevPos).sub(c);
      const cc = _f.lengthSq() - detectR * detectR;
      if (cc <= 0) { if (bestT > 0) { bestT = 0; best = b; bestC = c; } continue; } // already inside
      if (segLen2 < 1e-12) continue;
      const a = segLen2, bq = 2 * _f.dot(_seg);
      const disc = bq * bq - 4 * a * cc;
      if (disc < 0) continue;
      const t = (-bq - Math.sqrt(disc)) / (2 * a);
      if (t >= 0 && t <= 1 && t < bestT) { bestT = t; best = b; bestC = c; }
    }

    if (nearName && nearSurf < getLevelBounds().maxDist * 0.4) {
      nearAlt = { name: nearName, alt: nearSurf, km: meta.kmPerUnit ? nearSurf * meta.kmPerUnit : null };
    }
    if (!best) return;

    // contact!
    _hit.copy(_prevPos).addScaledVector(_seg, Math.max(0, bestT)).sub(bestC);
    const nrm = _hit.lengthSq() > 1e-9 ? _hit.normalize() : _seg.set(0, 1, 0);
    const closing = -vel.dot(nrm);
    camera.position.copy(bestC).addScaledVector(nrm, best.radius * (1 + REST));

    if (closing > vmax * 0.55) {
      // too fast — bounce, no landing
      vel.reflect(nrm).multiplyScalar(0.35);
      shake = 1; gMeter = 9; cockpit.classList.add('shaking');
      showToast('⚠ Hard impact on ' + best.name + '!', 'Ease off the throttle for a soft landing');
    } else {
      // gentle touchdown
      landed = best; landNormal.copy(nrm);
      vel.set(0, 0, 0); throttle = 0;
      showToast('🛬 Touchdown on ' + best.name, 'Throttle up · R · or Space to lift off');
    }
  }

  function autoFly(dt, baseAccel) {
    const tp = target.getPos();
    const toT = tp.clone().sub(camera.position);
    const dist = toT.length();
    toT.normalize();
    // turn the nose toward the target
    const localDir = toT.clone().applyQuaternion(camera.quaternion.clone().invert());
    yawRate += -localDir.x * ship.turn * 3 * dt * 10;
    pitchRate += localDir.y * ship.turn * 3 * dt * 10;
    const k = Math.min(1, dt * 4);
    pitchRate *= (1 - k * 0.6); yawRate *= (1 - k * 0.6); rollRate *= (1 - k);
    // throttle proportional to distance; ease off on approach
    const aligned = Math.max(0, fwd.dot(toT));
    throttle = THREE.MathUtils.clamp(dist / (getLevelBounds().maxDist * 0.4), 0, 1) * aligned;
    if (dist < getLevelBounds().minDist * 2.5) { throttle = 0; autopilot = false; flash(lampAuto, false); showToast('Arrived at ' + target.name, ''); }
  }

  // ---- HUD ----
  const ndc = new THREE.Vector3();
  function projectMarker(mark, worldPos) {
    ndc.copy(worldPos).project(camera);
    const behind = ndc.z > 1;
    if (behind || ndc.x < -1.1 || ndc.x > 1.1 || ndc.y < -1.1 || ndc.y > 1.1) { mark.style.display = 'none'; return; }
    mark.style.display = 'block';
    mark.style.left = ((ndc.x * 0.5 + 0.5) * window.innerWidth) + 'px';
    mark.style.top = ((-ndc.y * 0.5 + 0.5) * window.innerHeight) + 'px';
  }

  function updateHUD(dt) {
    hudTimer += dt;
    // attitude from the camera orientation
    euler.setFromQuaternion(camera.quaternion, 'YXZ');
    const pitchDeg = euler.x * 180 / Math.PI;
    const rollDeg = euler.z * 180 / Math.PI;
    const hdg = ((-euler.y * 180 / Math.PI) % 360 + 360) % 360;
    adiBall.setAttribute('transform', `rotate(${rollDeg}) translate(0 ${pitchDeg * 1.7})`);

    // velocity-vector markers (prograde / retrograde)
    const speed = vel.length();
    if (speed > 1e-4) {
      const dir = vel.clone().normalize();
      projectMarker(proMark, camera.position.clone().addScaledVector(dir, 1000));
      projectMarker(retMark, camera.position.clone().addScaledVector(dir, -1000));
    } else { proMark.style.display = 'none'; retMark.style.display = 'none'; }

    // throttle + fuel bars
    thrFill.style.height = (throttle * 100) + '%';
    fuelFill.style.width = (fuel / ship.fuel * 100) + '%';

    if (hudTimer < 0.1) return; // text/heading at ~10Hz
    hudTimer = 0;
    const meta = getLevelMeta();
    const kmps = speed * (meta.kmPerUnit || 0);
    spdVal.textContent = meta.kmPerUnit ? fmtSpeed(kmps) : '— — —';
    const mach = kmps * 1000 / 343;
    spdSub.textContent = meta.kmPerUnit
      ? (kmps < 3 ? 'Mach ' + mach.toFixed(1) : (kmps / C_KMS * 100).toFixed(2) + '% light speed')
      : 'scale unknowable';
    gVal.textContent = gMeter.toFixed(1) + ' G';
    gVal.classList.toggle('hot', gMeter > 6);

    // radar altimeter — appears when a landable surface is within reach
    if (altVal) {
      if (landed) { altVal.style.display = 'block'; altVal.textContent = '🛬 LANDED · ' + landed.name; altVal.classList.add('landed'); }
      else if (nearAlt && nearAlt.km != null && nearAlt.alt < getLevelBounds().maxDist * 0.35) {
        altVal.style.display = 'block'; altVal.classList.remove('landed');
        altVal.textContent = 'ALT ' + formatKm(Math.max(0, nearAlt.km)) + ' · ' + nearAlt.name;
      } else { altVal.style.display = 'none'; }
    }
    hdgVal.textContent = Math.round(hdg).toString().padStart(3, '0') + '°';
    hdgTape.style.transform = `translateX(${-hdg * 4}px)`;

    // hyperspace streaks past a fraction of light speed
    cockpit.classList.toggle('warp', kmps > C_KMS * 0.5);

    // nearest-body scanner + target lock
    if (target) {
      const d = camera.position.distanceTo(target.getPos());
      tgtName.textContent = target.name;
      const km = d * (meta.kmPerUnit || 0);
      tgtDist.textContent = meta.kmPerUnit ? formatKm(km) : '—';
      projectMarker(tgtMark, target.getPos());
    } else {
      // show the closest thing even without a lock
      refreshTargets();
      let best = null, bd = Infinity;
      for (const t of targetList) { const d = camera.position.distanceTo(t.getPos()); if (d < bd) { bd = d; best = t; } }
      if (best) {
        tgtName.textContent = best.name + ' (nearest)';
        tgtDist.textContent = meta.kmPerUnit ? formatKm(bd * meta.kmPerUnit) : '—';
        flash(lampProx, bd < getLevelBounds().minDist * 3);
      } else { tgtName.textContent = '—'; tgtDist.textContent = ''; }
      tgtMark.style.display = 'none';
    }
  }

  function formatKm(km) {
    if (km < 1e6) return Math.round(km).toLocaleString() + ' km';
    if (km < KM_PER_AU * 0.5) return (km / 1e6).toFixed(1) + ' M km';
    if (km < KM_PER_LY * 0.1) return (km / KM_PER_AU).toFixed(2) + ' AU';
    return (km / KM_PER_LY).toFixed(2) + ' ly';
  }

  return { update, active: () => active, exit: disengage };
}

// ---- cockpit DOM (built once) ----
function buildCockpit(root) {
  // pitch ladder for the artificial horizon
  let ladder = '';
  for (let p = -90; p <= 90; p += 10) {
    if (p === 0) continue;
    const y = -p * 1.7;
    ladder += `<line x1="-26" y1="${y}" x2="26" y2="${y}" class="adi-rung"/>
      <text x="-32" y="${y + 3}" class="adi-num">${Math.abs(p)}</text>`;
  }
  root.innerHTML = `
    <div class="cp-strut cp-tl"></div><div class="cp-strut cp-tr"></div>
    <div class="cp-strut cp-bl"></div><div class="cp-strut cp-br"></div>
    <div class="cp-dash"></div>

    <div id="hdg-wrap">
      <div class="hdg-window"><div id="hdg-tape">${headingTape()}</div></div>
      <div id="hdg-val">000°</div>
    </div>

    <div id="cp-reticle">
      <svg viewBox="-20 -20 40 40"><circle r="11" class="ret-ring"/><line x1="-18" y1="0" x2="-7" y2="0"/><line x1="18" y1="0" x2="7" y2="0"/><line x1="0" y1="-18" x2="0" y2="-7"/></svg>
    </div>
    <div id="pro-mark" class="vmark">⊕</div>
    <div id="ret-mark" class="vmark ret">⊗</div>
    <div id="tgt-mark" class="vmark tgt">▢</div>

    <div id="cp-left">
      <div class="cp-card" id="tgt-card">
        <div class="cp-label">SCANNER</div>
        <div id="tgt-name">—</div>
        <div id="tgt-dist"></div>
        <div class="cp-hint">Tab: lock · G: autopilot</div>
      </div>
    </div>

    <div id="cp-right">
      <div class="cp-card" id="cp-ship">🚀</div>
      <div class="cp-lamps">
        <span class="lamp" id="lamp-prox">PROX</span>
        <span class="lamp" id="lamp-fuel">FUEL</span>
        <span class="lamp on" id="lamp-damp">DAMP</span>
        <span class="lamp" id="lamp-ab">A/B</span>
        <span class="lamp" id="lamp-auto">AUTO</span>
      </div>
    </div>

    <div id="cp-bottom">
      <div id="thr-gauge"><div class="cp-label">THR</div><div class="thr-track"><div id="thr-fill"></div></div></div>

      <div id="adi">
        <svg viewBox="-100 -100 200 200">
          <defs><clipPath id="adiClip"><circle r="90"/></clipPath></defs>
          <g clip-path="url(#adiClip)">
            <g id="adi-ball">
              <rect x="-400" y="-400" width="800" height="400" class="adi-sky"/>
              <rect x="-400" y="0" width="800" height="400" class="adi-gnd"/>
              <line x1="-400" y1="0" x2="400" y2="0" class="adi-horizon"/>
              ${ladder}
            </g>
          </g>
          <circle r="90" class="adi-bezel"/>
          <path d="M-40 0 L-12 0 L0 9 L12 0 L40 0" class="adi-craft"/>
          <polygon points="0,-90 -7,-78 7,-78" class="adi-roll"/>
        </svg>
      </div>

      <div id="spd-gauge">
        <div class="cp-label">VELOCITY</div>
        <div id="spd-val">0 km/s</div>
        <div id="spd-sub">Mach 0.0</div>
        <div id="g-val">0.0 G</div>
        <div id="alt-val"></div>
      </div>
    </div>

    <div id="fuel-bar"><div class="cp-label">AFTERBURNER</div><div class="fuel-track"><div id="fuel-fill"></div></div></div>
    <div id="warp-streaks"></div>
  `;
}

function headingTape() {
  const dirs = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
  let s = '';
  for (let d = -360; d <= 720; d += 15) {
    const norm = ((d % 360) + 360) % 360;
    const x = d * 4;
    const lab = dirs[norm] != null ? dirs[norm] : (norm % 30 === 0 ? norm : '');
    s += `<span class="hdg-tick" style="left:${x}px">${lab !== '' ? `<b>${lab}</b>` : '|'}</span>`;
  }
  return s;
}

// ============================================================
// Guided cinematic tour — a "Powers of Ten" flight from Earth out
// to the multiverse, with narration cards and a slow auto-orbit.
// Click anywhere, press Esc, or hit Skip to take back the controls.
// ============================================================
import * as THREE from 'three';

const STOPS = [
  { level: 0, dist: 0.10, title: 'Home', text: 'One small blue world — the only place in the entire map we know life exists. Everything you love is on this dot.' },
  { level: 0, dist: 0.5, title: 'Low orbit', text: 'A swarm of satellites and the ISS race overhead, propagated live from real orbital data. Humanity\'s machines, circling.' },
  { level: 1, dist: 0.42, title: 'The Solar System', text: 'Out past the Moon, eight planets and a host of icy worlds orbit one very ordinary star. Probes are still coasting toward the edge.' },
  { level: 2, dist: 0.55, title: 'The Milky Way', text: 'Our Sun is one mote among 400 billion. Every confirmed exoplanet ever found is plotted here, clustered around the “you are here” marker.' },
  { level: 3, dist: 0.55, title: 'The Local Group', text: 'The galaxy joins a small family of neighbours — and in a few billion years, Andromeda will fall right into us.' },
  { level: 4, dist: 0.6, title: 'The Observable Universe', text: 'Zoom out far enough and galaxies become glowing dust strung along a cosmic web — the largest structure that exists.' },
  { level: 5, dist: 0.5, title: 'Beyond', text: 'And maybe ours is just one bubble among countless others. Thanks for taking the ride. 🚀' },
];

export function initTour(ctx) {
  const { gotoLevel, camera, controls, showToast } = ctx;
  const bar = document.getElementById('tour-bar');
  const card = document.getElementById('tour-card');
  const stopBtn = document.getElementById('tour-stop');

  let active = false, idx = 0, timer = null, orbitAngle = 0, raf = null;

  function start() {
    if (active) return;
    active = true; idx = 0;
    bar.classList.add('on');
    document.body.classList.add('touring');
    showToast('🎞 Guided tour', 'Sit back — click or press Esc to take over');
    loop();
    step();
  }

  function stop() {
    if (!active) return;
    active = false;
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    bar.classList.remove('on');
    document.body.classList.remove('touring');
  }

  function step() {
    const s = STOPS[idx];
    card.innerHTML = `<div class="tour-step">Stop ${idx + 1} / ${STOPS.length}</div>
      <h3>${s.title}</h3><p>${s.text}</p>`;
    const frame = () => {
      const d = THREE.MathUtils.lerp(controls.minDistance, controls.maxDistance, s.dist);
      const dir = new THREE.Vector3(0.5, 0.4, 1).normalize();
      camera.position.copy(dir.multiplyScalar(d));
      controls.target.set(0, 0, 0);
      controls.update();
      orbitAngle = Math.atan2(camera.position.z, camera.position.x);
    };
    gotoLevel(s.level, true, frame);
    // if we're already on that level, gotoLevel returns early — frame anyway
    setTimeout(frame, 30);
    timer = setTimeout(() => {
      idx++;
      if (idx >= STOPS.length) { stop(); showToast('Tour complete', 'Explore freely — try Flight mode or the Tech Map'); }
      else step();
    }, 7200);
  }

  // slow cinematic auto-orbit while a stop is on screen
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!active) return;
    orbitAngle += 0.0015;
    const r = Math.hypot(camera.position.x, camera.position.z);
    const y = camera.position.y;
    camera.position.set(Math.cos(orbitAngle) * r, y, Math.sin(orbitAngle) * r);
    controls.target.set(0, 0, 0);
  }

  stopBtn.addEventListener('click', stop);
  window.addEventListener('keydown', e => { if (active && e.key === 'Escape') stop(); });
  window.addEventListener('pointerdown', e => { if (active && !bar.contains(e.target)) stop(); });

  return { start, stop, active: () => active };
}

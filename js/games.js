// ============================================================
// Daily space games — five built-in mini-games. One is featured
// each day; Gravity Golf and Trivia generate fresh daily
// challenges from a date seed.
// ============================================================

const DAY = Math.floor(Date.now() / 86400000);

// deterministic RNG so "daily" puzzles are the same for everyone
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const best = (k) => parseInt(localStorage.getItem('um-' + k) || '0', 10);
const setBest = (k, v) => localStorage.setItem('um-' + k, String(v));

// ---------------- 1. Asteroid Run ----------------
const asteroidRun = {
  id: 'asteroids', name: 'Asteroid Run', icon: '☄️',
  desc: '← → (or A/D) to steer. Dodge the asteroids, grab the stars. It gets faster…',
  start({ canvas, g, setScore, onEnd }) {
    const W = canvas.width, H = canvas.height;
    let ship = W / 2, vx = 0, t = 0, score = 0, alive = true, raf;
    const rocks = [], stars = [];
    const keys = {};
    const kd = e => { keys[e.key] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); };
    const ku = e => { keys[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    let last = performance.now();

    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (alive) t += dt;
      const speed = 90 + t * 9;
      if (keys.ArrowLeft || keys.a) vx -= 900 * dt;
      if (keys.ArrowRight || keys.d) vx += 900 * dt;
      vx *= 0.92;
      ship = Math.max(14, Math.min(W - 14, ship + vx * dt));
      if (alive && Math.random() < dt * (1.1 + t * 0.06)) rocks.push({ x: Math.random() * W, y: -22, r: 8 + Math.random() * 14, s: 0.7 + Math.random() * 0.6, rot: Math.random() * 7 });
      if (alive && Math.random() < dt * 0.5) stars.push({ x: 20 + Math.random() * (W - 40), y: -12 });

      g.fillStyle = '#04060f'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#2a3a5a';
      for (let i = 0; i < 30; i++) g.fillRect((i * 97 + t * 20) % W, (i * 53 + t * (40 + i)) % H, 2, 2);

      const sy = H - 36;
      for (let i = rocks.length - 1; i >= 0; i--) {
        const r = rocks[i];
        r.y += speed * r.s * dt; r.rot += dt;
        if (r.y > H + 30) { rocks.splice(i, 1); continue; }
        g.save(); g.translate(r.x, r.y); g.rotate(r.rot);
        g.fillStyle = '#8a7a68'; g.strokeStyle = '#5c5044'; g.lineWidth = 2;
        g.beginPath();
        for (let k = 0; k < 7; k++) {
          const a = k / 7 * Math.PI * 2, rr = r.r * (0.78 + ((k * 37) % 10) / 22);
          g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath(); g.fill(); g.stroke(); g.restore();
        if (alive && Math.hypot(r.x - ship, r.y - sy) < r.r + 9) {
          alive = false;
          const sc = Math.floor(score + t * 10);
          if (sc > best('asteroids')) setBest('asteroids', sc);
          onEnd(`💥 Hit! Score ${sc} — best ${best('asteroids')}`);
        }
      }
      g.font = '14px sans-serif';
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.y += speed * 0.8 * dt;
        if (s.y > H + 12) { stars.splice(i, 1); continue; }
        g.fillText('⭐', s.x - 7, s.y + 5);
        if (alive && Math.hypot(s.x - ship, s.y - sy) < 18) { score += 50; stars.splice(i, 1); }
      }

      // ship
      g.save(); g.translate(ship, sy);
      g.fillStyle = '#9fd0ff';
      g.beginPath(); g.moveTo(0, -14); g.lineTo(10, 12); g.lineTo(0, 6); g.lineTo(-10, 12); g.closePath(); g.fill();
      if (alive) { g.fillStyle = '#ffb060'; g.beginPath(); g.moveTo(-4, 12); g.lineTo(0, 20 + Math.random() * 6); g.lineTo(4, 12); g.closePath(); g.fill(); }
      g.restore();

      setScore(`Score ${Math.floor(score + t * 10)} · Best ${best('asteroids')}`);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  },
};

// ---------------- 2. Lunar Lander ----------------
const lander = {
  id: 'lander', name: 'Lunar Lander', icon: '🌙',
  desc: '↑ main engine · ← → side thrusters. Touch down GENTLY on the pad. Watch your fuel.',
  start({ canvas, g, setScore, onEnd }) {
    const W = canvas.width, H = canvas.height;
    const rnd = mulberry32(DAY * 7 + 3);
    const padX = 60 + rnd() * (W - 160), padW = 64;
    // jagged terrain with a flat pad
    const terr = [];
    for (let x = 0; x <= W; x += 16) {
      const inPad = x > padX - 10 && x < padX + padW + 10;
      terr.push({ x, y: inPad ? H - 46 : H - 46 - rnd() * 60 - Math.sin(x * 0.02) * 18 });
    }
    let x = W / 2, y = 50, vx = (rnd() - 0.5) * 30, vy = 10, fuel = 100, done = false, raf;
    const keys = {};
    const kd = e => { keys[e.key] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); };
    const ku = e => { keys[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    let last = performance.now();

    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (!done) {
        vy += 28 * dt; // lunar-ish gravity, scaled
        if (fuel > 0) {
          if (keys.ArrowUp || keys.w) { vy -= 70 * dt; fuel -= 16 * dt; }
          if (keys.ArrowLeft || keys.a) { vx -= 40 * dt; fuel -= 7 * dt; }
          if (keys.ArrowRight || keys.d) { vx += 40 * dt; fuel -= 7 * dt; }
        }
        fuel = Math.max(0, fuel);
        x += vx * dt; y += vy * dt;
        if (x < 8) { x = 8; vx = 0; } if (x > W - 8) { x = W - 8; vx = 0; }
        // ground collision
        const seg = terr.find(t0 => t0.x >= x) || terr[terr.length - 1];
        if (y > seg.y - 8) {
          done = true;
          const onPad = x > padX && x < padX + padW;
          const soft = Math.abs(vy) < 34 && Math.abs(vx) < 22;
          if (onPad && soft) {
            const sc = Math.round(fuel * 10);
            if (sc > best('lander')) setBest('lander', sc);
            onEnd(`🦅 The Eagle has landed! Fuel bonus ${sc} — best ${best('lander')}`);
          } else onEnd(onPad ? '💥 Too hard! The lander crumpled. (vy < 34)' : '💥 Missed the pad.');
        }
      }
      g.fillStyle = '#04060f'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#26344f';
      for (let i = 0; i < 40; i++) g.fillRect((i * 89) % W, (i * 71) % (H - 100), 2, 2);
      // terrain
      g.fillStyle = '#3a3f4d';
      g.beginPath(); g.moveTo(0, H);
      terr.forEach(t0 => g.lineTo(t0.x, t0.y));
      g.lineTo(W, H); g.closePath(); g.fill();
      g.fillStyle = '#7aff9a';
      g.fillRect(padX, H - 46, padW, 4);
      g.font = '10px sans-serif'; g.fillText('PAD', padX + padW / 2 - 10, H - 52);
      // lander
      g.save(); g.translate(x, y);
      g.fillStyle = '#cfd8e8'; g.fillRect(-7, -8, 14, 12);
      g.strokeStyle = '#8fa6cc'; g.beginPath();
      g.moveTo(-7, 4); g.lineTo(-11, 10); g.moveTo(7, 4); g.lineTo(11, 10); g.stroke();
      if (!done && fuel > 0 && (keys.ArrowUp || keys.w)) {
        g.fillStyle = '#ffb060'; g.beginPath(); g.moveTo(-4, 4); g.lineTo(0, 14 + Math.random() * 5); g.lineTo(4, 4); g.closePath(); g.fill();
      }
      g.restore();
      // HUD
      setScore(`Fuel ${Math.round(fuel)} · ↓ speed ${Math.round(Math.abs(vy))} ${Math.abs(vy) < 34 ? '🟢' : '🔴'} · Best fuel bonus ${best('lander')}`);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  },
};

// ---------------- 3. Gravity Golf (daily course) ----------------
const gravityGolf = {
  id: 'golf', name: 'Gravity Golf', icon: '🪐',
  desc: 'Drag from the probe to launch it. Use the planet\'s gravity to curve into the ring. New course every day!',
  start({ canvas, g, setScore, onEnd }) {
    const W = canvas.width, H = canvas.height;
    let hole = 0, shots = 0, total = 0, state = 'aim', probe, vel, trail, raf;
    let planets, target, startPos;

    function setupHole() {
      const rnd = mulberry32(DAY * 31 + hole * 7 + 1);
      planets = [];
      const n = 1 + (hole % 2);
      for (let i = 0; i < n; i++) {
        planets.push({ x: W * (0.3 + rnd() * 0.4), y: H * (0.25 + rnd() * 0.4), r: 16 + rnd() * 14, m: 5200 + rnd() * 5200 });
      }
      target = { x: W * (0.15 + rnd() * 0.7), y: 36 + rnd() * 60, r: 16 };
      startPos = { x: 30 + rnd() * (W - 60), y: H - 36 };
      probe = { ...startPos }; vel = null; trail = []; state = 'aim';
    }
    setupHole();

    let dragging = false, drag = { x: 0, y: 0 };
    const pos = e => {
      const r = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: (p.clientX - r.left) * W / r.width, y: (p.clientY - r.top) * H / r.height };
    };
    const down = e => { if (state !== 'aim') return; const p = pos(e); if (Math.hypot(p.x - probe.x, p.y - probe.y) < 40) { dragging = true; drag = p; } };
    const move = e => { if (dragging) { drag = pos(e); e.preventDefault(); } };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      vel = { x: (probe.x - drag.x) * 2.4, y: (probe.y - drag.y) * 2.4 };
      state = 'fly'; shots++; total++;
    };
    canvas.addEventListener('mousedown', down); canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    canvas.addEventListener('touchstart', down, { passive: true }); canvas.addEventListener('touchmove', move, { passive: false }); canvas.addEventListener('touchend', up);

    let last = performance.now();
    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.04); last = now;
      if (state === 'fly') {
        for (let sub = 0; sub < 4; sub++) {
          const h = dt / 4;
          for (const pl of planets) {
            const dx = pl.x - probe.x, dy = pl.y - probe.y;
            const d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
            const a = pl.m / Math.max(d2, 400);
            vel.x += a * dx / d * h * 60; vel.y += a * dy / d * h * 60;
          }
          probe.x += vel.x * h; probe.y += vel.y * h;
          trail.push({ x: probe.x, y: probe.y });
          if (trail.length > 240) trail.shift();
          for (const pl of planets) if (Math.hypot(pl.x - probe.x, pl.y - probe.y) < pl.r + 4) state = 'crash';
          if (probe.x < -30 || probe.x > W + 30 || probe.y < -30 || probe.y > H + 30) state = 'lost';
          if (Math.hypot(target.x - probe.x, target.y - probe.y) < target.r) state = 'win';
        }
        if (state === 'crash' || state === 'lost') setTimeout(() => { probe = { ...startPos }; trail = []; state = 'aim'; }, 600);
        if (state === 'win') {
          setTimeout(() => {
            hole++;
            if (hole >= 3) {
              const sc = total;
              const b = best('golf3');
              if (!b || sc < b) setBest('golf3', sc);
              onEnd(`🏁 Course complete in ${sc} shots! Daily best ${best('golf3')}. New course tomorrow.`);
            } else { shots = 0; setupHole(); }
          }, 700);
        }
      }
      // draw
      g.fillStyle = '#04060f'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#26344f';
      for (let i = 0; i < 36; i++) g.fillRect((i * 83) % W, (i * 59) % H, 2, 2);
      for (const pl of planets) {
        const gr = g.createRadialGradient(pl.x - pl.r * 0.3, pl.y - pl.r * 0.3, 2, pl.x, pl.y, pl.r);
        gr.addColorStop(0, '#c8a87e'); gr.addColorStop(1, '#6a5236');
        g.fillStyle = gr; g.beginPath(); g.arc(pl.x, pl.y, pl.r, 0, 7); g.fill();
      }
      g.strokeStyle = '#7aff9a'; g.lineWidth = 3;
      g.beginPath(); g.arc(target.x, target.y, target.r, 0, 7); g.stroke();
      g.fillStyle = 'rgba(122,255,154,0.15)'; g.fill();
      g.strokeStyle = 'rgba(140,180,255,0.5)'; g.lineWidth = 1;
      g.beginPath(); trail.forEach((t0, i) => g[i ? 'lineTo' : 'moveTo'](t0.x, t0.y)); g.stroke();
      if (dragging) {
        g.strokeStyle = '#ffd76a'; g.setLineDash([4, 4]);
        g.beginPath(); g.moveTo(probe.x, probe.y); g.lineTo(probe.x * 2 - drag.x, probe.y * 2 - drag.y); g.stroke();
        g.setLineDash([]);
      }
      g.fillStyle = state === 'crash' ? '#ff7060' : '#9fd0ff';
      g.beginPath(); g.arc(probe.x, probe.y, 6, 0, 7); g.fill();
      setScore(`Hole ${Math.min(hole + 1, 3)}/3 · Shots this hole ${shots} · Total ${total} · Daily best ${best('golf3') || '—'}`);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', down); canvas.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
      canvas.removeEventListener('touchstart', down); canvas.removeEventListener('touchmove', move); canvas.removeEventListener('touchend', up);
    };
  },
};

// ---------------- 4. Daily Space Trivia ----------------
const TRIVIA = [
  { q: 'Which planet has the most moons?', o: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], a: 1, f: 'Saturn leads with 274 confirmed moons — Jupiter has 95.' },
  { q: 'How long does sunlight take to reach Earth?', o: ['8 seconds', '8 minutes', '8 hours', '8 days'], a: 1, f: 'About 8 minutes 20 seconds across 150 million km.' },
  { q: 'What is the closest star to the Sun?', o: ['Sirius', 'Alpha Centauri A', 'Proxima Centauri', "Barnard's Star"], a: 2, f: 'Proxima Centauri, 4.25 light-years away — and it hosts a habitable-zone planet.' },
  { q: 'The Great Red Spot is a storm on…', o: ['Saturn', 'Neptune', 'Venus', 'Jupiter'], a: 3, f: "It has raged for at least 350 years and is bigger than Earth." },
  { q: 'Which of these is the hottest planet?', o: ['Mercury', 'Venus', 'Mars', 'Jupiter'], a: 1, f: 'Venus (~465°C) — its CO₂ atmosphere traps heat better than Mercury\'s closeness to the Sun.' },
  { q: 'What was the first artificial satellite?', o: ['Explorer 1', 'Vanguard 1', 'Sputnik 1', 'Telstar'], a: 2, f: 'Sputnik 1, launched by the USSR on 4 October 1957.' },
  { q: 'A teaspoon of neutron star would weigh about…', o: ['1 tonne', '1,000 tonnes', '1 million tonnes', '1 billion tonnes'], a: 3, f: 'Around a billion tonnes — the densest matter outside a black hole.' },
  { q: 'How many humans have walked on the Moon?', o: ['6', '9', '12', '18'], a: 2, f: 'Twelve, all between 1969 and 1972, all on Apollo missions.' },
  { q: 'The Milky Way and Andromeda will collide in roughly…', o: ['450 million years', '4.5 billion years', '45 billion years', 'They are moving apart'], a: 1, f: 'About 4.5 billion years — they approach at 110 km/s.' },
  { q: 'Which spacecraft is farthest from Earth?', o: ['Pioneer 10', 'New Horizons', 'Voyager 2', 'Voyager 1'], a: 3, f: 'Voyager 1 — over 165 AU away and still transmitting.' },
  { q: 'What makes Mars red?', o: ['Iron oxide (rust)', 'Sulfur', 'Copper', 'Methane haze'], a: 0, f: 'Its surface dust is rich in rusted iron minerals.' },
  { q: 'The first exoplanets ever discovered orbit a…', o: ['Sun-like star', 'Red dwarf', 'Pulsar', 'White dwarf'], a: 2, f: 'PSR B1257+12 (1992) — planets around a dead, spinning star.' },
  { q: 'How old is the universe?', o: ['4.6 billion years', '13.8 billion years', '93 billion years', '100 trillion years'], a: 1, f: '13.8 billion years — the Sun is 4.6, the observable universe is 93 billion light-years wide.' },
  { q: 'Which moon has lakes of liquid methane?', o: ['Europa', 'Titan', 'Enceladus', 'Triton'], a: 1, f: 'Titan — the only world besides Earth with rain, rivers and lakes.' },
  { q: 'What percentage of the universe is ordinary matter?', o: ['About 5%', 'About 27%', 'About 68%', 'About 95%'], a: 0, f: '5% — the rest is dark matter (27%) and dark energy (68%).' },
  { q: 'The largest volcano in the Solar System is on…', o: ['Earth', 'Venus', 'Mars', 'Io'], a: 2, f: 'Olympus Mons on Mars — 21 km high, almost 3× Everest.' },
  { q: 'One day on Venus (sunrise to sunrise) is…', o: ['Shorter than Earth\'s', 'About the same', 'Longer than its year', '117 Earth days'], a: 3, f: 'A Venus solar day is ~117 Earth days; its sidereal day (243d) is longer than its year (225d).' },
  { q: 'What is the Sun mostly made of?', o: ['Hydrogen & helium', 'Plasma & iron', 'Oxygen & carbon', 'Pure energy'], a: 0, f: '≈73% hydrogen, 25% helium — it fuses 600 million tonnes of H per second.' },
  { q: 'Gold is formed primarily in…', o: ['The Big Bang', 'Sun-like stars', 'Neutron-star collisions', 'Volcanoes'], a: 2, f: 'Kilonovae — GW170817 forged ~10 Earths of gold and platinum.' },
  { q: 'How fast is the ISS travelling?', o: ['~2,800 km/h', '~7,700 km/h', '~17,500 km/h', '~27,600 km/h'], a: 3, f: '27,600 km/h — one orbit every 93 minutes, 16 sunrises a day.' },
  { q: 'The coldest place in the Solar System measured so far is…', o: ['Pluto', 'Craters on our Moon', 'Neptune', 'Eris'], a: 1, f: 'Permanently shadowed lunar craters dip below −240°C — colder than Pluto.' },
  { q: 'Which planet would float in water?', o: ['Mercury', 'Uranus', 'Saturn', 'Mars'], a: 2, f: 'Saturn\'s average density is less than water\'s.' },
  { q: 'The first photo of a black hole (2019) shows the one in…', o: ['The Milky Way', 'Andromeda', 'M87', 'The LMC'], a: 2, f: 'M87* — 6.5 billion solar masses. Sagittarius A* followed in 2022.' },
  { q: 'Roughly how many stars are in the Milky Way?', o: ['4 million', '400 million', '100–400 billion', '2 trillion'], a: 2, f: 'Hundreds of billions — and at least as many planets.' },
  { q: 'What is the speed of light?', o: ['~300 km/s', '~3,000 km/s', '~300,000 km/s', '~3 million km/s'], a: 2, f: '299,792 km/s — around Earth 7.5 times in one second.' },
  { q: 'Which mission first landed humans on the Moon?', o: ['Apollo 8', 'Apollo 11', 'Apollo 13', 'Gemini 7'], a: 1, f: 'Apollo 11, 20 July 1969 — "one giant leap for mankind."' },
  { q: 'A year on Mercury lasts…', o: ['88 Earth days', '225 Earth days', '365 Earth days', '687 Earth days'], a: 0, f: '88 days — but its solar day is even longer: 176 Earth days.' },
  { q: 'The Kuiper Belt lies…', o: ['Between Mars & Jupiter', 'Around Saturn', 'Beyond Neptune', 'Around the Sun\'s poles'], a: 2, f: '30–55 AU out: home of Pluto, Eris, Makemake and Haumea.' },
];

const trivia = {
  id: 'trivia', name: 'Daily Space Trivia', icon: '🧠',
  desc: 'Seven questions, new set every day. How well do you know your universe?',
  dom: true,
  start({ stage, setScore, onEnd }) {
    const rnd = mulberry32(DAY * 13 + 5);
    const qs = [...TRIVIA].map((q, i) => ({ q, r: rnd() + i * 1e-9 })).sort((a, b) => a.r - b.r).slice(0, 7).map(x => x.q);
    let i = 0, right = 0;
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'trivia';
    stage.appendChild(box);
    function show() {
      if (i >= qs.length) {
        const today = `${right}/${qs.length}`;
        if (right > best('trivia')) setBest('trivia', right);
        box.innerHTML = `<div class="trivia-q" style="font-size:17px">${right >= 6 ? '🏆' : right >= 4 ? '🌟' : '🛰'} You scored ${today}</div>
          <p class="trivia-fact">Best ever: ${best('trivia')}/7. A fresh set of questions arrives tomorrow.</p>`;
        onEnd(`Trivia complete — ${today}`);
        return;
      }
      const q = qs[i];
      box.innerHTML = `<div class="trivia-prog">Question ${i + 1} / ${qs.length}</div>
        <div class="trivia-q">${q.q}</div>`;
      q.o.forEach((opt, k) => {
        const b = document.createElement('button');
        b.className = 'trivia-opt';
        b.textContent = opt;
        b.addEventListener('click', () => {
          if (box.dataset.locked) return;
          box.dataset.locked = '1';
          const ok = k === q.a;
          if (ok) right++;
          box.querySelectorAll('.trivia-opt').forEach((bb, kk) => {
            if (kk === q.a) bb.classList.add('right');
            else if (kk === k) bb.classList.add('wrong');
            bb.disabled = true;
          });
          const f = document.createElement('p');
          f.className = 'trivia-fact';
          f.textContent = (ok ? '✅ ' : '❌ ') + q.f;
          box.appendChild(f);
          const next = document.createElement('button');
          next.className = 'trivia-next';
          next.textContent = i === qs.length - 1 ? 'See score' : 'Next →';
          next.addEventListener('click', () => { delete box.dataset.locked; i++; show(); });
          box.appendChild(next);
          setScore(`Score ${right}/${i + 1}`);
        });
        box.appendChild(b);
      });
    }
    setScore(`Score 0/0 · Best ${best('trivia')}/7`);
    show();
    return () => { stage.innerHTML = ''; };
  },
};

// ---------------- 5. Orbital Cleanup ----------------
const cleanup = {
  id: 'cleanup', name: 'Orbital Cleanup', icon: '🛰',
  desc: '← → to move the capture bay. Catch cargo 📦 and fuel 🔋, dodge red debris. 60 seconds!',
  start({ canvas, g, setScore, onEnd }) {
    const W = canvas.width, H = canvas.height;
    let x = W / 2, score = 0, lives = 3, t = 60, over = false, raf;
    const items = [];
    const keys = {};
    const kd = e => { keys[e.key] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); };
    const ku = e => { keys[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    let last = performance.now();

    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (!over) {
        t -= dt;
        if (t <= 0) {
          over = true;
          if (score > best('cleanup')) setBest('cleanup', score);
          onEnd(`⏱ Time! Salvaged ${score} points — best ${best('cleanup')}`);
        }
        if (keys.ArrowLeft || keys.a) x -= 260 * dt;
        if (keys.ArrowRight || keys.d) x += 260 * dt;
        x = Math.max(30, Math.min(W - 30, x));
        const rate = 1.3 + (60 - t) * 0.03;
        if (Math.random() < dt * rate) {
          const r = Math.random();
          items.push({ x: 16 + Math.random() * (W - 32), y: -16, kind: r < 0.5 ? 'cargo' : r < 0.72 ? 'fuel' : 'debris', s: 70 + (60 - t) * 2.2 + Math.random() * 50 });
        }
      }
      g.fillStyle = '#04060f'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#26344f';
      for (let i = 0; i < 36; i++) g.fillRect((i * 83) % W, (i * 59) % H, 2, 2);
      // earth horizon at the bottom
      const eg = g.createLinearGradient(0, H - 26, 0, H);
      eg.addColorStop(0, '#13335f'); eg.addColorStop(1, '#0a1c38');
      g.fillStyle = eg; g.fillRect(0, H - 26, W, 26);

      g.font = '16px sans-serif';
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.s * (over ? 0 : dt);
        if (it.y > H) { items.splice(i, 1); continue; }
        g.fillText(it.kind === 'cargo' ? '📦' : it.kind === 'fuel' ? '🔋' : '🔴', it.x - 8, it.y);
        if (!over && it.y > H - 52 && Math.abs(it.x - x) < 26) {
          if (it.kind === 'debris') {
            lives--;
            if (lives <= 0) {
              over = true;
              if (score > best('cleanup')) setBest('cleanup', score);
              onEnd(`💥 Hull breach! Salvaged ${score} — best ${best('cleanup')}`);
            }
          } else score += it.kind === 'fuel' ? 25 : 10;
          items.splice(i, 1);
        }
      }
      // capture bay
      g.fillStyle = '#9fd0ff';
      g.fillRect(x - 26, H - 44, 52, 7);
      g.fillRect(x - 26, H - 44, 5, 16);
      g.fillRect(x + 21, H - 44, 5, 16);
      g.fillStyle = '#cfd8e8'; g.fillRect(x - 8, H - 56, 16, 12);
      setScore(`⏱ ${Math.max(0, Math.ceil(t))}s · Score ${score} · ${'❤️'.repeat(Math.max(0, lives))} · Best ${best('cleanup')}`);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  },
};

// ---------------- manager ----------------
const GAMES = [asteroidRun, lander, gravityGolf, trivia, cleanup];

export function initGames({ drawer, chipsEl, stageEl, infoEl, scoreEl, openDrawer }) {
  let cleanupFn = null;
  const featured = GAMES[DAY % GAMES.length];

  function stop() {
    if (cleanupFn) { cleanupFn(); cleanupFn = null; }
    stageEl.innerHTML = '';
  }

  function play(game) {
    stop();
    infoEl.textContent = game.desc;
    scoreEl.textContent = '';
    chipsEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.game === game.id));
    const setScore = s => { scoreEl.textContent = s; };
    const onEnd = msg => {
      const bar = document.createElement('div');
      bar.className = 'game-over';
      bar.innerHTML = `<span>${msg}</span><button>Play again</button>`;
      bar.querySelector('button').addEventListener('click', () => play(game));
      stageEl.appendChild(bar);
    };
    if (game.dom) {
      cleanupFn = game.start({ stage: stageEl, setScore, onEnd });
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 352; canvas.height = 430;
      stageEl.appendChild(canvas);
      cleanupFn = game.start({ canvas, g: canvas.getContext('2d'), setScore, onEnd });
    }
  }

  // chips: featured first
  const ordered = [featured, ...GAMES.filter(g => g !== featured)];
  for (const game of ordered) {
    const b = document.createElement('button');
    b.className = 'chip';
    b.dataset.game = game.id;
    b.innerHTML = game === featured ? `⭐ ${game.icon} ${game.name}` : `${game.icon} ${game.name}`;
    if (game === featured) b.title = "Today's featured game";
    b.addEventListener('click', () => play(game));
    chipsEl.appendChild(b);
  }

  return {
    open() { openDrawer(drawer); if (!cleanupFn) play(featured); },
    stop,
  };
}

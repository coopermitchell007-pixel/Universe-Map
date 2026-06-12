// ============================================================
// Extras — deep-space probes, comets, nebulae, pulsars,
// cosmic events (GRB / gravitational waves) and live
// near-Earth asteroids. Each builder adds objects to a level
// group and returns an update(dt) hook.
// ============================================================
import * as THREE from 'three';
import * as TEX from './textures.js';

const dotTex = TEX.circleTexture('#ffffff');

// stylised AU → solar-scene units (matches planet layout in data.js)
const AU_ANCHORS = [
  [0.39, 28], [0.72, 40], [1, 52], [1.52, 64], [2.77, 80], [5.2, 95],
  [9.6, 130], [19.2, 165], [30.1, 195], [39.5, 222], [45.8, 238],
  [67.5, 246], [76, 268], [200, 330],
];
export function auToUnits(au) {
  if (au <= AU_ANCHORS[0][0]) return AU_ANCHORS[0][1] * (au / AU_ANCHORS[0][0]);
  for (let i = 1; i < AU_ANCHORS.length; i++) {
    const [a0, u0] = AU_ANCHORS[i - 1], [a1, u1] = AU_ANCHORS[i];
    if (au <= a1) return u0 + (u1 - u0) * (au - a0) / (a1 - a0);
  }
  const [a0, u0] = AU_ANCHORS[AU_ANCHORS.length - 2];
  const [a1, u1] = AU_ANCHORS[AU_ANCHORS.length - 1];
  return u1 + (u1 - u0) * (au - a1) / (a1 - a0) * 0.4; // gentle extrapolation
}

// ------------------------------------------------------------
// Deep-space probes — humanity's most distant machines.
// Distances extrapolated live from a 2026-01-01 epoch + real speed.
// ------------------------------------------------------------
const EPOCH = Date.UTC(2026, 0, 1);
const KM_PER_AU = 1.496e8;
const PROBES = [
  {
    id: 'voyager1', name: 'Voyager 1', launched: '5 September 1977',
    epochAU: 168.0, kms: 16.95, dir: [0.62, 0.57, -0.54],
    sub: 'The farthest human-made object',
    desc: `Launched in 1977 with a golden record of Earth's sounds and music, Voyager 1 flew past Jupiter and Saturn and kept going. In 2012 it became the first spacecraft to enter interstellar space. It is now the most distant object humanity has ever built, still whispering data home with a transmitter no more powerful than a refrigerator light bulb. Its signal takes nearly a full day to reach Earth.`,
  },
  {
    id: 'voyager2', name: 'Voyager 2', launched: '20 August 1977',
    epochAU: 140.3, kms: 15.3, dir: [-0.45, -0.74, 0.5],
    sub: 'The only spacecraft to visit all four giant planets',
    desc: `Voyager 2 remains the only spacecraft ever to visit Uranus and Neptune — everything we know about those worlds up close came from its brief flybys in 1986 and 1989. It crossed into interstellar space in 2018. Both Voyagers carry the Golden Record: greetings in 55 languages, whale song, Chuck Berry, and instructions for finding Earth.`,
  },
  {
    id: 'newhorizons', name: 'New Horizons', launched: '19 January 2006',
    epochAU: 61.5, kms: 13.8, dir: [0.3, 0.05, 0.95],
    sub: 'The Pluto explorer, still going',
    desc: `The fastest spacecraft ever launched from Earth, New Horizons gave us our first — and so far only — close-up of Pluto in 2015, revealing its now-famous heart. In 2019 it flew past Arrokoth, the most distant object ever explored. It is now crossing the Kuiper Belt outbound, with power to keep operating into the 2040s.`,
  },
  {
    id: 'pioneer10', name: 'Pioneer 10', launched: '3 March 1972',
    epochAU: 137.5, kms: 11.9, dir: [-0.9, 0.06, -0.43],
    sub: 'First through the asteroid belt — now silent',
    desc: `The first spacecraft to cross the asteroid belt and the first to fly past Jupiter. Contact was lost in 2003 when its power finally faded, but Pioneer 10 coasts on forever, carrying a gold plaque showing a man, a woman, and Earth's address in the galaxy. It is headed toward the star Aldebaran — arrival in roughly two million years.`,
  },
  {
    id: 'pioneer11', name: 'Pioneer 11', launched: '6 April 1973',
    epochAU: 117.0, kms: 11.1, dir: [0.2, -0.35, -0.91],
    sub: 'First to Saturn — now silent',
    desc: `Pioneer 11 was the first spacecraft to fly past Saturn, threading between the planet and its rings in 1979 to prove the route was survivable for the Voyagers behind it. Its signal fell silent in 1995. Like its twin, it carries the Pioneer plaque — a message to whoever, or whatever, finds it.`,
  },
];

export function addProbes({ group, pickables, refreshIfOpen, registerSearch }) {
  const nodes = [];
  for (const p of PROBES) {
    const node = new THREE.Group();
    const dir = new THREE.Vector3(...p.dir).normalize();
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture('rgba(255,235,180,1)'), transparent: true, depthWrite: false }));
    sp.scale.setScalar(4.5);
    const lb = TEX.makeLabel(p.name, { size: 3, color: '#ffe9a8' });
    lb.position.y = 4;
    node.add(sp, lb);

    const auNow = () => p.epochAU + p.kms * ((Date.now() - EPOCH) / 1000) / KM_PER_AU;
    const info = () => {
      const au = auNow();
      const km = au * KM_PER_AU;
      const lightHours = km / 299792 / 3600;
      return {
        id: 'probe-' + p.id, name: p.name, subtitle: p.sub,
        stats: [
          ['Launched', p.launched],
          ['Distance from the Sun right now', `≈ ${au.toFixed(3)} AU — ${Math.round(km).toLocaleString()} km`],
          ['Speed', p.kms + ' km/s (' + Math.round(p.kms * 3600).toLocaleString() + ' km/h)'],
          ['One-way light time', lightHours.toFixed(1) + ' hours'],
          ['Status', p.id.startsWith('pioneer') ? 'Silent — coasting forever' : '● Still transmitting'],
        ],
        desc: p.desc + ' The distance shown above is extrapolated live from its real position and speed — watch it grow.',
      };
    };
    node.userData.info = info();
    node.userData.infoFn = info;
    node.userData.pickPriority = 2;
    node.userData.focusable = true;
    node.userData.focusDist = 16;
    group.add(node);
    pickables.push(node);
    nodes.push({ node, p, dir, info, auNow });
    node.position.copy(dir).multiplyScalar(auToUnits(auNow()));
    if (registerSearch) registerSearch({
      name: p.name, sub: p.sub, info,
      getWorldPos: () => node.getWorldPosition(new THREE.Vector3()), dist: 16, obj: node,
    });
  }
  let timer = 0;
  return {
    update(dt) {
      timer += dt;
      if (timer < 1) return; // reposition + live panel refresh once a second
      timer = 0;
      for (const n of nodes) {
        n.node.position.copy(n.dir).multiplyScalar(auToUnits(n.auNow()));
        const inf = n.info();
        n.node.userData.info = inf;
        if (refreshIfOpen) refreshIfOpen(inf);
      }
    },
  };
}

// ------------------------------------------------------------
// Comets — real orbits (scaled), tails always pointing anti-sunward
// ------------------------------------------------------------
const COMETS = [
  {
    id: 'halley', name: "Halley's Comet", periAU: 0.586, apoAU: 35.1, tilt: 2.83,
    color: 0xbfe8ff, startAnom: 2.4,
    sub: 'The most famous comet — returns 2061',
    stats: [
      ['Orbital period', '≈ 75–79 years'], ['Last perihelion', '1986'],
      ['Next return', '28 July 2061'], ['Nucleus', '15 × 8 km — darker than coal'],
      ['Orbit', 'Retrograde — it circles the Sun backwards'],
    ],
    desc: `The only naked-eye comet that can appear twice in one human lifetime, recorded by astronomers since at least 240 BC — it is stitched into the Bayeux Tapestry and was once feared as an omen. Edmond Halley realised in 1705 that the comets of 1531, 1607 and 1682 were one object, and predicted its return after his death. Every October the Orionid meteor shower is Earth flying through Halley's dust trail.`,
  },
  {
    id: 'halebopp', name: 'Comet Hale–Bopp', periAU: 0.914, apoAU: 70, tilt: 1.55,
    color: 0xd8ccff, startAnom: 0.8,
    sub: 'The Great Comet of 1997',
    stats: [
      ['Orbital period', '≈ 2,500 years'], ['Perihelion', 'April 1997'],
      ['Visible to the naked eye', 'A record 18 months'],
      ['Nucleus', '≈ 60 km — unusually enormous'],
    ],
    desc: `One of the brightest comets of the 20th century, visible to the naked eye for a record 18 months in 1996–97 and seen by more people than any comet in history. Its nucleus is a giant among comets — around 60 km across. It will not return until roughly the year 4385. (Its full orbit reaches ~370 AU; it is shown compressed here to stay on the map.)`,
  },
];

export function addComets({ group, pickables, getDaysPerSec, registerSearch }) {
  const GM = 4 * Math.PI * Math.PI * Math.pow(52, 3) / Math.pow(365.25, 2); // Earth at 52u, 365.25d
  const list = [];
  for (const c of COMETS) {
    const rp = auToUnits(c.periAU), ra = auToUnits(c.apoAU);
    const a = (rp + ra) / 2, e = (ra - rp) / (ra + rp);
    const h = Math.sqrt(GM * a * (1 - e * e)); // specific angular momentum (per day units)
    const pivot = new THREE.Group();
    pivot.rotation.x = c.tilt;
    group.add(pivot);

    const node = new THREE.Group();
    const colHex = '#' + new THREE.Color(c.color).getHexString();
    const nucleus = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture(`rgba(220,240,255,1)`), transparent: true, depthWrite: false }));
    nucleus.scale.setScalar(4);
    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 10, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    tail.userData.noPick = true;
    const lb = TEX.makeLabel(c.name, { size: 2.6, color: colHex });
    lb.position.y = 4;
    node.add(nucleus, tail, lb);
    node.userData.info = { id: 'comet-' + c.id, name: c.name, subtitle: c.sub, stats: c.stats, desc: c.desc };
    node.userData.pickPriority = 2;
    node.userData.focusable = true;
    node.userData.focusDist = 14;
    pivot.add(node);
    pickables.push(node);

    // faint orbit line
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const th = (i / 128) * Math.PI * 2;
      const r = a * (1 - e * e) / (1 + e * Math.cos(th));
      pts.push(new THREE.Vector3(Math.cos(th) * r, 0, Math.sin(th) * r));
    }
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: c.color, transparent: true, opacity: 0.14 }));
    line.userData.noPick = true;
    pivot.add(line);

    list.push({ c, node, tail, a, e, h, theta: c.startAnom });
    if (registerSearch) registerSearch({
      name: c.name, sub: c.sub, info: node.userData.info, obj: node,
      getWorldPos: () => node.getWorldPosition(new THREE.Vector3()), dist: 14,
    });
  }
  const sunWorld = new THREE.Vector3(0, 0, 0);
  const tmp = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  return {
    update(dt) {
      const days = dt * (getDaysPerSec ? getDaysPerSec() : 4);
      for (const o of list) {
        const r = o.a * (1 - o.e * o.e) / (1 + o.e * Math.cos(o.theta));
        o.theta += days * o.h / (r * r);
        o.node.position.set(Math.cos(o.theta) * r, 0, Math.sin(o.theta) * r);
        // tail points away from the sun, longer when close
        o.node.getWorldPosition(tmp);
        const dir = tmp.sub(sunWorld).normalize();
        const local = o.node.parent.worldToLocal(o.node.position.clone().add(dir)).sub(o.node.position).normalize();
        const act = THREE.MathUtils.clamp(120 / r, 0.25, 3.4);
        o.tail.scale.set(act * 0.8, act, act * 0.8);
        o.tail.quaternion.setFromUnitVectors(up, local);
        o.tail.position.copy(local).multiplyScalar(5 * act);
        o.tail.material.opacity = THREE.MathUtils.clamp(0.08 + act * 0.12, 0.1, 0.5);
      }
    },
  };
}

// ------------------------------------------------------------
// Famous nebulae — Milky Way level
// ------------------------------------------------------------
const NEBULAE = [
  {
    id: 'orionneb', name: 'Orion Nebula (M42)', ly: 1344, hues: ['rgba(255,120,160,1)', 'rgba(140,180,255,1)'], size: 9,
    sub: 'The nearest great stellar nursery',
    stats: [['Distance', '1,344 light-years'], ['Diameter', '≈ 24 light-years'], ['Visible to naked eye', 'Yes — the "star" in Orion\'s sword'], ['Newborn stars inside', '≈ 700']],
    desc: `The closest massive star-forming region to Earth, visible to the naked eye as the fuzzy middle "star" of Orion's sword. Inside its glowing folds of gas, around 700 new stars are condensing right now — pointing a telescope at M42 is watching solar systems being born. Our own Sun likely formed in a nebula just like it.`,
  },
  {
    id: 'crabneb', name: 'Crab Nebula (M1)', ly: 6500, hues: ['rgba(160,220,255,1)', 'rgba(255,180,120,1)'], size: 6,
    sub: 'Supernova remnant — exploded in 1054',
    stats: [['Distance', '6,500 light-years'], ['The explosion seen on Earth', '4 July 1054 — visible in daylight for 23 days'], ['Expanding at', '1,500 km/s'], ['At its heart', 'A pulsar spinning 30 times per second']],
    desc: `The wreckage of a star that Chinese and Japanese astronomers watched explode in 1054 AD — for three weeks it shone in broad daylight. The debris cloud is still expanding at 1,500 km/s, and at its centre the star's crushed core survives as the Crab Pulsar, a city-sized sphere spinning 30 times every second. Click the pulsar beside it.`,
  },
  {
    id: 'eagleneb', name: 'Eagle Nebula (M16)', ly: 7000, hues: ['rgba(170,255,200,1)', 'rgba(255,220,140,1)'], size: 8,
    sub: 'Home of the Pillars of Creation',
    stats: [['Distance', '≈ 7,000 light-years'], ['Famous feature', 'The Pillars of Creation'], ['Pillar height', 'Up to 4–5 light-years'], ['Photographed', 'Hubble 1995 & 2014, JWST 2022']],
    desc: `Home of the most famous astronomical photograph ever taken: the Pillars of Creation — towers of cold gas four light-years tall, sculpted by the radiation of newborn stars, with more stars condensing inside them. The 1995 Hubble image changed how the public saw the universe; in 2022 the James Webb telescope reshot it in infrared, seeing straight through the dust to the stars being born within.`,
  },
  {
    id: 'carinaneb', name: 'Carina Nebula', ly: 8500, hues: ['rgba(255,170,120,1)', 'rgba(150,160,255,1)'], size: 10,
    sub: 'The Cosmic Cliffs — JWST\'s first deep view',
    stats: [['Distance', '≈ 8,500 light-years'], ['Size', '≈ 300 light-years — one of the largest nebulae known'], ['Contains', 'Eta Carinae, a star ready to explode'], ['Famous image', 'JWST "Cosmic Cliffs", July 2022']],
    desc: `A colossal star factory four times larger than Orion, hiding some of the most massive stars known — including the unstable monster Eta Carinae, which could go supernova at any time. The James Webb telescope's debut image in July 2022, the "Cosmic Cliffs", was a tiny corner of this nebula: mountains of glowing gas seven light-years high.`,
  },
  {
    id: 'ringneb', name: 'Ring Nebula (M57)', ly: 2570, hues: ['rgba(150,255,220,1)', 'rgba(255,160,200,1)'], size: 4,
    sub: 'A dying star — the Sun\'s future',
    stats: [['Distance', '2,570 light-years'], ['Type', 'Planetary nebula'], ['Age', '≈ 7,000 years old'], ['Central star', 'A white dwarf — the core of the dead star']],
    desc: `A perfect smoke-ring of glowing gas — the shed outer layers of a Sun-like star that died 7,000 years ago, lit from inside by its exposed white-hot core. This is the Sun's own future: in about 7.8 billion years, our star will puff itself into a nebula like this one, briefly becoming the most beautiful thing in the sky of whatever worlds remain.`,
  },
  {
    id: 'helixneb', name: 'Helix Nebula', ly: 655, hues: ['rgba(140,230,255,1)', 'rgba(255,190,130,1)'], size: 5,
    sub: '"The Eye of God"',
    stats: [['Distance', '655 light-years'], ['Type', 'Planetary nebula — the nearest one'], ['Apparent size', 'Half the full Moon in our sky'], ['Nickname', 'The Eye of God']],
    desc: `The nearest planetary nebula to Earth, so large in our sky that it spans half the width of the full Moon (though far too faint to see unaided). Its layered shells of gas, staring back at us like a vast iris, earned it the nickname "the Eye of God". The white dwarf at its centre is destined to cool for billions of years into a cold black cinder.`,
  },
];

export function addNebulae({ spin, pickables, sunPos, starDist, registerSearch }) {
  NEBULAE.forEach((nb, i) => {
    const node = new THREE.Group();
    const a = (i + 0.5) * 2.39996 + 1.1;
    const yy = (((i * 0.71) % 1) - 0.5) * 0.7;
    const dir = new THREE.Vector3(Math.cos(a), yy, Math.sin(a)).normalize();
    node.position.copy(sunPos).addScaledVector(dir, starDist(nb.ly) + 1.5);
    nb.hues.forEach((h, k) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: TEX.glowTexture(h), transparent: true, opacity: k === 0 ? 0.85 : 0.5, depthWrite: false }));
      sp.scale.setScalar(nb.size * (1 - k * 0.4));
      sp.position.set((k - 0.5) * nb.size * 0.25, k * nb.size * 0.12, 0);
      sp.userData.noPick = k > 0;
      node.add(sp);
    });
    const lb = TEX.makeLabel(nb.name.replace(/ \(.*\)/, ''), { size: 1.8, color: '#ffc8e8' });
    lb.position.y = nb.size * 0.55 + 1.2;
    node.add(lb);
    node.userData.info = { id: 'neb-' + nb.id, name: nb.name, subtitle: nb.sub, stats: nb.stats, desc: nb.desc };
    node.userData.pickPriority = 2;
    node.userData.focusable = true;
    node.userData.focusDist = nb.size * 2.5;
    spin.add(node);
    pickables.push(node);
    if (registerSearch) registerSearch({
      name: nb.name, sub: nb.sub, info: node.userData.info, obj: node,
      getWorldPos: () => node.getWorldPosition(new THREE.Vector3()), dist: nb.size * 2.5,
    });
  });
}

// ------------------------------------------------------------
// Pulsars — lighthouse beams you can watch sweep
// ------------------------------------------------------------
const PULSARS = [
  {
    id: 'crabpulsar', name: 'Crab Pulsar', ly: 6500, spin: 30.2, dirSeed: 1.6,
    sub: 'A city-sized star spinning 30 times a second',
    stats: [['Distance', '6,500 light-years'], ['Diameter', '≈ 20 km — a city, weighing more than the Sun'], ['Rotation', '30.2 times per second'], ['Born', 'In the supernova of 1054 AD'], ['Density', 'A teaspoon weighs ~1 billion tonnes']],
    desc: `The collapsed core of the star that exploded in 1054, leaving the Crab Nebula around it. It crams 1.4 Suns of matter into a sphere 20 km wide and spins 30 times per second, sweeping beams of radiation across space like a lighthouse — the flashes are visible from Earth in radio, light, X-rays and gamma rays. The beams shown here sweep far slower than the real thing, which would be a blur.`,
  },
  {
    id: 'velapulsar', name: 'Vela Pulsar', ly: 959, spin: 11.2, dirSeed: 4.4,
    sub: 'The brightest gamma-ray source in the sky',
    stats: [['Distance', '959 light-years'], ['Rotation', '11.2 times per second'], ['Age', '≈ 11,000 years'], ['Note', 'Occasionally "glitches" — starquakes that snap its spin faster']],
    desc: `Born in a supernova about 11,000 years ago, the Vela Pulsar is the brightest persistent source of gamma rays in Earth's sky. It occasionally "glitches" — its crust of solid nuclear matter cracks and snaps the whole star into a faster spin, a starquake on a body where a sugar-cube of material outweighs a mountain range.`,
  },
];

export function addPulsars({ spin, pickables, sunPos, starDist, registerSearch }) {
  const spinners = [];
  PULSARS.forEach((pl, i) => {
    const node = new THREE.Group();
    const a = pl.dirSeed;
    const dir = new THREE.Vector3(Math.cos(a), 0.18 - i * 0.3, Math.sin(a)).normalize();
    node.position.copy(sunPos).addScaledVector(dir, starDist(pl.ly) - 0.6);
    const core = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture('rgba(190,220,255,1)'), transparent: true, depthWrite: false }));
    core.scale.setScalar(1.8);
    node.add(core);
    const beamHolder = new THREE.Group();
    beamHolder.rotation.z = 0.5; // magnetic axis tilted off the spin axis
    for (const s of [1, -1]) {
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 7, 10, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xaad4ff, transparent: true, opacity: 0.3,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      beam.position.y = s * 3.5;
      beam.rotation.z = s === 1 ? 0 : Math.PI;
      beam.userData.noPick = true;
      beamHolder.add(beam);
    }
    node.add(beamHolder);
    const lb = TEX.makeLabel(pl.name, { size: 1.6, color: '#aad4ff' });
    lb.position.y = 4.6;
    node.add(lb);
    node.userData.info = { id: 'psr-' + pl.id, name: pl.name, subtitle: pl.sub, stats: pl.stats, desc: pl.desc };
    node.userData.pickPriority = 2;
    node.userData.focusable = true;
    node.userData.focusDist = 12;
    spin.add(node);
    pickables.push(node);
    spinners.push(beamHolder);
    if (registerSearch) registerSearch({
      name: pl.name, sub: pl.sub, info: node.userData.info, obj: node,
      getWorldPos: () => node.getWorldPosition(new THREE.Vector3()), dist: 12,
    });
  });
  return { update(dt) { for (const b of spinners) b.rotation.y += dt * 9; } };
}

// ------------------------------------------------------------
// Cosmic events — GRBs & gravitational waves (universe level)
// ------------------------------------------------------------
const EVENTS = [
  {
    id: 'grb-boat', name: 'GRB 221009A — "the BOAT"', color: 0xffd080,
    sub: 'The brightest explosion ever recorded',
    stats: [['Distance', '2.4 billion light-years'], ['Detected', '9 October 2022'], ['Nickname', 'The BOAT — "Brightest Of All Time"'], ['Energy', 'More than the Sun will emit in its entire 10-billion-year life'], ['Effect on Earth', 'Measurably disturbed our ionosphere from 2.4 billion ly away']],
    desc: `On 9 October 2022, a dying giant star 2.4 billion light-years away collapsed into a black hole and fired a jet of gamma rays straight at Earth — the brightest burst of light ever recorded, an event so rare it's estimated to happen once in 10,000 years. Despite the unimaginable distance, it physically disturbed Earth's upper atmosphere. Gamma-ray bursts are the most violent explosions in the universe since the Big Bang.`,
  },
  {
    id: 'gw150914', name: 'GW150914 — first gravitational wave', color: 0x88c8ff,
    sub: 'Two black holes collide — spacetime itself rings',
    stats: [['Distance', '≈ 1.3 billion light-years'], ['Detected', '14 September 2015 — LIGO'], ['What collided', 'Black holes of 36 & 29 solar masses'], ['Converted to pure ripples', '3 Suns of mass, in 0.2 seconds'], ['Prize', 'Nobel Prize in Physics 2017']],
    desc: `A century after Einstein predicted them, the LIGO detectors felt spacetime itself stretch and squeeze — by less than a thousandth of a proton's width — as two black holes spiralled together and merged 1.3 billion light-years away. In the final fifth of a second, three Suns' worth of mass became pure gravitational radiation, briefly out-powering every star in the observable universe combined. The ripples shown here are, of course, enormously slowed down.`,
  },
  {
    id: 'gw170817', name: 'GW170817 — the kilonova', color: 0xffe8a0,
    sub: 'Where gold comes from',
    stats: [['Distance', '130 million light-years'], ['Detected', '17 August 2017'], ['What collided', 'Two neutron stars'], ['Forged in the debris', '≈ 10 Earths\' worth of gold & platinum'], ['Note', 'First event seen in both gravitational waves AND light']],
    desc: `Two neutron stars spiralled into each other and the universe rang like a bell — then, 1.7 seconds later, telescopes saw the flash. The radioactive fireball that followed forged heavy elements on the spot: an estimated ten Earth-masses of gold and platinum, scattered into space. The gold in your jewellery, the iodine in your blood — atoms like those were made in collisions exactly like this one.`,
  },
];

export function addCosmicEvents({ spin, pickables, positions, registerSearch }) {
  const ripples = [];
  EVENTS.forEach((ev, i) => {
    const node = new THREE.Group();
    node.position.copy(positions[i % positions.length]);
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture(`rgba(${(ev.color >> 16) & 255},${(ev.color >> 8) & 255},${ev.color & 255},1)`),
      transparent: true, opacity: 0.95, depthWrite: false }));
    flash.scale.setScalar(12);
    const lb = TEX.makeLabel(ev.name.split(' — ')[0], { size: 9, color: '#ffe2b0' });
    lb.position.y = 13;
    node.add(flash, lb);
    const rings = [];
    for (let k = 0; k < 3; k++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.12, 8, 64),
        new THREE.MeshBasicMaterial({ color: ev.color, transparent: true, opacity: 0.5,
          blending: THREE.AdditiveBlending, depthWrite: false }));
      ring.rotation.x = Math.PI / 2 - 0.4;
      ring.userData.noPick = true;
      node.add(ring);
      rings.push({ ring, off: k * 2.2 });
    }
    node.userData.info = { id: 'ev-' + ev.id, name: ev.name, subtitle: ev.sub, stats: ev.stats, desc: ev.desc };
    node.userData.pickPriority = 2;
    node.userData.focusable = true;
    node.userData.focusDist = 60;
    spin.add(node);
    pickables.push(node);
    ripples.push({ rings, flash, t: i * 2.1 });
    if (registerSearch) registerSearch({
      name: ev.name, sub: ev.sub, info: node.userData.info, obj: node,
      getWorldPos: () => node.getWorldPosition(new THREE.Vector3()), dist: 60,
    });
  });
  const PERIOD = 6.5;
  return {
    update(dt) {
      for (const r of ripples) {
        r.t += dt;
        for (const { ring, off } of r.rings) {
          const ph = ((r.t + off) % PERIOD) / PERIOD;
          const s = 1 + ph * 34;
          ring.scale.setScalar(s);
          ring.material.opacity = 0.5 * (1 - ph);
        }
        r.flash.material.opacity = 0.6 + 0.35 * Math.sin(r.t * 3);
      }
    },
  };
}

// ------------------------------------------------------------
// Near-Earth asteroids — live from NASA NeoWs (today's close approaches)
// ------------------------------------------------------------
export function addNEOs({ group, pickables, registerSearch, onLoaded }) {
  const rocks = [];
  (async () => {
    try {
      const d = new Date().toISOString().slice(0, 10);
      const res = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${d}&end_date=${d}&api_key=DEMO_KEY`,
        { signal: AbortSignal.timeout(9000) });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = await res.json();
      const all = Object.values(data.near_earth_objects || {}).flat();
      all.sort((a, b) =>
        parseFloat(a.close_approach_data[0]?.miss_distance.lunar || 99) -
        parseFloat(b.close_approach_data[0]?.miss_distance.lunar || 99));
      const top = all.slice(0, 6);
      top.forEach((neo, i) => {
        const ca = neo.close_approach_data[0];
        const lunar = parseFloat(ca.miss_distance.lunar);
        const dist = THREE.MathUtils.clamp(640 + lunar * 42, 660, 1340);
        const seed = neo.name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
        const a = (seed % 360) * Math.PI / 180;
        const y = ((seed % 17) - 8) * 22;
        const node = new THREE.Group();
        node.position.set(Math.cos(a) * dist, y, Math.sin(a) * dist);
        const haz = neo.is_potentially_hazardous_asteroid;
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({
          map: TEX.glowTexture(haz ? 'rgba(255,150,120,1)' : 'rgba(200,200,190,1)'),
          transparent: true, depthWrite: false }));
        sp.scale.setScalar(9);
        const shortName = neo.name.replace(/[()]/g, '');
        const lb = TEX.makeLabel(shortName, { size: 7, color: haz ? '#ffb09a' : '#d8d8cf' });
        lb.position.y = 9;
        node.add(sp, lb);
        const dm = neo.estimated_diameter.meters;
        node.userData.info = {
          id: 'neo-' + neo.id, name: shortName,
          subtitle: (haz ? '⚠ Potentially hazardous asteroid' : 'Near-Earth asteroid') + ' — passing today',
          stats: [
            ['Estimated size', `${Math.round(dm.estimated_diameter_min)}–${Math.round(dm.estimated_diameter_max)} m across`],
            ['Closest approach', ca.close_approach_date_full || ca.close_approach_date],
            ['Miss distance', `${Math.round(parseFloat(ca.miss_distance.kilometers)).toLocaleString()} km — ${lunar.toFixed(1)} lunar distances`],
            ['Relative speed', parseFloat(ca.relative_velocity.kilometers_per_second).toFixed(1) + ' km/s'],
            ['Potentially hazardous?', haz ? 'Yes — large & close enough to deserve monitoring' : 'No'],
          ],
          desc: `A real asteroid making a close approach to Earth today, from NASA's Near-Earth Object program — which tracks over 34,000 asteroids whose orbits bring them near our planet. ${haz ? '"Potentially hazardous" means it is bigger than ~140 m and comes within 7.5 million km of Earth\'s orbit — worth watching, but not on a collision course.' : 'Close approaches like this happen every single day; the sky is busier than it looks.'} (Its position on the map is illustrative; the distance data is real.)`,
        };
        node.userData.pickPriority = 2;
        node.userData.focusable = true;
        node.userData.focusDist = 40;
        node.userData.driftA = a;
        node.userData.driftR = dist;
        node.userData.driftY = y;
        group.add(node);
        pickables.push(node);
        rocks.push(node);
        if (registerSearch) registerSearch({
          name: shortName, sub: 'Near-Earth asteroid — today', info: node.userData.info, obj: node,
          getWorldPos: () => node.getWorldPosition(new THREE.Vector3()), dist: 40,
        });
      });
      if (top.length && onLoaded) onLoaded(top.length);
    } catch (e) { console.warn('NeoWs unavailable (rate limit or offline):', e); }
  })();
  let t = Math.random() * 100;
  return {
    update(dt) {
      t += dt;
      for (const n of rocks) {
        const a = n.userData.driftA + t * 0.004;
        n.position.set(Math.cos(a) * n.userData.driftR, n.userData.driftY + Math.sin(t * 0.1 + a) * 8, Math.sin(a) * n.userData.driftR);
      }
    },
  };
}

// ------------------------------------------------------------
// Photon ring for Sagittarius A* — a simple lensing-look halo
// ------------------------------------------------------------
export function addLensingRing({ parent }) {
  const ringGroup = new THREE.Group();
  const photon = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.28, 12, 80),
    new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false }));
  const haze = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.9, 12, 80),
    new THREE.MeshBasicMaterial({ color: 0xff8840, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false }));
  const disc = new THREE.Mesh(
    new THREE.RingGeometry(3.8, 7.5, 64),
    new THREE.MeshBasicMaterial({ color: 0xffaa55, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  disc.rotation.x = Math.PI / 2 - 0.35;
  photon.userData.noPick = haze.userData.noPick = disc.userData.noPick = true;
  ringGroup.add(photon, haze, disc);
  ringGroup.rotation.x = 0.45;
  parent.add(ringGroup);
  return { update(dt) { disc.rotation.z += dt * 0.4; } };
}

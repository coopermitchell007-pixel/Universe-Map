// ============================================================
// Tech Map — rendered as a giant printed circuit board.
// SpaceX, Tesla and Future-Tech are processor chips wired across
// an FR4 board; every node is a component soldered to copper
// traces, with signal pulses flowing between them. Toggled with
// the ⚡ Tech button; the news/video drawers switch to tech mode.
// ============================================================
import * as THREE from 'three';
import * as TEX from './textures.js';

const CLUSTERS = [
  {
    id: 'spacex', name: 'SPACEX', ref: 'U1', color: 0xffb070, pos: [-92, -58],
    sub: 'Making life multiplanetary',
    desc: `Founded in 2002 with the explicit goal of making humanity a multiplanetary species. SpaceX rewrote the economics of spaceflight by landing and reflying orbital rockets — something previously considered impossible — and now launches more mass to orbit each year than the rest of the world combined.`,
    stats: [['Founded', '2002'], ['First orbital landing', 'December 2015'], ['Workhorse', 'Falcon 9 — flown hundreds of times'], ['Next', 'Starship: full reusability, Moon & Mars']],
    nodes: [
      {
        id: 'starship', name: 'Starship', ref: 'Q1', sub: 'The largest flying object ever built',
        stats: [['Height (full stack)', '121 m — taller than Saturn V'], ['Thrust at liftoff', '≈ 7,500 tonnes — about 2× Saturn V'], ['Engines', '33 Raptors on the booster + 6 on the ship'], ['Payload (reusable)', '100–150 tonnes to orbit'], ['Key trick', 'Both stages fly home — the booster is caught mid-air by the launch tower'], ['Role', 'NASA\'s Artemis lunar lander · Mars architecture']],
        desc: `The vehicle designed to make the rest of this map reachable. Starship is fully reusable — booster and ship both fly back — which is the single technology that turns Mars from a flags-and-footprints stunt into a place you can ship a million tonnes of cargo. Its first-stage booster returns to the pad and is caught by giant mechanical arms ("chopsticks") on the launch tower, a manoeuvre that looked like science fiction until SpaceX did it in 2024. NASA has contracted Starship to land the next astronauts on the Moon.`,
      },
      {
        id: 'falcon9', name: 'Falcon 9', ref: 'Q2', sub: 'The rocket that changed everything',
        stats: [['First flight', '2010'], ['First droneship landing', 'April 2016'], ['Reuse record', 'Single boosters reflown 25+ times'], ['Launch cadence', 'Roughly every 2–3 days'], ['Reliability', 'The most-flown US rocket in history']],
        desc: `Before Falcon 9, every orbital rocket in history was thrown away after one use — imagine scrapping a 747 after each flight. Falcon 9's first stage flips around, reignites its engines, and lands upright on a ship in the ocean. What was mocked as impossible is now so routine that landings barely make the news. It carries crews to the ISS, launched most satellites currently in orbit, and made access to space cheap enough for whole new industries to exist.`,
      },
      {
        id: 'raptor', name: 'Raptor Engine', ref: 'Q3', sub: 'The most advanced rocket engine flying',
        stats: [['Cycle', 'Full-flow staged combustion — the first ever to fly'], ['Propellant', 'Methane + liquid oxygen ("methalox")'], ['Thrust', '≈ 280 tonnes from an engine the size of a car'], ['Why methane?', 'It can be manufactured on Mars from CO₂ and ice'], ['Production', 'Built on an assembly line, aiming at one per day']],
        desc: `Raptor burns methane and oxygen in a "full-flow staged combustion" cycle — the holy grail of rocket engineering, studied by the US and Soviet programs for decades but never flown before. Every drop of propellant drives the turbines before burning, squeezing out maximum efficiency. The deeper reason for methane: you can make it on Mars from the atmosphere and buried ice using a century-old chemical reaction, so ships can refuel for the trip home.`,
      },
      {
        id: 'starlink', name: 'Starlink', ref: 'Q4', sub: 'The largest satellite constellation in history',
        stats: [['Active satellites', '≈ 8,000 — more than half of everything in orbit'], ['Users', 'Millions, on every continent'], ['Orbit', '≈ 550 km — low enough to self-clean (deorbits in years, not centuries)'], ['Inter-satellite links', 'Lasers — data crosses oceans in space'], ['Seen from Earth', 'The "string of pearls" after each launch']],
        desc: `A mesh of thousands of satellites beaming broadband to anywhere on Earth — ships, war zones, Antarctic bases, your cabin. Satellites talk to each other with lasers, so data can cross an ocean entirely in space, faster than undersea fibre. Zoom into the Earth level of this map and a large fraction of the satellites you'll click on are Starlinks. It is also the revenue engine intended to pay for Mars.`,
      },
      {
        id: 'dragon', name: 'Dragon', ref: 'Q5', sub: 'America\'s crew spacecraft',
        stats: [['First crewed flight', 'May 2020 — first private vehicle to carry humans to orbit'], ['Capacity', 'Up to 7 astronauts'], ['Missions', 'ISS crew rotation, private flights, first commercial spacewalk (2024)'], ['Landing', 'Splashdown under parachutes, then reused']],
        desc: `In 2020, Dragon ended a nine-year gap in American human spaceflight, becoming the first privately built spacecraft ever to carry astronauts to orbit. It now ferries crews to the ISS routinely, has flown all-private missions, and in 2024 hosted the first commercial spacewalk. The capsule is reused, flight after flight.`,
      },
      {
        id: 'mars-plan', name: 'The Mars Plan', ref: 'Q6', sub: 'A self-sustaining city by ~2050?',
        stats: [['Goal', 'A million-person, self-sustaining city on Mars'], ['Vehicle', 'Fleets of Starships, launched in waves every 26 months'], ['Fuel for the trip home', 'Made on Mars: CO₂ + ice → methane + oxygen'], ['Why', '"Making life multiplanetary" — a backup of civilisation'], ['Status', 'Uncrewed test landings planned first']],
        desc: `Every 26 months, Earth and Mars align for the cheapest crossing — the plan is to launch fleets of Starships in each window, first cargo, then crews. Propellant factories would split Martian ice and air into methane and oxygen for the return trips. The stated goal is a city of a million people that survives even if the ships stop coming: a civilisational backup. Wildly ambitious, possibly decades optimistic — but it is the only Mars settlement program with hardware actually flying.`,
      },
    ],
  },
  {
    id: 'tesla', name: 'TESLA', ref: 'U2', color: 0xff7068, pos: [96, -52],
    sub: 'Accelerating sustainable energy — and robots',
    desc: `Tesla's stated mission is to accelerate the world's transition to sustainable energy: electric vehicles, grid-scale batteries, and solar. Along the way it became an AI and robotics company — its cars are robots that drive, its factories increasingly run on the same intelligence, and Optimus aims to put that intelligence on legs.`,
    stats: [['Founded', '2003'], ['Vehicles delivered', 'Millions per year'], ['Other half of the business', 'Energy storage & AI'], ['Factories', 'US, China, Germany — "the machine that builds the machine"']],
    nodes: [
      {
        id: 'fsd', name: 'Full Self-Driving (FSD)', ref: 'Q7', sub: 'A robot you can sit inside',
        stats: [['Approach', 'Cameras + one giant neural network — no lidar, no HD maps'], ['Training', 'Billions of miles of real-world video from the fleet'], ['Hardware', 'A custom AI chip in every car'], ['Robotaxi', 'Driverless rides began in Austin in 2025'], ['The bet', 'Vision + enough data beats hand-coded rules']],
        desc: `Tesla's bet is that driving can be solved the way humans do it: with eyes and a brain — cameras and one end-to-end neural network trained on billions of miles of video from its own fleet. Every Tesla on the road is both a customer and a data-gathering robot. The pay-off, if it works at scale, is enormous: a car that earns money as a robotaxi while you sleep. Driverless robotaxi service began operating in Austin in 2025.`,
      },
      {
        id: 'optimus', name: 'Optimus', ref: 'Q8', sub: 'A humanoid robot for boring, dangerous work',
        stats: [['Height / weight', '≈ 173 cm · ≈ 57 kg'], ['Hands', '11+ degrees of freedom each — the hardest part'], ['Brain', 'The same AI stack as the cars, retrained for limbs'], ['First job', 'Tesla\'s own factories'], ['The claim', 'Could eventually outnumber humans']],
        desc: `If a neural network can pilot a two-tonne car through traffic, the argument goes, it can pilot a body. Optimus reuses Tesla's self-driving brain — vision in, motor commands out — in a humanoid frame designed for the dull, dirty and dangerous work humans don't want. Early units work in Tesla's own factories. Humanoid robots are suddenly a global race (with serious competitors worldwide), and they are exactly the kind of workforce a Mars base would need before humans arrive.`,
      },
      {
        id: 'energy', name: 'Megapack & Energy', ref: 'Q9', sub: 'Grid-scale batteries — the quiet giant',
        stats: [['Megapack', 'A shipping-container battery: ≈ 3.9 MWh each'], ['Deployments', 'Tens of GWh per year and accelerating'], ['What they do', 'Store solar/wind, stabilise grids, replace gas "peaker" plants'], ['Virtual power plants', 'Thousands of home Powerwalls acting as one'], ['Why it matters', 'Storage is the missing piece of renewable energy']],
        desc: `The least flashy and arguably most important thing Tesla builds. Solar and wind are now the cheapest electricity in history — their only flaw is timing, and giant batteries fix timing. Megapack installations the size of football fields already prop up grids from California to Australia, responding to outages in milliseconds. Energy storage may end up mattering more to civilisation than any car.`,
      },
      {
        id: 'cybertruck', name: 'Cybertruck', ref: 'Q10', sub: 'The polarising stainless-steel pickup',
        stats: [['Body', 'Unpainted cold-rolled stainless steel exoskeleton'], ['0–100 km/h', '≈ 2.7 s in its quickest form — faster than most supercars'], ['Electronics', 'First 48-volt vehicle architecture & steer-by-wire'], ['Design brief', 'Reportedly "look like the future"']],
        desc: `Love it or hate it — and almost everyone does one or the other — the Cybertruck is a rolling testbed of firsts: a stainless-steel exoskeleton, a 48-volt electrical system the rest of the industry has wanted for decades, and steering with no mechanical link to the wheels. Its angular shape exists partly because thick stainless steel barely bends. The future doesn't always arrive looking sensible.`,
      },
    ],
  },
  {
    id: 'future', name: 'FUTURE TECH', ref: 'U3', color: 0x7ae8ff, pos: [4, 86],
    sub: 'The big ideas — engineering we haven\'t built yet',
    desc: `Concepts with real physics behind them, waiting on engineering, money, or nerve. Some are decades away, some centuries — every one of them is being seriously studied right now. Click around: this is the roadmap from "one small planet" to a spacefaring civilisation.`,
    stats: [['Entries here', 'Fusion → Dyson swarms'], ['Rule of inclusion', 'No known physics forbids it']],
    nodes: [
      {
        id: 'fusion', name: 'Fusion Power', ref: 'Q11', sub: 'Star power, bottled — closer than ever',
        stats: [['The reaction', 'Hydrogen isotopes fuse → helium + enormous energy'], ['Milestone', '2022: NIF ignition — more fusion energy out than laser energy in'], ['Big machines', 'ITER (35 nations) · CFS SPARC · dozens of startups'], ['Fuel', 'Deuterium from seawater — effectively unlimited'], ['Waste', 'No meltdown possible, no long-lived waste']],
        desc: `Fusion is what the Sun does: squeeze hydrogen until it becomes helium and pure energy. Achieve it on Earth and you get effectively unlimited clean power from seawater. In 2022 the National Ignition Facility finally got more energy out of a fusion reaction than the lasers put in — the field's Wright-brothers moment. Now superconducting-magnet startups and the 35-nation ITER project are racing to make it a power plant. The joke that fusion is "always 30 years away" is finally going stale.`,
      },
      {
        id: 'space-elevator', name: 'Space Elevator', ref: 'Q12', sub: 'A cable to orbit — no rocket required',
        stats: [['The idea', 'A cable from the equator to beyond geostationary orbit, held taut by a counterweight'], ['Cable length', '≥ 35,786 km'], ['Problem #1', 'No material strong enough yet — carbon nanotubes in theory'], ['Energy cost', 'Pennies per kg vs thousands by rocket'], ['More plausible first', 'A lunar elevator — existing materials could survive Moon gravity']],
        desc: `Run a cable from the equator up past geostationary orbit, hang a counterweight on the far end, and Earth's spin holds the whole thing taut — then ride climbers up it like a vertical railway. The physics is sound; the materials are not, yet. No substance we can mass-produce has the strength-to-weight ratio for Earth. The Moon is another story: its gentle gravity means a lunar elevator could be built with fibres that exist today.`,
      },
      {
        id: 'dyson', name: 'Dyson Swarm', ref: 'Q13', sub: 'Harvesting an entire star',
        stats: [['The idea', 'Trillions of solar collectors orbiting the Sun'], ['Energy captured', 'Up to 4 × 10²⁶ W — a trillion trillion times civilisation\'s use'], ['Not a solid sphere', 'A swarm of independent satellites (a shell would be unstable)'], ['Construction material', 'Disassemble Mercury, probably'], ['Kardashev scale', 'This is what makes you a Type II civilisation']],
        desc: `Every second, the Sun radiates more energy than human civilisation has used in its entire history — and we catch a billionth of it. A Dyson swarm is the endgame: trillions of thin mirrors and collectors orbiting the Sun, built (in most serious proposals) by self-replicating factories chewing through the planet Mercury. It needs no new physics whatsoever — only patience and robotics. Astronomers genuinely search other stars for the infrared glow of alien ones.`,
      },
      {
        id: 'asteroid-mining', name: 'Asteroid Mining', ref: 'Q14', sub: 'The first trillionaires will mine the sky',
        stats: [['One metal asteroid', '16 Psyche\'s metals: notionally worth ~$10¹⁹'], ['NASA\'s Psyche probe', 'Launched 2023, arrives 2029'], ['Easier than it sounds', 'Many asteroids take less fuel to reach than the Moon'], ['First product', 'Probably water — split into rocket fuel, sold in orbit'], ['Sample missions flown', 'OSIRIS-REx & Hayabusa2 already returned asteroid material']],
        desc: `A single metallic asteroid can hold more platinum than has ever been mined on Earth. The real first product, though, is humble water ice — split it with solar power and you get hydrogen-oxygen rocket fuel, sold from orbital depots for a fraction of the cost of hauling it up Earth's gravity well. Japan and NASA have already grabbed asteroid samples and flown them home; NASA's Psyche probe is en route to a metal world right now. The legal groundwork (who owns an asteroid?) is being argued today.`,
      },
      {
        id: 'oneill', name: "O'Neill Cylinders", ref: 'Q15', sub: 'Cities in space — gravity included',
        stats: [['The design', 'Paired counter-rotating cylinders, ~8 km wide, 32 km long'], ['Gravity', 'Centrifugal — spin at ~1 rpm gives 1 g on the inner wall'], ['Population each', 'Millions, with farms, weather and a fake sky'], ['Proposed', 'Gerard O\'Neill, Princeton, 1976'], ['Material source', 'Lunar rock and asteroids — never lifted from Earth']],
        desc: `Why settle a planet at the bottom of a gravity well when you can build your own world? O'Neill cylinders are kilometres-long rotating habitats whose spin presses you against the inner wall at exactly 1 g — with farmland overhead, engineered weather, and a mirror-fed artificial sun. The 1976 design needs no new physics, just orbital industry and lunar material. Jeff Bezos has said this, not Mars, is his long-term vision: "a trillion humans in the solar system."`,
      },
      {
        id: 'nuclear-prop', name: 'Nuclear Propulsion', ref: 'Q16', sub: 'Mars in 45 days',
        stats: [['Nuclear thermal', 'Reactor heats hydrogen — 2× the efficiency of chemical rockets'], ['DRACO program', 'NASA + DARPA demonstrator in development'], ['Nuclear electric', 'Reactor powers ion drives — slow push for years'], ['Payoff', 'Crewed Mars trips cut from ~7 months to ~6–8 weeks'], ['Heritage', 'NERVA engines were ground-tested in the 1960s — then shelved']],
        desc: `Chemical rockets hit a hard ceiling decades ago: there's only so much energy in a chemical bond. A nuclear thermal rocket heats hydrogen in a reactor instead of burning fuel — double the efficiency, which compounds into Mars trips of weeks instead of months. Less time in deep space means less radiation and less madness. The US ground-tested such engines in the 1960s and simply shelved them; NASA and DARPA are now reviving the idea for the Mars era.`,
      },
      {
        id: 'starshot', name: 'Breakthrough Starshot', ref: 'Q17', sub: 'A probe to another star, this century',
        stats: [['Target', 'Alpha Centauri — 4.37 light-years away'], ['Spacecraft', 'Gram-scale chips on 4-metre light sails'], ['Propulsion', 'A 100-gigawatt ground laser array'], ['Speed', '≈ 20% of light speed — arrival in ~20 years'], ['Backers', 'Announced 2016 with Stephen Hawking']],
        desc: `Forget giant starships: shrink the spacecraft to a gram and push it with light. Starshot's plan is thousands of chip-sized probes on glittering sails, each blasted for a few minutes by a 100-gigawatt laser until it's moving at a fifth of light speed. Twenty years later, they'd flash past the planets of Alpha Centauri — including Proxima b, the habitable-zone world you can find on this map's galaxy level — and radio home pictures that arrive 4.4 years after that. Hard engineering everywhere, impossible physics nowhere.`,
      },
      {
        id: 'terraforming', name: 'Terraforming Mars', ref: 'Q18', sub: 'Planetary engineering — the 1,000-year project',
        stats: [['Step 1', 'Thicken the CO₂ atmosphere (orbital mirrors, factories, or… nukes)'], ['Step 2', 'Warm it ~50 °C → liquid water returns'], ['Step 3', 'Engineered microbes start making oxygen'], ['Timescale', 'Centuries to millennia'], ['Catch', 'Mars has no magnetic field — it leaks air (slowly)']],
        desc: `Mars was warm and wet once; the dream is to turn it back on. Warm the poles — giant orbital mirrors, greenhouse-gas factories, or Musk's cheerfully alarming "nuke the ice caps" — and frozen CO₂ thickens the air, which traps heat, which melts water, which lets engineered microbes begin the million-year oxygen project that cyanobacteria once performed on Earth. It would be the largest engineering project in human history, and the first time life deliberately remade a planet. Step zero, available now: don't break Earth, the only world that already works.`,
      },
      {
        id: 'neuralink-node', name: 'Brain Interfaces', ref: 'Q19', sub: 'Typing with thoughts — already happening',
        stats: [['Neuralink N1', '1,000+ electrodes, implanted by a surgical robot'], ['First human patient', '2024 — controls a computer by thinking'], ['Today\'s purpose', 'Restoring movement & communication to paralysed people'], ['Long-term claim', 'High-bandwidth human-AI connection'], ['Not alone', 'Synchron, Blackrock & academic BCIs have implants in humans too']],
        desc: `Brain-computer interfaces stopped being science fiction quietly: paralysed patients today move cursors, play chess and post online by thought alone, through threads finer than hair sewn into the motor cortex by a robot surgeon. The medical mission — restoring speech and movement — is unambiguous good. The stated long-term goal (a bandwidth upgrade between humans and AI) raises every interesting question at once. Either way, the keyboard's days may be numbered.`,
      },
      {
        id: 'ai-explore', name: 'AI in Space Exploration', ref: 'Q20', sub: 'The first explorers won\'t be human',
        stats: [['Already flying', 'Perseverance drives itself; satellites detect wildfires onboard'], ['First exoplanet found by AI', 'Kepler-90i, 2017 — a Google neural net'], ['Why AI must go first', 'Light-lag: you can\'t joystick a probe 4 light-years away'], ['The far future', 'Self-replicating Von Neumann probes'], ['On this map', 'Click Kepler-90 in the Milky Way level']],
        desc: `At interstellar distances, remote control is physically impossible — a command to Alpha Centauri takes 4.4 years to arrive. Whatever we send must think for itself. The beginning is already here: Mars rovers choose their own driving routes, and a neural network found the exoplanet Kepler-90i in data humans had already searched. The logical endpoint, sketched by John von Neumann in the 1940s: probes that land on asteroids and build copies of themselves, exploring the entire galaxy in a few million years — for the price of launching one.`,
      },
    ],
  },
];

const SNAP = 8;
const snap = v => Math.round(v / SNAP) * SNAP;

export function initTech(ctx) {
  const { scene, camera, controls, showToast, showInfo, fadeEl, onModeChange } = ctx;
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);
  const pickables = [];
  let active = false;

  const animators = [];      // generic per-frame callbacks
  const pulses = [];         // signal pulses travelling along traces
  const leds = [];           // blinking status LEDs

  // ---- the board itself ----
  const BOARD = 360;
  const boardTex = TEX.circuitBoardTexture(7);
  boardTex.repeat.set(2, 2);
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(BOARD, 5, BOARD),
    [
      new THREE.MeshStandardMaterial({ color: 0x0a3a24, roughness: 0.8 }), // +x edge
      new THREE.MeshStandardMaterial({ color: 0x0a3a24, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.55, metalness: 0.2 }), // top
      new THREE.MeshStandardMaterial({ color: 0x07251a, roughness: 0.9 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0x0a3a24, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x0a3a24, roughness: 0.8 }),
    ]);
  board.position.y = -2.5;
  board.userData.info = {
    id: 'tech-board', name: 'The Tech Map',
    subtitle: 'Humanity\'s next machines, laid out as a circuit',
    stats: [['Processors', 'SpaceX · Tesla · Future Tech'], ['Components', '20 clickable nodes'], ['Bus', 'Copper traces carry the story between them']],
    desc: `Three "processors" — SpaceX, Tesla and the big future-tech ideas — wired across one board. Follow the glowing signal pulses along the copper traces, and click any chip or component to read its story. Press ⚡ again to fly back out to the universe.`,
  };
  board.userData.noPick = false;
  group.add(board);
  pickables.push(board);

  // lighting that flatters a board: cool key light from above + warm fill
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(40, 120, 60);
  const fill = new THREE.DirectionalLight(0x88bbff, 0.5); fill.position.set(-60, 40, -40);
  group.add(key, fill, new THREE.AmbientLight(0x335544, 0.7));

  // ---- helpers ----
  const TRACE_Y = 0.35;
  function colCss(hex) { const c = new THREE.Color(hex); return `rgba(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0},1)`; }

  // an L-shaped copper trace between two board points; returns its polyline
  function addTrace(ax, az, bx, bz, color) {
    const midX = bx, midZ = az; // route along X first, then Z (Manhattan)
    const pts = [
      new THREE.Vector3(ax, TRACE_Y, az),
      new THREE.Vector3(midX, TRACE_Y, midZ),
      new THREE.Vector3(bx, TRACE_Y, bz),
    ];
    const matCopper = new THREE.MeshStandardMaterial({ color: 0xc89b46, metalness: 0.9, roughness: 0.35 });
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const len = a.distanceTo(b);
      if (len < 0.5) continue;
      const horiz = Math.abs(b.x - a.x) > Math.abs(b.z - a.z);
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(horiz ? len : 1.1, 0.25, horiz ? 1.1 : len), matCopper);
      strip.position.set((a.x + b.x) / 2, TRACE_Y, (a.z + b.z) / 2);
      strip.userData.noPick = true;
      group.add(strip);
    }
    // a faint glow line riding the trace
    const glowLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts.map(p => p.clone().setY(TRACE_Y + 0.2))),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 }));
    glowLine.userData.noPick = true;
    group.add(glowLine);
    return pts;
  }

  // a glowing signal pulse that runs back and forth along a polyline
  function addPulse(pts, color, speed) {
    const seg = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) { const d = pts[i].distanceTo(pts[i + 1]); seg.push(d); total += d; }
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture(colCss(color)), transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
    sprite.scale.setScalar(4);
    sprite.userData.noPick = true;
    group.add(sprite);
    pulses.push({ sprite, pts, seg, total, u: Math.random(), speed: speed || (8 + Math.random() * 8) });
  }

  // a soldered IC chip; big=processor (with heatsink), else a component
  function addChip(x, z, w, d, info, color, label, sub, opts = {}) {
    const node = new THREE.Group();
    node.position.set(x, 0, z);
    const h = opts.big ? 7 : 3.2;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: 0x14181d, metalness: 0.4, roughness: 0.6 }));
    body.position.y = h / 2;
    node.add(body);
    // engraved top face
    const top = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.92, d * 0.92),
      new THREE.MeshBasicMaterial({ map: TEX.chipTexture(label, sub, '#' + new THREE.Color(color).getHexString()), transparent: true }));
    top.rotation.x = -Math.PI / 2;
    top.position.y = h + 0.05;
    top.userData.noPick = true;
    node.add(top);
    // gold pins down two sides
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xd8b048, metalness: 1, roughness: 0.3 });
    const pinCount = Math.max(3, Math.round(w / 5));
    for (let i = 0; i < pinCount; i++) {
      const px = -w / 2 + (i + 0.5) * (w / pinCount);
      for (const sgn of [-1, 1]) {
        const pin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 2.2), pinMat);
        pin.position.set(px, 0.3, sgn * (d / 2 + 0.6));
        pin.userData.noPick = true;
        node.add(pin);
      }
    }
    // edge glow so chips read against the dark board
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowTexture(colCss(color)), transparent: true, opacity: opts.big ? 0.5 : 0.32, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.setScalar(opts.big ? w * 1.7 : w * 1.3);
    glow.position.y = h * 0.5;
    glow.userData.noPick = true;
    node.add(glow);

    if (opts.big) {
      // finned heatsink + spinning fan on the processor
      const fins = new THREE.Group();
      const finMat = new THREE.MeshStandardMaterial({ color: 0x9fb0c4, metalness: 0.9, roughness: 0.4 });
      for (let i = 0; i < 7; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 4, 0.7), finMat);
        fin.position.set(0, h + 2, -d * 0.3 + i * (d * 0.6 / 6));
        fins.add(fin);
      }
      fins.userData.noPick = true;
      node.add(fins);
      // pulsing core light
      const coreLight = new THREE.PointLight(color, 2, 60, 2);
      coreLight.position.y = h + 3;
      node.add(coreLight);
      animators.push(dt => { coreLight.intensity = 1.5 + Math.sin(performance.now() * 0.004) * 1.2; });
      const label3d = TEX.makeLabel(label, { size: 7, color: '#' + new THREE.Color(color).getHexString(), sub });
      label3d.position.y = h + 12;
      label3d.userData.noPick = true;
      node.add(label3d);
    }

    node.userData.info = info;
    node.userData.focusable = true;
    node.userData.focusDist = opts.big ? 70 : 30;
    node.userData.pickPriority = opts.big ? 1 : 2;
    group.add(node);
    pickables.push(node);
    return node;
  }

  // a small decorative surface-mount component (resistor/cap/LED)
  function addSMD(x, z, kind) {
    const node = new THREE.Group();
    node.position.set(x, 0, z);
    if (kind === 'led') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 8),
        new THREE.MeshStandardMaterial({ color: 0x113322, emissive: 0x33ff88, emissiveIntensity: 1 }));
      dome.position.y = 1; node.add(dome);
      dome.userData.noPick = true;
      leds.push({ mat: dome.material, phase: Math.random() * 6, rate: 1 + Math.random() * 3 });
    } else if (kind === 'cap') {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 4, 14),
        new THREE.MeshStandardMaterial({ color: 0x1a2c4a, metalness: 0.5, roughness: 0.5 }));
      can.position.y = 2; node.add(can);
    } else { // resistor
      const r = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.7 }));
      r.position.y = 0.6; node.add(r);
    }
    node.traverse(o => o.userData.noPick = true);
    node.userData.noPick = true;
    group.add(node);
  }

  // ---- lay the board out ----
  for (const cl of CLUSTERS) {
    const [cx, cz] = cl.pos.map(snap);
    const hubInfo = { id: 'tech-' + cl.id, name: cl.name, subtitle: cl.sub, stats: cl.stats, desc: cl.desc };
    addChip(cx, cz, 30, 30, hubInfo, cl.color, cl.ref, cl.name, { big: true });

    cl.nodes.forEach((nd, i) => {
      const ring = 38 + (i % 3) * 16;
      const ang = (i / cl.nodes.length) * Math.PI * 2 + (cx * 0.01);
      const nx = snap(cx + Math.cos(ang) * ring);
      const nz = snap(cz + Math.sin(ang) * ring);
      const ndInfo = { id: 'tech-' + nd.id, name: nd.name, subtitle: nd.sub, stats: nd.stats, desc: nd.desc };
      addChip(nx, nz, 16, 12, ndInfo, cl.color, nd.ref, '', {});
      const path = addTrace(cx, cz, nx, nz, cl.color);
      addPulse(path, cl.color);
      // a couple of decorative parts hugging each component
      addSMD(snap(nx + 9), snap(nz - 7), ['cap', 'resistor', 'led'][i % 3]);
      addSMD(snap(nx - 9), snap(nz + 7), ['resistor', 'led', 'cap'][i % 3]);
    });
  }

  // power-bus traces linking the three processors, with traffic on them
  for (let i = 0; i < CLUSTERS.length; i++) {
    const a = CLUSTERS[i].pos.map(snap), b = CLUSTERS[(i + 1) % CLUSTERS.length].pos.map(snap);
    const path = addTrace(a[0], a[1], b[0], b[1], 0x5fd0ff);
    addPulse(path, 0x9fe8ff, 6);
    addPulse(path, 0x9fe8ff, 9);
  }

  // gold edge-connector "fingers" along one side, for flavour
  for (let i = 0; i < 18; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0xe8c25c, metalness: 1, roughness: 0.25 }));
    f.position.set(-BOARD / 2 + 20 + i * 9, 0.3, BOARD / 2 - 12);
    f.userData.noPick = true;
    group.add(f);
  }
  // scatter extra decorative components across empty board space
  for (let i = 0; i < 60; i++) {
    const x = snap((Math.random() - 0.5) * BOARD * 0.92);
    const z = snap((Math.random() - 0.5) * BOARD * 0.92);
    if (Math.abs(x) < 130 && Math.abs(z) < 120) continue; // keep clusters uncluttered
    addSMD(x, z, ['resistor', 'cap', 'led', 'resistor'][i % 4]);
  }

  // ---- enter / exit ----
  let saved = null;
  function enter() {
    if (active) return;
    active = true;
    fadeEl.classList.add('on');
    setTimeout(() => {
      saved = {
        min: controls.minDistance, max: controls.maxDistance,
        pos: camera.position.clone(), target: controls.target.clone(),
      };
      onModeChange(true);
      group.visible = true;
      controls.minDistance = 40;
      controls.maxDistance = 620;
      camera.position.set(30, 200, 230);
      controls.target.set(0, 0, 10);
      controls.update();
      document.body.classList.add('tech-mode');
      showToast('⚡ TECH MAP', 'A circuit board of the future — follow the traces, click any chip');
      setTimeout(() => fadeEl.classList.remove('on'), 80);
    }, 360);
  }

  function exit() {
    if (!active) return;
    active = false;
    fadeEl.classList.add('on');
    setTimeout(() => {
      group.visible = false;
      onModeChange(false);
      if (saved) {
        controls.minDistance = saved.min;
        controls.maxDistance = saved.max;
        camera.position.copy(saved.pos);
        controls.target.copy(saved.target);
        controls.update();
      }
      document.body.classList.remove('tech-mode');
      setTimeout(() => fadeEl.classList.remove('on'), 80);
    }, 360);
  }

  const _p = new THREE.Vector3();
  return {
    pickables,
    active: () => active,
    enter, exit,
    toggle() { active ? exit() : enter(); },
    update(dt) {
      if (!active) return;
      // signal pulses run along their traces and bounce at the ends
      for (const p of pulses) {
        p.u += (p.speed / p.total) * dt;
        if (p.u > 1) p.u -= 1;
        // find position along the polyline at fraction u
        let d = p.u * p.total, i = 0;
        while (i < p.seg.length && d > p.seg[i]) { d -= p.seg[i]; i++; }
        i = Math.min(i, p.seg.length - 1);
        const a = p.pts[i], b = p.pts[i + 1];
        _p.copy(a).lerp(b, p.seg[i] ? d / p.seg[i] : 0);
        p.sprite.position.copy(_p).setY(TRACE_Y + 0.6);
      }
      for (const l of leds) {
        l.mat.emissiveIntensity = 0.4 + Math.abs(Math.sin(performance.now() * 0.001 * l.rate + l.phase)) * 1.6;
      }
      for (const fn of animators) fn(dt);
    },
  };
}

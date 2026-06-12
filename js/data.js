// ============================================================
// Universe Map — astronomical data & descriptions
// All objects shown in the map pull their info-panel content
// from this file. Stats are real published values; the 3D
// layout values (dist/size) are stylised for visual clarity.
// ============================================================

export const SUN = {
  id: 'sun', name: 'The Sun', subtitle: 'G2V main-sequence star',
  stats: [
    ['Diameter', '1,392,700 km (109 × Earth)'],
    ['Mass', '1.989 × 10³⁰ kg (99.86% of the Solar System)'],
    ['Surface temp', '≈ 5,500 °C'],
    ['Core temp', '≈ 15,000,000 °C'],
    ['Age', '≈ 4.6 billion years'],
    ['Composition', '≈ 73% hydrogen, 25% helium'],
  ],
  desc: `The Sun is an ordinary yellow dwarf star — one of several hundred billion in the Milky Way — yet it contains 99.86% of all the mass in the Solar System. Every second it fuses about 600 million tonnes of hydrogen into helium, converting 4 million tonnes of matter directly into light. In roughly 5 billion years it will swell into a red giant, likely engulfing Mercury and Venus.`,
};

export const PLANETS = [
  {
    id: 'mercury', name: 'Mercury', subtitle: 'Terrestrial planet',
    stats: [
      ['Diameter', '4,879 km'], ['Mass', '3.30 × 10²³ kg'],
      ['Distance from Sun', '0.39 AU (57.9 million km)'],
      ['Year', '88 Earth days'], ['Day', '58.6 Earth days'],
      ['Surface temp', '−173 °C to +427 °C'], ['Moons', '0'],
    ],
    desc: `The smallest planet and the closest to the Sun. With almost no atmosphere to trap heat, Mercury swings through the most extreme temperature range of any planet. Its surface is ancient and cratered, much like the Moon, and a single Mercury day (sunrise to sunrise) lasts 176 Earth days.`,
    layout: { dist: 28, size: 1.2, periodDays: 88, color: 0x9c8e82 },
    tex: { bands: ['#8d8077', '#a59689', '#6f655c', '#9c8e82'], craters: true },
    moons: [],
  },
  {
    id: 'venus', name: 'Venus', subtitle: 'Terrestrial planet',
    stats: [
      ['Diameter', '12,104 km'], ['Mass', '4.87 × 10²⁴ kg'],
      ['Distance from Sun', '0.72 AU (108.2 million km)'],
      ['Year', '225 Earth days'], ['Day', '243 Earth days (retrograde)'],
      ['Surface temp', '≈ 465 °C'], ['Moons', '0'],
    ],
    desc: `Venus is Earth's evil twin: nearly identical in size, but wrapped in a crushing CO₂ atmosphere 90 times denser than ours, with clouds of sulfuric acid. A runaway greenhouse effect makes it the hottest planet — hot enough to melt lead. It spins backwards, so the Sun rises in the west, and its day is longer than its year.`,
    layout: { dist: 40, size: 1.9, periodDays: 225, color: 0xe6c98f },
    tex: { bands: ['#e8d3a2', '#d9b87a', '#f0e0b8', '#cfa867'], swirl: true },
    moons: [],
  },
  {
    id: 'earth', name: 'Earth', subtitle: 'Terrestrial planet — our home',
    stats: [
      ['Diameter', '12,742 km'], ['Mass', '5.97 × 10²⁴ kg'],
      ['Distance from Sun', '1 AU (149.6 million km)'],
      ['Year', '365.25 days'], ['Day', '23.9 hours'],
      ['Average temp', '≈ 15 °C'], ['Moons', '1'],
      ['Known life', 'Yes — the only confirmed place in the universe'],
    ],
    desc: `The only world known to harbour life. 71% of its surface is covered by liquid water, protected by a magnetic field and an oxygen-rich atmosphere. Around 8 billion humans live here, along with an estimated 8.7 million other species. Everything you have ever known happened on this pale blue dot.`,
    layout: { dist: 52, size: 2.0, periodDays: 365.25, color: 0x4d7fd1 },
    tex: { earth: true },
    moons: [
      {
        id: 'moon', name: 'The Moon', subtitle: 'Earth I',
        stats: [
          ['Diameter', '3,475 km'], ['Distance from Earth', '384,400 km'],
          ['Orbital period', '27.3 days'], ['Gravity', '16.6% of Earth'],
          ['Visited by humans', '12 astronauts (1969–1972)'],
        ],
        desc: `Earth's only natural satellite, likely formed 4.5 billion years ago when a Mars-sized body struck the young Earth. It is tidally locked, always showing us the same face, and its gravity drives our ocean tides. It is the only other world humans have set foot on.`,
        size: 0.55, color: 0xbdb9b0, periodDays: 27.3, craters: true,
      },
    ],
  },
  {
    id: 'mars', name: 'Mars', subtitle: 'Terrestrial planet',
    stats: [
      ['Diameter', '6,779 km'], ['Mass', '6.42 × 10²³ kg'],
      ['Distance from Sun', '1.52 AU (227.9 million km)'],
      ['Year', '687 Earth days'], ['Day', '24.6 hours'],
      ['Average temp', '≈ −63 °C'], ['Moons', '2'],
    ],
    desc: `The Red Planet, coloured by iron oxide dust. Mars hosts the largest volcano in the Solar System (Olympus Mons, 21 km high) and a canyon system that would stretch across the USA (Valles Marineris). Ancient riverbeds and minerals show liquid water once flowed here — a key target in the search for past life, and the most likely first destination for human exploration beyond the Moon.`,
    layout: { dist: 64, size: 1.5, periodDays: 687, color: 0xc1633d },
    tex: { bands: ['#c1633d', '#a34f30', '#d47a4e', '#8e4226'], craters: true, caps: true },
    moons: [
      {
        id: 'phobos', name: 'Phobos', subtitle: 'Mars I',
        stats: [['Diameter', '22.5 km'], ['Orbital period', '7.7 hours'], ['Distance from Mars', '9,376 km']],
        desc: `A lumpy, cratered moon that orbits Mars faster than the planet rotates — it rises in the west twice a Martian day. Phobos is slowly spiralling inward and will either crash into Mars or be torn into a ring within ~50 million years.`,
        size: 0.25, color: 0x8a7f76, periodDays: 0.32, craters: true,
      },
      {
        id: 'deimos', name: 'Deimos', subtitle: 'Mars II',
        stats: [['Diameter', '12.4 km'], ['Orbital period', '30.3 hours'], ['Distance from Mars', '23,463 km']],
        desc: `The smaller and outer of Mars's two moons, probably a captured asteroid. From the Martian surface, Deimos appears barely larger than a bright star.`,
        size: 0.18, color: 0x9b9189, periodDays: 1.26, craters: true,
      },
    ],
  },
  {
    id: 'jupiter', name: 'Jupiter', subtitle: 'Gas giant',
    stats: [
      ['Diameter', '139,820 km (11 × Earth)'], ['Mass', '1.90 × 10²⁷ kg (318 × Earth)'],
      ['Distance from Sun', '5.20 AU (778.5 million km)'],
      ['Year', '11.9 Earth years'], ['Day', '9.9 hours'],
      ['Cloud-top temp', '≈ −108 °C'], ['Known moons', '95'],
    ],
    desc: `The king of the planets — more than twice as massive as all the others combined. Its Great Red Spot is a storm larger than Earth that has raged for at least 350 years. Jupiter's powerful gravity shapes the whole Solar System, deflecting comets and asteroids. Its four largest moons, discovered by Galileo in 1610, are worlds in their own right.`,
    layout: { dist: 95, size: 5.5, periodDays: 4333, color: 0xc8a87e },
    tex: { bands: ['#d8c0a0', '#b08a62', '#e8d8c0', '#a87850', '#d0b890', '#c09870'], spot: true },
    moons: [
      {
        id: 'io', name: 'Io', subtitle: 'Jupiter I',
        stats: [['Diameter', '3,643 km'], ['Orbital period', '1.8 days'], ['Active volcanoes', '400+']],
        desc: `The most volcanically active world in the Solar System. Jupiter's gravity kneads Io's interior like dough, powering hundreds of volcanoes that blast sulfur plumes hundreds of kilometres into space and paint the surface yellow, orange and red.`,
        size: 0.5, color: 0xd9c25a, periodDays: 1.77,
      },
      {
        id: 'europa', name: 'Europa', subtitle: 'Jupiter II',
        stats: [['Diameter', '3,122 km'], ['Orbital period', '3.6 days'], ['Subsurface ocean', '~100 km deep']],
        desc: `Beneath Europa's smooth, cracked ice shell lies a global saltwater ocean holding twice as much water as all of Earth's oceans. It is one of the most promising places to search for alien life — NASA's Europa Clipper is on its way to find out.`,
        size: 0.45, color: 0xcbb89a, periodDays: 3.55,
      },
      {
        id: 'ganymede', name: 'Ganymede', subtitle: 'Jupiter III',
        stats: [['Diameter', '5,268 km'], ['Orbital period', '7.2 days'], ['Note', 'Largest moon in the Solar System']],
        desc: `Larger than the planet Mercury, Ganymede is the biggest moon in the Solar System and the only one with its own magnetic field. It too hides a subsurface ocean beneath its icy crust.`,
        size: 0.6, color: 0x9d9486, periodDays: 7.15,
      },
      {
        id: 'callisto', name: 'Callisto', subtitle: 'Jupiter IV',
        stats: [['Diameter', '4,821 km'], ['Orbital period', '16.7 days'], ['Note', 'Most heavily cratered body known']],
        desc: `An ancient, battered ball of ice and rock — the most heavily cratered object in the Solar System. Its surface has barely changed in 4 billion years, and its low radiation makes it a candidate site for a future human base.`,
        size: 0.55, color: 0x7d756c, periodDays: 16.7, craters: true,
      },
    ],
  },
  {
    id: 'saturn', name: 'Saturn', subtitle: 'Gas giant',
    stats: [
      ['Diameter', '116,460 km'], ['Mass', '5.68 × 10²⁶ kg'],
      ['Distance from Sun', '9.58 AU (1.43 billion km)'],
      ['Year', '29.4 Earth years'], ['Day', '10.7 hours'],
      ['Known moons', '274 — the most of any planet'],
      ['Density', 'Less than water — it would float'],
    ],
    desc: `The jewel of the Solar System. Saturn's magnificent rings span 280,000 km yet are mostly only ~10 metres thick — countless icy fragments from millimetres to house-sized. With 274 known moons it hosts the largest family of any planet, including Titan and the geyser-moon Enceladus.`,
    layout: { dist: 130, size: 4.8, periodDays: 10759, color: 0xd9c08a, ring: true },
    tex: { bands: ['#e0cda0', '#cdb583', '#ead9b3', '#c2a872', '#d8c596'] },
    moons: [
      {
        id: 'mimas', name: 'Mimas', subtitle: 'Saturn I — the "Death Star moon"',
        stats: [['Diameter', '396 km'], ['Orbital period', '0.94 days'], ['Herschel crater', '130 km — a third of the moon’s width']],
        desc: `A small ice moon dominated by the enormous Herschel crater, giving it an uncanny resemblance to the Death Star. The impact that formed it nearly shattered Mimas. In 2024, subtle wobbles revealed it likely hides a young subsurface ocean.`,
        size: 0.22, color: 0xc8c8c8, periodDays: 0.94, craters: true,
      },
      {
        id: 'enceladus', name: 'Enceladus', subtitle: 'Saturn II',
        stats: [['Diameter', '504 km'], ['Orbital period', '1.4 days'], ['Geysers', '100+ jets of water vapour']],
        desc: `A small, dazzlingly white ice moon that shoots geysers of salty water into space from a subsurface ocean. The Cassini probe flew through the plumes and found organic molecules — making tiny Enceladus a top target in the search for life.`,
        size: 0.3, color: 0xe8eef2, periodDays: 1.37,
      },
      {
        id: 'tethys', name: 'Tethys', subtitle: 'Saturn III',
        stats: [['Diameter', '1,062 km'], ['Orbital period', '1.9 days'], ['Ithaca Chasma', 'Canyon 2,000 km long']],
        desc: `A heavily cratered ball of almost pure water ice, scarred by Ithaca Chasma — a canyon stretching three-quarters of the way around the moon — and the huge impact basin Odysseus.`,
        size: 0.38, color: 0xd8dde2, periodDays: 1.89, craters: true,
      },
      {
        id: 'dione', name: 'Dione', subtitle: 'Saturn IV',
        stats: [['Diameter', '1,123 km'], ['Orbital period', '2.7 days'], ['Feature', '“Wispy terrain” of bright ice cliffs']],
        desc: `An icy moon laced with bright cliffs of fractured ice hundreds of metres high. Gravity data hint that Dione, like its neighbours, may conceal a thin internal ocean beneath tens of kilometres of ice.`,
        size: 0.4, color: 0xcfd4da, periodDays: 2.74, craters: true,
      },
      {
        id: 'rhea', name: 'Rhea', subtitle: 'Saturn V',
        stats: [['Diameter', '1,527 km'], ['Orbital period', '4.5 days'], ['Note', 'Saturn’s second-largest moon']],
        desc: `Saturn's second-largest moon, an ancient cratered ice world. Cassini found a wisp of an atmosphere — oxygen and carbon dioxide — and hints that Rhea may once have had its own faint ring system, which would be unique for a moon.`,
        size: 0.45, color: 0xc4c9cf, periodDays: 4.52, craters: true,
      },
      {
        id: 'titan', name: 'Titan', subtitle: 'Saturn VI',
        stats: [['Diameter', '5,150 km'], ['Orbital period', '15.9 days'], ['Atmosphere', 'Denser than Earth’s'], ['Surface lakes', 'Liquid methane & ethane']],
        desc: `The only moon with a thick atmosphere, and the only world besides Earth with rivers, lakes and rain — though of liquid methane at −179 °C. NASA's Dragonfly rotorcraft will fly through Titan's skies in the 2030s.`,
        size: 0.6, color: 0xc9a14e, periodDays: 15.9,
      },
      {
        id: 'iapetus', name: 'Iapetus', subtitle: 'Saturn VIII — the two-faced moon',
        stats: [['Diameter', '1,469 km'], ['Orbital period', '79.3 days'], ['Feature', 'One hemisphere coal-black, the other snow-white']],
        desc: `The strangest-looking moon in the Solar System: one hemisphere is as dark as coal, the other as bright as snow, and a mysterious 13-km-high ridge runs exactly along its equator like a walnut seam. The dark dust is swept up from the outer moon Phoebe.`,
        size: 0.42, color: 0x9a9388, periodDays: 79.3, craters: true,
      },
    ],
  },
  {
    id: 'uranus', name: 'Uranus', subtitle: 'Ice giant',
    stats: [
      ['Diameter', '50,724 km'], ['Mass', '8.68 × 10²⁵ kg'],
      ['Distance from Sun', '19.2 AU (2.87 billion km)'],
      ['Year', '84 Earth years'], ['Day', '17.2 hours (retrograde)'],
      ['Axial tilt', '98° — it rolls on its side'], ['Known moons', '28'],
    ],
    desc: `An ice giant knocked onto its side, probably by an ancient collision, so its poles take turns pointing at the Sun for 42 years each. Methane in its atmosphere gives it a featureless cyan colour. It is the coldest planetary atmosphere in the Solar System, dipping to −224 °C.`,
    layout: { dist: 165, size: 3.2, periodDays: 30687, color: 0x9bd4d9 },
    tex: { bands: ['#a8dde2', '#92ccd2', '#b8e6ea', '#9bd4d9'] },
    moons: [
      {
        id: 'miranda', name: 'Miranda', subtitle: 'Uranus V',
        stats: [['Diameter', '472 km'], ['Orbital period', '1.4 days'], ['Verona Rupes', '20 km cliff — tallest known']],
        desc: `A bizarre patchwork moon that looks like it was shattered and reassembled. It hosts Verona Rupes, a 20 km vertical cliff — the tallest known in the Solar System. Jumping off it would give a free-fall of about 12 minutes.`,
        size: 0.22, color: 0xb0aaa2, periodDays: 1.41,
      },
      {
        id: 'ariel', name: 'Ariel', subtitle: 'Uranus I',
        stats: [['Diameter', '1,158 km'], ['Orbital period', '2.5 days'], ['Note', 'Brightest and youngest surface of Uranus’s moons']],
        desc: `The brightest of Uranus's moons, with the youngest surface — broad valleys and smooth plains where icy material once flowed. Carbon dioxide deposits hint at an interior that may still be warm, and possibly a buried ocean.`,
        size: 0.33, color: 0xb8b4ac, periodDays: 2.52,
      },
      {
        id: 'umbriel', name: 'Umbriel', subtitle: 'Uranus II',
        stats: [['Diameter', '1,169 km'], ['Orbital period', '4.1 days'], ['Feature', 'Wunda — a mysterious bright ring of material']],
        desc: `The darkest of Uranus's large moons, an ancient cratered world reflecting only 16% of sunlight. Its strangest feature is Wunda, a bright ring of unknown material sitting on the floor of a crater near its equator.`,
        size: 0.33, color: 0x7d7a74, periodDays: 4.14, craters: true,
      },
      {
        id: 'titania', name: 'Titania', subtitle: 'Uranus III',
        stats: [['Diameter', '1,578 km'], ['Orbital period', '8.7 days'], ['Note', 'Largest moon of Uranus']],
        desc: `The largest moon of Uranus, scarred by enormous canyons that hint the moon expanded and cracked as its interior froze. Like all Uranian moons, it is named after a Shakespeare character.`,
        size: 0.35, color: 0x9d9890, periodDays: 8.7,
      },
      {
        id: 'oberon', name: 'Oberon', subtitle: 'Uranus IV',
        stats: [['Diameter', '1,523 km'], ['Orbital period', '13.5 days'], ['Feature', 'Unidentified dark material on crater floors']],
        desc: `The outermost large moon of Uranus, heavily cratered and old, with mysterious dark material pooled on many crater floors and an unnamed mountain rising 11 km — visible in silhouette on Voyager 2's photographs from 1986, still our only close-up views.`,
        size: 0.35, color: 0x968f86, periodDays: 13.46, craters: true,
      },
    ],
  },
  {
    id: 'neptune', name: 'Neptune', subtitle: 'Ice giant',
    stats: [
      ['Diameter', '49,244 km'], ['Mass', '1.02 × 10²⁶ kg'],
      ['Distance from Sun', '30.1 AU (4.50 billion km)'],
      ['Year', '165 Earth years'], ['Day', '16.1 hours'],
      ['Winds', 'Up to 2,100 km/h — fastest known'], ['Known moons', '16'],
    ],
    desc: `The most distant planet, discovered in 1846 by mathematics before it was seen through a telescope. Despite receiving 900 times less sunlight than Earth, Neptune has the fastest winds in the Solar System — supersonic streams of frozen methane. It has completed barely one orbit since its discovery.`,
    layout: { dist: 195, size: 3.1, periodDays: 60190, color: 0x4569d6 },
    tex: { bands: ['#4a6fd8', '#3a5cc0', '#5a80e8', '#4060c8'], spot: true, spotColor: '#2a44a0' },
    moons: [
      {
        id: 'proteus', name: 'Proteus', subtitle: 'Neptune VIII',
        stats: [['Diameter', '≈ 420 km'], ['Orbital period', '1.1 days'], ['Shape', 'Irregular — almost as large as a body can be without becoming round']],
        desc: `Neptune's second-largest moon, a dark, box-shaped object discovered by Voyager 2 in 1989. It is about as massive as a body can get while remaining lumpy rather than pulling itself into a sphere.`,
        size: 0.25, color: 0x77736e, periodDays: 1.12, craters: true,
      },
      {
        id: 'triton', name: 'Triton', subtitle: 'Neptune I',
        stats: [['Diameter', '2,707 km'], ['Orbital period', '5.9 days (retrograde)'], ['Surface temp', '−235 °C'], ['Origin', 'Captured Kuiper Belt object']],
        desc: `Neptune's giant moon orbits backwards — the only large moon to do so — revealing it as a captured Kuiper Belt object, a sibling of Pluto. Nitrogen geysers erupt from its frozen surface. Tidal forces are dragging it inward; in ~3.6 billion years it will be torn apart into a ring.`,
        size: 0.45, color: 0xc9c4cf, periodDays: 5.88,
      },
      {
        id: 'nereid', name: 'Nereid', subtitle: 'Neptune II',
        stats: [['Diameter', '≈ 357 km'], ['Orbital period', '360 days'], ['Orbit', 'The most eccentric of any known moon']],
        desc: `A moon flung onto the wildest orbit in the Solar System — its distance from Neptune varies sevenfold, from 1.4 to 9.7 million km. Its chaotic path is likely a scar from the violent capture of Triton, which scattered Neptune's original moons.`,
        size: 0.2, color: 0xa8a49e, periodDays: 360, craters: true,
      },
    ],
  },
  {
    id: 'pluto', name: 'Pluto', subtitle: 'Dwarf planet — Kuiper Belt',
    stats: [
      ['Diameter', '2,377 km (smaller than our Moon)'], ['Mass', '1.31 × 10²² kg'],
      ['Distance from Sun', '39.5 AU average'],
      ['Year', '248 Earth years'], ['Day', '6.4 Earth days'],
      ['Surface temp', '≈ −232 °C'], ['Moons', '5'],
    ],
    desc: `The most famous dwarf planet, reclassified from full planet status in 2006. When New Horizons flew past in 2015 it revealed a stunningly active world: nitrogen-ice glaciers, water-ice mountains, a hazy blue atmosphere, and a vast heart-shaped plain named Tombaugh Regio. Pluto and its moon Charon orbit each other like a double planet.`,
    layout: { dist: 222, size: 0.9, periodDays: 90560, color: 0xcfb59a, inclination: 0.3, eccentric: 0.12 },
    tex: { bands: ['#d8c0a4', '#b89878', '#e8d8c0', '#9a7858'], craters: true, heart: true },
    moons: [
      {
        id: 'charon', name: 'Charon', subtitle: 'Pluto I',
        stats: [['Diameter', '1,212 km — half of Pluto'], ['Orbital period', '6.4 days'], ['Note', 'Mutually tidally locked with Pluto']],
        desc: `So large relative to Pluto that the pair are often called a double dwarf planet — they orbit a point in the space between them, each forever showing the other the same face. Charon's north pole is stained red by material escaped from Pluto's atmosphere.`,
        size: 0.3, color: 0xa8a09a, periodDays: 6.39, craters: true,
      },
    ],
  },
  {
    id: 'ceres', name: 'Ceres', subtitle: 'Dwarf planet — Asteroid Belt',
    stats: [
      ['Diameter', '940 km'], ['Mass', '9.4 × 10²⁰ kg'],
      ['Distance from Sun', '2.77 AU'], ['Year', '4.6 Earth years'],
      ['Day', '9 hours'], ['Discovered', '1801 — the first asteroid ever found'],
    ],
    desc: `The largest object in the asteroid belt and the only dwarf planet in the inner Solar System — it contains a third of the belt's entire mass. NASA's Dawn orbiter found bright salt deposits in Occator crater left by briny water seeping up from below, meaning even this little world may be an ocean world.`,
    layout: { dist: 80, size: 0.4, periodDays: 1682, color: 0x9b948b, inclination: 0.18 },
    tex: { bands: ['#9b948b', '#857e75', '#aaa298'], craters: true },
    moons: [],
  },
  {
    id: 'orcus', name: 'Orcus', subtitle: 'Dwarf planet — Kuiper Belt',
    stats: [
      ['Diameter', '≈ 910 km'], ['Distance from Sun', '39.4 AU average'],
      ['Year', '245 Earth years'], ['Moons', '1 (Vanth)'],
      ['Nickname', 'The "anti-Pluto"'],
    ],
    desc: `Called the "anti-Pluto" because it shares Pluto's orbit type but stays permanently on the opposite side of the Sun. Like Pluto it has a comparatively huge moon, Vanth, making it another near-double system.`,
    layout: { dist: 216, size: 0.32, periodDays: 89500, color: 0x8d8a84, inclination: 0.42 },
    tex: { bands: ['#8d8a84', '#76736d', '#9e9b95'], craters: true },
    moons: [
      {
        id: 'vanth', name: 'Vanth', subtitle: 'Moon of Orcus',
        stats: [['Diameter', '≈ 440 km'], ['Orbital period', '9.5 days']],
        desc: `Nearly half the size of Orcus itself. The pair orbit each other fully tidally locked — like Pluto and Charon, they are closer to a double dwarf planet than a planet and moon.`,
        size: 0.16, color: 0x6f6c66, periodDays: 9.54, craters: true,
      },
    ],
  },
  {
    id: 'haumea', name: 'Haumea', subtitle: 'Dwarf planet — Kuiper Belt',
    stats: [
      ['Dimensions', '≈ 2,100 × 1,680 × 1,074 km — egg-shaped'],
      ['Distance from Sun', '43.2 AU average'], ['Year', '285 Earth years'],
      ['Day', '3.9 hours — the fastest-spinning large body known'],
      ['Moons', '2 (Hiʻiaka & Namaka)'], ['Rings', 'Yes — discovered 2017'],
    ],
    desc: `A dwarf planet spinning so fast — one rotation every 4 hours — that it has been stretched into the shape of a rugby ball. It has two moons, a ring (the first ever found around a dwarf planet), and a surface of crystalline water ice, all likely debris from an ancient giant collision.`,
    layout: { dist: 228, size: 0.45, periodDays: 104100, color: 0xd8d4cc, inclination: 0.5 },
    tex: { bands: ['#dcd8d0', '#c4c0b8', '#eceae4'] },
    moons: [
      {
        id: 'hiiaka', name: 'Hiʻiaka', subtitle: 'Moon of Haumea',
        stats: [['Diameter', '≈ 310 km'], ['Orbital period', '49.5 days']],
        desc: `Haumea's larger moon, covered in pure water ice — almost certainly a fragment knocked off Haumea in the giant impact that set the dwarf planet spinning.`,
        size: 0.14, color: 0xd0ccc4, periodDays: 49.5,
      },
      {
        id: 'namaka', name: 'Namaka', subtitle: 'Moon of Haumea',
        stats: [['Diameter', '≈ 170 km'], ['Orbital period', '18.3 days']],
        desc: `The smaller, inner moon of Haumea, named (like the whole family) after Hawaiian goddesses — Haumea's discovery was announced from a Hawaiian observatory.`,
        size: 0.1, color: 0xbeb9b1, periodDays: 18.3,
      },
    ],
  },
  {
    id: 'quaoar', name: 'Quaoar', subtitle: 'Dwarf planet — Kuiper Belt',
    stats: [
      ['Diameter', '≈ 1,090 km'], ['Distance from Sun', '43.7 AU average'],
      ['Year', '289 Earth years'], ['Moons', '1 (Weywot)'],
      ['Rings', 'Yes — at an "impossible" distance'],
    ],
    desc: `A Kuiper Belt dwarf planet with a ring that shouldn't exist: it orbits far outside the Roche limit, where the material ought to have clumped into a moon long ago. Quaoar is named for the creation god of the Tongva people of the Los Angeles basin.`,
    layout: { dist: 232, size: 0.36, periodDays: 105500, color: 0x9a7f6e, inclination: 0.14 },
    tex: { bands: ['#9a7f6e', '#826a5b', '#ad9282'], craters: true },
    moons: [
      {
        id: 'weywot', name: 'Weywot', subtitle: 'Moon of Quaoar',
        stats: [['Diameter', '≈ 170 km'], ['Orbital period', '12.4 days']],
        desc: `Quaoar's small moon, named for the son of the god Quaoar in Tongva mythology. Its orbit helped astronomers weigh its parent dwarf planet.`,
        size: 0.1, color: 0x83705f, periodDays: 12.43,
      },
    ],
  },
  {
    id: 'makemake', name: 'Makemake', subtitle: 'Dwarf planet — Kuiper Belt',
    stats: [
      ['Diameter', '≈ 1,430 km'], ['Distance from Sun', '45.8 AU average'],
      ['Year', '306 Earth years'], ['Moons', '1 (MK2)'],
      ['Surface', 'Frozen methane & ethane'],
    ],
    desc: `The second-brightest object in the Kuiper Belt after Pluto, reddish with frozen methane. Its discovery near Easter 2005 earned it the name of the creator god of Rapa Nui (Easter Island). In 2016 Hubble spotted a charcoal-dark little moon, nicknamed MK2.`,
    layout: { dist: 238, size: 0.5, periodDays: 111800, color: 0xb5705a, inclination: 0.55 },
    tex: { bands: ['#b5705a', '#9c5d48', '#c8836c'], craters: true },
    moons: [
      {
        id: 'mk2', name: 'MK2 (S/2015 (136472) 1)', subtitle: 'Moon of Makemake',
        stats: [['Diameter', '≈ 175 km'], ['Orbital period', '≈ 12 days'], ['Albedo', 'Charcoal-dark']],
        desc: `Makemake's only known moon, as dark as charcoal in contrast to its bright parent — possibly because it is too small to hold on to bright ices, which escape to space.`,
        size: 0.1, color: 0x4a4540, periodDays: 12.4,
      },
    ],
  },
  {
    id: 'gonggong', name: 'Gonggong', subtitle: 'Dwarf planet — scattered disc',
    stats: [
      ['Diameter', '≈ 1,230 km'], ['Distance from Sun', '67.5 AU average'],
      ['Year', '554 Earth years'], ['Moons', '1 (Xiangliu)'],
      ['Named after', 'A Chinese water god — by public vote in 2019'],
    ],
    desc: `One of the largest known worlds beyond Neptune, red with organic compounds and possibly half water ice. It spins unusually slowly for its size — its moon Xiangliu has likely been braking it for billions of years.`,
    layout: { dist: 246, size: 0.42, periodDays: 202000, color: 0xa4523c, inclination: 0.6 },
    tex: { bands: ['#a4523c', '#8b4332', '#b86650'], craters: true },
    moons: [
      {
        id: 'xiangliu', name: 'Xiangliu', subtitle: 'Moon of Gonggong',
        stats: [['Diameter', '≈ 100 km'], ['Orbital period', '≈ 25 days']],
        desc: `Named after the nine-headed serpent that attended the water god Gonggong in Chinese mythology. Found by re-examining old Hubble images after the dwarf planet's slow spin hinted a moon must exist.`,
        size: 0.08, color: 0x7d4234, periodDays: 25.2,
      },
    ],
  },
  {
    id: 'eris', name: 'Eris', subtitle: 'Dwarf planet — the world that demoted Pluto',
    stats: [
      ['Diameter', '2,326 km'], ['Mass', '1.66 × 10²² kg — 27% more than Pluto'],
      ['Distance from Sun', '67.9 AU average (96 AU now)'],
      ['Year', '559 Earth years'], ['Moons', '1 (Dysnomia)'],
    ],
    desc: `Eris's discovery in 2005 — a world more massive than Pluto, three times farther out — forced astronomers to define "planet" for the first time, and Pluto didn't make the cut. Fittingly, it is named after the Greek goddess of discord. Its surface of frozen nitrogen and methane is among the most reflective in the Solar System.`,
    layout: { dist: 254, size: 0.55, periodDays: 204000, color: 0xd8d8d0, inclination: 0.8 },
    tex: { bands: ['#dcdcd4', '#c8c8c0', '#ecece6'] },
    moons: [
      {
        id: 'dysnomia', name: 'Dysnomia', subtitle: 'Moon of Eris',
        stats: [['Diameter', '≈ 700 km'], ['Orbital period', '15.8 days']],
        desc: `Eris's dark moon, named after the goddess of lawlessness — daughter of Eris. Tracking its orbit is how astronomers weighed Eris and discovered it outweighs Pluto.`,
        size: 0.18, color: 0x6e6a64, periodDays: 15.79, craters: true,
      },
    ],
  },
  {
    id: 'sedna', name: 'Sedna', subtitle: 'Trans-Neptunian object — inner Oort Cloud',
    stats: [
      ['Diameter', '≈ 1,000 km'], ['Perihelion', '76 AU — never comes close'],
      ['Aphelion', '≈ 900 AU'], ['Year', '≈ 11,400 Earth years'],
      ['Colour', 'One of the reddest objects known'],
    ],
    desc: `A mysterious deep-red world on an orbit so vast it takes 11,400 years to circle the Sun — when it last passed this close, humans were inventing agriculture. Nothing known can explain its detached orbit, which is one of the key pieces of evidence used to argue for an undiscovered "Planet Nine".`,
    layout: { dist: 268, size: 0.36, periodDays: 4163000, color: 0xb04a30, inclination: 0.35, eccentric: 0.15 },
    tex: { bands: ['#b04a30', '#963c28', '#c45a3e'] },
    moons: [],
  },
];

export const BELTS = {
  asteroid: {
    name: 'Asteroid Belt', subtitle: 'Between Mars and Jupiter',
    stats: [['Location', '2.2 – 3.2 AU'], ['Known asteroids', '1.3 million+'], ['Total mass', 'Only ~3% of the Moon'], ['Largest member', 'Ceres (940 km, dwarf planet)']],
    desc: `Millions of rocky fragments left over from the Solar System's formation, prevented from forming a planet by Jupiter's gravity. Despite the movies, it is mostly empty space — asteroids are typically a million kilometres apart.`,
  },
  kuiper: {
    name: 'Kuiper Belt', subtitle: 'Beyond Neptune',
    stats: [['Location', '30 – 55 AU'], ['Contents', 'Icy bodies, dwarf planets, comets'], ['Notable members', 'Pluto, Eris, Makemake, Haumea, Arrokoth']],
    desc: `A vast ring of frozen worlds beyond Neptune — leftovers from planet formation, preserved in a deep freeze for 4.6 billion years. It is the source of many short-period comets. Far beyond it lies the hypothesised Oort Cloud, stretching halfway to the nearest star.`,
  },
};

export const ISS_INFO = {
  id: 'iss', name: 'International Space Station', subtitle: '● LIVE position',
  stats: [
    ['Altitude', '≈ 420 km'], ['Speed', '≈ 27,600 km/h (7.66 km/s)'],
    ['Orbital period', '92.9 min — 16 sunrises a day'],
    ['Size', '109 m × 73 m'], ['Mass', '≈ 420 tonnes'],
    ['Crew', 'Usually 7'], ['Continuously inhabited since', '2 November 2000'],
  ],
  desc: `The largest structure humans have ever put in space, assembled in orbit from over 40 launches by 15 nations. Astronauts aboard run hundreds of experiments in microgravity and have kept an unbroken human presence in space for over 25 years. Its position on this map is fetched live every few seconds.`,
};

export const SAT_GENERIC = {
  desc: `Tracked satellite. Position is computed in real time from its latest public orbital elements (TLE data from CelesTrak) using the SGP4 propagation model — the same maths used by ground stations to point antennas.`,
};

// Identify what a satellite is from its catalog name.
// Order matters — first match wins.
const SAT_CLASSES = [
  { re: /ISS|ZARYA/i, type: 'Crewed space station', desc: `A module of the International Space Station — the largest structure humans have ever put in space, continuously inhabited since November 2000 by rotating crews of around seven astronauts.` },
  { re: /CSS|TIANHE|TIANGONG|WENTIAN|MENGTIAN/i, type: 'Crewed space station (China)', desc: `Part of China's Tiangong ("Heavenly Palace") space station, assembled in orbit since 2021 and permanently crewed by rotating three-person taikonaut crews.` },
  { re: /^SZ-\d+|SHENZHOU|SOYUZ|PROGRESS|CREW DRAGON|DRAGON|CYGNUS|^HTV/i, type: 'Crew / cargo spacecraft', desc: `A spacecraft built to carry astronauts or supplies between Earth and an orbiting space station — the workhorse ferries of human spaceflight.` },
  { re: /STARLINK/i, type: 'Internet constellation satellite (SpaceX Starlink)', desc: `One of SpaceX's Starlink satellites — the largest satellite constellation ever built, with thousands of units beaming broadband internet to the ground. Starlink now accounts for more than half of all active satellites in orbit.` },
  { re: /ONEWEB/i, type: 'Internet constellation satellite (OneWeb)', desc: `Part of the OneWeb constellation of ~600 satellites providing broadband internet from low Earth orbit, a competitor to SpaceX's Starlink.` },
  { re: /\bDEB\b/i, type: 'Space debris', desc: `A tracked fragment of space debris — a piece of a broken-up satellite or rocket. Over 35,000 debris objects large enough to track are circling Earth at bullet-dwarfing speeds, a growing hazard for working spacecraft.` },
  { re: /\bR\/?B\b|ROCKET BODY|^SL-\d+|CZ-\d+|H-?2A|ARIANE|FALCON 9|ATLAS \d|DELTA \d|TITAN/i, type: 'Spent rocket stage', desc: `The discarded upper stage of a rocket, still coasting around Earth years or decades after delivering its payload. These big empty tubes are among the brightest human-made objects in the night sky — and prime candidates for future debris-removal missions.` },
  { re: /HST|HUBBLE/i, type: 'Space telescope', desc: `The Hubble Space Telescope — launched in 1990 and still one of the most productive scientific instruments ever built. From above the atmosphere it has measured the age of the universe, photographed galaxies 13 billion light-years away, and produced many of the images in this map's spirit.` },
  { re: /GPS|NAVSTAR|GLONASS|GALILEO \d|BEIDOU|QZS/i, type: 'Navigation satellite', desc: `Part of a global navigation constellation (GPS and its siblings). Each satellite carries atomic clocks accurate to nanoseconds; your phone finds itself by comparing the arrival time of signals from several of them — an everyday application of Einstein's relativity.` },
  { re: /IRIDIUM/i, type: 'Satellite-phone constellation (Iridium)', desc: `One of the 66-satellite Iridium constellation that lets satellite phones work anywhere on Earth, pole to pole. The original Iridiums were famous for "Iridium flares" — dazzling glints of sunlight off their door-sized antennas.` },
  { re: /NOAA|GOES|METEOR[- ]?M?|METOP|FENGYUN|HIMAWARI|DMSP|GPM|ELEKTRO/i, type: 'Weather satellite', desc: `A meteorological satellite. Spacecraft like this one supply the cloud imagery in every weather forecast you've ever seen, track hurricanes from above, and monitor the climate over decades.` },
  { re: /LANDSAT|SENTINEL|TERRA\b|AQUA\b|SUOMI|ENVISAT|ERS-\d|ALOS|SPOT \d|RESURS|OKEAN|CBERS|GAOFEN|WORLDVIEW/i, type: 'Earth-observation satellite', desc: `An Earth-observation satellite, photographing and measuring the planet from orbit — crops, forests, ice sheets, cities, disasters. Series like Landsat have imaged the entire Earth continuously since 1972, an irreplaceable scientific record.` },
  { re: /AJISAI|LAGEOS|STARLETTE|STELLA\b|ETALON|LARES|BLITS/i, type: 'Laser-ranging geodesy sphere', desc: `A passive, mirror-covered metal sphere with no electronics at all. Ground stations bounce lasers off it to measure Earth's shape, rotation and continental drift to millimetre precision. It will orbit unchanged for millions of years — LAGEOS carries a map of Earth's continents as a message for whoever finds it.` },
  { re: /INTELSAT|EUTELSAT|\bSES[- ]\d|TELSTAR|TDRS|INMARSAT|ASTRA|AMC-|GALAXY \d/i, type: 'Communications satellite', desc: `A commercial communications satellite, relaying television, telephone and data links. Most sit in geostationary orbit, 35,786 km up, where they circle exactly once per day and so hang motionless over one spot on the equator.` },
  { re: /COSMOS|KOSMOS/i, type: 'Russian "Cosmos" satellite', desc: `A satellite of the Soviet/Russian Cosmos series — the catch-all designation used since 1962 for over 2,500 military, navigation and scientific spacecraft. Many of the brightest objects in the sky are large Cosmos satellites and their rocket stages.` },
  { re: /OAO|SEASAT|NIMBUS|PEGASUS|EXPLORER|VANGUARD|MIDAS|TRANSIT/i, type: 'Historic early satellite', desc: `A veteran of the early Space Age, launched in the 1950s–70s and long since retired — but still up there, silently circling. Vanguard 1 (1958) is the oldest human object in space and will stay in orbit for centuries.` },
];

export function classifySat(name) {
  for (const c of SAT_CLASSES) if (c.re.test(name)) return c;
  return {
    type: 'Satellite',
    desc: `A catalogued artificial satellite. Around 12,000 active satellites and tens of thousands of tracked objects currently orbit Earth; this is one of the few hundred bright enough to be seen with the naked eye.`,
  };
}

export const SGR_A = {
  id: 'sgra', name: 'Sagittarius A*', subtitle: 'Supermassive black hole',
  stats: [
    ['Mass', '4.15 million Suns'], ['Diameter (event horizon)', '≈ 24 million km'],
    ['Distance from Earth', '26,700 light-years'],
    ['First imaged', '2022, Event Horizon Telescope'],
  ],
  desc: `The supermassive black hole at the exact centre of the Milky Way. Every star in the galaxy, including the Sun, orbits around it. Stars near the core whip around it at up to 24,000 km/s — observations of those orbits earned the 2020 Nobel Prize in Physics.`,
};

export const SUN_MARKER = {
  id: 'youarehere', name: 'You are here — the Sun', subtitle: 'Orion Arm, Milky Way',
  stats: [
    ['Distance from galactic centre', '≈ 26,700 light-years'],
    ['Orbital speed', '≈ 230 km/s'],
    ['Galactic year', '≈ 225–250 million years'],
    ['Orbits completed', '≈ 20 since the Sun formed'],
  ],
  desc: `Our Solar System sits in a quiet suburb of the Milky Way called the Orion Arm, about halfway out from the centre. The Sun has circled the galaxy roughly 20 times since it was born — the last time we were on this side of the galaxy, dinosaurs had not yet evolved. Zoom in to visit the Solar System.`,
};

// Notable stars plotted around the Sun in the Milky Way view.
// ly = distance in light-years · type = spectral class · c = display colour
// s = sprite size · label = show a permanent name label · pl = known planets
export const STARS = [
  { name: 'Proxima Centauri', ly: 4.25, type: 'M5.5 red dwarf', c: 0xff8866, s: 1.6, label: true, pl: '3 — incl. Proxima b in the habitable zone', desc: `The closest star to the Sun. A faint red dwarf invisible to the naked eye, yet it hosts Proxima b — a roughly Earth-sized planet in the habitable zone, the nearest possible exo-Earth.` },
  { name: 'Alpha Centauri A & B', ly: 4.37, type: 'G2V + K1V binary', c: 0xfff2cc, s: 2.4, label: true, pl: 'Candidate planets under study', desc: `The nearest Sun-like stars — a tight binary pair, with Proxima as a distant third companion. The natural first target for any future interstellar probe; the Breakthrough Starshot concept aims to send gram-scale craft there at 20% of light speed.` },
  { name: "Barnard's Star", ly: 5.96, type: 'M4 red dwarf', c: 0xff9070, s: 1.4, pl: '4 small planets (confirmed 2024)', desc: `The second-closest star system and the fastest-moving star in our sky. In 2024 astronomers confirmed four tiny planets orbiting it, each smaller than Earth.` },
  { name: 'Wolf 359', ly: 7.86, type: 'M6 red dwarf', c: 0xff7a5c, s: 1.2, desc: `One of the faintest and smallest stars known near the Sun — only about 9% of the Sun's mass. Famous to Star Trek fans as the site of the Federation's disastrous battle with the Borg.` },
  { name: 'Lalande 21185', ly: 8.3, type: 'M2 red dwarf', c: 0xff9b7a, s: 1.3, pl: '3', desc: `The brightest red dwarf visible from the northern hemisphere (though still telescope-only), with three known planets.` },
  { name: 'Sirius', ly: 8.6, type: 'A1V + white dwarf', c: 0xcfe2ff, s: 3.2, label: true, desc: `The brightest star in Earth's night sky, 25 times more luminous than the Sun. It hides a companion: Sirius B, a white dwarf — the burnt-out core of a star that died 120 million years ago, packing the Sun's mass into an Earth-sized sphere.` },
  { name: 'Luyten 726-8 (UV Ceti)', ly: 8.7, type: 'M5.5 flare binary', c: 0xff8060, s: 1.2, desc: `A pair of tiny flare stars that can brighten 75-fold within minutes — the prototype of the "flare star" class.` },
  { name: 'Ross 154', ly: 9.7, type: 'M3.5 red dwarf', c: 0xff8d6c, s: 1.2, desc: `A young, magnetically active red dwarf and one of the Sun's nearest neighbours.` },
  { name: 'Epsilon Eridani', ly: 10.5, type: 'K2V orange dwarf', c: 0xffc890, s: 1.9, pl: '1 confirmed gas giant + debris discs', desc: `A young (under 1 billion years) orange star with a Jupiter-like planet and rings of asteroids and comets — a snapshot of what our Solar System may have looked like in its youth.` },
  { name: 'Lacaille 9352', ly: 10.7, type: 'M0.5 red dwarf', c: 0xffa080, s: 1.3, pl: '3 super-Earths', desc: `A nearby red dwarf with at least three super-Earth planets, two of them in or near the habitable zone.` },
  { name: 'Procyon', ly: 11.5, type: 'F5 + white dwarf', c: 0xfff6e0, s: 2.6, desc: `The eighth-brightest star in our sky, slightly evolved and beginning to swell as it exhausts its hydrogen. Like Sirius, it is orbited by a faint white dwarf companion.` },
  { name: '61 Cygni', ly: 11.4, type: 'K5 + K7 binary', c: 0xffbe8a, s: 1.6, desc: `The first star ever to have its distance measured (Bessel, 1838) — the moment humanity finally knew how far away the stars truly are.` },
  { name: 'Tau Ceti', ly: 11.9, type: 'G8V — Sun-like', c: 0xfff0c8, s: 2.0, label: true, pl: '4 confirmed super-Earths', desc: `The nearest single Sun-like star, long a favourite of science fiction and SETI searches. It hosts at least four super-Earths, two skirting the habitable zone, though its heavy debris disc means frequent asteroid impacts.` },
  { name: "Kapteyn's Star", ly: 12.8, type: 'M1 subdwarf', c: 0xff9878, s: 1.3, desc: `An ancient halo star — likely ~11 billion years old, born in a dwarf galaxy that the Milky Way devoured. It orbits the galaxy backwards relative to the Sun.` },
  { name: 'TRAPPIST-1', ly: 40.7, type: 'M8 ultra-cool dwarf', c: 0xff6a4a, s: 1.5, label: true, pl: '7 Earth-sized planets — 3 in the habitable zone', desc: `An ultra-cool dwarf barely larger than Jupiter, orbited by SEVEN Earth-sized planets — the most found around any star. Three sit in the habitable zone, and all seven would fit inside Mercury's orbit. The James Webb telescope is currently probing their atmospheres.` },
  { name: '51 Pegasi', ly: 50.6, type: 'G2IV — Sun-like', c: 0xfff0c0, s: 1.9, label: true, pl: '1 — the first exoplanet found around a Sun-like star', desc: `Where the exoplanet era began: in 1995, 51 Pegasi b — a "hot Jupiter" racing around its star every 4.2 days — became the first planet found orbiting another Sun-like star. The discovery won the 2019 Nobel Prize in Physics.` },
  { name: '55 Cancri', ly: 41, type: 'G8V + red dwarf', c: 0xffeec0, s: 1.7, pl: '5 — incl. lava world 55 Cancri e', desc: `Home to five known planets, including 55 Cancri e: a scorching super-Earth with a possible magma ocean, once (probably wrongly, but memorably) speculated to be one-third diamond.` },
  { name: 'HD 189733', ly: 64.5, type: 'K2V orange dwarf', c: 0xffc080, s: 1.5, pl: '1 — the "blue marble" hot Jupiter', desc: `Its planet HD 189733 b is deep cobalt blue — but not from oceans. The colour comes from silicate clouds; on this world it likely rains molten glass, sideways, in 8,700 km/h winds.` },
  { name: 'Vega', ly: 25, type: 'A0V', c: 0xd8e8ff, s: 2.9, label: true, desc: `The fifth-brightest star in our sky and the historical "standard candle" against which stellar brightness was calibrated. It was the pole star 12,000 BC and will be again in 13,700 years — Earth's axis slowly traces a circle.` },
  { name: 'Fomalhaut', ly: 25, type: 'A3V', c: 0xdce8ff, s: 2.5, pl: 'Spectacular debris ring', desc: `"The lonely star of autumn", surrounded by a vast, sharply sculpted ring of dust — one of the first planetary systems ever photographed directly.` },
  { name: 'Altair', ly: 16.7, type: 'A7V', c: 0xe8f0ff, s: 2.4, desc: `One of the closest bright stars, spinning so fast (a rotation every 9 hours) that it is visibly flattened — its equator bulges 20% wider than its poles.` },
  { name: 'Pollux', ly: 34, type: 'K0 giant', c: 0xffcc8a, s: 2.3, pl: '1 confirmed giant planet', desc: `The nearest giant star to the Sun, and the brightest star known to host a planet — Pollux b, a gas giant of at least twice Jupiter's mass.` },
  { name: 'Arcturus', ly: 37, type: 'K1.5 red giant', c: 0xffb870, s: 3.0, label: true, desc: `The brightest star in the northern celestial hemisphere — a red giant 25 times the Sun's diameter, showing us the Sun's own future. It is racing past the Sun and in a million years will fade from naked-eye view.` },
  { name: 'Capella', ly: 43, type: 'G giant pair', c: 0xfff0c0, s: 2.6, desc: `Looks like one golden star, but is actually two giant suns orbiting each other closer than Earth orbits the Sun — plus a distant pair of red dwarfs.` },
  { name: 'Aldebaran', ly: 65, type: 'K5 red giant', c: 0xffaa66, s: 2.8, desc: `The fiery orange eye of Taurus the Bull, a red giant 44 times the Sun's diameter. The Pioneer 10 probe is heading toward it — arrival in about two million years.` },
  { name: 'Regulus', ly: 79, type: 'B8 + companions', c: 0xcfe0ff, s: 2.4, desc: `The heart of Leo, spinning at 96% of its break-up speed — if it rotated just a little faster it would tear itself apart.` },
  { name: 'Spica', ly: 250, type: 'B1 binary', c: 0xbcd4ff, s: 2.6, desc: `Two huge blue stars whirling around each other every four days, so close they distort each other into egg shapes. Combined, they shine 20,000 times brighter than the Sun.` },
  { name: 'Canopus', ly: 310, type: 'A9 bright giant', c: 0xf4f8ff, s: 3.0, desc: `The second-brightest star in our night sky, 10,000 times the Sun's luminosity. Spacecraft have used it for decades as a navigation beacon.` },
  { name: 'Achernar', ly: 139, type: 'B6 — flattest star known', c: 0xc4d8ff, s: 2.4, desc: `The flattest star known: it spins so fast its equatorial diameter is 35% larger than its polar diameter — a cosmic squashed tangerine.` },
  { name: 'Polaris', ly: 433, type: 'F7 supergiant (Cepheid)', c: 0xfff6e4, s: 2.4, label: true, desc: `The North Star — aligned with Earth's axis by pure coincidence, it appears to stand still while the sky wheels around it. It is also a Cepheid variable, the type of pulsating star used to measure the universe.` },
  { name: 'Mira', ly: 300, type: 'M7 red giant (variable)', c: 0xff9560, s: 2.2, desc: `"The Wonderful" — the first variable star ever recognised (1596). It brightens and fades 1,500-fold every 11 months, and drags a comet-like tail of shed gas 13 light-years long.` },
  { name: 'Betelgeuse', ly: 548, type: 'M2 red supergiant', c: 0xff7744, s: 3.6, label: true, desc: `A dying red supergiant ~900 times the Sun's diameter — placed at the Sun, it would swallow Jupiter. It will explode as a supernova "soon" (any time in the next 100,000 years), briefly outshining the full Moon in Earth's sky. Its mysterious 2019 "Great Dimming" was a cloud of ejected dust.` },
  { name: 'Antares', ly: 554, type: 'M1.5 red supergiant', c: 0xff6a3c, s: 3.4, desc: `"The rival of Mars" — a red supergiant so vast that its outer atmosphere would reach beyond the asteroid belt. Like Betelgeuse, it is in its final act before a supernova.` },
  { name: 'Rigel', ly: 863, type: 'B8 blue supergiant', c: 0xc8dcff, s: 3.2, label: true, desc: `Orion's blazing blue foot: a supergiant shining 120,000 times brighter than the Sun. Blue supergiants live fast and die young — Rigel is only 8 million years old and already nearing its end.` },
  { name: 'Deneb', ly: 2615, type: 'A2 supergiant', c: 0xe4eeff, s: 3.2, desc: `One of the most luminous stars visible to the naked eye — nearly 200,000 Suns' worth of light. It appears bright in our sky despite lying roughly 2,600 light-years away.` },
  { name: 'Eta Carinae', ly: 7500, type: 'LBV — supernova impostor', c: 0xd8c8ff, s: 3.0, label: true, desc: `One of the most massive and unstable star systems known (~100 + 30 solar masses). In the 1840s it erupted so violently it briefly became the sky's second-brightest star and ejected the Homunculus Nebula. It could go hypernova at any time.` },
  { name: 'VY Canis Majoris', ly: 3900, type: 'M red hypergiant', c: 0xff6038, s: 3.2, desc: `One of the largest stars known — roughly 1,400 times the Sun's diameter. A photon takes 6 hours to fly around it; placed at the Sun, its surface would reach past Jupiter toward Saturn.` },
  { name: 'UY Scuti', ly: 9500, type: 'M red supergiant', c: 0xff6840, s: 3.0, desc: `A contender for the largest known star, perhaps 1,700 solar diameters. If hollow, around 5 billion Suns would fit inside.` },
  { name: 'Stephenson 2-18', ly: 19000, type: 'M red supergiant', c: 0xff5c34, s: 3.0, desc: `Possibly the largest star ever measured — estimates exceed 2,000 solar diameters, which strains stellar theory itself. Measurements at this distance are uncertain; it may yet be dethroned.` },
  { name: 'Kepler-90', ly: 2840, type: 'G0V', c: 0xfff2cc, s: 1.7, label: true, pl: '8 — the only known system to tie the Solar System', desc: `The only star known to host eight planets, equal to our Solar System — the eighth was found by a Google neural network sifting Kepler data, the first exoplanet discovered by machine learning.` },
  { name: 'Kepler-452', ly: 1400, type: 'G2V — Sun-like', c: 0xfff0c8, s: 1.6, pl: `1 — Kepler-452b, "Earth's cousin"`, desc: `Hosts Kepler-452b, the famous "Earth's cousin": a planet just 60% larger than Earth, orbiting a Sun-like star at almost exactly Earth's distance, with a 385-day year.` },
  { name: 'Kepler-16', ly: 245, type: 'K + M binary', c: 0xffd09a, s: 1.5, pl: '1 — a real "Tatooine" with two suns', desc: `Home of Kepler-16b, the first confirmed planet orbiting two stars at once. Anyone standing there would watch a double sunset — Star Wars' Tatooine, made real.` },
  { name: 'PSR B1257+12', ly: 2300, type: 'Pulsar (dead star)', c: 0xaaccff, s: 1.4, pl: '3 — the first exoplanets ever discovered (1992)', desc: `A spinning corpse of an exploded star — and, astonishingly, home of the first planets ever found beyond the Solar System (1992). Its three worlds are bathed in deadly radiation; they were probably forged from the debris of the supernova itself.` },
  { name: "Tabby's Star (KIC 8462852)", ly: 1470, type: 'F3V', c: 0xf8f4e0, s: 1.5, desc: `The star whose bizarre, irregular dimming (up to 22%) briefly made headlines as a possible "alien megastructure". The verdict — almost certainly clouds of fine dust — but its strange flickering is still not fully explained.` },
  { name: 'TOI-700', ly: 101, type: 'M2 red dwarf', c: 0xff9272, s: 1.4, pl: '4 — incl. 2 habitable-zone Earth-sized worlds', desc: `A quiet red dwarf hosting two Earth-sized planets in its habitable zone, found by NASA's TESS mission — among the most promising nearby systems in the search for life.` },
  { name: 'Gliese 667C', ly: 23.6, type: 'M1.5 red dwarf', c: 0xff9878, s: 1.4, pl: 'Up to 6 — several super-Earths in the habitable zone', desc: `A red dwarf in a triple-star system, crowded with super-Earths — at least two (possibly more) in the habitable zone. From its planets, two extra suns hang in the sky.` },
];

export const STAR_FIELD_INFO = {
  id: 'starfieldnote', name: 'The Stars of the Milky Way', subtitle: '100 – 400 billion of them',
  stats: [['Plotted individually here', `${45} notable stars + every known exoplanet system`], ['Everything else', 'The glowing haze — billions more']],
  desc: `Every named marker near the Sun is a real star at its real distance (compressed logarithmically so you can see them). Every individual star you can see in Earth's night sky lives within the small bubble around the "You are here" marker — the rest of the galaxy's hundreds of billions of suns blur into the glow of the disc.`,
};

export const EXO_CLOUD_INFO = {
  id: 'exocloud', name: 'Known Exoplanets', subtitle: 'Every confirmed planet beyond the Solar System',
  desc: `Each faint green point is a real confirmed exoplanet from NASA's Exoplanet Archive, plotted in its true direction from the Sun (distances compressed to stay visible). Click any point for that planet's data. Almost all known exoplanets huddle near the Sun on this map — not because planets are rare elsewhere, but because our telescopes can only see so far.`,
};

export const GALAXIES = [
  {
    id: 'milkyway', name: 'Milky Way', subtitle: 'Barred spiral galaxy (SBbc) — home',
    stats: [
      ['Diameter', '≈ 100,000 light-years'],
      ['Stars', '100 – 400 billion'],
      ['Mass', '≈ 1.5 trillion Suns (mostly dark matter)'],
      ['Central black hole', 'Sagittarius A* (4.15 million Suns)'],
      ['Age', '≈ 13.6 billion years'],
    ],
    desc: `Our home galaxy: a barred spiral disc of hundreds of billions of stars, so large that light takes 100,000 years to cross it. Every individual star you can see in the night sky belongs to it. The Solar System lies in the Orion Arm, orbiting the centre once every ~230 million years.`,
    lg: { pos: [0, 0, 0], kind: 'spiral', size: 30 },
  },
  {
    id: 'andromeda', name: 'Andromeda Galaxy (M31)', subtitle: 'Spiral galaxy',
    stats: [
      ['Distance', '2.5 million light-years'],
      ['Diameter', '≈ 220,000 light-years'],
      ['Stars', '≈ 1 trillion'],
      ['Visible to naked eye', 'Yes — the most distant object you can see unaided'],
    ],
    desc: `The Milky Way's giant neighbour and the largest galaxy in the Local Group. Andromeda and the Milky Way are falling toward each other at 110 km/s and will collide and merge in about 4.5 billion years, forming a single giant elliptical galaxy sometimes nicknamed "Milkdromeda".`,
    lg: { pos: [125, 18, -35], kind: 'spiral', size: 36, tilt: 1.1 },
  },
  {
    id: 'triangulum', name: 'Triangulum Galaxy (M33)', subtitle: 'Spiral galaxy',
    stats: [
      ['Distance', '2.73 million light-years'],
      ['Diameter', '≈ 60,000 light-years'],
      ['Stars', '≈ 40 billion'],
    ],
    desc: `The third-largest member of the Local Group, a graceful face-on spiral. It is gravitationally bound to Andromeda and may be its satellite. M33 contains one of the largest known star-forming regions, NGC 604 — 40 times the size of the Orion Nebula.`,
    lg: { pos: [98, -14, -65], kind: 'spiral', size: 18, tilt: 0.4 },
  },
  {
    id: 'lmc', name: 'Large Magellanic Cloud', subtitle: 'Satellite galaxy of the Milky Way',
    stats: [
      ['Distance', '160,000 light-years'],
      ['Diameter', '≈ 14,000 light-years'],
      ['Stars', '≈ 20 billion'],
      ['Notable', 'Tarantula Nebula, Supernova 1987A'],
    ],
    desc: `The largest satellite galaxy of the Milky Way, visible to the naked eye from the southern hemisphere. It hosts the Tarantula Nebula — the most violent star-forming region in the Local Group — and produced the closest supernova of modern times in 1987. In ~2.4 billion years it will be absorbed by the Milky Way.`,
    lg: { pos: [9, -8, 5], kind: 'irregular', size: 7 },
  },
  {
    id: 'smc', name: 'Small Magellanic Cloud', subtitle: 'Satellite galaxy of the Milky Way',
    stats: [
      ['Distance', '200,000 light-years'],
      ['Diameter', '≈ 7,000 light-years'],
      ['Stars', 'A few billion'],
    ],
    desc: `The Large Magellanic Cloud's smaller companion, a dwarf irregular galaxy being slowly torn apart by the gravity of the Milky Way and the LMC. A bridge of gas and stars connects the two Clouds. Observations of its pulsating stars in 1912 gave astronomers the first tool to measure the scale of the universe.`,
    lg: { pos: [12, -11, 8], kind: 'irregular', size: 5 },
  },
  {
    id: 'sagdwarf', name: 'Sagittarius Dwarf Galaxy', subtitle: 'Disrupting satellite galaxy',
    stats: [
      ['Distance', '70,000 light-years'],
      ['Diameter', '≈ 10,000 light-years'],
      ['Status', 'Being torn apart and absorbed by the Milky Way'],
    ],
    desc: `A dwarf galaxy caught in the act of being devoured. The Milky Way's tides have stretched it into a long stream of stars wrapped around our galaxy. Galactic cannibalism like this is how big galaxies grow — the Milky Way has eaten dozens of smaller galaxies over its history.`,
    lg: { pos: [4, 3, -3], kind: 'dwarf', size: 3.5 },
  },
  {
    id: 'm32', name: 'M32', subtitle: 'Compact elliptical galaxy',
    stats: [
      ['Distance', '2.65 million light-years'],
      ['Diameter', '≈ 6,500 light-years'],
      ['Type', 'Compact elliptical — satellite of Andromeda'],
    ],
    desc: `A dense little elliptical galaxy hugging Andromeda. It may be the stripped core of a once much larger spiral galaxy that Andromeda cannibalised about 2 billion years ago.`,
    lg: { pos: [120, 22, -32], kind: 'elliptical', size: 3 },
  },
  {
    id: 'm110', name: 'M110', subtitle: 'Dwarf elliptical galaxy',
    stats: [
      ['Distance', '2.69 million light-years'],
      ['Diameter', '≈ 15,000 light-years'],
      ['Type', 'Dwarf elliptical — satellite of Andromeda'],
    ],
    desc: `Andromeda's other bright companion, a soft elliptical glow of old yellow stars. Charles Messier drew it in 1773 but never added it to his catalogue — it was given the number 110 only in 1967.`,
    lg: { pos: [131, 14, -41], kind: 'elliptical', size: 4 },
  },
  {
    id: 'ngc6822', name: "Barnard's Galaxy (NGC 6822)", subtitle: 'Dwarf irregular galaxy',
    stats: [
      ['Distance', '1.6 million light-years'],
      ['Diameter', '≈ 7,000 light-years'],
    ],
    desc: `An isolated dwarf irregular galaxy, similar to the Small Magellanic Cloud. In 1925 Edwin Hubble used its stars to prove it lay far outside the Milky Way — among the first proof that other galaxies exist at all.`,
    lg: { pos: [-62, -22, 38], kind: 'irregular', size: 4.5 },
  },
  {
    id: 'ic10', name: 'IC 10', subtitle: 'Starburst dwarf galaxy',
    stats: [
      ['Distance', '2.2 million light-years'],
      ['Diameter', '≈ 5,000 light-years'],
      ['Type', 'The only starburst galaxy in the Local Group'],
    ],
    desc: `A small galaxy undergoing a furious burst of star formation, packed with massive young stars and stellar-mass black holes. It hides behind the dusty plane of the Milky Way, which is why it was not discovered until 1887.`,
    lg: { pos: [104, 38, -12], kind: 'irregular', size: 4 },
  },
];

export const LOCAL_GROUP_INFO = {
  id: 'localgroup', name: 'The Local Group', subtitle: 'Our galactic neighbourhood',
  stats: [
    ['Diameter', '≈ 10 million light-years'],
    ['Member galaxies', '80+ (mostly dwarfs)'],
    ['Dominant members', 'Andromeda & the Milky Way'],
    ['Part of', 'Virgo Supercluster → Laniakea'],
  ],
  desc: `The small cluster of galaxies bound to the Milky Way and Andromeda by gravity. While the wider universe expands, the Local Group holds together — in the far future it will merge into a single giant galaxy while all others recede beyond view.`,
};

export const UNIVERSE_LANDMARKS = [
  {
    id: 'laniakea', name: 'Laniakea Supercluster', subtitle: 'Our supercluster — "immeasurable heaven"',
    stats: [['Diameter', '≈ 520 million light-years'], ['Galaxies', '≈ 100,000'], ['Mass', '≈ 10¹⁷ Suns']],
    desc: `The colossal supercluster we call home, defined in 2014 by mapping the flows of galaxies. The Milky Way sits on its outskirts, drifting with thousands of other galaxies toward a mysterious gravitational focus called the Great Attractor.`,
  },
  {
    id: 'virgo', name: 'Virgo Cluster', subtitle: 'Nearest large galaxy cluster',
    stats: [['Distance', '54 million light-years'], ['Galaxies', '1,300 – 2,000'], ['Heart of', 'the Virgo Supercluster']],
    desc: `The nearest big city of galaxies, dominating our corner of the universe. Its central giant, M87, hosts a black hole of 6.5 billion solar masses — the first black hole ever photographed (2019).`,
  },
  {
    id: 'coma', name: 'Coma Cluster', subtitle: 'Galaxy cluster',
    stats: [['Distance', '≈ 320 million light-years'], ['Galaxies', '1,000+'], ['Historic role', 'First evidence of dark matter (Zwicky, 1933)']],
    desc: `A dense swarm of over a thousand galaxies. In 1933 Fritz Zwicky noticed its galaxies move far too fast to be held by visible matter alone — the first hint of dark matter, the invisible substance that makes up ~27% of the universe.`,
  },
  {
    id: 'shapley', name: 'Shapley Supercluster', subtitle: 'Largest nearby concentration of galaxies',
    stats: [['Distance', '≈ 650 million light-years'], ['Galaxies', '8,000+ in its core region']],
    desc: `The biggest concentration of matter in our cosmic neighbourhood — so massive that it tugs on the Milky Way and everything around us, contributing to our 600 km/s drift through space.`,
  },
  {
    id: 'attractor', name: 'The Great Attractor', subtitle: 'Gravitational anomaly',
    stats: [['Distance', '150 – 250 million light-years'], ['Mass', '≈ 10¹⁶ Suns'], ['Effect', 'Pulls the Milky Way at ~600 km/s']],
    desc: `A vast gravitational focus toward which the Milky Way and millions of other galaxies are streaming. It lies frustratingly hidden behind the dust of our own galaxy's disc, and only X-ray surveys have revealed the huge cluster (the Norma Cluster) at its core.`,
  },
  {
    id: 'bootes', name: 'Boötes Void', subtitle: 'The Great Nothing',
    stats: [['Distance', '≈ 700 million light-years'], ['Diameter', '≈ 330 million light-years'], ['Galaxies found', 'Only ~60 (expected: ~10,000)']],
    desc: `One of the largest known voids — a sphere of almost perfect emptiness 330 million light-years across. If the Milky Way were at its centre, we wouldn't have known other galaxies existed until the 1960s. The cosmic web is mostly such voids, with galaxies confined to the glowing filaments between them.`,
  },
  {
    id: 'sloan', name: 'Sloan Great Wall', subtitle: 'Galaxy filament',
    stats: [['Distance', '≈ 1 billion light-years'], ['Length', '≈ 1.37 billion light-years']],
    desc: `A wall of galaxies nearly 1.4 billion light-years long — one of the largest structures ever mapped, traced by the Sloan Digital Sky Survey. Structures like this form the "cosmic web": filaments of galaxies woven around enormous voids.`,
  },
  {
    id: 'hcb', name: 'Hercules–Corona Borealis Great Wall', subtitle: 'Largest known structure',
    stats: [['Distance', '≈ 10 billion light-years'], ['Length', '≈ 10 billion light-years'], ['Discovered', '2013, via gamma-ray bursts']],
    desc: `Possibly the largest single structure in the observable universe — a wall of galaxies spanning roughly a tenth of the visible cosmos. It is so big it challenges the assumption that the universe is uniform at large scales.`,
  },
  {
    id: 'jades', name: 'JADES-GS-z14-0', subtitle: 'Most distant known galaxy',
    stats: [['Light travel time', '13.5 billion years'], ['Seen as it was', '290 million years after the Big Bang'], ['Discovered', '2024, James Webb Space Telescope']],
    desc: `The most distant galaxy ever confirmed. Its light left when the universe was just 2% of its current age, and has been travelling toward us ever since. Looking deep into space is looking back in time — telescopes are time machines.`,
  },
];

export const CMB_INFO = {
  id: 'cmb', name: 'Cosmic Microwave Background', subtitle: 'The edge of the visible universe',
  stats: [
    ['Age of light', '13.8 billion years'],
    ['Emitted', '380,000 years after the Big Bang'],
    ['Temperature today', '2.725 K (−270.4 °C)'],
    ['Discovered', '1965 — by accident (Nobel Prize 1978)'],
  ],
  desc: `The oldest light in existence — the afterglow of the Big Bang itself, released when the universe first cooled enough to become transparent. It surrounds us in every direction and marks the absolute limit of what telescopes can ever see. The faint ripples in it are the seeds that grew into every galaxy on this map. About 1% of old analog-TV static was this signal.`,
};

export const OBSERVABLE_INFO = {
  id: 'observable', name: 'The Observable Universe', subtitle: 'Everything we can ever see',
  stats: [
    ['Diameter', '≈ 93 billion light-years'],
    ['Age', '13.8 billion years'],
    ['Galaxies', 'Hundreds of billions — perhaps 2 trillion'],
    ['Stars', '≈ 10²³ (more than grains of sand on Earth)'],
    ['Composition', '68% dark energy · 27% dark matter · 5% ordinary matter'],
  ],
  desc: `Everything whose light has had time to reach us since the Big Bang. It is centred on us not because we are special, but because every observer sits at the centre of their own bubble of visibility. Space itself has expanded while ancient light travelled, stretching the visible radius to 46.5 billion light-years — and the whole universe is almost certainly far larger still. Keep zooming out…`,
};

export const MULTIVERSE = {
  title: 'Beyond the Observable Universe — The Multiverse',
  intro: `You have scrolled past the edge of everything we can ever observe. The cosmic horizon is not a wall — it is simply the limit of how far light has travelled in 13.8 billion years. What lies beyond? Cosmologists have several serious — though unproven — ideas, collectively called <b>multiverse theories</b>.`,
  concepts: [
    {
      id: 'mv-level1', name: 'Level I — The Quilted Multiverse', subtitle: 'More of the same, forever',
      stats: [['Requires', 'Only that space is much bigger than what we see'], ['Status', 'Considered very plausible']],
      desc: `If space continues far beyond our horizon — and measurements suggest it is flat and possibly infinite — then there are countless other "observable universes" like ours, each centred on a different point. In an infinite volume, every possible arrangement of matter repeats: somewhere unimaginably far away, there may be an exact copy of you reading this exact sentence.`,
    },
    {
      id: 'mv-level2', name: 'Level II — Bubble Universes', subtitle: 'Eternal inflation',
      stats: [['Origin', 'Inflationary cosmology (Guth, Linde, Vilenkin)'], ['Prediction', 'Different physical constants per bubble']],
      desc: `The leading theory of the Big Bang — cosmic inflation — may never fully stop. Quantum fluctuations would continually spawn new "bubble" universes inside an eternally inflating background, each bubble a complete universe that may crystallise with different physical constants. Ours would be one bubble whose constants happen to allow stars, chemistry and life. The bubbles drawn around you here illustrate this idea.`,
    },
    {
      id: 'mv-level3', name: 'Level III — Many Worlds', subtitle: 'Quantum branching',
      stats: [['Origin', 'Everett interpretation of quantum mechanics (1957)'], ['Location', 'Not far away — parallel to here']],
      desc: `Quantum mechanics says particles exist in superpositions of states until measured. The Many-Worlds interpretation takes the equations literally: every quantum event splits reality into branches in which each outcome happens. These parallel worlds aren't somewhere else in space — they coexist with ours in an ever-branching quantum wavefunction.`,
    },
    {
      id: 'mv-level4', name: 'Level IV — The Mathematical Multiverse', subtitle: 'All possible laws of physics',
      stats: [['Proposed by', 'Max Tegmark'], ['Status', 'The most speculative level']],
      desc: `The most radical idea: every mathematically consistent structure physically exists, and our universe is simply one equation among infinitely many, experienced from the inside. Universes with entirely different laws of physics — not just different constants — would all be equally real.`,
    },
    {
      id: 'mv-strings', name: 'The String Landscape', subtitle: '10⁵⁰⁰ possible universes',
      stats: [['Origin', 'String theory'], ['Possible vacuum states', '≈ 10⁵⁰⁰']],
      desc: `String theory permits an astronomical number (~10⁵⁰⁰) of stable configurations of space, each yielding different particles and forces. Combined with eternal inflation, every configuration could be realised in some bubble — possibly explaining why our universe's constants seem so finely tuned for life: we could only exist in a bubble where they are.`,
    },
    {
      id: 'mv-cyclic', name: 'Cyclic & Brane Universes', subtitle: 'Universes before our own',
      stats: [['Variants', 'Ekpyrotic model, conformal cyclic cosmology (Penrose)'], ['Idea', 'The Big Bang was not the beginning']],
      desc: `Perhaps the Big Bang was a transition, not a beginning: colliding higher-dimensional membranes ("branes"), or an endless cycle in which each universe's cold, empty end becomes the next one's hot, dense birth. Roger Penrose has even claimed (controversially) to see faint rings in the cosmic microwave background left by a previous aeon.`,
    },
    {
      id: 'mv-evidence', name: 'Could we ever know?', subtitle: 'The scientific status of the multiverse',
      stats: [['Direct observation', 'Impossible by definition'], ['Possible indirect tests', 'CMB "bruises", gravitational wave relics, fine-tuning statistics']],
      desc: `The multiverse is a serious prediction of well-tested theories (inflation, quantum mechanics), but no other universe has ever been observed — and may never be. Scientists search for indirect evidence, such as a circular "bruise" in the cosmic microwave background from an ancient collision with a neighbouring bubble. Until then, the multiverse remains exactly that: a beautiful, mathematically motivated hypothesis at the very edge of science. Everything you zoomed through to get here, though — that part is real.`,
    },
  ],
};

export const LEVEL_META = [
  { name: 'Earth', tagline: 'Home — with live satellites & the ISS', kmPerUnit: 637.1 },
  { name: 'The Solar System', tagline: 'One star, 17 (dwarf) planets & every catalogued moon', kmPerUnit: 149.6e6 / 52 },
  { name: 'The Milky Way', tagline: '≈ 200 billion stars — every known exoplanet plotted', kmPerUnit: (100000 * 9.461e12) / 400 },
  { name: 'The Local Group', tagline: 'Our neighbourhood of galaxies', kmPerUnit: (10e6 * 9.461e12) / 260 },
  { name: 'The Observable Universe', tagline: 'The cosmic web — everything we can see', kmPerUnit: (93e9 * 9.461e12) / 840 },
  { name: 'The Multiverse?', tagline: 'Beyond the edge of everything', kmPerUnit: 0 },
];

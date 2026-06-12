# 🌌 Universe Map

**An interactive, animated 3D map of everything — from satellites buzzing around Earth, all the way out past the observable universe and into the multiverse.**

Scroll to zoom. When you reach the edge of one scale, keep scrolling and you'll travel to the next: Earth → the Solar System → the Milky Way → the Local Group → the Observable Universe → and finally, beyond. Every planet, moon, star, galaxy and satellite is clickable, with real astronomical data and a written story for each.

Built with [Three.js](https://threejs.org/), vanilla JavaScript, and real data from NASA, CelesTrak and the Spaceflight News API. No build step, no framework, no backend — just open it with any static file server.

---

## ✨ The six levels

### 🌍 Earth
![Earth](docs/earth.png)

- Photoreal Earth with atmosphere, the Moon at its true distance (60 Earth radii), and a marker ring at geostationary altitude.
- **The ISS, live.** Its real position is fetched from the [Where The ISS At?](https://wheretheiss.at/) API every 5 seconds — open its panel and watch the latitude, longitude, altitude and speed update in real time.
- **~150 real satellites, tracked live.** The brightest objects in orbit are loaded from [CelesTrak](https://celestrak.org/) TLE data and propagated in real time with the SGP4 model (via [satellite.js](https://github.com/shashwatak/satellite-js)) — the same maths ground stations use to point antennas.
- **Click any satellite dot** and it tells you *what it is* — Starlink, spent rocket stage, weather satellite, navigation satellite, space telescope, laser-ranging geodesy sphere, space debris, crewed spacecraft… — plus its NORAD catalog number, launch year, orbit class, inclination, orbital period, and live altitude/position/speed.

### ☀️ The Solar System
![Solar System](docs/solar-system.png)

- The Sun, all **8 planets**, and **9 dwarf planets / trans-Neptunian worlds** (Ceres, Pluto, Orcus, Haumea, Quaoar, Makemake, Gonggong, Eris, Sedna), all orbiting with their real orbital periods on an adjustable time-warp slider.
- **30 major moons** rendered as textured 3D worlds with hand-written profiles — Io's volcanoes, Europa's ocean, Titan's methane lakes, Mimas's Death-Star crater, Triton's backwards orbit, Charon, Dysnomia, Hiʻiaka…
- **Every catalogued moon.** All 177 moons from NASA's satellite catalog orbit their planets as clickable dots with real diameter, density, albedo and magnitude data (bundled in `data/moons.json`).
- Saturn's rings, the asteroid belt, and the Kuiper belt. Click a planet and the camera follows it around its orbit.

### 🌀 The Milky Way
![Milky Way](docs/milky-way.png)

- A 48,000-star spiral galaxy with a pulsing **"You are here"** marker on the Orion Arm and **Sagittarius A\***, our central supermassive black hole, at its heart.
- **45 notable real stars** plotted at log-compressed true distances around the Sun — Proxima Centauri, Sirius, Betelgeuse, Vega, TRAPPIST-1, Kepler-90, Tabby's Star, the real-life "Tatooine" Kepler-16, and 51 Pegasi, where the exoplanet era began.
- **Every confirmed exoplanet — all 6,298 of them.** The complete NASA Exoplanet Archive is bundled (`data/exoplanets.json`) and plotted in each planet's *true direction* from the Sun (you can literally see the Kepler telescope's survey cone in the cloud). Click any green dot for that planet's distance, radius, mass, year length, and discovery method.

### 🌌 The Local Group
![Local Group](docs/local-group.png)

Ten real neighbouring galaxies positioned in 3D — Andromeda (on its collision course with us), Triangulum, both Magellanic Clouds, the Sagittarius Dwarf being eaten alive by the Milky Way, and more.

### 🕸 The Observable Universe
![Observable Universe](docs/observable-universe.png)

- A procedural **cosmic web** of ~30,000 galaxies strung along filaments and clusters, the way matter is actually arranged at the largest scales.
- Nine clickable real landmarks: the Laniakea Supercluster, the Virgo and Coma Clusters, the Great Attractor, the Boötes Void, the Sloan Great Wall, the Hercules–Corona Borealis Great Wall (the largest known structure), and JADES-GS-z14-0, the most distant galaxy ever confirmed.
- The whole scene is enclosed by the **Cosmic Microwave Background** — the oldest light in existence, marking the absolute edge of what any telescope can ever see.

### 🫧 The Multiverse
![Multiverse](docs/multiverse.png)

Scroll past the edge of the observable universe and the map keeps going — into the hypothetical. An explainer panel walks through the serious (but unproven) science of the multiverse: Tegmark's four levels, eternal inflation and bubble universes, the Many-Worlds interpretation, the string landscape, cyclic cosmologies, and the honest question of whether we could ever know. Each bubble universe floating around you teaches one theory when clicked.

### 📰 Space News
![Space News](docs/space-news.png)

A live news drawer fed by the [Spaceflight News API](https://www.spaceflightnewsapi.net/) — the latest launches, discoveries and mission updates, with filter chips for **SpaceX**, **NASA**, **Discoveries** and **Webb**. Auto-refreshes every 10 minutes while open.

---

## 🚀 Running it

It's a static site, but it must be served over HTTP (ES modules + bundled JSON data don't work from `file://`):

```bash
git clone https://github.com/coopermitchell007-pixel/Universe-Map.git
cd Universe-Map
python3 -m http.server 8765
# open http://localhost:8765
```

Any static server works (`npx serve`, nginx, GitHub Pages…). An internet connection enables the live extras (ISS position, satellite TLEs, news feed, photo textures); without one, the app still runs — satellites fall back to clearly-labelled simulated orbits and procedural textures are used.

## 🎮 Controls

| Action | Effect |
|---|---|
| **Scroll** | Zoom in / out |
| **Keep scrolling at the edge of a level** | Travel to the next / previous scale |
| **Drag** | Rotate the view |
| **Click anything** | Open its info panel (planets are then followed by the camera) |
| **Hover** | Tooltip with the object's name |
| **Breadcrumb buttons (top)** | Jump straight to any scale |
| **`+` / `−` buttons** | Zoom (works across levels, handy on trackpads) |
| **Slider (Solar System)** | Orbit time-warp, 0–60 days per second |
| **Esc** | Close panels / release camera focus |
| **Double-click empty space** | Reset camera target |

## 🛠 How it's built

```
index.html          UI shell, import map (Three.js from CDN), satellite.js
css/style.css       All styling — glassy HUD panels, news drawer, tooltips
js/app.js           Scene, the six levels, picking/focus, live data, news
js/data.js          Hand-written astronomical profiles: planets, 30 moons,
                    dwarf planets, 45 stars, galaxies, universe landmarks,
                    multiverse theories, satellite classifier
js/textures.js      Procedural canvas textures (planets, sun, rings, CMB,
                    labels) + spiral/blob galaxy point-cloud generators
data/moons.json     All 177 catalogued moons (NASA data)
data/exoplanets.json  All 6,298 confirmed exoplanets (NASA Exoplanet Archive)
docs/               Screenshots
```

**Design notes**

- The universe spans 26 orders of magnitude — far beyond floating-point precision — so the map uses **six discrete scale levels**, each with its own units (637 km/unit at Earth, ~1.1 billion light-years/unit at the universe level). Crossing a level boundary fades through black and swaps scenes; a live scale bar always shows the current field of view.
- All planet/moon surfaces are **procedurally generated on canvas** (banded gas giants, cratered ice moons, Pluto's heart) so the app needs zero image assets; Earth and the Moon upgrade to photo textures from a CDN when online.
- Picking uses a raycaster whose point-cloud click tolerance **scales with camera distance**, with priority given to small named markers (satellites, stars, exoplanets) over the background clouds they sit inside.
- Satellite identity (launch year, NORAD ID, inclination, period) is parsed directly from the raw TLE fields, and a name-pattern classifier sorts objects into 16 human-readable categories.

## 📡 Data sources & credits

| Data | Source |
|---|---|
| ISS live position | [Where The ISS At?](https://wheretheiss.at/) API |
| Satellite orbits (TLEs) | [CelesTrak](https://celestrak.org/) · propagated with [satellite.js](https://github.com/shashwatak/satellite-js) (SGP4) |
| Exoplanets (6,298) | [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) (`pscomppars` table) |
| Moon catalog (177) | NASA planetary satellite data via [devstronomy](https://github.com/devstronomy/nasa-data-scraper) |
| Space news | [Spaceflight News API](https://www.spaceflightnewsapi.net/) |
| Earth / Moon photo textures | [three.js examples](https://github.com/mrdoob/three.js) |
| 3D engine | [Three.js](https://threejs.org/) |
| Astronomical facts | NASA, ESA, IAU public data — distances, masses and dates as published |

*Stylised for visibility: orbital distances within levels are compressed (a true-scale solar system would be a screen of empty black), star/exoplanet distances are log-compressed, and the cosmic web is procedural — but every number in every info panel is real.*

---

*Built with [Claude Code](https://claude.com/claude-code).*

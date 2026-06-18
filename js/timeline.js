// ============================================================
// Cosmic timeline — scrub through the entire history and
// future of the universe, from the Big Bang to heat death.
// ============================================================

const EVENTS = [
  { t: 'T = 0', name: 'The Big Bang', desc: 'Space, time, matter and energy come into existence. The entire observable universe is compressed into a region smaller than an atom. There is no "before" — time itself begins here.' },
  { t: '10⁻³² seconds', name: 'Cosmic inflation', desc: 'Space expands by a factor of at least 10²⁶ in a fraction of a second — faster than light (space itself can do that). Quantum jitters get stretched to cosmic size; they will become every galaxy on the map.' },
  { t: '3 minutes', name: 'The first atomic nuclei', desc: 'The universe cools enough for protons and neutrons to fuse: hydrogen, helium and a trace of lithium form in the first three minutes. Three-quarters of all normal matter is still that original hydrogen.' },
  { t: '380,000 years', name: 'First light — the CMB', desc: 'The fog of plasma clears; light can finally travel freely. That first flash still fills the sky today as the Cosmic Microwave Background — the glowing shell at the edge of the Observable Universe level.' },
  { t: '100 million years', name: 'The first stars ignite', desc: 'Gravity wins. The first stars — giants hundreds of times the Sun\'s mass — ignite and end the cosmic dark ages, forging the first heavy elements and dying as the first supernovae and black holes.' },
  { t: '290 million years', name: 'Earliest galaxy we have seen', desc: 'JADES-GS-z14-0 (on the Observable Universe level) shines. Its light is reaching the James Webb telescope right now, 13.5 billion years later.' },
  { t: '1 billion years', name: 'Galaxies assemble', desc: 'Small clumps of stars merge into true galaxies. The young Milky Way begins forming — some of its oldest stars still survive in the galactic halo today.' },
  { t: '9.2 billion years', name: 'The Sun is born', desc: 'In a quiet corner of the Orion Arm, a cloud of gas — enriched by generations of dead stars — collapses. The Sun ignites; the leftover disc becomes the planets. Every atom of Earth was already ancient.' },
  { t: '10 billion years', name: 'Life on Earth begins', desc: 'Within a few hundred million years of Earth cooling, single-celled life appears in the oceans. It will be another ~3 billion years before anything has more than one cell.' },
  { t: '13.8 billion years', name: 'NOW', desc: 'You are here — a creature made of recycled supernova debris, using a glowing rectangle to scroll through the entire history of the universe. The universe is young: ~95% of the stars that will ever exist have already been born, but the cosmos has barely started.' },
  { t: '+4.5 billion years', name: 'Milky Way ⇄ Andromeda collision', desc: 'Our galaxy and Andromeda merge into one giant elliptical ("Milkdromeda"). Almost no individual stars actually collide — galaxies are mostly empty — but both spiral structures are destroyed. The night sky becomes spectacular.' },
  { t: '+5 billion years', name: 'Death of the Sun', desc: 'The Sun swells into a red giant, swallowing Mercury and Venus and scorching Earth, then sheds its outer layers into a planetary nebula (like the Ring Nebula on the galaxy level) and fades as a white dwarf.' },
  { t: '+100 billion years', name: 'The sky empties', desc: 'Dark energy has pushed every galaxy beyond the Local Group over the cosmic horizon. Astronomers born in this era will see one island of stars in an apparently infinite black void — and have no way to discover the Big Bang.' },
  { t: '+100 trillion years', name: 'The last star burns out', desc: 'Star formation ended long ago. The final red dwarfs — the thriftiest stars, sipping fuel for trillions of years — finally gutter out. The Stelliferous Era is over; the universe goes dark forever.' },
  { t: '+10³⁴ years', name: 'Matter itself decays (perhaps)', desc: 'If protons are unstable, as many theories predict, atoms themselves dissolve. Planets, dead stars, monuments — everything made of matter evaporates into radiation and stray particles.' },
  { t: '+10⁶⁷ years', name: 'Black holes evaporate', desc: 'Stellar black holes finish leaking away by Hawking radiation, each ending in a final flash. The supermassive ones — like Sagittarius A* — hold out until ~10¹⁰⁰ years.' },
  { t: '+10¹⁰⁰ years', name: 'Heat death', desc: 'Maximum entropy. No gradients, no energy flows, no events. Time becomes meaningless because nothing changes. Unless, of course, a new quantum fluctuation — or a cyclic bounce — starts it all again.' },
];

export function initTimeline({ panel, slider, card, btn, closeBtn }) {
  function show(i) {
    const ev = EVENTS[i];
    card.innerHTML = `<div class="tl-time">${ev.t}</div><h3>${ev.name}</h3><p>${ev.desc}</p>
      <div class="tl-count">${i + 1} / ${EVENTS.length}</div>`;
  }
  slider.max = EVENTS.length - 1;
  slider.addEventListener('input', () => show(parseInt(slider.value, 10)));
  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      slider.value = 9; // start at NOW
      show(9);
    }
  });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  return { close: () => panel.classList.remove('open') };
}

// ============================================================
// Daily space videos — a curated, verified collection that
// rotates daily. Two playlists: Cosmos & Engineering/Tech.
// Embeds are "lite": thumbnail first, iframe only on click.
// ============================================================

const COSMOS = [
  { id: '0fKBhvDjuy0', t: 'Powers of Ten™ (1977)', ch: 'Eames Office' },
  { id: 'uD4izuDMUQA', t: 'TIMELAPSE OF THE FUTURE: A Journey to the End of Time', ch: 'melodysheep' },
  { id: 'SUelbSa-OkA', t: 'LIFE BEYOND: Alien life, deep time & our place in cosmic history', ch: 'melodysheep' },
  { id: 'YH3c1QZzRK4', t: 'Wanderers — a short film by Erik Wernquist', ch: 'Erik Wernquist' },
  { id: 'sNhhvQGsMEc', t: 'The Fermi Paradox — Where Are All The Aliens? (1/2)', ch: 'Kurzgesagt' },
  { id: '1fQkVqno-uI', t: 'The Fermi Paradox II — Solutions and Ideas', ch: 'Kurzgesagt' },
  { id: 'UjtOGPJ0URM', t: 'Why Alien Life Would be our Doom — The Great Filter', ch: 'Kurzgesagt' },
  { id: 'e-P5IFTqB98', t: 'Black Holes Explained — From Birth to Death', ch: 'Kurzgesagt' },
  { id: 'udFxKZRyQt4', t: 'Neutron Stars — The Most Extreme Things that are not Black Holes', ch: 'Kurzgesagt' },
  { id: 'p_8yK2kmxoo', t: 'The Most Dangerous Stuff in the Universe — Strange Stars', ch: 'Kurzgesagt' },
  { id: 'RLykC1VN7NY', t: 'Death From Space — Gamma-Ray Bursts Explained', ch: 'Kurzgesagt' },
  { id: '9P6rdqiybaw', t: 'Wormholes Explained — Breaking Spacetime', ch: 'Kurzgesagt' },
  { id: 'IXxZRZxafEQ', t: 'What Is Light?', ch: 'Kurzgesagt' },
  { id: '5TbUxGZtwGI', t: 'Time: The History & Future of Everything', ch: 'Kurzgesagt' },
  { id: 'zUyH3XhpLTo', t: 'How to Understand What Black Holes Look Like', ch: 'Veritasium' },
  { id: 'pTn6Ewhb27k', t: 'Why No One Has Measured The Speed Of Light', ch: 'Veritasium' },
  { id: 'SumDHcnCRuU', t: "You Think Venus Is Closest to Earth. You're Wrong.", ch: 'CGP Grey' },
  { id: 'MK5E_7hOi-k', t: 'How big is the Solar System?', ch: 'Jared Owen' },
  { id: 'nr5Pj6GQL2o', t: 'Tour of the Moon in 4K', ch: 'NASA Goddard' },
  { id: 'udAL48P5NJU', t: 'Gigapixels of Andromeda [4K]', ch: 'daveachuk' },
  { id: 'HdPzOWlLrbE', t: 'Origins of the Universe 101', ch: 'National Geographic' },
  { id: 'Uj3_KqkI9Zo', t: 'The Infinite Hotel Paradox', ch: 'TED-Ed' },
  { id: '4czjS9h4Fpg', t: "Perseverance Rover's Descent and Touchdown on Mars", ch: 'NASA' },
  { id: 'DKtVpvzUF1Y', t: 'Apollo 11 Saturn V Launch Camera E-8 (slow motion)', ch: 'Mark Gray' },
];

const TECH = [
  { id: 'A0FZIwabctw', t: 'Falcon Heavy & Starman', ch: 'SpaceX' },
  { id: 'bvim4rsNHkQ', t: 'How Not to Land an Orbital Rocket Booster', ch: 'SpaceX' },
  { id: 'H7Uyfqi_TE8', t: 'Making Humans a Multiplanetary Species', ch: 'SpaceX' },
  { id: 'cIQ36Kt7UVg', t: 'A conversation with Elon Musk about Starship', ch: 'Everyday Astronaut' },
  { id: '4P8fKd0IVOs', t: 'How Does The James Webb Space Telescope Work?', ch: 'SmarterEveryDay' },
  { id: '7nT7JGZMbtM', t: 'James Webb Space Telescope Launch — Official NASA Broadcast', ch: 'NASA' },
  { id: 'mr9kK0_7x08', t: 'Tesla Factory Tour with Elon Musk!', ch: 'Marques Brownlee' },
  { id: 'ODSJsviD_SU', t: 'Tesla AI Day 2022', ch: 'Tesla' },
  { id: 'rsCul1sp4hQ', t: 'Monkey MindPong', ch: 'Neuralink' },
  { id: 'aircAruvnKk', t: 'But what is a neural network?', ch: '3Blue1Brown' },
  { id: 'mZsaaturR6E', t: 'Fusion Power Explained — Future or Failure', ch: 'Kurzgesagt' },
  { id: 'qPQQwqGWktE', t: 'Space Elevator — Science Fiction or the Future of Mankind?', ch: 'Kurzgesagt' },
  { id: 'pP44EPBMb8A', t: 'How to Build a Dyson Sphere — The Ultimate Megastructure', ch: 'Kurzgesagt' },
  { id: 'v3y8AIEX_dU', t: 'How to Move the Sun: Stellar Engines', ch: 'Kurzgesagt' },
  { id: 'y8XvQNt26KI', t: 'Unlimited Resources From Space — Asteroid Mining', ch: 'Kurzgesagt' },
  { id: 'NtQkz0aRDe8', t: 'How We Could Build a Moon Base TODAY', ch: 'Kurzgesagt' },
  { id: 'G-WO-z-QuWI', t: 'How To Terraform Venus (Quickly)', ch: 'Kurzgesagt' },
  { id: 't9c7aheZxls', t: "Your kids might live on Mars. Here's how they'll survive", ch: 'TED' },
  { id: 'kz165f1g8-E', t: 'The Genius of 3D Printed Rockets', ch: 'Veritasium' },
  { id: 'BYVZh5kqaFg', t: 'Egg Drop From Space', ch: 'Mark Rober' },
];

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initVideos({ drawer, listEl, openDrawer }) {
  let playlist = 'cosmos';

  function card(v) {
    const el = document.createElement('div');
    el.className = 'video-card';
    el.innerHTML = `
      <div class="video-thumb" data-id="${esc(v.id)}">
        <img loading="lazy" src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="">
        <span class="video-play">▶</span>
      </div>
      <div class="video-body"><h3>${esc(v.t)}</h3><div class="video-meta">${esc(v.ch)}</div></div>`;
    el.querySelector('.video-thumb').addEventListener('click', e => {
      const th = e.currentTarget;
      th.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}?autoplay=1&rel=0"
        title="${esc(v.t)}" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
    return el;
  }

  function render() {
    const list = playlist === 'cosmos' ? COSMOS : TECH;
    const day = Math.floor(Date.now() / 86400000);
    const N = 6, start = (day * N) % list.length;
    const todays = [];
    for (let i = 0; i < N; i++) todays.push(list[(start + i) % list.length]);
    const rest = list.filter(v => !todays.includes(v));

    listEl.innerHTML = '';
    const h1 = document.createElement('div');
    h1.className = 'videos-section';
    h1.textContent = "⭐ Today's picks — a new set every day";
    listEl.appendChild(h1);
    todays.forEach(v => listEl.appendChild(card(v)));
    const h2 = document.createElement('div');
    h2.className = 'videos-section';
    h2.textContent = 'Full collection';
    listEl.appendChild(h2);
    rest.forEach(v => listEl.appendChild(card(v)));
  }

  drawer.querySelectorAll('#videos-chips .chip').forEach(ch => {
    ch.addEventListener('click', () => {
      drawer.querySelectorAll('#videos-chips .chip').forEach(c => c.classList.remove('active'));
      ch.classList.add('active');
      playlist = ch.dataset.list;
      render();
    });
  });

  return {
    open(list) {
      if (list && list !== playlist) {
        playlist = list;
        drawer.querySelectorAll('#videos-chips .chip').forEach(c =>
          c.classList.toggle('active', c.dataset.list === list));
      }
      render();
      openDrawer(drawer);
    },
    stopAll() { listEl.querySelectorAll('iframe').forEach(f => f.remove()); render(); },
  };
}

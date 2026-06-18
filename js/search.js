// ============================================================
// Universal search — every named object on the map is indexed
// (planets, moons, stars, exoplanets, satellites, galaxies,
// probes, nebulae…). Typing filters; selecting flies you there.
// ============================================================

const LEVEL_BADGES = ['Earth', 'Solar System', 'Milky Way', 'Local Group', 'Universe'];

export function initSearch({ input, resultsEl, navigate }) {
  const index = [];
  let items = [], sel = -1;

  function add(entry) { index.push(entry); }

  function close() { resultsEl.classList.remove('open'); resultsEl.innerHTML = ''; sel = -1; items = []; }

  function run() {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { close(); return; }
    const starts = [], contains = [];
    for (const e of index) {
      const n = e.name.toLowerCase();
      if (n.startsWith(q)) starts.push(e);
      else if (n.includes(q) || (e.sub && e.sub.toLowerCase().includes(q))) contains.push(e);
      if (starts.length > 14) break;
    }
    items = [...starts, ...contains].slice(0, 14);
    sel = items.length ? 0 : -1;
    render();
  }

  function render() {
    if (!items.length) {
      resultsEl.innerHTML = '<div class="search-empty">Nothing found — try a planet, star or satellite name</div>';
      resultsEl.classList.add('open');
      return;
    }
    resultsEl.innerHTML = '';
    items.forEach((e, i) => {
      const el = document.createElement('button');
      el.className = 'search-item' + (i === sel ? ' sel' : '');
      el.innerHTML = `<span class="search-name">${e.name}</span>
        <span class="search-sub">${e.sub || ''}</span>
        <span class="search-badge">${e.badge || LEVEL_BADGES[e.level] || ''}</span>`;
      el.addEventListener('click', () => choose(e));
      resultsEl.appendChild(el);
    });
    resultsEl.classList.add('open');
  }

  function choose(e) {
    close();
    input.blur();
    input.value = e.name;
    navigate(e);
  }

  input.addEventListener('input', run);
  input.addEventListener('focus', run);
  input.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); render(); ev.preventDefault(); }
    else if (ev.key === 'ArrowUp') { sel = Math.max(0, sel - 1); render(); ev.preventDefault(); }
    else if (ev.key === 'Enter' && sel >= 0 && items[sel]) choose(items[sel]);
    else if (ev.key === 'Escape') { close(); input.blur(); }
  });
  document.addEventListener('pointerdown', ev => {
    if (!resultsEl.contains(ev.target) && ev.target !== input) close();
  });

  return {
    add,
    findExact(name) {
      const n = name.toLowerCase();
      return index.find(e => e.name.toLowerCase() === n) || null;
    },
    random() {
      const flyable = index.filter(e => e.getWorldPos);
      return flyable.length ? flyable[Math.floor(Math.random() * flyable.length)] : null;
    },
    size: () => index.length,
  };
}

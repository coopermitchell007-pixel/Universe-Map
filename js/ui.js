// ============================================================
// Settings, help, FPS meter, "clean view" and bookmarks.
// A small control centre for the map's many toggles.
// ============================================================

const CONTROLS = [
  ['Navigation', [
    ['Scroll', 'Zoom — keep scrolling at the edge to change scale'],
    ['Drag', 'Rotate the view'],
    ['Click', 'Open an object\'s info panel'],
    ['Double-click empty space', 'Recentre the camera'],
    ['1 – 6', 'Jump to a scale (Earth → Multiverse)'],
    ['Type in search', 'Find & fly to 6,500+ named objects'],
  ]],
  ['Flight mode', [
    ['Mouse', 'Steer (pitch + yaw)'],
    ['W / S', 'Throttle up / down'],
    ['A / D', 'Roll left / right'],
    ['Q / E', 'Strafe left / right'],
    ['R / F', 'Strafe up / down'],
    ['Shift / Space', 'Afterburner (burns fuel)'],
    ['X', 'Cut engines / full brake'],
    ['Z', 'Toggle inertial dampeners'],
    ['Tab', 'Lock onto nearest object'],
    ['G', 'Autopilot to locked target'],
    ['Esc', 'Leave the cockpit'],
  ]],
  ['Shortcuts', [
    ['H', 'Hide / show the interface (clean view)'],
    ['?', 'This help'],
    ['F', 'Toggle fullscreen'],
    ['P', 'Save a postcard'],
    ['M', 'Toggle ambient sound'],
    ['Esc', 'Close panels / leave modes'],
  ]],
];

export function initUI(ctx) {
  const { postfx, getView, setView, startTour, showToast, onAutoSpin, onRandom } = ctx;
  const $ = id => document.getElementById(id);
  const settings = $('settings'), help = $('help-overlay'), fps = $('fps');

  // ---------- settings panel ----------
  settings.innerHTML = `
    <div class="drawer-head"><h2>Settings</h2><button class="drawer-close" id="set-close">×</button></div>
    <div class="set-body">
      <div class="set-group">
        <div class="set-title">Cinematic</div>
        <label class="set-row"><span>Bloom / glow</span><input type="checkbox" id="set-bloom" checked></label>
        <label class="set-row"><span>Glow strength</span><input type="range" id="set-bloomstr" min="0" max="1.4" step="0.05" value="0.62"></label>
      </div>
      <div class="set-group">
        <div class="set-title">Interface</div>
        <label class="set-row"><span>FPS meter</span><input type="checkbox" id="set-fps"></label>
        <label class="set-row"><span>Clean view (hide UI)</span><input type="checkbox" id="set-clean"></label>
        <label class="set-row"><span>Cinematic auto-spin</span><input type="checkbox" id="set-spin"></label>
        <button class="set-btn" id="set-help">⌨ Controls &amp; help</button>
        <button class="set-btn" id="set-tour">🎞 Guided cinematic tour</button>
        <button class="set-btn" id="set-random">🎲 Surprise me — fly somewhere</button>
        <button class="set-btn" id="set-full">⛶ Toggle fullscreen</button>
      </div>
      <div class="set-group">
        <div class="set-title">Bookmarks</div>
        <button class="set-btn" id="set-savebm">★ Save this view</button>
        <div id="set-bmlist"></div>
      </div>
      <div class="set-foot">Universe Map · press <b>?</b> any time for controls</div>
    </div>`;

  function openSettings() { settings.classList.add('open'); renderBookmarks(); }
  function closeSettings() { settings.classList.remove('open'); }
  $('settings-btn').addEventListener('click', () => settings.classList.contains('open') ? closeSettings() : openSettings());
  $('set-close').addEventListener('click', closeSettings);

  // cinematic
  const bloomBox = $('set-bloom'), bloomStr = $('set-bloomstr');
  bloomBox.checked = postfx.available();
  bloomBox.disabled = !postfx.available();
  bloomBox.addEventListener('change', () => postfx.setEnabled(bloomBox.checked));
  bloomStr.addEventListener('input', () => postfx.setStrength(parseFloat(bloomStr.value)));

  // fps
  let fpsOn = false, frames = 0, fpsLast = performance.now();
  $('set-fps').addEventListener('change', e => { fpsOn = e.target.checked; fps.classList.toggle('on', fpsOn); });
  function tickFPS() {
    requestAnimationFrame(tickFPS);
    frames++;
    const now = performance.now();
    if (now - fpsLast >= 500) {
      if (fpsOn) fps.textContent = Math.round(frames * 1000 / (now - fpsLast)) + ' FPS';
      frames = 0; fpsLast = now;
    }
  }
  tickFPS();

  // clean view
  const cleanBox = $('set-clean');
  function setClean(on) { document.body.classList.toggle('clean', on); cleanBox.checked = on; }
  cleanBox.addEventListener('change', e => setClean(e.target.checked));

  // fullscreen
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }
  $('set-full').addEventListener('click', toggleFullscreen);

  // help overlay
  help.innerHTML = `<div id="help-box">
    <button id="help-close">×</button>
    <h2>Controls</h2>
    <div id="help-cols">${CONTROLS.map(([sec, rows]) => `
      <div class="help-col"><h3>${sec}</h3>${rows.map(([k, v]) =>
        `<div class="help-row"><kbd>${k}</kbd><span>${v}</span></div>`).join('')}</div>`).join('')}
    </div></div>`;
  function openHelp() { help.classList.add('on'); }
  function closeHelp() { help.classList.remove('on'); }
  $('help-close').addEventListener('click', closeHelp);
  $('set-help').addEventListener('click', () => { closeSettings(); openHelp(); });
  help.addEventListener('click', e => { if (e.target === help) closeHelp(); });

  // tour / random / auto-spin
  $('set-tour').addEventListener('click', () => { closeSettings(); startTour(); });
  $('tour-btn')?.addEventListener('click', startTour);
  $('set-spin').addEventListener('change', e => onAutoSpin && onAutoSpin(e.target.checked));
  $('set-random').addEventListener('click', () => { closeSettings(); onRandom && onRandom(); });

  // ---------- bookmarks ----------
  const KEY = 'umap-bookmarks';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = list => localStorage.setItem(KEY, JSON.stringify(list));
  function renderBookmarks() {
    const list = load(), box = $('set-bmlist');
    box.innerHTML = list.length ? '' : '<div class="set-empty">No saved views yet.</div>';
    list.forEach((bm, i) => {
      const row = document.createElement('div');
      row.className = 'bm-row';
      row.innerHTML = `<button class="bm-go">${bm.name}</button><button class="bm-del" title="Delete">×</button>`;
      row.querySelector('.bm-go').addEventListener('click', () => { setView(bm.view); closeSettings(); });
      row.querySelector('.bm-del').addEventListener('click', () => { const l = load(); l.splice(i, 1); save(l); renderBookmarks(); });
      box.appendChild(row);
    });
  }
  $('set-savebm').addEventListener('click', () => {
    const view = getView();
    const name = (prompt('Name this view:', view.label || 'My view') || '').trim();
    if (!name) return;
    const list = load(); list.push({ name, view }); save(list);
    renderBookmarks();
    showToast('★ View bookmarked', name);
  });

  // ---------- global keys ----------
  window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (document.body.classList.contains('flight')) return; // flight owns the keyboard
    if (e.key === '?') { help.classList.contains('on') ? closeHelp() : openHelp(); }
    else if (e.code === 'KeyH') setClean(!document.body.classList.contains('clean'));
    else if (e.code === 'KeyF') toggleFullscreen();
    else if (e.key === 'Escape') { closeHelp(); closeSettings(); }
  });

  return { openSettings, openHelp, setClean };
}

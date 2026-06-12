// ============================================================
// Space postcard — capture the current view, stamp it with the
// object name / scale / date, and download as a PNG.
// ============================================================

export function initPostcard({ btn, renderer, scene, camera, getCaption, showToast }) {
  btn.addEventListener('click', () => {
    // re-render right before reading pixels (no preserveDrawingBuffer needed)
    renderer.render(scene, camera);
    const src = renderer.domElement;
    const W = 1600, H = Math.round(W * src.height / src.width);
    const c = document.createElement('canvas');
    c.width = W; c.height = H + 150;
    const g = c.getContext('2d');
    g.fillStyle = '#01020a';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(src, 0, 0, W, H);

    // caption strip
    const grad = g.createLinearGradient(0, H - 160, 0, H + 150);
    grad.addColorStop(0, 'rgba(1,2,10,0)');
    grad.addColorStop(0.45, 'rgba(1,2,10,0.92)');
    grad.addColorStop(1, 'rgba(1,2,10,1)');
    g.fillStyle = grad;
    g.fillRect(0, H - 160, W, 310);

    const { title, sub } = getCaption();
    g.fillStyle = '#ffffff';
    g.font = '600 54px "Helvetica Neue", Helvetica, Arial, sans-serif';
    g.fillText(title, 56, H + 22);
    g.fillStyle = '#9fc2ff';
    g.font = '26px "Helvetica Neue", Helvetica, Arial, sans-serif';
    g.fillText(sub, 56, H + 64);
    g.fillStyle = '#6e80a4';
    g.font = '22px "Helvetica Neue", Helvetica, Arial, sans-serif';
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    g.fillText(date, 56, H + 104);
    g.textAlign = 'right';
    g.fillStyle = '#cfe0ff';
    g.font = '600 28px "Helvetica Neue", Helvetica, Arial, sans-serif';
    g.fillText('U N I V E R S E   M A P', W - 56, H + 70);
    g.textAlign = 'left';

    const a = document.createElement('a');
    a.download = 'universe-postcard-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '.png';
    a.href = c.toDataURL('image/png');
    a.click();
    showToast('Postcard saved', title + ' — check your downloads');
  });
}

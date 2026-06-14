// ============================================================
// Cinematic post-processing — UnrealBloom for glowing stars,
// nebulae and engine trails.
//
// The bloom passes live in three's /addons, which are an extra
// network fetch from the CDN. We load them *lazily* (dynamic
// import) AFTER the app is already running, so a slow or blocked
// CDN can never stop the universe from booting — it just means
// you get the plain (still perfectly good) render instead.
// ============================================================
import * as THREE from 'three';

export function initPostFX({ renderer, scene, camera }) {
  let composer = null, bloom = null, enabled = true, ready = false;
  let pendingStrength = 0.62;

  (async () => {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'),
        import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js'),
        import('three/addons/postprocessing/OutputPass.js'),
      ]);
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        pendingStrength, 0.55, 0.62);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
      composer.setSize(window.innerWidth, window.innerHeight);
      ready = true;
    } catch (e) {
      console.warn('Post-processing unavailable, using direct render:', e);
      composer = null;
    }
  })();

  return {
    render() { if (enabled && ready && composer) composer.render(); else renderer.render(scene, camera); },
    setSize(w, h) { if (composer) composer.setSize(w, h); },
    setEnabled(v) { enabled = v; },
    available: () => ready && !!composer,
    isOn: () => enabled && ready && !!composer,
    setStrength(v) { pendingStrength = v; if (bloom) bloom.strength = v; },
  };
}

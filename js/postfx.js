// ============================================================
// Cinematic post-processing — UnrealBloom for glowing stars,
// nebulae and engine trails, with a graceful fallback to plain
// rendering if the addon passes are unavailable. Strength is
// adjustable from the settings panel; quality "Low" turns it off.
// ============================================================
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function initPostFX({ renderer, scene, camera }) {
  let composer = null, bloom = null, enabled = true;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.62,   // strength
      0.55,   // radius
      0.62);  // threshold — only genuinely bright things bloom
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  } catch (e) {
    console.warn('Post-processing unavailable, using direct render:', e);
    composer = null;
  }

  return {
    render() { if (enabled && composer) composer.render(); else renderer.render(scene, camera); },
    setSize(w, h) { if (composer) composer.setSize(w, h); },
    setEnabled(v) { enabled = v; },
    available: () => !!composer,
    isOn: () => enabled && !!composer,
    setStrength(v) { if (bloom) bloom.strength = v; },
  };
}

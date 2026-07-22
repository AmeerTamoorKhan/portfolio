// Loads the user's rigged, animated character GLB ("me") and drives its baked clips.
//
// The model ships three baked animation clips (Blender NLA tracks). In atk_char_3d.glb
// the durations identify the roles (mapped by duration, robust to name/order changes):
//   ~17.6s → standing / idle
//   ~2.4s  → walking (in-place — no root translation)
//   ~7.2s  → sitting
// The skeleton is a proper humanoid rig (real joint offsets), so we keep the SkinnedMesh
// and play the clips through an AnimationMixer. A wrapper group named 'me' is what the
// scene moves/turns (walk path + facing); the clips supply the limb motion in place.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CHAR_HEIGHT = 1.16; // target standing height in scene units

export async function loadCharacter(THREE, url) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const model = gltf.scene;
  model.traverse(n => { if (n.isMesh) { n.castShadow = true; n.frustumCulled = false; } });

  // wrapper groups: model is authored Y-up, facing +Z. orient carries scale/ground offset,
  // root carries the scene-driven position + facing (rotation.y).
  const orient = new THREE.Group(); orient.name = 'me_orient'; orient.add(model);
  const root = new THREE.Group(); root.name = 'me'; root.add(orient);

  // mixer + the three clips, keyed by role — matched by DURATION (robust to name/order):
  // longest ≈ idle (17.6s), shortest ≈ walk (2.4s), middle ≈ sit (7.2s).
  const mixer = new THREE.AnimationMixer(model);
  const clips = gltf.animations.slice().sort((a, b) => a.duration - b.duration);
  const walkClip = clips[0];              // shortest
  const idleClip = clips[clips.length-1]; // longest
  const sitClip  = clips[1] || clips[0];  // middle
  const actions = {
    sit:  mixer.clipAction(sitClip),
    walk: mixer.clipAction(walkClip),
    idle: mixer.clipAction(idleClip),
  };
  Object.values(actions).forEach(a => { a.enabled = true; a.setEffectiveWeight(0); a.play(); });
  actions.idle.setEffectiveWeight(1);

  // find the skinned mesh so we can measure the *animated* bounds for scale/grounding
  let sm = null; model.traverse(n => { if (n.isSkinnedMesh) sm = n; });
  // bone map for procedural pose overrides (typing)
  const bones = {}; model.traverse(n => { if (n.isBone) bones[n.name] = n; });
  const sampleBounds = () => {
    root.updateWorldMatrix(true, true);
    const p = sm.geometry.attributes.position, v = new THREE.Vector3();
    const mn = new THREE.Vector3(1e9, 1e9, 1e9), mx = new THREE.Vector3(-1e9, -1e9, -1e9);
    const step = Math.max(1, Math.floor(p.count / 1500));
    for (let i = 0; i < p.count; i += step) {
      v.fromBufferAttribute(p, i);
      if (sm.applyBoneTransform) sm.applyBoneTransform(i, v);
      sm.localToWorld(v); mn.min(v); mx.max(v);
    }
    return { mn, mx };
  };

  // pose the idle clip and normalise from it: scale to height, centre x/z, feet to y=0
  mixer.update(0.001);
  let { mn, mx } = sampleBounds();
  const s = CHAR_HEIGHT / (mx.y - mn.y);
  orient.scale.setScalar(s);
  ({ mn, mx } = sampleBounds());
  orient.position.set(
    orient.position.x - (mn.x + mx.x) / 2,
    orient.position.y - mn.y,
    orient.position.z - (mn.z + mx.z) / 2
  );

  return { root, mixer, actions, bones, model, height: CHAR_HEIGHT };
}

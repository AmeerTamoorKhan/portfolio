// Builds the maker-workshop scene as a THREE.Group of named meshes.
// The character ("me") is a rigged GLB added separately by the page module.
export function buildScene(THREE) {
  const g = new THREE.Group(); g.name = 'maker_workshop';
  const M = {}; // shared named materials
  const mat = (name, color, rough = 0.8, metal = 0.0, extra = {}) => {
    if (!M[name]) { M[name] = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }); M[name].name = name; }
    return M[name];
  };
  const cream    = () => mat('cream', 0xf6e7d7);
  const wallM    = () => mat('wall', 0xf9ecdd, 0.95);
  const floorM   = () => mat('floor', 0xf3e4d2, 0.95);
  const wood     = () => mat('wood', 0xd9a86c, 0.7);
  const woodLite = () => mat('wood_light', 0xe4bd8b, 0.7);
  const cork     = () => mat('cork', 0xd8ab72, 0.9);
  const white    = () => mat('white', 0xfdf8f2, 0.6);
  const offwhite = () => mat('offwhite', 0xf1e9df, 0.7);
  const darkG    = () => mat('dark_gray', 0x3a3d42, 0.5);
  const blackM   = () => mat('near_black', 0x1c1d20, 0.4);
  const screenM  = () => mat('screen', 0x101013, 0.25);
  const silver   = () => mat('silver', 0xc9ccd2, 0.35, 0.35);
  const grayM    = () => mat('mid_gray', 0x8d9096, 0.5, 0.2);
  const green    = () => mat('leaf_green', 0x5cb54a, 0.7);
  const matGreen = () => mat('mat_green', 0x2e9e6b, 0.85);
  const blue     = () => mat('blue', 0x3d78d8, 0.6);
  const orange   = () => mat('orange', 0xef8f2e, 0.75);
  const yellow   = () => mat('yellow', 0xf2b23a, 0.7);
  const rugO     = () => mat('rug_orange', 0xf0a23c, 0.95);
  const rugY     = () => mat('rug_yellow', 0xf6c86e, 0.95);
  const red      = () => mat('red', 0xd8452e, 0.6);
  const terracotta = () => mat('terracotta', 0xc98d64, 0.85);
  const glow     = () => mat('lamp_glow', 0xfff2c8, 0.5, 0, { emissive: 0xffe9a8, emissiveIntensity: 1.2 });
  const clear    = () => mat('clear_plastic', 0xdfe6ea, 0.25, 0, { transparent: true, opacity: 0.45 });

  const box = (name, m, w, h, d, x, y, z, ry = 0) => {
    const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    me.name = name; me.position.set(x, y, z); me.rotation.y = ry; g.add(me); return me;
  };
  // rounded-corner panel: vertical (w×h face, d thick) or flat slab (w×d footprint, h thick)
  const rbox = (name, m, w, h, d, x, y, z, r = 0.03, flat = false) => {
    const W = w, H = flat ? d : h, depth = flat ? h : d;
    const s = new THREE.Shape();
    const hw = W / 2, hh = H / 2;
    s.moveTo(-hw + r, -hh); s.lineTo(hw - r, -hh); s.quadraticCurveTo(hw, -hh, hw, -hh + r);
    s.lineTo(hw, hh - r); s.quadraticCurveTo(hw, hh, hw - r, hh);
    s.lineTo(-hw + r, hh); s.quadraticCurveTo(-hw, hh, -hw, hh - r);
    s.lineTo(-hw, -hh + r); s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 8 });
    geo.translate(0, 0, -depth / 2);
    const me = new THREE.Mesh(geo, m); me.name = name; me.position.set(x, y, z);
    if (flat) me.rotation.x = -Math.PI / 2;
    g.add(me); return me;
  };
  const cyl = (name, m, rt, rb, h, x, y, z, seg = 32) => {
    const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    me.name = name; me.position.set(x, y, z); g.add(me); return me;
  };
  const sph = (name, m, r, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const me = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m);
    me.name = name; me.position.set(x, y, z); me.scale.set(sx, sy, sz); g.add(me); return me;
  };
  // cylinder connecting two explicit points — for arms/tubes that must join up
  const tube = (name, m, r, p0, p1, seg = 14) => {
    const a = new THREE.Vector3(...p0), b = new THREE.Vector3(...p1);
    const dir = new THREE.Vector3().subVectors(b, a);
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), seg), m);
    me.name = name;
    me.position.copy(a).add(b).multiplyScalar(0.5);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    g.add(me); return me;
  };

  // ---- room shell removed (object-only scene) ----

  // ---- rug (stacked rounded look via inset layers) ----
  box('rug_outer', rugO(), 2.5, 0.015, 1.15, -0.35, 0.012, 1.35);
  box('rug_mid', rugY(), 2.15, 0.012, 0.85, -0.35, 0.024, 1.35);
  box('rug_inner', rugO(), 1.8, 0.012, 0.58, -0.35, 0.032, 1.35);
  box('rug_core', rugY(), 1.45, 0.012, 0.34, -0.35, 0.04, 1.35);

  // ---- desks: three tops, wooden legs ----
  const deskY = 0.74, topT = 0.045, depth = 0.62;
  [-1.4, 0, 1.4].forEach((x, i) => {
    rbox(`desk_top_${i + 1}`, cream(), 1.42, topT, depth, x, deskY, 0, 0.045, true);
    [[-0.62, -0.22], [0.62, -0.22], [-0.62, 0.22], [0.62, 0.22]].forEach(([lx, lz], j) =>
      cyl(`desk_leg_${i + 1}_${j + 1}`, wood(), 0.028, 0.028, deskY - topT / 2, x + lx, (deskY - topT / 2) / 2, lz, 16));
  });

  // ---- drawer units ----
  const drawers = (id, x, z) => {
    box(`drawer_body_${id}`, offwhite(), 0.42, 0.58, 0.5, x, 0.29, z);
    for (let k = 0; k < 3; k++) {
      const y = 0.47 - k * 0.18;
      box(`drawer_front_${id}_${k + 1}`, white(), 0.38, 0.15, 0.02, x, y, z + 0.26);
      box(`drawer_handle_${id}_${k + 1}`, grayM(), 0.1, 0.018, 0.012, x, y + 0.04, z + 0.275);
    }
  };
  drawers('left', -1.75, 0.02); drawers('mid', -0.15, 0.06); drawers('right', 1.68, 0.1);

  // ---- swivel chair (seat revolves on its column) ----
  {
    const cx = -0.95, cz = 0.85;
    const chair = new THREE.Group(); chair.name = 'chair'; chair.position.set(cx, 0, cz); g.add(chair);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.045), grayM());
      arm.name = `chair_base_arm_${i + 1}`; arm.position.set(Math.cos(a) * 0.11, 0.048, Math.sin(a) * 0.11);
      arm.rotation.y = -a; chair.add(arm);
      const caster = new THREE.Mesh(new THREE.SphereGeometry(0.025, 14, 10), blackM());
      caster.name = `chair_caster_${i + 1}`; caster.position.set(Math.cos(a) * 0.2, 0.03, Math.sin(a) * 0.2); chair.add(caster);
    }
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.38, 16), grayM());
    col.name = 'chair_column'; col.position.y = 0.25; chair.add(col);
    const swivel = new THREE.Group(); swivel.name = 'chair_swivel'; swivel.position.y = 0.44; chair.add(swivel);
    const seat = rbox('chair_seat', white(), 0.44, 0.05, 0.42, 0, 0.02, 0, 0.06, true); swivel.add(seat);
    const back = rbox('chair_back', white(), 0.42, 0.5, 0.045, 0, 0.31, 0.21, 0.07);
    back.rotation.x = -0.08; swivel.add(back);
  }

  // ---- big floor plants ----
  const floorPlant = (id, px, pz) => {
    cyl(`floor_pot_${id}`, white(), 0.13, 0.1, 0.24, px, 0.12, pz);
    cyl(`floor_pot_band_${id}`, terracotta(), 0.132, 0.132, 0.08, px, 0.1, pz);
    const topY = 0.55;
    cyl(`floor_plant_stem_${id}`, green(), 0.012, 0.012, 0.32, px, 0.39, pz, 10);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + 0.4;
      const d = new THREE.Vector3(Math.cos(a), 0.62, Math.sin(a)).normalize();
      const l = sph(`floor_leaf_${id}_${i + 1}`, green(), 0.09, px + d.x * 0.1, topY + d.y * 0.1, pz + d.z * 0.1, 0.5, 1.5, 0.18);
      l.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    }
    sph(`floor_leaf_${id}_top`, green(), 0.09, px, topY + 0.12, pz, 0.5, 1.5, 0.18);
  };
  floorPlant('left', -2.45, 0.55);
  floorPlant('right', 2.5, 0.5);

  // ---- whiteboard with Euler's identity ----
  box('whiteboard_frame', woodLite(), 0.78, 0.6, 0.03, -1.85, 1.62, -0.44);
  {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 384;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fdfaf5'; ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = '#22345c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = "italic 800 84px Arial, Helvetica, sans-serif";
    ctx.fillText('Claude is', 256, 150);
    ctx.fillText('all you need.', 256, 244);
    ctx.strokeStyle = '#c0453a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(150, 300); ctx.lineTo(362, 300); ctx.stroke();
    const tex = new THREE.CanvasTexture(cv);
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
    m.name = 'whiteboard_face_tex';
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.52, 0.015), m);
    face.name = 'whiteboard_face'; face.position.set(-1.85, 1.62, -0.425); g.add(face);
  }

  // ---- shelves with light strips ----
  const shelf = (id, x, w) => {
    box(`shelf_${id}`, wood(), w, 0.045, 0.26, x, 1.72, -0.33);
    box(`shelf_light_${id}`, glow(), w * 0.6, 0.018, 0.05, x, 1.69, -0.28);
  };
  shelf('left', -0.85, 0.8); shelf('mid', 0.15, 1.5); shelf('right', 1.65, 1.35);
  const shelfTop = 1.72 + 0.0225;

  // small potted plant helper
  const pot = (id, x, y, z, s = 1) => {
    cyl(`pot_${id}`, white(), 0.045 * s, 0.035 * s, 0.08 * s, x, y + 0.04 * s, z, 16);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.256;
      const l = sph(`pot_${id}_leaf_${i + 1}`, green(), 0.02 * s, x + Math.cos(a) * 0.02 * s, y + 0.11 * s, z + Math.sin(a) * 0.02 * s, 0.7, 2.2, 0.7);
      l.rotation.set(Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5);
    }
  };

  // left shelf: plant + books
  pot('shelf_l', -1.15, shelfTop, -0.33);
  [[blue(), -0.98], [orange(), -0.93], [orange(), -0.88], [grayM(), -0.82]].forEach(([m, x], i) =>
    box(`book_${i + 1}`, m, 0.035, 0.22 - (i === 3 ? 0.03 : 0), 0.16, x, shelfTop + 0.1, -0.33));

  // mid shelf: plant, robot toy, rover toy, two clear bins
  pot('shelf_m', -0.5, shelfTop, -0.33);
  {
    const rx = -0.22, ry = shelfTop;
    box('robot_body', white(), 0.09, 0.1, 0.08, rx, ry + 0.09, -0.33);
    box('robot_head', white(), 0.11, 0.08, 0.09, rx, ry + 0.19, -0.33);
    box('robot_face', blackM(), 0.08, 0.045, 0.01, rx, ry + 0.19, -0.283);
    sph('robot_eye_l', white(), 0.01, rx - 0.02, ry + 0.19, -0.277);
    sph('robot_eye_r', white(), 0.01, rx + 0.02, ry + 0.19, -0.277);
    cyl('robot_antenna', blackM(), 0.004, 0.004, 0.05, rx + 0.06, ry + 0.25, -0.33, 8);
    sph('robot_antenna_tip', red(), 0.008, rx + 0.06, ry + 0.275, -0.33);
    [-1, 1].forEach((s, i) => {
      cyl(`robot_wheel_${i + 1}a`, blackM(), 0.03, 0.03, 0.02, rx - 0.05, ry + 0.03, -0.33 + s * 0.035, 20).rotation.x = Math.PI / 2;
      cyl(`robot_wheel_${i + 1}b`, blackM(), 0.03, 0.03, 0.02, rx + 0.05, ry + 0.03, -0.33 + s * 0.035, 20).rotation.x = Math.PI / 2;
    });
  }
  [[0.28, 'bin_1'], [0.55, 'bin_2']].forEach(([x, id], i) => {
    box(id, clear(), 0.2, 0.13, 0.18, x, shelfTop + 0.065, -0.33);
    box(`${id}_lid`, i ? blue() : clear(), 0.21, 0.02, 0.19, x, shelfTop + 0.135, -0.33);
  });

  // right shelf: hanging plant, oscilloscope, psu
  {
    pot('shelf_r', 1.1, shelfTop, -0.33, 1.4);
    // oscilloscope
    box('scope_body', silver(), 0.34, 0.2, 0.2, 1.62, shelfTop + 0.1, -0.33);
    box('scope_screen', screenM(), 0.18, 0.13, 0.01, 1.56, shelfTop + 0.11, -0.225);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++)
      cyl(`scope_knob_${r}_${c}`, grayM(), 0.012, 0.012, 0.012, 1.71 + c * 0.05, shelfTop + 0.16 - r * 0.05, -0.225, 12).rotation.x = Math.PI / 2;
    // power supply
    box('psu_body', silver(), 0.16, 0.17, 0.18, 2.1, shelfTop + 0.085, -0.33);
    box('psu_screen', screenM(), 0.09, 0.05, 0.01, 2.1, shelfTop + 0.12, -0.235);
    [-0.03, 0.03].forEach((dx, i) => sph(`psu_led_${i + 1}`, red(), 0.007, 2.1 + dx, shelfTop + 0.05, -0.235));
  }

  // ---- pegboards ----
  const holeM = mat('hole_brown', 0x9a6b3c, 0.95);
  const pegboard = (id, x, y, w, h) => {
    rbox(`pegboard_${id}`, cork(), w, h, 0.025, x, y, -0.435, 0.05);
    const cols = Math.floor((w - 0.12) / 0.1) + 1, rows = Math.floor((h - 0.12) / 0.1) + 1;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const hole = cyl(`peg_hole_${id}_${r}_${c}`, holeM, 0.011, 0.011, 0.006,
        x - (cols - 1) * 0.05 + c * 0.1, y - (rows - 1) * 0.05 + r * 0.1, -0.4215, 12);
      hole.rotation.x = Math.PI / 2;
    }
  };
  pegboard('mid', 0.15, 1.22, 1.35, 0.52);
  pegboard('right', 1.65, 1.17, 1.25, 0.62);

  // mid pegboard tools
  {
    // drone on mid pegboard
    const hub = sph('drone_hub', darkG(), 0.03, -0.3, 1.28, -0.415, 1, 1, 0.5);
    hub.rotation.x = Math.PI / 2;
    box('drone_body', darkG(), 0.11, 0.055, 0.035, -0.3, 1.28, -0.412);
    box('drone_camera', blackM(), 0.03, 0.02, 0.04, -0.3, 1.255, -0.41);
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * Math.PI / 2;
      const mx = -0.3 + Math.cos(a) * 0.19, my = 1.28 + Math.sin(a) * 0.19;
      const arm = cyl(`drone_arm_${i + 1}`, darkG(), 0.012, 0.012, 0.22, -0.3 + Math.cos(a) * 0.09, 1.28 + Math.sin(a) * 0.09, -0.415, 10);
      arm.rotation.z = a + Math.PI / 2;
      cyl(`drone_motor_${i + 1}`, blackM(), 0.016, 0.016, 0.03, mx, my, -0.415, 14).rotation.x = Math.PI / 2;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.006, 8, 24), darkG());
      ring.name = `drone_prop_guard_${i + 1}`; ring.position.set(mx, my, -0.405); g.add(ring);
      [0, Math.PI / 2].forEach((ba, b) => {
        const blade = box(`drone_blade_${i + 1}_${b + 1}`, grayM(), 0.1, 0.012, 0.004, mx, my, -0.405);
        blade.rotation.z = a + ba;
      });
    }
    // open-end wrenches
    [[0.0, 'wrench_1'], [0.09, 'wrench_2']].forEach(([dx, id]) => {
      cyl(`${id}_shaft`, silver(), 0.008, 0.008, 0.18, dx - 0.02, 1.22, -0.415, 10);
      [[1.325, 0.6], [1.115, Math.PI + 0.6]].forEach(([y, rot], e) => {
        const jaw = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.009, 10, 18, Math.PI * 1.45), silver());
        jaw.name = `${id}_head_${e + 1}`; jaw.position.set(dx - 0.02, y, -0.415); jaw.rotation.z = rot; g.add(jaw);
      });
    });
    // screwdrivers
    [[0.2, blue()], [0.28, red()], [0.36, orange()]].forEach(([dx, hm], i) => {
      cyl(`screwdriver_${i + 1}_handle`, hm, 0.014, 0.014, 0.09, dx, 1.31, -0.415, 12);
      cyl(`screwdriver_${i + 1}_shaft`, silver(), 0.004, 0.004, 0.14, dx, 1.2, -0.415, 8);
    });
    // pliers
    const px = 0.55;
    [-0.012, 0.012].forEach((dx, i) => {
      const hnd = cyl(`pliers_handle_${i + 1}`, blackM(), 0.008, 0.008, 0.13, px + dx * 2, 1.14, -0.415, 8);
      hnd.rotation.z = dx * 8;
      const jaw = cyl(`pliers_jaw_${i + 1}`, silver(), 0.006, 0.01, 0.08, px + dx, 1.26, -0.415, 8);
      jaw.rotation.z = -dx * 6;
    });
    sph('pliers_pivot', silver(), 0.016, px, 1.21, -0.415);
  }

  // right pegboard tools
  {
    // multimeter
    box('multimeter_body', blue(), 0.09, 0.16, 0.03, 1.18, 1.22, -0.415);
    box('multimeter_screen', screenM(), 0.06, 0.04, 0.01, 1.18, 1.27, -0.398);
    cyl('multimeter_dial', darkG(), 0.02, 0.02, 0.012, 1.18, 1.18, -0.398, 16).rotation.x = Math.PI / 2;
    const lead = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.005, 8, 20, Math.PI), red());
    lead.name = 'multimeter_lead'; lead.position.set(1.18, 1.145, -0.405); lead.rotation.z = Math.PI; g.add(lead);
    // pliers (red handles)
    [-0.01, 0.01].forEach((dx, i) => {
      tube(`r_pliers_handle_${i + 1}`, red(), 0.009, [1.4 + dx * 4, 1.11, -0.415], [1.4, 1.2, -0.415], 8);
      tube(`r_pliers_jaw_${i + 1}`, silver(), 0.006, [1.4, 1.2, -0.415], [1.4 + dx * 1.5, 1.275, -0.415], 8);
    });
    sph('r_pliers_pivot', silver(), 0.014, 1.4, 1.2, -0.415);
    // scissors
    [-1, 1].forEach((s, i) => {
      tube(`scissors_blade_${i + 1}`, silver(), 0.006, [1.56, 1.185, -0.415], [1.56 + s * 0.022, 1.275, -0.415], 8);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.006, 8, 16), red());
      ring.name = `scissors_ring_${i + 1}`; ring.position.set(1.56 + s * 0.02, 1.15, -0.415); g.add(ring);
      tube(`scissors_shank_${i + 1}`, red(), 0.005, [1.56, 1.185, -0.415], [1.56 + s * 0.02, 1.167, -0.415], 8);
    });
    sph('scissors_pivot', silver(), 0.011, 1.56, 1.185, -0.415);
    // tweezers (joined at top)
    [-1, 1].forEach((s, i) => tube(`tweezers_${i + 1}`, silver(), 0.004, [1.72, 1.275, -0.415], [1.72 + s * 0.014, 1.135, -0.415], 8));
    sph('tweezers_head', silver(), 0.008, 1.72, 1.275, -0.415);
    // spool racks
    [1.32, 1.14].forEach((y, r) => {
      box(`spool_rack_${r + 1}`, wood(), 0.38, 0.03, 0.07, 2.05, y - 0.06, -0.4);
      box(`spool_rack_${r + 1}_back`, wood(), 0.38, 0.09, 0.012, 2.05, y - 0.02, -0.425);
      [0, 1, 2].forEach(c => {
        const colors = [silver(), r ? red() : silver(), blue()];
        const sp = cyl(`spool_${r + 1}_${c + 1}`, colors[c], 0.032, 0.032, 0.035, 1.93 + c * 0.12, y, -0.395, 20);
        sp.rotation.x = Math.PI / 2;
      });
    });
  }

  // ---- LEFT DESK contents ----
  const dtop = deskY + topT / 2;
  // monitor
  box('monitor_screen', screenM(), 0.62, 0.36, 0.015, -1.35, dtop + 0.42, -0.12);
  box('monitor_bezel', darkG(), 0.66, 0.4, 0.03, -1.35, dtop + 0.42, -0.135);
  cyl('monitor_neck', darkG(), 0.02, 0.025, 0.18, -1.35, dtop + 0.13, -0.14, 12);
  box('monitor_base', darkG(), 0.26, 0.02, 0.16, -1.35, dtop + 0.02, -0.14);
  // keyboard with key grid
  box('keyboard_base', darkG(), 0.42, 0.02, 0.15, -1.38, dtop + 0.012, 0.14);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++)
    box(`key_${r}_${c}`, blackM(), 0.024, 0.008, 0.024, -1.565 + c * 0.034, dtop + 0.026, 0.09 + r * 0.034);
  sph('mouse', darkG(), 0.03, -1.05, dtop + 0.02, 0.16, 1, 0.7, 1.4);
  // speaker
  box('speaker_body', yellow(), 0.11, 0.16, 0.09, -0.82, dtop + 0.08, -0.1);
  cyl('speaker_cone', blackM(), 0.035, 0.035, 0.01, -0.82, dtop + 0.08, -0.052, 20).rotation.x = Math.PI / 2;
  // binders
  [[blue(), -1.88], [darkG(), -1.83], [blackM(), -1.78]].forEach(([m, x], i) => {
    box(`binder_${i + 1}`, m, 0.04, 0.26, 0.2, x, dtop + 0.13, -0.15);
    box(`binder_${i + 1}_label`, white(), 0.02, 0.06, 0.005, x, dtop + 0.17, -0.048);
  });
  // penguin
  sph('penguin_body', blackM(), 0.045, -2.02, dtop + 0.05, 0.17, 1, 1.25, 1);
  sph('penguin_belly', white(), 0.038, -2.02, dtop + 0.045, 0.183, 0.85, 1.1, 0.7);
  sph('penguin_eye_l', white(), 0.007, -2.035, dtop + 0.085, 0.21);
  sph('penguin_eye_r', white(), 0.007, -2.005, dtop + 0.085, 0.21);
  sph('penguin_beak', orange(), 0.012, -2.02, dtop + 0.072, 0.218, 1, 0.7, 1.2);
  sph('penguin_foot_l', orange(), 0.012, -2.035, dtop + 0.002, 0.185, 1.2, 0.4, 1.6);
  sph('penguin_foot_r', orange(), 0.012, -2.005, dtop + 0.002, 0.185, 1.2, 0.4, 1.6);
  // pen cup
  cyl('pen_cup', grayM(), 0.032, 0.028, 0.08, -1.52, dtop + 0.04, 0.02, 16);
  [[red(), -0.01, 0.1], [blue(), 0.008, -0.15], [orange(), 0, 0.05]].forEach(([m, dx, tilt], i) => {
    const p = cyl(`pen_${i + 1}`, m, 0.004, 0.004, 0.12, -1.52 + dx, dtop + 0.1, 0.02, 8);
    p.rotation.z = tilt;
  });
  // couple portrait next to the monitor
  {
    const fx = -1.08, fz = -0.16, ry = 0.35;
    const frame = box('portrait_frame', woodLite(), 0.13, 0.16, 0.012, fx, dtop + 0.08, fz, ry);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 320;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#f3e2c8'; ctx.fillRect(0, 0, 256, 320);
    // man (left): hair, head, shoulders
    ctx.fillStyle = '#5a4632'; ctx.beginPath(); ctx.arc(92, 128, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8b48c'; ctx.beginPath(); ctx.arc(92, 138, 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a4632'; ctx.beginPath(); ctx.arc(92, 118, 41, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#3d78d8'; ctx.beginPath(); ctx.arc(88, 245, 62, Math.PI, 0); ctx.fill();
    // woman (right): long hair, head, shoulders
    ctx.fillStyle = '#2e2117'; ctx.beginPath(); ctx.ellipse(170, 160, 52, 72, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eec09a'; ctx.beginPath(); ctx.arc(170, 148, 38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2e2117'; ctx.beginPath(); ctx.arc(170, 130, 39, Math.PI * 1.05, -0.05); ctx.fill();
    ctx.fillStyle = '#d8452e'; ctx.beginPath(); ctx.arc(176, 252, 58, Math.PI, 0); ctx.fill();
    // faces
    ctx.fillStyle = '#2e2117';
    [[78, 138], [104, 138], [158, 150], [184, 150]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = '#2e2117'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(92, 152, 12, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(170, 164, 11, 0.2, Math.PI - 0.2); ctx.stroke();
    const tex = new THREE.CanvasTexture(cv);
    const pm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }); pm.name = 'portrait_photo_tex';
    const photo = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.008), pm);
    photo.name = 'portrait_photo'; photo.position.set(fx + Math.sin(ry) * 0.006, dtop + 0.08, fz + Math.cos(ry) * 0.006);
    photo.rotation.y = ry; g.add(photo);
    const strut = box('portrait_strut', woodLite(), 0.02, 0.12, 0.01, fx - Math.sin(ry) * 0.035, dtop + 0.055, fz - Math.cos(ry) * 0.035, ry);
    strut.rotation.x = 0.45;
  }
  // ---- MIDDLE DESK contents ----
  box('cutting_mat', matGreen(), 0.5, 0.008, 0.32, 0.05, dtop + 0.004, 0.12);
  // robot arm
  {
    const ax = -0.35, az = -0.05;
    cyl('arm_base', darkG(), 0.09, 0.11, 0.05, ax, dtop + 0.025, az, 28);
    cyl('arm_post', darkG(), 0.035, 0.04, 0.1, ax, dtop + 0.1, az, 20);
    sph('arm_joint_1', darkG(), 0.045, ax, dtop + 0.16, az);
    const seg1 = box('arm_segment_1', darkG(), 0.05, 0.22, 0.05, ax + 0.06, dtop + 0.25, az);
    seg1.rotation.z = -0.5;
    sph('arm_joint_2', darkG(), 0.04, ax + 0.12, dtop + 0.33, az);
    const seg2 = box('arm_segment_2', darkG(), 0.045, 0.2, 0.045, ax + 0.2, dtop + 0.3, az);
    seg2.rotation.z = -1.9;
    sph('arm_joint_3', darkG(), 0.032, ax + 0.29, dtop + 0.26, az);
    [-0.012, 0.012].forEach((dz, i) => {
      const f = box(`arm_finger_${i + 1}`, blackM(), 0.012, 0.07, 0.01, ax + 0.281, dtop + 0.226, az + dz);
      f.rotation.z = -0.25; f.rotation.x = dz * 12;
    });
  }
  // silver rover on desk
  {
    const rx = 0.35, rz = 0.05;
    box('rover_chassis', silver(), 0.28, 0.06, 0.16, rx, dtop + 0.075, rz);
    box('rover_deck', grayM(), 0.2, 0.02, 0.12, rx, dtop + 0.115, rz);
    [[-0.1, -0.09], [0.1, -0.09], [-0.1, 0.09], [0.1, 0.09]].forEach(([dx, dz], i) => {
      cyl(`rover_wheel_${i + 1}`, blackM(), 0.045, 0.045, 0.03, rx + dx, dtop + 0.045, rz + dz, 24).rotation.x = Math.PI / 2;
      cyl(`rover_hub_${i + 1}`, silver(), 0.015, 0.015, 0.032, rx + dx, dtop + 0.045, rz + dz, 12).rotation.x = Math.PI / 2;
    });
  }

  // ---- RIGHT DESK contents ----
  // soldering station
  {
    const sx = 0.95, sz = -0.08;
    box('solder_station', darkG(), 0.16, 0.06, 0.12, sx, dtop + 0.03, sz);
    [[-0.03, blue()], [0.03, blue()]].forEach(([dx, m], i) =>
      cyl(`solder_knob_${i + 1}`, m, 0.014, 0.014, 0.012, sx + dx, dtop + 0.062, sz, 12));
    cyl('iron_holder', blackM(), 0.03, 0.035, 0.09, sx + 0.13, dtop + 0.045, sz, 16);
    tube('solder_iron', blue(), 0.011, [sx + 0.145, dtop + 0.05, sz], [sx + 0.105, dtop + 0.16, sz], 12);
    tube('iron_tip', silver(), 0.004, [sx + 0.105, dtop + 0.16, sz], [sx + 0.09, dtop + 0.2, sz], 8);
    const cable = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.004, 8, 24, Math.PI), blackM());
    cable.name = 'iron_cable'; cable.position.set(sx + 0.06, dtop + 0.06, sz); g.add(cable);
    // brass sponge tin
    cyl('sponge_tin', blue(), 0.035, 0.035, 0.03, sx - 0.12, dtop + 0.015, sz + 0.15, 20);
    cyl('brass_sponge', yellow(), 0.028, 0.028, 0.02, sx - 0.12, dtop + 0.035, sz + 0.15, 20);
  }
  // blue work mat + breadboard
  box('solder_mat', blue(), 0.55, 0.008, 0.3, 1.5, dtop + 0.004, 0.12);
  box('breadboard', white(), 0.16, 0.02, 0.1, 1.42, dtop + 0.018, 0.08);
  for (let c = 0; c < 6; c++)
    box(`bb_pin_${c + 1}`, [red(), blue(), green(), yellow(), red(), blue()][c], 0.008, 0.03, 0.008, 1.37 + c * 0.02, dtop + 0.04, 0.08);
  [[1.56, red()], [1.6, green()], [1.64, blue()]].forEach(([x, m], i) =>
    cyl(`component_${i + 1}`, m, 0.005, 0.005, 0.04, x, dtop + 0.015, 0.14, 8).rotation.z = Math.PI / 2);
  // wire spool on desk (kept clear of desk leg)
  {
    cyl('wire_spool_core', silver(), 0.035, 0.035, 0.05, 1.7, dtop + 0.055, 0.15, 20);
    [-0.028, 0.028].forEach((dy, i) => cyl(`wire_spool_flange_${i + 1}`, blue(), 0.055, 0.055, 0.008, 1.7, dtop + 0.055 + dy, 0.15, 24));
  }
  // magnifier lamp
  {
    const lx = 2.02, lz = -0.15;
    const P0 = [lx, dtop + 0.03, lz];                 // top of base
    const P1 = [lx - 0.1, dtop + 0.38, lz - 0.02];    // elbow
    const P2 = [lx - 0.32, dtop + 0.26, lz + 0.08];   // lamp head
    cyl('lamp_base', darkG(), 0.07, 0.085, 0.03, lx, dtop + 0.015, lz, 24);
    tube('lamp_arm_1', darkG(), 0.014, P0, P1, 12);
    sph('lamp_elbow', darkG(), 0.025, ...P1);
    tube('lamp_arm_2', darkG(), 0.012, P1, P2, 12);
    sph('lamp_head_joint', darkG(), 0.02, ...P2);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 12, 28), darkG());
    ring.name = 'magnifier_ring'; ring.position.set(P2[0], P2[1] - 0.02, P2[2]); ring.rotation.x = Math.PI / 2.15; g.add(ring);
    const lens = cyl('magnifier_lens', clear(), 0.052, 0.052, 0.006, P2[0], P2[1] - 0.02, P2[2], 28);
    lens.rotation.x = Math.PI / 2 - Math.PI / 2.15;
    // warm light pooling under the lamp head
    const lightM = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffe9a8, emissiveIntensity: 1.1, transparent: true, opacity: 0.16, depthWrite: false });
    lightM.name = 'lamp_light';
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.17, P2[1] - 0.03 - dtop, 28, 1, true), lightM);
    cone.name = 'lamp_light_cone'; cone.position.set(P2[0], (P2[1] - 0.03 + dtop) / 2 + 0.01, P2[2]); g.add(cone);
    const poolM = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffedb0, emissiveIntensity: 1.3, transparent: true, opacity: 0.45, depthWrite: false });
    poolM.name = 'lamp_light_pool';
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.003, 28), poolM);
    pool.name = 'lamp_light_disc'; pool.position.set(P2[0], dtop + 0.006, P2[2]); g.add(pool);
  }
  return g;
}

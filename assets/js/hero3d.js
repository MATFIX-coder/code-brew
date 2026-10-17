/* 3D-сцена первого экрана: неоновая чашка кофе, кольца двоичного кода,
   пар из частиц и synthwave-сетка. Реагирует на мышь и прокрутку. */
import * as THREE from '../vendor/three.module.min.js';

const host = document.querySelector('.hero__canvas');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

if (host && webglOk()) init();
else document.documentElement.classList.add('no-webgl');

function init() {
  const CYAN = new THREE.Color('#2be4ff');
  const MAGENTA = new THREE.Color('#ff3ec9');
  const VIOLET = new THREE.Color('#8a5bff');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060b, 0.055);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  camera.position.set(0, 1.2, 11);

  /* --- Окружение для отражений: светящиеся панели вокруг --- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x020308);
  const panel = (color, intensity, pos, size) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); envScene.add(m);
  };
  panel(CYAN, 3, [-6, 2, 3], [3, 8]);
  panel(MAGENTA, 3, [6, 1, 2], [3, 8]);
  panel(VIOLET, 1.5, [0, 7, -4], [10, 2]);
  panel(new THREE.Color('#ffffff'), 1.6, [0, 3, 8], [4, 1.2]);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;

  /* --- Чашка --- */
  const cup = new THREE.Group();
  scene.add(cup);

  // профиль чашки: внешняя стенка → кромка → внутренняя стенка
  const prof = [];
  const H = 2.0, R0 = 1.0, R1 = 1.2, T = 0.08;
  prof.push(new THREE.Vector2(0.0, 0));
  prof.push(new THREE.Vector2(R0 * 0.82, 0));
  prof.push(new THREE.Vector2(R0, 0.08));
  for (let i = 1; i <= 12; i++) { const t = i / 12; prof.push(new THREE.Vector2(R0 + (R1 - R0) * Math.pow(t, 0.8), 0.08 + t * (H - 0.08))); }
  prof.push(new THREE.Vector2(R1 - T * 0.4, H + 0.04));
  for (let i = 12; i >= 1; i--) { const t = i / 12; prof.push(new THREE.Vector2(R0 + (R1 - R0) * Math.pow(t, 0.8) - T, 0.08 + t * (H - 0.08) - 0.02)); }
  prof.push(new THREE.Vector2(0.0, 0.2));
  const bodyGeo = new THREE.LatheGeometry(prof, 96);
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x161a2e, metalness: 0.25, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.6 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = -H / 2;
  cup.add(body);

  // ручка
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.11, 24, 64, Math.PI * 1.25), bodyMat);
  handle.rotation.z = -Math.PI * 0.62;
  handle.position.set(1.32, 0.05, 0);
  cup.add(handle);

  // неоновая кромка
  const rimMat = new THREE.MeshBasicMaterial({ color: CYAN.clone().multiplyScalar(2.2), toneMapped: false });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R1 - T * 0.2, 0.022, 12, 160), rimMat);
  rim.rotation.x = Math.PI / 2; rim.position.y = H / 2 + 0.04;
  cup.add(rim);
  const baseRim = new THREE.Mesh(new THREE.TorusGeometry(R0 + 0.01, 0.018, 12, 140), new THREE.MeshBasicMaterial({ color: MAGENTA.clone().multiplyScalar(2), toneMapped: false }));
  baseRim.rotation.x = Math.PI / 2; baseRim.position.y = -H / 2 + 0.06;
  cup.add(baseRim);

  // кофе: живая поверхность с завихрением
  const coffeeMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec2 vUv; uniform float uTime;
      void main(){
        vec2 p = vUv - 0.5; float r = length(p); float a = atan(p.y, p.x);
        float swirl = sin(a * 3.0 + r * 18.0 - uTime * 1.2) * 0.5 + 0.5;
        vec3 dark = vec3(0.09, 0.045, 0.025); vec3 crema = vec3(0.42, 0.24, 0.13);
        vec3 col = mix(dark, crema, smoothstep(0.15, 0.48, r) * 0.55 + swirl * 0.12);
        col += vec3(0.17, 0.89, 1.0) * smoothstep(0.40, 0.5, r) * 0.25;
        col += vec3(1.0, 0.24, 0.79) * pow(swirl, 6.0) * 0.06;
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(R1 - T - 0.03, 64), coffeeMat);
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = H / 2 - 0.22;
  cup.add(coffee);

  /* --- Кольца из двоичного кода --- */
  function binaryTexture(color) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 64;
    const g = c.getContext('2d');
    g.font = '600 40px "JetBrains Mono", monospace'; g.textBaseline = 'middle';
    let s = ''; for (let i = 0; i < 90; i++) s += Math.random() > 0.5 ? '1' : '0';
    g.shadowColor = color; g.shadowBlur = 14; g.fillStyle = color;
    g.fillText(s, 0, 34);
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }
  const rings = [];
  [[2.25, '#ff3ec9', 0.32, -0.25, 1], [2.55, '#2be4ff', -0.22, 0.35, -1]].forEach(([r, col, tiltX, tiltZ, dir]) => {
    const tex = binaryTexture(col);
    tex.repeat.set(3, 1);
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, 0.2, 160, 1, true),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    );
    const pivot = new THREE.Group(); pivot.rotation.set(tiltX, 0, tiltZ); pivot.add(m);
    cup.add(pivot);
    // тонкая светящаяся линия под кольцом
    const line = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 6, 200), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(1.6), transparent: true, opacity: 0.6, toneMapped: false }));
    line.rotation.x = Math.PI / 2; line.position.y = -0.13; pivot.add(line);
    rings.push({ mesh: m, tex, dir });
  });

  /* --- Ореол (мягкое свечение) --- */
  function glowTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const gt = glowTex();
  const halo = (color, scale, pos, op) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.scale.set(scale, scale, 1); s.position.set(...pos); return s;
  };
  cup.add(halo(VIOLET, 9, [0, 0, -2], 0.35));
  cup.add(halo(CYAN, 3.4, [0, H / 2, 0], 0.35));

  /* --- Пар --- */
  const STEAM = 420;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(STEAM * 3), sSeed = new Float32Array(STEAM);
  for (let i = 0; i < STEAM; i++) { sSeed[i] = Math.random(); sPos[i * 3] = 0; sPos[i * 3 + 1] = 0; sPos[i * 3 + 2] = 0; }
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('seed', new THREE.BufferAttribute(sSeed, 1));
  const steamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uA: { value: CYAN }, uB: { value: MAGENTA } },
    vertexShader: `
      attribute float seed; uniform float uTime; uniform float uPR; varying float vLife; varying float vSeed;
      void main(){
        float life = fract(uTime * (0.08 + seed * 0.06) + seed * 7.0);
        float h = life * 3.6;
        float ang = seed * 6.2831;
        vec3 p = vec3(cos(ang) * 0.75 * (1.0 - life * 0.5), h, sin(ang) * 0.75 * (1.0 - life * 0.5));
        p.x += sin(h * 2.2 + uTime * 0.9 + seed * 10.0) * 0.35 * life;
        p.z += cos(h * 1.7 + uTime * 0.7 + seed * 5.0) * 0.25 * life;
        vLife = life; vSeed = seed;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (40.0 + 110.0 * life) * uPR / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uA; uniform vec3 uB; varying float vLife; varying float vSeed;
      void main(){
        float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d) * smoothstep(0.0, 0.15, vLife) * (1.0 - vLife) * 0.42;
        gl_FragColor = vec4(mix(uA, uB, vLife * 0.9 + vSeed * 0.1), a);
      }`
  });
  const steam = new THREE.Points(sGeo, steamMat);
  steam.position.y = H / 2 - 0.25;
  cup.add(steam);

  /* --- Synthwave-сетка --- */
  const gridMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uA: { value: CYAN }, uB: { value: MAGENTA } },
    vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `
      varying vec2 vUv; varying vec3 vW; uniform float uTime; uniform vec3 uA; uniform vec3 uB;
      float line(float x, float w){ float f = abs(fract(x) - 0.5); return smoothstep(w, 0.0, f - (0.5 - w)); }
      void main(){
        vec2 g = vec2(vW.x, vW.z + uTime * 0.8) * 0.9;
        float l = max(line(g.x, 0.035), line(g.y, 0.035));
        float fade = smoothstep(28.0, 3.0, length(vW.xz - vec2(0.0, -2.0)));
        vec3 col = mix(uB, uA, smoothstep(-20.0, 6.0, vW.z));
        gl_FragColor = vec4(col * 1.5, l * fade * 0.7);
      }`
  });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(80, 60, 1, 1), gridMat);
  grid.rotation.x = -Math.PI / 2; grid.position.set(0, -2.15, -10);
  scene.add(grid);
  const floorGlow = halo(MAGENTA, 7, [0, -2.1, 0], 0.18);
  scene.add(floorGlow);

  /* --- Звёздная пыль --- */
  const DUST = 900;
  const dGeo = new THREE.BufferGeometry(); const dp = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) { dp[i * 3] = (Math.random() - 0.5) * 40; dp[i * 3 + 1] = Math.random() * 16 - 3; dp[i * 3 + 2] = -Math.random() * 30 + 4; }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.05, color: 0x9fb0ff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  /* --- Свет для бликов --- */
  scene.add(new THREE.AmbientLight(0x404060, 0.4));
  const lc = new THREE.PointLight(CYAN, 40, 20); lc.position.set(-4, 2, 3); scene.add(lc);
  const lm = new THREE.PointLight(MAGENTA, 40, 20); lm.position.set(4, 0, 3); scene.add(lm);

  /* --- Компоновка, мышь, прокрутка --- */
  let layout = { x: 2.6, y: 0.1, s: 1 };
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const mobile = w < 900;
    layout = mobile ? { x: 0, y: -0.35, s: 1.0 } : { x: Math.min(3.4, 1.6 + w / 1000), y: 0.85, s: 0.78 };
    steamMat.uniforms.uPR.value = renderer.getPixelRatio();
    // на телефоне сетка пола под острым углом сливается в яркую полосу — прячем её
    grid.visible = !mobile; floorGlow.visible = !mobile;
  }
  window.addEventListener('resize', resize);
  resize();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // появление после прелоадера
  let intro = 0, introTarget = 0;
  cup.scale.setScalar(0.001);
  window.addEventListener('cb:intro', () => { introTarget = 1; host.classList.add('is-in'); });
  if (window.__cbIntro) { introTarget = 1; host.classList.add('is-in'); }
  setTimeout(() => { introTarget = 1; }, 4500); // подстраховка

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const speed = reduced ? 0.15 : 1;

    intro += (introTarget - intro) * (1 - Math.pow(0.0015, dt));
    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    const ease = 1 - Math.pow(1 - intro, 3);
    cup.scale.setScalar(layout.s * (0.6 + 0.4 * ease) * (1 + scroll * 0.25));
    cup.position.set(layout.x - scroll * 0.6, layout.y + Math.sin(t * 0.8) * 0.08 * speed - (1 - ease) * 1.5 + scroll * 1.2, 0);
    cup.rotation.y = -0.5 + t * 0.12 * speed + mouse.x * 0.35 + scroll * 1.6;
    cup.rotation.x = 0.42 + mouse.y * 0.12 - scroll * 0.25;
    cup.rotation.z = -0.06 + mouse.x * -0.05;

    rings.forEach((r, i) => { r.tex.offset.x += dt * 0.04 * r.dir * speed; r.mesh.rotation.y += dt * 0.15 * r.dir * speed; r.mesh.material.opacity = ease; });
    coffeeMat.uniforms.uTime.value = t * speed;
    steamMat.uniforms.uTime.value = t * speed;
    gridMat.uniforms.uTime.value = t * speed;
    rimMat.color.copy(CYAN).lerp(MAGENTA, (Math.sin(t * 0.7) + 1) * 0.25).multiplyScalar(2.2);
    dust.rotation.y = t * 0.01 * speed;

    camera.position.x = mouse.x * 0.5;
    camera.position.y = 1.2 + mouse.y * -0.3 - scroll * 0.8;
    camera.lookAt(layout.x * 0.25, 0.2 - scroll * 0.5, 0);
    renderer.domElement.style.opacity = String(Math.min(1, intro * 1.5) * (1 - scroll * 0.55));

    renderer.render(scene, camera);
  }
  frame();
}

/**
 * src/scripts/floating-scene.ts — Three.js-сцена парящих low-poly объектов.
 *
 * Что делает: собирает процедурную сцену с мягкими скруглёнными формами
 * (пробирка, колба, молекула, ступеньки, облачко, самолётик, кубик, росток),
 * медленно покачивает и вращает их, слегка реагирует на курсор и корректно
 * останавливается вне вьюпорта / при prefers-reduced-motion.
 *
 * Как работает: WebGLRenderer с прозрачным фоном рисует поверх бумажного
 * CSS-фона. Цвета материалов читаются из CSS-переменных темы `.theme-sunlight`.
 * Направление DirectionalLight совпадает с `.decor-sunrays` (сверху-слева).
 * На мобильных показывается облегчённый набор объектов. При недоступном WebGL
 * сцена тихо не инициализируется.
 *
 * Связан с: `src/components/decor/FloatingScene.astro`,
 * `src/styles/themes/sunlight.css`, страница `src/pages/proto/3.astro`.
 */
import * as THREE from 'three';

/** Параметры покачивания одного объекта в сцене. */
interface Floater {
  group: THREE.Group;
  baseY: number;
  amp: number;
  speed: number;
  phase: number;
  spin: THREE.Vector3;
}

/** Цвета темы, считанные из CSS-переменных body. */
interface ThemeColors {
  accent: string;
  accent2: string;
  ink: string;
  bgAlt: string;
  surface2: string;
  wood: string;
  leaf: string;
  cloud: string;
  glass: string;
}

/**
 * Проверяет доступность WebGL без выброса ошибок в консоль.
 * Используется при старте сцены, чтобы тихо отказаться от рендера.
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Читает семантические цвета темы с body для материалов Three.js.
 * Используется при сборке объектов сцены.
 */
function readThemeColors(): ThemeColors {
  const cs = getComputedStyle(document.body);
  const get = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;

  return {
    accent: get('--color-accent', '#e8863c'),
    accent2: get('--color-accent-2', '#4a8fd8'),
    ink: get('--color-ink', '#2a2016'),
    bgAlt: get('--color-bg-alt', '#fdf1e1'),
    surface2: get('--color-surface-2', '#fbeedc'),
    wood: '#c9956a',
    leaf: '#7aab6a',
    cloud: '#fff8ef',
    glass: '#d9ecff',
  };
}

/**
 * Создаёт мягкий физический материал без flatShading.
 * Используется всеми фабриками объектов сцены.
 */
function softPhysical(
  color: string,
  opts: Partial<THREE.MeshPhysicalMaterialParameters> = {},
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.05,
    clearcoat: opts.clearcoat ?? 0.15,
    clearcoatRoughness: opts.clearcoatRoughness ?? 0.55,
    transmission: opts.transmission ?? 0,
    thickness: opts.thickness ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    ior: opts.ior ?? 1.45,
    side: opts.side ?? THREE.FrontSide,
  });
}

/**
 * Собирает скруглённый «бокс» через ExtrudeGeometry с bevel.
 * Используется для ступенек, книг, горшка и пухлого кубика.
 */
function createRoundedBox(
  width: number,
  height: number,
  depth: number,
  radius: number,
  material: THREE.Material,
): THREE.Mesh {
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: r * 0.35,
    bevelSize: r * 0.35,
    bevelSegments: 3,
    curveSegments: 6,
  });
  geo.center();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

/**
 * Делает меш стеклянной оболочкой, через которую видно содержимое.
 *
 * Зачем нужна: в three.js `transmission` и `opacity` конфликтуют — вместе они
 * дают почти непрозрачную заливку, и жидкость внутри пробирки пропадает.
 * Поэтому стекло — это обычный полупрозрачный меш, который не пишет в буфер
 * глубины и рисуется последним, так что содержимое всегда просвечивает.
 *
 * Используется пробиркой и колбой.
 */
function makeGlassShell(mesh: THREE.Mesh): THREE.Mesh {
  const material = mesh.material as THREE.MeshPhysicalMaterial;
  material.transmission = 0;
  material.thickness = 0;
  material.transparent = true;
  material.depthWrite = false;
  mesh.renderOrder = 2;
  return mesh;
}

/**
 * Собирает пробирку: стеклянная капсула, синяя жидкость и пузырьки сверху.
 * Ключевой объект сцены — самый заметный.
 */
function createTestTube(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();

  const liquid = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.235, 0.72, 5, 12),
    softPhysical(colors.accent2, {
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.5,
      clearcoatRoughness: 0.25,
    }),
  );
  liquid.position.y = -0.24;
  liquid.renderOrder = 1;
  group.add(liquid);

  const glass = makeGlassShell(
    new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 1.15, 6, 12),
      softPhysical(colors.glass, {
        roughness: 0.1,
        metalness: 0,
        opacity: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    ),
  );
  group.add(glass);

  for (let i = 0; i < 5; i++) {
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 + Math.random() * 0.03, 8, 8),
      softPhysical('#ffffff', {
        roughness: 0.2,
        transparent: true,
        opacity: 0.75,
      }),
    );
    bubble.position.set(
      (Math.random() - 0.5) * 0.18,
      0.15 + Math.random() * 0.55,
      (Math.random() - 0.5) * 0.18,
    );
    bubble.renderOrder = 1;
    group.add(bubble);
  }

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.29, 0.035, 8, 16),
    softPhysical(colors.surface2, {
      roughness: 0.35,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.72;
  group.add(rim);

  return group;
}

/**
 * Собирает мягкую колбу-шар с коротким горлышком.
 * Научный объект рядом с пробиркой.
 */
function createFlask(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();

  const liquid = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 10),
    softPhysical(colors.accent, {
      roughness: 0.32,
      clearcoat: 0.45,
    }),
  );
  liquid.position.y = -0.09;
  liquid.scale.set(1, 0.68, 1);
  liquid.renderOrder = 1;
  group.add(liquid);

  const body = makeGlassShell(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 10),
      softPhysical(colors.glass, {
        roughness: 0.12,
        opacity: 0.3,
        clearcoat: 1,
      }),
    ),
  );
  group.add(body);

  const neck = makeGlassShell(
    new THREE.Mesh(
      new THREE.CapsuleGeometry(0.1, 0.35, 4, 10),
      softPhysical(colors.glass, {
        roughness: 0.12,
        opacity: 0.34,
        clearcoat: 1,
      }),
    ),
  );
  neck.position.y = 0.55;
  group.add(neck);

  return group;
}

/**
 * Собирает молекулу из сфер-атомов и капсул-связок.
 * Компактный научный декор для глубины сцены.
 */
function createMolecule(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();
  const atomMat = softPhysical(colors.accent2, { roughness: 0.45, clearcoat: 0.5 });
  const atomMat2 = softPhysical(colors.accent, { roughness: 0.5, clearcoat: 0.4 });
  const bondMat = softPhysical(colors.ink, { roughness: 0.65, opacity: 0.35, transparent: true });

  const positions: [number, number, number][] = [
    [0, 0, 0],
    [0.45, 0.28, 0.1],
    [-0.4, 0.22, -0.15],
    [0.15, -0.38, 0.2],
    [-0.2, -0.15, 0.42],
  ];

  positions.forEach((pos, i) => {
    const atom = new THREE.Mesh(
      new THREE.SphereGeometry(i === 0 ? 0.16 : 0.11, 10, 8),
      i % 2 === 0 ? atomMat : atomMat2,
    );
    atom.position.set(...pos);
    group.add(atom);
  });

  const bonds: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ];
  for (const [a, b] of bonds) {
    const pa = new THREE.Vector3(...positions[a]);
    const pb = new THREE.Vector3(...positions[b]);
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    const dist = pa.distanceTo(pb);
    const bond = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, dist * 0.7, 3, 6), bondMat);
    bond.position.copy(mid);
    bond.lookAt(pb);
    bond.rotateX(Math.PI / 2);
    group.add(bond);
  }

  return group;
}

/**
 * Собирает стопку скруглённых «книг»/пластин тёплых оттенков.
 * Лёгкий научный реквизит для разнообразия силуэтов.
 */
function createBookStack(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();
  const tones = [colors.accent, colors.wood, colors.accent2];

  tones.forEach((tone, i) => {
    const book = createRoundedBox(
      0.7 - i * 0.05,
      0.12,
      0.5 - i * 0.04,
      0.06,
      softPhysical(tone, { roughness: 0.78 }),
    );
    book.position.y = i * 0.14;
    book.rotation.y = (i - 1) * 0.12;
    group.add(book);
  });

  return group;
}

/**
 * Собирает модельку деревянных ступенек (3–4 ступени) — метафора роста.
 * Тёплый древесный цвет, сильно скруглённые грани.
 */
function createSteps(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();
  const mat = softPhysical(colors.wood, { roughness: 0.82, clearcoat: 0.08 });

  for (let i = 0; i < 4; i++) {
    const w = 0.95 - i * 0.12;
    const step = createRoundedBox(w, 0.14, 0.55 - i * 0.05, 0.07, mat);
    step.position.set(0, i * 0.16, -i * 0.08);
    group.add(step);
  }

  return group;
}

/**
 * Собирает пухлое облачко из слипшихся сфер.
 * Элемент «по фану» для мягкого настроения Soft Sunlight.
 */
function createCloud(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();
  const mat = softPhysical(colors.cloud, { roughness: 0.9, clearcoat: 0 });

  const blobs: [number, number, number, number][] = [
    [0, 0, 0, 0.32],
    [0.28, 0.05, 0.05, 0.26],
    [-0.3, 0.02, -0.04, 0.24],
    [0.05, 0.18, -0.08, 0.22],
    [-0.08, -0.1, 0.1, 0.2],
  ];

  for (const [x, y, z, r] of blobs) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
    blob.position.set(x, y, z);
    group.add(blob);
  }

  return group;
}

/**
 * Собирает скруглённый бумажный самолётик из мягких пластин и носа-капсулы.
 * Элемент «по фану», лёгкий силуэт в воздухе.
 */
function createPaperPlane(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();
  const mat = softPhysical(colors.surface2, { roughness: 0.7, clearcoat: 0.2 });
  const accentMat = softPhysical(colors.accent, { roughness: 0.55 });

  const body = createRoundedBox(0.7, 0.06, 0.22, 0.04, mat);
  body.rotation.z = -0.12;
  group.add(body);

  const wingL = createRoundedBox(0.35, 0.04, 0.45, 0.04, mat);
  wingL.position.set(-0.05, 0.02, 0.22);
  wingL.rotation.set(0.15, 0.2, 0.05);
  group.add(wingL);

  const wingR = createRoundedBox(0.35, 0.04, 0.45, 0.04, mat);
  wingR.position.set(-0.05, 0.02, -0.22);
  wingR.rotation.set(-0.15, -0.2, 0.05);
  group.add(wingR);

  const nose = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.18, 4, 8), accentMat);
  nose.rotation.z = Math.PI / 2;
  nose.position.set(0.38, 0, 0);
  group.add(nose);

  return group;
}

/**
 * Собирает пухлый кубик с очень сильно скруглёнными углами.
 * Простой «игрушечный» объект для баланса композиции.
 */
function createSoftCube(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();
  const cube = createRoundedBox(
    0.48,
    0.48,
    0.48,
    0.16,
    softPhysical(colors.accent, { roughness: 0.55, clearcoat: 0.35 }),
  );
  group.add(cube);
  return group;
}

/**
 * Собирает росток в горшке: скруглённый горшок + стебель-капсула + листья-сферы.
 * Метафора роста рядом со ступеньками.
 */
function createSprout(colors: ThemeColors): THREE.Group {
  const group = new THREE.Group();

  const pot = createRoundedBox(
    0.42,
    0.32,
    0.42,
    0.1,
    softPhysical(colors.wood, { roughness: 0.85 }),
  );
  pot.position.y = -0.05;
  group.add(pot);

  const soil = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 8),
    softPhysical(colors.ink, { roughness: 0.95, opacity: 0.55, transparent: true }),
  );
  soil.scale.set(1, 0.35, 1);
  soil.position.y = 0.12;
  group.add(soil);

  const stem = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.035, 0.35, 4, 8),
    softPhysical(colors.leaf, { roughness: 0.7 }),
  );
  stem.position.y = 0.38;
  group.add(stem);

  const leafMat = softPhysical(colors.leaf, { roughness: 0.6, clearcoat: 0.2 });
  const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), leafMat);
  leaf1.scale.set(1.4, 0.45, 0.9);
  leaf1.position.set(0.12, 0.52, 0);
  leaf1.rotation.z = -0.5;
  group.add(leaf1);

  const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), leafMat);
  leaf2.scale.set(1.3, 0.4, 0.85);
  leaf2.position.set(-0.1, 0.62, 0.05);
  leaf2.rotation.z = 0.55;
  group.add(leaf2);

  return group;
}

/**
 * Рекурсивно освобождает геометрии и материалы объекта.
 * Используется при dispose сцены.
 */
function disposeObject(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) mat?.dispose();
    }
  });
}

/**
 * Инициализирует парящую 3D-сцену внутри корневого элемента FloatingScene.
 * Возвращает функцию очистки (dispose). Вызывается из компонента декора.
 */
export function initFloatingScene(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-floating-canvas]');
  if (!canvas || !isWebGLAvailable()) {
    root.hidden = true;
    return () => undefined;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const colors = readThemeColors();

  let width = root.clientWidth || 480;
  let height = root.clientHeight || 420;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 40);
  camera.position.set(0.15, 0.55, isMobile ? 6.2 : 5.4);
  camera.lookAt(0, 0.2, 0);

  // Свет сверху-слева — совпадает с CSS-лучами .decor-sunrays.
  const hemi = new THREE.HemisphereLight(0xfff0d8, 0xe8d4b8, 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffe2b8, 1.15);
  sun.position.set(-4.5, 5.5, 2.5);
  scene.add(sun);

  const fill = new THREE.AmbientLight(0xfff6ea, 0.35);
  scene.add(fill);

  const floaters: Floater[] = [];

  /**
   * Добавляет объект в сцену с параметрами покачивания и вращения.
   * Локальный хелпер сборки композиции.
   */
  const place = (
    group: THREE.Group,
    pos: [number, number, number],
    scale: number,
    amp: number,
    speed: number,
    spin: [number, number, number],
  ) => {
    group.position.set(...pos);
    group.scale.setScalar(scale);
    scene.add(group);
    floaters.push({
      group,
      baseY: pos[1],
      amp,
      speed,
      phase: Math.random() * Math.PI * 2,
      spin: new THREE.Vector3(...spin),
    });
  };

  // Полный набор; на мобильном оставляем ключевые и 1–2 «по фану».
  place(createTestTube(colors), [0.55, 0.55, 0.2], isMobile ? 1.05 : 1.2, 0.12, 0.55, [0, 0.25, 0]);
  place(createFlask(colors), [-1.15, 0.15, -0.4], 0.85, 0.1, 0.42, [0.05, 0.2, 0.02]);
  place(createSteps(colors), [1.45, -0.55, -0.7], 0.75, 0.06, 0.35, [0, 0.12, 0]);
  place(createMolecule(colors), [-0.35, 1.05, -1.1], 0.9, 0.14, 0.6, [0.15, 0.35, 0.1]);

  if (!isMobile) {
    place(createBookStack(colors), [-1.55, -0.65, 0.35], 0.8, 0.07, 0.38, [0, 0.15, 0]);
    place(createCloud(colors), [1.7, 1.15, -1.4], 0.7, 0.16, 0.3, [0.02, 0.1, 0.02]);
    place(createPaperPlane(colors), [-0.2, -0.2, 1.1], 0.7, 0.18, 0.48, [0.08, 0.4, 0.05]);
    place(createSoftCube(colors), [1.1, -0.9, 0.7], 0.55, 0.09, 0.5, [0.2, 0.25, 0.15]);
    place(createSprout(colors), [-1.8, 0.55, -1.2], 0.65, 0.08, 0.33, [0, 0.18, 0]);
  } else {
    place(createCloud(colors), [1.35, 1.0, -1.0], 0.55, 0.12, 0.28, [0, 0.08, 0]);
    place(createSprout(colors), [-1.35, -0.55, 0.2], 0.6, 0.07, 0.32, [0, 0.15, 0]);
  }

  let raf = 0;
  let visible = true;
  let disposed = false;
  const startMs = performance.now();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const camBase = camera.position.clone();

  /**
   * Рендерит один кадр: покачивание, вращение, мягкий parallax камеры.
   * Вызывается из requestAnimationFrame или один раз при reduced-motion.
   * @param timeSec — время сцены в секундах (performance.now, без THREE.Clock).
   */
  const renderFrame = (timeSec: number) => {
    for (const f of floaters) {
      f.group.position.y = f.baseY + Math.sin(timeSec * f.speed + f.phase) * f.amp;
      f.group.rotation.x += f.spin.x * 0.003;
      f.group.rotation.y += f.spin.y * 0.003;
      f.group.rotation.z += f.spin.z * 0.003;
    }

    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x = camBase.x + pointer.x * 0.35;
    camera.position.y = camBase.y + pointer.y * 0.22;
    camera.lookAt(pointer.x * 0.15, 0.2 + pointer.y * 0.1, 0);

    renderer.render(scene, camera);
  };

  /**
   * Цикл анимации; пропускает кадры, когда сцена вне вьюпорта.
   */
  const tick = () => {
    if (disposed) return;
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    renderFrame((performance.now() - startMs) / 1000);
  };

  /**
   * Обрабатывает мягкий parallax по курсору (только pointer: fine).
   */
  const onPointerMove = (event: PointerEvent) => {
    if (!visible) return;
    const rect = root.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    pointer.tx = THREE.MathUtils.clamp(nx, -1, 1) * 0.55;
    pointer.ty = THREE.MathUtils.clamp(-ny, -1, 1) * 0.4;
  };

  /**
   * Подгоняет размер рендерера и камеры под контейнер.
   */
  const resize = () => {
    width = root.clientWidth || width;
    height = root.clientHeight || height;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (reducedMotion) renderer.render(scene, camera);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible && !reducedMotion && !raf && !disposed) tick();
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(root);

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !reducedMotion) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  if (reducedMotion) {
    renderFrame(0);
  } else {
    tick();
  }

  /**
   * Полностью освобождает GPU-ресурсы и снимает слушатели.
   * Возвращается вызывающему коду FloatingScene.
   */
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    raf = 0;
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    for (const f of floaters) disposeObject(f.group);
    renderer.dispose();
    canvas.remove();
  };
}

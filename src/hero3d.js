import * as THREE from "three";

function createNodeTexture({ hub = false } = {}) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const cx = size / 2;
  const cy = size / 2;
  const core = hub ? 9 : 7;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, core + 12);
  glow.addColorStop(
    0,
    hub ? "rgba(201, 212, 195, 0.62)" : "rgba(243, 239, 230, 0.48)"
  );
  glow.addColorStop(1, "rgba(243, 239, 230, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = hub ? "rgba(201, 212, 195, 0.98)" : "rgba(243, 239, 230, 0.92)";
  ctx.fillRect(-core / 2, -core / 2, core, core);
  ctx.restore();

  if (hub) {
    ctx.strokeStyle = "rgba(243, 239, 230, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, core * 0.95, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createHeroScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0.35, 0.1, 6.4);

  const group = new THREE.Group();
  scene.add(group);

  const isMobile = window.innerWidth <= 900;
  const count = isMobile ? 540 : 720;
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const y = 1 - t * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const swirl = 2.05 + Math.sin(i * 0.17) * 0.22 + Math.random() * 0.14;
    positions[i * 3] = Math.cos(theta) * radius * swirl;
    positions[i * 3 + 1] = y * swirl * 0.9;
    positions[i * 3 + 2] = Math.sin(theta) * radius * swirl;
  }

  const nodePositions = [];
  const hubPositions = [];
  for (let i = 0; i < count; i += 1) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    if (i % 9 === 0) {
      hubPositions.push(x, y, z);
    } else {
      nodePositions.push(x, y, z);
    }
  }

  const nodeTexture = createNodeTexture();
  const hubTexture = createNodeTexture({ hub: true });

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(nodePositions, 3)
  );
  const nodes = new THREE.Points(
    nodeGeometry,
    new THREE.PointsMaterial({
      map: nodeTexture,
      color: 0xffffff,
      size: isMobile ? 0.11 : 0.13,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true,
      depthWrite: false,
      alphaTest: 0.08,
    })
  );
  group.add(nodes);

  const hubGeometry = new THREE.BufferGeometry();
  hubGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(hubPositions, 3)
  );
  const hubs = new THREE.Points(
    hubGeometry,
    new THREE.PointsMaterial({
      map: hubTexture,
      color: 0xffffff,
      size: isMobile ? 0.17 : 0.2,
      transparent: true,
      opacity: 0.96,
      sizeAttenuation: true,
      depthWrite: false,
      alphaTest: 0.08,
    })
  );
  group.add(hubs);

  const linePositions = [];
  const maxDistance = 0.62;
  for (let i = 0; i < count; i += 1) {
    let links = 0;
    for (let j = i + 1; j < count && links < 3; j += 1) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < maxDistance) {
        linePositions.push(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2],
          positions[j * 3],
          positions[j * 3 + 1],
          positions[j * 3 + 2]
        );
        links += 1;
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
  );
  const lines = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0xc9d4c3,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
  );
  group.add(lines);

  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  const onPointerMove = (event) => {
    target.x = (event.clientX / window.innerWidth) * 2 - 1;
    target.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointerMove);

  const resize = () => {
    const { clientWidth, clientHeight } = canvas.parentElement;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    group.position.x = clientWidth > 900 ? 1.35 : 0.15;
  };
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tick = (time) => {
    const t = time * 0.001;
    mouse.x += (target.x - mouse.x) * 0.045;
    mouse.y += (target.y - mouse.y) * 0.045;

    if (!reduced) {
      const breathe = 1 + Math.sin(t * 0.42) * 0.012;
      group.scale.setScalar(breathe);
      group.rotation.y = t * 0.1 + mouse.x * 0.35;
      group.rotation.x = Math.sin(t * 0.32) * 0.12 + mouse.y * 0.18;
      group.rotation.z = Math.cos(t * 0.2) * 0.04;
      hubs.material.opacity = 0.9 + Math.sin(t * 1.2) * 0.06;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", resize);
    nodeGeometry.dispose();
    hubGeometry.dispose();
    lineGeometry.dispose();
    nodeTexture.dispose();
    hubTexture.dispose();
    renderer.dispose();
  };
}

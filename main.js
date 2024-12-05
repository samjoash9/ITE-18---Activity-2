import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer na bai
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011); // Dark blue para sa night sky taraw bai

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0xffffff }) // Snowy ground bai
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

scene.fog = new THREE.Fog(0x000011, 10, 50); // Night fog na bai 

// Moonlight ni bai or directional shit
const moonLight = new THREE.DirectionalLight(0xaaaaff, 0.4); // Nice nighttime na siga
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

const ambientLight = new THREE.AmbientLight(0x222222, 0.3); // ipa dim nato ang ambient light bai para mura jud og gabii
scene.add(ambientLight);

// Shrine bounds ni bai
const shrineBounds = new THREE.Box3(
  new THREE.Vector3(-2, 0, -2), 
  new THREE.Vector3(2, 6, 2)
);

// Helper function bai para walay mu spawn na uban shit sulod sa shrine
const isPositionInShrineArea = (x, y, z) => {
  const position = new THREE.Vector3(x, y, z);
  return shrineBounds.containsPoint(position);
};

// Trees ni na part bai
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Tae na brown ni para sa lawas bai
const snowMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Snow taraw ang leaves bai

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;
  
  if (!isPositionInShrineArea(x, 3, z)) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 6, 16),
      trunkMaterial
    );
    trunk.position.set(x, 3, z);
    trunk.castShadow = true;

    // Layered leaves or foilage ni bai
    const foliageLayers = [];
    for (let j = 0; j < 3; j++) {
      const foliage = new THREE.Mesh(
        new THREE.ConeGeometry(2 - j * 0.5, 2, 16),
        snowMaterial
      );
      foliage.position.set(x, trunk.position.y + 4 + j * 1.5, z);
      foliage.castShadow = true;
      foliageLayers.push(foliage);
    }

    scene.add(trunk, ...foliageLayers);
  }
}

// Mushrooms ni bai
const mushroomCapMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Tae na pula ang ulo2
const mushroomStemMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Tae na puti ang lawas

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;
  
  if (!isPositionInShrineArea(x, 0.25, z)) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.2, 0.5),
      mushroomStemMaterial
    );
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 0.3, 8),
      mushroomCapMaterial
    );
    stem.position.set(x, 0.25, z);
    cap.position.set(x, 0.55, z);

    stem.castShadow = true;
    cap.castShadow = true;

    scene.add(stem);
    scene.add(cap);
  }
}

// Fireflies ni diri baii
const fireflies = [];
for (let i = 0; i < 15; i++) {
  const firefly = new THREE.PointLight(0xffff00, 2, 7);
  firefly.position.set(
    Math.random() * 40 - 20,
    Math.random() * 5 + 1,
    Math.random() * 40 - 20
  );
  scene.add(firefly);
  fireflies.push({
    light: firefly,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.05, // Naka random para dynamic tan awon
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    ),
  });
}

// Orb pedestal
const shrine = new THREE.Group();
const base = new THREE.Mesh(
  new THREE.BoxGeometry(3, 1, 3),
  new THREE.MeshStandardMaterial({ color: 0x555555 }) // Dark gray base, mao ni ang pedestal
);
base.position.y = 0.5;
base.castShadow = true;

const orb = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ emissive: 0x00ff88, emissiveIntensity: 10 }) // Big black glow
);
orb.position.y = 2;
orb.castShadow = true;

shrine.add(base);
shrine.add(orb);
scene.add(shrine);

// Camera shit ni bai
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Animation ni bai
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Firefly movements ni diri
  fireflies.forEach(({ light, velocity }) => {
    light.position.add(velocity);
    if (light.position.y < 1 || light.position.y > 6) velocity.y *= -1;
    if (light.position.x < -20 || light.position.x > 20) velocity.x *= -1;
    if (light.position.z < -20 || light.position.z > 20) velocity.z *= -1;
  });

  // Pulsing effect sa orb sa shrine
  const intensity = Math.abs(Math.sin(elapsedTime));
  orb.material.emissiveIntensity = intensity * 10; // Amplified para mas mwa

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
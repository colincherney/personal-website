import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#000000");

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 200;

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("globe-container").appendChild(renderer.domElement);

// Create globe
const geometry = new THREE.SphereGeometry(100, 64, 64);
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
  "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg",
  undefined,
  undefined,
  (error) =>
    console.error("An error occurred while loading the texture:", error)
);
const material = new THREE.MeshPhongMaterial({ map: texture });
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(500, 100, 0);
scene.add(pointLight);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enableZoom = false;
controls.enablePan = false;

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create stars
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.5,
  sizeAttenuation: true,
});

const starsVertices = [];
const radius = 1000; // Radius of star sphere
const starsCount = 20000; // Increased number of stars

for (let i = 0; i < starsCount; i++) {
  const theta = 2 * Math.PI * Math.random();
  const phi = Math.acos(2 * Math.random() - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  starsVertices.push(x, y, z);
}

starsGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starsVertices, 3)
);
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// Rotation speed (in radians per second)
const rotationSpeed = 0.05;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Apply rotation to the globe
  globe.rotation.y += rotationSpeed * 0.03;

  // Rotate the star field slowly
  starField.rotation.y += rotationSpeed * 0.01;

  controls.update();
  renderer.render(scene, camera);
}

animate();

console.log("Globe script loaded");

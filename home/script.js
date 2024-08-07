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

// Function to create satellites
function createSatellite() {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const satellite = new THREE.Mesh(geometry, material);

  // Set random position
  satellite.position.set(
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400
  );

  // Set random velocity
  satellite.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  );

  scene.add(satellite);
  return satellite;
}

// Function to create shooting stars
function createShootingStar() {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });

  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(0, 0, -20));
  geometry.setFromPoints(points);

  const shootingStar = new THREE.Line(geometry, material);

  // Set random position
  shootingStar.position.set(
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000
  );

  // Set random velocity
  shootingStar.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );

  scene.add(shootingStar);
  return shootingStar;
}

// Create arrays for satellites and shooting stars
const satellites = [];
const shootingStars = [];

// Create initial satellites and shooting stars
for (let i = 0; i < 10; i++) {
  satellites.push(createSatellite());
}
for (let i = 0; i < 5; i++) {
  shootingStars.push(createShootingStar());
}

// Rotation speed (in radians per second)
const rotationSpeed = 0.05;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Apply rotation to the globe
  globe.rotation.y += rotationSpeed * 0.03;

  // Rotate the star field slowly
  starField.rotation.y += rotationSpeed * 0.01;

  // Update satellites
  satellites.forEach((satellite, index) => {
    satellite.position.add(satellite.velocity);
    if (
      satellite.position.length() > 500 ||
      satellite.position.length() < 150
    ) {
      scene.remove(satellite);
      satellites[index] = createSatellite();
    }
  });

  // Update shooting stars
  shootingStars.forEach((star, index) => {
    star.position.add(star.velocity);
    if (star.position.length() > 1500) {
      scene.remove(star);
      shootingStars[index] = createShootingStar();
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

// Function to occasionally add new shooting stars
function addRandomShootingStar() {
  if (Math.random() < 0.02) {
    // 2% chance each frame
    shootingStars.push(createShootingStar());
  }
  requestAnimationFrame(addRandomShootingStar);
}

animate();
addRandomShootingStar();

const smokeContainer = document.getElementById("smoke-container");
const customCursor = document.getElementById("custom-cursor");

let prevX = 0;
let prevY = 0;
let lastParticleTime = 0;

function createSmokeParticle(x, y, dx, dy) {
  const particle = document.createElement("div");
  particle.className = "smoke-particle";

  const size = 20 + Math.random() * 20;

  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${x - size / 2}px`;
  particle.style.top = `${y - size / 2}px`;
  particle.style.opacity = 0.3 + Math.random() * 0.2;

  smokeContainer.appendChild(particle);

  // Force reflow
  particle.offsetWidth;

  // Calculate spread direction based on cursor movement
  const spreadX = dy * (Math.random() - 0.5) * 2; // Perpendicular to movement
  const spreadY = -dx * (Math.random() - 0.5) * 2; // Perpendicular to movement

  // Apply transform for spreading effect
  particle.style.transform = `translate(${spreadX}px, ${spreadY}px)`;

  setTimeout(() => {
    particle.style.opacity = "0";
    // Increase the spread over time
    particle.style.transform = `translate(${spreadX * 2}px, ${spreadY * 2}px)`;
  }, 50);

  setTimeout(() => {
    smokeContainer.removeChild(particle);
  }, 1550);
}

document.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;
  const currentTime = Date.now();

  customCursor.style.left = `${x - 5}px`;
  customCursor.style.top = `${y - 5}px`;

  const dx = x - prevX;
  const dy = y - prevY;
  const speed = Math.sqrt(dx * dx + dy * dy);

  if (currentTime - lastParticleTime > 10 && speed > 1) {
    for (let i = 0; i < 2; i++) {
      // Create 2 particles for a thicker trail
      createSmokeParticle(x, y, dx, dy);
    }
    lastParticleTime = currentTime;
  }

  prevX = x;
  prevY = y;
});

document.addEventListener("mouseleave", () => {
  customCursor.style.display = "none";
});

document.addEventListener("mouseenter", () => {
  customCursor.style.display = "block";
});

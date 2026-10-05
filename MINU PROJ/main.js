// ✅ IMPORTS
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// 🎬 SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0b2e);

// 📷 CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);

// 🖥 RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// 💡 LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// 🎮 CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);

// 🔒 ANIMATION FLAG
let isAnimating = false;

// 🎯 STORAGE
let seats = [];
let screen = null;

// 🎬 LOAD MODEL
const loader = new GLTFLoader();

loader.load("models/theatre.glb", (gltf) => {

  const model = gltf.scene;
  model.scale.set(3, 3, 3);
  model.position.set(0, -2, 0);

  scene.add(model);

  model.traverse((child) => {

    console.log(child.name);

    // 💺 DETECT SEATS
    if (child.isMesh && (
        child.name.toLowerCase().includes("seat") ||
        (child.parent && child.parent.name.toLowerCase().includes("seat"))
    )) {
      child.material = child.material.clone();
      seats.push(child);
    }

    // 🎬 DETECT SCREEN
    if (child.name.toLowerCase().includes("screen")) {

      screen = child;

      // 🔥 FORCE VISIBILITY
      child.material = new THREE.MeshBasicMaterial({
        color: 0xffffff
      });

      console.log("🎬 SCREEN FOUND:", child.name);
    }

  });

  console.log("✅ Seats found:", seats.length);

  // 🚨 IF SCREEN NOT FOUND → CREATE ONE
  if (!screen) {
    console.log("⚠️ No screen in model → creating one");

    const geometry = new THREE.PlaneGeometry(8, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    screen = new THREE.Mesh(geometry, material);
    screen.position.set(0, 3, -10);

    scene.add(screen);
  }

});

// 🖱 CLICK DETECTION
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener("click", (event) => {

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(seats);

  if (intersects.length > 0) {
    const seat = intersects[0].object;

    console.log("Clicked:", seat.name);

    moveToSeat(seat);

    seat.material.color.set(0xff0000);
  }
});
// 🎯 GET EXACT CENTER OF SCREEN
function getScreenCenter(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return center;
  }
// 🎥 POV CAMERA FUNCTION (IMPROVED)
function moveToSeat(seat) {

    const seatPos = new THREE.Vector3();
    seat.getWorldPosition(seatPos);
  
    // 🎥 YOUR CUSTOM POSITION (KEEP YOUR VALUES)
    const camPos = seatPos.clone();
    camPos.add(new THREE.Vector3(3.9, 0.17, 2.9)); // your offsets
  
    // 🎯 GET SEAT ROTATION
    const seatQuat = new THREE.Quaternion(92,0.17,93);
    seat.getWorldQuaternion(seatQuat);
  
    animateCamera(camPos, seatQuat);
  }

// 🎞 CAMERA ANIMATION
function animateCamera(targetPos, targetQuat) {

    isAnimating = true;
  
    const startPos = camera.position.clone();
    const startQuat = camera.quaternion.clone();
  
    const duration = 1200;
    const startTime = performance.now();
  
    function animate(time) {
  
      const t = Math.min((time - startTime) / duration, 1);
  
      // position
      camera.position.lerpVectors(startPos, targetPos, t);
  
      // rotation (SMOOTH!)
      THREE.Quaternion.slerp(startQuat, targetQuat, camera.quaternion, t);
  
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating = false;
      }
    }
  
    requestAnimationFrame(animate);
  }

// 🎥 LOOP
function animate() {
  requestAnimationFrame(animate);

  if (!isAnimating) controls.update();

  renderer.render(scene, camera);
}
animate();

// 📱 RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

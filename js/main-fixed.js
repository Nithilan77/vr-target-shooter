// Check if Three.js loaded
if (typeof THREE === 'undefined') {
  document.getElementById('loadingStatus').textContent = 'Error: Three.js failed to load';
  document.getElementById('loadingStatus').style.color = '#ff6666';
} else {
  document.getElementById('loadingStatus').textContent = 'Three.js loaded! Initializing game...';
}

// Basic scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222233);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// VR button (automatically shows "Enter VR" when available)
document.body.appendChild(THREE.VRButton.createButton(renderer));

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
hemi.position.set(0, 2, 0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(-1, 3, 2);
scene.add(dir);

// Floor
actionableFloor();
function actionableFloor() {
  const geo = new THREE.PlaneGeometry(20, 20);
  const mat = new THREE.MeshStandardMaterial({ color: 0x303030, roughness: 0.9, metalness: 0.0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

// Game state
const gameState = {
  score: 0,
  timeLeft: 60,
  targets: [],
  gameRunning: false,
  gameStarted: false
};

// Game elements
const targets = new THREE.Group();
scene.add(targets);

// Controller laser pointers
const laserGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -5)
]);
const laserMaterial = new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.6 });

// Controller handling
const controllerModelFactory = new THREE.XRControllerModelFactory();

const controller1 = renderer.xr.getController(0);
controller1.addEventListener('connected', (event) => onControllerConnected(event, 0));
controller1.addEventListener('disconnected', () => onControllerDisconnected(0));
controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
controller1.addEventListener('squeezestart', onSqueezeStart);
controller1.addEventListener('squeezeend', onSqueezeEnd);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
controller2.addEventListener('connected', (event) => onControllerConnected(event, 1));
controller2.addEventListener('disconnected', () => onControllerDisconnected(1));
controller2.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectend', onSelectEnd);
controller2.addEventListener('squeezestart', onSqueezeStart);
controller2.addEventListener('squeezeend', onSqueezeEnd);
scene.add(controller2);

// Controller grips for visible controller models
const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

const controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
scene.add(controllerGrip2);

// Add laser pointers to controllers
const laser1 = new THREE.Line(laserGeometry.clone(), laserMaterial.clone());
const laser2 = new THREE.Line(laserGeometry.clone(), laserMaterial.clone());
laser1.visible = false;
laser2.visible = false;
controller1.add(laser1);
controller2.add(laser2);

// Visual reticle on controllers (simple small sphere)
const tempSphere = new THREE.SphereGeometry(0.02, 8, 6);
const tempMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x002222, roughness: 0.4 });

controller1.add(new THREE.Mesh(tempSphere, tempMat.clone()));
controller2.add(new THREE.Mesh(tempSphere, tempMat.clone()));

// Store laser references for easy access
controller1.userData.laser = laser1;
controller2.userData.laser = laser2;

// Generic handlers
function onControllerConnected(event, index) {
  const status = document.getElementById('ctrlStatus');
  status.textContent = `controller ${index} connected (${event.data?.handedness || 'unknown'})`;
}
function onControllerDisconnected(index) {
  const status = document.getElementById('ctrlStatus');
  status.textContent = `controller ${index} disconnected`;
}

function onSelectStart(ev) {
  const controller = ev.target;
  
  if (!gameState.gameStarted) {
    startGame();
    return;
  }

  if (!gameState.gameRunning) return;

  // Show laser while shooting
  if (controller.userData.laser) {
    controller.userData.laser.visible = true;
  }

  // Raycast from controller to check for target hits
  shootAtTargets(controller);
}

function onSelectEnd(ev) {
  // Hide laser when not shooting
  const controller = ev.target;
  if (controller.userData.laser) {
    controller.userData.laser.visible = false;
  }
}

function onSqueezeStart(ev) {
  // Restart game
  if (gameState.gameStarted) {
    restartGame();
  }
}

function onSqueezeEnd() {}

// Game functions
function startGame() {
  gameState.gameStarted = true;
  gameState.gameRunning = true;
  gameState.score = 0;
  gameState.timeLeft = 60;
  
  // Clear existing targets
  while (targets.children.length > 0) {
    targets.remove(targets.children[0]);
  }
  
  updateUI();
  spawnTarget(); // Spawn first target
  
  // Start game timer
  gameTimer();
}

function restartGame() {
  // Clear targets
  while (targets.children.length > 0) {
    targets.remove(targets.children[0]);
  }
  
  document.getElementById('gameOver').style.display = 'none';
  startGame();
}

function gameTimer() {
  if (!gameState.gameRunning) return;
  
  gameState.timeLeft--;
  updateUI();
  
  if (gameState.timeLeft <= 0) {
    endGame();
    return;
  }
  
  // Randomly spawn new targets
  if (Math.random() < 0.3 && targets.children.length < 5) {
    spawnTarget();
  }
  
  setTimeout(gameTimer, 1000);
}

function endGame() {
  gameState.gameRunning = false;
  document.getElementById('finalScore').textContent = gameState.score;
  document.getElementById('gameOver').style.display = 'block';
}

function spawnTarget() {
  const targetGeo = new THREE.SphereGeometry(0.2, 12, 8);
  const targetMat = new THREE.MeshStandardMaterial({ 
    color: 0xff3333, 
    emissive: 0x331111,
    roughness: 0.3 
  });
  const target = new THREE.Mesh(targetGeo, targetMat);
  
  // Random position in front of player
  const angle = (Math.random() - 0.5) * Math.PI * 0.8; // -72 to +72 degrees
  const distance = 3 + Math.random() * 4; // 3-7 units away
  const height = 1 + Math.random() * 2; // 1-3 units high
  
  target.position.set(
    Math.sin(angle) * distance,
    height,
    -Math.cos(angle) * distance
  );
  
  target.userData.isTarget = true;
  target.userData.spawnTime = Date.now();
  targets.add(target);
  
  // Remove target after 8 seconds if not hit
  setTimeout(() => {
    if (target.parent) {
      targets.remove(target);
      updateUI();
    }
  }, 8000);
}

function shootAtTargets(controller) {
  // Create raycaster from controller position and direction
  const raycaster = new THREE.Raycaster();
  const controllerPos = new THREE.Vector3();
  const controllerDir = new THREE.Vector3(0, 0, -1);
  
  controller.getWorldPosition(controllerPos);
  controllerDir.applyQuaternion(controller.quaternion).normalize();
  
  raycaster.set(controllerPos, controllerDir);
  
  // Check intersections with targets
  const intersects = raycaster.intersectObjects(targets.children);
  
  if (intersects.length > 0) {
    const hitTarget = intersects[0].object;
    if (hitTarget.userData.isTarget) {
      // Hit! Remove target and add score
      targets.remove(hitTarget);
      gameState.score += 10;
      updateUI();
      
      // Spawn a new target
      if (gameState.gameRunning && Math.random() < 0.7) {
        spawnTarget();
      }
    }
  }
}

function updateUI() {
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('timer').textContent = gameState.timeLeft;
  document.getElementById('targetCount').textContent = targets.children.length;
}

// Animation loop and controller gamepad debugging info
renderer.setAnimationLoop(function (timestamp, frame) {
  updateControllers(frame);
  renderer.render(scene, camera);
});

function updateControllers(frame) {
  // show basic gamepad buttons/axes for inputSources
  const session = renderer.xr.getSession?.();
  if (!session) return;

  const statusEl = document.getElementById('ctrlStatus');
  const infos = [];
  session.inputSources.forEach((input, i) => {
    const handed = input.handedness || 'unknown';
    let info = `#${i} ${handed}`;
    if (input.gamepad) {
      const gp = input.gamepad;
      // show first 4 buttons as pressed/unpressed
      const btns = gp.buttons.map((b, idx) => (b.pressed ? `B${idx}:1` : `B${idx}:0`)).slice(0, 6).join(',');
      info += ` [${btns}]`;
      // show axes
      if (gp.axes && gp.axes.length > 0) {
        const axes = gp.axes.map((a) => a.toFixed(2)).slice(0, 4).join(',');
        info += ` axes(${axes})`;
      }
    }
    infos.push(info);
  });
  if (infos.length) statusEl.textContent = infos.join(' | ');
}

// Resize handling
window.addEventListener('resize', onWindowResize);
function updateLoadingStatus() {
  document.getElementById('loadingStatus').textContent = 'Game ready! Click VR button or pull trigger in VR to start.';
  document.getElementById('loadingStatus').style.color = '#66ff66';
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Helpful note: export scene for debugging in console
window.__scene = scene;

// Update loading status when everything is ready
setTimeout(updateLoadingStatus, 500);
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';

// --- Global Variables ---
let scene, camera, renderer, composer, clock, filmPass, bloomPass;
let sphereGroup, crystalSphere, energyCore;
let time = 0;
const replayButton = document.getElementById('replay-button');

const effectGroups = {
    galacticRift: new THREE.Group()
};
const effectData = {
    galacticRift: { isActive: false, phase: 'idle', duration: 0, shake: 0 }
};

// Theme definition with the blue/white color scheme
const galacticRiftTheme = {
    name: "Galactic Rift",
    effect: "galacticRift",
    colors: [new THREE.Color(0x00ffff), new THREE.Color(0xadd8e6), new THREE.Color(0xffffff)],
    coreColor: new THREE.Color(0x87cefa),
    edgeColor: new THREE.Color(0x00bfff)
};

// --- Main Functions ---

// Initializes the entire scene
function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);
    clock = new THREE.Clock();

    createStarfield();
    createCrystalSphere(4, 5);
    createEnergyCore();

    sphereGroup = new THREE.Group();
    sphereGroup.add(crystalSphere.particles, crystalSphere.wireframe, energyCore);
    scene.add(sphereGroup, effectGroups.galacticRift);

    // Setup post-processing effects (glow, film grain)
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.21;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.55;
    composer.addPass(bloomPass);
    filmPass = new FilmPass(0.2, 0.025, 648, false);
    composer.addPass(filmPass);

    setPalette(galacticRiftTheme);
    autoTriggerEffect();

    window.addEventListener('resize', onWindowResize);
    replayButton.addEventListener('click', handleReplay);
    
    animate();
}

// The main animation loop, called every frame
function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    time += dt;

    replayButton.disabled = effectData.galacticRift.isActive;

    if (effectData.galacticRift.shake > 0) {
        effectData.galacticRift.shake -= dt;
        camera.position.x += (Math.random() - 0.5) * 0.2;
        camera.position.y += (Math.random() - 0.5) * 0.2;
    }

    camera.position.x = Math.sin(time * 0.1) * 12;
    camera.position.z = Math.cos(time * 0.1) * 12;
    camera.lookAt(scene.position);

    sphereGroup.rotation.y += 0.0005;
    energyCore.rotation.y += 0.002;
    energyCore.rotation.x += 0.003;
    if (!['imploding', 'exploding'].includes(effectData.galacticRift.phase)) {
        energyCore.scale.setScalar(1 + Math.sin(time * 2) * 0.15);
    }

    applySparkle();
    if (effectData.galacticRift.isActive) animateGalacticRift(dt);

    composer.render();
}


// --- Scene Creation ---
function createStarfield() {
    const starfield = document.getElementById('starfield');
    starfield.innerHTML = ''; // Clear old stars on replay
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 1;
        star.className = 'star';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${Math.random() * 3 + 4}s`;
        starfield.appendChild(star);
    }
}

function createCrystalSphere(radius, detail) {
    const geo = new THREE.IcosahedronGeometry(radius, detail);
    const pos = geo.attributes.position.array;
    const pPos = [], pCol = [], tw = [];
    for (let i = 0; i < pos.length; i += 3) {
        pPos.push(pos[i], pos[i+1], pos[i+2]);
        pCol.push(0.2, 0.6, 1);
        tw.push(Math.random() < 0.2 ? Math.random() * 3 + 1 : 0);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    pg.setAttribute('color', new THREE.Float32BufferAttribute(pCol, 3));
    const pm = new THREE.PointsMaterial({
        vertexColors: true, size: 0.05, sizeAttenuation: true,
        transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const particles = new THREE.Points(pg, pm);
    const wm = new THREE.LineBasicMaterial({
        color: 0x4080ff, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending
    });
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geo), wm);
    crystalSphere = { particles, wireframe, twinkleFactors: tw };
}

function createEnergyCore() {
    const geo = new THREE.IcosahedronGeometry(0.65, 3);
    const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
    });
    energyCore = new THREE.Mesh(geo, mat);
}


// --- Effect Logic ---
function triggerGalacticRift(theme) {
    if (effectData.galacticRift.isActive) return;
    Object.assign(effectData.galacticRift, { isActive: true, phase: 'imploding', duration: 0 });
    const count = 5000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const uD = [];
    for (let i = 0; i < count; i++) {
        const c = theme.colors[i % theme.colors.length];
        col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
        uD.push({
            life: 2 + Math.random() * 2,
            velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
                .normalize().multiplyScalar(Math.random() * 10 + 5),
            rotationSpeed: (Math.random() - 0.5) * 0.02
        });
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    bg.userData = uD;
    const mat = new THREE.PointsMaterial({
        size: 0.1, vertexColors: true, blending: THREE.AdditiveBlending,
        transparent: true, opacity: 1, depthWrite: false
    });
    const nebula = new THREE.Points(bg, mat);
    nebula.visible = false;
    effectGroups.galacticRift.add(nebula);
}

function animateGalacticRift(dt) {
    const d = effectData.galacticRift;
    d.duration += dt;
    if (d.phase === 'imploding') {
        const p = Math.min(d.duration / 0.5, 1);
        sphereGroup.scale.setScalar(1 - p * 0.99);
        if (p >= 1) {
            d.phase = 'exploding';
            d.duration = 0;
            effectGroups.galacticRift.children[0].visible = true;
            d.shake = 0.3;
        }
    } else if (d.phase === 'exploding') {
        const neb = effectGroups.galacticRift.children[0];
        const posAttr = neb.geometry.attributes.position, uArr = neb.geometry.userData;
        uArr.forEach((pd, i) => {
            pd.life -= dt;
            if (pd.life > 0) {
                const vec = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
                vec.add(pd.velocity.clone().multiplyScalar(dt));
                vec.applyAxisAngle(pd.velocity, pd.rotationSpeed);
                posAttr.setXYZ(i, vec.x, vec.y, vec.z);
            }
        });
        posAttr.needsUpdate = true;
        const p2 = Math.min(d.duration, 1);
        sphereGroup.scale.setScalar(0.01 + p2 * 0.99);
        if (d.duration > 4) {
            d.phase = 'idle';
            d.isActive = false;
        }
    }
}

function applySparkle() {
    const colAttr = crystalSphere.particles.geometry.attributes.color;
    for (let i = 0; i < colAttr.count; i++) {
        if (crystalSphere.twinkleFactors[i] > 0) {
            const pulse = Math.sin(crystalSphere.twinkleFactors[i] * time + i * 0.1) * 0.5 + 0.5;
            const bright = 1 + pulse * 2.5;
            const c = galacticRiftTheme.colors[i % galacticRiftTheme.colors.length];
            colAttr.setXYZ(i, c.r * bright, c.g * bright, c.b * bright);
        }
    }
    colAttr.needsUpdate = true;
}


// --- Utility & Event Handlers ---
function setPalette(theme) {
    const colAttr = crystalSphere.particles.geometry.attributes.color;
    for (let i = 0; i < colAttr.count; i++) {
        const c = theme.colors[i % theme.colors.length];
        colAttr.setXYZ(i, c.r, c.g, c.b);
    }
    colAttr.needsUpdate = true;
    crystalSphere.wireframe.material.color.set(theme.edgeColor);
    energyCore.material.color.set(theme.coreColor);
}

function autoTriggerEffect() {
    triggerGalacticRift(galacticRiftTheme);
    bloomPass.strength = 2.5;
    setTimeout(() => bloomPass.strength = 1.2, 3500);
}

function handleReplay() {
    if (effectData.galacticRift.isActive) return;

    effectGroups.galacticRift.children.forEach(child => {
        child.geometry.dispose();
        child.material.dispose();
    });
    effectGroups.galacticRift.clear();

    sphereGroup.scale.setScalar(1);
    autoTriggerEffect();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// --- Start ---
init();
import {
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Shape,
  Path,
  ExtrudeGeometry,
  MeshPhongMaterial,
  Color,
  Vector3,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { LoopSubdivision } from 'three-subdivide';

let camera;
let scene;
let renderer;
let container;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

class App {
  init() {
    scene = new Scene();
    scene.background = new Color(0xf0f0f0);
    camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 150, 500);
    scene.add(camera);

    container = document.createElement('div');
    document.body.appendChild(container);

    const smileyShape = new Shape()
      .moveTo(80, 40)
      .absarc(40, 40, 40, 0, Math.PI * 2, false);

    const smileyEye1Path = new Path()
      .moveTo(35, 20)
      .absellipse(25, 20, 10, 10, 0, Math.PI * 2, true);

    const smileyEye2Path = new Path()
      .moveTo(65, 20)
      .absarc(55, 20, 10, 0, Math.PI * 2, true);

    const smileyMouthPath = new Path()
      .moveTo(20, 40)
      .quadraticCurveTo(40, 60, 60, 40)
      .bezierCurveTo(70, 45, 70, 50, 60, 60)
      .quadraticCurveTo(40, 80, 20, 60)
      .quadraticCurveTo(5, 50, 20, 40);

    smileyShape.holes.push(smileyEye1Path);
    smileyShape.holes.push(smileyEye2Path);
    smileyShape.holes.push(smileyMouthPath);

    const extrudeSettings = {
      depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1,
    };

    const extrudeGeometry = new ExtrudeGeometry(smileyShape, extrudeSettings);

    const extrudeMesh = new Mesh(
      extrudeGeometry,
      new MeshPhongMaterial({ color: 0xf000f0 }),
    );
    // scene.add(extrudeMesh);

    const sampler = new MeshSurfaceSampler(extrudeMesh).build();
    const positions = [];

    for (let i = 0; i < 100000; i++) {
      const position = new Vector3();
      sampler.sample(position);
      positions.push(position);
    }

    const array_z = getZ(positions);
    const mean_z = getMean(array_z);

    renderer = new WebGLRenderer({ antialias: true });
    new OrbitControls(camera, renderer.domElement);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);

    const positionAttribute = extrudeGeometry.attributes.position;
    console.log(JSON.stringify(positionAttribute));

    const iterations = 3;

    const params = {
      split: true, // optional, default: true
      uvSmooth: false, // optional, default: false
      preserveEdges: false, // optional, default: false
      flatOnly: false, // optional, default: false
      maxTriangles: Infinity, // optional, default: Infinity
    };

    const geometry = LoopSubdivision.modify(extrudeGeometry, iterations, params);

    // const geometry = new BufferGeometry();
    // geometry.setFromPoints(positions);

    const sampledMesh = new Mesh(
      geometry,
      new MeshPhongMaterial({ color: 0xf000f0 }),
    );

    scene.add(sampledMesh);

    animate();
  }
}

const getZ = (positions) => positions.map((position) => position.z);
const getMean = (values) => {
  const pointNumber = values.length;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / pointNumber;
};

export default App;

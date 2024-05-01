import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { GUI } from 'dat.gui';
// import Stats from 'stats-js';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

/**
* Classes
*/

// Utils
class Sizes {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
  
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
}

class Interval {
  constructor() {
    this.start = Date.now();
    this.current = this.start;
    this.delta = 16;
    this.elapse = 0;
  }
  
  update() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapse = this.current - this.start;
  }
}

class Tests {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    
    this.active = false //window.location.hash === "tests";
    
    if (this.active) {
      this.gui = new GUI();
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    }
  }
}

// Three.js Configurations
class Camera {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.sizes = this.app.sizes;
    this.canvas = this.app.canvas;
    
    this.setInstance();
    this.setOrbitControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.01, 1000);

    this.instance.position.set(0, 0, 25); //(0.01, 13, 0)
  }
  
  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }
  
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }
  
  update() {
    this.controls.update();
  }
}

class Renderer {
  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
    this.camera = this.app.camera;
    this.canvas = this.app.canvas;
    this.scene = this.app.scene;

    this.setInstance();
  }
  
  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.instance.physicallyCorrectLights = true;
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    //this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    //this.instance.toneMappingExposure = 1;
    this.instance.setClearColor('#edb06a');
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}


// Three.js Environment
class Card {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.interval = this.app.interval;
    
    this.setInstance();
    //this.setInnerElements();
  }
  
  setInstance() {
    this.planeSize = 10;
    this.planeSigments = 200;
    this.instanceGeometry = new THREE.BoxGeometry(this.planeSize, this.planeSize, 0.1, this.planeSigments, this.planeSigments);
    
    this.instanceMaterial = new CustomShaderMaterial({
      baseMaterial: THREE.MeshPhysicalMaterial,
      color: 0xffffff,
      metalness: 0,
      roughness: 0.2,
      transmission: 1,
      thickness: 0.4,
      clearcoat: 1,
      clearcoatRoughness: 0.5,
      sheen: 1,
      sheenRoughness: 0.9,
      sheenColor: 0xf4791d,
      wireframe: false,
      uniforms: {
        uTime: { value: 0 },
      },
      // side: THREE.DoubleSide,
      transparent: true,
      fragmentShader: `
        uniform float uTime;

        varying vec3 vPosition;

        float distored(vec3 point) {
          float time = uTime;
          
          vec3 displacedPoints = vec3(
            point.x + sin(point.y * 0.5 + time),
            sin(point.y * 10.0 + time),
            point.z
          );
          
          float strength = sin(displacedPoints.x * 10.0) * 0.5;
          strength *= smoothstep(3.8, 0.1, distance(point, vec3(0.0)));
          
          strength += sin(point.y + displacedPoints.x + time) * 0.5;

          return strength;
        }
        
        void main() {
          csm_DiffuseColor += vec4(vec3(distored(vPosition)), 1.0);
          csm_Roughness = distored(vPosition) * 1.2;
          csm_Bump = vec3(distored(vPosition));
        }
      `,
      vertexShader: `
        uniform float uTime;

        varying vec3 vPosition;
        
        float distored(vec3 point) {
          float time = uTime;
          
          vec3 displacedPoints = vec3(
            point.x + sin(point.y * 0.5 + time),
            sin(point.y * 10.0 + time),
            point.z
          );
          
          float strength = sin(displacedPoints.x * 10.0) * 0.5;
          strength *= smoothstep(3.8, 0.1, distance(point, vec3(0.0)));
          
          strength += sin(point.y + displacedPoints.x + time) * 0.5;

          return strength;
        }
        
        void main() {
          csm_Position.z = position.z + distored(position);
          
          vPosition = position;
        }
      `
    });
    
    this.instance = new THREE.Mesh(this.instanceGeometry, this.instanceMaterial);
    
    this.scene.add(this.instance);
  }
  
  update() {
    this.instanceMaterial.uniforms.uTime.value = this.interval.elapse / 1000;
  }
}

class Objects {
  constructor(count) {
    this.app = new App();
    this.scene = this.app.scene;
    
    this.setRandomObjects(count);
  }
  
  setRandomObjects(count) {
    const gltfLoader = new GLTFLoader();
    if (!this.textureLoader) {
      this.textureLoader = new THREE.TextureLoader();
    }

    const capA = this.textureLoader.load('./matcaps/1.png');
    capA.colorSpace = THREE.SRGBColorSpace;
    
    const capB = this.textureLoader.load('./matcaps/2.png');
    capB.colorSpace = THREE.SRGBColorSpace;
    
    const capC = this.textureLoader.load('./matcaps/3.png');
    capC.colorSpace = THREE.SRGBColorSpace;
    
    const capD = this.textureLoader.load('./matcaps/4.png');
    capD.colorSpace = THREE.SRGBColorSpace;
    
    const capE = this.textureLoader.load('./matcaps/5.png');
    capE.colorSpace = THREE.SRGBColorSpace;
    
    const capF = this.textureLoader.load('./matcaps/6.png');
    capF.colorSpace = THREE.SRGBColorSpace;
  
    const matcapA = new THREE.MeshMatcapMaterial({
      matcap: capA
    });
    const matcapB = new THREE.MeshMatcapMaterial({
      matcap: capB
    });
    const matcapC = new THREE.MeshMatcapMaterial({
      matcap: capC
    });
    const matcapD = new THREE.MeshMatcapMaterial({
      matcap: capD
    });
    const matcapE = new THREE.MeshMatcapMaterial({
      matcap: capE
    });
    const matcapF = new THREE.MeshMatcapMaterial({
      matcap: capF
    });
    
    gltfLoader.load('./models/objects.glb', (gltf) => {
      // Copying the materials
      const objects = [...gltf.scene.children];
      
      // Setting the objects into variables
      const capsule = objects[0];
      const sphere = objects[1];
      const halfTorus = objects[2];
      const halfCylinder = objects[3];
      const cube = objects[4];
      const cone = objects[5];
    
      // Setting the materials
      capsule.material = matcapA;
      sphere.children[0].material = matcapB;
      halfTorus.material = matcapF;
      halfCylinder.material = matcapD;
      cube.material = matcapE;
      cone.material = matcapC;
      
      sphere.material = new THREE.MeshPhysicalMaterial({
        color: 0xffc38e, 
        metalness: 0,
        roughness: 0.1,
        transmission: 1,
        thickness: 0.2
      });
      
      // Positioning the objects
      capsule.position.set(3, -3, 2);
      sphere.position.set(2, 1, 1);
      halfTorus.position.set(-3, 3, -2);
      halfCylinder.position.set(-0.3, -2, -1);
      cube.position.set(-3.5, -3.4, 3);
      cone.position.set(5, 3, -3);
      
      // Adding the objects to the scene
      for (let object of objects) {
        this.scene.add(object)
      }
    });
  }
  
  // Generates random spheres around the card
  /*
  setRandomObjects() {
    const count = 50;
    const objectsGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    
    let objects = [];
    
    for (let i = 0; i < count; i++) {
      const objectsMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`)
      });
      
      objects.push(new THREE.Mesh(
        objectsGeometry,
        objectsMaterial
      ));
      
      let zValue = Math.round((Math.random() - 0.5) * 4) * 2// * Math.random();
      
      if(zValue === 0) {
        zValue = -0.7;
      }
      
      objects[i].position.x = (Math.random() - 0.5) * 14;
      objects[i].position.y = (Math.random() - 0.5) * 9;
      objects[i].position.z = zValue;
      
      
      this.scene.add(objects[i]);
    }
  }//*/
}

class Lights {
  constructor() {
    this.app = new App();
    this.tests = this.app.tests;
    this.scene = this.app.scene;

    this.lightsColor = {
      a: '#0067ff',
      b: '#ff5577',
    };
    this.setDirectionalLights();
  }

  setDirectionalLights() {
    this.lightA = new THREE.DirectionalLight(this.lightsColor.a, 10);
    this.lightA.position.set(0, 0, -1);

    this.lightB = new THREE.DirectionalLight(this.lightsColor.b, 10);
    this.lightB.position.set(0, 0, 1);

    this.scene.add(this.lightA, this.lightB);
  }
}

class Universe {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.tests = this.app.tests;
    
    //this.lights = new Lights();
    this.card = new Card();
    this.objects = new Objects(10);
    this.light = new Lights();
  }

  update() {
    this.card.update();
  }
}


// Main Class (The Manager)
class App {
  constructor(canvas) {
  
    // Global variable 
    // window.app = this; // indeed not in need
    
    if(instance)
    {
      return instance;
    }
    instance = this;
    
    console.log(THREE.ColorManagement)

    // Parameters 
    this.canvas = canvas;
    
    // Fetching Utils
    this.tests = new Tests();
    this.sizes = new Sizes();
    this.interval = new Interval();
    
    // Fetching Three.js Configurations 
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    
    // Fitching Three.js Environment 
    this.universe = new Universe();
    
    // Calling Methods
    window.addEventListener("resize", () => {
      this.resize();
    });
    requestAnimationFrame(() => {
      this.update();
    });
    
    // Finall Log
    console.log("The App is ready!")
  }
  
  // Called once the page is resized
  resize() {
    this.sizes.resize();
    this.camera.resize();
    this.renderer.resize();
  }
  
  // Called every frame (60fps)
  update() {
    //this.tests.stats.begin();
    this.interval.update();
    this.camera.update();
    this.renderer.update();
    this.universe.update();
    requestAnimationFrame(() => {
      this.update();
    });
    //this.tests.stats.end();
  }
}



/*
** Variables
*/
const canvas = document.getElementById("webgl");

let instance = null;
const app = new App(canvas);

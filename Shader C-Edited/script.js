
/**
 * Classes
 */

// Utils
class Sizes {
  constructor(canvas) {
    this.canvas = canvas;

    window.addEventListener('dblclick', this.fullScreen);

    this.setSizes();
    this.getCursorLocation();
    this.getMobileOrentation();
  }

  setSizes() {
    // this.width = this.canvas.clientWidth; // not resizable
    // this.height = this.canvas.clientHeight; // not resizable
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }

  resize() {
    this.setSizes();
  }

  fullScreen() {
    if (!document.fullscreenElement) {
      document.querySelector('html').requestFullscreen();
    }
  }

  getCursorLocation() {
    this.mouseLocation = {
      x: 0,
      y: 0,
    };

    window.addEventListener('mousemove', (event) => {
      this.mouseLocation.x = event.clientX / this.width;
      this.mouseLocation.y = -event.clientY / this.height + 1;
    });

    return this.mouseLocation;
  }

  getMobileOrentation() {
    this.gyro = {
      x: 0,
      y: 0,
    };

    window.addEventListener('deviceorientation', (event) => {
      this.gyro.x = (-event.gamma / 90) * 4;
      this.gyro.y = (event.beta / 90) * 2;
      // The alpha (gyro.z) is not usable
      // this.gyro.z = event.alpha;
    });
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

    this.active = true; //window.location.hash === "tests";

    if (this.active) {
      this.gui = new dat.GUI();
      this.gui.close();
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
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.01,
      1000,
    );

    this.instance.position.set(4, 4, 4);
  }

  setOrbitControls() {
    this.controls = new THREE.OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enabled = true;
    this.controls.enablePan = false;

    this.controls.autoRotate = true;

    this.controls.maxDistance = 10;
    this.controls.minDistance = 2;
    this.controls.maxPolarAngle = Math.PI * 0.48;
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
    this.setEnvMap();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      
    });
    // this.instance.outputColorSpace = THREE.SRGBColorSpace;
    // this.instance.toneMapping = THREE.CineonToneMapping;
    // this.instance.toneMappingExposure = 1.75;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.instance.setClearColor('#444444');
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }
  
  setEnvMap() {
    this.loadingManager = new THREE.LoadingManager(
      () => {
        // do nothing
      },
      (itemUrl, itemsLoaded, itemsTotal) => {
        // 15 is more acurate than itemsTotal, yet not dynamic has the model been changed
        this.loadingTime = Math.floor(itemsLoaded / itemsTotal * 100);
        console.log(`Loading CubeMap ${this.loadingTime}`);
      }
    );
    this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);

    this.envMap = this.cubeTextureLoader.load([
      `./envMap/F/px.png`,
      './envMap/F/nx.png',
      './envMap/F/py.png',
      './envMap/F/ny.png',
      './envMap/F/pz.png',
      './envMap/F/nz.png'
    ]);
    this.scene.environment = this.envMap;
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
class HolographPlane {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.interval = this.app.interval;
    this.sizes = this.app.sizes;
    this.tests = this.app.tests;
    this.renderer = this.app.renderer;

    this.envMap = this.renderer.envMap;
    this.envMapOption = 'F';

    this.details = 25; // Change this to have better details or hit a limit!

    this.setPlane();
    this.setTrailingPlane();
    if (this.tests.active) {
      this.setTests();
    }
  }

  setPlane() {
    const GEOMETRY_SIGMENTS = this.details * 10;
    const GEOMETRY_SIZE = 3;
    /* // #TODO: Make things work with the GUI
    // dispose of old value, if any
    if (this.plane) {
      this.planeGeometry.dispose();
      this.planeMaterial.dispose();
      this.scene.remove(this.plane);
    }
    */
    this.planeGeometry = new THREE.PlaneGeometry(
      GEOMETRY_SIZE,
      GEOMETRY_SIZE,
      GEOMETRY_SIGMENTS,
      GEOMETRY_SIGMENTS,
    );

    this.uniforms = {
      uTime: { value: 0 },
      uElevation: { value: 0.2 },
      uSpeed: { value: 20 },
      uLayers: { value: 10 },
      uXAmplitude: { value: 0.04 },
      uXFrequency: { value: 20 },
      uYAmplitude: { value: 0.04 },
      uYFrequency: { value: 20 },
      uBomber: { value: 0.45 },
      uBomberFade: { value: 2 },
      uWaveXSpeed: { value: 3.8 },
      uWaveYSpeed: { value: 10.2 },
      uWaveThickness: { value: 5 },
      uWaveAmplitude: { value: 0.5 },
      uWaveFade: { value: 1.5 },
      uSize: { value: GEOMETRY_SIZE },
      uSigments: { value: GEOMETRY_SIGMENTS },
    };

    this.planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.35,
      metalness: 0.9,
      envMapIntensity: 2,
    });
    
    this.planeMaterial.onBeforeCompile = (shader) => {
      // Didn't set shader.uniforms directly as that will couse errors
      shader.uniforms.uTime = this.uniforms.uTime;
      shader.uniforms.uElevation = this.uniforms.uElevation;
      shader.uniforms.uSpeed = this.uniforms.uSpeed;
      shader.uniforms.uLayers = this.uniforms.uLayers;
      shader.uniforms.uXAmplitude = this.uniforms.uXAmplitude;
      shader.uniforms.uXFrequency = this.uniforms.uXFrequency;
      shader.uniforms.uYAmplitude = this.uniforms.uYAmplitude;
      shader.uniforms.uYFrequency = this.uniforms.uYFrequency;
      shader.uniforms.uBomber = this.uniforms.uBomber;
      shader.uniforms.uBomberFade = this.uniforms.uBomberFade;
      shader.uniforms.uWaveXSpeed = this.uniforms.uWaveXSpeed;
      shader.uniforms.uWaveYSpeed = this.uniforms.uWaveYSpeed;
      shader.uniforms.uWaveThickness = this.uniforms.uWaveThickness;
      shader.uniforms.uWaveAmplitude = this.uniforms.uWaveAmplitude;
      shader.uniforms.uWaveFade = this.uniforms.uWaveFade;
      shader.uniforms.uSize = this.uniforms.uSize;
      shader.uniforms.uSigments = this.uniforms.uSigments;
      
      // Vertex Pars
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `
        #include <common>
        ${wavesParsVert}
        varying vec3 vPosition;
      `);
      
      // Vertex Main
      shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', `
        ${wavesMainVert}
        
        #include <uv_vertex>
      `);
      
      // Vertex Normals
      shader.vertexShader = shader.vertexShader.replace('#include <defaultnormal_vertex>', `
        ${wavesNormals}
      `);
      
      // Vertex Displacement Map
      shader.vertexShader = shader.vertexShader.replace('#include <displacementmap_vertex>', `
        ${wavesDisplacement}
      `);
    };

    this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
    this.plane.rotation.x = -Math.PI * 0.5;

    this.scene.add(this.plane);
  }

  setTrailingPlane() {
    this.trailingPlaneGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    this.trailingPlaneMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: this.planeMaterial.roughness,
      metalness: this.planeMaterial.metalness,
      envMapIntensity: this.plane.material.envMapIntensity,
    });
    
    this.trailingPlane = new THREE.Mesh(
      this.trailingPlaneGeometry,
      this.trailingPlaneMaterial
    );
    this.trailingPlane.position.y = -0.1;
    this.trailingPlane.rotation.x = -Math.PI * 0.5;
    
    this.scene.add(this.trailingPlane);
  }

  setTests() {
    this.tests.shader = this.tests.gui.addFolder('Shader');
    this.tests.material = this.tests.gui.addFolder('Material');
    this.tests.strength = this.tests.shader.addFolder('BaseCircles');
    this.tests.bomber = this.tests.shader.addFolder('BeatBomber');
    this.tests.waver = this.tests.shader.addFolder('HorizontalWaves');

    this.tests.material
      .add(this.planeMaterial, 'roughness', 0, 1, 0.01)
      .onChange(() => {
        this.trailingPlaneMaterial.roughness = this.planeMaterial.roughness; 
      })
      .name('Roughness');
    this.tests.material
      .add(this.planeMaterial, 'metalness', 0, 1, 0.01)
      .onChange(() => {
        this.trailingPlaneMaterial.metalness = this.planeMaterial.metalness; 
      })
      .name('Metalness');
    this.tests.material
      .add(this.planeMaterial, 'envMapIntensity', 0, 2, 0.01)
      .onChange(() => {
        this.trailingPlaneMaterial.envMapIntensity = this.planeMaterial.envMapIntensity; 
      })
      .name('EnvLighyIntensity');
    this.tests.material
      .add(this.trailingPlane, 'visible')
      .name('TrailingPlane');
    this.tests.material
      .add(this, 'envMapOption', {
        EnvironmentA: 'A',
        EnvironmentB: 'B',
        EnvironmentC: 'C',
        EnvironmentD: 'D',
        EnvironmentE: 'E',
        EnvironmentF: 'F',
        EnvironmentG: 'G',
      })
      .onChange(() => {
        this.envMap = this.renderer.cubeTextureLoader.load([
          `./envMap/${this.envMapOption}/px.png`,
          `./envMap/${this.envMapOption}/nx.png`,
          `./envMap/${this.envMapOption}/py.png`,
          `./envMap/${this.envMapOption}/ny.png`,
          `./envMap/${this.envMapOption}/pz.png`,
          `./envMap/${this.envMapOption}/nz.png`
        ]);
                
        this.scene.environment = this.envMap;
      });

    this.tests.strength
      .add(this.uniforms.uElevation, 'value', 0, 2, 0.001)
      .name('Elevation');
    this.tests.strength
      .add(this.uniforms.uSpeed, 'value', 0, 50, 1)
      .name('Speed');
    this.tests.strength
      .add(this.uniforms.uLayers, 'value', 0, 50, 0.1)
      .name('Layers');
    this.tests.strength
      .add(this.uniforms.uXAmplitude, 'value', 0, 0.2, 0.001)
      .name('XAmplitude');
    this.tests.strength
      .add(this.uniforms.uXFrequency, 'value', 0, 100, 0.001)
      .name('XFrequency');
    this.tests.strength
      .add(this.uniforms.uYAmplitude, 'value', 0, 0.2, 0.001)
      .name('YAmplitude');
    this.tests.strength
      .add(this.uniforms.uYFrequency, 'value', 0, 100, 0.001)
      .name('YFrequency');

    this.tests.bomber
      .add(this.uniforms.uBomber, 'value', 0, 2, 0.1)
      .name('Bomber');
    this.tests.bomber
      .add(this.uniforms.uBomberFade, 'value', 1, 11, 0.1)
      .name('Fade');

    this.tests.waver
      .add(this.uniforms.uWaveXSpeed, 'value', 0, 50, 1)
      .name('MovementSpeed');
    this.tests.waver
      .add(this.uniforms.uWaveYSpeed, 'value', 0, 50, 1)
      .name('DeformationSpeed');
    this.tests.waver
      .add(this.uniforms.uWaveThickness, 'value', 0, 20, 0.1)
      .name('Thickness');
    this.tests.waver
      .add(this.uniforms.uWaveAmplitude, 'value', 0, 3, 0.001)
      .name('Amplitude');
    this.tests.waver
      .add(this.uniforms.uWaveFade, 'value', 1, 10, 0.1)
      .name('Fade');

    /* // #TODO: Make those work
    this.tests.strength
      .add(this, 'details', 1, 128, 1)
      .name('GeometryDetails')
      .onFinishChange(() => {
        this.setPlane();
      });
    this.tests.strength
      .add(this.planeMaterial, 'wireframe')
      .onChange(() => {
        
      });
    */
  }

  update() {
    this.uniforms.uTime.value = this.interval.elapse * 0.0001;
    //this.uniforms.uMouseX.value += (this.sizes.mouseLocation.x - this.uniforms.uMouseX.value) * 0.005;
    //this.uniforms.uMouseY.value += (this.sizes.mouseLocation.y - this.uniforms.uMouseY.value) * 0.005;
  }
}

class Lights {
  constructor() {
    this.app = new App();
    this.tests = this.app.tests;
    this.scene = this.app.scene;

    this.lightsColor = {
      a: '#00cfff',
      b: '#ff4d00',
    };

    //this.ambient = new THREE.AmbientLight(this.lightsColor.ambient, );
    //this.scene.add(this.ambient);

    this.setDirectionalLights();

    if (this.tests.active) {
      this.setTests();
    }
  }

  setDirectionalLights() {
    this.lightA = new THREE.DirectionalLight(this.lightsColor.a, 20);
    this.lightA.position.set(-1.2, 1, 1.9);

    this.lightB = new THREE.DirectionalLight(this.lightsColor.b, 4);
    this.lightB.position.set(1.3, 1, -1);

    this.scene.add(this.lightA, this.lightB);
  }

  setTests() {
    this.tests.lights = this.tests.gui.addFolder('Lights');

    this.tests.lights
      .addColor(this.lightsColor, 'a')
      .onChange(() => {
        this.lightA.color.set(this.lightsColor.a);
      })
      .name('LightA');
    this.tests.lights
      .add(this.lightA, 'intensity', 0, 20, 0.001)
      .name('LightAIntensity');
    this.tests.lights
      .add(this.lightA.position, 'x', -10, 10, 0.1)
      .name('LightAX');
    this.tests.lights
      .add(this.lightA.position, 'y', -10, 10, 0.1)
      .name('LightAY');
    this.tests.lights
      .add(this.lightA.position, 'z', -10, 10, 0.1)
      .name('LightAZ');

    this.tests.lights
      .addColor(this.lightsColor, 'b')
      .onChange(() => {
        this.lightB.color.set(this.lightsColor.b);
      })
      .name('LightB');
    this.tests.lights
      .add(this.lightB, 'intensity', 0, 20, 0.001)
      .name('LightBIntensity');
    this.tests.lights
      .add(this.lightB.position, 'x', -10, 10, 0.1)
      .name('LightBX');
    this.tests.lights
      .add(this.lightB.position, 'y', -10, 10, 0.1)
      .name('LightBY');
    this.tests.lights
      .add(this.lightB.position, 'z', -10, 10, 0.1)
      .name('LightBZ');
  }
}

class World {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.tests = this.app.tests;

    this.holograph = new HolographPlane();
    this.lights = new Lights();
  }

  update() {
    this.holograph.update();
  }
}

// Main HTML UI
class UserInteractions {
  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
  }
}

// Main Class (The Manager)
class App {
  constructor(canvas) {
    // Global variable
    // window.app = this; // indeed not in need

    if (instance) {
      return instance;
    }
    instance = this;

    // Parameters
    this.canvas = canvas;

    // Fetching Utils
    this.tests = new Tests();
    this.sizes = new Sizes(this.canvas);
    this.interval = new Interval();

    // Fetching Three.js Configurations
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();

    // Fitching Three.js Environment
    this.world = new World();

    // UI
    this.ui = new UserInteractions();

    // Calling Methods
    window.addEventListener('resize', () => {
      this.resize();
    });
    requestAnimationFrame(() => {
      this.update();
    });

    // Finall Log
    console.log('Using Three.js Verizon:', THREE.REVISION);
  }

  // Called once the page is resized
  resize() {
    this.sizes.resize();
    this.camera.resize();
    this.renderer.resize();
    this.world.update();
  }

  // Called every frame (60fps)
  update() {
    if (this.tests.active) {
      this.tests.stats.begin();
      this.interval.update();
      this.camera.update();
      this.renderer.update();
      this.world.update();
      requestAnimationFrame(() => {
        this.update();
      });
      this.tests.stats.end();
    } else {
      this.interval.update();
      this.camera.update();
      this.renderer.update();
      this.world.update();
      requestAnimationFrame(() => {
        this.update();
      });
    }
  }
}

/*
 ** Variables
 */
const canvas = document.getElementById('webgl');

let instance = null;
const app = new App(canvas);

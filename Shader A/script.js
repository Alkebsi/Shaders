/* 
 * Note: The structure of the code is using classes,
 * yet no js modules are used. Classes will remain
 * a clear order, so don't scramble it, please.
 */

/**
* Classes
*/

// Utils
class Sizes {
  constructor() {
    this.resize();
    
    window.addEventListener('dblclick', this.fullScreen);
    this.setSizes();
    this.getCursorLocation();
    this.getMobileOrentation();
  }

  setSizes() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }

  resize() {
    this.setSizes();
  }

  fullScreen() {
    if (!document.fullscreenElement) {
      document.querySelector("html").requestFullscreen();
    }
  }

  getCursorLocation() {
    this.mouseLocation = {
      x: 0,
      y: 0,
    };

    window.addEventListener("mousemove", (event) => {
      this.mouseLocation.x = (event.clientX / this.width);
      this.mouseLocation.y = (-event.clientY / this.height) + 1;
    });

    return this.mouseLocation;
  }

  getMobileOrentation() {
    this.gyro = {
      x: 0,
      y: 0,
    };

    window.addEventListener("deviceorientation", (event) => {
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
    
    this.active = true //window.location.hash === "tests";
    
    if (this.active) {
      this.gui = new dat.GUI();
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
    
    this.instance.position.set(0, 4, 0);
  }
  
  setOrbitControls() {
    this.controls = new THREE.OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enabled = true;
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
    // this.instance.outputColorSpace = THREE.SRGBColorSpace;
    // this.instance.toneMapping = THREE.CineonToneMapping;
    // this.instance.toneMappingExposure = 1.75;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setClearColor('#000000');
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
class HolographPlane {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.interval = this.app.interval;
    this.sizes = this.app.sizes;
    this.tests = this.app.tests;
    
    this.details = 64; // Change this to have better details or hit a limit!
    
    this.setPlane();
    this.setTrailingPlane();
    if (this.tests.active) {
      this.setPlaneTests();
    }
  }
  
  setPlane() {
    const GEOMETRY_SIGMENTS = 16 * this.details;
    /* // #TODO: Make things work with the GUI
    // dispose of old value, if any
    if (this.plane) {
      this.planeGeometry.dispose();
      this.planeMaterial.dispose();
      this.scene.remove(this.plane);
    }
    */
    this.planeGeometry = new THREE.PlaneGeometry(3, 3, GEOMETRY_SIGMENTS, GEOMETRY_SIGMENTS);
    this.planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.4
    });
    
    this.uniforms = {
      uTime: { value: 0 },
      uMovementSpeedX: { value: 0 },
      uMovementSpeedY: { value: 0 },
      uNoiseSpeed: { value: 4.37 },
      uNoiseSize: { value: 0.96 },
      uNoiseStrength: { value: 0.46 },
      uDistancePower: { value: 9.54 },
      uDistanceMultiplier: { value: 0.2 },
      uMouseX: { value: 0.5 },
      uMouseY: { value: 0.5 }
    }
    
    this.planeMaterial.onBeforeCompile = (shader) => {
      // Didn't set shader.uniforms directly as that will couse errors
      shader.uniforms.uTime = this.uniforms.uTime;
      shader.uniforms.uMovementSpeedX = this.uniforms.uMovementSpeedX;
      shader.uniforms.uMovementSpeedY = this.uniforms.uMovementSpeedY;
      shader.uniforms.uNoiseSpeed = this.uniforms.uNoiseSpeed;
      shader.uniforms.uNoiseSize = this.uniforms.uNoiseSize;
      shader.uniforms.uNoiseStrength = this.uniforms.uNoiseStrength;
      shader.uniforms.uDistancePower = this.uniforms.uDistancePower;
      shader.uniforms.uDistanceMultiplier = this.uniforms.uDistanceMultiplier;
      shader.uniforms.uMouseX = this.uniforms.uMouseX;
      shader.uniforms.uMouseY = this.uniforms.uMouseY;
      
      // Vertex Pars
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `
        #include <common>
        ${planeParsVert}
      `);
      
      // Vertex Main
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        ${planeMainVert}
      `);
      
      // Fragment Pars
      shader.fragmentShader = shader.fragmentShader.replace('#include <bumpmap_pars_fragment>', `
        #include <bumpmap_pars_fragment>
        ${planeParsFrag}
      `);
      
      // Fragment Main
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `
        #include <normal_fragment_maps>
        ${planeMainFrag}
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
      roughness: 0.4
    });
    
    this.trailingPlane = new THREE.Mesh(
      this.trailingPlaneGeometry,
      this.trailingPlaneMaterial
    );
    this.trailingPlane.position.y = -0.1;
    this.trailingPlane.rotation.x = -Math.PI * 0.5;
    
    this.scene.add(this.trailingPlane);
  }
  
  setPlaneTests() {
    this.tests.shader = this.tests.gui.addFolder('Shaders');
    this.tests.speed = this.tests.shader.addFolder('Speed');
    
    this.tests.speed
      .add(this.uniforms.uMovementSpeedX, 'value', 0, 10, 0.01)
      .name('XMovement');
    this.tests.speed
      .add(this.uniforms.uMovementSpeedY, 'value', 0, 10, 0.01)
      .name('YMovement');
    this.tests.speed
      .add(this.uniforms.uNoiseSpeed, 'value', 0, 50, 0.01)
      .name('Noise');
    
    this.tests.shader
      .add(this.uniforms.uNoiseSize, 'value', 0, 3, 0.0001)
      .name('NoiseSize');
    this.tests.shader
      .add(this.uniforms.uNoiseStrength, 'value', 0, 5, 0.01)
      .name('NoiseStrength');
    this.tests.shader
      .add(this.uniforms.uDistancePower, 'value', 0, 20, 0.01)
      .name('DistancePower');
    this.tests.shader
      .add(this.uniforms.uDistanceMultiplier, 'value', 0, 10, 0.01)
      .name('DistanceMultiplier');
    
    /* // #TODO: Make those work
    this.tests.shader
      .add(this, 'details', 1, 128, 1)
      .name('GeometryDetails')
      .onFinishChange(() => {
        this.setPlane();
      });
    this.tests.shader
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
      a: '#7db7ff',
      b: '#ff5aa2',
      ambient: '#ffffff'
    };
    
    this.AreaLightsEnabled = false;
    
    //this.ambient = new THREE.AmbientLight(this.lightsColor.ambient, );
    //this.scene.add(this.ambient);
    
    this.setLightType();
    
    if (this.tests.active) {
      this.setTests();
    }
  }
  
  setLightType() {
    if (this.AreaLightsEnabled) {
      //this.setAreaLights();
    } else {
      this.setDirectionalLights();
    }
  }
  
  setDirectionalLights() {
    this.lightA = new THREE.DirectionalLight(this.lightsColor.a, 3.61);
    this.lightA.position.set(3.3, 8, -2.6);
    
    this.lightB = new THREE.DirectionalLight(this.lightsColor.b, 6.4);
    this.lightB.position.set(-4.8, 10, 10);
    
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
    
    if(instance)
    {
      return instance;
    }
    instance = this;
  
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
    this.world = new World();
    
    // UI
    this.ui = new UserInteractions();
    
    // Calling Methods
    window.addEventListener("resize", () => {
      this.resize();
    });
    requestAnimationFrame(() => {
      this.update();
    });
    
    // Finall Log
    console.log("Using Three.js Verizon:", THREE.REVISION)
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
const canvas = document.getElementById("webgl");

let instance = null;
const app = new App(canvas);

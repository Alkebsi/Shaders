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
    
    this.getCursorLocation();
    this.getMobileOrentation();
    window.addEventListener('dblclick', this.fullScreen);
  }
  
  resize() {
    this.canvasSize = window.innerHeight;
    
    this.width = window.innerWidth;
    this.height = window.innerHeight; 
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
  
  getCursorLocation() {
    this.mouseLocation = {
      x: 0,
      y: 0,
    };

    window.addEventListener("mousemove", (event) => {
      this.mouseLocation.x = -event.clientX / window.innerWidth * 0.25;
      this.mouseLocation.y = -(event.clientY / window.innerHeight - 0.5) * 0.5;
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
  
  fullScreen() {
    if (!document.fullscreenElement) {
      document.querySelector("html").requestFullscreen();
    }
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
    this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.01, 100);
    
    this.instance.position.set(10, 5, 5);
    //this.instance.rotation.set(-Math.PI / 2, 0, 0);
    
    this.instanceGroup = new THREE.Group();
    
    this.instanceGroup.add(this.instance);
    this.scene.add(this.instanceGroup);
  }
  
  setOrbitControls() {
    this.controls = new THREE.OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }
  
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }
  
  update() {
    //this.instanceGroup.position.x += (this.sizes.mouseLocation.x - this.instanceGroup.position.x) * 0.05;
    //this.instanceGroup.position.z += (this.sizes.mouseLocation.y - this.instanceGroup.position.z) * 0.05;
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
      antialias: true,
      alpha: true
    });
    //this.instance.outputColorSpace = THREE.SRGBColorSpace;
    // this.instance.toneMapping = THREE.CineonToneMapping;
    // this.instance.toneMappingExposure = 1.75;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.instance.setClearColor('#000000');
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
class Waves {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.interval = this.app.interval;
    this.sizes = this.app.sizes;
    this.tests = this.app.tests;
    
    this.setSphere();
    if (this.tests.active) {
      this.setTests();
    }
  }
  
  setSphere() {
    const GEOMETRY_SIGMENTS = 512 * 2; // Add this line to have more details or hit a limit
    
    this.sphereGeometry = new THREE.SphereGeometry(
      1.5, 
      GEOMETRY_SIGMENTS, 
      GEOMETRY_SIGMENTS,
      //0,
      //Math.PI,
      //0,
      //Math.PI
    );
    
    this.sphereInfo = {
      color: 0xffffff
    }
    
    this.uniforms = {
      uTime: { value: 0 },
      uWaveHeight: { value: 0.2 },
      uWaveFreq: { value: 5 },
      uWaveAmplitude: { value: 1 },
      uWaveSpeed: { value: 1 },
    };
    
    this.sphereMaterial = new THREE.MeshStandardMaterial({
      color: this.sphereInfo.color,
      roughness: 0.3, 
      metalness: 1
    });
    
    this.sphereMaterial.onBeforeCompile = (shader) => {
      // Didn't set shader.uniforms directly as that will couse errors
      shader.uniforms.uTime = this.uniforms.uTime;
      shader.uniforms.uWaveHeight = this.uniforms.uWaveHeight;
      shader.uniforms.uWaveFreq = this.uniforms.uWaveFreq;
      shader.uniforms.uWaveAmplitude = this.uniforms.uWaveAmplitude;
      shader.uniforms.uWaveSpeed = this.uniforms.uWaveSpeed;
      
      // Vertex Pars
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `
        #include <common>
        ${wavesParsVert}
      `);
      
      // Vertex Main
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        ${wavesMainVert}
      `);
      
      // Fragment Pars
      shader.fragmentShader = shader.fragmentShader.replace('#include <bumpmap_pars_fragment>', `
        #include <bumpmap_pars_fragment>
        ${wavesParsFrag}
      `);
      
      // Fragment Main
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `
        #include <normal_fragment_maps>
        ${wavesMainFrag}
      `);
    };
    
    this.sphere = new THREE.Mesh(
      this.sphereGeometry,
      this.sphereMaterial
    );
    
    //this.sphere.rotation.y = -Math.PI * 0.5;    
    
    this.scene.add(this.sphere);
  }
  
  setTests() {
    this.tests.shader = this.tests.gui.addFolder('Shader');
    
    this.tests.shader
      .addColor(this.sphereInfo, 'color')
      .onChange(() => {
        this.sphereMaterial.color.set(this.sphereInfo.color);
      })
      .name('SphereColor');
    this.tests.shader
      .add(this.sphereMaterial, 'roughness', 0, 1, 0.001)
      .name('Roughness');
    this.tests.shader
      .add(this.sphereMaterial, 'metalness', 0, 1, 0.001)
      .name('Metalness');
    this.tests.shader
      .add(this.uniforms.uWaveHeight, 'value', 0, 1, 0.001)
      .name('WaveHeight');
    this.tests.shader
      .add(this.uniforms.uWaveFreq, 'value', 0, 10, 0.001)
      .name('WaveFrequency');
    this.tests.shader
      .add(this.uniforms.uWaveAmplitude, 'value', 0, 5, 0.001)
      .name('WaveAmplitude');
    this.tests.shader
      .add(this.uniforms.uWaveSpeed, 'value', 0, 5, 0.001)
      .name('WaveSpeed');
  }
  
  update() {
    this.uniforms.uTime.value = this.interval.elapse / 1000;
  }
}

class Lights {
  constructor() {
    this.app = new App();
    this.tests = this.app.tests;
    this.scene = this.app.scene;
    
    this.lightsColor = {
      a: '#7db7ff',
      b: '#ff5aa2'
    };
    
    this.AreaLightsEnabled = false;
    
    this.ambient = new THREE.AmbientLight(0xffffff, 0.1);
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
    this.lightA = new THREE.DirectionalLight(this.lightsColor.a, 11.2);
    this.lightA.position.set(2.9, 4.9, -2.6);
    
    this.lightB = new THREE.DirectionalLight(this.lightsColor.b, 8.7);
    this.lightB.position.set(7.1, 7.3, 10);
    
    this.scene.add(this.lightA, this.lightB);
  }
  
  setTests() {
    this.tests.lights = this.tests.gui.addFolder('Lights');
    /*
    this.tests.lights
      .addColor(this.lightsColor, 'a')
      .onChange(() => {
        this.lightA.color.set(this.lightsColor.a);
      })
      .name('LightA');
    this.tests.lights
      .add(this.lightA, 'intensity', 0, 20, 0.001)
      .name('LightAIntensity');
    */
    this.tests.lights
      .add(this.lightA.position, 'x', -10, 10, 0.1)
      .name('LightAX');
    this.tests.lights
      .add(this.lightA.position, 'y', -10, 10, 0.1)
      .name('LightAY');
    this.tests.lights
      .add(this.lightA.position, 'z', -10, 10, 0.1)
      .name('LightAZ');
    /* 
    this.tests.lights
      .addColor(this.lightsColor, 'b')
      .onChange(() => {
        this.lightB.color.set(this.lightsColor.b);
      })
      .name('LightB');
    this.tests.lights
      .add(this.lightB, 'intensity', 0, 20, 0.001)
      .name('LightBIntensity');
    */
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
    
    this.waves = new Waves();
    //this.holograph = new HolographPlane();
    this.lights = new Lights();
  }
  
  update() {
    //this.holograph.update();
    this.waves.update();
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
    this.sizes = new Sizes(this.canvas);
    this.interval = new Interval();
    
    // Fetching Three.js Configurations 
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    
    // Fitching Three.js Environment 
    this.world = new World();
    
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
    this.tests.stats.begin();
    this.interval.update();
    this.camera.update();
    this.renderer.update();
    this.world.update();
    requestAnimationFrame(() => {
      this.update();
    });
    this.tests.stats.end();
  }
}



/*
** Variables
*/
const canvas = document.getElementById("webgl");

let instance = null;
const app = new App(canvas);

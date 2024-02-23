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
const psrdnoise = `
vec4 permute(vec4 i) {
  vec4 im = mod(i, 289.0);
  return mod(((im*34.0)+10.0)*im, 289.0);
}

float psrdnoise(vec3 x, vec3 period, float alpha, out vec3 gradient)
{
  const mat3 M = mat3(0.0, 1.0, 1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0);
  const mat3 Mi = mat3(-0.5, 0.5, 0.5, 0.5,-0.5, 0.5, 0.5, 0.5,-0.5);
  vec3 uvw = M * x;
  vec3 i0 = floor(uvw), f0 = fract(uvw);
  vec3 g_ = step(f0.xyx, f0.yzz), l_ = 1.0 - g_;
  vec3 g = vec3(l_.z, g_.xy), l = vec3(l_.xy, g_.z);
  vec3 o1 = min( g, l ), o2 = max( g, l );
  vec3 i1 = i0 + o1, i2 = i0 + o2, i3 = i0 + vec3(1.0);
  vec3 v0 = Mi * i0, v1 = Mi * i1, v2 = Mi * i2, v3 = Mi * i3;
  vec3 x0 = x - v0, x1 = x - v1, x2 = x - v2, x3 = x - v3;
  if(any(greaterThan(period, vec3(0.0)))) {
    vec4 vx = vec4(v0.x, v1.x, v2.x, v3.x);
    vec4 vy = vec4(v0.y, v1.y, v2.y, v3.y);
    vec4 vz = vec4(v0.z, v1.z, v2.z, v3.z);
    if(period.x > 0.0) vx = mod(vx, period.x);
    if(period.y > 0.0) vy = mod(vy, period.y);
    if(period.z > 0.0) vz = mod(vz, period.z);
    i0 = floor(M * vec3(vx.x, vy.x, vz.x) + 0.5);
    i1 = floor(M * vec3(vx.y, vy.y, vz.y) + 0.5);
    i2 = floor(M * vec3(vx.z, vy.z, vz.z) + 0.5);
    i3 = floor(M * vec3(vx.w, vy.w, vz.w) + 0.5);
  }
  vec4 hash = permute( permute( permute( 
      vec4(i0.z, i1.z, i2.z, i3.z ))
      + vec4(i0.y, i1.y, i2.y, i3.y ))
      + vec4(i0.x, i1.x, i2.x, i3.x ));
  vec4 theta = hash * 3.883222077;
  vec4 sz = hash * -0.006920415 + 0.996539792;
  vec4 psi = hash * 0.108705628;
  vec4 Ct = cos(theta), St = sin(theta);
  vec4 sz_prime = sqrt( 1.0 - sz*sz );
  vec4 gx, gy, gz;
  if(alpha != 0.0) {
    vec4 px = Ct * sz_prime, py = St * sz_prime, pz = sz;
    vec4 Sp = sin(psi), Cp = cos(psi), Ctp = St*Sp - Ct*Cp;
    vec4 qx = mix( Ctp*St, Sp, sz), qy = mix(-Ctp*Ct, Cp, sz);
    vec4 qz = -(py*Cp + px*Sp);
    vec4 Sa = vec4(sin(alpha)), Ca = vec4(cos(alpha));
    gx = Ca*px + Sa*qx; gy = Ca*py + Sa*qy; gz = Ca*pz + Sa*qz;
  }
  else {
    gx = Ct * sz_prime; gy = St * sz_prime; gz = sz;  
  }
  vec3 g0 = vec3(gx.x, gy.x, gz.x), g1 = vec3(gx.y, gy.y, gz.y);
  vec3 g2 = vec3(gx.z, gy.z, gz.z), g3 = vec3(gx.w, gy.w, gz.w);
  vec4 w = 0.5-vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3));
  w = max(w, 0.0); vec4 w2 = w * w, w3 = w2 * w;
  vec4 gdotx = vec4(dot(g0,x0), dot(g1,x1), dot(g2,x2), dot(g3,x3));
  float n = dot(w3, gdotx);
  vec4 dw = -6.0 * w2 * gdotx;
  vec3 dn0 = w3.x * g0 + dw.x * x0;
  vec3 dn1 = w3.y * g1 + dw.y * x1;
  vec3 dn2 = w3.z * g2 + dw.z * x2;
  vec3 dn3 = w3.w * g3 + dw.w * x3;
  gradient = 39.5 * (dn0 + dn1 + dn2 + dn3);
  return 39.5 * n;
}
`


    const GEOMETRY_SIGMENTS = 256; // Add this line to have more details or hit a limit
    
    this.sphereGeometry = new THREE.SphereGeometry(
      1.5, 
      GEOMETRY_SIGMENTS, 
      GEOMETRY_SIGMENTS,
      //0,
      //Math.PI,
      //0,
      //Math.PI
    );
    
    //this.sphereGeometry = new THREE.IcosahedronGeometry(1, GEOMETRY_SIGMENTS);
    
    this.sphereInfo = {
      color: 0xffffff
    }
    
    this.uniforms = {
      uTime: { value: 0 },
      uWaveHeight: { value: 0.2 },
      uWaveFreq: { value: 5 },
      uWaveAmplitude: { value: 1 },
      uWaveSpeed: { value: 1 },
      uDisplacementScale: { value: 1 },
      uBumpScale: { value: 1 },
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
      shader.uniforms.uDisplacementScale = this.uniforms.uDisplacementScale;
      shader.uniforms.uBumpScale = this.uniforms.uBumpScale;
      
      // Vertex Pars
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `
        #include <common>
        ${wavesParsVert}
        varying vec3 vPosition;
      `);
      
      // Vertex Main
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        ${wavesMainVert}
      `);
      
      /*
      shader.vertexShader = `
          uniform float uTime;
          
          #define uCoordScale1 0.2
          #define uDisplacementScale 0.2
          
          /* 
          uniform float uCoordScale1;
          uniform float uDisplacementScale; 
          varying vec3 vPosition;
          ${psrdnoise}
        ` + shader.vertexShader
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
            vPosition = position;

            vec3 grad;
            float d = psrdnoise(position * uCoordScale1 + uTime * vec3(0.1, 0.123, 0.134), vec3(240.0), 4.0 * uTime, grad);
            grad *= 2.0;
            vec3 transformed = position + uDisplacementScale * d * normal;

            vec3 N_ = grad - dot(grad, normal) * normal;
            vNormal = normal - uDisplacementScale * N_;
            vNormal = normalize(vNormal);
          `
        )
       */
      // Fragment Main
      shader.fragmentShader = `
          uniform mat4 modelViewMatrix;
          ${wavesParsVert}
        ` + shader.fragmentShader
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <normal_fragment_begin>',
          `// bump map
          
            
            
           /* 
            vec3 gradtemp = vec3(0.0);
            float bump = psrdnoise(vPosition * uCoordScale2 + uTime * vec3(0.5, 0.7, 0.6), vec3(240.0), 0.0, grad);
            grad *= 10.0;
            bump += 0.5 * psrdnoise(vPosition * uCoordScale3 + 0.02 * grad + uTime * vec3(-0.7, -0.6, 0.5), vec3(240.0), 0.0, gradtemp);
            grad = 10.0 * gradtemp;
            bump += 0.25 * psrdnoise(vPosition * uCoordScale4 + uTime * vec3(-0.6, -0.5, -0.7), vec3(240.0), 0.0, gradtemp);
            grad += 10.0 * gradtemp;

            bump *= 0.2;
            grad *= 0.2;
            //*/
            
    float time = uTime * uWaveSpeed;
    vec2 uv = vUv;
    
    vec2 displacedUv = vec2(
      uv.x * 8.0 + pow(sin(time + uv.y * uWaveFreq), 2.0) * uWaveAmplitude,
      uv.y
    );
    
    float strength = cos(displacedUv.x * PI * 4.0) * 0.5 + 0.5;
    strength = pow(strength, 2.0) * uWaveHeight;
    
    
            // normal
            /*
            vec3 normal;
            vec3 N_ = vec3(strength) * vNormal;
            normal = vNormal - uBumpScale * N_;
            normal = normalize(normal);
            normal = mat3(modelViewMatrix) * normal;
            vec3 geometryNormal = normal;
            */
            vec3 grad = vec3(strength);
            vec3 normal;
            vec3 N_ = grad - dot(grad, vNormal) * vNormal;
            normal = vNormal - uBumpScale * N_;
            normal = normalize(normal);
            normal = mat3(modelViewMatrix) * normal;
            vec3 geometryNormal = normal;
          `
        )
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
    this.tests.shader
      .add(this.uniforms.uDisplacementScale, 'value', 0, 5, 0.001)
      .name('DisplacementScale');
    this.tests.shader
      .add(this.uniforms.uBumpScale, 'value', 0, 5, 0.001)
      .name('BumpScale');
    
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

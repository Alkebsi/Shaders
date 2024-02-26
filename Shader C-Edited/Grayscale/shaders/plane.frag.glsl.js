const fragmentShader = `
  #define PI 3.1415926535897932384626433832795
  
  uniform float uTime;
  uniform float uElevation;
  uniform float uSpeed;
  uniform float uLayers;
  uniform float uXAmplitude;
  uniform float uXFrequency;
  uniform float uYAmplitude;
  uniform float uYFrequency;
  uniform float uBomber;
  uniform float uBomberFade;
  uniform float uWaveXSpeed;
  uniform float uWaveYSpeed;
  uniform float uWaveThickness;
  uniform float uWaveAmplitude;
  uniform float uWaveFade;
  
  varying vec2 vUv;
  varying vec3 vPosition; 
  
  // Functions Re-Declaration
  float smoothMod(float axis, float amp, float rad);
  
  float displace(vec3 point) {
    float time = uTime * uSpeed;
    vec2 uv = vec2(0.5 + point.x * 0.3, 0.5 + point.y * 0.3);
    
    vec2 displacedUv = vec2(
      uv.x + sin(time + uv.y * uXFrequency) * uXAmplitude,
      uv.y + sin(time + uv.x * uYFrequency) * uYAmplitude
    );
    
    displacedUv = (displacedUv * 1.2) - 0.1;
    
    float strength = smoothMod(distance(displacedUv, vec2(0.5)) * uLayers, 1.0, 1.5);
    strength = pow(strength, 4.0);
    strength *= uElevation * 20.0;
        
    float transparency = distance(displacedUv, vec2(0.5));
    transparency = smoothstep(0.5, 0.2, transparency);
    
    float bomber = 1.0 - smoothMod(distance(uv, vec2(0.5)) * 2.0 + uBomber * time, 1.0, 1.0);
    bomber = pow(bomber, uBomberFade) * (uBomberFade / 2.0);
    
    float waver = uv.x * uWaveThickness + uTime * uWaveXSpeed + sin(uv.y * 5.0 + uTime * uWaveYSpeed) * uWaveAmplitude;
    waver = 1.0 - smoothMod(waver, 1.0, 1.0);
    waver = pow(waver, uWaveFade) * uWaveFade;
    
    strength *= bomber + waver;
    strength *= transparency;
    
    return strength;
  }
  
  void main() {
    float time = uTime * uSpeed;
    vec2 uv = vUv;
  
    vec2 displacedUv = vec2(
      uv.x + sin(time + uv.y * uXFrequency) * uXAmplitude,
      uv.y + sin(time + uv.x * uYFrequency) * uYAmplitude
    );
    
    displacedUv = (displacedUv * 1.2) - 0.1;
    
    float strength = smoothMod(distance(displacedUv, vec2(0.5)) * uLayers, 1.0, 1.5);
    strength = pow(strength, 4.0);
    strength *= uElevation * 20.0;
        
    float transparency = distance(displacedUv, vec2(0.5));
    transparency = smoothstep(0.5, 0.2, transparency);
    
    float bomber = 1.0 - smoothMod(distance(uv, vec2(0.5)) * 2.0 + uBomber * time, 1.0, 1.0);
    bomber = pow(bomber, uBomberFade) * (uBomberFade / 2.0);
    
    float waver = uv.x * uWaveThickness + uTime * uWaveXSpeed + sin(uv.y * 5.0 + uTime * uWaveYSpeed) * uWaveAmplitude;
    waver = 1.0 - smoothMod(waver, 1.0, 1.0);
    waver = pow(waver, uWaveFade) * uWaveFade;
    
    //strength *= bomber + waver;
    //strength *= transparency; 
    
    strength = displace(vPosition);
  
    gl_FragColor = vec4(vec3(strength), 1.0);
  }
  
  
  // Functions Declaration
  /* 
  * SMOOTH MOD
  * - authored by @charstiles -
  * based on https://math.stackexchange.com/questions/2491494/does-there-exist-a-smooth-approximation-of-x-bmod-y
  * (axis) input axis to modify
  * (amp) amplitude of each edge/tip
  * (rad) radius of each edge/tip
  * returns => smooth edges
  */

  float smoothMod(float axis, float amp, float rad){
    float top = cos(PI * (axis / amp)) * sin(PI * (axis / amp));
    float bottom = pow(sin(PI * (axis / amp)), 2.0) + pow(rad, 2.0);
    float at = atan(top / bottom);
    return amp * (1.0 / 2.0) - (1.0 / PI) * at;
  }
`;
window.planeFrag = fragmentShader;

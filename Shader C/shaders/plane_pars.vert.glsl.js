const wavesParsVert = `
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
  
  varying float vStrength;
  
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
window.wavesParsVert = wavesParsVert;

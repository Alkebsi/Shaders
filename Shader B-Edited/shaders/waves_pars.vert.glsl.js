const wavesParsVert = `
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uWaveFreq;
  uniform float uWaveAmplitude;
  uniform float uWaveSpeed;
  uniform float uDisplacementScale;
  uniform float uBumpScale;
  
  //varying float vStrength;
  varying vec2 vUv;
`;
window.wavesParsVert = wavesParsVert;

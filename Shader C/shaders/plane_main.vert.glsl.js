const wavesMainVert = `
    float time = uTime * uSpeed;
  
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
    
    vec3 newPosition = position + normal * strength; 
    
    transformed.xyz = newPosition;
    
    vStrength = strength;
`;
window.wavesMainVert = wavesMainVert;

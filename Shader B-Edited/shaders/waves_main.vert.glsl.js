const wavesMainVert = `
    float time = uTime * uWaveSpeed;
    
    vec2 displacedUv = vec2(
      uv.x * 8.0 + pow(sin(time + uv.y * uWaveFreq), 2.0) * uWaveAmplitude,
      uv.y
    );
    
    float strength = sin(displacedUv.x * PI * 4.0) * 0.5 + 0.5;
    strength = pow(strength, 2.0) * uWaveHeight;
    
    vec3 grad = vec3(strength);
    
    vec3 newPosition = position + normal * strength; 
    
    vec3 N_ = grad - dot(grad, normal) * normal;
    vNormal = normal - uDisplacementScale * N_;
    vNormal = normalize(vNormal);
    
    transformed.xyz = newPosition;
    
    // vStrength = strength;
    vUv = uv;
`;
window.wavesMainVert = wavesMainVert;

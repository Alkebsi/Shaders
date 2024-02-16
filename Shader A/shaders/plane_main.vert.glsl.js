const planeMainVert = `
    // UV Displacement
    vec2 displacedUv = vec2(
      uv.x + uTime * uMovementSpeedX,
      uv.y + uTime * uMovementSpeedY
    );
    displacedUv = displacedUv * 20.0;
    
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    float strength = cnoise(vec4(displacedUv * uNoiseSize, 1.0, uTime * uNoiseSpeed));
    
    strength = pow(abs(strength), 2.0);    
    strength *= uNoiseStrength;
    strength *= pow(1.0 - distance(uv, vec2(uMouseX, uMouseY)), uDistancePower);
    strength *= uDistanceMultiplier;
    
    transformed.z = strength;
      
    // Varyings 
    vColor = strength;
`;
window.planeMainVert = planeMainVert;

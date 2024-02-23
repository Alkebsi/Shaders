const wavesMainFrag = `
  float strength = vStrength;
  
  normal = perturbNormalArb( - vViewPosition, normal, vec2(dFdx(strength), dFdy(strength)), faceDirection );
`;
window.wavesMainFrag = wavesMainFrag;

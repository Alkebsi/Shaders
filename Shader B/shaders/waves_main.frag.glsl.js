const wavesMainFrag = `
  normal = perturbNormalArb( - vViewPosition, normal, vec2(dFdx(vStrength), dFdy(vStrength)), faceDirection );
`;
window.wavesMainFrag = wavesMainFrag;

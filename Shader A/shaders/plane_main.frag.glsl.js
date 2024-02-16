const planeMainFrag = `
  normal = perturbNormalArb( - vViewPosition, normal, vec2(dFdx(vColor), dFdy(vColor)), faceDirection );
`;
window.planeMainFrag = planeMainFrag;

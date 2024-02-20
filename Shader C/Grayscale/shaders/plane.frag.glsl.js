const fragmentShader = `
  varying float vStrength;

  void main() {
    gl_FragColor = vec4(vec3(vStrength), 1.0);
  }
`;
window.planeFrag = fragmentShader;

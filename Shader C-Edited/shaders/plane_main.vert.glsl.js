const wavesMainVert = `
  vec3 displacedPosition = position + normal * displace(position);


      float offset = uSize / uSigments;
      vec3 tangent = orthogonal(normal);
      vec3 bitangent = normalize(cross(normal, tangent));
      vec3 neighbour1 = position + tangent * offset;
      vec3 neighbour2 = position + bitangent * offset;
      vec3 displacedNeighbour1 = neighbour1 + normal * displace(neighbour1);
      vec3 displacedNeighbour2 = neighbour2 + normal * displace(neighbour2);

      // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
      vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
      vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

      // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
      vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
    
`;
window.wavesMainVert = wavesMainVert;

window.wavesNormals = `
  vec3 transformedNormal = displacedNormal;

#ifdef USE_INSTANCING

	// this is in lieu of a per-instance normal-matrix
	// shear transforms in the instance matrix are not supported

	mat3 m = mat3( instanceMatrix );

	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );

	transformedNormal = m * transformedNormal;

#endif

transformedNormal = normalMatrix * transformedNormal;

#ifdef FLIP_SIDED

	transformedNormal = - transformedNormal;

#endif

#ifdef USE_TANGENT

	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;

	#ifdef FLIP_SIDED

		transformedTangent = - transformedTangent;

	#endif

#endif
`;

window.wavesDisplacement = `
  transformed.xyz = displacedPosition;
`;

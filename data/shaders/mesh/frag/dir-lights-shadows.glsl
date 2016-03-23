    float diffuseFactor;
    float specularFactor;

    float lighted;
    float indexDifference;
    bool covered;
    vec3 shadowMapPosition;

    // the factor for how much the fragment needs to be shaded by the shadows
    // for the largest shadow map, add a fade out factor towards the end of the range
    float shade = 1.0;

    float distFromEye = length(v_viewDir);

    // going through each static, directional light source
    // start and end indices need to be constant
    for (int i = 0; i < MAX_DIR_LIGHTS; i++) {
        // only go through actual light sources
        if (i < u_numDirLights) {
            // how much is the fragment lighted based on angle
            diffuseFactor = max(0.0, dot(+u_dirLights[i].direction, normal));
            // how much is the fragment lighted based on shadows
            lighted = 0.0;
            // any calculations only need to be done if the fragment gets lit somewhat in the first place
            if (diffuseFactor > 0.0) {
                // start from not being obscured
                lighted = 1.0;
                // shadow map calculations only occur if we turned them on
                if (u_shadows) {
                    // At each step, we only need to check for objects obscuring the current fragment
                    // that lie outside of the scope of the previous check.
                    // minimum depth of obscuring objects to check that are above the previously checked area
                    float minDepthAbove = 0.0; 
                    // maximum depth of obscuring objects to check that are below the previously checked area
                    float maxDepthBelow = 1.0;
                    // whether the projection of this fragment to the shadow map planes has already
                    // fallen into the covered area
                    covered = false;
                    float translationLength = 0.0;
                    float range = 0.0;
                    // going through each shadow map (start and end indices need to be constant)
                    for (int j = 0; j < MAX_SHADOW_MAP_RANGES; j++) {
                        // only go through existing shadow maps
                        if (j < u_numRanges) {
                            // the range of the current shadow map (length of the area covered from center
                            // to the sides of the map in world coordinates)
                            translationLength = -range;
                            range = u_shadowMapRanges[j];
                            translationLength += range;
                            float depthRange = range * u_shadowMapDepthRatio;
                            // the coordinates in shadow mapping space translated to have the current map center in the origo
                            shadowMapPosition = (u_dirLights[i].translationVector * translationLength) + v_shadowMapPosition[i].xyz;
                            if (j == u_numRanges - 1) {
                                shade = 1.0 - clamp(((distFromEye / (translationLength + range)) - SHADOW_DISTANCE_FADEOUT_START) * SHADOW_DISTANCE_FADEOUT_FACTOR, 0.0, 1.0);
                            }
                            // only check if the current fragment is (could be) covered by the current shadow map
                            if (length(shadowMapPosition.xy) < range) {
                                // calculate texture coordinates on the current shadow map
                                vec2 shMapTexCoords = shadowMapPosition.xy / range;
                                float depth = shadowMapPosition.z / depthRange;
                                // convert from -1.0;1.0 range to 0.0;1.0
                                shMapTexCoords = shMapTexCoords * 0.5 + vec2(0.5, 0.5);
                                depth = depth * 0.5 + 0.5;
                                // only check the texture if we have valid coordinates for it
                                if (shMapTexCoords == clamp(shMapTexCoords, 0.0, 1.0)) {
                                    vec4 shadowMapTexel[NUM_SHADOW_MAP_SAMPLES];
                                    // read the value of the texel from the shadow map
                                    // indexing samplers with loop variables is not supported by specification
                                    //shadowMapTexel = texture2D(u_shadowMaps[i * MAX_SHADOW_MAP_RANGES + j], shMapTexCoords);
                                    int shMapIndex = i * u_numRanges + j;
                                    for (int k = 0; k < NUM_SHADOW_MAP_SAMPLES; k++) {
                                        if (shMapIndex == 0) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[0], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 1) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[1], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 2) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[2], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 3) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[3], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 4) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[4], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 5) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[5], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 6) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[6], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 7) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[7], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 8) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[8], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 9) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[9], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 10) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[10], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        } else 
                                        if (shMapIndex == 11) {
                                            shadowMapTexel[k] = texture2D(u_shadowMaps[11], shMapTexCoords + u_shadowMapSampleOffsets[k] / u_shadowMapTextureSize);
                                        }
                                        // depth check is performed with a tolerance for small errors
                                        float absErrorTolerance = 1.0 / 255.0 * depthRange;
                                        // the depth value is stored in the second two components of the texel
                                        float texelDepth = (shadowMapTexel[k].z / 256.0) + shadowMapTexel[k].w;
                                        float absDepth = (texelDepth * 2.0 * depthRange) - (depthRange + shadowMapPosition.z);
                                        // check if there is depth content on the texel, which is in a range not checked before
                                        // (by depth or by coordinates)
                                        if ((texelDepth > 0.0) && ((absDepth >= minDepthAbove - absErrorTolerance) || (absDepth <= maxDepthBelow + absErrorTolerance) || !covered)) {
                                            // the triangle index value is stored in the first two components of the texel
                                            indexDifference = length(v_index - shadowMapTexel[k].rg);
                                            // check if the fragment is obscured by a triangle with a different index
                                            if((texelDepth > depth + DEPTH_ERROR_TOLERANCE) && (indexDifference > INDEX_ERROR_TOLERANCE)) {
                                                // for very small shadows (that would appear very pixelated), add a fade out factor
                                                lighted = max(0.0, lighted - shade / float(NUM_SHADOW_MAP_SAMPLES));
                                                if (lighted == 0.0) {
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    // save the state that the XY position of this fragment has already been inside the
                                    // area covered by a shadow map - but only after the previous state has been checked
                                    covered = true;
                                }
                            }
                            // set the variables to exclude the already checked depth region in the next step
                            minDepthAbove = -shadowMapPosition.z + depthRange;
                            maxDepthBelow = -shadowMapPosition.z - depthRange;
                        }
                    }
                }

                if (lighted > 0.0) {
                    specularFactor = v_shininess > 0.0 ? pow(max(dot(reflDir, u_dirLights[i].direction), 0.0), v_shininess) : 0.0;

                    gl_FragColor.rgb += lighted *
                        vec3(
                            // the RGB components
                                clamp(
                                // diffuse light reflected for different light sources
                                u_dirLights[i].color * diffuseFactor
                                // clamp each component
                                , 0.0, 1.0)
                                // modulate with the colors from the vertices and the texture
                                // the above components cannot make the surface lighter then
                                // the modulated diffuse texture
                                * diffuseColor.rgb
                                // add specular lighting, this can make the surface "overlighted"
                                + specularFactor * u_dirLights[i].color * texSpec.rgb
                        );
                }
            }
        }
    }
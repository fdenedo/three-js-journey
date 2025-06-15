#ifdef GL_ES
    // precision mediump float;
#endif

uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

void main() {
    // Scale and animate
    vec2 smokeUV = vUv;
    smokeUV.y *= 0.3;
    smokeUV.x *= 0.5;
    smokeUV.y -= uTime * 0.05;

    

    // vec4 smokeVec = texture2D(uPerlinTexture, vUv);
    float smoke = texture(uPerlinTexture, smokeUV).r;

    // Remap
    smoke = smoothstep(0.4, 1.0, smoke);

    // Fade edges
    smoke *= smoothstep(0.0, 0.1, vUv.x);
    smoke *= smoothstep(1.0, 0.9, vUv.x);
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, 0.8, vUv.y);

    // Do this to focus on just the fade
    gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
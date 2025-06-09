precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

// varying float vRandom;
varying vec2 vUV;
varying float vElevation;

void main()
{
    vec4 textureColor = texture2D(uTexture, vUV);
    textureColor.rgb *= vElevation * 2.0 + 0.8;
    // gl_FragColor = vec4(0.5, vRandom, 1.0, 1.0);
    // gl_FragColor = vec4(uColor, 1.0);
    gl_FragColor = vec4(textureColor);
}
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uBigElevation;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float v_elevation;



void main()
{
    float mixStrength = (v_elevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    gl_FragColor = vec4(color, 1.);

    // This line is added to make sure that colours are output in sRGB Colour Space
    // #include <colorspace_fragment>
}
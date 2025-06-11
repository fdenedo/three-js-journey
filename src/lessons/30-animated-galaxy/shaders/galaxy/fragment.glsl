uniform float uAlpha;

varying vec3 v_color;

void main()
{
    // Simple Disk Pattern
    // float strength = 1. - step(0.5, distance(gl_PointCoord, vec2(0.5)));

    // Diffuse Point Pattern
    // float strength = 1. - distance(gl_PointCoord, vec2(0.5)) * 2.;

    // Light Point Pattern
    float strength = 1. - distance(gl_PointCoord, vec2(0.5));
    strength = pow(strength, 10.);

    // Final Colour
    vec3 color = mix(vec3(0.0), v_color, strength);

    gl_FragColor = vec4(color, uAlpha);
    #include <colorspace_fragment>
}
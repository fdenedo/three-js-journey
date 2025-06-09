void main()
{
    gl_FragColor = vec4(0.2, 0.6, 1., 1.);

    // This line is added to make sure that colours are output in sRGB Colour Space
    #include <colorspace_fragment>
}
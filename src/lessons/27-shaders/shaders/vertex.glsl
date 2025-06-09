uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;

attribute vec3 position;
attribute float aRandom; // custom one
attribute vec2 uv;

// varying float vRandom;
varying vec2 vUV;
varying float vElevation;

float loremIpsum()
{
    return 4.0;
}

void main()
{
    // *** JUST EXPERIMENTING ***
    // float a = 1.0;
    // float b = 2.0;
    // float c = a + b;

    // int foo = -3; // Think about converting ints to floats, as they can't be mixed
    // float foof = float(foo);

    // float x = foof / b;

    // bool t = true;
    // bool f = false;

    // vec2 vector2 = vec2(1.0, 2.0);
    // vec2 vectorDupe = vec2(1.0); // same as vec2(1.0, 1.0)

    // vectorDupe.x = 1.0;
    // vectorDupe.y = 2.0;

    // vectorDupe *= 2.0; // Perform operation on both values

    // vec3 vector3 = vec3(0.0);
    // vec3 vector32 = vec3(1.0, 2.0, 3.0);

    // vec3 purpleColor = vec3(0.0); // the variable value names are just aliases
    // purpleColor.r = 0.5;
    // purpleColor.g = 0.0;
    // purpleColor.b = 1.0;

    // vec2 aye = vec2(1.0, 2.0);
    // vec3 bee = vec3(aye, 3.0);
    // vec2 cee = bee.xy; // encludes the third value (xy, xz, yz) and can invert them (swizzle)

    // vec4 fourth = vec4(1.0, 2.0, 3.0, 4.0); // The fourth value is w (or a for rgba) - it's syntactic sugar

    // *** END OF EXPERIEMNTS ***
    
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    float elevationMulti = 0.1;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * elevationMulti;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * elevationMulti;

    modelPosition.z += elevation;
    // modelPosition.z += aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // vRandom = aRandom; // send the attribute to the varying of the fragment shader
    vUV = uv;
    vElevation = elevation;
}
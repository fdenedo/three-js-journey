uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 v_uv;

void main()
{
    // The order of these multiplications matters
    // Note that the SahderMaterial gives a modelViewMatrix, combination
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    v_uv = uv;
}
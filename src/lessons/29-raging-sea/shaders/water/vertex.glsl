uniform float uTime;
uniform float uBigElevation;
uniform vec2 uBigFrequency;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.);

    float elevation = sin(modelPosition.x * uBigFrequency.x + uTime)
                    * sin(modelPosition.z * uBigFrequency.y + uTime)
                    * uBigElevation;

    modelPosition.y = elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); 
    gl_Position = projectedPosition; 
}
uniform float uSize;
uniform float uTime;

attribute float aScale;

varying vec3 v_color;

void main() 
{
    float angle = atan(position.x, position.z);
    float distanceToCentre = length(position.xz);
    float angleOffset = (1. / distanceToCentre) * uTime * 0.2;
    vec3 newPosition = position;

    angle += angleOffset;
    newPosition.x = cos(angle) * distanceToCentre;
    newPosition.z = sin(angle) * distanceToCentre;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.);

    gl_PointSize = aScale * uSize; // Dependent on the pixel ratio
    gl_PointSize *= ( 1. / - (modelViewMatrix * vec4(position, 1.)).z);

    v_color = color;
}
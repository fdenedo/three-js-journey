#define PI 3.1415926535897932384626433832795

precision mediump float;

uniform vec3 uColor;
uniform int uPattern;
uniform bool uIsColoured;
uniform bool uAnimate;
uniform float uTime;

varying vec2 v_uv;

float random(vec2 st) 
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

vec4 getColor(float strength) {
    vec3 blackColor = vec3(0.0);
    vec3 uColor = vec3(v_uv, 0.5);

    vec3 interpolated = uIsColoured ? mix(blackColor, uColor, strength) : vec3(strength);
    return vec4(interpolated, 1.);
}

float addElapsed(float f) {
    return uAnimate ? f + uTime : f;
}

void main()
{
    float strength;
    vec4 color;

    if (uPattern == 0) {
        color = vec4(v_uv, 1.0, 1.0);
    }

    else if (uPattern == 1) {
        color = vec4(v_uv, 0.0, 1.0);
    }

    else if (uPattern == 2) {
        color = vec4(v_uv.x, v_uv.x, v_uv.x, 1.0);
    }

    else if (uPattern == 3) {
        strength = v_uv.y;
        color = getColor(strength);
    }

    else if (uPattern == 4) {
        strength = 1.0 - v_uv.y;
        color = getColor(strength);
    }

    else if (uPattern == 5) {
        strength = v_uv.y * 10.0;
        color = getColor(strength);
    }

    else if (uPattern == 6) {
        strength = mod(v_uv.y * 10.0, 1.0);
        color = getColor(strength);
    }

    else if (uPattern == 7) {
        strength = step(0.5, mod(v_uv.y * 10.0, 1.0));
        // Can do the same thing with an if/else clause
        // But conditionals are bad for performance
        color = getColor(strength);
    }

    else if (uPattern == 8) {
        strength = step(0.8, mod(v_uv.y * 10.0, 1.0));
        color = getColor(strength);
    }

    else if (uPattern == 9) {
        strength = step(0.8, mod(v_uv.x * 10.0, 1.0));
        color = getColor(strength);
    }

    else if (uPattern == 10) {
        strength = step(0.8, mod(v_uv.x * 10.0, 1.0));
        strength += step(0.8, mod(v_uv.y * 10.0, 1.0));
        color = getColor(strength);
    }

    else if (uPattern == 11) {
        strength = step(0.8, mod(v_uv.x * 10.0, 1.0));
        strength *= step(0.8, mod(v_uv.y * 10.0, 1.0));
        color = getColor(strength);
    }

    else if (uPattern == 12) {
        strength = step(0.4, mod(v_uv.x * 10.0, 1.0));
        strength *= step(0.8, mod(v_uv.y * 10.0, 1.0));
        color = getColor(strength);
    }

    else if (uPattern == 13) {
        float barX = step(0.8, mod(v_uv.x * 10.0, 1.0));
        barX *= step(0.4, mod(v_uv.y * 10.0, 1.0));

        float barY = step(0.8, mod(v_uv.y * 10.0, 1.0));
        barY *= step(0.4, mod(v_uv.x * 10.0, 1.0));

        strength = barX + barY;
        color = getColor(strength);
    }

    else if (uPattern == 14) {
        float barX = step(0.4, mod(v_uv.x * 10.0 - 0.2, 1.0));
        barX *= step(0.8, mod(v_uv.y * 10.0, 1.0));

        float barY = step(0.8, mod(v_uv.x * 10.0, 1.0));
        barY *= step(0.4, mod(v_uv.y * 10.0 - 0.2, 1.0));

        strength = barX + barY;
        color = getColor(strength);
    }

    else if (uPattern == 15) {
        strength = abs(v_uv.x - 0.5);
        color = getColor(strength);
    }

    else if (uPattern == 16) {
        float dirX = abs(v_uv.x - 0.5);
        float dirY = abs(v_uv.y - 0.5);

        strength = min(dirX, dirY);
        color = getColor(strength);
    }

    else if (uPattern == 17) {
        float dirX = abs(v_uv.x - 0.5);
        float dirY = abs(v_uv.y - 0.5);

        strength = max(dirX, dirY);
        color = getColor(strength);
    }

    else if (uPattern == 18) {
        // Thick Frame
        float dirX = abs(v_uv.x - 0.5);
        float dirY = abs(v_uv.y - 0.5);

        strength = step(0.2, max(dirX, dirY));
        color = getColor(strength);
    }

    else if (uPattern == 19) {
        // Small Frame
        float sq1 = step(0.2, max(abs(v_uv.x - 0.5), abs(v_uv.y - 0.5)));
        float sq2 = 1.0 - step(0.25, max(abs(v_uv.x - 0.5), abs(v_uv.y - 0.5)));
        strength = sq1 * sq2;
        color = getColor(strength);
    }

    else if (uPattern == 20) {
        // Lo-Res Gradient
        strength = floor(v_uv.x * 10.) / 10.;
        color = getColor(strength);
    }

    else if (uPattern == 21) {
        // Blocky XY Gradient
        strength = floor(v_uv.x * 10.) / 10.;
        strength *= floor(v_uv.y * 10.) / 10.;
        color = getColor(strength);
    }

    else if (uPattern == 22) {
    // Random
    // Interesting how this is done
    // There is no random function, this is from
    // https://thebookofshaders.com/10/
        strength = random(v_uv);
        color = getColor(strength);
    }

    else if (uPattern == 23) {
        // Large Random
        strength = random(floor(v_uv * 10.));
        color = getColor(strength);
    }

    else if (uPattern == 24) {
        // Skewed Large Random
        vec2 gridUV = vec2(
            floor(v_uv.x * 10.) / 10.,
            floor((v_uv.y + v_uv.x * 0.5) * 10.) / 10.
        );

        strength = random(gridUV);
        color = getColor(strength);
    }

    else if (uPattern == 25) {
        // Corner Radial
        strength = length(v_uv);
        color = getColor(strength);
    }

    else if (uPattern == 26) {
        // Diffuse Hole
        strength = distance(v_uv, vec2(0.5));
        color = getColor(strength);
    }

    else if (uPattern == 27) {
        // Diffuse Central
        strength = 1. - distance(v_uv, vec2(0.5));
        color = getColor(strength);
    }

    else if (uPattern == 28) {
        // Point Light / Star
        strength = 0.015 / distance(v_uv, vec2(0.5));
        color = getColor(strength);
    }

    else if (uPattern == 29) {
        // Stretched Light
        vec2 lightUV = vec2(
            v_uv.x * 0.1 + 0.45,
            v_uv.y * 0.5 + 0.25
            );
        strength = 0.015 / distance(lightUV, vec2(0.5));
        color = getColor(strength);
    }

    else if (uPattern == 30) {
        // Star
        vec2 lightUvX = vec2(v_uv.x * 0.1 + 0.45, v_uv.y * 0.5 + 0.25);
        float lightX = 0.015 / distance(lightUvX, vec2(0.5));

        vec2 lightUvY = vec2(v_uv.y * 0.1 + 0.45, v_uv.x * 0.5 + 0.25);
        float lightY = 0.015 / distance(lightUvY, vec2(0.5));

        strength = lightX * lightY;
        color = getColor(strength);
    }

    else if (uPattern == 31) {
        // Rotated Star
        vec2 rotatedUV = rotate(v_uv, PI * 0.25, vec2(0.5));

        vec2 lightUvX = vec2(rotatedUV.x * 0.1 + 0.45, rotatedUV.y * 0.5 + 0.25);
        float lightX = 0.015 / distance(lightUvX, vec2(0.5));

        vec2 lightUvY = vec2(rotatedUV.y * 0.1 + 0.45, rotatedUV.x * 0.5 + 0.25);
        float lightY = 0.015 / distance(lightUvY, vec2(0.5));

        strength = lightX * lightY;
        color = getColor(strength);
    }

    else if (uPattern == 32) {
        // Circle Cutout
        strength = step(0.25, distance(v_uv, vec2(0.5)));
        color = getColor(strength);
    }

    else if (uPattern == 33) {
        // Radial Diffuse Black Ring
        strength = abs(distance(v_uv, vec2(0.5)) - 0.25);
        color = getColor(strength);
    }

    else if (uPattern == 34) {
        // Sharp Black Ring
        strength = step(0.01, abs(distance(v_uv, vec2(0.5)) - 0.25));
        color = getColor(strength);
    }

    else if (uPattern == 35) {
        // Sharp White Ring
        strength = 1.0 - step(0.01, abs(distance(v_uv, vec2(0.5)) - 0.25));
        color = getColor(strength);
    }

    else if (uPattern == 36) {
        // Wavy Ring
        vec2 wavyUV = vec2(
            v_uv.x, 
            v_uv.y + sin(v_uv.x * 30.) * 0.1
        );
        strength = 1.0 - step(0.01, abs(distance(wavyUV, vec2(0.5)) - 0.25));
        color = getColor(strength);
    }

    else if (uPattern == 37) {
        // Weird Spectral
        vec2 wavyUV = vec2(
            v_uv.x + sin(v_uv.y * 30.) * 0.1, 
            v_uv.y + sin(v_uv.x * 30.) * 0.1
        );
        strength = 1.0 - step(0.01, abs(distance(wavyUV, vec2(0.5)) - 0.25));
        color = getColor(strength);
    }

    else if (uPattern == 38) {
        // Transcendent Weird Spectral
        vec2 wavyUV = vec2(
            v_uv.x + sin(v_uv.y * 100.) * 0.1, 
            v_uv.y + sin(v_uv.x * 100.) * 0.1
        );
        strength = 1.0 - step(0.01, abs(distance(wavyUV, vec2(0.5)) - 0.25));
        color = getColor(strength);
    }

    else if (uPattern == 39) {
        // Striking Corner Gradient (Sweep)
        strength = atan(v_uv.x, v_uv.y);
        color = getColor(strength);
    }

    else if (uPattern == 40) {
        // Centre Sweep (Half Cutoff)
        strength = atan(v_uv.x - 0.5, v_uv.y - 0.5);
        color = getColor(strength);
    }

    else if (uPattern == 41) {
        // Centre Sweep (Full)
        float angle = atan(v_uv.x - 0.5, v_uv.y - 0.5);
        angle /= PI * 2.;
        angle += 0.5;
        strength = angle;
        color = getColor(strength);
    }

    else if (uPattern == 42) {
        // Repeating Sweeping Bands
        float angle = atan(v_uv.x - 0.5, v_uv.y - 0.5);
        angle /= PI * 2.;
        angle += 0.5;
        strength = mod(angle * 20., 1.0);
        color = getColor(strength);
    }

    else if (uPattern == 43) {
        // Large Gaps between Sweeping Bands
        float angle = atan(v_uv.x - 0.5, v_uv.y - 0.5);
        angle /= PI * 2.;
        angle += 0.5;
        strength = sin(angle * 100.);
        color = getColor(strength);
    }

    else if (uPattern == 44) {
        // Wavy Circle
        float angle = atan(v_uv.x - 0.5, v_uv.y - 0.5);
        angle /= PI * 2.;
        angle += 0.5;
        float sinusoid = sin(addElapsed(angle * 100.));

        float radius = 0.25 + sinusoid * 0.02;
        strength = 1.0 - step(0.01, abs(distance(v_uv, vec2(0.5)) - radius));
        color = getColor(strength);
    }

    else if (uPattern == 45) {
        // Perlin Noise
        strength = cnoise(v_uv * 10.);
        color = getColor(strength);
    }

    else if (uPattern == 46) {
        // Sharp Perlin Noise
        // Perlin Noise can be negative
        strength = step(0.0, cnoise(v_uv * 10.));
        color = getColor(strength);
    }

    else if (uPattern == 47) {
        // Glowing Lines Noise
        strength = 1. - abs(cnoise(v_uv * 10.));
        color = getColor(strength);
    }

    else if (uPattern == 48) {
        // Trippy Patterns
        strength = sin(addElapsed(cnoise(v_uv * 10.) * 20.));
        color = getColor(strength);
    }

    else if (uPattern == 49) {
        // Sharper Trippy Patterns
        strength = step(0.8, sin(addElapsed(cnoise(v_uv * 10.) * 20.)));
        color = getColor(strength);
    }

    else {
        // Nothing
    }

    gl_FragColor = color;
}
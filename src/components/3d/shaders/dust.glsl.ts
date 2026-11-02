/**
 * Nebula dust / micro-particle shader.
 * Soft additive blended sprites for atmospheric haze.
 */

export const dustVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;   // individual drift phase

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    // gentle per-particle positional drift
    vec3 pos = position;
    pos.y += sin(uTime * 0.25 + aPhase) * 0.12;
    pos.x += cos(uTime * 0.18 + aPhase * 1.3) * 0.08;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float dist = -mvPos.z;
    float attenuation = clamp(1.0 / (0.005 * dist * dist), 0.4, 3.0);
    gl_PointSize = aSize * uPixelRatio * attenuation;

    // fade near and far
    vAlpha = smoothstep(0.0, 3.0, dist) * (1.0 - smoothstep(15.0, 30.0, dist));
  }
`

export const dustFragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uColor;
  uniform float uOpacity;

  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    // very soft gaussian blob — no hard edge
    float alpha = exp(-d * d * 8.0) * vAlpha * uOpacity;

    if (alpha < 0.003) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`

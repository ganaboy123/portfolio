/**
 * Star particle shader.
 * Supports per-particle size, color tint, twinkle animation.
 */

export const starsVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aTwinkle;   // phase offset 0..2π
  attribute vec3  aColor;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeScale;

  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // twinkle: subtle sine wave per star, different frequency
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.8 + aTwinkle * 6.2831);

    // size attenuation — bigger when closer
    float dist = -mvPos.z;
    float attenuation = clamp(1.0 / (0.02 * dist * dist), 0.3, 2.5);

    gl_PointSize = aSize * uSizeScale * uPixelRatio * attenuation * twinkle;

    vAlpha = twinkle;
    vColor = aColor;
  }
`

export const starsFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uOpacity;

  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    // soft circular disc — distance from center of point sprite
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);

    // soft circle with a bright core and falloff
    float core = 1.0 - smoothstep(0.0, 0.18, dist);
    float halo = (1.0 - smoothstep(0.18, 0.5, dist)) * 0.25;
    float alpha = (core + halo) * vAlpha * uOpacity;

    if (alpha < 0.004) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`

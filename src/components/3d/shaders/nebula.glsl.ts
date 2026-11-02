/**
 * Nebula background shader.
 * Domain-warped FBM noise produces deep-space atmospheric color.
 * uSectionBlend[7] — per-section intensity weights.
 * uAtmosphere — 0-1 overall glow intensity.
 */

export const nebulaVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // clip-space quad trick — renders behind everything
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`

export const nebulaFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAtmosphere;          // 0-1 intensity
  uniform vec3  uNebulaColorA;        // deep violet
  uniform vec3  uNebulaColorB;        // deep blue
  uniform vec3  uNebulaColorC;        // accent glow (cyan)
  uniform vec3  uNebulaColorD;        // accent glow (violet)

  varying vec2 vUv;

  // ── PRNG ─────────────────────────────────────
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  // ── Value noise ───────────────────────────────
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // ── FBM with domain warp ──────────────────────
  float fbm(vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    vec2  shift = vec2(100.0);
    mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      v += a * noise(p);
      p  = rot * p * 2.1 + shift;
      a *= 0.48;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    // aspect correction — assume ~16:9
    vec2 st = (uv - 0.5) * vec2(1.78, 1.0);

    float t = uTime * 0.025;

    // two-layer domain warp
    vec2 q = vec2(
      fbm(st + vec2(0.0, 0.0) + t,        5),
      fbm(st + vec2(5.2, 1.3) + t * 0.7,  5)
    );
    vec2 r = vec2(
      fbm(st + 3.5 * q + vec2(1.7, 9.2) + t * 0.5, 4),
      fbm(st + 3.5 * q + vec2(8.3, 2.8) + t * 0.4, 4)
    );

    float f = fbm(st + 3.8 * r, 4);
    float f2 = fbm(st * 0.5 + vec2(3.0) + t * 0.15, 3);

    // base color: deep space
    vec3 col = mix(uNebulaColorA, uNebulaColorB, clamp(f * f * 3.5, 0.0, 1.0));

    // cyan nebula bloom — concentrated in upper area
    float cyBloom = clamp((f * f * f * 3.2) * uAtmosphere, 0.0, 1.0);
    float cyMask  = smoothstep(0.3, 0.8, f2);
    col = mix(col, uNebulaColorC, cyBloom * cyMask * 0.55);

    // violet nebula — opposite side
    float viBloom = clamp(f2 * f2 * 2.4 * uAtmosphere, 0.0, 1.0);
    float viMask  = 1.0 - cyMask;
    col = mix(col, uNebulaColorD, viBloom * viMask * 0.40);

    // very subtle star-glow haze in bright areas
    float haze = clamp(pow(f, 4.0) * 6.0 * uAtmosphere, 0.0, 0.3);
    col += vec3(haze * 0.5, haze * 0.6, haze);

    // vignette — edges pull to void black
    float dist = length(st * vec2(0.7, 1.0));
    float vig  = 1.0 - smoothstep(0.35, 1.1, dist);
    col *= mix(0.0, 1.0, vig);

    // ensure we stay very dark — this is deep space
    col = clamp(col * 0.9, vec3(0.0), vec3(0.22, 0.18, 0.28));

    gl_FragColor = vec4(col, 1.0);
  }
`

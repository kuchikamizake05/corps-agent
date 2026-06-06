'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

const vertex = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = rot(0.52) * p * 2.02 + 0.17;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
  float t = uTime * 0.038;

  vec2 q = uv;
  q += vec2(
    fbm(uv * 1.55 + vec2(t * 1.4, -t * 0.6)),
    fbm(uv * 1.55 + vec2(-t * 0.9, t * 1.2))
  ) * 0.42;

  vec2 r = q;
  r += vec2(
    fbm(q * 2.25 + vec2(-t * 1.8, t)),
    fbm(q * 2.25 + vec2(t, -t * 1.5))
  ) * 0.32;

  float ether = fbm(r * 2.7 + t);
  float liquid = sin((r.x * 2.6 + r.y * 3.1 + ether * 2.4 + t * 3.2)) * 0.5 + 0.5;
  float veins = smoothstep(0.56, 0.82, liquid * 0.62 + ether * 0.48);
  float soft = smoothstep(0.20, 0.92, ether);

  vec3 base = vec3(0.020, 0.022, 0.024);
  vec3 olive = vec3(0.26, 0.29, 0.09);
  vec3 lime = vec3(0.82, 0.84, 0.18);
  vec3 warm = vec3(0.48, 0.36, 0.08);

  vec3 col = base;
  col += olive * soft * 0.34;
  col += lime * veins * 0.22;
  col += warm * pow(liquid, 3.0) * 0.16;

  float vignette = smoothstep(1.02, 0.14, length(uv));
  col *= vignette;
  col += vec3(0.006) * noise(gl_FragCoord.xy + uTime * 14.0);

  gl_FragColor = vec4(col, 1.0);
}
`

export default function LiquidEther() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const renderer = new Renderer({ alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio, 1.35) })
    const gl = renderer.gl
    el.appendChild(gl.canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    let raf = 0
    const resize = () => {
      const w = el.clientWidth || window.innerWidth
      const h = el.clientHeight || window.innerHeight
      renderer.setSize(w, h)
      program.uniforms.uResolution.value = [w, h]
    }

    const render = (time: number) => {
      program.uniforms.uTime.value = time * 0.001
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.remove()
    }
  }, [])

  return <div ref={ref} className="liquid-ether-canvas" />
}

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
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot(0.47) * p * 2.04;
    a *= 0.52;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
  float t = uTime * 0.055;

  vec2 p = uv;
  p.x += 0.14 * sin(p.y * 3.0 + t * 2.0);
  p.y += 0.10 * cos(p.x * 2.4 - t * 1.6);

  float veil = fbm(p * 2.15 + vec2(t, -t * 0.7));
  float bands = sin((p.x + p.y) * 8.0 + veil * 3.5 + t * 6.0) * 0.5 + 0.5;
  float shape = smoothstep(0.24, 0.92, veil * 0.72 + bands * 0.30);

  vec3 ink = vec3(0.025, 0.028, 0.030);
  vec3 accent = vec3(0.86, 0.88, 0.22);
  vec3 blue = vec3(0.10, 0.18, 0.25);
  vec3 col = ink + accent * shape * 0.20 + blue * veil * 0.18;

  float vignette = smoothstep(0.95, 0.18, length(uv));
  col *= vignette;
  col += vec3(0.006) * noise(gl_FragCoord.xy + uTime);

  gl_FragColor = vec4(col, 1.0);
}
`

export default function DarkVeil() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const renderer = new Renderer({ alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio, 1.5) })
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

  return <div ref={ref} className="dark-veil-canvas" />
}

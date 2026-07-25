'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}

export default function SoftAurora({
  speed = 0.6,
  scale = 1.5,
  brightness = 1.0,
  color1 = '#090d16',
  color2 = '#1e3a8a',
  color3 = '#3b82f6',
}: SoftAuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    function resize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', resize);
    resize();

    const vertex = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uSpeed;
      uniform float uScale;
      uniform float uBrightness;

      void main() {
        vec2 uv = vUv * uScale;
        float t = uTime * uSpeed;
        
        float wave = sin(uv.x * 2.0 + t) * 0.5 + 0.5;
        wave += cos(uv.y * 1.5 - t * 0.8) * 0.3;
        
        vec3 color = vec3(0.03, 0.11, 0.27) * wave * uBrightness;
        gl_FragColor = vec4(color, 0.15);
      }
    `;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uBrightness: { value: brightness },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    let animationFrameId: number;

    function update(time: number) {
      animationFrameId = requestAnimationFrame(update);
      program.uniforms.uTime.value = time * 0.001;
      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      if (gl.canvas && container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [speed, scale, brightness, color1, color2, color3]);

  return <div ref={containerRef} className="absolute inset-0 -z-10 w-full h-full overflow-hidden" />;
}

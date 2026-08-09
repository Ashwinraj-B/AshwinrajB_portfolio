import { useEffect, useRef } from "react";

import { useTheme } from "@/hooks/useTheme.tsx";

// WebGL fire shader, ported from a standalone shader export. The GLSL is
// unchanged from the original; only the surrounding JS harness below was
// adapted into a React effect (refs instead of getElementById, cleanup on
// unmount so switching themes doesn't leak WebGL contexts).
const VERTEX_SHADER = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

// Simplex noise for fire
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    vec3 m1 = m * ( 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ) );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m1, g);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    // Animate noise for "heat" and "embers"
    float n = snoise(uv * 3.0 + vec2(0.0, u_time * -0.5));
    n += 0.5 * snoise(uv * 6.0 + vec2(u_time * 0.2, u_time * -0.8));

    // Dragon fire colors: Black to Crimson to Gold
    vec3 color1 = vec3(0.05, 0.0, 0.0); // Dark base
    vec3 color2 = vec3(0.7, 0.1, 0.0); // Crimson
    vec3 color3 = vec3(1.0, 0.8, 0.2); // Gold

    // Mask for bottom-up fire effect
    float fireMask = smoothstep(0.0, 0.5, uv.y + n * 0.2);
    vec3 fire = mix(color1, color2, n + 0.5);
    fire = mix(fire, color3, n * n);

    // Final color with a vignette
    float vignette = 1.0 - length(p * 0.5);
    gl_FragColor = vec4(fire * fireMask * vignette, 1.0);
}`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * WebGL fire/ember shader used as the background behind the hero section on
 * the "dragon" theme. Mounts a <canvas> and drives it with a
 * requestAnimationFrame loop only while the dragon theme is active; fully
 * torn down (rAF cancelled, listeners removed, GL context released) when the
 * theme changes so repeated switching never leaks WebGL contexts.
 */
export function DragonBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (theme !== "dragon") return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncSize) : null;
    resizeObserver?.observe(canvas);
    syncSize();

    const glMaybe = (canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!glMaybe) return;
    const gl: WebGLRenderingContext = glMaybe;

    const vertexShaderMaybe = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShaderMaybe = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const programMaybe = gl.createProgram();
    if (!vertexShaderMaybe || !fragmentShaderMaybe || !programMaybe) return;
    const program: WebGLProgram = programMaybe;

    gl.attachShader(program, vertexShaderMaybe);
    gl.attachShader(program, fragmentShaderMaybe);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    // u_mouse is in pixel coordinates matching u_resolution (ShaderToy convention).
    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    function onMouseMove(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    }
    window.addEventListener("mousemove", onMouseMove);

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId = 0;
    function render(t: number) {
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // Reduced motion: draw a single frame instead of a continuous loop.
      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    }
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [theme]);

  if (theme !== "dragon") return null;

  return (
    <div className="dragon-fx" aria-hidden="true">
      <canvas ref={canvasRef} className="dragon-fx__canvas" />
    </div>
  );
}
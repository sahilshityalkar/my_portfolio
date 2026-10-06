"use client";

import { useEffect, useRef, useState } from "react";
import { Spring, springs } from "@/lib/spring";

/**
 * Lab 001 — Glass.
 *
 * Live type is rasterised into a texture with Canvas 2D (so it uses the real
 * site fonts), then a single fragment shader bends it through a spherical lens:
 * refraction from the lens surface normal, dispersion by sampling R, G and B at
 * slightly different indices, a Fresnel rim and a soft contact shadow.
 *
 * No libraries. Resolution adapts to frame time. The loop sleeps when the lens
 * is at rest.
 */

const VERT = `#version 300 es
in vec2 p;
out vec2 uv;
void main() {
  uv = p * 0.5 + 0.5;
  uv.y = 1.0 - uv.y;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform sampler2D tex;
uniform vec2 res;       // canvas size, px
uniform vec2 lens;      // lens centre, px
uniform float radius;   // px
uniform float power;    // refraction strength
uniform float spread;   // dispersion between channels
uniform vec3 paper;
uniform vec3 ink;

vec2 bend(vec2 frag, vec2 n, float h, float k) {
  // a thicker lens centre bends more; magnify towards the centre
  return (lens + (frag - lens) * (1.0 - k * h) + n * k * radius * 0.08) / res;
}

void main() {
  vec2 frag = uv * res;
  vec2 d = (frag - lens) / radius;
  float r2 = dot(d, d);
  vec4 base = texture(tex, uv);

  // contact shadow cast below the glass
  float sh = smoothstep(1.35, 0.85, length((frag - lens - vec2(0.0, radius * 0.12)) / radius));
  vec3 bg = mix(base.rgb, base.rgb * 0.9, sh * 0.35 * step(1.0, r2));

  if (r2 >= 1.0) { color = vec4(bg, 1.0); return; }

  float h = sqrt(1.0 - r2);         // height of the spherical cap
  vec2 n = d;                       // surface slope
  float k = power * (1.0 - h * 0.35);

  float r = texture(tex, bend(frag, n, h, k * (1.0 - spread))).r;
  float g = texture(tex, bend(frag, n, h, k)).g;
  float b = texture(tex, bend(frag, n, h, k * (1.0 + spread))).b;
  vec3 c = vec3(r, g, b);

  // Fresnel: the rim reflects the room and darkens; a soft highlight upper-left
  float fres = pow(1.0 - h, 3.0);
  c = mix(c, ink, fres * 0.28);
  float spec = smoothstep(0.32, 0.0, length(d - vec2(-0.38, -0.42)));
  c += spec * 0.10;
  float rim = smoothstep(0.965, 1.0, sqrt(r2));
  c = mix(c, ink, rim * 0.55);

  color = vec4(c, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

const hex = (c: string): [number, number, number] => {
  const m = c.trim().replace("#", "");
  const n = parseInt(m.length === 3 ? m.replace(/./g, "$&$&") : m, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export default function GlassCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("Under the glass");
  const [power, setPower] = useState(0.55);
  const [spread, setSpread] = useState(0.06);
  const [failed, setFailed] = useState(false);
  const api = useRef<{ redrawText: (t: string) => void; set: (p: number, s: number) => void } | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) {
      setFailed(true);
      return;
    }

    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = {
      res: u("res"), lens: u("lens"), radius: u("radius"), power: u("power"),
      spread: u("spread"), paper: u("paper"), ink: u("ink"),
    };

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const raster = document.createElement("canvas");
    const rctx = raster.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let label = text;
    let P = power, S = spread;
    let colors = { paper: "#f5f2ec", ink: "#1c1b19", mark: "#a8402a" };
    const x = new Spring(0, springs.glass);
    const y = new Spring(0, springs.glass);
    const rad = new Spring(0, springs.aperture);
    let raf = 0, last = 0, avg = 16.7, slow = 0;

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = { paper: s.getPropertyValue("--paper"), ink: s.getPropertyValue("--ink"), mark: s.getPropertyValue("--mark") };
    };

    const paintText = () => {
      raster.width = canvas.width;
      raster.height = canvas.height;
      const w = raster.width, h = raster.height;
      rctx.fillStyle = colors.paper;
      rctx.fillRect(0, 0, w, h);
      // drafting field so the refraction has structure to bend
      rctx.strokeStyle = colors.ink;
      rctx.globalAlpha = 0.08;
      rctx.lineWidth = 1;
      const step = 24 * dpr;
      rctx.beginPath();
      for (let i = 0; i < w; i += step) { rctx.moveTo(i + 0.5, 0); rctx.lineTo(i + 0.5, h); }
      for (let j = 0; j < h; j += step) { rctx.moveTo(0, j + 0.5); rctx.lineTo(w, j + 0.5); }
      rctx.stroke();
      rctx.globalAlpha = 1;
      const family = getComputedStyle(document.body).fontFamily;
      let size = Math.min(w / Math.max(label.length * 0.48, 4), h * 0.42);
      rctx.font = `italic 360 ${size}px ${family}`;
      const width = rctx.measureText(label).width;
      if (width > w * 0.9) {
        size *= (w * 0.9) / width;
        rctx.font = `italic 360 ${size}px ${family}`;
      }
      rctx.fillStyle = colors.ink;
      rctx.textAlign = "center";
      rctx.textBaseline = "middle";
      rctx.fillText(label, w / 2, h / 2);
      rctx.font = `500 ${11 * dpr}px ${getComputedStyle(document.documentElement).getPropertyValue("--font-plex-mono").trim() || "monospace"}, monospace`;
      rctx.fillStyle = colors.mark;
      rctx.textAlign = "left";
      rctx.fillText("LAB 001 — GLASS", step, h - step);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const first = W === 0;
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (first) {
        x.snap(W * 0.5);
        y.snap(H * 0.5);
        rad.target = Math.min(W, H) * 0.3;
      }
      paintText();
      kick();
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? (now - last) / 1000 : 1 / 60;
      last = now;
      avg += (dt * 1000 - avg) * 0.1;
      if (avg > 24 && dpr > 1 && ++slow > 40) { dpr = 1; slow = 0; resize(); }
      let moving = false;
      for (const s of [x, y, rad]) {
        if (reduced) s.snap(s.target);
        else moving = s.step(dt) || moving;
      }
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform2f(U.lens, x.value * dpr, y.value * dpr);
      gl.uniform1f(U.radius, rad.value * dpr);
      gl.uniform1f(U.power, P);
      gl.uniform1f(U.spread, S);
      gl.uniform3fv(U.paper, hex(colors.paper));
      gl.uniform3fv(U.ink, hex(colors.ink));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (moving) kick();
      else last = 0;
    };
    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      x.target = e.clientX - r.left;
      y.target = e.clientY - r.top;
      kick();
    };
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      toLocal(e);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || canvas.hasPointerCapture(e.pointerId)) toLocal(e);
    };
    const onKey = (e: KeyboardEvent) => {
      const d = e.shiftKey ? 48 : 16;
      const m: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
      const v = m[e.key];
      if (!v) return;
      e.preventDefault();
      x.target = Math.max(0, Math.min(W, x.target + v[0]));
      y.target = Math.max(0, Math.min(H, y.target + v[1]));
      kick();
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };

    readColors();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      readColors();
      paintText();
      kick();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.fonts?.ready.then(() => { paintText(); kick(); });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("keydown", onKey);
    canvas.addEventListener("webglcontextlost", onLost);

    api.current = {
      redrawText: (t) => { label = t || " "; paintText(); kick(); },
      set: (p, s) => { P = p; S = s; kick(); },
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // the GL setup runs once; later changes flow through `api`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => api.current?.redrawText(text), [text]);
  useEffect(() => api.current?.set(power, spread), [power, spread]);

  if (failed) {
    return (
      <div className="wrap">
        <div className="grid aspect-[16/9] place-items-center border border-dashed border-(--rule-strong) bg-paper-2 p-8 text-center">
          <div>
            <p className="t-title italic">{text}</p>
            <p className="t-meta mt-4 text-ink-3">WebGL2 is unavailable here, so the glass is resting. The type is still yours.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <canvas
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label={`The words “${text}” seen through a glass lens. Drag, or use the arrow keys, to move the lens.`}
        className="block aspect-[4/5] w-full cursor-grab touch-none bg-paper-2 active:cursor-grabbing sm:aspect-[16/9]"
      />
      <div className="t-meta mt-4 grid gap-6 border-t border-rule pt-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="flex flex-col gap-2">
          <span className="text-ink-3">Type under the glass</span>
          <input
            value={text}
            maxLength={28}
            onChange={(e) => setText(e.target.value)}
            className="border-b border-(--rule-strong) bg-transparent py-1 font-serif text-xl normal-case tracking-normal text-ink outline-none focus:border-mark"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-ink-3">Curvature {power.toFixed(2)}</span>
          <input type="range" min={0.1} max={0.9} step={0.01} value={power} onChange={(e) => setPower(+e.target.value)} className="accent-mark" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-ink-3">Dispersion {spread.toFixed(2)}</span>
          <input type="range" min={0} max={0.2} step={0.005} value={spread} onChange={(e) => setSpread(+e.target.value)} className="accent-mark" />
        </label>
      </div>
      <p className="t-meta mt-6 pb-24 text-ink-3">Drag the glass. Arrow keys move it; hold Shift to move further.</p>
    </div>
  );
}

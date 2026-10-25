import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Same card and ride as the live CtaTunnel, so the two compare one to one.
const CARD_MAX_W = 1216;
const CARD_GUTTER = 24;
const CARD_H = (vw: number, vh: number) =>
  vh > vw ? Math.min(vh * 0.72, 640) : Math.min(Math.max(vh * 0.55, 420), 560);
const CARD_RADIUS = 24;
const EXPAND_END = 0.4;

const WORD_GAP = 0.12;
// The tunnel's color at the screen edges (measured on an iPhone screenshot).
const TUNNEL_EDGE = "#0a0a2c";
const WORD_ANGLES = [-35, 145, 35, -145, -75, 105, 75, -105, -55, 125, 55, -125];

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

// Everything is drawn in one pass on the GPU: the light, the tunnel, the grain
// and the card's rounded edge (so no clip-path, no canvas 2D, no SVG repaints).
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uProg;
uniform float uExpand;
uniform float uExit;   // 0→1 as the stage scrolls away under the footer
uniform float uTravel;
uniform float uWarp;
uniform vec3 uCard;   // inset x, inset y, corner radius (device px)
uniform vec2 uMouse;  // pointer offset from the center (device px, y up)
uniform float uVariant;

const float TAU = 6.28318530718;

// Dave Hoskins' hash: no visible bands even at large pixel coordinates.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// Core to rim: orange, ember, plum, indigo, night.
vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c0 = vec3(1.000, 0.478, 0.102);
  vec3 c1 = vec3(0.824, 0.306, 0.133);
  vec3 c2 = vec3(0.369, 0.169, 0.310);
  vec3 c3 = vec3(0.086, 0.102, 0.361);
  vec3 c4 = vec3(0.027, 0.043, 0.200);
  vec3 c5 = vec3(0.004, 0.008, 0.047);
  if (t < 0.12) return mix(c0, c1, t / 0.12);
  if (t < 0.27) return mix(c1, c2, (t - 0.12) / 0.15);
  if (t < 0.46) return mix(c2, c3, (t - 0.27) / 0.19);
  if (t < 0.72) return mix(c3, c4, (t - 0.46) / 0.26);
  return mix(c4, c5, (t - 0.72) / 0.28);
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 c = gl_FragCoord.xy - 0.5 * uRes;
  float mask = clamp(0.5 - sdRoundBox(c, 0.5 * uRes - uCard.xy, uCard.z), 0.0, 1.0);
  if (mask <= 0.0) { gl_FragColor = vec4(0.0); return; }

  float vmax = max(uRes.x, uRes.y);
  vec2 p = c / vmax;
  float pr = length(p);
  float ang = atan(p.y, p.x);
  // Depth along the tunnel: even steps in log radius are even steps in depth.
  // 0 = the vanishing point, 1 = past the screen's corners.
  float s = log(max(pr, 1e-4) / 0.03) / log(60.0);
  float t = uTime;

  // The light leans toward the pointer while it's a card, recenters as we dive.
  vec2 lp = p - (uMouse / vmax) * 0.55 * (1.0 - uExpand);
  float r = length(lp);

  vec3 col;
  if (uVariant < 0.5) {
    // Smoke: the light's edge is warped by drifting noise, pulled in as we travel.
    vec2 wq = lp * 2.6;
    float n = fbm(wq + vec2(t * 0.04, -t * 0.03) + 1.2 * fbm(wq * 1.7 - t * 0.05 + uTravel));
    col = ramp(r * (1.55 - uProg * 0.5) + (n - 0.5) * 0.24);

    // Rings: a crisp core in a soft halo, flowing outward with the scroll.
    float ph = s * 10.0 - (uTravel + t * 0.012) * 10.0;
    float dd = abs(fract(ph) - 0.5);
    dd = 0.5 - dd;
    float ring = 0.55 * exp(-pow(dd / 0.035, 2.0)) + 0.3 * exp(-pow(dd / 0.16, 2.0));
    float ringFade = smoothstep(0.02, 0.3, s) * (0.22 + 0.78 * uExpand);
    col += vec3(0.62, 0.68, 1.0) * ring * ringFade * 0.22;

    // A twisting cage of lines, only while deep in the tunnel.
    float cage = smoothstep(0.42, 0.55, uProg) * (1.0 - smoothstep(0.8, 0.92, uProg));
    if (cage > 0.0) {
      float la = (ang / TAU + 0.5) * 28.0 + s * 2.5 + uTravel * 1.5;
      float dl = (0.5 - abs(fract(la) - 0.5)) * (TAU * pr * vmax / 28.0);
      float line = 1.0 - smoothstep(0.0, 1.3, dl);
      col += vec3(0.65, 0.7, 1.0) * line * smoothstep(0.05, 0.45, s) * cage * 0.3;
    }
  } else {
    // Warp: the light swirls (hue drifts with the angle), and streaks of light
    // rush past, stretching with the scroll speed.
    float swirl = ang + r * 6.0 - t * 0.15 - uTravel * 2.0;
    float n = fbm(vec2(cos(swirl), sin(swirl)) * 1.5 + r * 3.0 + t * 0.03);
    col = ramp(r * (1.6 - uProg * 0.55) + (n - 0.5) * 0.3);
    col = mix(col, col.bgr * vec3(1.0, 0.8, 1.2), 0.18 * smoothstep(0.1, 0.5, r) * (n - 0.3));

    float len = 0.025 + 0.06 * uExpand + 0.32 * uWarp;
    for (int k = 0; k < 2; k++) {
      float cells = k == 0 ? 90.0 : 150.0;
      float fa = (ang / TAU + 0.5) * cells;
      float cell = floor(fa);
      float rnd = hash(vec2(cell, float(k) * 7.0 + 1.0));
      float head = fract(rnd + (uTravel * 1.6 + t * 0.025) * (0.6 + 0.8 * rnd)) * 1.3;
      float along = clamp((head - s) / len, 0.0, 1.0);
      float on = step(s, head) * step(head - len, s);
      float dl = (0.5 - abs(fract(fa) - 0.5)) * (TAU * pr * vmax / cells);
      float line = 1.0 - smoothstep(0.0, 1.0 + 1.5 * s, dl);
      float streak = on * line * (1.0 - along) * smoothstep(0.05, 0.4, s) * step(0.45, rnd);
      vec3 tint = mix(vec3(1.0, 0.62, 0.35), vec3(0.75, 0.8, 1.0), smoothstep(0.2, 0.8, s));
      col += tint * streak * (0.35 + 0.65 * uExpand) * 0.55 * (1.0 - uExit);
    }
  }

  // The light at the end of the tunnel opens up as we go in.
  // Kept small and dim enough that the white title stays readable over it.
  col += vec3(1.0, 0.55, 0.25) * exp(-r * r / (0.0015 + 0.006 * uProg)) * (0.08 + 0.3 * uProg);
  col *= 1.0 - 0.35 * smoothstep(0.35, 0.8, pr);
  // Film grain, still like the site's grain tile: a moving one reads as TV static.
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.04;

  gl_FragColor = vec4(col * mask, mask);
}
`;

function compile(gl: WebGLRenderingContext) {
  const shader = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "shader");
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "program");
  return prog;
}

type TunnelOptions = {
  section: HTMLElement;
  stage: HTMLDivElement;
  canvas: HTMLCanvasElement;
  words: HTMLDivElement;
  content: HTMLDivElement;
  variant: "rings" | "warp";
};

export function setupTunnel({ section, stage, canvas, words, content, variant }: TunnelOptions) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "high-performance" });
  if (!gl) {
    stage.dataset.fallback = "true";
    return;
  }
  const gsap = setupGsap();
  const reduced = prefersReducedMotion();
  const wordEls = Array.from(words.children) as HTMLElement[];

  const prog = compile(gl);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // One triangle that covers the screen.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const U = {
    res: u("uRes"), time: u("uTime"), prog: u("uProg"), expand: u("uExpand"), exit: u("uExit"), travel: u("uTravel"),
    warp: u("uWarp"), card: u("uCard"), mouse: u("uMouse"), variant: u("uVariant"),
  };
  gl.uniform1f(U.variant, variant === "warp" ? 1 : 0);

  // Soft content, so retina screens get ~1 device px per CSS px, not 2.
  let res = 1;
  const resize = () => {
    res = window.devicePixelRatio >= 2 ? 1 : 0.75;
    const w = Math.max(1, Math.round(stage.clientWidth * res));
    const h = Math.max(1, Math.round(stage.clientHeight * res));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const state = { progress: 0, exit: 0, expand: 0, warp: 0, warpTarget: 0, mx: 0, my: 0, mxTo: 0, myTo: 0 };
  const start = performance.now();

  const draw = () => {
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const e = state.expand;
    const x = Math.max(CARD_GUTTER, (vw - CARD_MAX_W) / 2) * (1 - e);
    const y = Math.max(0, (vh - CARD_H(vw, vh)) / 2) * (1 - e);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, reduced ? 0 : (performance.now() - start) / 1000);
    gl.uniform1f(U.prog, state.progress);
    gl.uniform1f(U.expand, e);
    gl.uniform1f(U.travel, state.progress * 2.2);
    gl.uniform1f(U.exit, state.exit);
    gl.uniform1f(U.warp, state.warp);
    gl.uniform3f(U.card, x * res, y * res, CARD_RADIUS * (1 - e) * res);
    gl.uniform2f(U.mouse, state.mx * res, -state.my * res);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // DOM that rides along: the words and the title's slow push-in.
  const layout = (progress: number) => {
    state.progress = progress;
    state.expand = gsap.parseEase("brand")(gsap.utils.clamp(0, 1, progress / EXPAND_END));
    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const y = Math.max(0, (vh - CARD_H(vw, vh)) / 2) * (1 - state.expand);
    stage.dataset.navDark = y < 36 ? "true" : "false";
    // Fully grown, the card fills the stage: give the (sticky) stage the
    // tunnel's edge color behind the canvas, for Safari's bars (BrowserTint).
    stage.style.backgroundColor = state.expand >= 1 ? TUNNEL_EDGE : "";

    const t = gsap.utils.clamp(0, 1, (progress - EXPAND_END * 0.75) / (1 - EXPAND_END * 0.75));
    const portrait = vh > vw;
    const spreadX = portrait ? vw * 0.5 : Math.max(vw, vh) * 0.55;
    const spreadY = portrait ? vh * 0.6 : Math.max(vw, vh) * 0.55 * 0.7;
    wordEls.forEach((word, i) => {
      const z = t * (1 + (words.children.length - 1) * WORD_GAP) - i * WORD_GAP;
      if (z <= 0 || z >= 1) {
        word.style.visibility = "hidden";
        return;
      }
      word.style.visibility = "visible";
      const scale = 0.04 * Math.pow(60, z);
      const a = (WORD_ANGLES[i % WORD_ANGLES.length] * Math.PI) / 180;
      const fade = gsap.utils.clamp(0, 1, (z - 0.45) / 0.15) * gsap.utils.clamp(0, 1, (1 - z) / 0.15);
      word.style.transform = `translate(-50%, -50%) translate(${Math.cos(a) * spreadX * scale}px, ${Math.sin(a) * spreadY * scale}px) scale(${scale})`;
      word.style.opacity = String(fade);
    });
    content.style.transform = `scale(${1 + t * 0.08})`;
    if (reduced) draw();
  };

  // While on screen the shader runs every frame (the light drifts on its
  // own); off screen nothing is drawn at all.
  const tick = () => {
    state.warpTarget *= 0.92;
    state.warp += (state.warpTarget - state.warp) * 0.12;
    state.mx += (state.mxTo - state.mx) * 0.06;
    state.my += (state.myTo - state.my) * 0.06;
    draw();
  };
  let running = false;
  const io = new IntersectionObserver(([entry]) => {
    const visible = entry.isIntersecting;
    if (visible && !running && !reduced) gsap.ticker.add(tick);
    if (!visible && running) gsap.ticker.remove(tick);
    running = visible && !reduced;
  });
  io.observe(section);

  const ro = new ResizeObserver(() => {
    resize();
    draw();
  });
  ro.observe(stage);
  resize();

  const st = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      state.warpTarget = Math.max(state.warpTarget, Math.min(1, Math.abs(self.getVelocity()) / 5000));
      layout(self.progress);
    },
    onRefresh: (self) => layout(self.progress),
  });
  layout(0);
  draw();

  // Once the ride ends the stage scrolls away under the footer: fade the
  // title, the button and the streaks out, so only the light is left.
  const exit = ScrollTrigger.create({
    trigger: section,
    start: "bottom bottom",
    end: "bottom 65%",
    onUpdate: (self) => {
      state.exit = self.progress;
      if (reduced) draw();
      const el = content;
      if (!el) return;
      el.style.opacity = String(1 - self.progress);
      el.style.filter = self.progress > 0 ? `blur(${self.progress * 8}px)` : "";
    },
  });

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const onMove = (ev: PointerEvent) => {
    const rect = stage.getBoundingClientRect();
    state.mxTo = ev.clientX - rect.left - rect.width / 2;
    state.myTo = ev.clientY - rect.top - rect.height / 2;
  };
  const onLeave = () => {
    state.mxTo = 0;
    state.myTo = 0;
  };
  if (finePointer) {
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
  }

  return () => {
    st.kill();
    exit.kill();
    io.disconnect();
    ro.disconnect();
    gsap.ticker.remove(tick);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerleave", onLeave);
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
  };
}

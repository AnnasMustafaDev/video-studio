// Motion Studio engine. Everything here is a pure function of t, so the same
// composition plays live in the review player and renders frame-exact.
import { gsap } from '../node_modules/gsap/index.js';

export { gsap };
export const $ = (s) => document.querySelector(s);
export const $$ = (s) => [...document.querySelectorAll(s)];

// ------------------------------------------------------------------ easing
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
/** closed-form spring step response, normalised to end exactly at 1 */
export function spring(z = 0.82, w = 9) {
  const wd = w * Math.sqrt(1 - z * z);
  const raw = (t) => 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  const end = raw(1);
  return (t) => (t <= 0 ? 0 : t >= 1 ? 1 : raw(t) / end);
}
export const EZ = {
  lin: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 4),
  in: (t) => t * t * t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: spring(0.82, 9),
};
/** eased progress of t inside [a, b] */
export const tw = (t, a, b, e = 'out') => EZ[e](clamp((t - a) / Math.max(1e-6, b - a)));
/** 1 inside [a, b] with eased edges of length d */
export const live = (t, a, b, d = 0.3) => tw(t, a, a + d) * (1 - tw(t, b - d, b, 'in'));

// ------------------------------------------------------------------ time
/** S/E scene start/end, L/LE line start/end, W spoken word start (throws if missing) */
export function timeHelpers(TL) {
  const SC = Object.fromEntries(TL.scenes.map((s) => [s.id, s]));
  const LN = Object.fromEntries(TL.lines.map((l) => [l.id, l]));
  const need = (m, id, kind) => {
    if (!m[id]) throw new Error(`unknown ${kind} "${id}"`);
    return m[id];
  };
  const words = (l) => {
    if (l.words?.length) return l.words;
    // draft before the voice exists: spread the words evenly over the line
    const ws = l.text.split(/\s+/).filter(Boolean);
    const d = (l.end - l.at) / ws.length;
    return ws.map((w, i) => ({ w, a: l.at + i * d, b: l.at + (i + 1) * d }));
  };
  return {
    S: (id, o = 0) => need(SC, id, 'scene').start + o,
    E: (id, o = 0) => need(SC, id, 'scene').end + o,
    L: (id, o = 0) => need(LN, id, 'line').at + o,
    LE: (id, o = 0) => need(LN, id, 'line').end + o,
    W: (id, i) => {
      const w = words(need(LN, id, 'line'))[i];
      if (!w) throw new Error(`word ${i} is not spoken in ${id}`);
      return w.a;
    },
    DUR: TL.duration,
  };
}

/** one paused GSAP timeline for kinetic type, a label per spoken line */
export function createMaster(TL) {
  const master = gsap.timeline({ paused: true, defaults: { duration: 0.5, ease: 'expo.out' } });
  TL.lines.forEach((l) => master.addLabel(l.id, l.at));
  return master;
}

/**
 * caption(host, words, out, {sub, now}) — words: [text, line, wordIndex, accent?, offset?].
 * Each word rises on its spoken word; the line blurs out at `out`. Max five words.
 */
export function captions(master, W) {
  return function caption(host, words, out, { sub, now } = {}) {
    const el = document.createElement('div');
    el.className = 'cap';
    const spans = words.map(([txt, id, i, a, dt = 0]) => {
      const w = document.createElement('span');
      w.className = `w${a ? ' a' : ''}`;
      w.textContent = txt;
      el.append(w);
      return { w, at: W(id, i) - 0.06 + dt };
    });
    let subEl = null;
    if (sub) {
      subEl = document.createElement('div');
      subEl.className = 'sub';
      subEl.textContent = sub;
      el.append(subEl);
    }
    host.append(el);
    for (const { w, at } of spans) {
      if (now) continue; // frame 0 already reads as a title card
      master.fromTo(w, { yPercent: 42, opacity: 0, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)' }, at);
    }
    if (subEl) master.fromTo(subEl, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }, spans[spans.length - 1].at + 0.25);
    if (out != null) master.to(el, { opacity: 0, y: -14, filter: 'blur(6px)', duration: 0.26, ease: 'power2.in' }, out);
    return el;
  };
}

// ------------------------------------------------------------------ screen camera
/**
 * Screen-recorder camera: the window frame stays, the recording zooms inside it.
 * win: stage rect of the window; rec: recorded css size. key(t, scale, fx, fy, ease) / hold(t).
 */
export function screenCamera({ camEl, win, rec = { w: 1600, h: 900 } }) {
  const K = win.w / rec.w;
  const keys = [];
  const cam = {
    view: { s: K, tx: 0, ty: 0, ox: 0, oy: 0 },
    key(t, s, fx, fy, e = 'inOut') {
      const prev = keys[keys.length - 1];
      keys.push({ t: prev ? Math.max(t, prev.t) : t, s, fx, fy, e });
      return cam;
    },
    hold(t) {
      const prev = keys[keys.length - 1];
      keys.push({ ...prev, t: Math.max(t, prev.t), e: 'lin' });
      return cam;
    },
    at(t) {
      if (!keys.length) return { s: 1, fx: rec.w / 2, fy: rec.h / 2 };
      let i = 0;
      while (i < keys.length - 1 && keys[i + 1].t <= t) i++;
      const a = keys[i];
      const b = keys[Math.min(i + 1, keys.length - 1)];
      const u = a === b ? 0 : EZ[b.e](clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), u)), fx: lerp(a.fx, b.fx, u), fy: lerp(a.fy, b.fy, u) };
    },
    /** apply the camera at t; ox/oy = extra offset of the whole window on stage */
    apply(t, ox = 0, oy = 0) {
      const c = cam.at(t);
      const s = c.s * K;
      const tx = clamp(win.w / 2 - c.fx * s, win.w - rec.w * s, 0);
      const ty = clamp(win.h / 2 - c.fy * s, win.h - rec.h * s, 0);
      camEl.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
      cam.view = { s, tx, ty, ox, oy };
    },
    /** recorded css px → stage px */
    toStage(cx, cy) {
      const v = cam.view;
      return { x: win.x + v.ox + v.tx + cx * v.s, y: win.y + v.oy + v.ty + cy * v.s };
    },
  };
  return cam;
}

// ------------------------------------------------------------------ spotlight
/** list: [start, end, [x0, y0, x1, y1] in recorded css]; spots that touch glide with a liquid edge */
export function spotlight(el, list, cam, pad = 8) {
  return (t) => {
    let on = 0;
    let r = null;
    for (let k = 0; k < list.length; k++) {
      const [a, b, rect] = list[k];
      if (t < a - 0.01 || t > b + 0.35) continue;
      const prev = list[k - 1];
      const chained = prev && Math.abs(prev[1] - a) < 0.02;
      if (chained) {
        // the edge in the direction of travel leads, the other trails
        const lead = tw(t, a, a + 0.3, 'inOut');
        const trail = tw(t, a + 0.1, a + 0.52, 'inOut');
        const down = rect[1] > prev[2][1];
        const uOf = [lead, down ? trail : lead, lead, down ? lead : trail];
        r = prev[2].map((v, j) => lerp(v, rect[j], uOf[j]));
      } else r = rect;
      const next = list[k + 1];
      const leaves = !(next && Math.abs(next[0] - b) < 0.02);
      on = (chained ? 1 : tw(t, a, a + 0.3)) * (leaves ? 1 - tw(t, b, b + 0.3, 'in') : 1);
      if (t <= b || leaves) break;
    }
    el.style.opacity = on;
    if (!r) return;
    const v = cam.view;
    el.style.transform = `translate(${v.tx + r[0] * v.s - pad}px, ${v.ty + r[1] * v.s - pad}px)`;
    el.style.width = `${(r[2] - r[0]) * v.s + pad * 2}px`;
    el.style.height = `${(r[3] - r[1]) * v.s + pad * 2}px`;
  };
}

// ------------------------------------------------------------------ cursor
/** clicks: [{at, from:[cx,cy], to:[cx,cy]}] in recorded css; glides in, presses, rings, leaves */
export function cursor(cursorEl, ringEl, clicks, cam) {
  return (t) => {
    let c = null;
    for (const k of clicks) {
      if (t < k.at - 1.15 || t > k.at + 0.55) continue;
      const u = tw(t, k.at - 0.95, k.at - 0.08, 'inOut');
      const p = cam.toStage(lerp(k.from[0], k.to[0], u), lerp(k.from[1], k.to[1], u));
      const vis = tw(t, k.at - 1.15, k.at - 0.9) * (1 - tw(t, k.at + 0.3, k.at + 0.55, 'lin'));
      const press = Math.max(0, 1 - Math.abs(t - k.at) / 0.08);
      c = { ...p, vis, press, at: k.at, tilt: (1 - u) * -12 * Math.sign(k.to[0] - k.from[0]) };
      break;
    }
    if (!c) {
      cursorEl.style.opacity = 0;
      ringEl.style.opacity = 0;
      return;
    }
    cursorEl.style.opacity = c.vis;
    cursorEl.style.transform = `translate(${c.x}px, ${c.y}px) rotate(${c.tilt}deg) scale(${1 - c.press * 0.15})`;
    const ru = tw(t, c.at, c.at + 0.5);
    ringEl.style.opacity = t >= c.at ? 0.9 * (1 - ru) : 0;
    ringEl.style.transform = `translate(${c.x}px, ${c.y}px) scale(${0.3 + ru})`;
  };
}

// ------------------------------------------------------------------ subtitles
export function subtitles(el, TL, field) {
  const span = el.querySelector('span');
  const cues = TL.lines.map((l, i) => ({ a: l.at, b: Math.min(l.end + 0.25, TL.lines[i + 1]?.at ?? Infinity), text: (l[field] ?? '').replace(/\s[–—]\s/g, ', ') }));
  return (t, on) => {
    const c = on ? cues.find((x) => t >= x.a && t < x.b && x.text) : null;
    el.style.opacity = c ? Math.min(1, (t - c.a) / 0.12, (c.b - t) / 0.12) : 0;
    if (c) span.textContent = c.text;
  };
}

// ------------------------------------------------------------------ images
/** set an <img> src once per change; awaits decode only while rendering */
export async function setSrc(img, src) {
  if (img.getAttribute('src') === src) return;
  img.setAttribute('src', src);
  if (window.__rendering) await img.decode().catch(() => {});
}

// ------------------------------------------------------------------ player
/**
 * Review player + renderer hooks. frame(t, opts) draws one frame.
 * Audio: the first url that loads (mix, then music); otherwise a silent clock.
 */
export async function player({ frame, duration, audio = [], fps = 60, sfx = [], lines = [] }) {
  const q = new URLSearchParams(location.search);
  const opts = { subs: q.get('subs') ?? '' };
  const stage = $('#stage');
  const vp = $('#viewport');
  const fit = () => {
    const k = Math.min(vp.clientWidth / 1920, vp.clientHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${k})`;
  };
  new ResizeObserver(fit).observe(vp);
  fit();

  let el = null;
  for (const url of audio) {
    const ok = await fetch(url, { method: 'HEAD' }).then((r) => r.status === 200).catch(() => false);
    if (ok) {
      el = new Audio(url);
      el.preload = 'auto';
      break;
    }
  }
  // silent clock when there is no audio yet
  let t0 = 0;
  let base = 0;
  let playing = false;
  const now = () => (el ? el.currentTime : playing ? base + (performance.now() - t0) / 1000 : base);
  const setNow = (t) => {
    if (el) el.currentTime = t;
    else {
      base = t;
      t0 = performance.now();
    }
  };

  const playBtn = $('#play');
  const scrub = $('#scrub');
  const timeEl = $('#time');
  const subsToggle = $('#subsToggle');
  subsToggle.checked = !!opts.subs;
  const show = (t) => {
    frame(Math.min(t, duration), opts);
    scrub.value = String(Math.round((t / duration) * 1000));
    timeEl.textContent = `${t.toFixed(1)} s`;
  };
  let raf = 0;
  const loop = () => {
    const t = now();
    show(t);
    if (t >= duration) return stop();
    if (el ? !el.paused : playing) raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    el?.pause();
    playing = false;
    base = Math.min(now(), duration);
    playBtn.textContent = 'Play';
    cancelAnimationFrame(raf);
  };
  const toggle = () => {
    if (el ? !el.paused : playing) return stop();
    if (now() >= duration - 0.05) setNow(0);
    if (el) el.play();
    else {
      t0 = performance.now();
      playing = true;
    }
    playBtn.textContent = 'Pause';
    raf = requestAnimationFrame(loop);
  };
  playBtn.onclick = toggle;
  addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    toggle();
  });
  scrub.oninput = () => {
    setNow((Number(scrub.value) / 1000) * duration);
    show(now());
  };
  subsToggle.onchange = () => {
    opts.subs = subsToggle.checked ? 'de' : '';
    show(now());
  };

  window.__seek = async (t) => {
    window.__rendering = true;
    await frame(Math.max(0, Math.min(t, duration)), opts);
  };
  window.__timing = { fps, duration, sfx, lines };
  if (q.has('render')) document.body.classList.add('render');
  await document.fonts.ready;
  show(Number(q.get('t') ?? 0));
  window.__ready = true;
}

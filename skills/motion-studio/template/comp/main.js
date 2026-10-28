// The composition. Three scenes as a starting point: a dark hook, the product
// in a window (zoom, spotlight, cursor), and an end card. Replace the content,
// keep the method: every change lands on a spoken word via W(line, wordIndex).
import { $, captions, clamp, createMaster, cursor, gsap, lerp, player, screenCamera, spotlight, subtitles, timeHelpers, tw } from './engine.js';

const [TL, SCRIPT] = await Promise.all([fetch('../build/timeline.json').then((r) => r.json()), fetch('../script.json').then((r) => r.json())]);
const { S, E, L, LE, W, DUR } = timeHelpers(TL);
const master = createMaster(TL);
const caption = captions(master, W);

// ------------------------------------------------------------------ captions (max five words each)
caption($('#hook'), [['Four', 'h1', 0], ['hours.', 'h1', 1]], S('product', -0.3), { now: true });
caption($('#hook'), [['Every', 'h1', 2], ['week.', 'h1', 3, true]], S('product', -0.3));
const cap = $('#cap');
caption(cap, [['It', 'p1', 1], ['builds', 'p1', 2], ['itself.', 'p1', 3, true]], L('p2', -0.3));
caption(cap, [['One', 'p2', 0], ['click.', 'p2', 1, true], ['Done.', 'p2', 4]], E('product', -0.4), { sub: 'Replace with the real result and its reference' });

// ------------------------------------------------------------------ window + camera
const win = { x: 260, y: 236, w: 1400, h: 788 };
const cam = screenCamera({ camEl: $('.cam'), win });
cam.key(0, 1, 800, 450).hold(L('p1', 0.2)).key(L('p1', 1.0), 1.6, 560, 330).hold(L('p2', 0.1)).key(L('p2', 0.9), 1, 800, 450);

const drawSpot = spotlight($('#spot'), [[L('p1', 0.9), L('p2', 0.1), [420, 240, 700, 420]]], cam);
const CLICK = W('p2', 1);
const drawCursor = cursor($('#cursor'), $('#ring'), [{ at: CLICK, from: [1100, 700], to: [1360, 120] }], cam);
const drawSubs = subtitles($('#subs'), TL, 'de');

// ------------------------------------------------------------------ end card on the master timeline
{
  const pa = L('e1', -0.05);
  master.set('#poster', { opacity: 1 }, pa);
  master.fromTo('#poster .prule', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, pa);
  master.fromTo('#poster .ptitle span', { yPercent: 105 }, { yPercent: 0, duration: 0.9 }, pa + 0.1);
  master.fromTo('#poster .ptag', { y: 18, opacity: 0 }, { y: 0, opacity: 1 }, pa + 0.5);
  master.fromTo('#poster .pcta', { y: 18, opacity: 0 }, { y: 0, opacity: 1 }, pa + 0.8);
}

// ------------------------------------------------------------------ sfx cue sheet = the hits table (peak times)
// Mirror of the storyboard's hits table and the only place SFX are added. The renderer writes it to
// build/comp_timing.json; check the final mix with motion-review: inspect.mjs sync <mp4> build/comp_timing.json
const SFX = [
  { name: 'whoosh', at: E('hook'), vol: 0.45 },
  { name: 'tick', at: CLICK, vol: 0.4 },
  { name: 'whoosh', at: E('product'), vol: 0.4 },
];

// ------------------------------------------------------------------ frame
async function frame(t, opts) {
  master.time(t, true);

  // dark → light: a flood from the last word of the hook
  const flood = tw(t, E('hook', -0.35), E('hook', 0.15), 'in');
  $('#light').style.clipPath = `circle(${flood * 2300}px at 960px 600px)`;

  // the window rises in, the camera zooms inside it
  const wIn = tw(t, S('product', -0.1), S('product', 0.8), 'spring');
  $('#win').style.opacity = clamp(wIn * 1.5);
  $('#win').style.transform = `translateY(${(1 - wIn) * 160}px) scale(${lerp(0.94, 1, wIn)})`;
  cam.apply(t);
  drawSpot(t);
  drawCursor(t);

  // light → end card: navy floods out of the click
  const fl = tw(t, E('product', -0.35), E('product', 0.1), 'in');
  $('#end').style.clipPath = `circle(${fl * 2300}px at 1400px 300px)`;
  $('#brand').style.opacity = 1 - tw(t, E('hook', -0.4), E('hook', -0.1), 'lin') + tw(t, S('end', 0.3), S('end', 0.8));

  drawSubs(t, !!opts.subs);
}

await player({
  frame,
  duration: DUR,
  fps: SCRIPT.fps ?? 60,
  audio: ['../audio/mix.wav', '../audio/music.wav'],
  sfx: SFX,
  lines: TL.lines.map(({ id, at, end }) => ({ id, at, end })),
});
void gsap;

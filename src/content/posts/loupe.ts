import type { Post } from "../writing";

/**
 * Every claim here is from the site's own code (src/components/Loupe.tsx,
 * src/components/glass/draw.ts, src/components/glass/model.ts),
 * docs/DECISIONS.md (Performance, fifth pass) and every number from the
 * commit log: b9c3fa7 (culling, 25 to 21.7 ms), 1ad4658 (the cached scene,
 * before and after), 50d5a38 (the review fixes) and c2976c0 (the
 * transitionend filter). The CDP profile and software rasterisation are
 * from the work sessions, as the author recorded them.
 */
export const loupe: Post = {
  slug: "profiling-a-canvas-loupe",
  title: "A canvas loupe at 4x CPU: 50 ms to 16.8 ms at p95",
  dek: "Culling draw calls barely helped. A CPU profile showed the browser rasterising the whole viewport on every pointer move; caching the scene and shrinking the canvas to the lens fixed it.",
  date: "2026-11-03",
  tags: ["performance", "canvas", "profiling"],
  links: [{ label: "See the glass on the home page", href: "/" }],
  body: [
    {
      type: "p",
      text: "The glass on my portfolio spent most of each frame rasterising pixels that had not changed. Culling what it drew helped a little; caching the scene and shrinking the canvas to the lens is what fixed it. This is how a profile, not a second guess, found that.",
    },
    {
      type: "p",
      text: "Press L on the home page and a glass appears under the pointer. Inside it the page turns into its own engineering drawing: component boxes with their sizes, display type redrawn as outlines with its baseline and cap height, every line of text, the column grid. None of it is pre-drawn: it is measured from the live DOM and painted onto a 2D canvas, with no animation library. Click and the lens floods across the viewport into a full blueprint. Esc closes it.",
    },

    { type: "h", text: "The budget" },
    {
      type: "p",
      text: "My target is 60 fps while the glass moves on a normal laptop. To see how it behaves on a slow one, I measure it in Chromium through Playwright and the Chrome DevTools Protocol (CDP), with the CPU throttled 4x. At 60 Hz a frame has 16.7 ms. Under that throttle the moving lens averaged 25 ms a frame.",
    },

    { type: "h", text: "First attempt: draw less" },
    {
      type: "p",
      text: "The obvious suspect was the drawing itself. `draw()` walked every measured box, word and line box on screen, even though the lens is a circle at most 380 px across. So I culled: in lens mode, anything outside the lens's bounding box is skipped, and the background fields are filled only over that box.",
    },
    {
      type: "code",
      lang: "ts",
      caption: "glass/draw.ts: the culling bounds",
      code: `// Only what the glass can show is drawn: in lens mode that is the lens's
// bounding box, not the viewport. On a slow CPU this is most of the frame.
const lens = !f.scan && r < Math.max(W, H) * 0.45;
const X0 = lens ? cx - r - 2 : 0;
const X1 = lens ? cx + r + 2 : W;
const Y0 = lens ? cy - r - 2 : 0;
const Y1 = lens ? cy + r + 2 : H;
const out = (x: number, y: number, w: number, h: number) =>
  x > X1 || x + w < X0 || y > Y1 || y + h < Y0;`,
    },
    {
      type: "p",
      text: "It helped less than I expected: the average went from 25 ms to 21.7 ms. Measured again just before the next change, it read 21.8 ms, with a 95th percentile (p95) of 50 ms. One frame in twenty took 50 ms or more, three refreshes at 60 Hz.",
    },

    { type: "h", text: "The profile pointed at pixels" },
    {
      type: "p",
      text: "Instead of guessing a second time, I recorded a CPU profile over CDP while the throttled lens moved. Most of the time sat under `(program)`, the profiler's bucket for native work that is not attributed to any JavaScript function. Here that was the browser rasterising the canvas.",
    },
    {
      type: "p",
      text: "Culling had cut the number of drawing commands, not the pixels. The visible canvas was still the size of the viewport at device pixel ratio, and it was cleared and painted again on every pointer move. The browser was rasterising the whole viewport for a lens a fraction of its size.",
    },

    { type: "h", text: "The scene does not move with the pointer" },
    {
      type: "p",
      text: "What actually changes between two frames while the lens moves? The drawing depends on the scroll position, the viewport size, the device pixel ratio, the measured model, the focus ring and the theme. The pointer is not on that list. Moving the lens only changes which part of an unchanged picture is visible.",
    },
    {
      type: "p",
      text: "So the scene is now rendered once into an offscreen canvas the size of the viewport, and each frame copies only the square around the lens, clipped to a circle, then draws the rim on top:",
    },
    {
      type: "code",
      lang: "ts",
      caption: "glass/draw.ts: drawLens, the per-frame blit",
      code: `ctx.beginPath();
ctx.arc(cx, cy, Math.max(r, 0), 0, Math.PI * 2);
ctx.clip();
const x0 = Math.max(0, Math.floor(cx - r - 1));
const y0 = Math.max(0, Math.floor(cy - r - 1));
const x1 = Math.min(W, Math.ceil(cx + r + 1));
const y1 = Math.min(H, Math.ceil(cy + r + 1));
if (x1 > x0 && y1 > y0) {
  const k = scene.width / W; // the scene's device pixels per CSS px
  ctx.drawImage(scene, x0 * k, y0 * k, (x1 - x0) * k, (y1 - y0) * k, x0, y0, x1 - x0, y1 - y0);
}`,
    },
    {
      type: "p",
      text: "The scene is drawn by the same `draw()` function, called with a radius twice the viewport's diagonal. That switches off both the culling and the rim, so the cache holds the whole drawing and none of the lens's own marks.",
    },

    { type: "h", text: "A canvas the size of the lens" },
    {
      type: "p",
      text: "Copying a small circle into a viewport-sized canvas would still leave a viewport-sized canvas to clear and composite every frame. So as a lens, the visible canvas is now only as large as the lens plus its readout, moved by a CSS transform. The drawing is offset by the same amount, so every routine still works in viewport coordinates:",
    },
    {
      type: "code",
      lang: "ts",
      caption: "Loupe.tsx: the window follows the lens",
      code: `const place = (cx: number, cy: number) => {
  const bx = Math.round(cx - box / 2);
  const by = Math.round(cy - box / 2 + 16);
  canvas.style.transform = \`translate3d(\${bx}px, \${by}px, 0)\`;
  ctx.setTransform(dpr, 0, 0, dpr, -bx * dpr, -by * dpr);
};`,
    },
    {
      type: "p",
      text: "The window is 2.3 times the resting lens radius plus 64 px, because the aperture spring overshoots and the readout hangs below the circle. Once the radius passes 1.12 times its resting size the lens is flooding, and the canvas goes back to covering the viewport and drawing directly, as it does for the scan on touch screens.",
    },

    { type: "h", text: "A cache key is a list of inputs" },
    {
      type: "p",
      text: "The key is the scroll position, the viewport size, the device pixel ratio and a focus counter, plus identity checks on the model and the palette, which are replaced as whole objects when the page is remeasured or re-themed.",
    },
    {
      type: "code",
      lang: "ts",
      caption: "Loupe.tsx: when the scene is rendered again",
      code: `const key = \`\${scrollX},\${scrollY},\${W},\${H},\${dpr},\${focusGen}\`;
if (key !== sceneKey || model !== sceneModel || palette !== scenePalette) {
  /* ... resize the scene canvas if the viewport changed ... */
  // a lens wider than the viewport: the whole scene, no culling, no rim
  draw({ ...frame, ctx: sctx, cx: W / 2, cy: H / 2, r: Math.hypot(W, H) * 2, scan: false, reveal: 1 });
  sceneKey = key;
  sceneModel = model;
  scenePalette = palette;
}
drawLens(frame, scene);`,
    },
    {
      type: "p",
      text: "The focus counter was not in my first version. The glass redraws the keyboard focus ring on top of the drawing, because the canvas would otherwise hide the ring of the very element it travels to. I had keyed the cache on the focused element's `top`. Reviewing the code turned up two holes: moving focus along a row, where every item shares the same top, left the key unchanged, and moving focus to nothing triggered no redraw at all. Either way a stale ring stayed in the cached scene. Now `focusin` and `focusout` both bump a counter: cheaper than reading a rectangle, and correct.",
    },

    { type: "h", text: "A closed glass should cost nothing" },
    {
      type: "p",
      text: "A later pass found a cost no frame timing would show: the glass worked while closed. It measured the page and sized its canvas on load, and again on every resize. On a phone, the URL bar hiding as you scroll fires a resize, so that was a full DOM measurement for a feature nobody had opened.",
    },
    {
      type: "p",
      text: "Now a resize while the glass is closed only marks the layout and the model as due. The first frame after it opens lays out the canvas and measures.",
    },
    {
      type: "p",
      text: "A smaller leak: the glass listens for `transitionend` to remeasure after a reveal settles, but links transition their colour and underline, so every hover under the lens forced a full remeasure, visible on a slow CPU. The handler now ignores transitions whose property cannot change geometry, and anything from inside a link or button, and coalesces the rest into one remeasure 120 ms after the burst.",
    },

    { type: "h", text: "The numbers" },
    {
      type: "list",
      items: [
        "4x CPU, lens moving, before: 21.8 ms average, 50 ms at p95.",
        "4x CPU, lens moving, after: 17.6 ms average, 16.8 ms at p95.",
        "Cumulative layout shift: 0.",
      ],
    },
    {
      type: "p",
      text: "These are intervals between animation frames, so at 60 Hz the floor is 16.7 ms. A p95 below the average looks odd. It means almost every frame now lands on the 16.7 ms tick and a few long ones pull the mean up. I read those as the frames that render the scene again, a cost I moved rather than removed.",
    },
    {
      type: "p",
      text: "One caveat: these runs were in headless Chromium, which rasterises in software. With GPU rasterisation the absolute numbers will differ. I expect the relative win to hold, because what the change removed is per-pixel work on every pointer move.",
    },

    { type: "h", text: "Trade-offs" },
    {
      type: "p",
      text: "The cache costs memory: a second bitmap the size of the viewport, at up to 2x device pixel ratio, sized the first time the lens is used. It also moves work rather than deleting it. Scrolling with the lens open changes the key on every frame, so each of those frames renders the full scene and then copies from it, more work than drawing the culled scene directly. I accepted that because the lens is mostly moved, not scrolled under, and the adaptive fallback that drops to 1x resolution after sustained slow frames is still there.",
    },
    {
      type: "p",
      text: "What I would do differently: profile before optimising. Culling was a reasonable guess and it did help, but it went after the number of commands when the cost was in pixels. I would also write the cache key from an explicit list of everything the scene reads, focus included, before writing the cache, instead of finding the missing input in review.",
    },
  ],
};

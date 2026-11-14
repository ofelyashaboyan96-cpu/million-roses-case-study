/* Million Roses · a bouquet gathered flower by flower.
   Each section of the page adds one image (one more flower) to the bouquet.
   To add steps: drop more images in assets/ and add rows to STEPS (in order, empty -> full). */
(function () {
  const STEPS = [
    { img: "assets/basket-1.webp", bg: "#F3EDE2", tag: "01 · The basket", title: "Lined<br><em>by hand.</em>", text: "A woven basket and soft paper, waiting for the day's flowers." },
    { img: "assets/basket-2.webp", bg: "#F3E5E2", tag: "02 · Fresh today", title: "Carnations<br><em>and roses.</em>", text: "Picked in the morning and set into fresh, green leaves." },
    { img: "assets/basket-3.webp", bg: "#E3E8DA", tag: "03 · Texture", title: "Hydrangea<br><em>for depth.</em>", text: "Round green heads give the bouquet its full, generous shape." },
    { img: "assets/basket-4.webp", bg: "#EFE4CF", tag: "04 · Height", title: "Snapdragons<br><em>to finish.</em>", text: "Tall pink spikes bring movement and a little drama." },
    { img: "assets/basket-4.webp", bg: "#1F3A2B", dark: true, tag: "05 · Ready", title: "One perfect<br><em>gift.</em>", text: "Gathered by hand, delivered the same day in Yerevan." }
  ];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const story = document.getElementById("story");
  const frame = document.getElementById("frame");
  const float = frame.parentElement;

  // Build sections (text alternates left / right) and the stacked flower images
  const seen = new Set();
  STEPS.forEach((s, i) => {
    const sec = document.createElement("section");
    sec.className = "sec" + (i % 2 ? " sec--right" : "") + (s.dark ? " dark" : "");
    sec.style.background = s.bg;
    sec.innerHTML = `<div class="sec__txt"><small>${s.tag}</small><h2>${s.title}</h2><p>${s.text}</p></div>`;
    story.appendChild(sec);
    if (!seen.has(s.img)) {
      seen.add(s.img);
      const im = new Image(); im.src = s.img; im.alt = ""; im.className = "flower"; im.decoding = "async";
      frame.appendChild(im);
    }
  });
  const flowers = [...frame.children];
  const secs = [...story.children];
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)), { threshold: 0.6 });
  secs.forEach((s) => io.observe(s));

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => t * t * (3 - 2 * t);

  // Where the bouquet sits for each section: opposite side from the text (centre on phones)
  const spot = (i, W, H, bw) => {
    const mobile = W <= 760;
    const bh = bw * 819 / 809;
    if (mobile) return { x: (W - bw) / 2, y: H - bh - H * 0.05 };
    const side = i % 2 ? 0.08 : 0.92;          // text left -> bouquet right, and vice versa
    const x = side > 0.5 ? W * side - bw : W * side;
    return { x, y: (H - bh) / 2 + 20 };
  };

  let cur = 0, target = 0, last = -1;
  const read = () => { target = window.scrollY / window.innerHeight; };

  const render = () => {
    // smooth the scroll value so the bouquet glides instead of jumping
    cur = reduce ? target : cur + (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    const W = window.innerWidth, H = window.innerHeight;
    const bw = W <= 760 ? Math.min(W * 0.86, H * 0.5) : Math.min(W * 0.4, H * 0.8);
    frame.style.setProperty("--bw", bw + "px");

    const i = clamp(Math.floor(cur), 0, STEPS.length - 1);
    const f = ease(clamp(cur - i));
    const a = spot(i, W, H, bw), b = spot(Math.min(i + 1, STEPS.length - 1), W, H, bw);
    // the bouquet travels to its next spot while the page scrolls, with a soft dip in the middle
    const dip = Math.sin(f * Math.PI) * H * 0.04;
    float.style.transform = `translate3d(${(a.x + (b.x - a.x) * f).toFixed(1)}px, ${(a.y + (b.y - a.y) * f + dip).toFixed(1)}px, 0)`;

    // each new flower drops in and settles while its section arrives
    flowers.forEach((el, k) => {
      if (k === 0) return;
      const t = ease(clamp((cur - (k - 0.55)) / 0.5));
      el.style.opacity = t.toFixed(3);
      el.style.transform = reduce ? "none" : `translate3d(0, ${(-14 * (1 - t)).toFixed(2)}%, 0) scale(${(0.94 + 0.06 * t).toFixed(4)})`;
    });

    const step = Math.round(cur);
    if (step !== last) {
      document.body.classList.toggle("scrolled", cur > 0.05);
      document.body.classList.toggle("dark", !!(STEPS[step] && STEPS[step].dark));
      last = step;
    }
    requestAnimationFrame(render);
  };

  addEventListener("scroll", read, { passive: true });
  addEventListener("resize", read);
  read(); cur = target;
  requestAnimationFrame(render);
})();

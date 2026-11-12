/* =========================================================
   1. YOUR LINKS: change only the text inside the quotes
   ========================================================= */
const LINKS = {
  store:    "https://ofelya-shaboyan-szkc1aey.myshopify.com/en-am", // live Million Roses link
  upwork:   "https://www.upwork.com/freelancers/YOUR-PROFILE",
  linkedin: "https://www.linkedin.com/in/YOUR-PROFILE",
  email:    "mailto:YOUR-EMAIL@example.com"
};

/* ========================================================= */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const range = (p, start, end) => clamp((p - start) / (end - start)); // 0..1 inside [start, end]

  // Fill in all buttons that have data-link="..."
  document.querySelectorAll("[data-link]").forEach((a) => {
    const url = LINKS[a.dataset.link];
    if (url) a.href = url;
  });
  document.getElementById("year").textContent = new Date().getFullYear();
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));

  // ---------- Fade-up on scroll ----------
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .wipe, .popup-demo").forEach((el) => revealObs.observe(el));

  /* Live same-day countdown: orders until 16:00 Yerevan time (UTC+4) */
  const clockEl = document.querySelector("[data-timer]");
  const noteEl = document.querySelector("[data-timer-note]");
  if (clockEl) {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const now = new Date();
      const yv = new Date(now.getTime() + (now.getTimezoneOffset() + 240) * 60000);
      const cut = new Date(yv); cut.setHours(16, 0, 0, 0);
      const tomorrow = yv >= cut;
      if (tomorrow) cut.setDate(cut.getDate() + 1);
      let s = Math.floor((cut - yv) / 1000);
      clockEl.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
      if (noteEl) noteEl.textContent = tomorrow ? "left to order for tomorrow's delivery" : "left to order for delivery today";
    };
    tick(); setInterval(tick, 1000);
  }

  // ---------- Count-up numbers ----------
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, end = Number(el.dataset.count), start = performance.now(), dur = reduceMotion ? 0 : 1400;
      const tick = (now) => {
        const p = dur ? Math.min((now - start) / dur, 1) : 1;
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => countObs.observe(el));

  // ---------- Play videos only when visible ----------
  const videoObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { if (v.preload === "none") v.preload = "auto"; v.play().catch(() => {}); }
      else v.pause();
    });
  }, { threshold: 0.2 });
  document.querySelectorAll("video").forEach((v) => videoObs.observe(v));

  // ---------- Languages: HY -> RU -> EN ----------
  const lines = document.querySelectorAll(".langs__line");
  const pills = document.querySelectorAll(".langs__pills span");
  if (lines.length) {
    let i = 0;
    const show = () => {
      lines.forEach((l, n) => l.classList.toggle("is-active", n === i));
      pills.forEach((p, n) => p.classList.toggle("is-active", n === i));
      i = (i + 1) % lines.length;
    };
    show();
    if (!reduceMotion) setInterval(show, 2600);
  }

  /* =========================================================
     2. THE BOUQUET (drawn with code, assembled by scrolling)
     Everything is generated here so it looks hand-drawn and organic.
     ========================================================= */
  const svg = document.querySelector(".bouquet");
  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    (parent || svg).appendChild(el);
    return el;
  };
  // Small fixed "random" so the bouquet looks the same on every visit
  let seed = 7;
  const rnd = (a = 0, b = 1) => { seed = (seed * 9301 + 49297) % 233280; return a + (seed / 233280) * (b - a); };

  const TIE = { x: 200, y: 400 };
  // Delphinium spikes (tall, curved) and peony heads (round, at the front)
  const spikes = [[112, 62, -14], [168, 24, -5], [238, 36, 8], [296, 84, 16], [204, 104, 2]];
  const peonies = [[150, 252, 36], [226, 236, 42], [280, 288, 30], [188, 312, 34], [116, 314, 27]];
  const sprigs = [[96, 196], [312, 196], [258, 160], [140, 150]];
  const parts = { stems: [], leaves: [], buds: [], peonies: [], ribbon: [] };

  // An organic outline: a circle whose radius wobbles (used for peony petals)
  const blob = (cx, cy, r, wob, turns, phase) => {
    let d = "";
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const rr = r * (1 + wob * Math.sin(turns * a + phase) + wob * .5 * Math.sin((turns * 2 + 1) * a + phase * 1.7));
      d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }
    return d + "Z";
  };

  // A leaf with a pointed tip and a centre vein, drawn from (0,0) upward
  const leafPath = (len, wid) =>
    `M0 0 C ${wid} ${-len * .25} ${wid * .8} ${-len * .7} 0 ${-len} C ${-wid * .9} ${-len * .68} ${-wid} ${-len * .28} 0 0 Z`;

  if (svg) {
    const sway = make("g", { class: "sway" });
    const gStems = make("g", {}, sway), gLeaves = make("g", {}, sway), gSprig = make("g", {}, sway),
          gBuds = make("g", {}, sway), gPeony = make("g", {}, sway), gRibbon = make("g", {}, sway);
    const greens = ["#5f7552", "#6f8460", "#7b8f69"];

    const addStem = ([x, y], n, parent) => {
      const bx = 184 + (n % 7) * 5.5;
      const bend = rnd(-18, 18);
      const d = `M${bx} 548 C ${bx + rnd(-4, 4)} 480 ${TIE.x} 430 ${TIE.x} ${TIE.y} C ${TIE.x + (x - TIE.x) * .3 + bend} ${TIE.y - 90} ${x - bend * .4} ${y + 120} ${x} ${y}`;
      const path = make("path", { d, class: "stem", stroke: greens[n % 3], "stroke-width": rnd(1.6, 2.6) }, parent || gStems);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      parts.stems.push({ el: path, len });
      return { path, len };
    };

    // Leaves grow along each stem, following its direction
    const addLeaf = (path, len, at, side, size) => {
      const p = path.getPointAtLength(len * at), q = path.getPointAtLength(len * at - 2);
      const ang = (Math.atan2(p.y - q.y, p.x - q.x) * 180) / Math.PI + 90 + side * rnd(28, 48);
      const g = make("g", { class: "leafg" }, gLeaves);
      make("path", { d: leafPath(size, size * .32), class: "leaf" }, g);
      make("path", { d: `M0 0 Q ${side * 2} ${-size * .5} 0 ${-size * .92}`, class: "vein" }, g);
      g.dataset.base = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${ang.toFixed(1)}deg)`;
      parts.leaves.push(g);
    };

    // Delphinium: star-shaped florets climbing the top of the stem
    spikes.forEach((s, n) => {
      const { path, len } = addStem(s, n);
      addLeaf(path, len, .6, n % 2 ? 1 : -1, rnd(40, 58));
      const lilac = ["#B7A2D2", "#CDBDE3", "#A38BC2", "#D9CDEA"];
      for (let k = 0; k < 11; k++) {
        const t = .64 + k * .033;
        const p = path.getPointAtLength(len * Math.min(t, 1));
        const side = k % 2 ? 1 : -1;
        const size = 8.5 - k * .55;
        const cx = p.x + side * rnd(2, 6), cy = p.y;
        const g = make("g", { class: "bud" }, gBuds);
        if (k < 8) {
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + rnd(0, 1);
            make("ellipse", { cx: cx + Math.cos(a) * size * .45, cy: cy + Math.sin(a) * size * .45, rx: size * .45, ry: size * .32,
              transform: `rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * size * .45} ${cy + Math.sin(a) * size * .45})`, fill: lilac[(k + i) % 4] }, g);
          }
          make("circle", { cx, cy, r: size * .18, fill: "#F3EFE6" }, g);
        } else {
          make("ellipse", { cx, cy, rx: size * .35, ry: size * .55, fill: "#C7B4DD" }, g); // closed buds at the tip
        }
        g.dataset.order = k;
        parts.buds.push(g);
      }
    });

    // Peonies: three ruffled layers, darker towards the centre
    peonies.forEach((pk, n) => {
      const { path, len } = addStem(pk, n + spikes.length);
      addLeaf(path, len, .5, n % 2 ? -1 : 1, rnd(46, 64));
      addLeaf(path, len, .7, n % 2 ? 1 : -1, rnd(34, 46));
      const [x, y, s] = pk;
      const g = make("g", { class: "peony" }, gPeony);
      make("path", { d: blob(x, y, s, .09, 7, rnd(0, 6)), fill: "#F4D3D3", stroke: "#D9A5AB", "stroke-width": .8 }, g);
      make("path", { d: blob(x + rnd(-2, 2), y + rnd(-2, 2), s * .74, .11, 6, rnd(0, 6)), fill: "#EEBDC2", stroke: "#D08F98", "stroke-width": .8 }, g);
      make("path", { d: blob(x, y, s * .46, .14, 5, rnd(0, 6)), fill: "#E5A2AB", stroke: "#C47D88", "stroke-width": .8 }, g);
      make("path", { d: blob(x, y, s * .2, .2, 4, rnd(0, 6)), fill: "#D98D99" }, g);
      parts.peonies.push(g);
    });

    // Gypsophila: airy white sprigs that appear with the peonies
    sprigs.forEach(([x, y], n) => {
      const { path, len } = addStem([x, y], n + 3);
      path.setAttribute("stroke-width", 1.1);
      const g = make("g", { class: "peony" }, gSprig);
      for (let k = 0; k < 9; k++) {
        make("circle", { cx: x + rnd(-14, 14), cy: y + rnd(-10, 12), r: rnd(2, 3.6), fill: "#FFFFFF", stroke: "#D8CFC0", "stroke-width": .7 }, g);
      }
      parts.peonies.push(g);
    });

    // Ribbon: a soft bow and two tails at the tie point
    [
      `M${TIE.x} ${TIE.y} C 168 378 146 410 ${TIE.x} ${TIE.y + 3}`,
      `M${TIE.x} ${TIE.y} C 232 378 254 410 ${TIE.x} ${TIE.y + 3}`,
      `M${TIE.x} ${TIE.y + 3} C 194 438 178 468 170 504`,
      `M${TIE.x} ${TIE.y + 3} C 208 438 224 466 236 506`,
      `M180 ${TIE.y - 3} Q 200 ${TIE.y + 4} 220 ${TIE.y - 3}`
    ].forEach((d) => {
      const path = make("path", { d, class: "ribbon" }, gRibbon);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      parts.ribbon.push({ el: path, len });
    });
  }

  // Apply a progress value (0..1) to the drawing
  const STEP_BG = ["#F6F2E9", "#EDF0E5", "#F0ECF4", "#F7EBEA", "#F4ECDD", "#1F3A2B"];
  const story = document.querySelector(".story");
  const steps = document.querySelectorAll(".story__step");
  let lastStep = -1;

  const drawStory = (p) => {
    if (!svg) return;
    parts.stems.forEach(({ el, len }, n) => { el.style.strokeDashoffset = len * (1 - range(p, .02 + n * .008, .15 + n * .006)); });
    parts.leaves.forEach((leaf, n) => {
      const t = range(p, .17 + (n % 12) * .01, .27 + (n % 12) * .01);
      leaf.style.transform = `${leaf.dataset.base} scale(${t})`;
    });
    parts.buds.forEach((bud) => {
      const t = range(p, .33 + bud.dataset.order * .012, .38 + bud.dataset.order * .012);
      bud.style.transform = `scale(${t})`;
    });
    parts.peonies.forEach((g, n) => {
      const t = range(p, .5 + (n % 9) * .015, .6 + (n % 9) * .015);
      g.style.transform = `scale(${t}) rotate(${(1 - t) * -40}deg)`;
    });
    parts.ribbon.forEach(({ el, len }, n) => { el.style.strokeDashoffset = len * (1 - range(p, .67 + n * .015, .75 + n * .015)); });

    const step = Math.min(5, Math.floor(p * 6.2));
    if (step !== lastStep) {
      steps.forEach((s, n) => s.classList.toggle("is-active", n === step));
      story.style.setProperty("--story-bg", STEP_BG[step]);
      story.classList.toggle("is-final", step === 5);
      lastStep = step;
    }
    story.style.setProperty("--p", p.toFixed(3));
  };

  if (reduceMotion) { drawStory(1); return; }

  /* =========================================================
     3. SCROLL EFFECTS: story progress, laptop, parallax
     ========================================================= */
  const laptop = document.querySelector("[data-tilt]");
  const drifters = document.querySelectorAll("[data-parallax]");
  const strip = document.querySelector("[data-drift]");
  let ticking = false;

  const update = () => {
    const vh = window.innerHeight;

    if (story) {
      const r = story.getBoundingClientRect();
      drawStory(clamp(-r.top / (r.height - vh)));
    }

    if (laptop) {
      const r = laptop.getBoundingClientRect();
      const t = clamp(1 - (r.top - vh * .15) / (vh * .6)); // straightens as it rises into view
      laptop.style.transform = `rotateX(${14 * (1 - t)}deg) scale(${.94 + .06 * t})`;
    }

    drifters.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      let offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax);
      offset = Math.max(-80, Math.min(80, offset));
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
    if (strip && window.innerWidth > 760) {
      const r = strip.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh + r.height));
        strip.style.translate = `${(60 - 120 * t).toFixed(1)}px 0`;
      }
    }
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

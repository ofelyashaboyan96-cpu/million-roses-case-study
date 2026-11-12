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
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

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
     ========================================================= */
  const svg = document.querySelector(".bouquet");
  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    (parent || svg).appendChild(el);
    return el;
  };

  const TIE = { x: 200, y: 405 };                       // where the ribbon ties the stems
  const spikes = [[118, 70], [172, 30], [236, 46], [292, 92], [205, 120]]; // delphinium tops
  const peonies = [[150, 255, 34], [222, 238, 40], [276, 285, 30], [190, 312, 32], [118, 315, 26]]; // x, y, size
  const parts = { stems: [], leaves: [], buds: [], peonies: [], ribbon: [] };

  if (svg) {
    const gStems = make("g", {}), gLeaves = make("g", {}), gBuds = make("g", {}), gPeony = make("g", {}), gRibbon = make("g", {});

    // Stems: from the bottom, through the tie point, up to each flower
    [...spikes, ...peonies].forEach(([x, y], n) => {
      const bx = 182 + (n % 6) * 7;                       // spread the cut ends a little
      const d = `M${bx} 548 C ${bx} 470 ${TIE.x} 430 ${TIE.x} ${TIE.y} S ${x} ${y + 90} ${x} ${y}`;
      const path = make("path", { d, class: "stem" }, gStems);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      parts.stems.push({ el: path, len });
    });

    // Leaves: grow out of the bouquet around the tie point
    const leafShape = "M0 0 Q 16 -28 0 -66 Q -16 -28 0 0 Z";
    [[-58, 168, 360, 1], [-30, 176, 330, .9], [35, 230, 335, .95], [62, 240, 368, 1.05], [-80, 160, 392, .8], [82, 244, 396, .8], [-12, 196, 300, .7], [18, 214, 296, .75]]
      .forEach(([rot, x, y, s]) => {
        const leaf = make("path", { d: leafShape, class: "leaf" }, gLeaves);
        leaf.dataset.base = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
        leaf.dataset.s = s;
        parts.leaves.push(leaf);
      });

    // Delphinium: columns of small buds along each spike top
    spikes.forEach(([x, y], n) => {
      for (let k = 0; k < 9; k++) {
        const r = 7.5 - k * .45;
        const side = k % 2 ? 1 : -1;
        const bud = make("circle", { cx: x + side * (4 + (n % 2) * 2), cy: y + 92 - k * 11, r, class: "bud" }, gBuds);
        bud.dataset.order = k;
        parts.buds.push(bud);
      }
    });

    // Peonies: layered petals that open
    peonies.forEach(([x, y, s]) => {
      const g = make("g", { class: "peony" }, gPeony);
      for (let ring = 0; ring < 3; ring++) {
        const count = 7 - ring * 2, rr = s * (1 - ring * .28);
        for (let k = 0; k < count; k++) {
          const a = (Math.PI * 2 * k) / count + ring * .4;
          make("ellipse", {
            cx: x + Math.cos(a) * rr * .42, cy: y + Math.sin(a) * rr * .42,
            rx: rr * .55, ry: rr * .42,
            transform: `rotate(${(a * 180) / Math.PI} ${x + Math.cos(a) * rr * .42} ${y + Math.sin(a) * rr * .42})`,
            class: "petal"
          }, g);
        }
      }
      make("circle", { cx: x, cy: y, r: s * .14, fill: "#B8975A", opacity: .7 }, g);
      parts.peonies.push(g);
    });

    // Ribbon: a bow and two tails at the tie point
    const bow = [
      `M${TIE.x} ${TIE.y} C 165 380 150 420 ${TIE.x} ${TIE.y + 2}`,
      `M${TIE.x} ${TIE.y} C 235 380 250 420 ${TIE.x} ${TIE.y + 2}`,
      `M${TIE.x} ${TIE.y + 2} C 192 440 180 470 172 500`,
      `M${TIE.x} ${TIE.y + 2} C 208 440 222 468 232 502`,
      `M178 ${TIE.y - 4} L 222 ${TIE.y - 4}`
    ];
    bow.forEach((d) => {
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
      const t = range(p, .17 + n * .012, .27 + n * .012);
      leaf.style.transform = `${leaf.dataset.base} scale(${t * leaf.dataset.s})`;
    });
    parts.buds.forEach((bud) => {
      const t = range(p, .33 + bud.dataset.order * .012, .38 + bud.dataset.order * .012);
      bud.style.transform = `scale(${t})`;
    });
    parts.peonies.forEach((g, n) => {
      const t = range(p, .5 + n * .02, .6 + n * .02);
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
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

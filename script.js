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
  document.querySelectorAll(".reveal, .rise").forEach((el) => revealObs.observe(el));

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

  const story = null;
  const drawStory = () => {};

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

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

  document.querySelectorAll("[data-link]").forEach((a) => {
    const url = LINKS[a.dataset.link];
    if (url) a.href = url;
  });
  document.getElementById("year").textContent = new Date().getFullYear();
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));

  // Fade-up on scroll
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .rise").forEach((el) => revealObs.observe(el));

  // Live same-day countdown: orders until 16:00 Yerevan time (UTC+4)
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
      const s = Math.floor((cut - yv) / 1000);
      clockEl.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
      if (noteEl) noteEl.textContent = tomorrow ? "left to order for tomorrow's delivery" : "left to order for delivery today";
    };
    tick(); setInterval(tick, 1000);
  }

  // Count-up numbers
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, end = Number(el.dataset.count), start = performance.now(), dur = reduceMotion ? 0 : 1400;
      const step = (now) => {
        const p = dur ? Math.min((now - start) / dur, 1) : 1;
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => countObs.observe(el));

  // Play videos only when visible
  const videoObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { if (v.preload === "none") v.preload = "auto"; if (!reduceMotion) v.play().catch(() => {}); }
      else v.pause();
    });
  }, { threshold: 0.2 });
  document.querySelectorAll("video").forEach((v) => videoObs.observe(v));

  // Language tabs (auto-rotate until someone clicks)
  const tabs = [...document.querySelectorAll(".tabs button")];
  const shots = [...document.querySelectorAll(".langs__stage img")];
  let langTimer = null;
  const setLang = (lang) => {
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.lang === lang));
    shots.forEach((s) => s.classList.toggle("is-on", s.dataset.lang === lang));
  };
  tabs.forEach((t) => t.addEventListener("click", () => { clearInterval(langTimer); setLang(t.dataset.lang); }));
  if (tabs.length && !reduceMotion) {
    let i = 0;
    langTimer = setInterval(() => { i = (i + 1) % tabs.length; setLang(tabs[i].dataset.lang); }, 2800);
  }

  // Product notes <-> pins highlight each other
  document.querySelectorAll("[data-pin]").forEach((el) => {
    const n = el.dataset.pin;
    const pair = document.querySelectorAll(`[data-pin="${n}"]`);
    const on = (v) => pair.forEach((p) => p.classList.toggle("is-hot", v));
    el.addEventListener("mouseenter", () => on(true));
    el.addEventListener("mouseleave", () => on(false));
  });

  // Top bar turns solid after the hero
  const bar = document.querySelector(".topbar");

  // Scroll effects
  const block = document.querySelector(".hero__block");
  const bouquet = document.querySelector(".hero__bouquet");
  const stem = document.querySelector(".hero__stem");
  const strip = document.querySelector("[data-drift]");
  const drifters = document.querySelectorAll("[data-parallax]");
  let ticking = false;

  const update = () => {
    const vh = window.innerHeight, y = window.scrollY;
    bar.classList.toggle("is-solid", y > 40);
    if (!reduceMotion) {
      if (y < vh * 1.2 && window.innerWidth > 749) {
        if (block) block.style.translate = `0 ${(y * 0.12).toFixed(1)}px`;
        if (bouquet) bouquet.style.translate = `0 ${(y * -0.08).toFixed(1)}px`;
        if (stem) stem.style.translate = `0 ${(y * 0.22).toFixed(1)}px`;
      }
      drifters.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const off = clamp((r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax), -80, 80);
        el.style.translate = `0 ${off.toFixed(1)}px`;
      });
      if (strip) {
        const r = strip.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const t = clamp((vh - r.top) / (vh + r.height));
          const max = Math.max(0, strip.scrollWidth - window.innerWidth);
          strip.style.translate = `${(-max * t).toFixed(1)}px 0`;
        }
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

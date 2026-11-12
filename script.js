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

  // Fill in all buttons that have data-link="..."
  document.querySelectorAll("[data-link]").forEach((a) => {
    const url = LINKS[a.dataset.link];
    if (url) a.href = url;
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  // Start the hero title animation once the page has loaded
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));

  // Fade-up elements when they scroll into view
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  // Count-up numbers
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = Number(el.dataset.count);
      const start = performance.now();
      const dur = reduceMotion ? 0 : 1400;
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

  // Load and play feature videos only when visible (saves data on phones)
  const videoObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) {
        if (v.preload === "none") v.preload = "auto";
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll("video").forEach((v) => videoObs.observe(v));

  // Rotating languages: HY -> RU -> EN
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
    if (!reduceMotion) setInterval(show, 2200);
  }

  if (reduceMotion) return;

  // Scroll effects: laptop straightens up, items drift (parallax)
  const laptop = document.querySelector("[data-tilt]");
  const drifters = document.querySelectorAll("[data-parallax]");
  let ticking = false;

  const update = () => {
    const vh = window.innerHeight;
    if (laptop) {
      const p = Math.min(window.scrollY / (vh * 0.7), 1); // 0 at top, 1 after scrolling
      laptop.style.transform =
        `rotateX(${18 * (1 - p)}deg) rotateY(${-14 * (1 - p)}deg) rotateZ(${2 * (1 - p)}deg) scale(${1 + 0.04 * p})`;
    }
    drifters.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return; // only items near the screen
      let offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax);
      offset = Math.max(-80, Math.min(80, offset)); // keep the movement gentle
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

/* Million Roses portfolio v2
   As the page scrolls down, each new section adds one layer of flowers to the basket. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const main = document.querySelector(".gather");
  const layers = document.querySelectorAll(".layer");
  const steps = document.querySelectorAll(".step");
  const clamp = (v) => Math.max(0, Math.min(1, v));

  // Text of each section rises in when it reaches the screen
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting));
  }, { threshold: 0.7 });
  steps.forEach((s) => io.observe(s));

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    // p = how many sections we have scrolled through (0 at the top, 4 at the last one)
    const p = (window.scrollY - main.offsetTop) / vh;
    layers.forEach((el, k) => {
      if (k === 0) return;
      // layer k arrives while section k+1 slides up into view
      let t = clamp((p - (k - 0.6)) / 0.55);
      if (reduce) t = t > 0.5 ? 1 : 0;
      el.style.opacity = t;
      el.style.transform = reduce ? "none" : `translateY(${(-6 * (1 - t)).toFixed(2)}%) scale(${(0.96 + 0.04 * t).toFixed(4)})`;
    });
    document.body.classList.toggle("is-scrolled", p > 0.05);
    document.body.classList.toggle("is-dark", p > 3.5);
  };

  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

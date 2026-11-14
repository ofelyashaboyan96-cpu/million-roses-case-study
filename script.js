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

  // Same-day video: phone-shaped file on small screens, wide file on desktop
  document.querySelectorAll("video[data-src-d]").forEach((v) => {
    const m = window.innerWidth < 750;
    v.poster = m ? v.dataset.posterM : v.dataset.posterD;
    v.src = m ? v.dataset.srcM : v.dataset.srcD;
  });
  // Letter-by-letter titles
  document.querySelectorAll("[data-letters]").forEach((el) => {
    const txt = el.textContent; el.setAttribute("aria-label", txt); el.textContent = "";
    [...txt].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "sd__l"; s.setAttribute("aria-hidden", "true");
      s.textContent = ch === " " ? "\u00a0" : ch; s.style.setProperty("--i", i);
      el.append(s);
    });
  });

  // Fade-up on scroll
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .rise").forEach((el) => revealObs.observe(el));

  // Fly-in headings: split into words, each starts at a scattered, blurred spot
  document.querySelectorAll(".fly").forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.append(t); return; }
            const s = document.createElement("span");
            s.className = "fw"; s.textContent = t;
            const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 90;
            s.style.setProperty("--dx", `${(Math.cos(ang) * dist).toFixed(0)}px`);
            s.style.setProperty("--dy", `${(Math.sin(ang) * dist * 0.6).toFixed(0)}px`);
            s.style.setProperty("--i", i++);
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.trim());
    walk(el);
    revealObs.observe(el);
  });
  document.querySelectorAll("[data-arc], [data-collage]").forEach((el) => revealObs.observe(el));
  // The featured card also triggers the basket's rise
  const featCard = document.querySelector(".feat__card");
  if (featCard) revealObs.observe(featCard);

  // Live same-day countdown: orders until 16:00 Yerevan time (UTC+4); after that the banner talks about tomorrow
  const hEl = document.querySelector("[data-h]"), mEl = document.querySelector("[data-m]"), sEl = document.querySelector("[data-s]");
  if (hEl) {
    const aEl = document.querySelector("[data-sd-a]"), bEl = document.querySelector("[data-sd-b]"), btn = document.querySelector("[data-sd-btn]");
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const now = new Date();
      const yv = new Date(now.getTime() + (now.getTimezoneOffset() + 240) * 60000);
      const cut = new Date(yv); cut.setHours(16, 0, 0, 0);
      const tomorrow = yv >= cut;
      if (tomorrow) cut.setDate(cut.getDate() + 1);
      const s = Math.floor((cut - yv) / 1000);
      hEl.textContent = pad(Math.floor(s / 3600)); mEl.textContent = pad(Math.floor(s / 60) % 60); sEl.textContent = pad(s % 60);
      aEl.textContent = tomorrow ? "Order now," : "Order today,";
      bEl.textContent = tomorrow ? "tomorrow." : "today.";
      btn.textContent = tomorrow ? "Order for tomorrow" : "Order for today";
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
  document.querySelectorAll("video:not([data-manual])").forEach((v) => videoObs.observe(v));

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

  // Product story: words fly in, page zooms up, then 4 trust points are mapped one by one
  const ps = document.querySelector("[data-pstory]");
  let renderStory = () => {};
  if (ps) {
    const track = ps.querySelector(".pstory__track");
    const stage = ps.querySelector(".pstory__stage");
    const words = [...ps.querySelectorAll(".pw")];
    const eyebrow = ps.querySelector(".pstory__eyebrow");
    const shot = ps.querySelector(".pstory__shot");
    const pins = [...shot.querySelectorAll(".pin")];
    const calls = [...ps.querySelectorAll(".pcall")];
    const paths = [...ps.querySelectorAll(".pstory__lines path")];
    const dots = [...ps.querySelectorAll(".pstory__lines circle")];
    const countEl = ps.querySelector("[data-pcount]");
    const barEl = ps.querySelector("[data-pbar]");
    const list = ps.querySelector(".pstory__calls");
    const desk = window.matchMedia("(min-width: 900px)");
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const seg = (p, a, b) => clamp((p - a) / (b - a));
    const clear = () => [...words, eyebrow, shot, ...pins, ...calls, ...paths, ...dots].forEach((el) => el.removeAttribute("style"));
    const keepVars = () => { // the words' scatter offsets live in inline style vars
      words.forEach((w, i) => { w.style.setProperty("--dx", w.dataset.dx); w.style.setProperty("--dy", w.dataset.dy); });
      pins.forEach((p) => { p.style.setProperty("--x", p.dataset.x); p.style.setProperty("--y", p.dataset.y); });
    };
    words.forEach((w) => { w.dataset.dx = w.style.getPropertyValue("--dx"); w.dataset.dy = w.style.getPropertyValue("--dy"); });
    pins.forEach((p) => { p.dataset.x = p.style.getPropertyValue("--x"); p.dataset.y = p.style.getPropertyValue("--y"); });

    if (reduceMotion) ps.classList.add("is-static");

    // small screens: reveal words and cards, draw the timeline line on scroll
    const mObs = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || desk.matches) return;
      e.target.classList.add("is-in");
    }), { threshold: 0.3 });
    mObs.observe(ps.querySelector(".pstory__head"));
    calls.forEach((c) => mObs.observe(c));
    const headObs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) ps.classList.add("is-in"); }), { threshold: 0.4 });
    headObs.observe(ps.querySelector(".pstory__head"));

    let wasDesk = null;
    renderStory = () => {
      const vh = window.innerHeight;
      if (!desk.matches || reduceMotion) {
        if (wasDesk !== false) { clear(); keepVars(); wasDesk = false; }
        if (reduceMotion) return;
        const r = list.getBoundingClientRect();
        list.style.setProperty("--line", clamp((vh * 0.75 - r.top) / r.height).toFixed(3));
        return;
      }
      wasDesk = true;
      const r = track.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh));

      // 1. words fly in from scattered spots, blurred, like a camera finding focus
      words.forEach((w, i) => {
        const t = ease(seg(p, 0.02 + i * 0.025, 0.14 + i * 0.025));
        w.style.opacity = t;
        w.style.filter = `blur(${(14 * (1 - t)).toFixed(1)}px)`;
        w.style.transform = `translate(calc(${w.dataset.dx} * ${(1 - t).toFixed(3)}), calc(${w.dataset.dy} * ${(1 - t).toFixed(3)})) scale(${(1 + 0.4 * (1 - t)).toFixed(3)})`;
      });
      eyebrow.style.opacity = seg(p, 0.12, 0.2);

      // 2. the product page grows from a small card to full size
      const z = ease(seg(p, 0.14, 0.34));
      shot.style.opacity = clamp(z * 3);
      shot.style.transform = `translate(-50%, -50%) scale(${(0.42 + 0.58 * z).toFixed(4)})`;

      // 3. four steps: pin pops, line draws to its card, card slides in
      const sr = stage.getBoundingClientRect();
      let active = 0;
      calls.forEach((c, i) => {
        const a = 0.38 + i * 0.14;
        const pinT = ease(seg(p, a, a + 0.03));
        const lineT = seg(p, a + 0.02, a + 0.08);
        const cardT = ease(seg(p, a + 0.06, a + 0.11));
        if (pinT > 0) active = i + 1;
        pins[i].style.transform = `scale(${pinT.toFixed(3)})`;
        pins[i].classList.toggle("is-on", pinT >= 1);
        const side = i === 0 ? -1 : 1;
        c.style.opacity = cardT;
        c.style.transform = `translateX(${(side * 30 * (1 - cardT)).toFixed(1)}px)`;
        const pr = pins[i].getBoundingClientRect();
        const cr = c.getBoundingClientRect();
        const ax = pr.left + pr.width / 2 - sr.left, ay = pr.top + pr.height / 2 - sr.top;
        const bx = (side < 0 ? cr.right + 10 : cr.left - 10) - sr.left;
        const by = cr.top + 34 - sr.top;
        const mx = side < 0 ? bx + 28 : bx - 28;
        paths[i].setAttribute("d", `M${ax.toFixed(1)} ${ay.toFixed(1)} L${mx.toFixed(1)} ${by.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}`);
        paths[i].style.strokeDashoffset = (1 - lineT).toFixed(3);
        dots[i].setAttribute("cx", bx.toFixed(1));
        dots[i].setAttribute("cy", by.toFixed(1));
        dots[i].style.opacity = lineT >= 1 ? 1 : 0;
      });
      countEl.textContent = "0" + active;
      barEl.style.transform = `scaleX(${seg(p, 0.38, 0.92).toFixed(3)})`;
    };
    desk.addEventListener("change", renderStory);
  }

  // Same-day: title writes itself, then the frame opens like paper and the tear plays from the start
  const sdFrame = document.querySelector("[data-sdframe]");
  if (sdFrame) {
    const v = sdFrame.querySelector("video");
    let opened = false;
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (e.isIntersecting) { v.preload = "auto"; v.load(); o.disconnect(); }
    }), { rootMargin: "600px 0px" }).observe(sdFrame);
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        if (!opened) {
          opened = true;
          sdFrame.classList.add("is-open");
          try { v.currentTime = 0; } catch (_) {}
          setTimeout(() => v.play().catch(() => {}), reduceMotion ? 0 : 500);
          // after the first full play, loop quietly
          v.addEventListener("ended", () => { v.loop = true; v.play().catch(() => {}); }, { once: true });
        } else v.play().catch(() => {});
      } else if (opened) v.pause();
    }), { threshold: 0.45 }).observe(sdFrame);
  }
  const sdClip = sdFrame && sdFrame.querySelector(".sd__clip");
  const sdVid = sdClip && sdClip.querySelector("video");
  const renderSd = () => {
    if (!sdClip || reduceMotion) return;
    const vh = window.innerHeight;
    const r = sdFrame.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    // 0 when the frame's top enters the screen, 1 when the frame is centred
    const t = clamp((vh - r.top) / (vh * 0.5 + r.height * 0.5));
    const e = 1 - Math.pow(1 - t, 3);
    sdVid.style.transform = `scale(${(1.3 - 0.3 * e).toFixed(4)})`;
    const side = (7 * (1 - e)).toFixed(2);
    sdClip.style.clipPath = `inset(0 ${side}% 0 ${side}% round ${(6 + 12 * (1 - e)).toFixed(1)}px)`;
  };

  // Basket flies in from the right while the card scrolls into place
  const basket = document.querySelector(".feat__cut");
  const basketCard = document.querySelector(".feat__card");
  const renderBasket = () => {
    if (!basket || reduceMotion) return;
    const vh = window.innerHeight;
    const r = basketCard.getBoundingClientRect();
    const t = clamp((vh * 1.3 - r.bottom) / (vh * 0.55));
    const e = 1 - Math.pow(1 - t, 3);
    basket.style.translate = `${(38 * (1 - e)).toFixed(2)}vw ${(10 * (1 - e)).toFixed(2)}vh`;
    basket.style.rotate = `${(18 * (1 - e)).toFixed(2)}deg`;
    basket.style.opacity = clamp(t * 1.6).toFixed(3);
  };

  // Top bar turns solid after the hero
  const bar = document.querySelector(".topbar");

  // Scroll effects
  const block = document.querySelector(".hero__block");
  const bouquet = document.querySelector(".hero__bouquet");
  const stem = document.querySelector(".hero__stem");
  const strip = document.querySelector("[data-drift]");
  const laptop = document.querySelector("[data-tilt]");
  const drifters = document.querySelectorAll("[data-parallax]");
  const growers = document.querySelectorAll("[data-grow]");
  let ticking = false;

  const update = () => {
    const vh = window.innerHeight, y = window.scrollY;
    bar.classList.toggle("is-solid", y > 40);
    if (!reduceMotion) {
      if (laptop) {
        const r = laptop.getBoundingClientRect();
        const t = clamp(1 - (r.top - vh * .15) / (vh * .6));
        laptop.style.transform = `rotateX(${8 * (1 - t)}deg) scale(${.94 + .06 * t})`;
      }
      if (y < vh * 1.2 && window.innerWidth > 749) {
        if (block) block.style.translate = `0 ${(y * 0.12).toFixed(1)}px`;
        if (bouquet) bouquet.style.translate = `0 ${(y * -0.08).toFixed(1)}px`;
        if (stem) stem.style.translate = `0 ${(y * 0.22).toFixed(1)}px`;
      }
      growers.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const t = clamp((vh - r.top) / (vh * 0.7));
        el.style.transform = `scale(${(0.86 + 0.14 * (1 - Math.pow(1 - t, 3))).toFixed(4)})`;
      });
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
    renderStory();
    renderSd();
    renderBasket();
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

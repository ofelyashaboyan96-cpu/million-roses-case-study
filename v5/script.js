(() => {
  /* Each flower: image, where its stem ends (sx, 0..1), height (h, in u),
     final angle (r), side flip, layer (z), and the step it arrives with. */
  const FLOWERS = [
    { src: 'rose1',    sx: .432, h: 58, r: -6,  z: 6,  step: 1 },
    { src: 'rose2',    sx: .911, h: 46, r: 14,  z: 7,  step: 1, flip: -1 },
    { src: 'gerbera1', sx: .042, h: 44, r: -42, z: 9,  step: 2 },
    { src: 'gerbera2', sx: .489, h: 30, r: 12,  z: 10, step: 2 },
    { src: 'tulip1',   sx: .348, h: 66, r: -20, z: 3,  step: 3 },
    { src: 'tulip2',   sx: .612, h: 70, r: 20,  z: 2,  step: 3 },
    { src: 'lily',     sx: .257, h: 72, r: 8,   z: 1,  step: 4, back: 1 },
    { src: 'lily',     sx: .257, h: 64, r: -10, z: 1,  step: 4, flip: -1, back: 1 },
    { src: 'alstro',   sx: .411, h: 50, r: -30, z: 4,  step: 5 },
    { src: 'alstro',   sx: .411, h: 46, r: 30,  z: 5,  step: 5, flip: -1 },
  ];
  const STEPS = 6; // the last section ties the ribbon
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const bouquet = document.querySelector('.bouquet');
  const ribbon = document.querySelector('.ribbon');
  const secs = [...document.querySelectorAll('.sec')];

  const els = FLOWERS.map((f, i) => {
    const el = document.createElement('div');
    el.className = 'fl' + (f.back ? ' fl--back' : '');
    el.style.zIndex = f.z;
    el.style.setProperty('--sx', `${-f.sx * 100}%`);
    if (f.flip) el.style.setProperty('--flip', f.flip);
    const img = new Image();
    img.src = `assets/${f.src}.webp`; img.alt = ''; img.decoding = 'async';
    el.appendChild(img);
    bouquet.appendChild(el);
    // arrive from below and a little to the side, like it came up with the page
    f.fx = (i % 2 ? 1 : -1) * (14 + (i * 7) % 12);
    f.fy = 70 + (i * 13) % 20;
    f.fr = (i % 2 ? 1 : -1) * (18 + (i * 5) % 14);
    f.delay = f.step - 1 + (i % 2) * 0.14;
    return el;
  });

  let u = 1, mobile = false;
  function layout() {
    mobile = innerWidth < 750;
    u = (mobile ? Math.min(innerHeight * .62, innerWidth * 1.15) : Math.min(innerHeight * .9, innerWidth * .62)) / 100;
    const root = document.documentElement.style;
    root.setProperty('--u', u + 'px');
    root.setProperty('--cx', mobile ? '50%' : '64%');
    root.setProperty('--tie', mobile ? '86%' : '80%');
    els.forEach((el, i) => {
      el.style.setProperty('--h', FLOWERS[i].h * u + 'px');
      el.style.setProperty('--tail', (mobile ? 10 : 14) * u + 'px');
    });
  }

  const clamp = v => Math.min(1, Math.max(0, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const ease = t => t * t * (3 - 2 * t);

  let cur = 0, target = 0;
  const read = () => { target = scrollY / innerHeight; };

  function render(time) {
    cur += (target - cur) * (reduce ? 1 : 0.085);
    if (Math.abs(target - cur) < 0.0004) cur = target;
    const s = cur;

    FLOWERS.forEach((f, i) => {
      // arrives while its section scrolls in (from 30% to 95% of the way)
      const t = clamp((s - f.delay - 0.3) / 0.65);
      const e = easeOut(t), k = 1 - e;
      const sway = reduce ? 0 : Math.sin(time / 1500 + i * 1.3) * (0.6 + (i % 3) * 0.25) * e;
      const x = reduce ? 0 : f.fx * u * k;
      const y = reduce ? 0 : f.fy * u * k;
      const r = f.r + (reduce ? 0 : f.fr * k) + sway;
      const el = els[i];
      el.style.opacity = reduce ? (t > .5 ? 1 : 0) : clamp(t * 2.5);
      el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${reduce ? 1 : .88 + .12 * e})`;
    });

    const rt = ease(clamp((s - (STEPS - 1) - 0.3) / 0.55));
    ribbon.style.opacity = rt;
    ribbon.style.transform = `translateY(${(1 - rt) * 3 * u}px) scale(${.6 + .4 * rt})`;

    // the bouquet breathes a little bigger as it fills
    const fill = clamp(s / STEPS);
    bouquet.style.transform = `scale(${0.96 + 0.04 * fill})`;
    bouquet.style.transformOrigin = mobile ? '50% 86%' : '64% 80%';

    requestAnimationFrame(render);
  }

  // section text fades in when its section is mostly on screen
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-in', e.isIntersecting)), { threshold: .45 });
  secs.forEach(s => io.observe(s));

  layout(); read();
  addEventListener('resize', () => { layout(); read(); });
  addEventListener('scroll', read, { passive: true });
  requestAnimationFrame(render);
})();

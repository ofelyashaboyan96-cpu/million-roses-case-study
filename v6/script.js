(() => {
  /* One flower = image, stem end inside image (sx 0..1), image height (h),
     extra stem drawn below the image (lift), final angle (r), layer (z), step. */
  const FLOWERS = [
    { src: 'allium1',    sx: .51,  h: 38, lift: 24, r: -16, z: 3, step: 1 },
    { src: 'allium2',    sx: .48,  h: 46, lift: 14, r: 13,  z: 2, step: 1 },
    { src: 'delph',      sx: .546, h: 34, lift: 16, r: -30, z: 4, step: 2 },
    { src: 'delph',      sx: .546, h: 31, lift: 18, r: 28,  z: 4, step: 2, flip: -1 },
    { src: 'hyd-green',  sx: .69,  h: 27, lift: 16, r: 3,   z: 6, step: 3 },
    { src: 'hyd-blue',   sx: .406, h: 25, lift: 8, r: -36, z: 7, step: 3 },
    { src: 'mum',        sx: .5,   h: 17, lift: 13, r: 22,  z: 8, step: 4 },
    { src: 'mum-spider', sx: .026, h: 36, lift: 0,  r: -14, z: 5, step: 4 },
  ];
  const LAST = 5; // section that reveals the real bouquet
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stage = document.querySelector('.stage');
  const bouquet = document.querySelector('.bouquet');
  const finalImg = document.querySelector('.final');
  const glow = document.querySelector('.glow');
  const secs = [...document.querySelectorAll('.sec')];

  const els = FLOWERS.map((f, i) => {
    const el = document.createElement('div');
    el.className = 'fl';
    el.style.zIndex = f.z;
    el.style.setProperty('--sx', `${-f.sx * 100}%`);
    if (f.flip) el.style.setProperty('--flip', f.flip);
    const img = new Image();
    img.src = `assets/${f.src}.webp`; img.alt = ''; img.decoding = 'async';
    el.appendChild(img);
    bouquet.appendChild(el);
    f.fx = (i % 2 ? 1 : -1) * (16 + (i * 7) % 12);
    f.fy = 75 + (i * 13) % 20;
    f.fr = (i % 2 ? 1 : -1) * (18 + (i * 5) % 14);
    f.delay = f.step - 1 + (i % 2) * 0.14;
    return el;
  });

  let u = 1, mobile = false;
  function layout() {
    mobile = innerWidth < 750;
    u = (mobile ? Math.min(innerHeight * .6, innerWidth * 1.1) : Math.min(innerHeight * .92, innerWidth * .6)) / 100;
    const st = stage.style;
    st.setProperty('--u', u + 'px');
    st.setProperty('--cx', mobile ? '50%' : '66%');
    st.setProperty('--tie', mobile ? '84%' : '80%');
    els.forEach((el, i) => {
      el.style.setProperty('--h', FLOWERS[i].h * u + 'px');
      el.style.setProperty('--lift', FLOWERS[i].lift * u + 'px');
      el.style.setProperty('--tail', (mobile ? 7 : 9) * u + 'px');
    });
    // the real bouquet: its ribbon (79% down, 39% across) sits on the tie point
    const fh = 92 * u;
    st.setProperty('--fh', fh + 'px');
    st.setProperty('--fsx', '39%');
    finalImg.style.marginLeft = `${-0.39 * fh * (932 / 1219)}px`;
    finalImg.style.marginTop = `${-0.79 * fh}px`;
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
      const t = clamp((s - f.delay - 0.3) / 0.65);
      const e = easeOut(t), k = 1 - e;
      const sway = reduce ? 0 : Math.sin(time / 1500 + i * 1.3) * (0.6 + (i % 3) * 0.25) * e;
      const el = els[i];
      el.style.opacity = reduce ? (t > .5 ? 1 : 0) : clamp(t * 2.5);
      el.style.transform = `translate3d(${reduce ? 0 : f.fx * u * k}px,${reduce ? 0 : f.fy * u * k}px,0) rotate(${f.r + (reduce ? 0 : f.fr * k) + sway}deg) scale(${reduce ? 1 : .88 + .12 * e})`;
    });

    // last section: the gathered stems become the real, wrapped bouquet
    const rv = ease(clamp((s - (LAST - 1) - 0.35) / 0.55));
    bouquet.style.opacity = 1 - rv;
    bouquet.style.transform = `scale(${1 + rv * .04})`;
    bouquet.style.transformOrigin = mobile ? '50% 84%' : '66% 80%';
    finalImg.style.opacity = rv;
    finalImg.style.transform = `scale(${.94 + .06 * rv})`;
    glow.style.opacity = clamp(s * 1.5) * (1 - rv * .5);

    requestAnimationFrame(render);
  }

  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-in', e.isIntersecting)), { threshold: .45 });
  secs.forEach(s => io.observe(s));

  layout(); read();
  addEventListener('resize', () => { layout(); read(); });
  addEventListener('scroll', read, { passive: true });
  requestAnimationFrame(render);
})();

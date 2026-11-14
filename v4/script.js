(() => {
  const flowers = [...document.querySelectorAll('.fl')];
  const ribbon = document.querySelector('.ribbon');
  const bouquet = document.querySelector('.bouquet');
  const caps = [...document.querySelectorAll('.cap')];
  const dots = [...document.querySelectorAll('.dots i')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // where each flower comes from (in "u" units) and how much it turns while arriving
  const from = [[-40, -70, -28], [45, -60, 24], [10, -95, 18], [-30, -80, -22]];

  flowers.forEach(f => {
    const img = new Image();
    img.src = f.dataset.src; img.alt = ''; img.decoding = 'async';
    f.style.setProperty('--sx', `${-f.dataset.x * 100}%`);
    f.style.zIndex = f.dataset.z;
    f.appendChild(img);
  });

  let u = 1, mobile = false;
  function layout() {
    mobile = innerWidth < 750;
    // one "u" = 1% of the usable height; on phones also limited by width
    u = Math.min(innerHeight, innerWidth * (mobile ? 1.55 : 1.9)) / 100;
    document.documentElement.style.setProperty('--u', u + 'px');
    const tie = mobile ? 84 : 78;
    flowers.forEach(f => {
      f.style.setProperty('--h', f.dataset.h * u * (mobile ? .82 : 1) + 'px');
      f.style.setProperty('--tie', tie + '%');
    });
    ribbon.style.setProperty('--tie', tie + '%');
    bouquet.style.left = mobile ? '0' : '8vw';
  }

  const clamp = v => Math.min(1, Math.max(0, v));
  const ease = t => t * t * (3 - 2 * t);
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  let cur = 0, target = 0, lastStep = -1;
  const read = () => { target = scrollY / innerHeight; };

  function render(time) {
    cur += (target - cur) * (reduce ? 1 : 0.09);
    if (Math.abs(target - cur) < 0.0005) cur = target;
    const s = cur;
    const sway = reduce ? 0 : Math.sin(time / 1400);

    flowers.forEach((f, i) => {
      // flower i arrives while the scroll goes from step i to step i+1
      const t = clamp((s - i) / 0.85);
      const e = easeOut(t), k = 1 - e;
      const [fx, fy, fr] = from[i];
      const r = +f.dataset.r + fr * k + sway * (0.5 + i * 0.15) * e;
      const x = reduce ? 0 : fx * u * k;
      const y = reduce ? 0 : fy * u * k;
      const sc = reduce ? 1 : 0.9 + 0.1 * e;
      f.style.opacity = reduce ? (t > 0.5 ? 1 : 0) : clamp(t * 2.2);
      f.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${sc})`;
    });

    const rt = ease(clamp((s - 4.15) / 0.6));
    ribbon.style.opacity = rt;
    ribbon.style.transform = `rotate(${-2 + sway * .4}deg) scaleX(${0.2 + 0.8 * rt})`;

    // at the end the bouquet settles a touch lower and closer
    const end = ease(clamp(s - 4));
    bouquet.style.transform = `translate3d(0,${end * u * (mobile ? 2 : 3)}px,0) scale(${1 + end * 0.03})`;

    const step = Math.min(caps.length - 1, Math.max(0, Math.round(s)));
    if (step !== lastStep) {
      caps.forEach((c, i) => c.classList.toggle('is-on', i === step));
      dots.forEach((d, i) => d.classList.toggle('is-on', i === step));
      lastStep = step;
    }
    requestAnimationFrame(render);
  }

  layout(); read();
  addEventListener('resize', () => { layout(); read(); });
  addEventListener('scroll', read, { passive: true });
  requestAnimationFrame(render);
})();

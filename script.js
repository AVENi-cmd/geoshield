(() => {
  'use strict';

  const menu = document.getElementById('menu');
  const nav = document.getElementById('nav');
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  const slides = [...document.querySelectorAll('.slide')];
  const dotsWrap = document.getElementById('dots');
  let current = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `انتقل للشريحة ${i + 1}`);
    dot.addEventListener('click', () => { show(i); restart(); });
    dotsWrap?.appendChild(dot);
  });
  const dots = [...(dotsWrap?.children || [])];

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 5500);
  }
  document.getElementById('prev')?.addEventListener('click', () => { show(current - 1); restart(); });
  document.getElementById('next')?.addEventListener('click', () => { show(current + 1); restart(); });
  show(current);
  restart();

  const branches = {
    hofuf: {
      title: 'فرع الأحساء',
      address: 'الهفوف – حي البندرية – شارع الأمير نايف',
      phone: '0553291112',
      wa: '966553291112'
    },
    khafji: {
      title: 'فرع الخفجي',
      address: 'الخفجي – حي الفيحاء – شارع الملك عبدالله',
      phone: '0535728805',
      wa: '966535728805'
    }
  };

  document.querySelectorAll('.branch-tab').forEach(btn => btn.addEventListener('click', () => {
    const data = branches[btn.dataset.branch];
    if (!data) return;
    document.querySelectorAll('.branch-tab').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('branchInfo').innerHTML = `
      <h3>${data.title}</h3><p>${data.address}</p>
      <div class="actions">
        <a class="btn primary" href="tel:${data.phone}">اتصال</a>
        <a class="btn outline" target="_blank" rel="noopener" href="https://wa.me/${data.wa}">واتساب</a>
      </div>`;
  }));

  const header = document.getElementById('header');
  const onScroll = () => header?.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
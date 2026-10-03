(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const serviceIcons = [
    '<svg viewBox="0 0 24 24"><path d="M4 15c3-1 5-3 6-7 3 1 5 3 6 6 1 3 0 5-2 6-3 1-7-1-10-5Z"/><path d="M8 17c2-1 4-3 5-6"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 5v14M16 5v14M4 10h16"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M5 16h14l-1.5-5h-11L5 16Z"/><path d="M7 16v2M17 16v2M8 11l1-3h6l1 3"/></svg>'
  ];
  const promiseIcons = [
    '<svg viewBox="0 0 24 24"><path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/><path d="M7 3 4 6M17 3l3 3"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M12 3v18M5 7l14 10M19 7 5 17"/><circle cx="12" cy="12" r="9"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M7 20v-9M17 20v-9M4 11h16l-2-6H6l-2 6Z"/><path d="M9 8h6M10 20h4"/></svg>'
  ];

  $$('.mini-services > div').forEach((item, index) => {
    if (!item.querySelector('.gs-icon')) item.insertAdjacentHTML('afterbegin', `<span class="gs-icon" aria-hidden="true">${serviceIcons[index % serviceIcons.length]}</span>`);
  });
  $$('.why-grid article').forEach((item, index) => {
    if (!item.querySelector('.why-icon')) item.insertAdjacentHTML('afterbegin', `<span class="why-icon" aria-hidden="true">${promiseIcons[index % promiseIcons.length]}</span>`);
  });

  const installmentsHero = $('.hero-slide img[src*="hero-slider-geoshield-installments"]');
  if (installmentsHero) installmentsHero.alt = 'خيارات الدفع والتقسيط لدى جيوشيلد';

  const promiseCards = $$('.why-grid article');
  if (promiseCards[3]) {
    const title = $('h3', promiseCards[3]);
    const text = $('p', promiseCards[3]);
    if (title) title.textContent = 'عناية بعد التركيب';
    if (text) text.textContent = 'فحص مجاني خلال 4 أسابيع وصيانة دورية كل 6 شهور.';
  }

  const aftercareItems = $$('.aftercare li');
  if (aftercareItems[1]) {
    const text = $('span', aftercareItems[1]);
    if (text) text.textContent = 'بدون فتح النوافذ بعد تركيب العازل الحراري.';
  }
  const aftercare = $('.aftercare');
  if (aftercare && !$('.warranty-maintenance-note')) {
    aftercare.insertAdjacentHTML('afterend', '<p class="notice warranty-maintenance-note">عدم الالتزام بالصيانة الدورية يلغي الضمان.</p>');
  }

  const serviceSelect = $('select[name="service"]');
  if (serviceSelect) {
    const requiredStandalone = ['حماية الزجاج', 'رش وحماية أسفل السيارة', 'التلبيس الداخلي'];
    const existing = new Set($$('option', serviceSelect).map(option => option.textContent.trim()));
    requiredStandalone.forEach(label => {
      if (existing.has(label)) return;
      const option = document.createElement('option');
      option.value = label;
      option.textContent = label;
      serviceSelect.append(option);
    });
  }

  const header = $('#header');
  const menu = $('#menu');
  const nav = $('#nav');

  function closeMenu(returnFocus = false) {
    const wasOpen = nav?.classList.contains('open');
    nav?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'فتح القائمة');
    if (returnFocus && wasOpen) menu?.focus();
  }

  menu?.addEventListener('click', () => {
    const open = !nav?.classList.contains('open');
    nav?.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });
  $$('#nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('pointerdown', event => {
    if (innerWidth <= 1050 && nav?.classList.contains('open') && !nav.contains(event.target) && !menu?.contains(event.target)) closeMenu();
  });
  addEventListener('resize', () => { if (innerWidth > 1050) closeMenu(); }, { passive: true });
  const syncHeader = () => header?.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  if ('IntersectionObserver' in window) {
    const navLinks = $$('#nav a[href^="#"]');
    const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-30% 0px -60%', threshold: [0, .2, .5] });
    sections.forEach(section => navObserver.observe(section));
  }

  const hero = $('.hero');
  const slides = $$('.hero-slide');
  const dots = $('.hero-dots');
  const progress = $('.hero-progress i');
  let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
  let timer;
  let touchStartX = 0;
  let heroPaused = false;

  if (dots) dots.setAttribute('role', 'group');
  slides.forEach((slide, index) => {
    slide.setAttribute('aria-hidden', String(index !== current));
    if (!dots) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `عرض الشريحة ${index + 1}`);
    button.addEventListener('click', () => goToSlide(index));
    dots.append(button);
  });

  function scheduleHero() {
    clearTimeout(timer);
    if (!reduceMotion && !heroPaused && !document.hidden && slides.length > 1) timer = setTimeout(() => goToSlide(current + 1), 6500);
  }
  function restartProgress() {
    if (!progress) return;
    progress.style.transition = 'none';
    progress.style.width = '0';
    if (!reduceMotion && !heroPaused && !document.hidden) requestAnimationFrame(() => requestAnimationFrame(() => {
      progress.style.transition = 'width 6.5s linear';
      progress.style.width = '100%';
    }));
  }
  function setHeroPaused(paused) {
    heroPaused = paused;
    if (paused) {
      clearTimeout(timer);
      if (progress) progress.style.transition = 'none';
    } else {
      restartProgress();
      scheduleHero();
    }
  }
  function goToSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    if (dots) $$('button', dots).forEach((button, buttonIndex) => {
      const active = buttonIndex === current;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    restartProgress();
    scheduleHero();
  }

  $('.prev')?.addEventListener('click', () => goToSlide(current - 1));
  $('.next')?.addEventListener('click', () => goToSlide(current + 1));
  hero?.addEventListener('touchstart', event => { touchStartX = event.touches[0].clientX; setHeroPaused(true); }, { passive: true });
  hero?.addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 48) goToSlide(current + (distance > 0 ? -1 : 1));
    setHeroPaused(false);
  }, { passive: true });
  if (canHover) {
    hero?.addEventListener('pointerenter', () => setHeroPaused(true));
    hero?.addEventListener('pointerleave', () => setHeroPaused(false));
  }
  hero?.addEventListener('focusin', () => setHeroPaused(true));
  hero?.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) setHeroPaused(false); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(timer);
      if (progress) progress.style.transition = 'none';
      return;
    }
    restartProgress();
    scheduleHero();
  });
  goToSlide(current);

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -4%' });
    $$('.reveal').forEach(item => revealObserver.observe(item));
  } else {
    $$('.reveal').forEach(item => item.classList.add('visible'));
  }

  function setupTabs(buttons, panels, keyForButton, keyForPanel) {
    buttons.forEach((button, index) => {
      const key = keyForButton(button);
      const panel = panels.find(item => keyForPanel(item) === key);
      const buttonId = `${key}-tab`;
      const panelId = `${key}-panel`;
      button.id = buttonId;
      button.setAttribute('aria-controls', panelId);
      button.tabIndex = button.classList.contains('active') ? 0 : -1;
      if (panel) {
        panel.id = panelId;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', buttonId);
        panel.hidden = !panel.classList.contains('active');
      }
      const activate = () => {
        buttons.forEach(item => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        panels.forEach(item => {
          const active = keyForPanel(item) === key;
          item.classList.toggle('active', active);
          item.hidden = !active;
        });
      };
      button.addEventListener('click', activate);
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'Home') next = buttons[0];
        else if (event.key === 'End') next = buttons.at(-1);
        else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          const step = event.key === 'ArrowRight' ? -1 : 1;
          next = buttons[(index + step + buttons.length) % buttons.length];
        }
        if (!next) return;
        event.preventDefault();
        next.focus();
        next.click();
      });
    });
  }

  const packageTabs = $$('.package-tabs button');
  const packagePanels = $$('.package-panel');
  setupTabs(packageTabs, packagePanels, button => `package-${button.dataset.package}`, panel => `package-${panel.dataset.panel}`);

  const branches = {
    hofuf: { title: 'فرع الأحساء - الهفوف', address: 'حي البندرية - شارع الأمير نايف', displayPhone: '055 329 1112', phone: '966553291112', map: 'https://maps.app.goo.gl/4hiJ3tTdzweoCe7K6' },
    khafji: { title: 'فرع الخفجي', address: 'حي الفيحاء - شارع الملك عبدالله', displayPhone: '053 572 8805', phone: '966535728805', map: 'https://maps.app.goo.gl/Xf6qwvbKYHtd15xc9' }
  };
  const quickCall = $('.mobile-bar a[href^="tel:"]');
  const quickWhatsApp = $('.mobile-bar a[href^="https://wa.me/"]');
  const branchSelect = $('select[name="branch"]');

  function syncQuickContact(key) {
    const branch = branches[key] || branches.hofuf;
    if (quickCall) {
      quickCall.href = `tel:+${branch.phone}`;
      quickCall.setAttribute('aria-label', `الاتصال بـ${branch.title}`);
      quickCall.title = `الاتصال بـ${branch.title}`;
    }
    if (quickWhatsApp) {
      quickWhatsApp.href = `https://wa.me/${branch.phone}`;
      quickWhatsApp.setAttribute('aria-label', `مراسلة ${branch.title} عبر واتساب`);
      quickWhatsApp.title = `مراسلة ${branch.title} عبر واتساب`;
    }
  }

  const branchLayout = $('#branches .branch-layout');
  if (branchLayout && !$('.branch-cards', branchLayout)) {
    branchLayout.classList.add('branches-static');
    const cards = document.createElement('div');
    cards.className = 'branch-cards';
    cards.innerHTML = Object.entries(branches).map(([key, branch], index) => {
      const headingId = `branch-${key}-title`;
      return `
      <article class="branch-card" data-branch-card="${key}" aria-labelledby="${headingId}">
        <div class="branch-card-top"><span class="branch-mark">0${index + 1}</span><span class="branch-eyebrow">GEOSHIELD CENTER</span></div>
        <h3 id="${headingId}">${branch.title}</h3>
        <address class="branch-address">${branch.address}</address>
        <a class="branch-phone" href="tel:+${branch.phone}" dir="ltr" aria-label="الاتصال بـ${branch.title}">${branch.displayPhone}</a>
        <div class="branch-hours"><span>السبت - الخميس</span><strong>9:00 ص - 10:00 م</strong><span>الجمعة</span><strong>4:00 م - 10:00 م</strong></div>
        <div class="actions"><a class="button primary" href="https://wa.me/${branch.phone}" target="_blank" rel="noopener" aria-label="مراسلة ${branch.title} عبر واتساب">واتساب الفرع</a><a class="button ghost" href="${branch.map}" target="_blank" rel="noopener" aria-label="عرض موقع ${branch.title} على الخريطة">عرض الموقع</a></div>
      </article>`;
    }).join('');
    branchLayout.append(cards);
  }

  branchSelect?.addEventListener('change', () => syncQuickContact(branchSelect.value));
  syncQuickContact(branchSelect?.value || 'hofuf');

  const lightbox = $('#lightbox');
  const lightboxImage = lightbox ? $('img', lightbox) : null;
  const lightboxClose = lightbox ? $('button', lightbox) : null;
  let lastFocus = null;

  function closeLightbox() {
    if (!lightbox?.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  }

  $$('.work-item').forEach(item => item.addEventListener('click', () => {
    const image = $('img', item);
    if (!lightbox || !lightboxImage || !image) return;
    lastFocus = item;
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }));
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (lightbox?.classList.contains('open')) closeLightbox();
      else closeMenu(true);
    }
    if (event.key === 'Tab' && lightbox?.classList.contains('open')) {
      event.preventDefault();
      lightboxClose?.focus();
    }
  });

  const form = $('#bookingForm');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = name => String(data.get(name) || '').trim();
    const branchKey = value('branch');
    const branch = branchKey === 'khafji' ? branches.khafji : branches.hofuf;
    const branchName = branchKey === 'khafji' ? 'الخفجي' : 'الأحساء';
    const message = [
      'السلام عليكم، أرغب بحجز موعد لدى جيوشيلد.',
      '',
      `الاسم: ${value('name')}`,
      `رقم الجوال: ${value('phone')}`,
      `السيارة: ${value('car')}`,
      `الخدمة: ${value('service')}`,
      `الفرع: ${branchName}`,
      `التاريخ المفضل: ${value('date') || 'غير محدد'}`,
      `ملاحظات: ${value('notes') || 'لا يوجد'}`
    ].join('\n');
    location.href = `https://wa.me/${branch.phone}?text=${encodeURIComponent(message)}`;
  });

  const dateInput = $('input[type="date"]');
  if (dateInput) {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    dateInput.min = local.toISOString().slice(0, 10);
  }
})();
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

  const uiIcons = {
    previous: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M7.2 3.8 9.8 7l-2 2.2a15.8 15.8 0 0 0 7 7l2.2-2 3.2 2.6c.4.3.5.9.2 1.3-1 1.5-2.4 2.2-4 2-6.5-.9-11.6-6-12.5-12.5-.2-1.6.5-3 2-4 .4-.3 1-.2 1.3.2Z"/></svg>',
    message: '<svg viewBox="0 0 24 24"><path d="M5 5h14v11H9l-4 3V5Z"/><path d="M8 9h8M8 12h5"/></svg>',
    map: '<svg viewBox="0 0 24 24"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><path d="M5 7h14v13H5zM8 4v5M16 4v5M5 11h14"/></svg>'
  };

  const iconSpan = (icon, className = 'ui-icon') => `<span class="${className}" aria-hidden="true">${icon}</span>`;

  $$('.mini-services > div').forEach((item, index) => {
    if (!item.querySelector('.gs-icon')) item.insertAdjacentHTML('afterbegin', `<span class="gs-icon" aria-hidden="true">${serviceIcons[index % serviceIcons.length]}</span>`);
  });

  $$('.why-grid article').forEach((item, index) => {
    if (!item.querySelector('.why-icon')) item.insertAdjacentHTML('afterbegin', `<span class="why-icon" aria-hidden="true">${promiseIcons[index % promiseIcons.length]}</span>`);
  });

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

  addEventListener('resize', () => {
    if (innerWidth > 1050) closeMenu();
  }, { passive: true });

  const syncHeader = () => header?.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  if ('IntersectionObserver' in window) {
    const navLinks = $$('#nav a[href^="#"]');
    const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
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
  const previousArrow = $('.hero-arrow.prev');
  const nextArrow = $('.hero-arrow.next');
  const heroPauseReasons = new Set();
  let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
  let timer;
  let touchStartX = 0;

  hero?.setAttribute('role', 'region');
  hero?.setAttribute('aria-roledescription', 'carousel');
  if (previousArrow) previousArrow.innerHTML = uiIcons.previous;
  if (nextArrow) nextArrow.innerHTML = uiIcons.next;
  if (dots) {
    dots.setAttribute('role', 'group');
    dots.replaceChildren();
  }

  slides.forEach((slide, index) => {
    const slideId = `hero-slide-${index + 1}`;
    slide.id = slideId;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} من ${slides.length}`);
    slide.setAttribute('aria-hidden', String(index !== current));
    if (!dots) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `عرض الشريحة ${index + 1}`);
    button.setAttribute('aria-controls', slideId);
    button.addEventListener('click', () => goToSlide(index));
    dots.append(button);
  });

  const heroCanRun = () => !reduceMotion && !document.hidden && heroPauseReasons.size === 0 && slides.length > 1;

  function stopHero() {
    clearTimeout(timer);
    if (progress) progress.style.transition = 'none';
  }

  function scheduleHero() {
    clearTimeout(timer);
    if (heroCanRun()) timer = setTimeout(() => goToSlide(current + 1), 6500);
  }

  function restartProgress() {
    if (!progress) return;
    progress.style.transition = 'none';
    progress.style.width = '0';
    if (!heroCanRun()) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!heroCanRun()) return;
      progress.style.transition = 'width 6.5s linear';
      progress.style.width = '100%';
    }));
  }

  function setHeroPause(reason, paused) {
    if (paused) heroPauseReasons.add(reason);
    else heroPauseReasons.delete(reason);
    if (heroCanRun()) {
      restartProgress();
      scheduleHero();
    } else {
      stopHero();
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

  previousArrow?.addEventListener('click', () => goToSlide(current - 1));
  nextArrow?.addEventListener('click', () => goToSlide(current + 1));

  hero?.addEventListener('touchstart', event => {
    touchStartX = event.touches[0].clientX;
    setHeroPause('touch', true);
  }, { passive: true });

  hero?.addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 48) goToSlide(current + (distance > 0 ? -1 : 1));
    setHeroPause('touch', false);
  }, { passive: true });

  hero?.addEventListener('touchcancel', () => setHeroPause('touch', false), { passive: true });

  if (canHover) {
    hero?.addEventListener('pointerenter', () => setHeroPause('pointer', true));
    hero?.addEventListener('pointerleave', () => setHeroPause('pointer', false));
  }

  hero?.addEventListener('focusin', () => setHeroPause('focus', true));
  hero?.addEventListener('focusout', event => {
    if (!hero.contains(event.relatedTarget)) setHeroPause('focus', false);
  });

  document.addEventListener('visibilitychange', () => setHeroPause('document', document.hidden));

  if (hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry) setHeroPause('viewport', !entry.isIntersecting);
    }, { threshold: .08 });
    heroObserver.observe(hero);
  }

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
      button.setAttribute('role', 'tab');
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
  $('.package-tabs')?.setAttribute('aria-orientation', 'horizontal');
  setupTabs(packageTabs, packagePanels, button => `package-${button.dataset.package}`, panel => `package-${panel.dataset.panel}`);

  const bookingSection = $('#booking');
  const bookingServiceSelect = $('select[name="service"]');
  const bookingServiceValues = new Set(bookingServiceSelect ? [...bookingServiceSelect.options].map(option => option.value || option.textContent.trim()) : []);

  function chooseServiceAndBook(serviceName) {
    if (!bookingServiceSelect || !bookingSection || !bookingServiceValues.has(serviceName)) return;
    bookingServiceSelect.value = serviceName;
    bookingSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => bookingServiceSelect.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }

  const serviceBookingMap = new Map([
    ['أفلام حماية PPF', 'PPF'],
    ['العازل الحراري', 'عازل حراري'],
    ['نانو سيراميك', 'نانو سيراميك']
  ]);

  $$('.service-card').forEach(card => {
    const title = $('h3', card)?.textContent.trim();
    const serviceName = serviceBookingMap.get(title);
    const copy = card.querySelector(':scope > div');
    if (!serviceName || !copy || !bookingServiceValues.has(serviceName) || copy.querySelector('.service-book')) return;
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'package-book service-book';
    action.setAttribute('aria-label', `احجز خدمة ${title}`);
    action.innerHTML = `${iconSpan(uiIcons.calendar)}<span>احجز الخدمة</span>`;
    action.addEventListener('click', () => chooseServiceAndBook(serviceName));
    copy.append(action);
  });

  $$('.package-panel article').forEach(card => {
    if (card.querySelector('.package-book')) return;
    const serviceName = $('small', card)?.textContent.trim();
    if (!serviceName || !bookingServiceValues.has(serviceName)) return;
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'package-book';
    action.setAttribute('aria-label', `احجز باقة ${serviceName}`);
    action.innerHTML = `${iconSpan(uiIcons.calendar)}<span>احجز هذه الباقة</span>`;
    action.addEventListener('click', () => chooseServiceAndBook(serviceName));
    card.append(action);
  });

  const polish = $('.polish');
  if (polish && bookingServiceValues.has('تلميع كامل') && !polish.querySelector('.package-book')) {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'package-book polish-book';
    action.setAttribute('aria-label', 'احجز خدمة التلميع الكامل');
    action.innerHTML = `${iconSpan(uiIcons.calendar)}<span>احجز الخدمة</span>`;
    action.addEventListener('click', () => chooseServiceAndBook('تلميع كامل'));
    polish.append(action);
  }

  const branches = {
    hofuf: {
      title: 'فرع الأحساء - الهفوف',
      phone: '966553291112'
    },
    khafji: {
      title: 'فرع الخفجي',
      phone: '966535728805'
    }
  };

  $$('.branch-card').forEach(card => {
    const phone = $('.branch-phone', card);
    const actions = $('.actions', card);
    const whatsApp = $('.actions a[href*="wa.me"]', card);
    const map = $('.actions a[href*="maps.app.goo.gl"]', card);
    const branchKey = card.dataset.branchCard;
    if (phone && !phone.querySelector('.ui-icon')) phone.insertAdjacentHTML('afterbegin', iconSpan(uiIcons.phone, 'ui-icon branch-phone-icon'));
    if (whatsApp && !whatsApp.querySelector('.ui-icon')) whatsApp.insertAdjacentHTML('afterbegin', iconSpan(uiIcons.message));
    if (map && !map.querySelector('.ui-icon')) map.insertAdjacentHTML('afterbegin', iconSpan(uiIcons.map));
    if (actions && branchKey && branches[branchKey] && !actions.querySelector('.branch-book')) {
      const book = document.createElement('button');
      book.type = 'button';
      book.className = 'button ghost branch-book';
      book.dataset.bookBranch = branchKey;
      book.setAttribute('aria-label', `احجز موعدًا في ${branches[branchKey].title}`);
      book.innerHTML = `${iconSpan(uiIcons.calendar)}<span>احجز في هذا الفرع</span>`;
      actions.append(book);
    }
  });

  const weekdayNames = {
    Sun: 'الأحد',
    Mon: 'الاثنين',
    Tue: 'الثلاثاء',
    Wed: 'الأربعاء',
    Thu: 'الخميس',
    Fri: 'الجمعة',
    Sat: 'السبت'
  };
  const weekdayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const officialHours = {
    Sun: [[540, 720], [930, 1350]],
    Mon: [[540, 720], [930, 1350]],
    Tue: [[540, 720], [930, 1350]],
    Wed: [[540, 720], [930, 1350]],
    Thu: [[540, 720], [930, 1350]],
    Fri: [[960, 1200]],
    Sat: [[540, 720], [930, 1350]]
  };

  const arabicDigits = value => String(value).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
  const formatOpeningTime = minutes => {
    const hour24 = Math.floor(minutes / 60) % 24;
    const minute = minutes % 60;
    const period = hour24 < 12 ? 'ص' : 'م';
    const hour12 = hour24 % 12 || 12;
    return `${arabicDigits(hour12)}${minute ? `:${arabicDigits(String(minute).padStart(2, '0'))}` : ''} ${period}`;
  };

  function getNextOpening(weekday, minutesNow) {
    const todayPeriods = officialHours[weekday] || [];
    const laterToday = todayPeriods.find(([start]) => start > minutesNow);
    if (laterToday) return { label: 'اليوم', start: laterToday[0] };

    const currentIndex = weekdayOrder.indexOf(weekday);
    for (let offset = 1; offset <= 7; offset += 1) {
      const nextKey = weekdayOrder[(currentIndex + offset) % weekdayOrder.length];
      const periods = officialHours[nextKey] || [];
      if (!periods.length) continue;
      return {
        label: offset === 1 ? 'غدًا' : weekdayNames[nextKey],
        start: periods[0][0]
      };
    }
    return null;
  }

  function updateBranchHoursState() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Riyadh',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    const part = type => parts.find(item => item.type === type)?.value || '';
    const weekday = part('weekday');
    const todayName = weekdayNames[weekday];
    const minutesNow = Number(part('hour')) * 60 + Number(part('minute'));
    const activePeriod = (officialHours[weekday] || []).find(([start, end]) => minutesNow >= start && minutesNow < end);
    const isOpen = Boolean(activePeriod);
    const nextOpening = isOpen ? null : getNextOpening(weekday, minutesNow);
    const statusText = isOpen
      ? `مفتوح الآن حتى ${formatOpeningTime(activePeriod[1])}`
      : nextOpening
        ? `مغلق الآن • يفتح ${nextOpening.label} ${formatOpeningTime(nextOpening.start)}`
        : 'مغلق الآن';
    const titleText = `ساعات العمل الرسمية • ${statusText}`;

    $$('.weekly-hours').forEach(hours => {
      const title = $('.hours-title', hours);
      if (title) {
        if (title.textContent !== titleText) title.textContent = titleText;
        if (!title.hasAttribute('aria-live')) title.setAttribute('aria-live', 'polite');
      }
      hours.dataset.open = String(isOpen);
      $$('.hours-row', hours).forEach(row => {
        const day = $('span', row)?.textContent.trim();
        const isToday = day === todayName;
        row.classList.toggle('today', isToday);
        if (isToday) row.setAttribute('aria-current', 'date');
        else row.removeAttribute('aria-current');
      });
    });
  }

  updateBranchHoursState();
  setInterval(updateBranchHoursState, 60000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateBranchHoursState();
  });

  const quickCall = $('.mobile-bar a[href^="tel:"]');
  const quickWhatsApp = $('.mobile-bar a[href*="wa.me"]');
  const quickBooking = $('.mobile-bar a[href="#booking"]');
  const branchSelect = $('select[name="branch"]');

  if (quickCall && !quickCall.querySelector('.mobile-action-icon')) quickCall.insertAdjacentHTML('afterbegin', iconSpan(uiIcons.phone, 'mobile-action-icon'));
  if (quickWhatsApp && !quickWhatsApp.querySelector('.mobile-action-icon')) quickWhatsApp.insertAdjacentHTML('afterbegin', iconSpan(uiIcons.message, 'mobile-action-icon'));
  if (quickBooking && !quickBooking.querySelector('.mobile-action-icon')) quickBooking.insertAdjacentHTML('afterbegin', iconSpan(uiIcons.calendar, 'mobile-action-icon'));

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

  branchSelect?.addEventListener('change', () => syncQuickContact(branchSelect.value));
  syncQuickContact(branchSelect?.value || 'hofuf');

  $$('[data-book-branch]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.bookBranch;
    if (!branchSelect || !bookingSection || !branches[key]) return;
    branchSelect.value = key;
    syncQuickContact(key);
    bookingSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => branchSelect.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }));

  const lightbox = $('#lightbox');
  const lightboxImage = lightbox ? $('img', lightbox) : null;
  const lightboxClose = lightbox ? $('button', lightbox) : null;
  const workItems = $$('.work-item');
  let lightboxIndex = 0;
  let lastFocus = null;
  let previousBodyOverflow = '';

  function showLightboxItem(index) {
    if (!lightbox || !lightboxImage || !workItems.length) return;
    lightboxIndex = (index + workItems.length) % workItems.length;
    const image = $('img', workItems[lightboxIndex]);
    if (!image) return;
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.setAttribute('aria-label', `عرض الصورة ${lightboxIndex + 1} من ${workItems.length}: ${image.alt}`);
  }

  function closeLightbox() {
    if (!lightbox?.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousBodyOverflow;
    lastFocus?.focus();
  }

  workItems.forEach((item, index) => item.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lastFocus = item;
    previousBodyOverflow = document.body.style.overflow;
    showLightboxItem(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }));

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });

  addEventListener('keydown', event => {
    const lightboxOpen = lightbox?.classList.contains('open');
    if (event.key === 'Escape') {
      if (lightboxOpen) closeLightbox();
      else closeMenu(true);
      return;
    }
    if (lightboxOpen && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      showLightboxItem(lightboxIndex + (event.key === 'ArrowRight' ? -1 : 1));
      return;
    }
    if (event.key === 'Tab' && lightboxOpen) {
      event.preventDefault();
      lightboxClose?.focus();
    }
  });

  $$('.faq details').forEach(detail => detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    $$('.faq details').forEach(other => {
      if (other !== detail) other.open = false;
    });
  }));

  const normalizeDigits = value => String(value)
    .replace(/[٠-٩]/g, digit => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(digit)])
    .replace(/[۰-۹]/g, digit => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)]);

  const normalizeSaudiMobile = value => {
    let normalized = normalizeDigits(value).replace(/[^\d+]/g, '');
    if (normalized.startsWith('+966')) normalized = `0${normalized.slice(4)}`;
    else if (normalized.startsWith('966')) normalized = `0${normalized.slice(3)}`;
    return normalized.slice(0, 10);
  };

  const phoneInput = $('input[name="phone"]');
  if (phoneInput) {
    phoneInput.pattern = '05[0-9]{8}';
    phoneInput.maxLength = 10;
    phoneInput.setAttribute('aria-label', 'رقم الجوال السعودي بصيغة 05xxxxxxxx');
    phoneInput.addEventListener('input', () => {
      phoneInput.value = normalizeSaudiMobile(phoneInput.value);
      phoneInput.setCustomValidity('');
    });
    phoneInput.addEventListener('invalid', () => {
      phoneInput.setCustomValidity('أدخل رقم جوال سعودي صحيحًا يبدأ بـ 05 ويتكون من 10 أرقام.');
    });
  }

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
      `رقم الجوال: ${normalizeSaudiMobile(value('phone'))}`,
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
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    const part = type => parts.find(item => item.type === type)?.value || '';
    dateInput.min = `${part('year')}-${part('month')}-${part('day')}`;
  }
})();